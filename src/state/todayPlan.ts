import { LESSONS } from '../content/lessons';
import { toISO } from '../logic/dates';
import { formatClock } from '../logic/quickadd';
import { buildPlan, completionRate, plannedLoad, type PlanCandidate } from '../logic/session';
import type { AppState } from './schema';

export type PlanItem = PlanCandidate & { to: string; done: boolean; blockId?: string };

export type TodayPlan = {
  windowMinutes: number;
  load: number;
  rate: number;
  items: PlanItem[];
  used: number;
};

const MAX_ITEMS = 5;

export function windowFor(s: AppState, now: Date): number {
  const iso = toISO(now);
  if (s.dayOverride?.date === iso) return s.dayOverride.minutes;
  const day = now.getDay();
  const weekend = day === 0 || day === 6;
  return (weekend ? s.profile?.weekendMinutes : s.profile?.weekdayMinutes) ?? 60;
}

const attemptedOn = (s: AppState, iso: string, type: string) => s.attempts.some((a) => a.type === type && toISO(new Date(a.endedAt)) === iso);

/**
 * The v1 session builder with v2 inputs. Priority order: planner blocks for today, redo items due,
 * then the set-pick drill, a daily set, the latest unreviewed attempt, the next lesson and vocabulary.
 */
export function buildTodayPlan(s: AppState, now: Date): TodayPlan {
  const iso = toISO(now);
  const past = s.sessions.filter((x) => x.date < iso).slice(-5);
  const rate = completionRate(past);
  const windowMinutes = windowFor(s, now);
  const load = plannedLoad(windowMinutes, past);

  const blocks: PlanItem[] = s.planner
    .filter((b) => b.dateISO === iso)
    .sort((a, b) => a.startMin - b.startMin)
    .map((b) => ({
      id: `block-${b.id}`,
      kind: 'set',
      label: b.title,
      detail: `Planned for ${formatClock(b.startMin)}`,
      minutes: b.minutes,
      to: b.activity ?? '/progress/planner',
      done: b.done,
      blockId: b.id,
    }));

  const redo: PlanItem[] = s.redo
    .filter((r) => r.dueISO <= iso && !r.done && !s.planner.some((b) => b.dateISO === iso && b.activity === `/redo/${r.id}`))
    .map((r) => ({ id: `redo-${r.id}`, kind: 'redo', label: `Redo ${r.label}`, detail: r.reason, minutes: r.minutes, to: `/redo/${r.id}`, done: false }));

  const unreviewed = [...s.attempts].reverse().find((a) => !a.reviewed);
  const nextLesson = LESSONS.find((l) => !s.lessons[l.id]?.done);
  const extras: PlanItem[] = [
    { id: 'drill', kind: 'drill', label: 'DILR set-pick drill', detail: 'Rank five sets', minutes: 4, to: '/practice/drill', done: s.drills.some((d) => toISO(new Date(d.at)) === iso) },
    { id: 'daily', kind: 'extra', label: 'Daily set', detail: 'Ten questions at your level', minutes: 20, to: '/practice/daily', done: attemptedOn(s, iso, 'daily') },
    ...(unreviewed
      ? [{ id: 'replay', kind: 'replay' as const, label: `Replay ${unreviewed.testName}`, detail: 'See where the time went', minutes: 10, to: `/progress/review/${unreviewed.id}?tab=replay`, done: false }]
      : []),
    ...(nextLesson
      ? [{ id: 'lesson', kind: 'extra' as const, label: nextLesson.title, detail: 'Lesson', minutes: Math.ceil(nextLesson.durationSeconds / 60), to: `/learn/lessons/${nextLesson.id}`, done: false }]
      : []),
    { id: 'vocab', kind: 'extra', label: 'Vocabulary practice', detail: "Today's words", minutes: 10, to: '/learn/vocab', done: s.vocabDays.includes(iso) },
  ];

  const candidates = [...blocks, ...redo, ...extras];
  const plan = buildPlan(load, candidates);
  const byId = new Map(candidates.map((c) => [c.id, c]));
  const items = plan.items.slice(0, MAX_ITEMS).map((i) => byId.get(i.id) as PlanItem);
  return { windowMinutes, load, rate, items, used: items.reduce((a, i) => a + i.minutes, 0) };
}
