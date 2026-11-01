// Pure brute-force solvers for the new DILR sets. No imports, no state: tests and newSets.ts both
// call these. solve* enumerates every candidate and keeps the ones that satisfy all clues.
// *SearchNodes counts backtracking effort the way src/logic/seating.ts does: a node is one
// placement attempt, and a placement is rejected as soon as a fully placed clue fails.

// ---------- Linear arrangement ----------

/** Positions are 1-based. Position 1 is the front of the queue or the start of the row. */
export type LinearClue =
  | { kind: 'at'; who: string; pos: number }
  | { kind: 'atEnd'; who: string }
  | { kind: 'notAtEnd'; who: string }
  /** a is exactly one position before b. */
  | { kind: 'immediatelyBefore'; a: string; b: string }
  /** a is somewhere before b. */
  | { kind: 'before'; a: string; b: string }
  | { kind: 'adjacent'; a: string; b: string }
  /** Exactly `between` people stand between a and b, in either order. */
  | { kind: 'gap'; a: string; b: string; between: number };

/** A solution lists who stands at each position, position 1 first. */
export type LinearSolution = string[];

/** Names a clue depends on, so a test can confirm the clue text mentions each one. */
export function linearClueNames(c: LinearClue): string[] {
  return 'who' in c ? [c.who] : [c.a, c.b];
}

/** posOf maps a name to its 1-based position. Every name in the clue must already be placed. */
function linearClueHolds(c: LinearClue, posOf: Map<string, number>, n: number): boolean {
  const p = (name: string) => posOf.get(name) as number;
  switch (c.kind) {
    case 'at':
      return p(c.who) === c.pos;
    case 'atEnd':
      return p(c.who) === 1 || p(c.who) === n;
    case 'notAtEnd':
      return p(c.who) !== 1 && p(c.who) !== n;
    case 'immediatelyBefore':
      return p(c.b) - p(c.a) === 1;
    case 'before':
      return p(c.a) < p(c.b);
    case 'adjacent':
      return Math.abs(p(c.a) - p(c.b)) === 1;
    case 'gap':
      return Math.abs(p(c.a) - p(c.b)) === c.between + 1;
  }
}

/** Tests every permutation of `people` against every clue. `checked` is the number of permutations. */
export function solveLinear(people: string[], clues: LinearClue[]): { solutions: LinearSolution[]; checked: number } {
  const solutions: LinearSolution[] = [];
  let checked = 0;
  const n = people.length;
  const order: string[] = [];
  const posOf = new Map<string, number>();
  const rec = () => {
    if (order.length === n) {
      checked++;
      if (clues.every((c) => linearClueHolds(c, posOf, n))) solutions.push([...order]);
      return;
    }
    for (const name of people) {
      if (posOf.has(name)) continue;
      order.push(name);
      posOf.set(name, order.length);
      rec();
      posOf.delete(name);
      order.pop();
    }
  };
  rec();
  return { solutions, checked };
}

/** Backtracking nodes: place people in listed order into free positions, pruning on finished clues. */
export function linearSearchNodes(people: string[], clues: LinearClue[]): number {
  const n = people.length;
  const posOf = new Map<string, number>();
  const used = new Array<boolean>(n + 1).fill(false);
  let nodes = 1;
  const ready = (c: LinearClue) => linearClueNames(c).every((name) => posOf.has(name));
  const rec = (i: number) => {
    if (i === n) return;
    for (let pos = 1; pos <= n; pos++) {
      if (used[pos]) continue;
      nodes++;
      posOf.set(people[i], pos);
      if (clues.every((c) => !ready(c) || linearClueHolds(c, posOf, n))) {
        used[pos] = true;
        rec(i + 1);
        used[pos] = false;
      }
      posOf.delete(people[i]);
    }
  };
  rec(0);
  return nodes;
}

// ---------- Scheduling / grid ----------

/** One axis of the grid. Value order matters: 'earlier' and 'offset' read it as a timeline. */
export type GridDimension = {
  name: string;
  values: string[];
  /** How many items may share one value. Defaults to 1. */
  capacity?: number;
};

export type GridConstraint =
  | { kind: 'is'; item: string; dim: string; value: string }
  | { kind: 'same'; a: string; b: string; dim: string }
  /** a's value comes before b's value in the dimension's order. */
  | { kind: 'earlier'; a: string; b: string; dim: string }
  /** b's value is exactly `by` steps after a's value. */
  | { kind: 'offset'; a: string; b: string; dim: string; by: number }
  /** Whichever item holds valueA on dimA also holds valueB on dimB, and no other item does. */
  | { kind: 'linked'; dimA: string; valueA: string; dimB: string; valueB: string }
  /** The item holding valueA comes before the item holding valueB, both on dim, along `along`. */
  | { kind: 'earlierHolder'; dim: string; valueA: string; valueB: string; along: string };

