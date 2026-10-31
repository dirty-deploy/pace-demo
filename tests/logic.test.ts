import { describe, expect, it } from 'vitest';
import data from '../src/data/sample_sets.json';
import student from '../src/data/demo_student.json';
import type { PuzzleSet } from '../src/logic/types';
import { classify, generate, mapDifficulty, parseClue, searchNodes, solve } from '../src/logic/seating';
import { kendall, recommendedOrder, startCostMinutes } from '../src/logic/ranking';
import { capSeconds, median, paceFactor } from '../src/logic/cap';
import { redoDate, redoGap } from '../src/logic/spacing';
import { buildPlan, completionRate, plannedLoad } from '../src/logic/session';
import { clueMix, reasonFor } from '../src/logic/reasons';
import { daysLeft, weekOf } from '../src/logic/dates';

const sets = data.sets as unknown as PuzzleSet[];
const nodes = sets.map((s) => s.solverNodes);
const anchors = { minNodes: Math.min(...nodes), maxNodes: Math.max(...nodes) };

describe('sample sets', () => {
  it.each(sets.map((s) => [s.id, s] as const))('%s has exactly one solution matching the data', (_id, s) => {
    const clues = s.clues.map((c) => parseClue(c, s.people));
    const sols = solve(clues);
    expect(sols).toHaveLength(1);
    expect(sols[0].map((p) => s.people[p])).toEqual(s.solutionClockwiseFrom);
  });

  it.each(sets.map((s) => [s.id, s] as const))('%s clue mix and node counts match the data', (_id, s) => {
    const clues = s.clues.map((c) => parseClue(c, s.people));
    expect(classify(clues)).toEqual(s.clueTypes);
    expect(searchNodes(clues)).toBe(s.solverNodes);
  });

  it.each(sets.map((s) => [s.id, s] as const))('%s answers are correct and appear once', (_id, s) => {
    const sol = s.solutionClockwiseFrom;
    const at = (n: string) => sol.indexOf(n);
    const name = (i: number) => sol[((i % 6) + 6) % 6];
    for (const q of s.questions) {
      expect(q.options.filter((o) => o === q.answer)).toHaveLength(1);
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.options).toHaveLength(4);
      const m = q.prompt.match(/^Who sits (directly opposite|immediately clockwise of|between) (\w+)(?: and (\w+))?/)!;
      if (m[1] === 'directly opposite') expect(q.answer).toBe(name(at(m[2]) + 3));
      else if (m[1] === 'immediately clockwise of') expect(q.answer).toBe(name(at(m[2]) + 1));
      else {
        expect(name(at(m[2]) + 2)).toBe(m[3]);
        expect(q.answer).toBe(name(at(m[2]) + 1));
      }
    }
  });
});

describe('generator', () => {
  it('makes 200 valid sets with exactly one solution', () => {
    const styles = ['easier', 'medium', 'harder'] as const;
    for (let i = 0; i < 200; i++) {
      const set = generate(styles[i % 3], `T${i}`, anchors);
      const clues = set.clues.map((c) => parseClue(c, set.people));
      expect(set.clues.length).toBeGreaterThanOrEqual(3);
      expect(set.clues.length).toBeLessThanOrEqual(7);
      const sols = solve(clues);
      expect(sols).toHaveLength(1);
      expect(sols[0].map((p) => set.people[p])).toEqual(set.solutionClockwiseFrom);
      // minimal: dropping any clue breaks uniqueness
      for (let k = 0; k < clues.length; k++) {
        expect(solve(clues.filter((_, j) => j !== k)).length).toBeGreaterThan(1);
      }
      expect(set.questions).toHaveLength(3);
      const sol = set.solutionClockwiseFrom;
      const at = (n: string) => sol.indexOf(n);
      const name = (n: number) => sol[((n % 6) + 6) % 6];
      for (const q of set.questions) {
        expect(q.options).toHaveLength(4);
        expect(q.options.filter((o) => o === q.answer)).toHaveLength(1);
        const m = q.prompt.match(/^Who sits (directly opposite|immediately clockwise of|between) (\w+)(?: and (\w+))?/)!;
        expect(q.options).not.toContain(m[2]);
        if (m[3]) expect(q.options).not.toContain(m[3]);
        if (m[1] === 'directly opposite') expect(q.answer).toBe(name(at(m[2]) + 3));
        else if (m[1] === 'immediately clockwise of') expect(q.answer).toBe(name(at(m[2]) + 1));
        else expect(q.answer).toBe(name(at(m[2]) + 1));
      }
      expect(set.difficultyScore).toBeGreaterThanOrEqual(1);
      expect(set.difficultyScore).toBeLessThanOrEqual(5);
      expect(set.expectedMinutes).toBeGreaterThanOrEqual(5);
      expect(set.expectedMinutes).toBeLessThanOrEqual(12);
    }
  });

  it('maps node counts onto 1..5 and 5..12 minutes using the anchors', () => {
    expect(mapDifficulty(anchors.minNodes, anchors)).toEqual({ difficultyScore: 1, expectedMinutes: 5 });
    expect(mapDifficulty(anchors.maxNodes, anchors)).toEqual({ difficultyScore: 5, expectedMinutes: 12 });
    expect(mapDifficulty(1, anchors).difficultyScore).toBe(1);
  });
});

