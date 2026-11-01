// The six new DILR sets: L01, L02 (linear), T01 (table), C01 (chart), G01, G02 (scheduling).
// Linear and scheduling sets keep structured clues next to their display text, and each question
// has a check() that recomputes its answer from the solver's solution. tests/dilr.test.ts proves
// each puzzle has one solution, every clue is needed, and every key matches.
// Table and chart sets generate their numbers from a seeded PRNG kept in this file. Answers are
// computed from those numbers at module load, with a hand-written key beside each so drift fails
// the test.

import type { Difficulty, DilrFamily, DilrSet, LessonRef, Question, StimulusBlock } from '../types';
import { gridSearchNodes, linearSearchNodes, solveLinear } from './verify';
import type { GridConstraint, GridDimension, GridProblem, GridSolution, LinearClue, LinearSolution } from './verify';

// ---------- Difficulty rules ----------
//
// Solver sets (effort measure 'search nodes'): nodes come from linearSearchNodes or gridSearchNodes.
//   Easy under 120 nodes, Medium 120 to 399, Hard 400 or more.
//   expectedMinutes = 3 + 1.4 * log2(nodes / 10), to the nearest 0.5, kept within 6 to 14.
// DI sets (effort measure 'calculation steps'): one step is one sum, subtraction, multiplication,
// division or comparison of a full list, done by hand, reusing results from earlier questions in
// the set. Each DI question records its own count.
//   Easy up to 15 steps, Medium 16 to 35, Hard 36 or more.
//   expectedMinutes = 2 + 0.2 * steps, to the nearest 0.5.
// These are estimates from effort, not measured human solve times.

const nearestHalf = (x: number) => Math.round(x * 2) / 2;

export function ratingFromNodes(nodes: number): { difficulty: Difficulty; expectedMinutes: number } {
  const difficulty: Difficulty = nodes < 120 ? 'Easy' : nodes < 400 ? 'Medium' : 'Hard';
  const minutes = nearestHalf(3 + 1.4 * Math.log2(nodes / 10));
  return { difficulty, expectedMinutes: Math.min(14, Math.max(6, minutes)) };
}

export function ratingFromSteps(steps: number): { difficulty: Difficulty; expectedMinutes: number } {
  const difficulty: Difficulty = steps <= 15 ? 'Easy' : steps <= 35 ? 'Medium' : 'Hard';
  return { difficulty, expectedMinutes: nearestHalf(2 + 0.2 * steps) };
}

// ---------- Spec shapes ----------

type QuestionText = { subType: string; prompt: string; trap: string };

/** `key` is written by hand. For an MCQ the first wrong option is the trap option. */
type McqAnswer = { kind: 'mcq'; key: string; wrong: [string, string, string] };
type TitaAnswer = { kind: 'tita'; key: string; commonWrong: [string, string, string] };

export type SolverQuestion<S> = QuestionText &
  (McqAnswer | TitaAnswer) & {
    explanation: string;
    /** Recomputes the answer from the unique solution. Must equal `key`. */
    check: (solution: S) => string;
  };

type SetHead = { id: string; title: string; family: DilrFamily; topic: string };

export type LinearSetSpec = SetHead & {
  intro: string;
  people: string[];
  clues: { text: string; clue: LinearClue }[];
  questions: SolverQuestion<LinearSolution>[];
};

export type GridSetSpec = SetHead & {
  intro: string;
  /** Shown between the intro and the clues. */
  table: StimulusBlock;
  items: string[];
  dimensions: GridDimension[];
  uniqueCells?: boolean;
  clues: { text: string; clue: GridConstraint }[];
  questions: SolverQuestion<GridSolution>[];
};

export const gridProblem = (s: GridSetSpec): GridProblem => ({
  items: s.items,
  dimensions: s.dimensions,
  uniqueCells: s.uniqueCells,
  constraints: s.clues.map((c) => c.clue),
});

type DiMcq<D> = { kind: 'mcq'; wrong: (data: D) => [string, string, string] };
type DiTita<D> = { kind: 'tita'; commonWrong: (data: D) => [string, string, string] };

export type DiQuestion<D> = QuestionText &
  (DiMcq<D> | DiTita<D>) & {
    /** Calculation steps for this question, by the rule above. */
    steps: number;
    /** Computes the answer from the numbers. */
    compute: (data: D) => string;
    /** The answer worked out by hand. The test checks compute(data) === key. */
    key: string;
    explanation: (data: D) => string;
  };

export type DiSetSpec<D> = SetHead & { data: D; stimulus: StimulusBlock[]; questions: DiQuestion<D>[] };

// ---------- Seeded numbers ----------

/** Mulberry32: a small seeded PRNG, so the table and chart numbers are reproducible. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A random multiple of `step` from lo to hi inclusive. */
const stepped = (rand: () => number, lo: number, hi: number, step: number) =>
  lo + step * Math.floor(rand() * ((hi - lo) / step + 1));

// ---------- Small formatting and lookup helpers ----------

