import { describe, expect, it } from 'vitest';
import data from '../src/data/sample_sets.json';
import type { PuzzleSet } from '../src/logic/types';
import type { DilrSet, McqQuestion, Question, StimulusBlock, TitaQuestion } from '../src/content/types';
import { DILR_QUESTIONS, DILR_SETS } from '../src/content/dilr';
import {
  C01,
  GRID_SPECS,
  LINEAR_SPECS,
  NEW_QUESTIONS,
  NEW_SETS,
  T01,
  gridProblem,
  ratingFromNodes,
  ratingFromSteps,
} from '../src/content/dilr/newSets';
import type { GymData, ShopRow } from '../src/content/dilr/newSets';
import {
  gridConstraintNames,
  gridSearchNodes,
  linearClueNames,
  linearSearchNodes,
  solveGrid,
  solveLinear,
} from '../src/content/dilr/verify';

const seating = data.sets as unknown as PuzzleSet[];

const setById = (id: string) => DILR_SETS.find((s) => s.id === id) as DilrSet;
const questionsOf = (id: string) => DILR_QUESTIONS.filter((q) => q.groupId === id);
const qById = (id: string) => DILR_QUESTIONS.find((q) => q.id === id) as Question;
const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));

/** The answer a student sees as correct, as text. */
const answerText = (q: Question) => (q.kind === 'mcq' ? q.options[q.answerIndex] : q.answer);

describe('solvers', () => {
  it('linear solver counts every solution', () => {
    const people = ['A', 'B', 'C'];
    expect(solveLinear(people, []).solutions).toHaveLength(6);
    expect(solveLinear(people, [{ kind: 'at', who: 'A', pos: 1 }]).solutions).toHaveLength(2);
    expect(solveLinear(people, [{ kind: 'gap', a: 'A', b: 'B', between: 1 }]).solutions).toEqual([
      ['A', 'C', 'B'],
      ['B', 'C', 'A'],
    ]);
    expect(solveLinear(people, [{ kind: 'at', who: 'A', pos: 1 }, { kind: 'at', who: 'A', pos: 2 }]).solutions).toHaveLength(0);
  });

  it('grid solver honours capacity and unique cells', () => {
    const dims = [
      { name: 'day', values: ['D1', 'D2'], capacity: 2 },
      { name: 'room', values: ['R1', 'R2'], capacity: 2 },
    ];
    const items = ['a', 'b', 'c', 'd'];
    expect(solveGrid({ items, dimensions: dims, uniqueCells: true, constraints: [] }).solutions).toHaveLength(24);
    const one = solveGrid({
      items: ['a', 'b'],
      dimensions: [{ name: 'day', values: ['D1', 'D2', 'D3'] }],
      constraints: [{ kind: 'offset', a: 'a', b: 'b', dim: 'day', by: 2 }],
    });
    expect(one.solutions).toEqual([{ a: { day: 'D1' }, b: { day: 'D3' } }]);
  });
});

describe.each(LINEAR_SPECS.map((s) => [s.id, s] as const))('linear set %s', (id, spec) => {
  const clues = spec.clues.map((c) => c.clue);
  const result = solveLinear(spec.people, clues);

  it('tries every permutation and finds exactly one solution', () => {
    expect(result.checked).toBe(factorial(spec.people.length));
    expect(result.solutions).toHaveLength(1);
  });

  it('needs every clue', () => {
    clues.forEach((_, i) => {
      expect(solveLinear(spec.people, clues.filter((_, j) => j !== i)).solutions.length).toBeGreaterThan(1);
    });
  });

  it('every clue text names the people in its structured clue', () => {
    for (const { text, clue } of spec.clues) for (const name of linearClueNames(clue)) expect(text).toContain(name);
  });

  it('every stored answer matches the solution', () => {
    expect(spec.questions.length).toBe(questionsOf(id).length);
    spec.questions.forEach((q, i) => {
      expect(q.check(result.solutions[0])).toBe(q.key);
      expect(answerText(qById(`${id}-${i + 1}`))).toBe(q.key);
    });
  });

  it('effort and rating follow the stated rule', () => {
    const set = setById(id);
    const nodes = linearSearchNodes(spec.people, clues);
    expect(set.effort).toEqual({ measure: 'search nodes', value: nodes });
    expect({ difficulty: set.difficulty, expectedMinutes: set.expectedMinutes }).toEqual(ratingFromNodes(nodes));
  });
});

