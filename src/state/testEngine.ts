import { getQuestion, groupOf, setById } from '../content';
import { capSeconds, paceFactor } from '../logic/cap';
import { daysLeft, toISO } from '../logic/dates';
import { redoGap } from '../logic/spacing';
import { isCorrect, scoreLine } from '../logic/scoring';
import type { EarnAction } from '../logic/coins';
import { earnCoins, logActivity, newId } from './actions';
import { getState, today, update } from './store';
import type { ActiveAttempt, AppState, AttemptQuestion, AttemptRecord, AttemptSection, QuestionState, SetTrack, TestDef, TestType } from './schema';
import type { Section } from '../content/types';

const emptyQuestion = (): QuestionState => ({ answer: null, marked: false, visited: false, seconds: 0 });

export function paceOf(s: Pick<AppState, 'pace'>): number {
  return paceFactor(s.pace);
}

/** Set ids in the order the student meets them, honouring a chosen order. */
export function setIdsOf(def: TestDef): string[] {
  const out: string[] = [];
  for (const id of def.sections.flatMap((x) => x.questionIds)) {
    const g = getQuestion(id).groupId;
    if (g && setById(g) && !out.includes(g)) out.push(g);
  }
  return out;
}

/** Rewrites a section's question order so sets follow the chosen order. */
export function applySetOrder(def: TestDef, order: string[]): TestDef {
  return {
    ...def,
    sections: def.sections.map((sec) => {
      const rank = (id: string) => {
        const g = getQuestion(id).groupId;
        const i = g ? order.indexOf(g) : -1;
        return i < 0 ? order.length : i;
      };
      return { ...sec, questionIds: [...sec.questionIds].sort((a, b) => rank(a) - rank(b)) };
    }),
  };
}

export function startAttempt(def: TestDef, setOrder: string[] | null = null): ActiveAttempt {
  const s = getState();
  const pace = paceOf(s);
  const ordered = setOrder ? applySetOrder(def, setOrder) : def;
  const states: Record<string, QuestionState> = {};
  for (const id of ordered.sections.flatMap((x) => x.questionIds)) states[id] = emptyQuestion();
  const sets: Record<string, SetTrack> = {};
  if (ordered.capped) {
    for (const setId of setIdsOf(ordered)) {
      const set = setById(setId);
      if (!set) continue;
      sets[setId] = { setId, seconds: 0, capSeconds: capSeconds(set.expectedMinutes, pace), hitCap: false, extended: false, left: false, stalledClue: null };
    }
  }
  const firstId = ordered.sections[0].questionIds[0];
  states[firstId] = { ...states[firstId], visited: true };
  const attempt: ActiveAttempt = {
    id: newId('att'),
    def: ordered,
    startedAt: Date.now(),
    sectionIndex: 0,
    questionIndex: 0,
    secondsLeft: ordered.sections.map((x) => (x.minutes === null ? null : x.minutes * 60)),
    secondsUsed: ordered.sections.map(() => 0),
    states,
    sets,
    setOrder,
    paused: false,
    updatedAt: Date.now(),
  };
  update((x) => ({ ...x, active: { ...x.active, [ordered.id]: attempt } }));
  return attempt;
}

export function saveAttempt(a: ActiveAttempt) {
  update((s) => (s.active[a.def.id] ? { ...s, active: { ...s.active, [a.def.id]: { ...a, updatedAt: Date.now() } } } : s));
}

export function discardAttempt(testId: string) {
  update((s) => {
    const active = { ...s.active };
    delete active[testId];
    return { ...s, active };
  });
}

const COIN_FOR: Partial<Record<TestType, EarnAction>> = { mock: 'mock', sectional: 'sectional', daily: 'daily' };

