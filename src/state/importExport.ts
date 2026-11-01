import { balanceOf } from '../logic/coins';
import { SCHEMA_VERSION, type AppState } from './schema';
import { migrate } from './store';

/** Pure export and import logic. Settings does the file handling and the state change. */

export type ImportResult = { ok: true; state: AppState } | { ok: false; message: string };

const UNCHANGED = 'Nothing was changed.';
const NOT_PACE = `That file isn't a Pace export. ${UNCHANGED}`;

export const exportFilename = (isoDate: string) => `pace-data-${isoDate}.json`;

export const exportJson = (state: AppState) => JSON.stringify(state, null, 2);

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isISO = (v: unknown) => isStr(v) && /^\d{4}-\d{2}-\d{2}$/.test(v);

const ARRAYS = ['attempts', 'drills', 'redo', 'planner', 'notes', 'coins', 'presets', 'sessions', 'pace', 'vocabDays'] as const;
const RECORDS = ['active', 'lessons', 'days', 'noteUpvotes', 'noteHighlights', 'vocab'] as const;

const goodProfile = (p: unknown) =>
  p === null ||
  (isRecord(p) &&
    isStr(p.name) &&
    (p.exam === 'CAT 2026' || p.exam === 'XAT 2027') &&
    isISO(p.examDate) &&
    isNum(p.weekdayMinutes) &&
    isNum(p.weekendMinutes) &&
    typeof p.onboarded === 'boolean');

const goodSettings = (s: unknown) =>
  isRecord(s) && (s.theme === 'light' || s.theme === 'dark' || s.theme === 'system') && isNum(s.streakQuestions) && isNum(s.streakLessonMinutes);

const goodAttempt = (a: unknown) =>
  isRecord(a) && isStr(a.id) && isStr(a.testId) && isNum(a.endedAt) && isNum(a.score) && isNum(a.max) && Array.isArray(a.sections) && Array.isArray(a.questions);

const goodCoin = (c: unknown) => isRecord(c) && isNum(c.delta) && isNum(c.at) && isStr(c.label);

const goodRedo = (r: unknown) => isRecord(r) && isStr(r.id) && isStr(r.setId) && isISO(r.dueISO);

const goodCommunity = (c: unknown) => isRecord(c) && isRecord(c.answers) && isRecord(c.replies) && isRecord(c.upvoted) && Array.isArray(c.threads);

const goodPurchases = (p: unknown) => isRecord(p) && isNum(p.shields) && Array.isArray(p.coupons);

/** `migrate` fills the gaps but trusts what is there. Returns the name of the first damaged part, or null. */
function damagedPart(state: AppState): string | null {
  const s = state as unknown as Record<string, unknown>;
  for (const key of ARRAYS) if (!Array.isArray(s[key])) return key;
  for (const key of RECORDS) if (!isRecord(s[key])) return key;
  if (!goodProfile(state.profile)) return 'profile';
  if (!goodSettings(state.settings)) return 'settings';
  if (!state.attempts.every(goodAttempt)) return 'attempts';
  if (!state.coins.every(goodCoin)) return 'coins';
  if (!state.redo.every(goodRedo)) return 'redo';
  if (!goodCommunity(state.community)) return 'community';
  if (!goodPurchases(state.purchases)) return 'purchases';
  return null;
}

/** Reads the text of a chosen file. Never touches the store, so a bad file changes nothing. */
export function parseImport(text: string): ImportResult {
  if (!text.trim()) return { ok: false, message: `That file is empty. ${UNCHANGED}` };
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, message: `That file isn't valid JSON, so it can't be a Pace export. ${UNCHANGED}` };
  }
  if (!isRecord(raw) || !isNum(raw.version)) return { ok: false, message: NOT_PACE };
  if (raw.version > SCHEMA_VERSION) return { ok: false, message: `That file comes from a newer version of Pace. ${UNCHANGED}` };
  // A version number alone would otherwise import as an empty student.
  if (!Object.keys(raw).some((k) => k !== 'version')) return { ok: false, message: NOT_PACE };
  const state = migrate(raw);
  if (!state) return { ok: false, message: NOT_PACE };
  const damaged = damagedPart(state);
  if (damaged) return { ok: false, message: `That file looks like a Pace export, but its ${damaged} data is damaged. ${UNCHANGED}` };
  return { ok: true, state };
}

/** One line for the confirmation, so the student can see what they are about to load. */
export function importSummary(state: AppState): string {
  const who = state.profile?.name ? `${state.profile.name}'s data` : 'Data with no profile';
  const n = state.attempts.length;
  return `${who}: ${n} ${n === 1 ? 'attempt' : 'attempts'}, ${balanceOf(state.coins)} coins.`;
}
