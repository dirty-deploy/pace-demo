import student from '../data/demo_student.json';
import { getQuestion, setById, VOCAB } from '../content';
import { getTest, MOCKS, SECTIONALS } from '../content/tests';
import { earn, type CoinEntry, type EarnAction } from '../logic/coins';
import { capSeconds, paceFactor } from '../logic/cap';
import { addDays, startOfDay, toISO } from '../logic/dates';
import { seededRandom } from '../logic/rng';
import type { DayLog } from '../logic/streak';
import { newWordState, reviewWord } from '../logic/vocabSpacing';
import { setState, today } from './store';
import { emptyState, newProfile, type ActiveAttempt, type AppState, type AttemptRecord, type PlannerBlock, type QuestionState, type SetTrack, type TestDef } from './schema';
import { redoFor } from './replayView';
import { setIdsOf, toRecord } from './testEngine';

const MIN = 60_000;

/** Fills a test with believable answers. Accuracy and speed depend on the seed, so history looks human. */
function fakeAttempt(def: TestDef, at: number, skill: number, seedText: string, pace: number): AttemptRecord {
  const rand = seededRandom(seedText);
  const states: Record<string, QuestionState> = {};
  const secondsUsed = def.sections.map(() => 0);
  const sets: Record<string, SetTrack> = {};
  def.sections.forEach((sec, si) => {
    const budget = (sec.minutes ?? 30) * 60;
    let used = 0;
    for (const id of sec.questionIds) {
      const q = getQuestion(id);
      const seconds = Math.round(q.expectedSeconds * (0.7 + rand() * 0.7));
      const timedOut = used + seconds > budget;
      const skipped = timedOut || rand() < 0.14;
      const right = rand() < skill - (q.difficulty === 'Hard' ? 0.2 : q.difficulty === 'Easy' ? -0.15 : 0);
      let answer: string | null = null;
      if (!skipped) {
        if (q.kind === 'mcq') answer = String(right ? q.answerIndex : q.trapIndex);
        else answer = right ? q.answer : q.commonWrong[0];
      }
      states[id] = { answer, marked: rand() < 0.08, visited: !timedOut, seconds: timedOut ? 0 : seconds };
      if (!timedOut) used += seconds;
    }
    secondsUsed[si] = used;
  });
  if (def.capped) {
    const ids = setIdsOf(def).filter((id) => setById(id));
    const spentOn = (setId: string) => (setById(setId)?.questionIds ?? []).reduce((t, id) => t + (states[id]?.seconds ?? 0), 0);
    const capOf = (setId: string) => capSeconds(setById(setId)?.expectedMinutes ?? 0, pace);
    // The set that ran longest against its cap really does hit it, so the replay has true data.
    const slowest = [...ids].sort((a, b) => spentOn(b) / capOf(b) - spentOn(a) / capOf(a))[0];
    if (slowest) {
      const qs = (setById(slowest)?.questionIds ?? []).filter((id) => states[id]);
      const target = capOf(slowest) + 120;
      const extra = target - spentOn(slowest);
      if (extra > 0 && qs.length) {
        states[qs[0]].seconds += extra;
        // Time on that set came out of the rest of the section, so the 40 minutes still holds.
        const budget = (def.sections[0].minutes ?? 40) * 60;
        let over = secondsUsed[0] + extra - budget;
        const others = def.sections[0].questionIds.filter((id) => !qs.includes(id) && states[id].seconds > 0).reverse();
        for (const id of others) {
          if (over <= 0) break;
          const cut = Math.min(over, Math.floor(states[id].seconds / 2));
          states[id].seconds -= cut;
          over -= cut;
        }
        secondsUsed[0] = def.sections[0].questionIds.reduce((t, id) => t + states[id].seconds, 0);
      }
    }
    for (const setId of ids) {
      const spent = spentOn(setId);
      const cap = capOf(setId);
      const over = spent >= cap;
      sets[setId] = { setId, seconds: Math.min(spent, cap + 120), capSeconds: cap, hitCap: over, extended: over, left: over, stalledClue: over ? 1 : null };
    }
  }
  const active: ActiveAttempt = {
    id: `demo-${seedText}`,
    def,
    startedAt: at - secondsUsed.reduce((a, b) => a + b, 0) * 1000,
    sectionIndex: 0,
    questionIndex: 0,
    secondsLeft: def.sections.map(() => 0),
    secondsUsed,
    states,
    sets,
    setOrder: null,
    paused: false,
    updatedAt: at,
  };
  return toRecord(active, at);
}