/** ₹ with thousands commas. All amounts here stay under one lakh, so Indian and Western grouping agree. */
const rupees = (n: number) => `₹${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
const oneDecimal = (x: number) => String(Math.round(x * 10) / 10);
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** Exactly one match, or the set is broken. */
function only<T>(xs: T[]): T {
  if (xs.length !== 1) throw new Error(`Expected one match, found ${xs.length}`);
  return xs[0];
}

const place = (s: LinearSolution, name: string) => s.indexOf(name) + 1;
const nameAt = (s: LinearSolution, position: number) => s[position - 1];

function swapped(s: LinearSolution, a: string, b: string): LinearSolution {
  return s.map((name) => (name === a ? b : name === b ? a : name));
}

const holder = (s: GridSolution, dim: string, value: string) => only(Object.keys(s).filter((item) => s[item][dim] === value));

// ---------- L01: canteen queue ----------

const L01_WALK =
  'Meher is in the middle of seven, so Meher is at position 4, and Oviya, just ahead, is at 3. ' +
  'Two students between Nikhil and Sanjay means their positions differ by 3. Nikhil is ahead of Meher, so Nikhil is at 1 or 2. ' +
  'Position 1 would put Sanjay at 4, which is taken, so Nikhil is at 2 and Sanjay at 5. ' +
  'That leaves 1, 6 and 7, and the order Ritu, then Qadir, then Pranav fits them only one way. ' +
  'The queue from the front is Ritu, Nikhil, Oviya, Meher, Sanjay, Qadir, Pranav.';

export const L01: LinearSetSpec = {
  id: 'L01',
  title: 'Canteen queue',
  family: 'linear-arrangement',
  topic: 'Linear arrangement',
  intro:
    'Seven students, Meher, Nikhil, Oviya, Pranav, Qadir, Ritu and Sanjay, stand in a single line at the college canteen counter. ' +
    'Position 1 is at the front, next to the counter, and position 7 is at the back. Each position has one student. ' +
    '"Ahead of" means closer to the counter, and "behind" means further from it.',
  people: ['Meher', 'Nikhil', 'Oviya', 'Pranav', 'Qadir', 'Ritu', 'Sanjay'],
  clues: [
    { text: 'Exactly two students stand between Nikhil and Sanjay.', clue: { kind: 'gap', a: 'Nikhil', b: 'Sanjay', between: 2 } },
    { text: 'Ritu stands somewhere ahead of Qadir.', clue: { kind: 'before', a: 'Ritu', b: 'Qadir' } },
    { text: 'Meher stands exactly in the middle of the queue.', clue: { kind: 'at', who: 'Meher', pos: 4 } },
    { text: 'Nikhil stands somewhere ahead of Meher.', clue: { kind: 'before', a: 'Nikhil', b: 'Meher' } },
    { text: 'Qadir stands somewhere ahead of Pranav.', clue: { kind: 'before', a: 'Qadir', b: 'Pranav' } },
    { text: 'Oviya stands immediately ahead of Meher.', clue: { kind: 'immediatelyBefore', a: 'Oviya', b: 'Meher' } },
  ],
  questions: [
    {
      kind: 'mcq',
      subType: 'Neighbour',
      prompt: 'Who stands immediately behind Sanjay?',
      key: 'Qadir',
      wrong: ['Meher', 'Pranav', 'Oviya'],
      check: (s) => nameAt(s, place(s, 'Sanjay') + 1),
      trap: 'Direction slip',
      explanation: `${L01_WALK} Sanjay is at 5, so the student behind is at 6: Qadir. Direction slip: Meher is immediately ahead of Sanjay, not behind.`,
    },
    {
      kind: 'tita',
      subType: 'Gap count',
      prompt: 'How many students stand between Ritu and Sanjay? Enter a whole number.',
      key: '3',
      commonWrong: ['4', '5', '2'],
      check: (s) => String(Math.abs(place(s, 'Ritu') - place(s, 'Sanjay')) - 1),
      trap: 'Inclusive count trap',
      explanation: `${L01_WALK} Ritu is at 1 and Sanjay at 5. Between them are Nikhil, Oviya and Meher, so the count is 3. Inclusive count trap: 5 minus 1 gives 4, but that counts one of the two end students as well.`,
    },
    {
      kind: 'mcq',
      subType: 'Position from the back',
      prompt: 'Who is third from the back of the queue?',
      key: 'Sanjay',
      wrong: ['Oviya', 'Qadir', 'Meher'],
      check: (s) => nameAt(s, s.length - 2),
      trap: 'Front-back slip',
      explanation: `${L01_WALK} Counting from the back: Pranav, Qadir, Sanjay. Front-back slip: Oviya is third from the front, which is the other end of the line.`,
    },
    {
      kind: 'mcq',
      subType: 'What-if',
      prompt: 'Nikhil and Sanjay swap places, and everyone else stays put. Who now stands exactly two places behind Oviya?',
      key: 'Nikhil',
      wrong: ['Sanjay', 'Qadir', 'Meher'],
      check: (s) => {
        const after = swapped(s, 'Nikhil', 'Sanjay');
        return nameAt(after, place(after, 'Oviya') + 2);
      },
      trap: 'Stale position trap',
      explanation: `${L01_WALK} After the swap Sanjay is at 2 and Nikhil at 5. Oviya stays at 3, so two places behind is position 5: Nikhil. Stale position trap: Sanjay was at 5 before the swap, so reading the old queue gives the wrong name.`,
    },
  ],
};

// ---------- L02: market street ----------

const L02_WALK =
  'Three shops between the Chemist and the Bakery means their numbers differ by 4, and the Chemist is at an end. ' +
  'So either the Chemist is at 1 with the Bakery at 5, or the Chemist is at 8 with the Bakery at 4. ' +
  'Try the Chemist at 1. Number 8 needs a shop. The Optician and the Tailor cannot be at an end, the Stationer comes before the Optician, the Grocer is next to the Bakery, and the Hardware store comes before the Grocer. ' +
  'Only the Florist can take 8, which puts the Tailor at 6 and the Grocer at 4. The Stationer and the Optician must then both come after the Tailor, but only 7 is free after 6. So this case fails. ' +
  'The Chemist is at 8 and the Bakery at 4, and the Grocer is at 3 or 5. ' +
  'If the Grocer is at 3, the Hardware store takes 1 or 2, and the only free numbers two apart for the Florist and the Tailor are 5 and 7. Then the Tailor is at 5 or 7, and the Stationer and the Optician cannot both fit after it. ' +
  'So the Grocer is at 5. Now the only free numbers two apart are 1 and 3, and the Tailor is not at an end, so the Tailor is at 3 and the Florist at 1. ' +
  'The Hardware store must come before the Grocer, so it takes 2, and the Stationer and the Optician take 6 and 7 in that order. ' +
  'From the bus stand the street reads Florist, Hardware store, Tailor, Bakery, Grocer, Stationer, Optician, Chemist.';

const L02_PEOPLE = ['Bakery', 'Chemist', 'Florist', 'Grocer', 'Hardware store', 'Optician', 'Stationer', 'Tailor'];

const L02_PAIRS: [string, string][] = [
  ['Tailor', 'Stationer'],
  ['Hardware store', 'Bakery'],
  ['Florist', 'Grocer'],
  ['Bakery', 'Chemist'],
];

const TAILOR_NOT_AT_END: LinearClue = { kind: 'notAtEnd', who: 'Tailor' };

const L02_CLUES: LinearSetSpec['clues'] = [
  { text: 'Exactly one shop lies between the Florist and the Tailor.', clue: { kind: 'gap', a: 'Florist', b: 'Tailor', between: 1 } },
  { text: 'The Chemist is at one of the two ends of the street.', clue: { kind: 'atEnd', who: 'Chemist' } },
  { text: 'The Hardware store is somewhere before the Grocer.', clue: { kind: 'before', a: 'Hardware store', b: 'Grocer' } },
  { text: 'The Optician is not at either end of the street.', clue: { kind: 'notAtEnd', who: 'Optician' } },
  { text: 'The Grocer is next to the Bakery.', clue: { kind: 'adjacent', a: 'Grocer', b: 'Bakery' } },
  { text: 'The Tailor is somewhere before the Stationer.', clue: { kind: 'before', a: 'Tailor', b: 'Stationer' } },
  { text: 'Exactly three shops lie between the Chemist and the Bakery.', clue: { kind: 'gap', a: 'Chemist', b: 'Bakery', between: 3 } },
  { text: 'The Stationer is somewhere before the Optician.', clue: { kind: 'before', a: 'Stationer', b: 'Optician' } },
  { text: 'The Tailor is not at either end of the street.', clue: TAILOR_NOT_AT_END },
];

export const L02: LinearSetSpec = {
  id: 'L02',
  title: 'Market street shops',
  family: 'linear-arrangement',
  topic: 'Linear arrangement',
  intro:
    'Eight shops, a Bakery, a Chemist, a Florist, a Grocer, a Hardware store, an Optician, a Stationer and a Tailor, stand side by side along one side of a market street. ' +
    'They are numbered 1 to 8, starting from the bus stand, and each number has one shop. ' +
    '"Before" means a lower number, closer to the bus stand.',
  people: L02_PEOPLE,
  clues: L02_CLUES,
  questions: [
    {
      kind: 'mcq',
      subType: 'Neighbour',
      prompt: 'Walking from the bus stand, which shop comes immediately after the Bakery?',
      key: 'Grocer',
      wrong: ['Tailor', 'Stationer', 'Hardware store'],
      check: (s) => nameAt(s, place(s, 'Bakery') + 1),
      trap: 'Direction slip',
      explanation: `${L02_WALK} The Bakery is at 4, so the next shop is number 5: the Grocer. Direction slip: the Tailor at 3 comes just before the Bakery, not after.`,
    },
    {
      kind: 'tita',
      subType: 'Gap count',
      prompt: 'How many shops lie between the Hardware store and the Optician? Enter a whole number.',
      key: '4',
      commonWrong: ['5', '6', '3'],
      check: (s) => String(Math.abs(place(s, 'Hardware store') - place(s, 'Optician')) - 1),
      trap: 'Inclusive count trap',
      explanation: `${L02_WALK} The Hardware store is at 2 and the Optician at 7. Between them are numbers 3, 4, 5 and 6, so the count is 4. Inclusive count trap: 7 minus 2 gives 5, which counts one of the two end shops as well.`,
    },
    {
      kind: 'mcq',
      subType: 'Pair check',
      prompt: 'Which pair of shops has exactly two shops between them?',
      key: 'Tailor and Stationer',
      wrong: ['Hardware store and Bakery', 'Florist and Grocer', 'Bakery and Chemist'],
      check: (s) => {
        const [a, b] = only(L02_PAIRS.filter(([x, y]) => Math.abs(place(s, x) - place(s, y)) === 3));
        return `${a} and ${b}`;
      },
      trap: 'Inclusive count trap',
      explanation: `${L02_WALK} The Tailor is at 3 and the Stationer at 6, with numbers 4 and 5 between them, so the pair is Tailor and Stationer. Inclusive count trap: the Hardware store at 2 and the Bakery at 4 are two numbers apart, but only the Tailor lies between them. Two shops between means the numbers differ by 3.`,
    },
    {
      kind: 'mcq',
      subType: 'Midpoint',
      prompt: 'Which shop stands exactly midway between the Hardware store and the Stationer?',
      key: 'Bakery',
      wrong: ['Grocer', 'Tailor', 'Optician'],
      check: (s) => nameAt(s, (place(s, 'Hardware store') + place(s, 'Stationer')) / 2),
      trap: 'Midpoint miscount',
      explanation: `${L02_WALK} The Hardware store is at 2 and the Stationer at 6, and the midpoint of 2 and 6 is 4: the Bakery. Midpoint miscount: the Grocer at 5 is three shops on from the Hardware store but only one from the Stationer, so it is not midway.`,
    },
    {
      kind: 'mcq',
      subType: 'Clue removal',
      prompt: 'Suppose the clue that the Tailor is not at either end is withdrawn, and every other clue stays. Apart from the Tailor, which shop could then be at a different number?',
      key: 'Florist',
      wrong: ['Hardware store', 'Stationer', 'Optician'],
      check: (s) => {
        const others = L02_CLUES.map((c) => c.clue).filter((c) => c !== TAILOR_NOT_AT_END);
        const all = solveLinear(L02_PEOPLE, others).solutions;
        return only(L02_PEOPLE.filter((name) => name !== 'Tailor' && all.some((x) => place(x, name) !== place(s, name))));
      },
      trap: 'Assumed fix trap',
      explanation: `${L02_WALK} Without that clue, the last step changes. The Florist and the Tailor still take 1 and 3, but either can be at 1, and the other shops stay where they are. So only the Florist moves with the Tailor. Assumed fix trap: the Hardware store sits beside both numbers, so it can look as if it moves too. It stays at 2, the only number left before the Grocer.`,
    },
  ],
};

// ---------- G01: rider shifts ----------

const G01_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const G01_ROUND_KM: Record<string, number> = { North: 14, South: 11, East: 9, West: 16, Central: 6 };

const G01_WALK =
  'Tanvi is the day after Yamini, and Uday two days after Tanvi, so those three take Monday, Tuesday, Thursday or Tuesday, Wednesday, Friday. ' +
  'The East shift is on Friday and Vikram covers East, so Vikram has Friday and Uday cannot. ' +
  'That gives Yamini Monday, Tanvi Tuesday, Uday Thursday and Vikram Friday, which leaves Wednesday for Zubin. ' +
  'Tanvi covers Central on Tuesday. South comes earlier than Central, and only Monday is earlier, so Yamini covers South. ' +
  'North and West go to Zubin and Uday, and North comes earlier, so Zubin covers North and Uday covers West.';

export const G01: GridSetSpec = {
  id: 'G01',
  title: 'Rider shifts',
  family: 'scheduling',
  topic: 'Scheduling',
  intro:
    'Five delivery riders, Tanvi, Uday, Vikram, Yamini and Zubin, work for a local grocery delivery service. ' +
    'Next week each rider takes one evening shift on a different weekday, Monday to Friday, and covers a different zone: North, South, East, West or Central. ' +
    'On a shift, a rider does one round of the zone. The table gives the length of one round.',
  table: {
    type: 'table',
    caption: 'Length of one round',
    columns: ['Zone', 'Round length (km)'],
    rows: Object.entries(G01_ROUND_KM),
  },
  items: ['Tanvi', 'Uday', 'Vikram', 'Yamini', 'Zubin'],
  dimensions: [
    { name: 'day', values: G01_DAYS },
    { name: 'zone', values: Object.keys(G01_ROUND_KM) },
  ],
  clues: [
    { text: 'The South shift comes earlier in the week than the Central shift.', clue: { kind: 'earlierHolder', dim: 'zone', valueA: 'South', valueB: 'Central', along: 'day' } },
    { text: "Tanvi's shift is the day after Yamini's.", clue: { kind: 'offset', a: 'Yamini', b: 'Tanvi', dim: 'day', by: 1 } },
    { text: 'Vikram covers the East zone.', clue: { kind: 'is', item: 'Vikram', dim: 'zone', value: 'East' } },
    { text: "Uday's shift is two days after Tanvi's.", clue: { kind: 'offset', a: 'Tanvi', b: 'Uday', dim: 'day', by: 2 } },
    { text: 'The North shift comes earlier in the week than the West shift.', clue: { kind: 'earlierHolder', dim: 'zone', valueA: 'North', valueB: 'West', along: 'day' } },
    { text: 'The East shift is on Friday.', clue: { kind: 'linked', dimA: 'zone', valueA: 'East', dimB: 'day', valueB: 'Friday' } },
    { text: 'Tanvi covers the Central zone.', clue: { kind: 'is', item: 'Tanvi', dim: 'zone', value: 'Central' } },
  ],
  questions: [
    {
      kind: 'mcq',
      subType: 'Who and when',
      prompt: 'Who works on Thursday?',
      key: 'Uday',
      wrong: ['Zubin', 'Vikram', 'Tanvi'],
      check: (s) => holder(s, 'day', 'Thursday'),
      trap: 'Day count slip',
      explanation: `${G01_WALK} So Uday works on Thursday. Day count slip: two days after Tuesday is Thursday. Stopping at Wednesday gives Zubin, which is only one day after.`,
    },
    {
      kind: 'mcq',
      subType: 'Who and where',
      prompt: 'Which zone is covered on Monday?',
      key: 'South',
      wrong: ['North', 'West', 'Central'],
      check: (s) => s[holder(s, 'day', 'Monday')].zone,
      trap: 'Assumed order trap',
      explanation: `${G01_WALK} Monday is Yamini, who covers South. Assumed order trap: North is only known to come before West, and that does not put it on Monday. Central is on Tuesday and South must come before it, so South is the Monday zone.`,
    },
    {
      kind: 'tita',
      subType: 'Total from the table',
      prompt: 'How many kilometres in total are covered by the Monday, Tuesday and Wednesday shifts? Enter a whole number.',
      key: '31',
      commonWrong: ['33', '47', '20'],
      check: (s) => String(sum(['Monday', 'Tuesday', 'Wednesday'].map((d) => G01_ROUND_KM[s[holder(s, 'day', d)].zone]))),
      trap: 'Partial scope trap',
      explanation: `${G01_WALK} Monday is South at 11 km, Tuesday is Central at 6 km and Wednesday is North at 14 km, so the total is 31 km. Partial scope trap: leaving out Monday gives 20, and running on through Thursday gives 47. Mixing up North and West gives 33.`,
    },
    {
      kind: 'mcq',
      subType: 'Link across the table',
      prompt: 'Who works the day after the shortest round?',
      key: 'Zubin',
      wrong: ['Yamini', 'Uday', 'Tanvi'],
      check: (s) => {
        const shortest = Object.keys(G01_ROUND_KM).reduce((a, b) => (G01_ROUND_KM[b] < G01_ROUND_KM[a] ? b : a));
        const day = G01_DAYS.indexOf(s[holder(s, 'zone', shortest)].day);
        return holder(s, 'day', G01_DAYS[day + 1]);
      },
      trap: 'Direction slip',
      explanation: `${G01_WALK} The shortest round is Central at 6 km, on Tuesday. The day after is Wednesday, which is Zubin. Direction slip: Yamini works the day before, and Tanvi rides the shortest round itself.`,
    },
  ],
};

// ---------- G02: college fest slots ----------

const G02_VOLUNTEERS: Record<string, number> = { 'Art show': 6, Dance: 12, Debate: 5, Drama: 9, Music: 10, Quiz: 4 };

const volunteersOn = (s: GridSolution, day: string) =>
  sum(Object.keys(s).filter((event) => s[event].day === day).map((event) => G02_VOLUNTEERS[event]));

const G02_WALK =
  'Music is on Friday and Quiz shares its day, so Friday is full. Quiz is in the Auditorium, so Music is on the Lawn. ' +
  'Drama, Debate, Dance and Art show share Saturday and Sunday, and Debate is the day after Drama, so Drama is on Saturday and Debate on Sunday. ' +
  'Drama and Debate share a venue. The Lawn has only one slot left after Music and Dance, so they are both in the Auditorium. ' +
  'That leaves Dance and Art show on the Lawn, and Dance is earlier, so Dance is on Saturday and Art show on Sunday. ' +
  'Friday is Quiz and Music, Saturday is Drama and Dance, and Sunday is Debate and Art show, with the Auditorium event named first each day.';

export const G02: GridSetSpec = {
  id: 'G02',
  title: 'College fest slots',
  family: 'scheduling',
  topic: 'Scheduling',
  intro:
    'A college fest runs for three days: Friday, Saturday and Sunday. Each day has one evening slot, with one event in the Auditorium and one on the Lawn at the same hour. ' +
    'Six events fill the slots: Quiz, Music, Dance, Drama, Debate and Art show. Each event happens once. ' +
    'The table shows how many student volunteers each event needs.',
  table: {
    type: 'table',
    caption: 'Volunteers needed',
    columns: ['Event', 'Volunteers'],
    rows: Object.entries(G02_VOLUNTEERS),
  },
  items: ['Quiz', 'Music', 'Dance', 'Drama', 'Debate', 'Art show'],
  dimensions: [
    { name: 'day', values: ['Friday', 'Saturday', 'Sunday'], capacity: 2 },
    { name: 'venue', values: ['Auditorium', 'Lawn'], capacity: 3 },
  ],
  uniqueCells: true,
  clues: [
    { text: 'Debate is on the day after Drama.', clue: { kind: 'offset', a: 'Drama', b: 'Debate', dim: 'day', by: 1 } },
    { text: 'Quiz is in the Auditorium.', clue: { kind: 'is', item: 'Quiz', dim: 'venue', value: 'Auditorium' } },
    { text: 'Music is on Friday.', clue: { kind: 'is', item: 'Music', dim: 'day', value: 'Friday' } },
    { text: 'Drama and Debate are at the same venue.', clue: { kind: 'same', a: 'Drama', b: 'Debate', dim: 'venue' } },
    { text: 'Quiz and Music are on the same day.', clue: { kind: 'same', a: 'Quiz', b: 'Music', dim: 'day' } },
    { text: 'Dance is on an earlier day than Art show.', clue: { kind: 'earlier', a: 'Dance', b: 'Art show', dim: 'day' } },
    { text: 'Dance is on the Lawn.', clue: { kind: 'is', item: 'Dance', dim: 'venue', value: 'Lawn' } },
  ],
  questions: [
    {
      kind: 'mcq',
      subType: 'Slot lookup',
      prompt: 'Which event is on the Lawn on Sunday?',
      key: 'Art show',
      wrong: ['Debate', 'Dance', 'Drama'],
      check: (s) => only(Object.keys(s).filter((e) => s[e].day === 'Sunday' && s[e].venue === 'Lawn')),
      trap: 'Wrong venue slip',
      explanation: `${G02_WALK} So the Lawn on Sunday has Art show. Wrong venue slip: Debate is also on Sunday, but in the Auditorium.`,
    },
    {
      kind: 'tita',
      subType: 'Total from the table',
      prompt: 'How many volunteers are needed on Sunday in total? Enter a whole number.',
      key: '11',
      commonWrong: ['5', '21', '14'],
      check: (s) => String(volunteersOn(s, 'Sunday')),
      trap: 'Partial scope trap',
      explanation: `${G02_WALK} Sunday has Debate with 5 volunteers and Art show with 6, so the total is 11. Partial scope trap: counting only the Auditorium event gives 5. Each day has two events, so add both.`,
    },
    {
      kind: 'mcq',
      subType: 'Same slot',
      prompt: 'Which event runs at the same hour as Drama?',
      key: 'Dance',
      wrong: ['Debate', 'Art show', 'Music'],
      check: (s) => only(Object.keys(s).filter((e) => e !== 'Drama' && s[e].day === s.Drama.day)),
      trap: 'Same venue trap',
      explanation: `${G02_WALK} Drama is on Saturday, and the other Saturday event is Dance. Same venue trap: Debate shares a venue with Drama, but it is on a different day.`,
    },
    {
      kind: 'mcq',
      subType: 'What-if',
      prompt: "The organisers swap Music and Art show, so each takes the other's day and venue. How many volunteers does Friday need now?",
      key: '10',
      wrong: ['14', '16', '15'],
      check: (s) => {
        const after: GridSolution = { ...s, Music: s['Art show'], 'Art show': s.Music };
        return String(volunteersOn(after, 'Friday'));
      },
      trap: 'Stale position trap',
      explanation: `${G02_WALK} After the swap Friday has Quiz with 4 and Art show with 6, so it needs 10. Stale position trap: 14 is the Friday figure before the swap, and 16 adds Music and Art show together, though Music has left Friday.`,
    },
  ],
};

// ---------- T01: stationery shop sales ----------

export type ShopRow = { item: string; buying: number; selling: number; week1: number; week2: number };

/** Seed chosen so the top seller by units, by revenue and by profit are three different items. */
export const T01_SEED = 12167;

const T01_ITEMS: [string, number, number][] = [
  ['Notebook', 40, 60],
  ['Pen pack', 60, 90],
  ['Sketch pad', 80, 110],
  ['Geometry box', 100, 130],
  ['File folder', 20, 35],
];

export function generateShop(seed: number): ShopRow[] {
  const rand = mulberry32(seed);
  return T01_ITEMS.map(([item, lo, hi]) => {
    const buying = stepped(rand, lo, hi, 5);
    const selling = buying + stepped(rand, 15, 35, 5);
    const week1 = stepped(rand, 80, 200, 10);
    const week2 = week1 + stepped(rand, -40, 50, 10);
    return { item, buying, selling, week1, week2 };
  });
}

const revenue2 = (r: ShopRow) => r.selling * r.week2;
const margin = (r: ShopRow) => r.selling - r.buying;
const profitBoth = (r: ShopRow) => margin(r) * (r.week1 + r.week2);
const unitChange = (r: ShopRow) => r.week2 - r.week1;
const profitChange = (r: ShopRow) => margin(r) * unitChange(r);

function topBy<T>(xs: T[], score: (x: T) => number): T {
  return xs.reduce((a, b) => (score(b) > score(a) ? b : a));
}

/** Names of the rows by score, highest first, leaving out the given names. */
function rankNames<T extends { name: string }>(xs: T[], score: (x: T) => number, leaveOut: string[]): string[] {
  return xs
    .filter((x) => !leaveOut.includes(x.name))
    .sort((a, b) => score(b) - score(a))
    .map((x) => x.name);
}

const shopNamed = (rows: ShopRow[]) => rows.map((r) => ({ ...r, name: r.item }));
const row = (rows: ShopRow[], item: string) => rows.find((r) => r.item === item) as ShopRow;

const signed = (n: number) => (n < 0 ? `−${rupees(-n)}` : `+${rupees(n)}`);
/** A whole number with a proper minus sign, for explanations. */
const whole = (n: number) => (n < 0 ? `−${-n}` : String(n));

const SHOP_DATA = generateShop(T01_SEED);

const shopWrongSecond = (d: ShopRow[], answer: string, trap: string, score: (r: ShopRow) => number): [string, string, string] => {
  const [a, b] = rankNames(shopNamed(d), score, [answer, trap]);
  return [trap, a, b];
};

export const T01: DiSetSpec<ShopRow[]> = {
  id: 'T01',
  title: 'Stationery shop sales',
  family: 'di-table',
  topic: 'Data tables',
  data: SHOP_DATA,
  stimulus: [
    {
      type: 'text',
      text:
        'A small stationery shop tracks five items over two weeks. Prices stayed the same in both weeks. ' +
        'Revenue is selling price times units sold. Profit is selling price minus buying price, times units sold.',
    },
    {
      type: 'table',
      caption: 'Prices are in rupees per unit',
      columns: ['Item', 'Buying price (₹)', 'Selling price (₹)', 'Week 1 units sold', 'Week 2 units sold'],
      rows: SHOP_DATA.map((r) => [r.item, r.buying, r.selling, r.week1, r.week2]),
    },
  ],
  questions: [
    {
      kind: 'mcq',
      subType: 'Revenue comparison',
      steps: 6, // 5 multiplications, 1 comparison
      prompt: 'Which item brought in the most revenue in Week 2?',
      key: 'Pen pack',
      compute: (d) => topBy(d, revenue2).item,
      wrong: (d) => shopWrongSecond(d, topBy(d, revenue2).item, topBy(d, (r) => r.week2).item, revenue2),
      trap: 'Volume trap',
      explanation: (d) => {
        const lines = d.map((r) => `${r.item} ${r.selling} × ${r.week2} = ${rupees(revenue2(r))}`).join(', ');
        const top = topBy(d, revenue2);
        const most = topBy(d, (r) => r.week2);
        return `Revenue is selling price times units, so work out each item for Week 2: ${lines}. The highest is ${top.item} at ${rupees(revenue2(top))}. Volume trap: ${most.item} sold the most units (${most.week2}), but at ₹${most.selling} each it earns only ${rupees(revenue2(most))}.`;
      },
    },
    {
      kind: 'tita',
      subType: 'Total',
      steps: 9, // 5 multiplications, 4 additions
      prompt: "What was the shop's total revenue in Week 1, in rupees? Enter the number only.",
      key: '67550',
      compute: (d) => String(sum(d.map((r) => r.selling * r.week1))),
      commonWrong: (d) => [
        String(sum(d.map(revenue2))),
        String(sum(d.map((r) => r.buying * r.week1))),
        String(sum(d.slice(0, -1).map((r) => r.selling * r.week1))),
      ],
      trap: 'Wrong column trap',
      explanation: (d) => {
        const lines = d.map((r) => `${r.item} ${r.selling} × ${r.week1} = ${rupees(r.selling * r.week1)}`).join(', ');
        return `Multiply selling price by Week 1 units for each item: ${lines}. Adding these gives ${rupees(sum(d.map((r) => r.selling * r.week1)))}. Wrong column trap: using Week 2 units gives ${rupees(sum(d.map(revenue2)))}, and using the buying price gives ${rupees(sum(d.map((r) => r.buying * r.week1)))}.`;
      },
    },
    {
      kind: 'tita',
      subType: 'Percentage change',
      steps: 2, // 1 subtraction, 1 division
      prompt: 'By what percent did the revenue from the Geometry box rise from Week 1 to Week 2? Give your answer to one decimal place.',
      key: '37.5',
      compute: (d) => {
        const r = row(d, 'Geometry box');
        return oneDecimal(((r.week2 - r.week1) / r.week1) * 100);
      },
      commonWrong: (d) => {
        const r = row(d, 'Geometry box');
        return [oneDecimal(((r.week2 - r.week1) / r.week2) * 100), String(r.week2 - r.week1), oneDecimal((r.week2 / r.week1) * 100)];
      },
      trap: 'Base change trap',
      explanation: (d) => {
        const r = row(d, 'Geometry box');
        const a = r.selling * r.week1;
        const b = r.selling * r.week2;
        return `The Geometry box earned ${r.selling} × ${r.week1} = ${rupees(a)} in Week 1 and ${r.selling} × ${r.week2} = ${rupees(b)} in Week 2. The rise is ${rupees(b - a)}, and a rise from Week 1 is measured against Week 1: ${b - a} ÷ ${a} = ${oneDecimal(((b - a) / a) * 100)}%. Since the price did not change, the units give the same result: ${r.week2 - r.week1} ÷ ${r.week1}. Base change trap: dividing by the Week 2 figure gives ${oneDecimal(((b - a) / b) * 100)}%, which measures against the wrong week.`;
      },
    },
    {
      kind: 'mcq',
      subType: 'Profit comparison',
      steps: 16, // 5 subtractions, 5 additions, 5 multiplications, 1 comparison
      prompt: 'Which item made the most profit over the two weeks together?',
      key: 'Notebook',
      compute: (d) => topBy(d, profitBoth).item,
      wrong: (d) => shopWrongSecond(d, topBy(d, profitBoth).item, topBy(d, margin).item, profitBoth),
      trap: 'Margin trap',
      explanation: (d) => {
        const lines = d.map((r) => `${r.item} ${margin(r)} × ${r.week1 + r.week2} = ${rupees(profitBoth(r))}`).join(', ');
        const top = topBy(d, profitBoth);
        const wide = topBy(d, margin);
        return `Profit per unit is selling price minus buying price, and the units are the two weeks added. That gives ${lines}. The highest is ${top.item} at ${rupees(profitBoth(top))}. Margin trap: ${wide.item} has the largest profit per unit (₹${margin(wide)}), but it sold only ${wide.week1 + wide.week2} units, so it totals ${rupees(profitBoth(wide))}.`;
      },
    },
    {
      kind: 'mcq',
      subType: 'Change in profit',
      steps: 11, // 4 unit changes, 4 multiplications using margins already found, 3 additions
      prompt: "By how much did the shop's total profit rise from Week 1 to Week 2?",
      key: '₹800',
      compute: (d) => rupees(sum(d.map(profitChange))),
      wrong: (d) => [
        rupees(sum(d.map(profitChange).filter((x) => x > 0))),
        rupees(sum(d.map(revenue2)) - sum(d.map((r) => r.selling * r.week1))),
        rupees(-sum(d.map(profitChange).filter((x) => x < 0))),
      ],
      trap: 'Partial scope trap',
      explanation: (d) => {
        const moved = d.filter((r) => unitChange(r) !== 0);
        const lines = moved.map((r) => `${r.item} ${whole(unitChange(r))} × ${margin(r)} = ${signed(profitChange(r))}`).join(', ');
        const gains = sum(d.map(profitChange).filter((x) => x > 0));
        return `Profit changes only where units change, so multiply each change in units by that item's profit per unit: ${lines}. The rest did not move. These add up to ${signed(sum(d.map(profitChange)))}. Partial scope trap: adding only the items that rose gives ${rupees(gains)}, which ignores the items that fell. The rise in revenue, ${rupees(sum(d.map(revenue2)) - sum(d.map((r) => r.selling * r.week1)))}, is a different measure.`;
      },
    },
  ],
};

