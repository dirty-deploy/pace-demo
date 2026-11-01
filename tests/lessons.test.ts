import { describe, expect, it } from 'vitest';
import { CONCEPT_SECONDS, formatTime, LESSON_QUESTIONS, lessonById, LESSONS, lineIndexAt, revealCountAt } from '../src/content/lessons';
import { DI_ROWS } from '../src/content/lessons/di-tables';
import { FRACTION_TABLE } from '../src/content/lessons/qa-percent-fractions';
import { countWords, WORDS_PER_MINUTE } from '../src/content/lessons/types';
import type { McqQuestion, Question, TitaQuestion } from '../src/content/types';
import { DILR_TOPICS, QA_TOPICS, VARC_TOPICS } from '../src/content/types';
import { isCorrect } from '../src/logic/scoring';

const IDS = ['rc-inference', 'pj-opening-pairs', 'dilr-set-choice', 'di-tables', 'qa-percent-fractions', 'qa-time-work-lcm'];

const lesson = (id: string) => {
  const l = lessonById(id);
  if (!l) throw new Error(`No lesson ${id}`);
  return l;
};
const question = (id: string): Question => {
  const q = LESSON_QUESTIONS.find((x) => x.id === id);
  if (!q) throw new Error(`No question ${id}`);
  return q;
};
const mcq = (id: string) => question(id) as McqQuestion;
const tita = (id: string) => question(id) as TitaQuestion;
const said = (id: string) => lesson(id).transcript.map((l) => l.text).join(' ');

// ---- Exact fractions, so nothing here depends on floating point ----

type Frac = [number, number];
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const frac = (n: number, d = 1): Frac => {
  const g = gcd(n, d);
  return [n / g, d / g];
};
const mul = (...xs: Frac[]) => xs.reduce<Frac>((a, b) => frac(a[0] * b[0], a[1] * b[1]), [1, 1]);
const lcm = (...xs: number[]) => xs.reduce((a, b) => (a * b) / gcd(a, b));
const pct = (f: Frac) => (f[0] / f[1]) * 100;
const fixed2 = (x: number) => Number(x.toFixed(2)).toString();
const up = (n: number) => frac(n + 1, n);
const down = (n: number) => frac(n - 1, n);
const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));

/** Days to finish `total` when two people work on turns, the first going first. */
function turnsDays(total: number, first: number, second: number): number {
  let left = total;
  let days = 0;
  for (;;) {
    const rate = days % 2 === 0 ? first : second;
    if (left <= rate) return days + left / rate;
    left -= rate;
    days++;
  }
}

describe('lesson list', () => {
  it('has the six required lessons, each findable by id', () => {
    expect(LESSONS.map((l) => l.id)).toEqual(IDS);
    for (const id of IDS) expect(lessonById(id)?.id).toBe(id);
    expect(lessonById('nope')).toBeUndefined();
  });

  it('gathers every practice question, with unique ids', () => {
    const ids = LESSON_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(LESSONS.reduce((n, l) => n + l.practice.length, 0));
  });
});