function fixedPlanner(now: Date): PlannerBlock[] {
  const day = (n: number) => toISO(addDays(now, n));
  const block = (id: string, title: string, subject: PlannerBlock['subject'], d: string, startMin: number, minutes: number, activity: string, done = false): PlannerBlock => ({
    id,
    title,
    subject,
    dateISO: d,
    startMin,
    minutes,
    activity,
    done,
  });
  return [
    block('demo-b1', 'Sectional QA', 'QA', day(-1), 19 * 60, 40, '/practice/tests?tab=sectional', true),
    block('demo-b2', 'RC practice', 'VARC', day(-2), 19 * 60, 30, '/practice/daily', false),
    block('demo-b3', 'Set-pick drill', 'DILR', day(0), 19 * 60, 15, '/practice/drill'),
    block('demo-b4', 'Vocab', 'Revision', day(0), 20 * 60, 15, '/learn/vocab'),
    block('demo-b5', 'Sectional DILR', 'DILR', day(1), 19 * 60, 40, '/practice/tests?tab=sectional'),
    block('demo-b6', 'Lesson', 'Revision', day(2), 20 * 60, 15, '/learn/lessons'),
    block('demo-b7', 'Daily set', 'QA', day(3), 19 * 60 + 30, 20, '/practice/daily'),
  ];
}

