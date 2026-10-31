import type { PuzzleSet } from './types';

/** Rule-based, one-sentence reason for a set, from its clue mix (BUILD_SPEC 7.2). */
export function reasonFor(set: PuzzleSet): string {
  const n = set.clues.length;
  const { fixed, adjacency, negative } = set.clueTypes;
  let text: string;
  if (fixed >= n - 1) {
    text = `${n} clues, mostly fixed positions: quickest to lock down.`;
  } else if (negative > 0) {
    text = `${negative} negative clue${negative > 1 ? 's' : ''} ('does not sit…'), which ${negative > 1 ? 'leave' : 'leaves'} more arrangements open.`;
  } else if (adjacency >= 2) {
    text = `Several 'sits next to' clues: each allows two placements, so expect more trial and error.`;
  } else {
    text = 'Mixed clues: middle of the pack.';
  }
  return `${text} (estimated: ${set.difficultyLabel})`;
}

/** Preview line for the drill cards, for example "4 clues: 2 fixed positions, 1 adjacency, 1 negative". */
export function clueMix(set: PuzzleSet): string {
  const { fixed, adjacency, negative } = set.clueTypes;
  const parts: string[] = [];
  if (fixed) parts.push(`${fixed} fixed position${fixed > 1 ? 's' : ''}`);
  if (adjacency) parts.push(`${adjacency} adjacency`);
  if (negative) parts.push(`${negative} negative`);
  return `${set.clues.length} clues: ${parts.join(', ')}`;
}

/** "Set A" style letter for a position in a round. */
export function setLetter(index: number): string {
  return String.fromCharCode(65 + index);
}
