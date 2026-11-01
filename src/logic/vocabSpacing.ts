import { addDays, parseISO, toISO } from './dates';

/** A word comes back after 1, 3, 7, then 14 days. A miss starts it again at 1 day. */
export const GAPS = [1, 3, 7, 14];
export const MASTERED_LEVEL = 4;

export type WordState = { added: boolean; level: number; dueISO: string | null; lastISO: string | null; seen: number };

export const newWordState = (added = false): WordState => ({ added, level: 0, dueISO: null, lastISO: null, seen: 0 });

export function reviewWord(state: WordState, correct: boolean, todayISO: string): WordState {
  const level = correct ? Math.min(MASTERED_LEVEL, state.level + 1) : 0;
  const gap = GAPS[correct ? Math.min(GAPS.length - 1, state.level) : 0];
  return { ...state, level, lastISO: todayISO, seen: state.seen + 1, dueISO: toISO(addDays(parseISO(todayISO), gap)) };
}

export function isDue(state: WordState | undefined, todayISO: string): boolean {
  return !!state?.dueISO && state.dueISO <= todayISO;
}

/** Today's words: everything due, then words the student added, then new words, 5 to 10 in all. */
export function todaysWords(allWords: string[], states: Record<string, WordState>, todayISO: string, target = 8): string[] {
  const due = allWords.filter((w) => isDue(states[w], todayISO));
  const fresh = allWords.filter((w) => !states[w]?.lastISO);
  const added = fresh.filter((w) => states[w]?.added);
  const rest = fresh.filter((w) => !states[w]?.added);
  return [...new Set([...due, ...added, ...rest])].slice(0, Math.max(5, Math.min(10, target)));
}
