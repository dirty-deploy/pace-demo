import type { Attempt, PuzzleSet } from './types';
import { recommendedOrder, startCostMinutes } from './ranking';
import { redoDate } from './spacing';

export type RedoReason = 'cap' | 'wrong' | 'slow' | 'skipped';

export type RedoItem = {
  setId: string;
  label: string;
  reason: RedoReason;
  minutes: number;
  dueISO: string;
  note: string;
};

export const REDO_REASON_TEXT: Record<RedoReason, string> = {
  cap: 'You hit the cap here',
  wrong: 'A wrong answer',
  slow: 'Slower than expected',
  skipped: 'Not reached this round',
};

export const attemptMinutes = (a: Attempt) => Math.max(0, (a.endedAt - a.startedAt) / 60000);

export const wrongCount = (a: Attempt) => a.questions.filter((q) => q.correct === false).length;

type Cand = { setId: string; reason: RedoReason; score: number };

/**
 * Exactly three redo candidates, ranked by time lost:
 * 1. sets where the cap was hit first (most minutes over the cap first),
 * 2. then sets with wrong answers (most wrong first),
 * 3. then the slowest correct sets (spent ÷ expected),
 * 4. if fewer than three sets were attempted, sets from the round that were not reached, in recommended order.
 */
export function pickRedo(attempts: Attempt[], roundSets: PuzzleSet[], getSet: (id: string) => PuzzleSet, count = 3): { setId: string; reason: RedoReason }[] {
  // Latest attempt per set.
  const latest = new Map<string, Attempt>();
  for (const a of attempts) latest.set(a.setId, a);
  const cands: Cand[] = [];
  for (const a of latest.values()) {
    const set = getSet(a.setId);
    const spent = attemptMinutes(a);
    if (a.hitCap) cands.push({ setId: a.setId, reason: 'cap', score: 3000 + (spent - a.capMinutes) * 10 });
    else if (wrongCount(a) > 0) cands.push({ setId: a.setId, reason: 'wrong', score: 2000 + wrongCount(a) * 100 + spent });
    else cands.push({ setId: a.setId, reason: 'slow', score: 1000 + (spent / set.expectedMinutes) * 100 });
  }
  cands.sort((x, y) => y.score - x.score);
  const out = cands.slice(0, count).map(({ setId, reason }) => ({ setId, reason }));
  if (out.length < count) {
    for (const s of recommendedOrder(roundSets)) {
      if (out.length >= count) break;
      if (!latest.has(s.id)) out.push({ setId: s.id, reason: 'skipped' });
    }
  }
  return out;
}

export function toRedoItems(
  picks: { setId: string; reason: RedoReason }[],
  getSet: (id: string) => PuzzleSet,
  labelOf: (id: string) => string,
  now: Date,
  toISO: (d: Date) => string,
): { item: RedoItem; gap: number; date: Date }[] {
  const { date, gap } = redoDate(now);
  return picks.map((p) => ({
    gap,
    date,
    item: {
      setId: p.setId,
      label: labelOf(p.setId),
      reason: p.reason,
      minutes: getSet(p.setId).expectedMinutes,
      dueISO: toISO(date),
      note: REDO_REASON_TEXT[p.reason],
    },
  }));
}

export function startComparison(attempts: Attempt[], roundSets: PuzzleSet[], getSet: (id: string) => PuzzleSet) {
  if (!attempts.length || !roundSets.length) return null;
  const rec = recommendedOrder(roundSets)[0];
  const first = getSet(attempts[0].setId);
  return { yourFirst: first, recommended: rec, costMinutes: startCostMinutes(first, rec), same: first.id === rec.id };
}
