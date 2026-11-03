import { describe, expect, it } from 'vitest';
import type { McqQuestion, Question, TitaQuestion } from '../src/content/types';
import { formatClock, parseQuickAdd, subjectOf } from '../src/logic/quickadd';
import { applyShields, bestStreak, currentStreak, DEFAULT_RULE, heatLevel, minutesInMonth, ruleMet, weekStates, type DayLog } from '../src/logic/streak';
import { balanceOf, couponCode, discountFor, earn, EARN_RULES, spend, type CoinEntry } from '../src/logic/coins';
import { BALANCED, buildDailySet, matchMix, mixSummary, orderForTest, quota, type DailyConfig } from '../src/logic/dailyset';
import { isCorrect, marksFor, normaliseTita, scoreLine } from '../src/logic/scoring';
import { mcqDistribution, titaDistribution, toPercents } from '../src/logic/distribution';
import { canLeaveSection, canOpenSection, canPause, nextSection, paletteState, roughPercentile } from '../src/logic/testRules';
import { GAPS, newWordState, reviewWord, todaysWords } from '../src/logic/vocabSpacing';
import { fillWeek, nextFreeSlot, overlaps } from '../src/logic/planner';
import { topicLabel, topicRows } from '../src/logic/analytics';
import { toISO, weekOf } from '../src/logic/dates';

const NOW = new Date(2026, 10, 1, 10, 30); // Sunday 1 Nov 2026

const mcq = (id: string, over: Partial<McqQuestion> = {}): McqQuestion => ({
  id,
  section: 'QA',
  topic: 'Percentages',
  subType: 'x',
  difficulty: 'Medium',
  expectedSeconds: 120,
  prompt: 'p',
  explanation: 'e',
  trap: 't',
  kind: 'mcq',
  options: ['a', 'b', 'c', 'd'],
  answerIndex: 2,
  trapIndex: 0,
  ...over,
});

const tita = (id: string, over: Partial<TitaQuestion> = {}): TitaQuestion => ({
  id,
  section: 'QA',
  topic: 'Percentages',
  subType: 'x',
  difficulty: 'Hard',
  expectedSeconds: 120,
  prompt: 'p',
  explanation: 'e',
  trap: 't',
  kind: 'tita',
  answer: '240',
  commonWrong: ['120', '200', '260'],
  ...over,
});

describe('quick-add parsing', () => {
  it('reads the example "DILR sets 7pm 45m"', () => {
    expect(parseQuickAdd('DILR sets 7pm 45m', NOW)).toEqual({ title: 'DILR sets', subject: 'DILR', dateISO: '2026-11-01', startMin: 19 * 60, minutes: 45, guessedTime: false });
  });
  it('reads the example "RC tomorrow 8:30 30m"', () => {
    expect(parseQuickAdd('RC tomorrow 8:30 30m', NOW)).toEqual({ title: 'RC', subject: 'VARC', dateISO: '2026-11-02', startMin: 8 * 60 + 30, minutes: 30, guessedTime: false });
  });
  it('reads a weekday as its next occurrence', () => {
    expect(parseQuickAdd('Quant revision thu 6pm 1h', NOW)).toMatchObject({ title: 'Quant revision', subject: 'QA', dateISO: '2026-11-05', startMin: 18 * 60, minutes: 60 });
    expect(parseQuickAdd('Mock review sun 10am 90m', NOW)?.dateISO).toBe('2026-11-01');
  });
  it('reads hour and minute durations', () => {
    expect(parseQuickAdd('Geometry 7pm 1h30', NOW)?.minutes).toBe(90);
    expect(parseQuickAdd('Geometry 7pm 1.5 hours', NOW)?.minutes).toBe(90);
    expect(parseQuickAdd('Geometry 7pm 2h 15m', NOW)?.minutes).toBe(135);
  });
  it('treats 1 to 5 without am/pm as afternoon, and 24-hour times as typed', () => {
    expect(parseQuickAdd('RC 4:30 30m', NOW)?.startMin).toBe(16 * 60 + 30);
    expect(parseQuickAdd('RC 19:00 30m', NOW)?.startMin).toBe(19 * 60);
    expect(parseQuickAdd('RC 12am 30m', NOW)?.startMin).toBe(0);
    expect(parseQuickAdd('RC 12pm 30m', NOW)?.startMin).toBe(12 * 60);
  });
  it('defaults to 45 minutes and the next free slot', () => {
    const r = parseQuickAdd('Vocab', NOW, () => 20 * 60);
    expect(r).toMatchObject({ title: 'Vocab', subject: 'Revision', minutes: 45, startMin: 20 * 60, guessedTime: true });
    expect(parseQuickAdd('Vocab', NOW)?.startMin).toBe(10 * 60 + 30);
  });
  it('returns null when there is no title', () => {
    expect(parseQuickAdd('', NOW)).toBeNull();
    expect(parseQuickAdd('   ', NOW)).toBeNull();
    expect(parseQuickAdd('7pm 45m', NOW)).toBeNull();
  });
  it('detects subjects and formats clocks', () => {
    expect(subjectOf('para jumbles')).toBe('VARC');
    expect(subjectOf('Percentages practice')).toBe('QA');
    expect(subjectOf('Formula sheet')).toBe('Revision');
    expect(subjectOf('Daily set')).toBe('Revision');
    expect(subjectOf('DILR sets')).toBe('DILR');
    expect(formatClock(19 * 60)).toBe('7 pm');
    expect(formatClock(8 * 60 + 30)).toBe('8:30 am');
    expect(formatClock(12 * 60)).toBe('12 pm');
  });
});

