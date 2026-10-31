export type ClueKind = 'cw' | 'opp' | 'adj' | 'nadj' | 'nopp';

/** Indices refer to the `people` array of a set. For `cw`, b sits `d` seats clockwise of a. */
export type Clue = { kind: ClueKind; a: number; b: number; d?: number };

export type Question = { prompt: string; options: string[]; answer: string };

export type ClueTypes = { fixed: number; adjacency: number; negative: number };

export type DifficultyLabel = 'Easier' | 'Medium' | 'Harder';

export type PuzzleSet = {
  id: string;
  family: string;
  people: string[];
  clues: string[];
  clueTypes: ClueTypes;
  solutionClockwiseFrom: string[];
  questions: Question[];
  solverNodes: number;
  difficultyScore: number;
  expectedMinutes: number;
  difficultyLabel: DifficultyLabel;
};

export type AttemptQuestion = { chosen: string | null; correct: boolean | null; seconds: number };

export type Attempt = {
  setId: string;
  startedAt: number;
  endedAt: number;
  capMinutes: number;
  hitCap: boolean;
  extended: boolean;
  left: boolean;
  stalledOnClue: number | null;
  questions: AttemptQuestion[];
};

export type Session = { date: string; plannedMinutes: number; completedMinutes: number };
export type PaceSample = { setId: string; expectedMinutes: number; actualMinutes: number };
