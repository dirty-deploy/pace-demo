import type { Question } from '../content/types';

/** The 5-attempt rule: below this, a topic has no label anywhere on the site. */
export const MIN_ATTEMPTS = 5;

export type AnsweredItem = { questionId: string; correct: boolean | null; seconds: number };

export type TopicRow = {
  topic: string;
  section: string;
  attempts: number;
  correct: number;
  accuracy: number | null;
  label: string;
  avgSeconds: number | null;
};

export function topicLabel(attempts: number, accuracy: number | null): string {
  if (attempts < MIN_ATTEMPTS || accuracy === null) return 'Not enough data yet';
  if (accuracy >= 0.7) return 'Strength';
  if (accuracy < 0.5) return 'Needs work';
  return 'Steady';
}

/** Attempts are questions answered. Skipped questions are not attempts. */
export function topicRows(items: AnsweredItem[], lookup: (id: string) => Question | undefined): TopicRow[] {
  const map = new Map<string, { section: string; attempts: number; correct: number; seconds: number }>();
  for (const it of items) {
    const q = lookup(it.questionId);
    if (!q || it.correct === null) continue;
    const row = map.get(q.topic) ?? { section: q.section, attempts: 0, correct: 0, seconds: 0 };
    row.attempts++;
    row.seconds += it.seconds;
    if (it.correct) row.correct++;
    map.set(q.topic, row);
  }
  return [...map.entries()]
    .map(([topic, r]) => {
      const accuracy = r.attempts ? r.correct / r.attempts : null;
      return {
        topic,
        section: r.section,
        attempts: r.attempts,
        correct: r.correct,
        accuracy,
        label: topicLabel(r.attempts, accuracy),
        avgSeconds: r.attempts ? r.seconds / r.attempts : null,
      };
    })
    .sort((a, b) => a.section.localeCompare(b.section) || b.attempts - a.attempts);
}
