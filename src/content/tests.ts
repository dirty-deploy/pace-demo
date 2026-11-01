import type { TestDef, TestSection } from '../state/schema';
import { DILR_SETS, getQuestion, PASSAGES, QA_BANK, VARC_QUESTIONS } from './index';
import type { DilrSet, Difficulty, Question, Section } from './types';

export const SECTION_NAMES: Record<Section, string> = {
  VARC: 'Verbal Ability and Reading Comprehension',
  DILR: 'Data Interpretation and Logical Reasoning',
  QA: 'Quantitative Aptitude',
};

const verbal = (topic: string) => VARC_QUESTIONS.filter((q) => q.topic === topic).map((q) => q.id);
const PJ = verbal('Para-jumbles');
const PS = verbal('Para-summary');
const OS = verbal('Odd sentence out');
const rc = (...nums: number[]) => nums.flatMap((n) => PASSAGES[n - 1].questionIds);

/** Reference: S sets by rising difficulty, so each mock and sectional gets a spread. */
const seating = DILR_SETS.filter((s) => s.family === 'circular-seating').sort((a, b) => a.effort.value - b.effort.value);
const pick = (id: string): DilrSet => DILR_SETS.find((s) => s.id === id) as DilrSet;
const ids = (sets: DilrSet[]) => sets.flatMap((s) => s.questionIds);

// QA: walk each topic so both mocks cover the syllabus, and leftovers go to the sectionals.
const qaByTopic = new Map<string, Question[]>();
for (const q of QA_BANK) qaByTopic.set(q.topic, [...(qaByTopic.get(q.topic) ?? []), q]);
const round = [...qaByTopic.values()].flatMap((list) => list.map((q, i) => ({ q, i }))).sort((a, b) => a.i - b.i);
const qaMock1 = round.filter((_, i) => i % 2 === 0).slice(0, 22).map((r) => r.q.id);
const qaMock2 = round.filter((_, i) => i % 2 === 1).slice(0, 22).map((r) => r.q.id);
const qaLeft = QA_BANK.map((q) => q.id).filter((id) => !qaMock1.includes(id) && !qaMock2.includes(id));

const section = (s: Section, questionIds: string[], minutes: number | null = 40): TestSection => ({ section: s, name: SECTION_NAMES[s], minutes, questionIds });

const mock = (n: 1 | 2, varc: string[], dilr: string[], qa: string[]): TestDef => ({
  id: `mock-${n}`,
  type: 'mock',
  name: `Full mock ${n}`,
  mode: 'exam',
  capped: false,
  sections: [section('VARC', varc), section('DILR', dilr), section('QA', qa)],
});

export const MOCKS: TestDef[] = [
  mock(
    1,
    [...rc(1, 2, 3), ...PJ.slice(0, 5), ...PS.slice(0, 4), ...OS.slice(0, 3)],
    ids([pick('L01'), pick('T01'), pick('G01'), seating[1], seating[7], seating[13]]),
    qaMock1,
  ),
  mock(
    2,
    [...rc(4, 5, 6), ...PJ.slice(5, 10), ...PS.slice(4, 8), ...OS.slice(3, 6)],
    ids([pick('L02'), pick('C01'), pick('G02'), seating[2], seating[8], seating[14]]),
    qaMock2,
  ),
];

const sectional = (s: Section, n: number, questionIds: string[]): TestDef => ({
  id: `sec-${s.toLowerCase()}-${n}`,
  type: 'sectional',
  name: `${s} sectional ${n}`,
  mode: 'practice',
  capped: s === 'DILR',
  sections: [section(s, questionIds)],
});

const qaWrap = (from: number) => {
  const all = QA_BANK.map((q) => q.id);
  return Array.from({ length: 22 }, (_, i) => all[(from + i * 3) % all.length]);
};

