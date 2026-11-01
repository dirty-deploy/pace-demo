import type { CSSProperties } from 'react';
import { addDays, parseISO, shortDate, toISO, weekday } from '../../logic/dates';
import { DAY_END, DAY_START, nextFreeSlot, SLOT, type BlockLike } from '../../logic/planner';
import { formatClock, parseQuickAdd, type QuickAdd, type Subject } from '../../logic/quickadd';
import type { AppState, PlannerBlock } from '../../state/schema';
import { update } from '../../state/store';

export const EVENING = 19 * 60;
const SPAN = DAY_END - DAY_START;

export type Template = { title: string; subject: Subject; minutes: number; activity: string };

/** Daily set is a mix of sections, so it sits under Revision rather than what its title suggests. */
export const TEMPLATES: Template[] = [
  { title: 'DILR set-pick', subject: 'DILR', minutes: 4, activity: '/practice/drill' },
  { title: 'Sectional QA', subject: 'QA', minutes: 40, activity: '/practice/tests?tab=sectional' },
  { title: 'Daily set', subject: 'Revision', minutes: 20, activity: '/practice/daily' },
  { title: 'Lesson', subject: 'Revision', minutes: 15, activity: '/learn/lessons' },
  { title: 'Vocab', subject: 'Revision', minutes: 10, activity: '/learn/vocab' },
];

const ACTIVITIES: [RegExp, string][] = [
  [/\b(drill|set-?pick)\b/i, '/practice/drill'],
  [/\bsectional\b/i, '/practice/tests?tab=sectional'],
  [/\bmocks?\b/i, '/practice/tests'],
  [/\bdaily\b/i, '/practice/daily'],
  [/\blessons?\b/i, '/learn/lessons'],
  [/\bvocab/i, '/learn/vocab'],
  [/\b(review|replay)\b/i, '/progress/review'],
];

/** So a typed "Sectional QA" offers Start now, the same as the template does. */
export function activityOf(title: string): string | null {
  return ACTIVITIES.find(([re]) => re.test(title))?.[1] ?? null;
}

export const nowMinutes = (now: Date) => now.getHours() * 60 + now.getMinutes();

export const shortDay = (iso: string) => {
  const d = parseISO(iso);
  return `${weekday(d)} ${shortDate(d)}`;
};

export function dayWord(iso: string, now: Date): string {
  if (iso === toISO(now)) return 'Today';
  if (iso === toISO(addDays(now, 1))) return 'Tomorrow';
  return shortDay(iso);
}

export const blockTime = (b: Pick<PlannerBlock, 'dateISO' | 'startMin' | 'minutes'>) =>
  `${shortDay(b.dateISO)} · ${formatClock(b.startMin)} · ${b.minutes} min`;

export const blockLabel = (b: PlannerBlock) =>
  `${b.subject}, ${b.title}, ${shortDay(b.dateISO)}, ${formatClock(b.startMin)}, ${b.minutes} min${b.done ? ', done' : ''}`;

export const quickAddChip = (q: QuickAdd, now: Date) =>
  `${q.subject} · ${q.title} · ${dayWord(q.dateISO, now)} ${formatClock(q.startMin)} · ${q.minutes} min`;

/** Next free half hour: from the current time today, from 7 pm on any other day. */
export function freeStart(blocks: BlockLike[], dateISO: string, minutes: number, now: Date): number | null {
  return nextFreeSlot(blocks, dateISO, minutes, dateISO === toISO(now) ? nowMinutes(now) : EVENING);
}

export const clampStart = (start: number, minutes: number) => Math.max(DAY_START, Math.min(start, DAY_END - minutes));

export function parseBlock(text: string, now: Date, blocks: BlockLike[]): QuickAdd | null {
  const q = parseQuickAdd(text, now, (iso, minutes) => freeStart(blocks, iso, minutes, now));
  return q && { ...q, startMin: clampStart(q.startMin, q.minutes) };
}

/** Where a missed block lands: tomorrow from 7 pm, or earlier that day if the evening is full. */
export function tomorrowSlot(blocks: PlannerBlock[], block: PlannerBlock, now: Date): { dateISO: string; startMin: number } | null {
  const dateISO = toISO(addDays(now, 1));
  const others = blocks.filter((b) => b.id !== block.id);
  const startMin = nextFreeSlot(others, dateISO, block.minutes, EVENING) ?? nextFreeSlot(others, dateISO, block.minutes);
  return startMin === null ? null : { dateISO, startMin };
}