// ---------- C01: gym sign-ups ----------

export type GymData = { startMembers: number; months: string[]; signups: number[]; cancellations: number[] };

/** Seed chosen so the best month for sign-ups, for net gain and for percent rise all differ. */
export const C01_SEED = 64869;

const C01_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June'];

export function generateGym(seed: number): GymData {
  const rand = mulberry32(seed);
  const signups = C01_MONTHS.map(() => stepped(rand, 30, 80, 5));
  const cancellations = C01_MONTHS.map(() => stepped(rand, 15, 50, 5));
  return { startMembers: 240, months: C01_MONTHS, signups, cancellations };
}

const net = (d: GymData, i: number) => d.signups[i] - d.cancellations[i];
const monthIndex = (d: GymData, month: string) => d.months.indexOf(month);
/** Members at the end of month i. */
const membersAfter = (d: GymData, i: number) => d.startMembers + sum(d.months.slice(0, i + 1).map((_, k) => net(d, k)));

const monthsRanked = (d: GymData, from: number, score: (i: number) => number, leaveOut: string[]) =>
  rankNames(
    d.months.map((name, i) => ({ name, i })).slice(from),
    (m) => score(m.i),
    leaveOut,
  );

/** Change in sign-ups from the month before. */
const signupRise = (d: GymData, i: number) => d.signups[i] - d.signups[i - 1];
const signupRisePct = (d: GymData, i: number) => (signupRise(d, i) / d.signups[i - 1]) * 100;