describe.each(LESSONS.map((l) => [l.id, l] as const))('%s', (id, l) => {
  it('has 10 to 16 slides, 500 to 900 words and runs 4 to 7 minutes', () => {
    expect(l.slides.length).toBeGreaterThanOrEqual(10);
    expect(l.slides.length).toBeLessThanOrEqual(16);
    expect(l.wordCount).toBeGreaterThanOrEqual(500);
    expect(l.wordCount).toBeLessThanOrEqual(900);
    expect(l.durationSeconds).toBeGreaterThanOrEqual(240);
    expect(l.durationSeconds).toBeLessThanOrEqual(420);
  });

  it('derives its length from the words, at about 140 a minute', () => {
    expect(l.wordCount).toBe(l.transcript.reduce((n, x) => n + countWords(x.text), 0));
    const rate = l.wordCount / (l.durationSeconds / 60);
    expect(rate).toBeGreaterThan(WORDS_PER_MINUTE * 0.9);
    expect(rate).toBeLessThanOrEqual(WORDS_PER_MINUTE);
  });

  it('gives each sentence its own strictly increasing timestamp', () => {
    expect(l.transcript[0].start).toBe(0);
    l.transcript.forEach((line, i) => {
      expect(line.index).toBe(i);
      expect(line.end).toBeGreaterThan(line.start);
      if (i) expect(line.start).toBeGreaterThan(l.transcript[i - 1].start);
      if (i) expect(line.start).toBe(l.transcript[i - 1].end);
      expect(line.text, 'one sentence per line').not.toMatch(/[.?:]\s+[A-Z]\w+ [a-z]+ [a-z]+.*[.?]$/);
    });
    expect(l.transcript[l.transcript.length - 1].end).toBe(l.durationSeconds);
  });

  it('keeps chapters inside the lesson, starting at 0', () => {
    expect(l.chapters.length).toBeGreaterThanOrEqual(3);
    expect(l.chapters[0].start).toBe(0);
    l.chapters.forEach((c, i) => {
      expect(c.start).toBeLessThan(l.durationSeconds);
      if (i) expect(c.start).toBeGreaterThan(l.chapters[i - 1].start);
    });
  });

  it('reaches every slide, and lines up slides with their lines', () => {
    l.slides.forEach((s, i) => {
      expect(s.start).toBeLessThan(l.durationSeconds);
      expect(s.end).toBeGreaterThan(s.start);
      if (i) expect(s.start).toBe(l.slides[i - 1].end);
      const own = l.transcript.filter((x) => x.slide === i);
      expect(own.length).toBeGreaterThan(0);
      expect(own[0].start).toBe(s.start);
      expect(l.transcript[lineIndexAt(l, s.start)].slide).toBe(i);
      for (const at of s.reveals) {
        expect(at).toBeGreaterThanOrEqual(s.start);
        expect(at).toBeLessThan(s.end);
      }
      expect(revealCountAt(s, s.end)).toBe(s.reveals.length);
    });
    expect(l.slides[l.slides.length - 1].end).toBe(l.durationSeconds);
  });

  it('reveals every item its slide holds', () => {
    for (const s of l.slides) {
      const b = s.body;
      if (b.kind === 'points' || b.kind === 'steps' || b.kind === 'verdicts') expect(s.reveals.length).toBe(b.items.length);
      if (b.kind === 'table') {
        expect(s.reveals.length).toBe(b.marks.length);
        for (const row of b.rows) expect(row.length).toBe(b.columns.length);
      }
    }
  });

  it('has the concept moment on the slide marked for it', () => {
    const at = CONCEPT_SECONDS[id];
    expect(Number.isInteger(at)).toBe(true);
    expect(at).toBeGreaterThan(0);
    expect(at).toBeLessThan(l.durationSeconds);
    const first = l.slides.findIndex((s) => s.start >= at - 1);
    expect(l.transcript[lineIndexAt(l, at)].slide).toBe(first);
  });

  it('has 3 to 5 valid practice questions', () => {
    expect(l.practice.length).toBeGreaterThanOrEqual(3);
    expect(l.practice.length).toBeLessThanOrEqual(5);
    const topics: readonly string[] = [...QA_TOPICS, ...VARC_TOPICS, ...DILR_TOPICS];
    l.practice.forEach((q, i) => {
      expect(q.id).toBe(`L-${id}-${i + 1}`);
      expect(q.section).toBe(l.section);
      expect(topics).toContain(q.topic);
      expect(q.subType.length).toBeGreaterThan(0);
      expect(q.prompt.length).toBeGreaterThan(0);
      expect(q.explanation.length).toBeGreaterThan(20);
      expect(q.trap.length).toBeGreaterThan(0);
      expect(q.expectedSeconds).toBeGreaterThan(0);
      expect(q.lessonRef).toEqual({ lessonId: id, seconds: CONCEPT_SECONDS[id] });
      if (q.kind === 'mcq') {
        expect(new Set(q.options).size).toBe(4);
        expect(q.options).toHaveLength(4);
        expect(q.answerIndex).toBeGreaterThanOrEqual(0);
        expect(q.answerIndex).toBeLessThan(4);
        expect(q.trapIndex).toBeGreaterThanOrEqual(0);
        expect(q.trapIndex).toBeLessThan(4);
        expect(q.trapIndex).not.toBe(q.answerIndex);
        expect(isCorrect(q, String(q.answerIndex))).toBe(true);
        expect(isCorrect(q, String(q.trapIndex))).toBe(false);
      } else {
        expect(q.commonWrong).toHaveLength(3);
        expect(new Set(q.commonWrong).size).toBe(3);
        expect(q.commonWrong).not.toContain(q.answer);
        expect(isCorrect(q, q.answer)).toBe(true);
        for (const wrong of q.commonWrong) expect(isCorrect(q, wrong)).toBe(false);
      }
    });
  });

  it('keeps to the tone rules', () => {
    const copy = [l.title, l.summary, ...l.transcript.map((x) => x.text), ...l.slides.map((s) => s.body.title), ...l.practice.flatMap((q) => [q.prompt, q.explanation])].join(' ');
    expect(copy).not.toMatch(/!/);
    expect(copy).not.toMatch(/\p{Extended_Pictographic}/u);
    expect(copy.toLowerCase()).not.toMatch(/\b(unlock|supercharge|seamless|revolutionary|ai-powered)\b/);
  });
});

