export type TestMode = 'exam' | 'practice';

/** In exam mode a section ends only when its clock runs out. In practice the student can leave. */
export function canLeaveSection(mode: TestMode, secondsLeft: number): boolean {
  return mode === 'practice' || secondsLeft <= 0;
}

export function canPause(mode: TestMode): boolean {
  return mode === 'practice';
}

/** A section other than the current one can only be opened in practice mode. */
export function canOpenSection(mode: TestMode, current: number, target: number): boolean {
  return mode === 'practice' || target === current;
}

/** Index of the next section, or null when the test is over. */
export function nextSection(current: number, total: number): number | null {
  return current + 1 < total ? current + 1 : null;
}

export type PaletteState = 'not-visited' | 'not-answered' | 'answered' | 'marked' | 'answered-marked';

export function paletteState(q: { visited: boolean; marked: boolean; answered: boolean }): PaletteState {
  if (q.marked) return q.answered ? 'answered-marked' : 'marked';
  if (q.answered) return 'answered';
  return q.visited ? 'not-answered' : 'not-visited';
}

export const PALETTE_LABEL: Record<PaletteState, string> = {
  'not-visited': 'Not visited',
  'not-answered': 'Not answered',
  answered: 'Answered',
  marked: 'Marked for review',
  'answered-marked': 'Answered and marked',
};

/** Rough predicted percentile from a sample table. Always labelled as an estimate where shown. */
const SAMPLE_TABLE: [number, number][] = [
  [0, 20],
  [15, 50],
  [30, 75],
  [45, 88],
  [60, 95],
  [75, 98],
  [90, 99.3],
  [110, 99.8],
  [204, 100],
];

export function roughPercentile(score: number): number {
  const s = Math.max(0, score);
  for (let i = 1; i < SAMPLE_TABLE.length; i++) {
    const [x0, y0] = SAMPLE_TABLE[i - 1];
    const [x1, y1] = SAMPLE_TABLE[i];
    if (s <= x1) return Math.round((y0 + ((s - x0) / (x1 - x0)) * (y1 - y0)) * 10) / 10;
  }
  return 100;
}
