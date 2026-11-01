import { earn, spend, type EarnAction, type SpendItem } from '../logic/coins';
import { toISO } from '../logic/dates';
import { applyShields, ruleMet, type DayActivity, type StreakRule } from '../logic/streak';
import { getState, today, update } from './store';
import type { AppState, Note, PlannerBlock, Profile, Settings } from './schema';
import { toast } from '../components/ui';

export const todayISO = () => toISO(today());

export const ruleOf = (s: Pick<AppState, 'settings'>): StreakRule => ({
  questions: s.settings.streakQuestions,
  lessonMinutes: s.settings.streakLessonMinutes,
});

export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const EMPTY_DAY: DayActivity = { questions: 0, lessonSeconds: 0, minutes: 0 };

/** Applies an earn rule to a state value; used inside larger updates. */
function withCoins(s: AppState, action: EarnAction): AppState {
  const entry = earn(s.coins, action, Date.now(), toISO(today()));
  return entry ? { ...s, coins: [...s.coins, entry] } : s;
}

export function earnCoins(action: EarnAction) {
  update((s) => withCoins(s, action));
}

/** Adds to today's activity, and pays the streak coin the moment the rule is first met. */
export function logActivity(add: Partial<Omit<DayActivity, 'shielded'>>) {
  update((s) => {
    const iso = toISO(today());
    const before = s.days[iso] ?? EMPTY_DAY;
    const after: DayActivity = {
      ...before,
      questions: before.questions + (add.questions ?? 0),
      lessonSeconds: before.lessonSeconds + (add.lessonSeconds ?? 0),
      minutes: before.minutes + (add.minutes ?? 0),
    };
    const rule = ruleOf(s);
    const next = { ...s, days: { ...s.days, [iso]: after } };
    return !ruleMet(before, rule) && ruleMet(after, rule) ? withCoins(next, 'streak') : next;
  });
}

/** Run on app start: spends a held shield if yesterday was missed. */
export function reconcileShields() {
  const s = getState();
  if (!s.profile?.onboarded || s.purchases.shields <= 0) return;
  const r = applyShields(s.days, s.purchases.shields, today(), ruleOf(s));
  if (r.covered.length) {
    update((x) => ({ ...x, days: r.log, purchases: { ...x.purchases, shields: r.shields } }));
  }
}

export function buy(item: SpendItem): boolean {
  const s = getState();
  const entry = spend(s.coins, item, Date.now(), toISO(today()));
  if (!entry) return false;
  update((x) => ({
    ...x,
    coins: [...x.coins, entry],
    purchases: {
      ...x.purchases,
      shields: x.purchases.shields + (item === 'shield' ? 1 : 0),
      mockUnlocked: x.purchases.mockUnlocked || item === 'mock-unlock',
      formulaSheet: x.purchases.formulaSheet || item === 'formula-sheet',
    },
  }));
  reconcileShields();
  return true;
}

export function saveProfile(patch: Partial<Profile>) {
  update((s) => (s.profile ? { ...s, profile: { ...s.profile, ...patch } } : s));
}

export function saveSettings(patch: Partial<Settings>) {
  update((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
}

// ---- Planner ----

export function addBlock(b: Omit<PlannerBlock, 'id' | 'done'>): string {
  const id = newId('b');
  update((s) => ({ ...s, planner: [...s.planner, { ...b, id, done: false }] }));
  return id;
}

export function updateBlock(id: string, patch: Partial<PlannerBlock>) {
  update((s) => ({ ...s, planner: s.planner.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
}

export function removeBlock(id: string) {
  update((s) => ({ ...s, planner: s.planner.filter((b) => b.id !== id) }));
}

// ---- Notes ----

export function addNote(n: Omit<Note, 'id' | 'createdAt'>): string {
  const id = newId('n');
  update((s) => ({ ...s, notes: [{ ...n, id, createdAt: Date.now() }, ...s.notes] }));
  return id;
}

export function saveLineToNotes(line: string, topic: string, source: string) {
  addNote({ title: line.length > 48 ? `${line.slice(0, 48).trim()}…` : line, text: line, tags: ['From review'], topic, source });
  toast('Saved to My notes');
}

export function updateNote(id: string, patch: Partial<Note>) {
  update((s) => ({ ...s, notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch } : n)) }));
}

export function removeNote(id: string) {
  update((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) }));
}

// ---- Community ----

export function toggleUpvote(id: string) {
  update((s) => {
    const upvoted = { ...s.community.upvoted };
    if (upvoted[id]) delete upvoted[id];
    else upvoted[id] = true;
    return { ...s, community: { ...s.community, upvoted } };
  });
}

export function addCommunityAnswer(questionId: string, text: string) {
  update((s) => {
    const list = s.community.answers[questionId] ?? [];
    const post = { id: newId('a'), author: 'You' as const, text, at: Date.now(), upvotes: 0 };
    return { ...s, community: { ...s.community, answers: { ...s.community.answers, [questionId]: [post, ...list] } } };
  });
}

export function addThreadReply(threadId: string, text: string) {
  update((s) => {
    const post = { id: newId('r'), author: 'You' as const, text, at: Date.now(), upvotes: 0 };
    const own = s.community.threads.some((t) => t.id === threadId);
    if (own) {
      return { ...s, community: { ...s.community, threads: s.community.threads.map((t) => (t.id === threadId ? { ...t, replies: [...t.replies, post] } : t)) } };
    }
    const list = s.community.replies[threadId] ?? [];
    return { ...s, community: { ...s.community, replies: { ...s.community.replies, [threadId]: [...list, post] } } };
  });
}

export function addThread(topic: string, title: string, text: string): string {
  const id = newId('t');
  update((s) => ({
    ...s,
    community: { ...s.community, threads: [{ id, topic, title, text, at: Date.now(), upvotes: 0, replies: [] }, ...s.community.threads] },
  }));
  return id;
}
