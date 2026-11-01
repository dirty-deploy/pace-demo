import type { McqQuestion, Question, TitaQuestion } from '../content/types';
import { seededRandom } from './rng';

/** Sample data only. Correct-share ranges by difficulty; together they span 25 to 70%. */
const CORRECT_RANGE: Record<string, [number, number]> = {
  Easy: [50, 70],
  Medium: [35, 55],
  Hard: [25, 40],
};

export type OptionDistribution = {
  kind: 'mcq';
  attempts: number;
  percents: number[];
  correctPercent: number;
};

export type TitaDistribution = {
  kind: 'tita';
  attempts: number;
  correctPercent: number;
  wrong: { value: string; percent: number }[];
};

export type Distribution = OptionDistribution | TitaDistribution;

/** Whole percentages that sum to exactly 100 (largest remainder). */
export function toPercents(counts: number[]): number[] {
  const total = counts.reduce((a, b) => a + b, 0);
  if (!total) return counts.map(() => 0);
  const raw = counts.map((c) => (c * 100) / total);
  const floors = raw.map(Math.floor);
  let left = 100 - floors.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  for (const [, i] of order) {
    if (left <= 0) break;
    floors[i]++;
    left--;
  }
  return floors;
}

function baseCounts(q: McqQuestion): number[] {
  const rand = seededRandom(`dist:${q.id}`);
  const attempts = 300 + Math.floor(rand() * 2100);
  const [lo, hi] = CORRECT_RANGE[q.difficulty];
  const correctShare = (lo + rand() * (hi - lo)) / 100;
  const wrongShare = 1 - correctShare;
  // The main trap takes 45 to 60% of the wrong answers; the other two share the rest.
  const trapShare = wrongShare * (0.45 + rand() * 0.15);
  const rest = wrongShare - trapShare;
  const split = 0.35 + rand() * 0.3;
  const others = [rest * split, rest * (1 - split)];
  return q.options.map((_, i) => {
    if (i === q.answerIndex) return Math.round(correctShare * attempts);
    if (i === q.trapIndex) return Math.round(trapShare * attempts);
    return Math.round((others.shift() as number) * attempts);
  });
}

export function mcqDistribution(q: McqQuestion, studentIndex?: number | null): OptionDistribution {
  const counts = baseCounts(q);
  if (studentIndex !== null && studentIndex !== undefined && studentIndex >= 0) counts[studentIndex]++;
  const attempts = counts.reduce((a, b) => a + b, 0);
  const percents = toPercents(counts);
  return { kind: 'mcq', attempts, percents, correctPercent: percents[q.answerIndex] };
}

export function titaDistribution(q: TitaQuestion, studentCorrect?: boolean | null): TitaDistribution {
  const rand = seededRandom(`dist:${q.id}`);
  const attempts = 300 + Math.floor(rand() * 2100);
  const [lo, hi] = CORRECT_RANGE[q.difficulty];
  // Typed answers are a little harder to land than picked ones.
  const share = Math.max(25, lo + rand() * (hi - lo) - 5) / 100;
  let correct = Math.round(attempts * share);
  let total = attempts;
  if (studentCorrect !== null && studentCorrect !== undefined) {
    total++;
    if (studentCorrect) correct++;
  }
  const wrongTotal = 1 - correct / total;
  const shares = [wrongTotal * (0.32 + rand() * 0.1), wrongTotal * (0.16 + rand() * 0.08), wrongTotal * (0.06 + rand() * 0.06)];
  return {
    kind: 'tita',
    attempts: total,
    correctPercent: Math.round((correct / total) * 100),
    wrong: q.commonWrong.slice(0, 3).map((value, i) => ({ value, percent: Math.round(shares[i] * 100) })),
  };
}

export function distributionFor(q: Question, answer: string | null | undefined, correct: boolean | null): Distribution {
  if (q.kind === 'mcq') {
    const chose = answer !== null && answer !== undefined && answer !== '';
    return mcqDistribution(q, chose ? Number(answer) : null);
  }
  return titaDistribution(q, correct);
}