describe.each(GRID_SPECS.map((s) => [s.id, s] as const))('scheduling set %s', (id, spec) => {
  const problem = gridProblem(spec);
  const result = solveGrid(problem);

  it('finds exactly one solution', () => {
    expect(result.checked).toBeGreaterThan(1);
    expect(result.solutions).toHaveLength(1);
  });

  it('needs every clue', () => {
    problem.constraints.forEach((_, i) => {
      const fewer = { ...problem, constraints: problem.constraints.filter((_, j) => j !== i) };
      expect(solveGrid(fewer).solutions.length).toBeGreaterThan(1);
    });
  });

  it('every clue text names what its structured clue names', () => {
    for (const { text, clue } of spec.clues) for (const name of gridConstraintNames(clue)) expect(text).toContain(name);
  });

  it('every stored answer matches the solution', () => {
    expect(spec.questions.length).toBe(questionsOf(id).length);
    spec.questions.forEach((q, i) => {
      expect(q.check(result.solutions[0])).toBe(q.key);
      expect(answerText(qById(`${id}-${i + 1}`))).toBe(q.key);
    });
  });

  it('effort and rating follow the stated rule', () => {
    const set = setById(id);
    const nodes = gridSearchNodes(problem);
    expect(set.effort).toEqual({ measure: 'search nodes', value: nodes });
    expect({ difficulty: set.difficulty, expectedMinutes: set.expectedMinutes }).toEqual(ratingFromNodes(nodes));
  });

  it('the grid sizes are what the wording says', () => {
    expect(result.checked).toBe(id === 'G01' ? 14400 : 720);
  });
});

describe('data sets', () => {
  /** Rebuilds the numbers from what the student sees, so the display cannot drift from the answers. */
  const tableRows = (stimulus: StimulusBlock[]) => {
    const block = stimulus.find((b) => b.type === 'table');
    if (block?.type !== 'table') throw new Error('no table');
    return block.rows;
  };
  const shownShop = (): ShopRow[] =>
    tableRows(setById('T01').stimulus).map(([item, buying, selling, week1, week2]) => ({
      item: String(item),
      buying: Number(buying),
      selling: Number(selling),
      week1: Number(week1),
      week2: Number(week2),
    }));
  const shownGym = (): GymData => {
    const block = setById('C01').stimulus.find((b) => b.type === 'bars');
    if (block?.type !== 'bars') throw new Error('no bars');
    const text = setById('C01').stimulus.find((b) => b.type === 'text');
    if (text?.type !== 'text') throw new Error('no text');
    return {
      startMembers: Number((text.text.match(/had (\d+) members/) as RegExpMatchArray)[1]),
      months: block.categories,
      signups: block.series[0].values,
      cancellations: block.series[1].values,
    };
  };

  it('T01 has 4 to 6 rows and answers recomputed from the table equal the keys', () => {
    const rows = shownShop();
    expect(rows.length).toBeGreaterThanOrEqual(4);
    expect(rows.length).toBeLessThanOrEqual(6);
    T01.questions.forEach((q, i) => {
      expect(q.compute(rows)).toBe(q.key);
      expect(answerText(qById(`T01-${i + 1}`))).toBe(q.key);
    });
  });

  it('C01 has two series and answers recomputed from the chart equal the keys', () => {
    const gym = shownGym();
    expect(gym.months).toHaveLength(6);
    C01.questions.forEach((q, i) => {
      expect(q.compute(gym)).toBe(q.key);
      expect(answerText(qById(`C01-${i + 1}`))).toBe(q.key);
    });
  });

  it('T01 keys agree with a second, independent working', () => {
    const rows = shownShop();
    const weekRevenue = (w: 'week1' | 'week2') => rows.reduce((t, r) => t + r.selling * r[w], 0);
    const weekProfit = (w: 'week1' | 'week2') => rows.reduce((t, r) => t + (r.selling - r.buying) * r[w], 0);
    expect(String(weekRevenue('week1'))).toBe(T01.questions[1].key);
    expect(weekProfit('week2') - weekProfit('week1')).toBe(800);
  });

  it('C01 keys agree with a second, independent working', () => {
    const g = shownGym();
    let members = g.startMembers;
    for (let i = 0; i < 4; i++) members += g.signups[i] - g.cancellations[i];
    expect(String(members)).toBe(C01.questions[1].key);
    expect((Math.round((g.cancellations[4] / members) * 1000) / 10).toFixed(1)).toBe(C01.questions[2].key);
  });

  it('effort and rating follow the stated rule', () => {
    for (const [id, spec] of [['T01', T01], ['C01', C01]] as const) {
      const set = setById(id);
      const steps = spec.questions.reduce((t, q) => t + q.steps, 0);
      expect(set.effort).toEqual({ measure: 'calculation steps', value: steps });
      expect({ difficulty: set.difficulty, expectedMinutes: set.expectedMinutes }).toEqual(ratingFromSteps(steps));
    }
  });
});

