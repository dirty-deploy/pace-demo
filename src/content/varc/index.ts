import type { Question } from '../types';
import { PASSAGES, RC_QUESTIONS } from './passages';
import { ODD_ONE_OUT, PARA_JUMBLES, PARA_SUMMARIES } from './verbal';

export { PASSAGES };

export const VARC_QUESTIONS: Question[] = [...RC_QUESTIONS, ...PARA_JUMBLES, ...PARA_SUMMARIES, ...ODD_ONE_OUT];