const GYM_DATA = generateGym(C01_SEED);

export const C01: DiSetSpec<GymData> = {
  id: 'C01',
  title: 'Gym sign-ups',
  family: 'di-chart',
  topic: 'Data charts',
  data: GYM_DATA,
  stimulus: [
    {
      type: 'text',
      text:
        `A neighbourhood gym keeps a simple monthly record. The chart shows how many people joined (new sign-ups) and how many left (cancellations) each month from January to June. ` +
        `The gym had ${GYM_DATA.startMembers} members at the start of January. Every bar is a multiple of 5.`,
    },
    {
      type: 'bars',
      caption: 'New sign-ups and cancellations by month',
      unit: 'members',
      categories: GYM_DATA.months,
      series: [
        { name: 'New sign-ups', values: GYM_DATA.signups },
        { name: 'Cancellations', values: GYM_DATA.cancellations },
      ],
    },
  ],
  questions: [
    {
      kind: 'mcq',
      subType: 'Net change',
      steps: 7, // 6 subtractions, 1 comparison
      prompt: "In which month did the gym's membership grow the most, after counting cancellations?",
      key: 'June',
      compute: (d) => monthsRanked(d, 0, (i) => net(d, i), [])[0],
      wrong: (d) => {
        const answer = monthsRanked(d, 0, (i) => net(d, i), [])[0];
        const trap = monthsRanked(d, 0, (i) => d.signups[i], [])[0];
        const [a, b] = monthsRanked(d, 0, (i) => net(d, i), [answer, trap]);
        return [trap, a, b];
      },
      trap: 'Partial scope trap',
      explanation: (d) => {
        const lines = d.months.map((m, i) => `${m} ${d.signups[i]} − ${d.cancellations[i]} = ${whole(net(d, i))}`).join(', ');
        const best = monthsRanked(d, 0, (i) => net(d, i), [])[0];
        const most = monthsRanked(d, 0, (i) => d.signups[i], [])[0];
        const m = monthIndex(d, most);
        return `Growth is sign-ups minus cancellations: ${lines}. The largest is ${best} at ${net(d, monthIndex(d, best))}. Partial scope trap: ${most} has the tallest sign-up bar (${d.signups[m]}), but looking at one series alone misses its ${d.cancellations[m]} cancellations.`;
      },
    },
    {
      kind: 'tita',
      subType: 'Running total',
      steps: 8, // 4 subtractions, 4 additions
      prompt: 'How many members did the gym have at the end of April? Enter a whole number.',
      key: '265',
      compute: (d) => String(membersAfter(d, monthIndex(d, 'April'))),
      commonWrong: (d) => {
        const april = monthIndex(d, 'April');
        return [
          String(d.startMembers + sum(d.signups.slice(0, april + 1))),
          String(membersAfter(d, april - 1)),
          String(membersAfter(d, april) - d.startMembers),
        ];
      },
      trap: 'Partial scope trap',
      explanation: (d) => {
        const april = monthIndex(d, 'April');
        const lines = d.months.slice(0, april + 1).map((m, i) => `${m} ${whole(net(d, i))}`).join(', ');
        return `Start from ${d.startMembers} and apply each month's net change: ${lines}. That gives ${membersAfter(d, april)} at the end of April. Partial scope trap: adding sign-ups alone gives ${d.startMembers + sum(d.signups.slice(0, april + 1))}, and stopping a month early gives ${membersAfter(d, april - 1)}. Every month up to April counts, and so do both series.`;
      },
    },
    {
      kind: 'tita',
      subType: 'Percent of a running total',
      steps: 1, // 1 division, using the end of April figure already found
      prompt: "May's cancellations were what percent of the members the gym had at the start of May? Give your answer to one decimal place.",
      key: '11.3',
      compute: (d) => {
        const may = monthIndex(d, 'May');
        return oneDecimal((d.cancellations[may] / membersAfter(d, may - 1)) * 100);
      },
      commonWrong: (d) => {
        const may = monthIndex(d, 'May');
        const c = d.cancellations[may];
        return [oneDecimal((c / membersAfter(d, may)) * 100), oneDecimal((c / d.signups[may]) * 100), oneDecimal((net(d, may) / membersAfter(d, may - 1)) * 100)];
      },
      trap: 'Base change trap',
      explanation: (d) => {
        const may = monthIndex(d, 'May');
        const c = d.cancellations[may];
        const start = membersAfter(d, may - 1);
        return `Members at the start of May are the same as at the end of April: ${start}. May's cancellations are ${c}, and ${c} ÷ ${start} = ${oneDecimal((c / start) * 100)}%, to one decimal place. Base change trap: dividing by the end of May figure, ${membersAfter(d, may)}, gives ${oneDecimal((c / membersAfter(d, may)) * 100)}%, and dividing by May's sign-ups gives ${oneDecimal((c / d.signups[may]) * 100)}%. The question fixes the base as the start of May.`;
      },
    },
    {
      kind: 'mcq',
      subType: 'Percentage change',
      steps: 7, // the 3 months that rose: 3 subtractions, 3 divisions, 1 comparison
      prompt: 'Compared with the month before, in which month did new sign-ups rise by the largest percent?',
      key: 'February',
      compute: (d) => monthsRanked(d, 1, (i) => signupRisePct(d, i), [])[0],
      wrong: (d) => {
        const answer = monthsRanked(d, 1, (i) => signupRisePct(d, i), [])[0];
        const trap = monthsRanked(d, 1, (i) => signupRise(d, i), [])[0];
        const [a, b] = monthsRanked(d, 1, (i) => signupRisePct(d, i), [answer, trap]);
        return [trap, a, b];
      },
      trap: 'Base change trap',
      explanation: (d) => {
        const rising = d.months.map((_, i) => i).slice(1).filter((i) => signupRise(d, i) > 0);
        const lines = rising.map((i) => `${d.months[i]} ${d.signups[i - 1]} to ${d.signups[i]}, a rise of ${signupRise(d, i)}, or ${oneDecimal(signupRisePct(d, i))}%`).join('; ');
        const best = monthsRanked(d, 1, (i) => signupRisePct(d, i), [])[0];
        const trap = monthsRanked(d, 1, (i) => signupRise(d, i), [])[0];
        return `Only the months where sign-ups went up can win: ${lines}. The largest percent is ${best}. Base change trap: ${trap} has the biggest rise in members, but it starts from a larger base, so its percent is smaller.`;
      },
    },
  ],
};

