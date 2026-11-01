import { describe, expect, it } from 'vitest';
import { BANK, DILR_SETS, PASSAGES, QA_BANK, VARC_QUESTIONS, VOCAB, groupOf } from '../src/content';
import { VOCAB_PRACTICE } from '../src/content/vocabPractice';
import { ALL_TESTS, MOCKS, SECTIONALS, TOPIC_TESTS, testQuestions } from '../src/content/tests';
import { QA_TOPICS } from '../src/content/types';

const words = (s: string) => s.trim().split(/\s+/).length;

describe('QA answer keys', () => {
  it.each(QA_BANK.map((q) => [q.id, q] as const))('%s: solve() recomputes the key', (_id, q) => {
    expect(q.recompute()).toBe(q.key);
  });

  it.each(QA_BANK.map((q) => [q.id, q] as const))('%s: the shown answer matches the computed key', (_id, q) => {
    if (q.kind === 'tita') {
      expect(q.answer).toBe(String(q.recompute()));
      expect(q.commonWrong).toHaveLength(3);
      expect(q.commonWrong).not.toContain(q.answer);
      expect(new Set(q.commonWrong).size).toBe(3);
    } else {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.trapIndex).not.toBe(q.answerIndex);
      expect(q.trapIndex).toBeGreaterThanOrEqual(0);
    }
  });

  it('meets the minimums', () => {
    expect(QA_BANK.length).toBeGreaterThanOrEqual(70);
    const tita = QA_BANK.filter((q) => q.kind === 'tita').length / QA_BANK.length;
    expect(tita).toBeGreaterThan(0.25);
    expect(tita).toBeLessThan(0.35);
    for (const t of QA_TOPICS) expect(QA_BANK.some((q) => q.topic === t)).toBe(true);
  });
});

describe('question bank shape', () => {
  it('has unique ids', () => {
    expect(new Set(BANK.map((q) => q.id)).size).toBe(BANK.length);
  });

  it.each(BANK.map((q) => [q.id, q] as const))('%s has every required field', (_id, q) => {
    expect(q.topic).toBeTruthy();
    expect(q.subType).toBeTruthy();
    expect(['Easy', 'Medium', 'Hard']).toContain(q.difficulty);
    expect(q.expectedSeconds).toBeGreaterThan(0);
    expect(q.explanation.length).toBeGreaterThan(20);
    expect(q.trap).toBeTruthy();
    expect(`${q.prompt} ${q.explanation}`).not.toMatch(/undefined|\bNaN\b|lorem/);
  });

  it('has no exclamation marks or hype in question text', () => {
    for (const q of BANK) expect(`${q.prompt} ${q.explanation}`).not.toMatch(/(?<![\d)])!|supercharge|unlock|seamless|revolutionary|AI-powered/i); // n! is allowed
  });

  it('never mentions Prepito in content', () => {
    expect(JSON.stringify(BANK)).not.toMatch(/prepito/i);
  });

  it('links every group question to a real group', () => {
    for (const q of BANK) if (q.groupId) expect(groupOf(q), q.id).toBeDefined();
  });
});

describe('VARC minimums', () => {
  const count = (t: string) => VARC_QUESTIONS.filter((q) => q.topic === t).length;
  it('has the required counts', () => {
    expect(PASSAGES).toHaveLength(6);
    expect(count('Reading comprehension')).toBe(24);
    expect(count('Para-jumbles')).toBe(10);
    expect(count('Para-summary')).toBe(8);
    expect(count('Odd sentence out')).toBe(6);
  });
  it.each(PASSAGES.map((p) => [p.id, p] as const))('%s is 450 to 600 words with 4 questions', (_id, p) => {
    const n = words(p.paragraphs.join(' '));
    expect(n).toBeGreaterThanOrEqual(450);
    expect(n).toBeLessThanOrEqual(600);
    expect(p.questionIds).toHaveLength(4);
  });
  it('para-jumble answers are permutations of the sentence numbers', () => {
    for (const q of VARC_QUESTIONS.filter((x) => x.topic === 'Para-jumbles')) {
      if (q.kind !== 'tita') throw new Error('expected TITA');
      const n = q.sentences?.length ?? 0;
      expect([...q.answer].sort().join('')).toBe(Array.from({ length: n }, (_, i) => i + 1).join(''));
      for (const w of q.commonWrong) expect([...w].sort().join('')).toBe([...q.answer].sort().join(''));
    }
  });
});

describe('vocabulary', () => {
  it('has 150 unique words', () => {
    expect(VOCAB).toHaveLength(150);
    expect(new Set(VOCAB.map((w) => w.word)).size).toBe(150);
  });
  it('has practice for every word', () => {
    expect(new Set(VOCAB_PRACTICE.map((p) => p.word))).toEqual(new Set(VOCAB.map((w) => w.word)));
  });
  it.each(PASSAGES.map((p) => [p.id, p] as const))('%s contains 6 to 10 list words', (_id, p) => {
    const text = p.paragraphs.join(' ');
    const hits = VOCAB.filter((w) =>
      [w.word, ...Object.keys(w.forms ?? {})].some((f) => new RegExp(`\\b${f}\\b`, 'i').test(text)),
    );
    expect(hits.length).toBeGreaterThanOrEqual(6);
    expect(hits.length).toBeLessThanOrEqual(10);
  });
});

describe('assembled tests', () => {
  it('has two 68-question mocks in the CAT pattern', () => {
    expect(MOCKS).toHaveLength(2);
    for (const m of MOCKS) {
      expect(m.sections.map((s) => s.section)).toEqual(['VARC', 'DILR', 'QA']);
      expect(m.sections.map((s) => s.minutes)).toEqual([40, 40, 40]);
      expect(m.sections.map((s) => s.questionIds.length)).toEqual([24, 22, 22]);
      expect(m.mode).toBe('exam');
      expect(m.capped).toBe(false);
    }
  });
  it('the two mocks share no questions', () => {
    const a = new Set(testQuestions(MOCKS[0]));
    expect(testQuestions(MOCKS[1]).filter((id) => a.has(id))).toEqual([]);
  });
  it('has 3 sectionals per section at 40 minutes', () => {
    for (const sec of ['VARC', 'DILR', 'QA']) {
      const list = SECTIONALS.filter((t) => t.sections[0].section === sec);
      expect(list).toHaveLength(3);
      for (const t of list) expect(t.sections[0].minutes).toBe(40);
    }
  });
  it('topic tests have 5 to 8 questions and 15 minutes', () => {
    for (const t of TOPIC_TESTS) {
      expect(t.sections[0].minutes).toBe(15);
      expect(testQuestions(t).length, t.id).toBeGreaterThanOrEqual(5);
      expect(testQuestions(t).length, t.id).toBeLessThanOrEqual(8);
    }
  });
  it('every test uses real questions, once each', () => {
    const ids = new Set(BANK.map((q) => q.id));
    for (const t of ALL_TESTS) {
      const q = testQuestions(t);
      expect(new Set(q).size, t.id).toBe(q.length);
      for (const id of q) expect(ids.has(id), `${t.id} ${id}`).toBe(true);
    }
  });
  it('covers the whole DILR set list', () => {
    expect(DILR_SETS).toHaveLength(21);
  });
});