describe('formatTime and line lookup', () => {
  it('formats minutes and seconds', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(65.9)).toBe('1:05');
    expect(formatTime(600)).toBe('10:00');
  });

  it('finds the line at any moment', () => {
    const l = LESSONS[0];
    expect(lineIndexAt(l, 0)).toBe(0);
    expect(lineIndexAt(l, l.transcript[5].start)).toBe(5);
    expect(lineIndexAt(l, l.transcript[5].end - 0.01)).toBe(5);
    expect(lineIndexAt(l, l.durationSeconds)).toBe(l.transcript.length - 1);
  });
});

describe('para-jumble keys', () => {
  it('uses every sentence exactly once', () => {
    const qs = lesson('pj-opening-pairs').practice.filter((q): q is TitaQuestion => q.kind === 'tita');
    expect(qs.length).toBeGreaterThanOrEqual(3);
    for (const q of qs) {
      const n = q.sentences?.length ?? 0;
      const digits = (s: string) => [...s].map(Number).sort();
      const expected = Array.from({ length: n }, (_, i) => i + 1);
      expect(digits(q.answer)).toEqual(expected);
      for (const wrong of q.commonWrong) expect(digits(wrong)).toEqual(expected);
    }
  });

  it('gets the link funnel right', () => {
    expect(factorial(4)).toBe(24);
    expect(factorial(3)).toBe(6); // A pair is one block, so 3 items.
    expect(factorial(2)).toBe(2); // Opening fixed, so 2 items left.
  });
});

describe('DILR set choice numbers', () => {
  it('recomputes the size figures and the time plan', () => {
    const text = said('dilr-set-choice');
    expect(text).toContain(`${factorial(5)} ways`);
    expect(text).toContain(`${factorial(6)} ways`);
    expect(factorial(8)).toBe(40320);
    expect(text).toContain('40,320 ways');
    expect(4 + 14 + 14 + 8).toBe(40);
    expect(18 + 22).toBe(40);
    expect(1 + 5).toBe(6);
    expect(5 + 4 + 2).toBe(11);
  });

  it('recomputes the practice answers', () => {
    expect(tita('L-dilr-set-choice-3').answer).toBe(String(factorial(6)));
    expect(Number(tita('L-dilr-set-choice-5').answer)).toBe((1 / 4) * 3 + (3 / 4) * -1);
  });
});

