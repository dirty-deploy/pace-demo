import type { DilrSet, Group, Passage, Question, Section, VocabWord } from './types';
import { QA_BANK } from './qa';
import { PASSAGES, VARC_QUESTIONS } from './varc';
import { DILR_QUESTIONS, DILR_SETS } from './dilr';
import { VOCAB } from './vocab';

export { DILR_SETS, PASSAGES, QA_BANK, VARC_QUESTIONS, DILR_QUESTIONS, VOCAB };

export const BANK: Question[] = [...VARC_QUESTIONS, ...DILR_QUESTIONS, ...QA_BANK];

const BY_ID = new Map(BANK.map((q) => [q.id, q]));
const GROUPS = new Map<string, Group>([...PASSAGES, ...DILR_SETS].map((g) => [g.id, g]));

export function questionById(id: string): Question | undefined {
  return BY_ID.get(id);
}

/** Bank question by id. Use where the id comes from our own tests or attempts. */
export function getQuestion(id: string): Question {
  const q = BY_ID.get(id);
  if (!q) throw new Error(`Unknown question ${id}`);
  return q;
}

export function groupOf(q: Question): Group | undefined {
  return q.groupId ? GROUPS.get(q.groupId) : undefined;
}

export const passageById = (id: string): Passage | undefined => PASSAGES.find((p) => p.id === id);
export const setById = (id: string): DilrSet | undefined => DILR_SETS.find((s) => s.id === id);

export function topicsBySection(): Record<Section, string[]> {
  const out: Record<Section, string[]> = { VARC: [], DILR: [], QA: [] };
  for (const q of BANK) if (!out[q.section].includes(q.topic)) out[q.section].push(q.topic);
  return out;
}

export const vocabByWord = new Map<string, VocabWord>(VOCAB.map((w) => [w.word, w]));
