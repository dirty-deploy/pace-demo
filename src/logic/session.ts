import type { Session } from './types';

/** Mean of completed/planned over the sessions, each ratio capped at 1.0. Default 1 with no sessions. */
export function completionRate(sessions: Session[]): number {
  const usable = sessions.filter((s) => s.plannedMinutes > 0);
  if (!usable.length) return 1;
  const ratios = usable.map((s) => Math.min(1, s.completedMinutes / s.plannedMinutes));
  return ratios.reduce((a, b) => a + b, 0) / ratios.length;
}

export function plannedLoad(windowMinutes: number, sessions: Session[]): number {
  return Math.round(Math.max(0, windowMinutes) * completionRate(sessions));
}

export type PlanKind = 'drill' | 'set' | 'replay' | 'redo' | 'extra';

export type PlanCandidate = {
  id: string;
  kind: PlanKind;
  label: string;
  minutes: number;
  setId?: string;
  detail?: string;
};

export type Plan = {
  load: number;
  items: PlanCandidate[];
  dropped: PlanCandidate[];
  usedMinutes: number;
};

/**
 * Fill the plan in priority order. Candidates must already be in priority order:
 * drill (4), one capped set, replay (10), redo items due today, then extra capped sets.
 * An item that would push the total past the load is dropped; later, smaller items may still fit.
 */
export function buildPlan(load: number, candidates: PlanCandidate[]): Plan {
  const items: PlanCandidate[] = [];
  const dropped: PlanCandidate[] = [];
  let used = 0;
  for (const c of candidates) {
    if (used + c.minutes <= load + 1e-9) {
      items.push(c);
      used += c.minutes;
    } else {
      dropped.push(c);
    }
  }
  return { load, items, dropped, usedMinutes: used };
}
