import type { PaceSample } from './types';

export function median(xs: number[]): number {
  if (!xs.length) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** Median of actual/expected, clamped to 0.8..1.5. Default 1.0 when there is no history. */
export function paceFactor(history: PaceSample[]): number {
  const ratios = history.filter((h) => h.expectedMinutes > 0).map((h) => h.actualMinutes / h.expectedMinutes);
  if (!ratios.length) return 1;
  return Math.min(1.5, Math.max(0.8, median(ratios)));
}

/** Cap in seconds: expected minutes × pace factor, rounded to the nearest 10 seconds. */
export function capSeconds(expectedMinutes: number, factor: number): number {
  return Math.round((expectedMinutes * factor * 60) / 10) * 10;
}

export const EXTENSION_SECONDS = 120;

export function mmss(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/** "7:40" style, no leading zero on minutes. */
export function mSS(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
