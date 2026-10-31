import type { PuzzleSet } from './types';

/** Recommended order: ascending difficultyScore; ties by fewer clues, then more fixed clues. */
export function recommendedOrder(sets: PuzzleSet[]): PuzzleSet[] {
  return [...sets].sort(
    (a, b) =>
      a.difficultyScore - b.difficultyScore ||
      a.clues.length - b.clues.length ||
      b.clueTypes.fixed - a.clueTypes.fixed ||
      a.id.localeCompare(b.id),
  );
}

export type Agreement = { concordant: number; discordant: number; pairs: number; tau: number };

/** Kendall's tau between two orderings (arrays of ids) of the same items. */
export function kendall(yours: string[], recommended: string[]): Agreement {
  const pos = new Map(recommended.map((id, i) => [id, i]));
  let concordant = 0;
  let discordant = 0;
  for (let i = 0; i < yours.length; i++) {
    for (let j = i + 1; j < yours.length; j++) {
      // In your order, i comes before j. Concordant if the recommendation agrees.
      if ((pos.get(yours[i]) as number) < (pos.get(yours[j]) as number)) concordant++;
      else discordant++;
    }
  }
  const pairs = concordant + discordant;
  return { concordant, discordant, pairs, tau: pairs ? (concordant - discordant) / pairs : 1 };
}

/** Minutes the student's first pick would likely cost compared with the recommended first pick. */
export function startCostMinutes(yourFirst: PuzzleSet, recommendedFirst: PuzzleSet): number {
  return Math.max(0, Math.round((yourFirst.expectedMinutes - recommendedFirst.expectedMinutes) * 10) / 10);
}