describe('seating sets', () => {
  it('keep their ids, data and the right answer index', () => {
    for (const s of seating) {
      const set = setById(s.id);
      expect(set.title).toBe(`Circular seating ${s.id}`);
      expect(set.family).toBe('circular-seating');
      expect(set.expectedMinutes).toBe(s.expectedMinutes);
      expect(set.effort).toEqual({ measure: 'solver nodes', value: s.solverNodes });
      expect(set.difficulty).toBe({ Easier: 'Easy', Medium: 'Medium', Harder: 'Hard' }[s.difficultyLabel]);
      s.questions.forEach((q, i) => {
        const built = qById(`${s.id}-${i + 1}`) as McqQuestion;
        expect(built.options[built.answerIndex]).toBe(q.answer);
        expect(built.groupId).toBe(s.id);
        expect(built.topic).toBe('Circular seating');
        expect(built.expectedSeconds).toBe(Math.round((s.expectedMinutes * 60) / s.questions.length));
      });
    }
  });

  it('intro names everyone, and the clues appear in full', () => {
    for (const s of seating) {
      expect(s.people).toHaveLength(6);
      const [intro, list] = setById(s.id).stimulus;
      if (intro.type !== 'text' || list.type !== 'list') throw new Error('unexpected stimulus');
      expect(intro.text).toContain('Six friends');
      for (const name of s.people) expect(intro.text).toContain(name);
      expect(list.items).toEqual(s.clues);
    }
  });

  it('explanations state the solution and the answer', () => {
    for (const s of seating) {
      s.questions.forEach((q, i) => {
        const built = qById(`${s.id}-${i + 1}`);
        expect(built.explanation).toContain(s.solutionClockwiseFrom.join(', '));
        expect(built.explanation).toContain(q.answer);
      });
    }
  });

  it('the trap on clockwise and between questions is the reversed direction when it is an option', () => {
    for (const s of seating) {
      const sol = s.solutionClockwiseFrom;
      s.questions.forEach((q, i) => {
        const built = qById(`${s.id}-${i + 1}`) as McqQuestion;
        const m = q.prompt.match(/^Who sits (immediately clockwise of|between) (\w+)/);
        if (!m) return;
        const reversed = sol[(sol.indexOf(m[2]) + 5) % 6];
        if (q.options.includes(reversed)) expect(built.options[built.trapIndex]).toBe(reversed);
      });
    }
  });

  it('only the first question of a set carries a lesson link', () => {
    for (const s of seating) {
      expect(qById(`${s.id}-1`).lessonRef).toEqual({ lessonId: 'dilr-set-choice', seconds: 60 });
      expect(qById(`${s.id}-2`).lessonRef).toBeUndefined();
    }
  });
});