/** Pure scoring of an attempt into its stored record. Used by finishAttempt and the demo seed. */
export function toRecord(a: ActiveAttempt, endedAt: number): AttemptRecord {
  const ids = a.def.sections.flatMap((x) => x.questionIds);
  const questions: AttemptQuestion[] = ids.map((id) => {
    const q = getQuestion(id);
    const st = a.states[id];
    return { id, section: q.section, answer: st.answer, correct: isCorrect(q, st.answer), seconds: Math.round(st.seconds), marked: st.marked };
  });
  const presentSections = (['VARC', 'DILR', 'QA'] as Section[]).filter((s) => questions.some((q) => q.section === s));
  const sections: AttemptSection[] = presentSections.map((sec) => {
    const items = questions.filter((q) => q.section === sec);
    const line = scoreLine(items.map((q) => ({ q: getQuestion(q.id), answer: q.answer })));
    return {
      section: sec,
      name: sec,
      score: line.score,
      max: line.max,
      correct: line.correct,
      wrong: line.wrong,
      skipped: line.skipped,
      seconds: items.reduce((t, q) => t + q.seconds, 0),
    };
  });
  const total = scoreLine(ids.map((id) => ({ q: getQuestion(id), answer: a.states[id].answer })));

  // DILR detail: first-visited order versus the recommended order, plus cap tracks.
  const dilrIds = questions.filter((q) => q.section === 'DILR').map((q) => q.id);
  const dilrSets = setIdsOf({ ...a.def, sections: [{ section: 'DILR', name: 'DILR', minutes: null, questionIds: dilrIds }] });
  const dilr = dilrSets.length
    ? {
        order: a.setOrder ?? dilrSets,
        recommended: recommendedSetOrder(dilrSets),
        sets: dilrSets.map(
          (setId): SetTrack =>
            a.sets[setId] ?? {
              setId,
              seconds: questions.filter((q) => getQuestion(q.id).groupId === setId).reduce((t, q) => t + q.seconds, 0),
              capSeconds: 0,
              hitCap: false,
              extended: false,
              left: false,
              stalledClue: null,
            },
        ),
      }
    : null;

  return {
    id: a.id,
    testId: a.def.id,
    testName: a.def.name,
    type: a.def.type,
    mode: a.def.mode,
    startedAt: a.startedAt,
    endedAt,
    score: total.score,
    max: total.max,
    accuracy: total.accuracy,
    sections,
    questions,
    dilr,
    reviewed: false,
  };
}

/** Easiest first: lowest expected time, then id. */
export function recommendedSetOrder(setIds: string[]): string[] {
  return [...setIds].sort((a, b) => (setById(a)?.expectedMinutes ?? 0) - (setById(b)?.expectedMinutes ?? 0) || a.localeCompare(b));
}

/** Scores and stores the attempt, updates streak, coins and pace. Returns the attempt id. */
export function finishAttempt(a: ActiveAttempt): string {
  const record = toRecord(a, Date.now());
  const answered = record.questions.filter((q) => q.correct !== null).length;
  const seconds = a.secondsUsed.reduce((t, x) => t + x, 0);
  update((s) => {
    const active = { ...s.active };
    delete active[a.def.id];
    const samples = (record.dilr?.sets ?? [])
      .filter((t) => t.seconds > 30)
      .map((t) => ({ setId: t.setId, expectedMinutes: setById(t.setId)?.expectedMinutes ?? 0, actualMinutes: t.seconds / 60 }))
      .filter((t) => t.expectedMinutes > 0);
    const iso = toISO(today());
    const planned = s.sessions.find((x) => x.date === iso);
    const sessions = planned
      ? s.sessions.map((x) => (x.date === iso ? { ...x, completedMinutes: x.completedMinutes + seconds / 60 } : x))
      : s.sessions;
    return { ...s, active, attempts: [...s.attempts, record], pace: [...s.pace, ...samples], sessions };
  });
  logActivity({ questions: answered, minutes: Math.round(seconds / 60) });
  const coin = COIN_FOR[a.def.type];
  if (coin && answered > 0) earnCoins(coin);
  return record.id;
}

export function clueListOf(q: { id: string }): string[] {
  const group = groupOf(getQuestion(q.id));
  if (group?.kind !== 'set') return [];
  return group.stimulus.flatMap((b) => (b.type === 'list' ? b.items : []));
}

export function redoDueISO(): string {
  const s = getState();
  const now = today();
  const gap = redoGap(daysLeft(now, s.profile?.examDate));
  return toISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() + gap));
}
