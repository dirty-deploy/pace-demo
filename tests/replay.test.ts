import { describe, expect, it } from 'vitest';
import data from '../src/data/sample_sets.json';
import type { Attempt, PuzzleSet } from '../src/logic/types';
import { pickRedo, startComparison } from '../src/logic/replay';

const sets = data.sets as unknown as PuzzleSet[];
const get = (id: string) => sets.find((s) => s.id === id)!;
const round = ['S09', 'S04', 'S06', 'S13', 'S11'].map(get);

const att = (setId: string, minutes: number, o: Partial<Attempt> = {}): Attempt => ({
  setId,
  startedAt: 0,
  endedAt: minutes * 60000,
  capMinutes: 8,
  hitCap: false,
  extended: false,
  left: false,
  stalledOnClue: null,
  questions: [
    { chosen: 'x', correct: true, seconds: 10 },
    { chosen: 'x', correct: true, seconds: 10 },
    { chosen: 'x', correct: true, seconds: 10 },
  ],
  ...o,
});

describe('replay', () => {
  it('always returns exactly three redo items', () => {
    expect(pickRedo([att('S09', 9, { hitCap: true })], round, get)).toHaveLength(3);
    expect(pickRedo([], round, get)).toHaveLength(3);
  });
  it('ranks cap hits, then wrong answers, then slow correct, then not reached', () => {
    const wrong = att('S04', 5, { questions: [{ chosen: 'x', correct: false, seconds: 5 }, { chosen: null, correct: null, seconds: 0 }, { chosen: null, correct: null, seconds: 0 }] });
    const picks = pickRedo([att('S11', 8), wrong, att('S09', 9, { hitCap: true })], round, get);
    expect(picks.map((p) => p.reason)).toEqual(['cap', 'wrong', 'slow']);
    expect(picks.map((p) => p.setId)).toEqual(['S09', 'S04', 'S11']);
  });
  it('fills with unattempted sets in recommended order', () => {
    const picks = pickRedo([att('S09', 9, { hitCap: true })], round, get);
    expect(picks[1]).toEqual({ setId: 'S11', reason: 'skipped' });
    expect(picks[2]).toEqual({ setId: 'S13', reason: 'skipped' });
  });
  it('compares the start with the recommended start and reports minutes lost', () => {
    const c = startComparison([att('S09', 9)], round, get)!;
    expect(c.recommended.id).toBe('S11');
    expect(c.same).toBe(false);
    expect(c.costMinutes).toBe(7);
  });
});
