import { useMemo } from 'react';
import { useStore, nowDate } from './store';
import { buildPlan, completionRate, plannedLoad, type PlanCandidate } from '../logic/session';
import { capSeconds } from '../logic/cap';
import { recommendedOrder } from '../logic/ranking';
import { toISO } from '../logic/dates';

export type PlanNode = PlanCandidate & { done: boolean; to: string; current?: boolean };

export function usePlan() {
  const s = useStore();
  return useMemo(() => {
    const now = nowDate();
    const todayISO = toISO(now);
    const rate = completionRate(s.sessions);
    const load = plannedLoad(s.windowMinutes, s.sessions);
    const rec = recommendedOrder(s.roundSets);
    const top = s.drill && s.drill.roundN === s.round.n ? rec[0] : rec[Math.min(2, rec.length - 1)];
    const extraSet = rec.find((x) => x.id !== top.id && x.expectedMinutes <= 9) ?? rec.find((x) => x.id !== top.id)!;
    const capMin = (id: string) => capSeconds(s.getSet(id)!.expectedMinutes, s.pace) / 60;
    const attempted = new Set(s.attempts.map((a) => a.setId));

    const cands: (PlanCandidate & { done: boolean; to: string })[] = [
      { id: 'drill', kind: 'drill', label: 'Set-pick drill', detail: 'Rank five set previews', minutes: 4, done: !!s.drill && s.drill.roundN === s.round.n, to: '/drill' },
      { id: 'set', kind: 'set', label: `Capped set · ${s.labelOf(top.id)}`, detail: `Cap ${formatMin(capMin(top.id))}`, minutes: capMin(top.id), setId: top.id, done: attempted.has(top.id), to: `/attempt/${top.id}` },
      { id: 'replay', kind: 'replay', label: '10-minute replay', detail: 'Nothing to type', minutes: 10, done: s.replayViewed, to: '/replay' },
      ...s.redoQueue
        .filter((r) => r.dueISO <= todayISO)
        .map((r) => ({ id: `redo-${r.setId}`, kind: 'redo' as const, label: `Redo ${r.label}`, detail: r.note, minutes: r.minutes, setId: r.setId, done: attempted.has(r.setId) && r.setId !== top.id, to: `/attempt/${r.setId}` })),
      { id: 'extra', kind: 'extra', label: `Second capped set · ${s.labelOf(extraSet.id)}`, detail: `Cap ${formatMin(capMin(extraSet.id))}`, minutes: capMin(extraSet.id), setId: extraSet.id, done: attempted.has(extraSet.id), to: `/attempt/${extraSet.id}` },
    ];
    const plan = buildPlan(load, cands);
    const byId = new Map(cands.map((c) => [c.id, c]));
    const nodes: PlanNode[] = plan.items.map((i) => ({ ...(byId.get(i.id) as PlanNode) }));
    const cur = nodes.findIndex((n) => !n.done);
    if (cur >= 0) nodes[cur].current = true;
    const dropped = plan.dropped.map((d) => byId.get(d.id) as PlanNode);
    const redoDueToday = cands.filter((c) => c.kind === 'redo').length;
    return { load, rate, nodes, dropped, used: plan.usedMinutes, redoDueToday, topId: top.id };
  }, [s]);
}

export const formatMin = (m: number) => {
  const sec = Math.round(m * 60);
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}
