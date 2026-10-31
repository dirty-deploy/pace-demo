import { addDays, daysLeft } from './dates';

/** gap = max(1, round(0.2 × daysLeft)). 29 days left gives 6; 7 or fewer gives 1. */
export function redoGap(days: number): number {
  return Math.max(1, Math.round(0.2 * Math.max(0, days)));
}

export function redoDate(now: Date, examISO?: string): { date: Date; gap: number } {
  const gap = redoGap(daysLeft(now, examISO));
  return { date: addDays(now, gap), gap };
}