export type GridProblem = {
  items: string[];
  dimensions: GridDimension[];
  /** When true, no two items may hold the same combination of values. */
  uniqueCells?: boolean;
  constraints: GridConstraint[];
};

/** item -> dimension name -> value. */
export type GridSolution = Record<string, Record<string, string>>;

type Placed = Map<string, Map<string, string>>;

/** Item and value names a constraint mentions, so a test can confirm the clue text does too. */
export function gridConstraintNames(c: GridConstraint): string[] {
  switch (c.kind) {
    case 'is':
      return [c.item, c.value];
    case 'same':
    case 'earlier':
    case 'offset':
      return [c.a, c.b];
    case 'linked':
    case 'earlierHolder':
      return [c.valueA, c.valueB];
  }
}

/** True when the placed items already break the constraint. Unplaced items never break anything. */
function gridBroken(c: GridConstraint, placed: Placed, problem: GridProblem): boolean {
  const val = (item: string, dim: string) => placed.get(item)?.get(dim);
  const index = (item: string | undefined, dim: string) => {
    const v = item === undefined ? undefined : val(item, dim);
    if (v === undefined) return -1;
    return (problem.dimensions.find((d) => d.name === dim) as GridDimension).values.indexOf(v);
  };
  switch (c.kind) {
    case 'is': {
      const v = val(c.item, c.dim);
      return v !== undefined && v !== c.value;
    }
    case 'same': {
      const x = val(c.a, c.dim);
      const y = val(c.b, c.dim);
      return x !== undefined && y !== undefined && x !== y;
    }
    case 'earlier':
    case 'offset': {
      const x = index(c.a, c.dim);
      const y = index(c.b, c.dim);
      if (x < 0 || y < 0) return false;
      return c.kind === 'earlier' ? x >= y : y - x !== c.by;
    }
    case 'linked':
      return [...placed.keys()].some((item) => (val(item, c.dimA) === c.valueA) !== (val(item, c.dimB) === c.valueB));
    case 'earlierHolder': {
      const holder = (v: string) => [...placed.keys()].find((item) => val(item, c.dim) === v);
      const x = index(holder(c.valueA), c.along);
      const y = index(holder(c.valueB), c.along);
      return x >= 0 && y >= 0 && x >= y;
    }
  }
}

/** Every way one item can take a value on each dimension. */
function combos(dimensions: GridDimension[]): string[][] {
  return dimensions.reduce<string[][]>((acc, d) => acc.flatMap((c) => d.values.map((v) => [...c, v])), [[]]);
}

/** Depth-first placement of every item, honouring capacities and uniqueCells. */
function walkGrid(problem: GridProblem, prune: boolean, onPlace: () => void, onLeaf: (placed: Placed) => void) {
  const { items, dimensions } = problem;
  const all = combos(dimensions);
  const counts = dimensions.map(() => new Map<string, number>());
  const cells = new Set<string>();
  const placed: Placed = new Map();
  const bump = (combo: string[], by: number) =>
    dimensions.forEach((_, k) => counts[k].set(combo[k], (counts[k].get(combo[k]) ?? 0) + by));
  const rec = (i: number) => {
    if (i === items.length) {
      onLeaf(placed);
      return;
    }
    for (const combo of all) {
      const cell = combo.join('|');
      const full = dimensions.some((d, k) => (counts[k].get(combo[k]) ?? 0) >= (d.capacity ?? 1));
      if (full || (problem.uniqueCells && cells.has(cell))) continue;
      onPlace();
      placed.set(items[i], new Map(dimensions.map((d, k) => [d.name, combo[k]])));
      if (!prune || !problem.constraints.some((c) => gridBroken(c, placed, problem))) {
        bump(combo, 1);
        cells.add(cell);
        rec(i + 1);
        cells.delete(cell);
        bump(combo, -1);
      }
      placed.delete(items[i]);
    }
  };
  rec(0);
}

/** Tests every assignment the grid allows against every constraint. `checked` counts assignments. */
export function solveGrid(problem: GridProblem): { solutions: GridSolution[]; checked: number } {
  const solutions: GridSolution[] = [];
  let checked = 0;
  walkGrid(
    problem,
    false,
    () => {},
    (placed) => {
      checked++;
      if (problem.constraints.some((c) => gridBroken(c, placed, problem))) return;
      const s: GridSolution = {};
      for (const [item, values] of placed) s[item] = Object.fromEntries(values);
      solutions.push(s);
    },
  );
  return { solutions, checked };
}

/** Backtracking nodes for the grid: placing one item in one combination of values is one node. */
export function gridSearchNodes(problem: GridProblem): number {
  let nodes = 1;
  walkGrid(
    problem,
    true,
    () => nodes++,
    () => {},
  );
  return nodes;
}