describe('DI table', () => {
  const rows = DI_ROWS.map((r) => r.slice(1) as number[]);
  const col = (c: number) => rows.map((r) => r[c]);
  const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
  const [alpha, beta, gamma, delta] = rows;

  it('adds up in both directions', () => {
    for (const r of rows) expect(sum(r.slice(0, 4))).toBe(r[4]);
    expect([0, 1, 2, 3].map((c) => sum(col(c)))).toEqual([470, 513, 480, 637]);
    expect(470 + 513 + 480 + 637).toBe(2100);
    expect(sum(col(4))).toBe(2100);
  });

  it('recomputes growth from Q1 to Q2', () => {
    const growth = rows.map((r) => (r[1] - r[0]) / r[0]);
    expect(growth.map((g) => Math.round(g * 100))).toEqual([25, 20, -10, 30]);
    expect(Math.max(...growth)).toBe(growth[3]);
    expect(alpha[1] - alpha[0]).toBe(30);
    expect(beta[1] - beta[0]).toBe(16);
    expect(gamma[1] - gamma[0]).toBe(-21);
    expect(delta[1] - delta[0]).toBe(18);
    // Alpha added the most, which is the trap.
    expect(Math.max(...rows.map((r) => r[1] - r[0]))).toBe(30);
  });

  it('recomputes the Q4 shares through the common base', () => {
    const scaled = rows.map((r) => (r[3] * 400) / r[4]);
    expect(scaled).toEqual([130, 136, 115.5, 100]);
    expect(Math.max(...scaled)).toBe(136);
    expect((136 / 400) * 100).toBe(34);
  });

  it('recomputes the quarters Gamma beat Alpha and Beta together', () => {
    const wins = [0, 1, 2, 3].filter((c) => gamma[c] > alpha[c] + beta[c]);
    expect(wins).toEqual([0]);
    expect(alpha[0] + beta[0]).toBe(200);
  });

  it('recomputes the share estimate', () => {
    expect(470 / 2).toBe(235);
    expect(235 - 23.5).toBe(211.5);
    expect((211.5 / 470) * 100).toBeCloseTo(45, 10);
    const share = (210 / 470) * 100;
    expect(share).toBeLessThan(45);
    expect(share).toBeGreaterThan(44);
  });

  it('recomputes the practice answers', () => {
    const a = [240, 180, 150, 90];
    const b = [300, 216, 165, 126];
    const growth = a.map((x, i) => (b[i] - x) / x);
    expect(growth.indexOf(Math.max(...growth))).toBe(mcq('L-di-tables-1').answerIndex);
    expect(tita('L-di-tables-2').answer).toBe(String(sum(b) - sum(a)));
    expect(sum(a)).toBe(660);
    expect(sum(b)).toBe(807);
    const q3 = mcq('L-di-tables-3');
    expect(q3.options[q3.answerIndex]).toBe(`${(b[1] / b[0]) * 100}%`);
    expect((a[1] / a[0]) * 100).toBe(75);
    const change = (b[3] / sum(b) - a[3] / sum(a)) * 100;
    expect(change).toBeGreaterThan(1.9);
    expect(change).toBeLessThan(2.1);
  });
});

describe('QA: percentages as fractions', () => {
  it('has the right value for every fraction in the table', () => {
    expect(FRACTION_TABLE).toHaveLength(12);
    for (const [d, percent] of FRACTION_TABLE) expect(fixed2(100 / d)).toBe(percent);
  });

  it('recomputes the listed multiples', () => {
    expect(fixed2((3 / 8) * 100)).toBe('37.5');
    expect(fixed2((5 / 8) * 100)).toBe('62.5');
    expect(fixed2((7 / 8) * 100)).toBe('87.5');
    expect(fixed2((2 / 7) * 100)).toBe('28.57');
    expect(fixed2((3 / 7) * 100)).toBe('42.86');
    expect(fixed2((5 / 6) * 100)).toBe('83.33');
    expect(pct(frac(6, 5))).toBe(120);
    expect(pct(frac(5, 4))).toBe(125);
  });

  it('recomputes the worked examples', () => {
    expect((1600 * 37.5) / 100).toBe(600);
    expect((1600 / 8) * 3).toBe(600);
    expect(mul(up(4), down(5))).toEqual([1, 1]); // Up 25%, down 20%.
    for (const n of [2, 3, 4, 5, 8, 10]) expect(mul(up(n), down(n + 1))).toEqual([1, 1]);
    expect(mul(up(3), down(8))).toEqual([7, 6]);
    expect(fixed2(pct(frac(1, 6)))).toBe('16.67');
    expect([120 * (4 / 3), 160 * (7 / 8)]).toEqual([160, 140]);
    expect(mul(frac(120), frac(7, 6))).toEqual([140, 1]);
    expect(mul(frac(12500), frac(6, 5))).toEqual([15000, 1]);
    expect(Math.round(12500 * (1 + 16.67 / 100))).toBe(14584);
    expect(Math.round((12500 * 7) / 6)).toBe(14583);
    expect((8 * 75) / 100).toBe(6);
    expect((75 * 8) / 100).toBe(6);
    expect((350 / 7) * 3).toBe(150);
    expect((43 * 350) / 100).toBeCloseTo(150.5, 10);
  });

  it('says the worked numbers aloud', () => {
    const text = said('qa-percent-fractions');
    for (const part of ['200', '600', '15,000 rupees', '14,583', 'up by 16.67 percent']) expect(text).toContain(part);
  });

  it('recomputes the practice answers', () => {
    const q1 = mcq('L-qa-percent-fractions-1');
    expect(mul(up(8), down(5))).toEqual([9, 10]);
    expect(q1.options[q1.answerIndex]).toBe('A 10% decrease');

    expect(tita('L-qa-percent-fractions-2').answer).toBe(String(mul(frac(1250), frac(8, 5))[0]));
    expect(1250 * 1.375).toBe(1718.75);

    const q3 = mcq('L-qa-percent-fractions-3');
    expect(mul(frac(4, 3), frac(3, 4))).toEqual([1, 1]);
    expect(q3.options[q3.answerIndex]).toBe('25%');

    expect(tita('L-qa-percent-fractions-4').answer).toBe(String((2100 / 7) * 2));

    const q5 = mcq('L-qa-percent-fractions-5');
    expect(q5.options[q5.answerIndex]).toBe(`${fixed2(pct(frac(1, 6)))}%`);
  });
});