describe('streak rule', () => {
  it('counts today, short tests and lesson time in the month total', () => {
    const log: DayLog = {
      '2026-10-31': { questions: 5, lessonSeconds: 0, minutes: 20 },
      '2026-11-04': { questions: 2, lessonSeconds: 0, minutes: 0.5 },
      '2026-11-05': { questions: 0, lessonSeconds: 600, minutes: 0 },
    };
    expect(minutesInMonth(log, 2026, 10)).toBe(11);
    expect(minutesInMonth(log, 2026, 9)).toBe(20);
  });
  const day = (questions = 0, lessonSeconds = 0) => ({ questions, lessonSeconds, minutes: 10 });
  it('counts 1 question or 5 lesson minutes', () => {
    expect(ruleMet(day(1), DEFAULT_RULE)).toBe(true);
    expect(ruleMet(day(0, 300), DEFAULT_RULE)).toBe(true);
    expect(ruleMet(day(0, 299), DEFAULT_RULE)).toBe(false);
    expect(ruleMet(undefined, DEFAULT_RULE)).toBe(false);
  });
  it('honours changed thresholds', () => {
    expect(ruleMet(day(3), { questions: 5, lessonMinutes: 10 })).toBe(false);
    expect(ruleMet(day(0, 600), { questions: 5, lessonMinutes: 10 })).toBe(true);
  });
  const log: DayLog = {
    '2026-10-26': day(5),
    '2026-10-28': day(5),
    '2026-10-29': day(5),
    '2026-10-30': day(0, 400),
    '2026-10-31': day(1),
  };
  it('keeps the streak when today is not met yet', () => {
    expect(currentStreak(log, NOW, DEFAULT_RULE)).toBe(4);
  });
  it('adds today once met', () => {
    expect(currentStreak({ ...log, '2026-11-01': day(1) }, NOW, DEFAULT_RULE)).toBe(5);
  });
  it('restarts after a missed day', () => {
    expect(currentStreak({ '2026-10-29': day(1) }, NOW, DEFAULT_RULE)).toBe(0);
  });
  it('finds the best streak', () => {
    expect(bestStreak(log, DEFAULT_RULE)).toBe(4);
  });
  it('shows week cells', () => {
    const states = weekStates(weekOf(new Date(2026, 9, 29)), log, new Date(2026, 9, 29), DEFAULT_RULE);
    expect(states).toEqual(['missed', 'missed', 'missed', 'today-done', 'future', 'future', 'future'].map((s, i) => (i === 0 ? 'done' : i === 2 ? 'done' : s)));
  });
  it('a shield covers yesterday and keeps the streak going', () => {
    const missed: DayLog = { '2026-10-29': day(1), '2026-10-30': day(1) };
    const r = applyShields(missed, 1, NOW, DEFAULT_RULE);
    expect(r.covered).toEqual(['2026-10-31']);
    expect(r.shields).toBe(0);
    expect(currentStreak(r.log, NOW, DEFAULT_RULE)).toBe(3);
  });
  it('does not spend a shield with nothing to protect', () => {
    expect(applyShields(log, 1, NOW, DEFAULT_RULE).shields).toBe(1);
    expect(applyShields({ '2026-10-20': day(1) }, 1, NOW, DEFAULT_RULE).shields).toBe(1);
  });
  it('sorts minutes into five shades', () => {
    expect([0, 5, 30, 60, 120].map(heatLevel)).toEqual([0, 1, 2, 3, 4]);
  });
});