// ---------- Assembly ----------

/** Stable option position from the id, so the answer is not always in the same place. */
function positionFor(id: string): number {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 4;
}

type Built = {
  id: string;
  rating: { difficulty: Difficulty; expectedMinutes: number };
  set: SetHead;
  groupLesson: LessonRef;
};

/** Everything a built question needs, however its answer was produced. */
type Plain = QuestionText & { explanation: string } & (
    | { kind: 'mcq'; answer: string; wrong: [string, string, string] }
    | { kind: 'tita'; answer: string; commonWrong: [string, string, string] }
  );

function buildQuestions(b: Built, plain: Plain[]): Question[] {
  const expectedSeconds = Math.round((b.rating.expectedMinutes * 60) / plain.length);
  return plain.map((q, i) => {
    const id = `${b.id}-${i + 1}`;
    const base = {
      id,
      section: 'DILR' as const,
      topic: b.set.topic,
      subType: q.subType,
      difficulty: b.rating.difficulty,
      expectedSeconds,
      prompt: q.prompt,
      explanation: q.explanation,
      trap: q.trap,
      lessonRef: b.groupLesson,
      groupId: b.id,
    };
    if (q.kind === 'tita') return { ...base, kind: 'tita', answer: q.answer, commonWrong: [...q.commonWrong] };
    const options: string[] = [...q.wrong];
    const answerIndex = positionFor(id);
    options.splice(answerIndex, 0, q.answer);
    return { ...base, kind: 'mcq', options, answerIndex, trapIndex: options.indexOf(q.wrong[0]) };
  });
}