describe('QA: time and work with LCM', () => {
  it('recomputes the opening example both ways', () => {
    expect(lcm(12, 15)).toBe(60);
    expect([60 / 12, 60 / 15]).toEqual([5, 4]);
    expect(frac(5 + 4, 60)).toEqual([3, 20]);
    expect(frac(60, 9)).toEqual([20, 3]);
    expect(frac(20, 3)[0] % 3).toBe(2); // 6 and 2 thirds.
    expect(Math.floor(20 / 3)).toBe(6);
  });

  it('recomputes the worked examples', () => {
    expect(lcm(10, 15, 30)).toBe(30);
    expect([30 / 10, 30 / 15, 30 / 30]).toEqual([3, 2, 1]);
    expect(30 / (3 + 2 + 1)).toBe(5);

    expect(lcm(12, 18)).toBe(36);
    expect((3 + 2) * 4).toBe(20);
    expect((36 - 20) / 2).toBe(8);
    expect(3 * 4 + 2 * (4 + 8)).toBe(36); // A works 4 days, B works 12.

    expect(lcm(6, 9)).toBe(18);
    expect([18 / 6, 18 / 9]).toEqual([3, 2]);
    expect(18 / (3 - 2)).toBe(18);

    expect((2 + 1) * 10).toBe(30);
    expect(30 / 2).toBe(15);

    expect(12 * 15).toBe(180);
    expect((180 - 12 * 5) / (12 + 8)).toBe(6);

    expect(lcm(8, 12)).toBe(24);
    expect(turnsDays(24, 24 / 8, 24 / 12)).toBe(9.5);
    expect((24 / 5) * 2).toBe(9.6);
  });

  it('says the worked numbers aloud', () => {
    const text = said('qa-time-work-lcm');
    for (const part of ['60 units', '6 and 2 thirds', '8 more days', '18 hours', '15 days', '9 and a half days', '9.6 days']) expect(text).toContain(part);
  });

  it('recomputes the practice answers', () => {
    const q1 = mcq('L-qa-time-work-lcm-1');
    const u1 = lcm(20, 30);
    expect(q1.options[q1.answerIndex]).toBe(String(u1 / (u1 / 20 + u1 / 30)));

    const u2 = lcm(16, 24);
    const left = u2 - (u2 / 16 + u2 / 24) * 6;
    expect(tita('L-qa-time-work-lcm-2').answer).toBe(String(left / (u2 / 24)));

    const q3 = mcq('L-qa-time-work-lcm-3');
    const u3 = lcm(10, 15);
    expect(q3.options[q3.answerIndex]).toBe(String(u3 / (u3 / 10 - u3 / 15)));

    const u4 = lcm(6, 9);
    expect(tita('L-qa-time-work-lcm-4').answer).toBe(String(Math.ceil(turnsDays(u4, u4 / 6, u4 / 9))));
    expect(turnsDays(u4, u4 / 6, u4 / 9)).toBe(7);

    const q5 = mcq('L-qa-time-work-lcm-5');
    expect(q5.options[q5.answerIndex]).toBe(String((3 + 1) * 9));
  });
});
