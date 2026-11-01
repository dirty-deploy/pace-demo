// The full Quantitative Aptitude bank, QA001 to QA073.

import type { QaQuestion } from '../defineQa';
import { ALGEBRA } from './algebra';
import { ARITHMETIC } from './arithmetic';
import { GEOMETRY } from './geometry';
import { MODERN } from './modern';
import { NUMBERS } from './numbers';

export const QA_BANK: QaQuestion[] = [...ARITHMETIC, ...ALGEBRA, ...GEOMETRY, ...NUMBERS, ...MODERN];
