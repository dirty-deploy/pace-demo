import type { Clue, ClueKind, ClueTypes, DifficultyLabel, PuzzleSet, Question } from './types';

export const SEATS = 6;
export const NAMES = ['Asha', 'Bilal', 'Chetan', 'Divya', 'Esha', 'Farhan'];

/** An arrangement lists the person index sitting in each seat, clockwise from seat 0. */
export type Arrangement = number[];

const mod = (n: number) => ((n % SEATS) + SEATS) % SEATS;
const dist = (from: number, to: number) => mod(to - from); // clockwise distance from -> to

/** Check one clue against partial seat positions (seatOf[person] = seat or -1). Unassigned people pass. */
export function clueHolds(c: Clue, seatOf: number[]): boolean {
  const sa = seatOf[c.a];
  const sb = seatOf[c.b];
  if (sa < 0 || sb < 0) return true;
  const d = dist(sa, sb);
  switch (c.kind) {
    case 'cw':
      return d === (c.d ?? 1);
    case 'opp':
      return d === 3;
    case 'adj':
      return d === 1 || d === 5;
    case 'nadj':
      return !(d === 1 || d === 5);
    case 'nopp':
      return d !== 3;
  }
}

function permutationsFixedFirst(): Arrangement[] {
  const out: Arrangement[] = [];
  const rec = (cur: number[], left: number[]) => {
    if (!left.length) {
      out.push([0, ...cur]);
      return;
    }
    left.forEach((p, i) => rec([...cur, p], [...left.slice(0, i), ...left.slice(i + 1)]));
  };
  rec([], [1, 2, 3, 4, 5]);
  return out;
}
const ALL = permutationsFixedFirst(); // 120 arrangements, person 0 fixed in seat 0

function seatOfFrom(arr: Arrangement): number[] {
  const s: number[] = new Array(SEATS).fill(-1);
  arr.forEach((p, seat) => (s[p] = seat));
  return s;
}

/** Enumerate all 120 arrangements (person 0 in seat 0) and keep those satisfying every clue. */
export function solve(clues: Clue[]): Arrangement[] {
  return ALL.filter((arr) => {
    const seatOf = seatOfFrom(arr);
    return clues.every((c) => clueHolds(c, seatOf));
  });
}

/**
 * Count backtracking nodes: place people one by one (person 0 is fixed in seat 0),
 * trying every free seat; a node is one placement attempt. A placement is rejected as soon
 * as a fully assigned clue fails.
 */
export function searchNodes(clues: Clue[]): number {
  let nodes = 2; // the root and the fixed seat-0 placement, so counts match the provided sets
  const seatOf: number[] = new Array(SEATS).fill(-1);
  const used: boolean[] = new Array(SEATS).fill(false);
  seatOf[0] = 0;
  used[0] = true;
  const rec = (p: number) => {
    if (p === SEATS) return;
    for (let seat = 0; seat < SEATS; seat++) {
      if (used[seat]) continue;
      nodes++;
      seatOf[p] = seat;
      if (clues.every((c) => clueHolds(c, seatOf))) {
        used[seat] = true;
        rec(p + 1);
        used[seat] = false;
      }
      seatOf[p] = -1;
    }
  };
  rec(1);
  return nodes;
}

// ---------- Clue text ----------

export function clueText(c: Clue, people: string[]): string {
  const A = people[c.a];
  const B = people[c.b];
  switch (c.kind) {
    case 'cw':
      return (c.d ?? 1) === 1
        ? `${B} sits immediately clockwise of ${A}.`
        : `${B} sits two seats clockwise of ${A}.`;
    case 'opp':
      return `${A} sits directly opposite ${B}.`;
    case 'adj':
      return `${A} sits next to ${B}.`;
    case 'nadj':
      return `${A} does not sit next to ${B}.`;
    case 'nopp':
      return `${A} does not sit opposite ${B}.`;
  }
}

/** Parse the clue sentences used in the data files back into structured clues. */
export function parseClue(text: string, people: string[]): Clue {
  const n = people.join('|');
  const ix = (s: string) => people.indexOf(s);
  const tries: [RegExp, (m: RegExpMatchArray) => Clue][] = [
    [new RegExp(`^(${n}) sits immediately clockwise of (${n})\\.$`), (m) => ({ kind: 'cw', a: ix(m[2]), b: ix(m[1]), d: 1 })],
    [new RegExp(`^(${n}) sits two seats clockwise of (${n})\\.$`), (m) => ({ kind: 'cw', a: ix(m[2]), b: ix(m[1]), d: 2 })],
    [new RegExp(`^(${n}) sits directly opposite (${n})\\.$`), (m) => ({ kind: 'opp', a: ix(m[1]), b: ix(m[2]) })],
    [new RegExp(`^(${n}) does not sit next to (${n})\\.$`), (m) => ({ kind: 'nadj', a: ix(m[1]), b: ix(m[2]) })],
    [new RegExp(`^(${n}) does not sit opposite (${n})\\.$`), (m) => ({ kind: 'nopp', a: ix(m[1]), b: ix(m[2]) })],
    [new RegExp(`^(${n}) sits next to (${n})\\.$`), (m) => ({ kind: 'adj', a: ix(m[1]), b: ix(m[2]) })],
  ];
  for (const [re, make] of tries) {
    const m = text.match(re);
    if (m) return make(m);
  }
  throw new Error(`Cannot parse clue: ${text}`);
}

export function classify(clues: Clue[]): ClueTypes {
  const t: ClueTypes = { fixed: 0, adjacency: 0, negative: 0 };
  for (const c of clues) {
    if (c.kind === 'cw' || c.kind === 'opp') t.fixed++;
    else if (c.kind === 'adj') t.adjacency++;
    else t.negative++;
  }
  return t;
}

