import type { Question } from '../content/types';

export const MARKS = { correct: 3, wrongMcq: -1, wrongTita: 0, skipped: 0 } as const;

/** Normalise a typed number: trims, and treats "12.50" and "12.5" as the same value. */
export function normaliseTita(text: string): string {
  const t = text.trim();
  if (/^-?\d*\.?\d+$/.test(t)) return String(Number(t));
  return t;
}

/** For MCQ, `answer` is the option index as a string. Empty or null counts as not answered. */
export function isAnswered(answer: string | null | undefined): answer is string {
  return answer !== null && answer !== undefined && answer.trim() !== '';
}

export function isCorrect(q: Question, answer: string | null | undefined): boolean | null {
  if (!isAnswered(answer)) return null;
  if (q.kind === 'mcq') return Number(answer) === q.answerIndex;
  // Sentence sequences are exact digit strings, so they are not compared as numbers.
  if (q.sentences) return answer.trim() === q.answer;
  return normaliseTita(answer) === normaliseTita(q.answer);
}

export function marksFor(q: Question, answer: string | null | undefined): number {
  const c = isCorrect(q, answer);
  if (c === null) return MARKS.skipped;
  if (c) return MARKS.correct;
  return q.kind === 'mcq' ? MARKS.wrongMcq : MARKS.wrongTita;
}

export type ScoreLine = {
  score: number;
  max: number;
  correct: number;
  wrong: number;
  skipped: number;
  attempted: number;
  accuracy: number | null;
};

export function scoreLine(items: { q: Question; answer: string | null | undefined }[]): ScoreLine {
  let score = 0;
  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  for (const { q, answer } of items) {
    score += marksFor(q, answer);
    const c = isCorrect(q, answer);
    if (c === null) skipped++;
    else if (c) correct++;
    else wrong++;
  }
  const attempted = correct + wrong;
  return { score, max: items.length * MARKS.correct, correct, wrong, skipped, attempted, accuracy: attempted ? correct / attempted : null };
}