describe("Kendall's tau", () => {
  const rec = ['a', 'b', 'c', 'd', 'e'];
  it('identical orders give 1', () => expect(kendall(rec, rec)).toMatchObject({ tau: 1, concordant: 10, discordant: 0 }));
  it('reversed orders give -1', () => expect(kendall([...rec].reverse(), rec)).toMatchObject({ tau: -1, concordant: 0, discordant: 10 }));
  it('one adjacent swap agrees on 9 of 10 pairs', () => {
    const r = kendall(['b', 'a', 'c', 'd', 'e'], rec);
    expect(r.concordant).toBe(9);
    expect(r.tau).toBeCloseTo(0.8);
  });
  it('a known example: 7 of 10 pairs gives tau 0.4', () => {
    // c a b e d: discordant pairs are (c,a) (c,b) (e,d)
    const r = kendall(['c', 'a', 'b', 'e', 'd'], rec);
    expect(r.concordant).toBe(7);
    expect(r.discordant).toBe(3);
    expect(r.tau).toBeCloseTo(0.4);
  });
  it('recommended order sorts by score, then fewer clues, then more fixed', () => {
    const mk = (id: string, score: number, clues: number, fixed: number) =>
      ({ id, difficultyScore: score, clues: new Array(clues).fill('x'), clueTypes: { fixed, adjacency: 0, negative: 0 } }) as unknown as PuzzleSet;
    const out = recommendedOrder([mk('c', 2, 4, 1), mk('a', 1, 4, 0), mk('b', 2, 3, 0), mk('d', 2, 4, 3)]).map((s) => s.id);
    expect(out).toEqual(['a', 'b', 'd', 'c']);
  });
  it('start cost is never negative', () => {
    const a = { expectedMinutes: 12 } as PuzzleSet;
    const b = { expectedMinutes: 5 } as PuzzleSet;
    expect(startCostMinutes(a, b)).toBe(7);
    expect(startCostMinutes(b, a)).toBe(0);
  });
});

describe('cap', () => {
  it('median handles odd, even and empty', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(median([])).toBeNaN();
  });
  it('defaults to 1.0 with no history', () => expect(paceFactor([])).toBe(1));
  it('uses the median ratio on the demo history (about 1.14)', () => {
    expect(paceFactor(student.paceHistory)).toBeCloseTo(1.1446, 3);
  });
  it('clamps to 0.8..1.5', () => {
    expect(paceFactor([{ setId: 'x', expectedMinutes: 5, actualMinutes: 1 }])).toBe(0.8);
    expect(paceFactor([{ setId: 'x', expectedMinutes: 5, actualMinutes: 20 }])).toBe(1.5);
  });
  it('rounds the cap to the nearest 10 seconds', () => {
    expect(capSeconds(8, 1)).toBe(480);
    expect(capSeconds(6.7, 1.1446)).toBe(460); // 460.1 s
    expect(capSeconds(5.4, 1)).toBe(320); // 324 s
  });
});

