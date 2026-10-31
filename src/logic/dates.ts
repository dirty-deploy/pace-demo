export const EXAM_DATE = '2026-11-29';

const MS_DAY = 86_400_000;

/** Parse an ISO date (YYYY-MM-DD) as a local calendar date at midnight. */
export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toISO(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, n: number): Date {
  const x = startOfDay(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Whole calendar days from `now` to the exam date, never below 0. */
export function daysLeft(now: Date, examISO: string = EXAM_DATE): number {
  const diff = Math.round((parseISO(examISO).getTime() - startOfDay(now).getTime()) / MS_DAY);
  return Math.max(0, diff);
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / MS_DAY);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function shortDate(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function weekday(d: Date): string {
  return WEEKDAYS[d.getDay()];
}

/** Monday-first week containing `d`. */
export function weekOf(d: Date): Date[] {
  const start = startOfDay(d);
  const offset = (start.getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) => addDays(start, i - offset));
}
