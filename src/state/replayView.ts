import { getQuestion, groupOf, passageById, questionById, setById } from '../content';
import type { Section } from '../content/types';
import { kendall } from '../logic/ranking';
import { pickRedo, REDO_REASON_TEXT } from '../logic/replay';
import type { Attempt, PuzzleSet } from '../logic/types';
import { addBlock } from './actions';
import { nextFreeSlot } from '../logic/planner';
import { getState, update } from './store';
import { redoDueISO, startAttempt } from './testEngine';
import type { AttemptRecord, RedoEntry, SetTrack, TestDef } from './schema';

/** A passage, a DILR set, or one standalone question: the thing a student can redo. */
export type Unit = {
  id: string;
  label: string;
  section: Section;
  seconds: number;
  expectedMinutes: number;
  correct: number;
  wrong: number;
  skipped: number;
  track: SetTrack | null;
};

export function unitLabel(id: string): string {
  const set = setById(id);
  if (set) return set.title;
  const passage = passageById(id);
  if (passage) return `Passage: ${passage.title}`;
  const q = questionById(id);
  return q ? `${q.topic} · ${q.id}` : id;
}

export function unitsOf(r: AttemptRecord): Unit[] {
  const map = new Map<string, Unit>();
  for (const item of r.questions) {
    const q = getQuestion(item.id);
    const id = q.groupId ?? q.id;
    const group = groupOf(q);
    const u =
      map.get(id) ??
      ({
        id,
        label: unitLabel(id),
        section: q.section,
        seconds: 0,
        expectedMinutes: group?.kind === 'set' ? group.expectedMinutes : 0,
        correct: 0,
        wrong: 0,
        skipped: 0,
        track: r.dilr?.sets.find((t) => t.setId === id) ?? null,
      } as Unit);
    u.seconds += item.seconds;
    if (group?.kind !== 'set') u.expectedMinutes += q.expectedSeconds / 60;
    if (item.correct === null) u.skipped++;
    else if (item.correct) u.correct++;
    else u.wrong++;
    map.set(id, u);
  }
  return [...map.values()];
}

/** Three redo items through the v1 rule: cap hits, then wrong answers, then slow ones, then skipped. */
export function redoFor(r: AttemptRecord): RedoEntry[] {
  const units = unitsOf(r);
  const reached = units.filter((u) => u.seconds > 0 && u.correct + u.wrong + (u.track?.hitCap ? 1 : 0) > 0);
  const toAttempt = (u: Unit): Attempt => ({
    setId: u.id,
    startedAt: 0,
    endedAt: u.seconds * 1000,
    capMinutes: (u.track?.capSeconds ?? 0) / 60,
    hitCap: !!u.track?.hitCap,
    extended: !!u.track?.extended,
    left: !!u.track?.left,
    stalledOnClue: u.track?.stalledClue ?? null,
    questions: [
      ...Array.from({ length: u.correct }, () => ({ chosen: 'x', correct: true, seconds: 0 })),
      ...Array.from({ length: u.wrong }, () => ({ chosen: 'x', correct: false, seconds: 0 })),
    ],
  });
  const asSet = (u: Unit) =>
    ({ id: u.id, expectedMinutes: u.expectedMinutes, difficultyScore: u.expectedMinutes, clues: [], clueTypes: { fixed: 0, adjacency: 0, negative: 0 } }) as unknown as PuzzleSet;
  const byId = new Map(units.map((u) => [u.id, u]));
  const picks = pickRedo(reached.map(toAttempt), units.map(asSet), (id) => asSet(byId.get(id) as Unit));
  const dueISO = redoDueISO();
  return picks.map((p) => {
    const u = byId.get(p.setId) as Unit;
    return {
      id: `${r.id}-${u.id}`,
      setId: u.id,
      label: u.label,
      reason: REDO_REASON_TEXT[p.reason],
      minutes: Math.max(1, Math.round(u.expectedMinutes)),
      dueISO,
      done: false,
      fromAttempt: r.id,
    };
  });
}

/** Queues the redo and puts a block on the planner on its due date. */
export function addRedoToPlan(entries: RedoEntry[]) {
  const s = getState();
  const fresh = entries.filter((e) => !s.redo.some((x) => x.id === e.id));
  update((x) => ({ ...x, redo: [...x.redo, ...fresh] }));
  for (const e of fresh) {
    const start = nextFreeSlot(getState().planner, e.dueISO, Math.max(15, e.minutes), 19 * 60);
    if (start === null) continue;
    addBlock({ title: `Redo ${e.label}`, subject: 'Revision', dateISO: e.dueISO, startMin: start, minutes: Math.max(15, e.minutes), activity: `/redo/${e.id}` });
  }
}

export function redoDef(entry: RedoEntry): TestDef {
  const set = setById(entry.setId);
  const passage = passageById(entry.setId);
  const questionIds = set?.questionIds ?? passage?.questionIds ?? [entry.setId];
  const section = getQuestion(questionIds[0]).section;
  return {
    id: `redo-${entry.id}`,
    type: 'redo',
    name: `Redo: ${entry.label}`,
    mode: 'practice',
    capped: !!set,
    sections: [{ section, name: section, minutes: null, questionIds }],
  };
}

/** Starts a redo in the test window and returns its route. */
export function startRedo(entry: RedoEntry): string {
  const def = redoDef(entry);
  if (!getState().active[def.id]) startAttempt(def);
  return `/test/${def.id}`;
}

export function startComparisonOf(r: AttemptRecord) {
  if (!r.dilr || r.dilr.order.length < 2) return null;
  const agree = kendall(r.dilr.order, r.dilr.recommended);
  return {
    yourFirst: r.dilr.order[0],
    recommendedFirst: r.dilr.recommended[0],
    same: r.dilr.order[0] === r.dilr.recommended[0],
    agree,
  };
}
