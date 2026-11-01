import type { Difficulty, LessonRef, McqQuestion, TitaQuestion } from './types';

type Params = Record<string, number>;

type QaCommon<P extends Params> = {
  id: string;
  topic: string;
  subType: string;
  difficulty: Difficulty;
  expectedSeconds: number;
  /** The numbers in the question. prompt, solve and explanation all read from these. */
  params: P;
  prompt: (p: P) => string;
  /** Computes the answer from params. This is what the test recomputes. */
  solve: (p: P) => number;
  /** The answer key written by hand. The test checks solve(params) === key. */
  key: number;
  /** How a value is shown, for example (n) => `₹${n}`. Defaults to String(n). */
  format?: (n: number) => string;
  explanation: (p: P) => string;
  trap: string;
  lessonRef?: LessonRef;
};

export type QaMcqSpec<P extends Params> = QaCommon<P> & {
  kind: 'mcq';
  /** Three wrong numeric values. The most tempting one goes first: it becomes the trap option. */
  wrong: [number, number, number];
};

export type QaTitaSpec<P extends Params> = QaCommon<P> & {
  kind: 'tita';
  /** Three wrong values a student would plausibly type, most common first. */
  commonWrong: [number, number, number];
};

export type QaSpec<P extends Params> = QaMcqSpec<P> | QaTitaSpec<P>;

export type QaQuestion = (McqQuestion | TitaQuestion) & {
  /** Recomputes the answer from the stored parameters. */
  recompute: () => number;
  key: number;
};

/** Stable option position from the id, so the answer is not always in the same place. */
function positionFor(id: string): number {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 4;
}

export function defineQa<P extends Params>(s: QaSpec<P>): QaQuestion {
  const fmt = s.format ?? ((n: number) => String(n));
  const base = {
    id: s.id,
    section: 'QA' as const,
    topic: s.topic,
    subType: s.subType,
    difficulty: s.difficulty,
    expectedSeconds: s.expectedSeconds,
    prompt: s.prompt(s.params),
    explanation: s.explanation(s.params),
    trap: s.trap,
    lessonRef: s.lessonRef,
    recompute: () => s.solve(s.params),
    key: s.key,
  };
  if (s.kind === 'tita') {
    return { ...base, kind: 'tita', answer: String(s.key), commonWrong: s.commonWrong.map(String) };
  }
  const pos = positionFor(s.id);
  const options = s.wrong.map(fmt);
  options.splice(pos, 0, fmt(s.key));
  const trapText = fmt(s.wrong[0]);
  return { ...base, kind: 'mcq', options, answerIndex: pos, trapIndex: options.indexOf(trapText) };
}
