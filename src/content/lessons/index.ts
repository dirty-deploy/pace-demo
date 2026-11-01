import type { LessonId, Question } from '../types';
import diTables from './di-tables';
import dilrSetChoice from './dilr-set-choice';
import pjOpeningPairs from './pj-opening-pairs';
import qaPercentFractions from './qa-percent-fractions';
import qaTimeWorkLcm from './qa-time-work-lcm';
import rcInference from './rc-inference';
import type { Lesson } from './types';

export type { Chapter, Lesson, Slide, SlideBody, TranscriptLine } from './types';
export { formatTime, lineIndexAt, revealCountAt } from './types';

export const LESSONS: Lesson[] = [rcInference, pjOpeningPairs, dilrSetChoice, diTables, qaPercentFractions, qaTimeWorkLcm];

export const LESSON_QUESTIONS: Question[] = LESSONS.flatMap((l) => l.practice);

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

/** Where each lesson's main idea begins, in whole seconds. Used by "Jump to the concept" links. */
export const CONCEPT_SECONDS = Object.fromEntries(LESSONS.map((l) => [l.id, l.conceptSeconds])) as Record<LessonId, number>;
