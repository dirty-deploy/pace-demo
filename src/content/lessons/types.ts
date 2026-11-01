// Lesson schema and the timeline builder. Nothing here touches the DOM, so tests can import it.
import type { LessonId, McqQuestion, Question, Section, TitaQuestion } from '../types';

/** Speaking rate. Every timestamp in a lesson comes from word counts at this rate. */
export const WORDS_PER_MINUTE = 140;
export const SECONDS_PER_WORD = 60 / WORDS_PER_MINUTE;
/** A short breath between sentences, in seconds. */
export const SENTENCE_PAUSE = 0.2;

export type DiagramId =
  | 'inference-scale'
  | 'negation-flow'
  | 'pj-funnel'
  | 'pj-chain'
  | 'dilr-two-starts'
  | 'dilr-time-bar'
  | 'di-frame'
  | 'pf-grid'
  | 'pf-cancel'
  | 'tw-units'
  | 'tw-net'
  | 'tw-alternate';

/** Parts of a table to highlight. Rows and cells count data rows only, from 0. */
export type TableMark = { rows?: number[]; cols?: number[]; cells?: [number, number][] };

export type VerdictItem = { text: string; verdict: string; keep: boolean };

export type SlideBody =
  | { kind: 'title'; title: string; subtitle: string }
  /** Items appear one by one. `lead` is a quoted sentence or passage that is always visible. */
  | { kind: 'points'; title: string; lead?: string; items: string[]; numbered?: boolean }
  /** Worked steps under the problem in `given`. The last step is the result. */
  | { kind: 'steps'; title: string; given: string; items: string[] }
  /** Items are always visible; their verdicts appear one by one. */
  | { kind: 'verdicts'; title: string; items: VerdictItem[] }
  | { kind: 'diagram'; title: string; diagram: DiagramId }
  /** `marks[n]` is the highlight after the (n+1)th reveal; only the latest one shows. */
  | { kind: 'table'; title: string; note?: string; columns: string[]; rows: (string | number)[][]; marks: TableMark[] };

/** A sentence, or a sentence that also reveals the next item on its slide. */
export type LineInput = string | { say: string; reveal: true };

export const r = (say: string): LineInput => ({ say, reveal: true });

export type SlideInput = {
  body: SlideBody;
  lines: LineInput[];
  /** Starts a chapter at this slide. */
  chapter?: string;
  /** The lesson's main idea begins here. Used by "Jump to the concept" links. */
  concept?: boolean;
};

type Authored = 'id' | 'section' | 'lessonRef';
export type PracticeInput = Omit<McqQuestion, Authored> | Omit<TitaQuestion, Authored>;

export type LessonInput = {
  id: LessonId;
  title: string;
  section: Section;
  topic: string;
  summary: string;
  slides: SlideInput[];
  practice: PracticeInput[];
};

export type TranscriptLine = {
  index: number;
  text: string;
  words: number;
  start: number;
  end: number;
  /** Index of the slide this line belongs to. */
  slide: number;
};

export type Slide = {
  index: number;
  body: SlideBody;
  start: number;
  end: number;
  /** Times at which the next item on this slide appears. */
  reveals: number[];
};

export type Chapter = { title: string; start: number };

export type Lesson = {
  id: LessonId;
  title: string;
  section: Section;
  topic: string;
  summary: string;
  /** Total read time in seconds. */
  durationSeconds: number;
  wordCount: number;
  slides: Slide[];
  transcript: TranscriptLine[];
  chapters: Chapter[];
  practice: Question[];
  /** Whole second, inside the first line of the slide marked `concept`. */
  conceptSeconds: number;
};

export const countWords = (text: string) => text.trim().split(/\s+/).length;

const to2dp = (n: number) => Math.round(n * 100) / 100;

/** Turns authored slides and sentences into a timed lesson. */
export function defineLesson(src: LessonInput): Lesson {
  const transcript: TranscriptLine[] = [];
  const slides: Slide[] = [];
  const chapters: Chapter[] = [];
  let clock = 0;
  let conceptSeconds = 0;

  src.slides.forEach((s, slide) => {
    const start = to2dp(clock);
    if (s.chapter) chapters.push({ title: s.chapter, start });
    if (s.concept) conceptSeconds = Math.ceil(start);
    const reveals: number[] = [];
    for (const line of s.lines) {
      const text = typeof line === 'string' ? line : line.say;
      const words = countWords(text);
      const lineStart = to2dp(clock);
      clock += words * SECONDS_PER_WORD + SENTENCE_PAUSE;
      transcript.push({ index: transcript.length, text, words, start: lineStart, end: to2dp(clock), slide });
      if (typeof line !== 'string') reveals.push(lineStart);
    }
    slides.push({ index: slide, body: s.body, start, end: to2dp(clock), reveals });
  });

  const lessonRef = { lessonId: src.id, seconds: conceptSeconds };
  return {
    id: src.id,
    title: src.title,
    section: src.section,
    topic: src.topic,
    summary: src.summary,
    durationSeconds: to2dp(clock),
    wordCount: transcript.reduce((n, l) => n + l.words, 0),
    slides,
    transcript,
    chapters,
    practice: src.practice.map((q, i) => ({ ...q, id: `L-${src.id}-${i + 1}`, section: src.section, lessonRef })),
    conceptSeconds,
  };
}

/** Index of the line being spoken at time t. */
export function lineIndexAt(lesson: Lesson, t: number): number {
  const lines = lesson.transcript;
  let lo = 0;
  let hi = lines.length - 1;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (lines[mid].start <= t) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/** How many items of this slide have appeared by time t. */
export const revealCountAt = (slide: Slide, t: number) => slide.reveals.filter((at) => at <= t).length;

/** "4:32". */
export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
