import { addDays, parseISO, startOfDay, toISO } from './dates';

export type Subject = 'VARC' | 'DILR' | 'QA' | 'Revision';

export type QuickAdd = {
  title: string;
  subject: Subject;
  dateISO: string;
  startMin: number;
  minutes: number;
  /** True when no time was typed and the next free half hour was used. */
  guessedTime: boolean;
};

const WEEKDAYS: Record<string, number> = {
  sun: 0, sunday: 0,
  mon: 1, monday: 1,
  tue: 2, tues: 2, tuesday: 2,
  wed: 3, wednesday: 3,
  thu: 4, thur: 4, thurs: 4, thursday: 4,
  fri: 5, friday: 5,
  sat: 6, saturday: 6,
};

export function subjectOf(text: string): Subject {
  const t = text.toLowerCase();
  // A daily set mixes sections, so "set" must not read as DILR here.
  if (/\bdaily\b/.test(t)) return 'Revision';
  if (/\b(dilr|di|lr|drill|sets?|seating|caselets?)\b/.test(t)) return 'DILR';
  if (/\b(rc|varc|verbal|para|parajumbles?|reading|passages?)\b/.test(t)) return 'VARC';
  if (/\b(qa|quant|maths?|percent\w*|algebra|geometry|arithmetic|numbers?)\b/.test(t)) return 'QA';
  return 'Revision';
}

/**
 * Hours with no am/pm: 1 to 5 mean afternoon, because the planner runs from 6 am to midnight.
 * Anything from 6 up is read as typed, so 8:30 is morning and 19:00 is evening.
 */
function resolveHour(hour: number, mer: string | undefined): number | null {
  if (hour > 23) return null;
  if (mer) {
    if (hour < 1 || hour > 12) return null;
    return (hour % 12) + (mer.toLowerCase().startsWith('p') ? 12 : 0);
  }
  return hour >= 1 && hour <= 5 ? hour + 12 : hour;
}

function defaultStart(now: Date, dateISO: string): number {
  if (parseISO(dateISO).getTime() !== startOfDay(now).getTime()) return 19 * 60;
  const m = now.getHours() * 60 + now.getMinutes();
  return Math.min(23 * 60, Math.max(6 * 60, Math.ceil(m / 30) * 30));
}

/** Parses text such as "DILR sets 7pm 45m" or "RC tomorrow 8:30 30m". Returns null with no title. */
export function parseQuickAdd(input: string, now: Date, nextFreeMin?: (dateISO: string, minutes: number) => number | null): QuickAdd | null {
  let text = ` ${input.trim().replace(/\s+/g, ' ')} `;
  if (!text.trim()) return null;

  const take = (re: RegExp, fn: (m: RegExpMatchArray) => void): boolean => {
    const m = text.match(re);
    if (!m) return false;
    fn(m);
    text = text.replace(m[0], ' ');
    return true;
  };

  // Duration: 1h30, 1h 30m, 1.5h, 2 hours, 45m, 45 min.
  let minutes: number | null = null;
  const H = '(?:h|hr|hrs|hour|hours)';
  const M = '(?:m|min|mins|minutes)';
  take(new RegExp(`\\s(\\d+)\\s?${H}\\s?(\\d+)\\s?${M}?(?=\\s)`, 'i'), (m) => (minutes = Number(m[1]) * 60 + Number(m[2]))) ||
    take(new RegExp(`\\s(\\d+(?:\\.\\d+)?)\\s?${H}(?=\\s)`, 'i'), (m) => (minutes = Math.round(Number(m[1]) * 60))) ||
    take(new RegExp(`\\s(\\d+)\\s?${M}(?=\\s)`, 'i'), (m) => (minutes = Number(m[1])));

  // Time: 7pm, 7:30 pm, 8:30, 19:00, at 7.
  let startMin: number | null = null;
  const setTime = (h: string, mins: string | undefined, mer: string | undefined) => {
    const hour = resolveHour(Number(h), mer);
    if (hour !== null) startMin = hour * 60 + Number(mins ?? 0);
  };
  take(/\s(?:at\s)?(\d{1,2})(?::(\d{2}))?\s?(am|pm)(?=\s)/i, (m) => setTime(m[1], m[2], m[3])) ||
    take(/\s(?:at\s)?(\d{1,2}):(\d{2})(?=\s)/i, (m) => setTime(m[1], m[2], undefined)) ||
    take(/\sat\s(\d{1,2})(?=\s)/i, (m) => setTime(m[1], undefined, undefined));

  // Day: today, tomorrow, or a weekday name meaning its next occurrence.
  const today = startOfDay(now);
  let date = today;
  const dayNames = Object.keys(WEEKDAYS).join('|');
  take(/\s(?:today|tonight)(?=\s)/i, () => (date = today)) ||
    take(/\s(?:tomorrow|tmrw|tmr)(?=\s)/i, () => (date = addDays(today, 1))) ||
    take(new RegExp(`\\s(?:on\\s)?(${dayNames})(?=\\s)`, 'i'), (m) => {
      date = addDays(today, (WEEKDAYS[m[1].toLowerCase()] - today.getDay() + 7) % 7);
    });

  const title = text.replace(/\s+/g, ' ').trim();
  if (!title) return null;
  const dateISO = toISO(date);
  const length = Math.max(10, Math.min(240, minutes ?? 45));
  const guessedTime = startMin === null;
  const start = startMin ?? nextFreeMin?.(dateISO, length) ?? defaultStart(now, dateISO);
  return { title, subject: subjectOf(title), dateISO, startMin: start, minutes: length, guessedTime };
}

export function formatClock(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  const mer = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${h12}:${String(m).padStart(2, '0')} ${mer}` : `${h12} ${mer}`;
}
