import type { Difficulty, Question } from '../content/types';
import { daysBetween, parseISO } from './dates';
import { seededRandom, shuffled } from './rng';

export type Mix = { Easy: number; Medium: number; Hard: number };

export type DailyConfig = {
  count: number;
  /** null means no time limit. */
  minutes: number | null;
  /** 'match' uses the student's accuracy. */
  mix: Mix | 'match';
  /** Empty means every topic. */
  topics: string[];
};

export const BALANCED: Mix = { Easy: 30, Medium: 40, Hard: 30 };
export const REPEAT_WINDOW_DAYS = 7;
export const MATCH_MIN_ATTEMPTS = 5;

/** Uses accuracy once there are at least 5 attempts; before that the mix is balanced. */
export function matchMix(attempted: number, accuracy: number | null): Mix {
  if (attempted < MATCH_MIN_ATTEMPTS || accuracy === null) return BALANCED;
  if (accuracy < 0.5) return { Easy: 50, Medium: 40, Hard: 10 };
  if (accuracy < 0.75) return { Easy: 25, Medium: 50, Hard: 25 };
  return { Easy: 10, Medium: 40, Hard: 50 };
}

/** Whole question counts per difficulty that add up to `count`. */
export function quota(mix: Mix, count: number): Record<Difficulty, number> {
  const levels: Difficulty[] = ['Easy', 'Medium', 'Hard'];
  const total = levels.reduce((a, l) => a + mix[l], 0) || 1;
  const raw = levels.map((l) => (mix[l] / total) * count);
  const out = raw.map(Math.floor);
  let left = count - out.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  for (const [, i] of order) {
    if (left-- <= 0) break;
    out[i]++;
  }
  return { Easy: out[0], Medium: out[1], Hard: out[2] };
}

export type DailyResult = {
  questionIds: string[];
  /** Questions that match the topic filter. */
  available: number;
  /** Requested minus delivered. Above zero means the filter leaves too few. */
  shortBy: number;
  /** Questions answered in the last 7 days that had to be reused. */
  repeats: number;
};

export function matchingQuestions(bank: Question[], topics: string[]): Question[] {
  return topics.length ? bank.filter((q) => topics.includes(q.topic)) : bank;
}

const SECTION_ORDER = { VARC: 0, DILR: 1, QA: 2 } as const;

/** Sections in exam order, with questions from one passage or set kept together. */
export function orderForTest(qs: Question[]): Question[] {
  return [...qs].sort(
    (a, b) =>
      SECTION_ORDER[a.section] - SECTION_ORDER[b.section] ||
      (a.groupId ?? a.id).localeCompare(b.groupId ?? b.id) ||
      a.id.localeCompare(b.id),
  );
}

/**
 * Draws without repeating questions answered in the last 7 days where possible.
 * `lastAnswered` maps a question id to the ISO date it was last answered.
 */
export function buildDailySet(config: DailyConfig, bank: Question[], mix: Mix, lastAnswered: Record<string, string>, todayISO: string, seed: string): DailyResult {
  const rand = seededRandom(seed);
  const pool = matchingQuestions(bank, config.topics);
  const today = parseISO(todayISO);
  const recent = (q: Question) => {
    const d = lastAnswered[q.id];
    return !!d && daysBetween(parseISO(d), today) < REPEAT_WINDOW_DAYS;
  };
  const fresh = shuffled(pool.filter((q) => !recent(q)), rand);
  const stale = shuffled(pool.filter(recent), rand);
  const want = Math.min(config.count, pool.length);
  const targets = quota(mix, want);

  const picked: Question[] = [];
  const take = (source: Question[], level: Difficulty | null, limit: number) => {
    for (const q of source) {
      if (limit <= 0 || picked.length >= want) return;
      if (picked.includes(q) || (level && q.difficulty !== level)) continue;
      picked.push(q);
      limit--;
    }
  };
  for (const level of ['Easy', 'Medium', 'Hard'] as Difficulty[]) take(fresh, level, targets[level]);
  take(fresh, null, want - picked.length); // Another difficulty beats repeating a question.
  take(stale, null, want - picked.length);

  return {
    questionIds: orderForTest(picked).map((q) => q.id),
    available: pool.length,
    shortBy: Math.max(0, config.count - picked.length),
    repeats: picked.filter(recent).length,
  };
}

export function mixSummary(mix: Mix): string {
  const sorted = (Object.entries(mix) as [Difficulty, number][]).sort((a, b) => b[1] - a[1]);
  if (sorted[0][1] - sorted[1][1] <= 10) return 'balanced';
  return `mostly ${sorted[0][0]}`;
}