export const SECTIONALS: TestDef[] = [
  sectional('VARC', 1, [...rc(1, 4, 5), ...PJ.slice(0, 4), ...PS.slice(0, 4), ...OS.slice(0, 4)]),
  sectional('VARC', 2, [...rc(2, 3, 6), ...PJ.slice(4, 8), ...PS.slice(2, 6), ...OS.slice(2, 6)]),
  sectional('VARC', 3, [...rc(3, 5, 6), ...PJ.slice(6, 10), ...PS.slice(4, 8), ...OS.slice(0, 2), ...OS.slice(4, 6)]),
  sectional('DILR', 1, ids([pick('C01'), pick('L01'), seating[0], seating[3], seating[6], seating[9], seating[12]])),
  sectional('DILR', 2, ids([pick('G01'), pick('L02'), seating[4], seating[5], seating[10], seating[11], seating[1]])),
  sectional('DILR', 3, ids([pick('T01'), pick('G02'), seating[0], seating[2], seating[5], seating[8], seating[14]])),
  sectional('QA', 1, qaLeft.slice(0, 22)),
  sectional('QA', 2, [...qaLeft.slice(22), ...qaWrap(0)].slice(0, 22)),
  sectional('QA', 3, qaWrap(11)),
];

const topicTest = (slug: string, name: string, s: Section, questionIds: string[]): TestDef => ({
  id: `topic-${slug}`,
  type: 'topic',
  name,
  mode: 'practice',
  capped: s === 'DILR',
  sections: [section(s, questionIds.slice(0, 8), 15)],
});

const qaTopics = (...topics: string[]) => QA_BANK.filter((q) => topics.includes(q.topic)).map((q) => q.id);

export const TOPIC_TESTS: TestDef[] = [
  topicTest('rc', 'Reading comprehension', 'VARC', rc(1, 2)),
  topicTest('pj', 'Para-jumbles', 'VARC', PJ.slice(0, 6)),
  topicTest('ps', 'Para-summary', 'VARC', PS.slice(0, 6)),
  topicTest('os', 'Odd sentence out', 'VARC', OS),
  topicTest('seating', 'Circular seating', 'DILR', ids([seating[1], seating[7]])),
  topicTest('linear', 'Linear arrangement', 'DILR', ids([pick('L01'), pick('L02')])),
  topicTest('di', 'Data tables and charts', 'DILR', ids([pick('T01'), pick('C01')])),
  topicTest('schedule', 'Scheduling', 'DILR', ids([pick('G01'), pick('G02')])),
  topicTest('percentages', 'Percentages', 'QA', qaTopics('Percentages')),
  topicTest('profit', 'Profit and loss', 'QA', qaTopics('Profit and loss')),
  topicTest('time-work', 'Time and work', 'QA', qaTopics('Time and work')),
  topicTest('tsd', 'Time speed distance', 'QA', qaTopics('Time speed distance')),
  topicTest('ratio', 'Ratio and mixtures', 'QA', qaTopics('Ratio and proportion', 'Mixtures and alligation')),
  topicTest('interest', 'Interest and averages', 'QA', qaTopics('Simple and compound interest', 'Averages')),
  topicTest('equations', 'Equations and inequalities', 'QA', qaTopics('Equations', 'Inequalities')),
  topicTest('functions', 'Progressions and functions', 'QA', qaTopics('Progressions', 'Functions')),
  topicTest('geometry', 'Geometry and mensuration', 'QA', qaTopics('Geometry', 'Mensuration')),
  topicTest('numbers', 'Number systems', 'QA', qaTopics('Number systems')),
  topicTest('modern', 'Modern maths', 'QA', qaTopics('Permutations and combinations', 'Probability', 'Set theory')),
];

export const ALL_TESTS: TestDef[] = [...MOCKS, ...SECTIONALS, ...TOPIC_TESTS];

export const getTest = (id: string): TestDef | undefined => ALL_TESTS.find((t) => t.id === id);

export function testQuestions(def: TestDef): string[] {
  return def.sections.flatMap((s) => s.questionIds);
}

/** The most common difficulty in a test. */
export function testDifficulty(def: TestDef): Difficulty {
  const counts: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };
  for (const id of testQuestions(def)) counts[getQuestion(id).difficulty]++;
  return (Object.entries(counts) as [Difficulty, number][]).sort((a, b) => b[1] - a[1])[0][0];
}

export const testMinutes = (def: TestDef) => def.sections.reduce((a, s) => a + (s.minutes ?? 0), 0);
