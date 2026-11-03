import { addDays, parseISO, startOfDay, toISO } from './dates';

export type DayActivity = {
  questions: number;
  lessonSeconds: number;
  /** Total minutes studied across tests and lessons. */
  minutes: number;
  /** A streak shield covered this day. */
  shielded?: boolean;
};

export type DayLog = Record<string, DayActivity>;

export type StreakRule = { questions: number; lessonMinutes: number };
export const DEFAULT_RULE: StreakRule = { questions: 1, lessonMinutes: 5 };

export function ruleMet(day: DayActivity | undefined, rule: StreakRule): boolean {
  if (!day) return false;
  return day.questions >= rule.questions || day.lessonSeconds >= rule.lessonMinutes * 60;
}

const counts = (day: DayActivity | undefined, rule: StreakRule) => ruleMet(day, rule) || !!day?.shielded;

/** Days in a row up to today. Today not being met yet does not end the streak. */
export function currentStreak(log: DayLog, today: Date, rule: StreakRule): number {
  let d = startOfDay(today);
  if (!counts(log[toISO(d)], rule)) d = addDays(d, -1);
  let n = 0;
  while (counts(log[toISO(d)], rule)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

export function bestStreak(log: DayLog, rule: StreakRule): number {
  const days = Object.keys(log)
    .filter((k) => counts(log[k], rule))
    .sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const iso of days) {
    run = prev && toISO(addDays(prev, 1)) === iso ? run + 1 : 1;
    best = Math.max(best, run);
    prev = parseISO(iso);
  }
  return best;
}

export type DayState = 'done' | 'missed' | 'today' | 'today-done' | 'future';

export function weekStates(week: Date[], log: DayLog, today: Date, rule: StreakRule): DayState[] {
  const t = toISO(startOfDay(today));
  return week.map((d) => {
    const iso = toISO(d);
    const met = counts(log[iso], rule);
    if (iso === t) return met ? 'today-done' : 'today';
    if (iso > t) return 'future';
    return met ? 'done' : 'missed';
  });
}

/** Spends one shield on yesterday if it was missed and the day before it counted. */
export function applyShields(log: DayLog, shields: number, today: Date, rule: StreakRule): { log: DayLog; shields: number; covered: string[] } {
  const yesterday = addDays(startOfDay(today), -1);
  const iso = toISO(yesterday);
  if (shields <= 0 || counts(log[iso], rule) || !counts(log[toISO(addDays(yesterday, -1))], rule)) {
    return { log, shields, covered: [] };
  }
  const empty: DayActivity = { questions: 0, lessonSeconds: 0, minutes: 0 };
  return { log: { ...log, [iso]: { ...(log[iso] ?? empty), shielded: true } }, shields: shields - 1, covered: [iso] };
}

/** Whole minutes studied on a day, never less than its lesson time, and at least 1 once anything timed was logged (as the day's own line shows). */
export const dayMinutes = (d: DayActivity | undefined): number => {
  const raw = Math.max(d?.minutes ?? 0, (d?.lessonSeconds ?? 0) / 60);
  return raw > 0 ? Math.max(1, Math.round(raw)) : 0;
};

export function minutesInMonth(log: DayLog, year: number, month: number): number {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  return Object.entries(log).reduce((sum, [k, v]) => (k.startsWith(prefix) ? sum + dayMinutes(v) : sum), 0);
}

export function formatHours(minutes: number): string {
  const m = Math.round(minutes);
  const h = Math.floor(m / 60);
  return h ? `${h} h ${m % 60} min` : `${m} min`;
}

/** Five shades: 0 is empty, 1 to 4 by minutes studied. */
export function heatLevel(minutes: number): number {
  if (minutes <= 0) return 0;
  if (minutes < 20) return 1;
  if (minutes < 45) return 2;
  if (minutes < 90) return 3;
  return 4;
}