describe('coin ledger and discount', () => {
  const entry = (delta: number, action: CoinEntry['action'] = 'mock', dayISO = '2026-11-01'): CoinEntry => ({ id: String(Math.random()), at: 0, dayISO, delta, action, label: '' });
  it('pays the stated amounts', () => {
    expect(Object.fromEntries(Object.entries(EARN_RULES).map(([k, v]) => [k, v.coins]))).toEqual({ mock: 50, sectional: 20, daily: 10, lesson: 5, review: 10, streak: 2 });
    expect(earn([], 'sectional', 1, '2026-11-01')?.delta).toBe(20);
  });
  it('stops at the daily cap and resets the next day', () => {
    const led = [entry(10, 'daily'), entry(10, 'daily')];
    expect(earn(led, 'daily', 1, '2026-11-01')).toBeNull();
    expect(earn(led, 'daily', 1, '2026-11-02')?.delta).toBe(10);
  });
  it('spends only what is there', () => {
    expect(spend([entry(39)], 'shield', 1, '2026-11-01')).toBeNull();
    const s = spend([entry(40)], 'shield', 1, '2026-11-01');
    expect(s?.delta).toBe(-40);
    expect(balanceOf([entry(40), s as CoinEntry])).toBe(0);
  });
  it('converts 100 coins to ₹50 in whole steps', () => {
    expect(discountFor(100, 10000)).toMatchObject({ rupees: 50, coinsUsed: 100, finalPrice: 9950, capped: false });
    expect(discountFor(250, 10000)).toMatchObject({ rupees: 100, coinsUsed: 200 });
    expect(discountFor(99, 10000)).toMatchObject({ rupees: 0, coinsUsed: 0 });
  });
  it('never goes above 30% of the course price', () => {
    const d = discountFor(100000, 1000);
    expect(d.capRupees).toBe(300);
    expect(d.rupees).toBe(300);
    expect(d.coinsUsed).toBe(600);
    expect(d.capped).toBe(true);
    expect(discountFor(100000, 1099).rupees).toBe(300); // Cap ₹329 rounds down to a ₹50 step.
  });
  it('makes a stable coupon code in the right shape', () => {
    expect(couponCode('a')).toMatch(/^MER-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    expect(couponCode('a')).toBe(couponCode('a'));
    expect(couponCode('a')).not.toBe(couponCode('b'));
  });
});

describe('daily-set builder', () => {
  const bank: Question[] = [
    ...Array.from({ length: 12 }, (_, i) => mcq(`E${i}`, { difficulty: 'Easy', topic: 'Percentages' })),
    ...Array.from({ length: 12 }, (_, i) => mcq(`M${i}`, { difficulty: 'Medium', topic: 'Geometry' })),
    ...Array.from({ length: 12 }, (_, i) => mcq(`H${i}`, { difficulty: 'Hard', topic: 'Time and work' })),
  ];
  const cfg = (o: Partial<DailyConfig> = {}): DailyConfig => ({ count: 10, minutes: 20, mix: BALANCED, topics: [], ...o });
  it('delivers the count with the difficulty mix', () => {
    const r = buildDailySet(cfg(), bank, { Easy: 50, Medium: 50, Hard: 0 }, {}, '2026-11-01', 's');
    expect(r.questionIds).toHaveLength(10);
    expect(new Set(r.questionIds).size).toBe(10);
    expect(r.questionIds.filter((i) => i.startsWith('E'))).toHaveLength(5);
    expect(r.questionIds.filter((i) => i.startsWith('H'))).toHaveLength(0);
  });
  it('filters by topic', () => {
    const r = buildDailySet(cfg({ topics: ['Geometry'] }), bank, BALANCED, {}, '2026-11-01', 's');
    expect(r.questionIds.every((i) => i.startsWith('M'))).toBe(true);
    expect(r.questionIds).toHaveLength(10);
  });
  it('does not repeat questions answered in the last 7 days', () => {
    const last = Object.fromEntries(bank.slice(0, 26).map((q) => [q.id, '2026-10-30']));
    const r = buildDailySet(cfg(), bank, BALANCED, last, '2026-11-01', 's');
    expect(r.repeats).toBe(0);
    expect(r.questionIds.every((id) => !last[id])).toBe(true);
  });
  it('allows a question again after 7 days', () => {
    const last = Object.fromEntries(bank.map((q) => [q.id, '2026-10-20']));
    const r = buildDailySet(cfg(), bank, BALANCED, last, '2026-11-01', 's');
    expect(r.repeats).toBe(0);
    expect(r.questionIds).toHaveLength(10);
  });
  it('reuses recent questions only when it must, and counts them', () => {
    const last = Object.fromEntries(bank.slice(0, 30).map((q) => [q.id, '2026-10-30']));
    const r = buildDailySet(cfg(), bank, BALANCED, last, '2026-11-01', 's');
    expect(r.questionIds).toHaveLength(10);
    expect(r.repeats).toBe(4);
  });
  it('says how many are available when the filter leaves too few', () => {
    const r = buildDailySet(cfg({ count: 20, topics: ['Geometry'] }), bank, BALANCED, {}, '2026-11-01', 's');
    expect(r).toMatchObject({ available: 12, shortBy: 8 });
    expect(r.questionIds).toHaveLength(12);
  });
  it('is repeatable for a seed', () => {
    expect(buildDailySet(cfg(), bank, BALANCED, {}, '2026-11-01', 'x')).toEqual(buildDailySet(cfg(), bank, BALANCED, {}, '2026-11-01', 'x'));
  });
  it('splits quotas and matches level', () => {
    expect(quota({ Easy: 20, Medium: 60, Hard: 20 }, 15)).toEqual({ Easy: 3, Medium: 9, Hard: 3 });
    expect(matchMix(4, 0.2)).toEqual(BALANCED);
    expect(matchMix(5, 0.2).Easy).toBe(50);
    expect(matchMix(5, 0.9).Hard).toBe(50);
    expect(mixSummary({ Easy: 25, Medium: 50, Hard: 25 })).toBe('mostly Medium');
    expect(mixSummary(BALANCED)).toBe('balanced');
  });
  it('orders sections as in the exam and keeps groups together', () => {
    const ids = orderForTest([mcq('Q1'), mcq('D2', { section: 'DILR', groupId: 'S01' }), mcq('V1', { section: 'VARC', groupId: 'RC1' }), mcq('D1', { section: 'DILR', groupId: 'S01' })]).map((q) => q.id);
    expect(ids).toEqual(['V1', 'D1', 'D2', 'Q1']);
  });
});

describe('test scoring', () => {
  it('gives +3, -1 for a wrong MCQ, 0 for a wrong TITA, 0 for a skip', () => {
    expect(marksFor(mcq('a'), '2')).toBe(3);
    expect(marksFor(mcq('a'), '1')).toBe(-1);
    expect(marksFor(tita('a'), '240')).toBe(3);
    expect(marksFor(tita('a'), '241')).toBe(0);
    expect(marksFor(mcq('a'), null)).toBe(0);
    expect(marksFor(tita('a'), '  ')).toBe(0);
  });
  it('compares numbers by value and sentence orders exactly', () => {
    expect(isCorrect(tita('a', { answer: '12.5' }), '12.50')).toBe(true);
    expect(isCorrect(tita('a', { answer: '240' }), '0240')).toBe(true);
    expect(isCorrect(tita('a', { answer: '3142', sentences: ['a', 'b', 'c', 'd'] }), '3142')).toBe(true);
    expect(isCorrect(tita('a', { answer: '3142', sentences: ['a', 'b', 'c', 'd'] }), '03142')).toBe(false);
    expect(normaliseTita(' 7 ')).toBe('7');
  });
  it('adds up a section', () => {
    const line = scoreLine([
      { q: mcq('a'), answer: '2' },
      { q: mcq('b'), answer: '0' },
      { q: tita('c'), answer: '1' },
      { q: tita('d'), answer: null },
    ]);
    expect(line).toEqual({ score: 2, max: 12, correct: 1, wrong: 2, skipped: 1, attempted: 3, accuracy: 1 / 3 });
  });
});

describe('option distribution', () => {
  const qs = Array.from({ length: 300 }, (_, i) =>
    mcq(`D${i}`, { answerIndex: i % 4, trapIndex: (i + 1) % 4, difficulty: (['Easy', 'Medium', 'Hard'] as const)[i % 3] }),
  );
  it('is stable for a question', () => {
    expect(mcqDistribution(qs[3])).toEqual(mcqDistribution(qs[3]));
  });
  it('differs between questions', () => {
    expect(mcqDistribution(qs[3]).attempts).not.toBe(mcqDistribution(qs[4]).attempts);
  });
  it('always sums to 100, with the correct option in range and the trap as top wrong option', () => {
    for (const q of qs) {
      const d = mcqDistribution(q);
      expect(d.percents.reduce((a, b) => a + b, 0)).toBe(100);
      expect(d.correctPercent).toBeGreaterThanOrEqual(25);
      expect(d.correctPercent).toBeLessThanOrEqual(70);
      const wrong = d.percents.filter((_, i) => i !== q.answerIndex);
      expect(d.percents[q.trapIndex]).toBe(Math.max(...wrong));
    }
  });
  it('adds the student to the count', () => {
    const base = mcqDistribution(qs[5]);
    const withYou = mcqDistribution(qs[5], 1);
    expect(withYou.attempts).toBe(base.attempts + 1);
    expect(withYou.percents.reduce((a, b) => a + b, 0)).toBe(100);
  });
  it('handles TITA with three wrong values', () => {
    const d = titaDistribution(tita('T1'), true);
    expect(d.wrong.map((w) => w.value)).toEqual(['120', '200', '260']);
    expect(d.correctPercent).toBeGreaterThanOrEqual(25);
    expect(d.correctPercent).toBeLessThanOrEqual(70);
    expect(d.correctPercent + d.wrong.reduce((a, w) => a + w.percent, 0)).toBeLessThanOrEqual(100);
    expect(titaDistribution(tita('T1'), true).attempts).toBe(titaDistribution(tita('T1')).attempts + 1);
  });
  it('largest remainder keeps totals exact', () => {
    expect(toPercents([1, 1, 1]).reduce((a, b) => a + b, 0)).toBe(100);
    expect(toPercents([0, 0])).toEqual([0, 0]);
  });
});

describe('section lock', () => {
  it('locks exam sections until the clock runs out', () => {
    expect(canLeaveSection('exam', 760)).toBe(false);
    expect(canLeaveSection('exam', 0)).toBe(true);
  });
  it('lets practice leave early', () => {
    expect(canLeaveSection('practice', 760)).toBe(true);
  });
  it('allows pause only in practice', () => {
    expect(canPause('exam')).toBe(false);
    expect(canPause('practice')).toBe(true);
  });
  it('blocks moving to another section in exam mode', () => {
    expect(canOpenSection('exam', 0, 1)).toBe(false);
    expect(canOpenSection('exam', 1, 0)).toBe(false);
    expect(canOpenSection('exam', 1, 1)).toBe(true);
    expect(canOpenSection('practice', 0, 2)).toBe(true);
  });
  it('steps through sections and ends', () => {
    expect(nextSection(0, 3)).toBe(1);
    expect(nextSection(2, 3)).toBeNull();
  });
  it('maps the five palette states', () => {
    expect(paletteState({ visited: false, marked: false, answered: false })).toBe('not-visited');
    expect(paletteState({ visited: true, marked: false, answered: false })).toBe('not-answered');
    expect(paletteState({ visited: true, marked: false, answered: true })).toBe('answered');
    expect(paletteState({ visited: true, marked: true, answered: false })).toBe('marked');
    expect(paletteState({ visited: true, marked: true, answered: true })).toBe('answered-marked');
  });
  it('keeps the rough percentile within bounds and rising', () => {
    expect(roughPercentile(-10)).toBe(20);
    expect(roughPercentile(204)).toBe(100);
    expect(roughPercentile(60)).toBeGreaterThan(roughPercentile(30));
  });
  it('calibrates the rough percentile to the sample table', () => {
    expect(roughPercentile(0)).toBe(20);
    expect(roughPercentile(30)).toBe(75);
    expect(roughPercentile(60)).toBe(95);
    expect(roughPercentile(93)).toBeGreaterThan(99.3);
    expect(roughPercentile(93)).toBeLessThan(99.8);
    expect(roughPercentile(110)).toBe(99.8);
    expect(roughPercentile(150)).toBeLessThan(100);
  });
});

describe('vocabulary spacing', () => {
  it('moves through 1, 3, 7, 14 days', () => {
    let s = newWordState();
    const dues: string[] = [];
    for (let i = 0; i < GAPS.length; i++) {
      s = reviewWord(s, true, '2026-11-01');
      dues.push(s.dueISO as string);
    }
    expect(dues).toEqual(['2026-11-02', '2026-11-04', '2026-11-08', '2026-11-15']);
  });
  it('a miss brings the word back tomorrow at level 0', () => {
    const s = reviewWord({ ...newWordState(), level: 3 }, false, '2026-11-01');
    expect(s).toMatchObject({ level: 0, dueISO: '2026-11-02' });
  });
  it("today's words puts due words first and keeps to 5 to 10", () => {
    const all = Array.from({ length: 30 }, (_, i) => `w${i}`);
    const words = todaysWords(all, { w9: { ...newWordState(), dueISO: '2026-11-01', lastISO: '2026-10-31' } }, '2026-11-01');
    expect(words[0]).toBe('w9');
    expect(words).toHaveLength(8);
  });
  it('lists a word once even if it was added and is due', () => {
    const state = { ...newWordState(true), dueISO: '2026-11-01' };
    const words = todaysWords(['a', 'b', 'c', 'd', 'e', 'f'], { a: state }, '2026-11-01');
    expect(words.filter((w) => w === 'a')).toHaveLength(1);
  });
});

describe('planner', () => {
  it('detects overlaps', () => {
    expect(overlaps({ startMin: 60, minutes: 30 }, { startMin: 80, minutes: 30 })).toBe(true);
    expect(overlaps({ startMin: 60, minutes: 30 }, { startMin: 90, minutes: 30 })).toBe(false);
  });
  it('finds the next free slot around existing blocks', () => {
    const blocks = [{ dateISO: '2026-11-01', startMin: 19 * 60, minutes: 60 }];
    expect(nextFreeSlot(blocks, '2026-11-01', 45, 19 * 60)).toBe(20 * 60);
    expect(nextFreeSlot(blocks, '2026-11-02', 45, 19 * 60)).toBe(19 * 60);
    expect(nextFreeSlot([], '2026-11-01', 45, 23 * 60 + 30)).toBeNull();
  });
  it('fills only today onward, within each day\'s load, with no clashes', () => {
    const monday = new Date(2026, 10, 2, 9, 0);
    const week = weekOf(monday);
    const blocks = fillWeek(week, monday, 60, 120, 0.8, []);
    expect(blocks.every((b) => b.dateISO >= toISO(monday))).toBe(true);
    for (const d of week) {
      const iso = toISO(d);
      const day = blocks.filter((b) => b.dateISO === iso);
      const load = day.reduce((a, b) => a + b.minutes, 0);
      expect(load).toBeLessThanOrEqual(Math.round(([5, 6].includes(week.indexOf(d)) ? 120 : 60) * 0.8));
      day.forEach((a, i) => day.slice(i + 1).forEach((b) => expect(overlaps(a, b)).toBe(false)));
    }
    expect(blocks.length).toBeGreaterThan(7);
  });
});

describe('the 5-attempt rule', () => {
  it('gives no strength or weakness label under 5 attempts', () => {
    expect(topicLabel(4, 1)).toBe('Not enough data yet');
    expect(topicLabel(4, 0)).toBe('Not enough data yet');
    expect(topicLabel(5, 0.9)).toBe('Strength');
    expect(topicLabel(5, 0.2)).toBe('Needs work');
    expect(topicLabel(5, 0.6)).toBe('Steady');
  });
  it('counts answered questions only', () => {
    const q = mcq('A');
    const rows = topicRows(
      [
        { questionId: 'A', correct: true, seconds: 60 },
        { questionId: 'A', correct: null, seconds: 5 },
      ],
      () => q,
    );
    expect(rows[0]).toMatchObject({ attempts: 1, correct: 1, label: 'Not enough data yet' });
  });
});