/** A week of believable history, so every page has something to show. */
export function demoState(now: Date): AppState {
  const start = startOfDay(now);
  const at = (daysAgo: number, hour: number) => addDays(start, -daysAgo).getTime() + hour * 60 * MIN;
  const pace = student.paceHistory;
  const factor = paceFactor(pace);

  const mock = fakeAttempt(MOCKS[0], at(4, 10), 0.6, 'mock1', factor);
  const sectionalQa = fakeAttempt(SECTIONALS.find((t) => t.id === 'sec-qa-1') as TestDef, at(3, 19), 0.64, 'sq1', factor);
  const sectionalDilr = fakeAttempt(SECTIONALS.find((t) => t.id === 'sec-dilr-1') as TestDef, at(2, 20), 0.55, 'sd1', factor);
  const topic = fakeAttempt(getTest('topic-percentages') as TestDef, at(1, 19), 0.72, 'tp1', factor);
  const dailyDef: TestDef = {
    id: 'daily-demo',
    type: 'daily',
    name: 'Quick 10',
    mode: 'practice',
    capped: false,
    sections: [{ section: 'QA', name: 'Daily set', minutes: 20, questionIds: ['RC2-1', 'RC2-2', 'PS03', 'QA010', 'QA021', 'QA033', 'QA044', 'QA052', 'QA060', 'QA068'] }],
  };
  const daily = fakeAttempt(dailyDef, at(1, 21), 0.68, 'dq1', factor);
  const attempts = [mock, sectionalQa, sectionalDilr, topic, daily];
  mock.reviewed = true;
  sectionalQa.reviewed = true;

  // Streak of 4: the last four days, a miss before them, then an earlier run of 3.
  const days: DayLog = {};
  const put = (daysAgo: number, questions: number, lessonSeconds: number, minutes: number) => {
    days[toISO(addDays(start, -daysAgo))] = { questions, lessonSeconds, minutes };
  };
  const count = (r: AttemptRecord) => r.questions.filter((q) => q.correct !== null).length;
  const mins = (r: AttemptRecord) => Math.round(r.sections.reduce((a, s) => a + s.seconds, 0) / 60);
  put(1, count(topic) + count(daily), 0, mins(topic) + mins(daily));
  put(2, count(sectionalDilr), 420, mins(sectionalDilr) + 7);
  put(3, count(sectionalQa), 0, mins(sectionalQa));
  put(4, count(mock), 0, mins(mock));
  put(6, 12, 300, 26);
  put(7, 8, 0, 14);
  put(8, 0, 540, 9);
  put(11, 15, 0, 32);
  put(12, 6, 360, 16);
  put(15, 20, 0, 41);

  const coins: CoinEntry[] = [];
  const pay = (action: EarnAction, daysAgo: number, times = 1) => {
    for (let i = 0; i < times; i++) {
      const dayISO = toISO(addDays(start, -daysAgo));
      const entry = earn(coins, action, at(daysAgo, 21) + i, dayISO);
      if (entry) coins.push(entry);
    }
  };
  pay('daily', 15);
  pay('streak', 15);
  pay('streak', 12);
  pay('streak', 11);
  pay('daily', 11);
  pay('streak', 8);
  pay('streak', 7);
  pay('streak', 6);
  pay('lesson', 6);
  pay('streak', 4);
  pay('mock', 4);
  pay('review', 4);
  pay('streak', 3);
  pay('sectional', 3);
  pay('review', 3);
  pay('streak', 2);
  pay('sectional', 2);
  pay('streak', 1);
  pay('daily', 1);

  // A paused practice sectional, so Continue and Resume have something real.
  const pausedDef = SECTIONALS.find((t) => t.id === 'sec-varc-1') as TestDef;
  const states: Record<string, QuestionState> = {};
  const ids = pausedDef.sections[0].questionIds;
  ids.forEach((id, i) => {
    const q = getQuestion(id);
    const answered = i < 3;
    const answer = answered ? (q.kind === 'mcq' ? String(q.answerIndex) : q.answer) : null;
    states[id] = { answer, marked: i === 2, visited: i < 4, seconds: answered ? 95 : 0 };
  });
  const paused: ActiveAttempt = {
    id: 'demo-paused',
    def: pausedDef,
    startedAt: at(1, 18),
    sectionIndex: 0,
    questionIndex: 3,
    secondsLeft: [40 * 60 - 285],
    secondsUsed: [285],
    states,
    sets: {},
    setOrder: null,
    paused: false,
    updatedAt: at(1, 18),
  };

  const sessions = [...student.lastFiveSessions].map((x, i) => ({ ...x, date: toISO(addDays(start, i - 5)) }));

  const iso = toISO(start);
  const vocab: AppState['vocab'] = {};
  // Words the demo student added: two already reviewed, one due today.
  const [first, second, third] = [VOCAB[12].word, VOCAB[58].word, VOCAB[97].word];
  vocab[first] = reviewWord(newWordState(true), true, toISO(addDays(start, -3)));
  vocab[second] = reviewWord(newWordState(true), true, toISO(addDays(start, -2)));
  vocab[third] = { ...newWordState(true), dueISO: iso };

  return {
    ...emptyState(),
    profile: newProfile({ name: 'Ash', exam: 'CAT 2026', examDate: student.student.examDate, weekdayMinutes: 60, weekendMinutes: 120, targetPercentile: 95, onboarded: true, demo: true }),
    attempts,
    active: { [pausedDef.id]: paused },
    days,
    coins,
    planner: fixedPlanner(start),
    sessions,
    pace,
    vocab,
    // Two redo items from the seeded DILR sectional, due today so Home has real work to show.
    redo: redoFor(sectionalDilr).slice(0, 2).map((r) => ({ ...r, dueISO: iso })),
    notes: [
      {
        id: 'demo-n1',
        title: 'Fractions to keep ready',
        text: '1/6 is 16.67%. 1/7 is 14.29%. 1/8 is 12.5%. 1/9 is 11.11%. 1/11 is 9.09%.',
        tags: ['Percentages'],
        topic: 'Percentages',
        createdAt: at(5, 20),
        source: null,
      },
      {
        id: 'demo-n2',
        title: 'Mock 1 takeaway',
        text: 'I spent too long on the first DILR set. Next time, leave at the cap and come back only if time is left.',
        tags: ['Strategy', 'Mocks'],
        topic: 'Strategy',
        createdAt: at(4, 13),
        source: 'Full mock 1',
      },
    ],
    lessons: {
      'qa-percent-fractions': { position: 0, watchedSeconds: 300, done: true, practice: {} },
      'rc-inference': { position: 96, watchedSeconds: 96, done: false, practice: {} },
    },
  };
}

export function loadDemoProfile() {
  setState(demoState(today()));
}