// ---------- Questions ----------

export function shuffle<T>(xs: T[], rand: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function makeQuestions(people: string[], arr: Arrangement, rand: () => number): Question[] {
  const seatName = (seat: number) => people[arr[mod(seat)]];
  const seatOfName = (n: string) => arr.indexOf(people.indexOf(n));
  const pickOptions = (answer: string, exclude: string[]): string[] => {
    const pool = people.filter((p) => p !== answer && !exclude.includes(p));
    return shuffle([answer, ...shuffle(pool, rand).slice(0, 3)], rand);
  };
  const [x1, x2, x3] = shuffle(people, rand);
  const q1 = seatName(seatOfName(x1) + 3);
  const q2 = seatName(seatOfName(x2) + 1);
  const b3 = seatName(seatOfName(x3) + 2);
  const q3 = seatName(seatOfName(x3) + 1);
  return [
    { prompt: `Who sits directly opposite ${x1}?`, options: pickOptions(q1, [x1]), answer: q1 },
    { prompt: `Who sits immediately clockwise of ${x2}?`, options: pickOptions(q2, [x2]), answer: q2 },
    { prompt: `Who sits between ${x3} and ${b3}, going clockwise from ${x3}?`, options: pickOptions(q3, [x3, b3]), answer: q3 },
  ];
}

// ---------- Difficulty mapping ----------

export type Anchors = { minNodes: number; maxNodes: number };

/** Map log(nodes) linearly onto difficulty 1..5 and expected minutes 5..12, clamped. */
export function mapDifficulty(nodes: number, anchors: Anchors) {
  const lo = Math.log(anchors.minNodes);
  const hi = Math.log(anchors.maxNodes);
  const t = Math.min(1, Math.max(0, (Math.log(nodes) - lo) / (hi - lo)));
  return {
    difficultyScore: Math.round((1 + 4 * t) * 100) / 100,
    expectedMinutes: Math.round((5 + 7 * t) * 10) / 10,
  };
}

export function labelFor(score: number): DifficultyLabel {
  if (score < 2.05) return 'Easier';
  if (score < 2.8) return 'Medium';
  return 'Harder';
}

// ---------- Generator ----------

export type Style = 'easier' | 'medium' | 'harder';

const WEIGHTS: Record<Style, Record<ClueKind, number>> = {
  easier: { cw: 6, opp: 3, adj: 1, nadj: 0.3, nopp: 0.3 },
  medium: { cw: 3, opp: 1.5, adj: 2, nadj: 1, nopp: 1 },
  harder: { cw: 1, opp: 0.5, adj: 3, nadj: 3, nopp: 3 },
};

/** All clues that are true in the given arrangement. */
function trueClues(arr: Arrangement): Clue[] {
  const seatOf = seatOfFrom(arr);
  const out: Clue[] = [];
  for (let a = 0; a < SEATS; a++) {
    for (let b = 0; b < SEATS; b++) {
      if (a === b) continue;
      for (const d of [1, 2]) out.push({ kind: 'cw', a, b, d });
      if (a < b) {
        out.push({ kind: 'opp', a, b }, { kind: 'adj', a, b }, { kind: 'nadj', a, b }, { kind: 'nopp', a, b });
      }
    }
  }
  return out.filter((c) => clueHolds(c, seatOf));
}

function weightedPick(cs: Clue[], style: Style, rand: () => number): Clue {
  const w = cs.map((c) => WEIGHTS[style][c.kind]);
  let r = rand() * w.reduce((s, x) => s + x, 0);
  for (let i = 0; i < cs.length; i++) {
    r -= w[i];
    if (r <= 0) return cs[i];
  }
  return cs[cs.length - 1];
}

/** Returns a minimal clue list with exactly one solution, or null if outside 3..7 clues. */
export function generateClues(style: Style, rand: () => number): { clues: Clue[]; arr: Arrangement } | null {
  const arr: Arrangement = [0, ...shuffle([1, 2, 3, 4, 5], rand)];
  const pool = trueClues(arr);
  let clues: Clue[] = [];
  let guard = 0;
  while (solve(clues).length !== 1 && guard++ < 40) {
    const c = weightedPick(pool, style, rand);
    if (!clues.includes(c)) clues.push(c);
  }
  if (solve(clues).length !== 1) return null;
  // Drop any clue whose removal keeps the solution unique (random order, so sets vary).
  for (const c of shuffle(clues, rand)) {
    const without = clues.filter((x) => x !== c);
    if (solve(without).length === 1) clues = without;
  }
  if (clues.length < 3 || clues.length > 7) return null;
  return { clues: shuffle(clues, rand), arr };
}

export function generate(style: Style, id: string, anchors: Anchors, rand: () => number = Math.random): PuzzleSet {
  for (let i = 0; i < 500; i++) {
    const g = generateClues(style, rand);
    if (!g) continue;
    const nodes = searchNodes(g.clues);
    const diff = mapDifficulty(nodes, anchors);
    return {
      id,
      family: 'circular-seating',
      people: NAMES,
      clues: g.clues.map((c) => clueText(c, NAMES)),
      clueTypes: classify(g.clues),
      solutionClockwiseFrom: g.arr.map((p) => NAMES[p]),
      questions: makeQuestions(NAMES, g.arr, rand),
      solverNodes: nodes,
      ...diff,
      difficultyLabel: labelFor(diff.difficultyScore),
    };
  }
  throw new Error('generator failed');
}