describe('the whole bank', () => {
  const ids = [...seating.map((s) => s.id), 'L01', 'L02', 'T01', 'C01', 'G01', 'G02'];

  it('has all 21 sets', () => {
    expect(DILR_SETS.map((s) => s.id)).toEqual(ids);
    expect(new Set(ids).size).toBe(21);
  });

  it('new sets have 4 or 5 questions, and all sets 3 to 5', () => {
    for (const set of DILR_SETS) {
      expect(set.questionIds.length).toBeGreaterThanOrEqual(3);
      expect(set.questionIds.length).toBeLessThanOrEqual(5);
      expect(questionsOf(set.id).map((q) => q.id)).toEqual(set.questionIds);
    }
    for (const set of NEW_SETS) expect([4, 5]).toContain(set.questionIds.length);
  });

  it('splits the new questions into two groups of 13', () => {
    const count = (group: string[]) => group.reduce((t, id) => t + setById(id).questionIds.length, 0);
    expect(count(['L01', 'T01', 'G01'])).toBe(13);
    expect(count(['L02', 'C01', 'G02'])).toBe(13);
    expect(NEW_QUESTIONS).toHaveLength(26);
  });

  it('question ids are unique', () => {
    expect(new Set(DILR_QUESTIONS.map((q) => q.id)).size).toBe(DILR_QUESTIONS.length);
    expect(DILR_QUESTIONS).toHaveLength(45 + 26);
  });

  it('every MCQ has 4 distinct options, a valid answer and a trap that is not the answer', () => {
    const mcqs = DILR_QUESTIONS.filter((q): q is McqQuestion => q.kind === 'mcq');
    for (const q of mcqs) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.answerIndex).toBeGreaterThanOrEqual(0);
      expect(q.answerIndex).toBeLessThan(4);
      expect(q.trapIndex).toBeGreaterThanOrEqual(0);
      expect(q.trapIndex).toBeLessThan(4);
      expect(q.trapIndex).not.toBe(q.answerIndex);
    }
  });

  it('every TITA has an exact number and 3 wrong values that differ from it', () => {
    const titas = DILR_QUESTIONS.filter((q): q is TitaQuestion => q.kind === 'tita');
    for (const q of titas) {
      expect(q.answer).toMatch(/^\d+(\.\d)?$/);
      expect(q.commonWrong).toHaveLength(3);
      expect(new Set(q.commonWrong).size).toBe(3);
      expect(q.commonWrong).not.toContain(q.answer);
    }
  });

  it('each new set has a TITA, and only the new sets do', () => {
    for (const set of DILR_SETS) {
      const hasTita = questionsOf(set.id).some((q) => q.kind === 'tita');
      expect(hasTita).toBe(set.family !== 'circular-seating');
    }
  });

  it('every set has minutes, a difficulty and effort, and the new sets mix all three levels', () => {
    for (const set of DILR_SETS) {
      expect(set.expectedMinutes).toBeGreaterThan(0);
      expect(['Easy', 'Medium', 'Hard']).toContain(set.difficulty);
      expect(set.effort.value).toBeGreaterThan(0);
    }
    expect(new Set(NEW_SETS.map((s) => s.difficulty)).size).toBe(3);
  });

  it('new questions carry the right lesson and share of the set time', () => {
    for (const set of NEW_SETS) {
      const lesson = set.family === 'di-table' || set.family === 'di-chart' ? 'di-tables' : 'dilr-set-choice';
      for (const q of questionsOf(set.id)) {
        expect(q.lessonRef).toEqual({ lessonId: lesson, seconds: 60 });
        expect(q.expectedSeconds).toBe(Math.round((set.expectedMinutes * 60) / set.questionIds.length));
      }
    }
  });

  it('every question is in the DILR section and every explanation names its trap and answer', () => {
    for (const q of DILR_QUESTIONS) {
      expect(q.section).toBe('DILR');
      expect(q.groupId).toBeTruthy();
      expect(q.topic).toBe(setById(q.groupId as string).topic);
      expect(q.difficulty).toBe(setById(q.groupId as string).difficulty);
      expect(q.explanation.toLowerCase()).toContain(q.trap.toLowerCase());
      if (q.kind === 'mcq') expect(q.explanation).toContain(q.options[q.answerIndex]);
    }
  });

  it('copy has no exclamation marks, no hype and no outside names', () => {
    const texts = [
      ...DILR_QUESTIONS.flatMap((q) => [q.prompt, q.explanation]),
      ...DILR_SETS.flatMap((s) => [s.title, ...s.stimulus.flatMap((b) => (b.type === 'text' ? [b.text] : b.type === 'list' ? b.items : []))]),
    ];
    for (const t of texts) {
      expect(t).not.toContain('!');
      expect(t).not.toMatch(/prepito|unlock|supercharge|seamless|revolutionary/i);
    }
  });
});