describe('spacing', () => {
  it('29 days left gives a 6 day gap', () => expect(redoGap(29)).toBe(6));
  it('7 or fewer days left gives 1 day', () => {
    expect(redoGap(7)).toBe(1);
    expect(redoGap(2)).toBe(1);
  });
  it('0 days left gives 1 day, never 0', () => expect(redoGap(0)).toBe(1));
  it('redoDate adds the gap to today', () => {
    const { date, gap } = redoDate(new Date(2026, 9, 31));
    expect(gap).toBe(6);
    expect(date.getDate()).toBe(6);
    expect(date.getMonth()).toBe(10);
  });
  it('days left is 29 on 31 Oct 2026 and never negative', () => {
    expect(daysLeft(new Date(2026, 9, 31, 15, 30))).toBe(29);
    expect(daysLeft(new Date(2027, 0, 1))).toBe(0);
  });
  it('week starts on Monday', () => {
    const w = weekOf(new Date(2026, 9, 31));
    expect(w[0].getDate()).toBe(26);
    expect(w[6].getDate()).toBe(1);
  });
});

describe('session builder', () => {
  it('demo completion rate is about 79% and 60 minutes plans 48', () => {
    expect(completionRate(student.lastFiveSessions)).toBeCloseTo(0.7944, 3);
    expect(plannedLoad(60, student.lastFiveSessions)).toBe(48);
  });
  it('caps each ratio at 1.0', () => {
    expect(completionRate([{ date: 'x', plannedMinutes: 30, completedMinutes: 60 }])).toBe(1);
  });
  it('no history means the full window', () => expect(plannedLoad(45, [])).toBe(45));
  const items = [
    { id: 'd', kind: 'drill' as const, label: 'Drill', minutes: 4 },
    { id: 's', kind: 'set' as const, label: 'Set', minutes: 8 },
    { id: 'r', kind: 'replay' as const, label: 'Replay', minutes: 10 },
    { id: 'x1', kind: 'redo' as const, label: 'Redo 1', minutes: 7 },
    { id: 'x2', kind: 'redo' as const, label: 'Redo 2', minutes: 6 },
  ];
  it('fits everything when the load allows', () => {
    const p = buildPlan(48, items);
    expect(p.items).toHaveLength(5);
    expect(p.dropped).toHaveLength(0);
    expect(p.usedMinutes).toBe(35);
  });
  it('never exceeds the load and lists what was dropped', () => {
    const p = buildPlan(24, items);
    expect(p.usedMinutes).toBeLessThanOrEqual(24);
    expect(p.items.map((i) => i.id)).toEqual(['d', 's', 'r']);
    expect(p.dropped.map((i) => i.id)).toEqual(['x1', 'x2']);
  });
  it('a window smaller than the drill drops the drill', () => {
    const p = buildPlan(3, items);
    expect(p.items.find((i) => i.id === 'd')).toBeUndefined();
    expect(p.dropped[0].id).toBe('d');
    expect(p.usedMinutes).toBeLessThanOrEqual(3);
  });
  it('a zero load plans nothing', () => expect(buildPlan(0, items).items).toHaveLength(0));
});

describe('reasons', () => {
  const byId = (id: string) => sets.find((s) => s.id === id)!;
  it('mostly fixed clues are quickest to lock down', () => expect(reasonFor(byId('S03'))).toMatch(/mostly fixed positions: quickest to lock down/));
  it('negative clues leave arrangements open', () => expect(reasonFor(byId('S12'))).toMatch(/2 negative clues/));
  it('adjacency heavy', () => expect(reasonFor(byId('S01'))).toMatch(/Several 'sits next to'/));
  it('mixed branch and the estimate label', () => {
    const synthetic = { ...byId('S13'), clues: ['a', 'b', 'c', 'd', 'e'], clueTypes: { fixed: 2, adjacency: 1, negative: 0 } };
    expect(reasonFor(synthetic)).toBe('Mixed clues: middle of the pack. (estimated: Medium)');
    expect(reasonFor(byId('S13')).endsWith('(estimated: Medium)')).toBe(true);
  });
  it('clue mix preview', () => expect(clueMix(byId('S04'))).toBe('4 clues: 2 fixed positions, 1 adjacency, 1 negative'));
});
