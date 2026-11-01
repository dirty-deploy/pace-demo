import type { Subject } from './quickadd';
import { toISO } from './dates';

export const DAY_START = 6 * 60;
export const DAY_END = 24 * 60;
export const SLOT = 30;

export type BlockLike = { dateISO: string; startMin: number; minutes: number };

export const overlaps = (a: { startMin: number; minutes: number }, b: { startMin: number; minutes: number }) =>
  a.startMin < b.startMin + b.minutes && b.startMin < a.startMin + a.minutes;

/** First free half-hour slot on a day, from `from` onwards, that fits `minutes`. */
export function nextFreeSlot(blocks: BlockLike[], dateISO: string, minutes: number, from = DAY_START): number | null {
  const day = blocks.filter((b) => b.dateISO === dateISO);
  const first = Math.max(DAY_START, Math.ceil(from / SLOT) * SLOT);
  for (let t = first; t + minutes <= DAY_END; t += SLOT) {
    if (!day.some((b) => overlaps({ startMin: t, minutes }, b))) return t;
  }
  return null;
}

export type FillTemplate = { title: string; subject: Subject; minutes: number; activity: string };

/** Fixed rotation so a week covers all three sections, a lesson and vocabulary. */
const ROTATION: FillTemplate[][] = [
  [
    { title: 'Set-pick drill', subject: 'DILR', minutes: 4, activity: '/practice/drill' },
    { title: 'Sectional QA', subject: 'QA', minutes: 40, activity: '/practice/tests?tab=sectional' },
    { title: 'Vocab', subject: 'Revision', minutes: 10, activity: '/learn/vocab' },
  ],
  [
    { title: 'Daily set', subject: 'VARC', minutes: 20, activity: '/practice/daily' },
    { title: 'Lesson', subject: 'Revision', minutes: 15, activity: '/learn/lessons' },
    { title: 'Vocab', subject: 'Revision', minutes: 10, activity: '/learn/vocab' },
  ],
  [
    { title: 'Set-pick drill', subject: 'DILR', minutes: 4, activity: '/practice/drill' },
    { title: 'Sectional DILR', subject: 'DILR', minutes: 40, activity: '/practice/tests?tab=sectional' },
    { title: 'Review last attempt', subject: 'Revision', minutes: 10, activity: '/progress/review' },
  ],
  [
    { title: 'Sectional VARC', subject: 'VARC', minutes: 40, activity: '/practice/tests?tab=sectional' },
    { title: 'Daily set', subject: 'QA', minutes: 20, activity: '/practice/daily' },
    { title: 'Vocab', subject: 'Revision', minutes: 10, activity: '/learn/vocab' },
  ],
];

export type FillBlock = FillTemplate & BlockLike;

/**
 * Lays out the rest of the week; `week` is Monday-first dates. Each day's load is the student's
 * minutes for that day multiplied by the completion rate (the v1 plan formula), less what is
 * already planned. Items that do not fit are skipped.
 */
export function fillWeek(week: Date[], today: Date, weekdayMinutes: number, weekendMinutes: number, rate: number, existing: BlockLike[]): FillBlock[] {
  const out: FillBlock[] = [];
  const todayISO = toISO(today);
  week.forEach((day, i) => {
    const iso = toISO(day);
    if (iso < todayISO) return;
    const weekend = i >= 5;
    let left = Math.round((weekend ? weekendMinutes : weekdayMinutes) * rate);
    left -= existing.filter((b) => b.dateISO === iso).reduce((a, b) => a + b.minutes, 0);
    let from = weekend ? 10 * 60 : 19 * 60;
    if (iso === todayISO) from = Math.max(from, today.getHours() * 60 + today.getMinutes());
    for (const t of ROTATION[i % ROTATION.length]) {
      if (t.minutes > left) continue;
      const start = nextFreeSlot([...existing, ...out], iso, t.minutes, from);
      if (start === null) continue;
      out.push({ ...t, dateISO: iso, startMin: start });
      left -= t.minutes;
      from = start + t.minutes;
    }
  });
  return out;
}
