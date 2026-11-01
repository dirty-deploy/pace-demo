import type { Section } from '../content/types';
import type { CoinEntry } from '../logic/coins';
import type { DailyConfig } from '../logic/dailyset';
import type { Subject } from '../logic/quickadd';
import type { DayLog } from '../logic/streak';
import type { TestMode } from '../logic/testRules';
import type { WordState } from '../logic/vocabSpacing';
import { EXAM_DATE } from '../logic/dates';

export const STORAGE_KEY = 'pace.v2';
export const SCHEMA_VERSION = 1;

export type ExamName = 'CAT 2026' | 'XAT 2027';
export type Theme = 'light' | 'dark' | 'system';
export type TestType = 'mock' | 'sectional' | 'topic' | 'daily' | 'redo';

export type Profile = {
  name: string;
  exam: ExamName;
  examDate: string;
  weekdayMinutes: number;
  weekendMinutes: number;
  targetPercentile: number | null;
  onboarded: boolean;
  demo: boolean;
};

export type Settings = {
  theme: Theme;
  streakQuestions: number;
  streakLessonMinutes: number;
};

// ---- Tests ----

export type TestSection = { section: Section; name: string; minutes: number | null; questionIds: string[] };

export type TestDef = {
  id: string;
  type: TestType;
  name: string;
  mode: TestMode;
  sections: TestSection[];
  /** Soft cap per DILR set (practice and sectional only, never in mocks). */
  capped: boolean;
};

export type QuestionState = { answer: string | null; marked: boolean; visited: boolean; seconds: number };

export type SetTrack = {
  setId: string;
  seconds: number;
  capSeconds: number;
  hitCap: boolean;
  extended: boolean;
  left: boolean;
  /** Index of the clue where the student says progress stopped. */
  stalledClue: number | null;
};

export type ActiveAttempt = {
  id: string;
  def: TestDef;
  startedAt: number;
  sectionIndex: number;
  questionIndex: number;
  /** Seconds left per section; null where the section has no limit. */
  secondsLeft: (number | null)[];
  secondsUsed: number[];
  states: Record<string, QuestionState>;
  sets: Record<string, SetTrack>;
  /** Set order chosen in the pre-test pick, if the student did it. */
  setOrder: string[] | null;
  paused: boolean;
  updatedAt: number;
};

export type AttemptQuestion = {
  id: string;
  section: Section;
  answer: string | null;
  correct: boolean | null;
  seconds: number;
  marked: boolean;
};

export type AttemptSection = {
  section: Section;
  name: string;
  score: number;
  max: number;
  correct: number;
  wrong: number;
  skipped: number;
  seconds: number;
};

export type AttemptRecord = {
  id: string;
  testId: string;
  testName: string;
  type: TestType;
  mode: TestMode;
  startedAt: number;
  endedAt: number;
  score: number;
  max: number;
  accuracy: number | null;
  sections: AttemptSection[];
  questions: AttemptQuestion[];
  /** DILR detail for the replay. */
  dilr: { order: string[]; recommended: string[]; sets: SetTrack[] } | null;
  reviewed: boolean;
};

// ---- Set-pick drill ----

export type DrillRecord = { id: string; at: number; order: string[]; recommended: string[]; tau: number; setIds: string[] };

// ---- Redo ----

export type RedoEntry = {
  id: string;
  setId: string;
  label: string;
  reason: string;
  minutes: number;
  dueISO: string;
  done: boolean;
  fromAttempt: string | null;
};

// ---- Lessons, planner, notes, community ----

export type LessonProgress = {
  position: number;
  watchedSeconds: number;
  done: boolean;
  practice: Record<string, { answer: string; correct: boolean }>;
};

export type PlannerBlock = {
  id: string;
  title: string;
  subject: Subject;
  dateISO: string;
  startMin: number;
  minutes: number;
  done: boolean;
  activity: string | null;
};

export type Note = {
  id: string;
  title: string;
  text: string;
  tags: string[];
  topic: string;
  createdAt: number;
  source: string | null;
};

export type CommunityPost = { id: string; author: 'You'; text: string; at: number; upvotes: number };

export type CommunityState = {
  /** The student's answers per question id. */
  answers: Record<string, CommunityPost[]>;
  /** Student-started threads. */
  threads: { id: string; topic: string; title: string; text: string; at: number; upvotes: number; replies: CommunityPost[] }[];
  /** The student's replies on sample threads. */
  replies: Record<string, CommunityPost[]>;
  /** Ids the student upvoted. */
  upvoted: Record<string, boolean>;
};

export type Preset = { id: string; name: string; config: DailyConfig };

export type Purchases = {
  shields: number;
  mockUnlocked: boolean;
  formulaSheet: boolean;
  coupons: { code: string; course: string; rupees: number; coins: number; at: number }[];
};

export type AppState = {
  version: number;
  profile: Profile | null;
  settings: Settings;
  active: Record<string, ActiveAttempt>;
  attempts: AttemptRecord[];
  drills: DrillRecord[];
  redo: RedoEntry[];
  lessons: Record<string, LessonProgress>;
  days: DayLog;
  planner: PlannerBlock[];
  /** Saved alum note ids are also in `notes`; this keeps upvotes. */
  notes: Note[];
  noteUpvotes: Record<string, boolean>;
  noteHighlights: Record<string, string[]>;
  vocab: Record<string, WordState>;
  community: CommunityState;
  coins: CoinEntry[];
  presets: Preset[];
  purchases: Purchases;
  /** Sessions for the v1 plan formula: planned and completed minutes per day. */
  sessions: { date: string; plannedMinutes: number; completedMinutes: number }[];
  /** Pace samples for the v1 cap formula. */
  pace: { setId: string; expectedMinutes: number; actualMinutes: number }[];
  /** Minutes the student says they have today, when it differs from the usual. */
  dayOverride: { date: string; minutes: number } | null;
  /** Dates the vocabulary practice was finished on. */
  vocabDays: string[];
};

export const DEFAULT_SETTINGS: Settings = { theme: 'system', streakQuestions: 1, streakLessonMinutes: 5 };

export const QUICK_10: Preset = {
  id: 'quick-10',
  name: 'Quick 10',
  config: { count: 10, minutes: 20, mix: 'match', topics: [] },
};

export function emptyState(): AppState {
  return {
    version: SCHEMA_VERSION,
    profile: null,
    settings: { ...DEFAULT_SETTINGS },
    active: {},
    attempts: [],
    drills: [],
    redo: [],
    lessons: {},
    days: {},
    planner: [],
    notes: [],
    noteUpvotes: {},
    noteHighlights: {},
    vocab: {},
    community: { answers: {}, threads: [], replies: {}, upvoted: {} },
    coins: [],
    presets: [QUICK_10],
    purchases: { shields: 0, mockUnlocked: false, formulaSheet: false, coupons: [] },
    sessions: [],
    pace: [],
    dayOverride: null,
    vocabDays: [],
  };
}

export function newProfile(over: Partial<Profile> = {}): Profile {
  return {
    name: '',
    exam: 'CAT 2026',
    examDate: EXAM_DATE,
    weekdayMinutes: 60,
    weekendMinutes: 120,
    targetPercentile: null,
    onboarded: false,
    demo: false,
    ...over,
  };
}