function toSet(b: Built, effort: DilrSet['effort'], stimulus: StimulusBlock[], questions: Question[]): DilrSet {
  return {
    id: b.id,
    kind: 'set',
    section: 'DILR',
    title: b.set.title,
    family: b.set.family,
    topic: b.set.topic,
    difficulty: b.rating.difficulty,
    expectedMinutes: b.rating.expectedMinutes,
    effort,
    stimulus,
    questionIds: questions.map((q) => q.id),
  };
}

const SOLVER_LESSON: LessonRef = { lessonId: 'dilr-set-choice', seconds: 60 };
const DI_LESSON: LessonRef = { lessonId: 'di-tables', seconds: 60 };

function plainFromSolver<S>(q: SolverQuestion<S>): Plain {
  const { subType, prompt, trap, explanation } = q;
  const text = { subType, prompt, trap, explanation };
  return q.kind === 'mcq'
    ? { ...text, kind: 'mcq', answer: q.key, wrong: q.wrong }
    : { ...text, kind: 'tita', answer: q.key, commonWrong: q.commonWrong };
}

function buildLinear(s: LinearSetSpec) {
  const nodes = linearSearchNodes(s.people, s.clues.map((c) => c.clue));
  const b: Built = { id: s.id, rating: ratingFromNodes(nodes), set: s, groupLesson: SOLVER_LESSON };
  const questions = buildQuestions(b, s.questions.map(plainFromSolver));
  const stimulus: StimulusBlock[] = [
    { type: 'text', text: s.intro },
    { type: 'list', items: s.clues.map((c) => c.text) },
  ];
  return { set: toSet(b, { measure: 'search nodes', value: nodes }, stimulus, questions), questions };
}

