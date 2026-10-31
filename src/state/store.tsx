import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import setsData from '../data/sample_sets.json';
import student from '../data/demo_student.json';
import type { Attempt, PaceSample, PuzzleSet, Session } from '../logic/types';
import { generate, shuffle, type Anchors, type Style } from '../logic/seating';
import { recommendedOrder } from '../logic/ranking';
import { paceFactor } from '../logic/cap';
import { toISO, startOfDay } from '../logic/dates';
import { attemptMinutes, type RedoItem } from '../logic/replay';

export const SAMPLE_SETS = setsData.sets as unknown as PuzzleSet[];
const nodes = SAMPLE_SETS.map((s) => s.solverNodes);
export const ANCHORS: Anchors = { minNodes: Math.min(...nodes), maxNodes: Math.max(...nodes) };

export const nowDate = () => new Date(Date.now());

export type Round = { n: number; ids: string[]; generated: boolean };
export type DrillResult = { roundN: number; order: string[]; auto: boolean; at: number };

const LETTERS = 'ABCDE';

function pickSampleRound(rand = Math.random): string[] {
  for (let i = 0; i < 200; i++) {
    const pick = shuffle(SAMPLE_SETS, rand).slice(0, 5);
    const labels = pick.map((s) => s.difficultyLabel);
    if (labels.includes('Easier') && labels.includes('Harder')) return pick.map((s) => s.id);
  }
  return SAMPLE_SETS.slice(0, 5).map((s) => s.id);
}

function generateRound(n: number, rand = Math.random): PuzzleSet[] {
  const styles: Style[] = ['easier', 'easier', 'medium', 'harder', 'harder'];
  for (let attempt = 0; attempt < 30; attempt++) {
    const sets = styles.map((st, i) => generate(st, `G${n}${String.fromCharCode(97 + i)}`, ANCHORS, rand));
    const labels = sets.map((s) => s.difficultyLabel);
    if (labels.includes('Easier') && labels.includes('Harder')) return shuffle(sets, rand);
  }
  // Practically unreachable: fall back to a sample draw so the round is always valid.
  return pickSampleRound(rand).map((id) => SAMPLE_SETS.find((s) => s.id === id)!);
}

/** Fixed labels for the pre-recorded sample replay, so it reads like the example in the spec. */
export const SAMPLE_CODES: Record<string, string> = { S09: 'A', S04: 'B', S11: 'C', S06: 'D', S13: 'E' };

function seedRedo(today: Date): RedoItem[] {
  const due = toISO(startOfDay(today));
  return [
    { setId: 'S07', label: 'Set S07', reason: 'slow', minutes: 8.3, dueISO: due, note: 'Slower than expected · from your 28 Oct session' },
    { setId: 'S12', label: 'Set S12', reason: 'cap', minutes: 5.4, dueISO: due, note: 'You hit the cap here · from your 26 Oct session' },
  ];
}

type Store = {
  windowMinutes: number;
  setWindowMinutes: (n: number) => void;
  getSet: (id: string) => PuzzleSet | undefined;
  codeOf: (id: string) => string | undefined;
  labelOf: (id: string) => string;
  round: Round;
  roundSets: PuzzleSet[];
  newRound: () => void;
  drill: DrillResult | null;
  submitDrill: (order: string[], auto: boolean) => void;
  attempts: Attempt[];
  addAttempt: (a: Attempt) => void;
  redoQueue: RedoItem[];
  addRedo: (items: RedoItem[]) => void;
  replayViewed: boolean;
  markReplayViewed: () => void;
  sessions: Session[];
  paceSamples: PaceSample[];
  pace: number;
  /** Number of attempts per topic including this visit. */
  topicAttempts: { topic: string; attempts: number; accuracy: number | null }[];
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const registry = useRef<Record<string, PuzzleSet>>(Object.fromEntries(SAMPLE_SETS.map((s) => [s.id, s])));
  const codes = useRef<Record<string, string>>({});
  const [round, setRound] = useState<Round>(() => {
    const ids = pickSampleRound();
    ids.forEach((id, i) => (codes.current[id] = LETTERS[i]));
    return { n: 1, ids, generated: false };
  });
  const [windowMinutes, setWindowMinutes] = useState(60);
  const [drill, setDrill] = useState<DrillResult | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [redoQueue, setRedoQueue] = useState<RedoItem[]>(() => seedRedo(nowDate()));
  const [replayViewed, setReplayViewed] = useState(false);

  const getSet = useCallback((id: string) => registry.current[id], []);
  const codeOf = useCallback((id: string) => codes.current[id], []);
  const labelOf = useCallback((id: string) => (codes.current[id] ? `Set ${codes.current[id]}` : `Set ${id}`), []);

  const newRound = useCallback(() => {
    const n = round.n + 1;
    const sets = generateRound(n);
    sets.forEach((s, i) => {
      registry.current[s.id] = s;
      codes.current[s.id] = LETTERS[i];
    });
    setRound({ n, ids: sets.map((s) => s.id), generated: true });
    setDrill(null);
    setAttempts([]);
    setReplayViewed(false);
  }, [round.n]);

  const submitDrill = useCallback(
    (order: string[], auto: boolean) => setDrill({ roundN: round.n, order, auto, at: Date.now() }),
    [round.n],
  );

  const addAttempt = useCallback((a: Attempt) => {
    setAttempts((xs) => [...xs, a]);
    setReplayViewed(false);
  }, []);

  const addRedo = useCallback(
    (items: RedoItem[]) =>
      setRedoQueue((q) => {
        const fresh = items.filter((it) => !q.some((x) => x.setId === it.setId && x.dueISO === it.dueISO));
        return [...q, ...fresh];
      }),
    [],
  );

  const sessions = student.lastFiveSessions as Session[];
  const paceSamples = useMemo<PaceSample[]>(() => {
    const own = attempts
      .map((a) => ({ setId: a.setId, expectedMinutes: registry.current[a.setId]?.expectedMinutes ?? 0, actualMinutes: attemptMinutes(a) }))
      .filter((p) => p.expectedMinutes > 0 && p.actualMinutes > 0.05);
    return [...(student.paceHistory as PaceSample[]), ...own];
  }, [attempts]);
  const pace = useMemo(() => paceFactor(paceSamples), [paceSamples]);

  const roundSets = useMemo(() => round.ids.map((id) => registry.current[id]), [round]);

  const topicAttempts = useMemo(() => {
    return (student.topicAttempts as { topic: string; attempts: number; accuracy: number | null }[]).map((t) => {
      if (t.topic !== 'Circular seating' || !attempts.length) return t;
      const answered = attempts.flatMap((a) => a.questions).filter((q) => q.correct !== null);
      const right = answered.filter((q) => q.correct).length;
      const total = t.attempts + attempts.length;
      const prior = (t.accuracy ?? 0) * t.attempts;
      const newAcc = (prior + (answered.length ? right / answered.length : 0) * attempts.length) / total;
      return { ...t, attempts: total, accuracy: newAcc };
    });
  }, [attempts]);

  const value: Store = {
    windowMinutes,
    setWindowMinutes,
    getSet,
    codeOf,
    labelOf,
    round,
    roundSets,
    newRound,
    drill,
    submitDrill,
    attempts,
    addAttempt,
    redoQueue,
    addRedo,
    replayViewed,
    markReplayViewed: () => setReplayViewed(true),
    sessions,
    paceSamples,
    pace,
    topicAttempts,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('StoreProvider missing');
  return v;
}

export function recommendedFor(sets: PuzzleSet[]): PuzzleSet[] {
  return recommendedOrder(sets);
}
