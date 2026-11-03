import { describe, expect, it } from 'vitest';
import { getQuestion, QA_BANK, VARC_QUESTIONS, DILR_SETS } from '../src/content/index';
import { ALL_TESTS } from '../src/content/tests';

/** Pre-finale data checks. They print only ids, never content. */
const ALL = [...VARC_QUESTIONS, ...QA_BANK, ...DILR_SETS.flatMap((s) => s.questionIds.map((id) => getQuestion(id)))];

describe('content data checks', () => {
  it('every MCQ has exactly one correct answer inside its options', () => {
    const bad = ALL.filter((q) => q && q.kind === 'mcq' && !(Number.isInteger(q.answerIndex) && q.answerIndex >= 0 && q.answerIndex < q.options.length && new Set(q.options).size === q.options.length));
    expect(bad.map((q) => q?.id)).toEqual([]);
  });
  it('every TITA answer is a number', () => {
    const bad = ALL.filter((q) => q && q.kind === 'tita' && !/^-?\d+(\.\d+)?$/.test(String(q.answer).trim()));
    expect(bad.map((q) => q?.id)).toEqual([]);
  });
  it('every test question exists, appears once, and the counts match CAT', () => {
    const missing = ALL_TESTS.flatMap((t) => t.sections.flatMap((s) => s.questionIds.filter((id) => !getQuestion(id)).map((id) => `${t.id}:${id}`)));
    const dupes = ALL_TESTS.filter((t) => {
      const ids = t.sections.flatMap((s) => s.questionIds);
      return new Set(ids).size !== ids.length;
    });
    const wrongCount = ALL_TESTS.filter((t) => t.type === 'mock' || t.type === 'sectional').filter((t) =>
      t.sections.some((s) => s.questionIds.length !== (s.section === 'VARC' ? 24 : 22)),
    );
    expect(missing).toEqual([]);
    expect(dupes.map((t) => t.id)).toEqual([]);
    expect(wrongCount.map((t) => t.id)).toEqual([]);
  });
});