function buildGrid(s: GridSetSpec) {
  const nodes = gridSearchNodes(gridProblem(s));
  const b: Built = { id: s.id, rating: ratingFromNodes(nodes), set: s, groupLesson: SOLVER_LESSON };
  const questions = buildQuestions(b, s.questions.map(plainFromSolver));
  const stimulus: StimulusBlock[] = [
    { type: 'text', text: s.intro },
    s.table,
    { type: 'list', items: s.clues.map((c) => c.text) },
  ];
  return { set: toSet(b, { measure: 'search nodes', value: nodes }, stimulus, questions), questions };
}

function buildDi<D>(s: DiSetSpec<D>) {
  const steps = sum(s.questions.map((q) => q.steps));
  const b: Built = { id: s.id, rating: ratingFromSteps(steps), set: s, groupLesson: DI_LESSON };
  const plain = s.questions.map((q): Plain => {
    const text = { subType: q.subType, prompt: q.prompt, trap: q.trap, explanation: q.explanation(s.data) };
    const answer = q.compute(s.data);
    return q.kind === 'mcq'
      ? { ...text, kind: 'mcq', answer, wrong: q.wrong(s.data) }
      : { ...text, kind: 'tita', answer, commonWrong: q.commonWrong(s.data) };
  });
  const questions = buildQuestions(b, plain);
  return { set: toSet(b, { measure: 'calculation steps', value: steps }, s.stimulus, questions), questions };
}

export const LINEAR_SPECS: LinearSetSpec[] = [L01, L02];
export const GRID_SPECS: GridSetSpec[] = [G01, G02];

const built = [buildLinear(L01), buildLinear(L02), buildDi(T01), buildDi(C01), buildGrid(G01), buildGrid(G02)];

export const NEW_SETS: DilrSet[] = built.map((b) => b.set);
export const NEW_QUESTIONS: Question[] = built.flatMap((b) => b.questions);
