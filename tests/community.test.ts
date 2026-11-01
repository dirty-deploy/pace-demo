import { describe, expect, it } from 'vitest';
import { BANK, questionById } from '../src/content';
import { COMMUNITY_ANSWERS } from '../src/content/community';
import { MOCKS, SECTIONALS, testQuestions } from '../src/content/tests';
import { QA_TOPICS } from '../src/content/types';

const entries = Object.entries(COMMUNITY_ANSWERS);
const answers = entries.flatMap(([, list]) => list);
const covered = (section: string) => BANK.filter((q) => q.section === section && COMMUNITY_ANSWERS[q.id]);

describe('community answers', () => {
  it('uses real question ids as keys', () => {
    const unknown = Object.keys(COMMUNITY_ANSWERS).filter((id) => !questionById(id));
    expect(unknown).toEqual([]);
  });

  it('covers enough questions', () => {
    expect(entries.length).toBeGreaterThanOrEqual(60);
    expect(entries.length).toBeGreaterThanOrEqual(72);
  });

  it.each(entries)('%s has 2 to 3 answers with ids in order', (id, list) => {
    expect(list.length).toBeGreaterThanOrEqual(2);
    expect(list.length).toBeLessThanOrEqual(3);
    expect(list.map((a) => a.id)).toEqual(list.map((_, i) => `${id}-c${i + 1}`));
  });

  it('has unique answer ids', () => {
    expect(new Set(answers.map((a) => a.id)).size).toBe(answers.length);
  });

  it('uses only the allowed author labels', () => {
    const allowed = /^Sample (student|alum, \d{2}(\.\d)? %ile)$/;
    expect(answers.map((a) => a.author).filter((a) => !allowed.test(a))).toEqual([]);
    const percentiles = answers.flatMap((a) => /alum, ([\d.]+) %ile/.exec(a.author)?.[1] ?? []).map(Number);
    expect(percentiles.length).toBeGreaterThan(0);
    for (const p of percentiles) {
      expect(p).toBeGreaterThanOrEqual(97);
      expect(p).toBeLessThanOrEqual(99.9);
    }
  });

  it('keeps some variety in authors', () => {
    expect(new Set(answers.map((a) => a.author)).size).toBeGreaterThanOrEqual(6);
    expect(answers.some((a) => a.author === 'Sample student')).toBe(true);
  });

  it('has no exclamation marks and no mention of Prepito', () => {
    expect(answers.filter((a) => a.text.includes('!')).map((a) => a.id)).toEqual([]);
    expect(answers.filter((a) => /prepito/i.test(a.text)).map((a) => a.id)).toEqual([]);
  });

  it('keeps upvotes and daysAgo in range', () => {
    for (const a of answers) {
      expect(Number.isInteger(a.upvotes)).toBe(true);
      expect(a.upvotes).toBeGreaterThanOrEqual(2);
      expect(a.upvotes).toBeLessThanOrEqual(180);
      expect(Number.isInteger(a.daysAgo)).toBe(true);
      expect(a.daysAgo).toBeGreaterThanOrEqual(1);
      expect(a.daysAgo).toBeLessThanOrEqual(60);
    }
  });

  it('covers QA across every topic', () => {
    const qa = covered('QA');
    expect(qa.length).toBeGreaterThanOrEqual(40);
    const topics = new Set(qa.map((q) => q.topic));
    expect(QA_TOPICS.filter((t) => !topics.has(t))).toEqual([]);
  });

  it('covers DILR', () => {
    expect(covered('DILR').length).toBeGreaterThanOrEqual(12);
  });

  it('covers VARC, including RC and para-jumbles', () => {
    const varc = covered('VARC');
    expect(varc.length).toBeGreaterThanOrEqual(20);
    expect(varc.some((q) => q.topic === 'Reading comprehension')).toBe(true);
    expect(varc.some((q) => q.topic === 'Para-jumbles')).toBe(true);
  });

  it('covers every question in Full mock 1 and in the first QA sectional', () => {
    const qaSectional = SECTIONALS.find((t) => t.id === 'sec-qa-1');
    expect(qaSectional).toBeDefined();
    const ids = [...testQuestions(MOCKS[0]), ...testQuestions(qaSectional!)];
    expect(ids.filter((id) => !COMMUNITY_ANSWERS[id])).toEqual([]);
  });
});