// ---- Moving and resizing ----

export const stepStart = (b: Pick<PlannerBlock, 'startMin' | 'minutes'>, dir: 1 | -1) => clampStart(b.startMin + dir * SLOT, b.minutes);

/** One row longer or shorter, landing on a half hour. Never shorter than one row, unless it already was. */
export function stepLength(b: Pick<PlannerBlock, 'startMin' | 'minutes'>, dir: 1 | -1): number {
  const next = dir > 0 ? (Math.floor(b.minutes / SLOT) + 1) * SLOT : (Math.ceil(b.minutes / SLOT) - 1) * SLOT;
  return next < SLOT ? b.minutes : Math.min(next, DAY_END - b.startMin);
}

export function snapStart(min: number, minutes: number): number {
  const latest = Math.floor((DAY_END - minutes) / SLOT) * SLOT;
  return Math.max(DAY_START, Math.min(Math.round(min / SLOT) * SLOT, latest));
}

export function snapLength(endMin: number, startMin: number): number {
  return Math.min(DAY_END - startMin, Math.max(SLOT, Math.round(endMin / SLOT) * SLOT - startMin));
}

// ---- Laying out the grid ----

/** A short block still needs a full row to be readable and clickable. */
export const shownMinutes = (minutes: number) => Math.max(minutes, SLOT);

export type Placed = { lane: number; lanes: number };

/** Overlapping blocks share a day side by side; each cluster of overlaps gets its own lane count. */
export function layoutDay(items: { id: string; startMin: number; minutes: number }[]): Map<string, Placed> {
  const out = new Map<string, Placed>();
  const sorted = [...items].sort((a, b) => a.startMin - b.startMin || b.minutes - a.minutes);
  let cluster: { id: string; lane: number }[] = [];
  let laneEnds: number[] = [];
  let clusterEnd = -1;
  const flush = () => {
    cluster.forEach((c) => out.set(c.id, { lane: c.lane, lanes: laneEnds.length }));
    cluster = [];
    laneEnds = [];
  };
  for (const b of sorted) {
    const end = b.startMin + shownMinutes(b.minutes);
    if (b.startMin >= clusterEnd) flush();
    let lane = laneEnds.findIndex((e) => e <= b.startMin);
    if (lane < 0) lane = laneEnds.length;
    laneEnds[lane] = end;
    cluster.push({ id: b.id, lane });
    clusterEnd = Math.max(clusterEnd, end);
  }
  flush();
  return out;
}

export function boxStyle(day: number, startMin: number, minutes: number, place: Placed = { lane: 0, lanes: 1 }): CSSProperties {
  const colPct = 100 / 7;
  const lanePct = colPct / place.lanes;
  return {
    top: `calc(${((startMin - DAY_START) / SPAN) * 100}% + 1px)`,
    height: `calc(${(shownMinutes(minutes) / SPAN) * 100}% - 2px)`,
    left: `calc(${day * colPct + place.lane * lanePct}% + 2px)`,
    width: `calc(${lanePct}% - 4px)`,
  };
}

// ---- Done ----

type Sessions = AppState['sessions'];

/** Adds (or takes back) completed minutes on a date's session row, creating the row if needed. */
export function creditSession(sessions: Sessions, date: string, plannedMinutes: number, delta: number): Sessions {
  if (!sessions.some((s) => s.date === date)) {
    return delta > 0 ? [...sessions, { date, plannedMinutes, completedMinutes: delta }] : sessions;
  }
  return sessions.map((s) =>
    s.date === date
      ? { ...s, plannedMinutes: Math.max(s.plannedMinutes, plannedMinutes), completedMinutes: Math.max(0, s.completedMinutes + delta) }
      : s,
  );
}

/** Ticks a block and credits its time to today's session in one write. */
export function setBlockDone(id: string, done: boolean, todayISO: string) {
  update((s) => {
    const block = s.planner.find((b) => b.id === id);
    if (!block || block.done === done) return s;
    const planned = s.planner.filter((b) => b.dateISO === todayISO).reduce((sum, b) => sum + b.minutes, 0);
    return {
      ...s,
      planner: s.planner.map((b) => (b.id === id ? { ...b, done } : b)),
      sessions: creditSession(s.sessions, todayISO, Math.max(planned, block.minutes), done ? block.minutes : -block.minutes),
    };
  });
}
