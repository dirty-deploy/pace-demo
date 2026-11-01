// Shared content schema for everything in src/content. See src/data/README.md.

export type Section = 'VARC' | 'DILR' | 'QA';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

/** Link from a question to the moment in a lesson that covers its idea. */
export type LessonRef = { lessonId: LessonId; seconds: number };

export type LessonId =
  | 'rc-inference'
  | 'pj-opening-pairs'
  | 'dilr-set-choice'
  | 'di-tables'
  | 'qa-percent-fractions'
  | 'qa-time-work-lcm';

type QuestionBase = {
  /** Stable and unique across the whole bank, for example "QA014", "RC2-3", "PJ04", "S07-2". */
  id: string;
  section: Section;
  /** Exact topic name from the TOPICS list below. */
  topic: string;
  /** Finer label, for example "Inference", "Successive change", "Opening sentence". */
  subType: string;
  difficulty: Difficulty;
  expectedSeconds: number;
  prompt: string;
  /** Plain-language explanation of how to reach the answer. */
  explanation: string;
  /** The named trap, for example "Distortion trap", "Partial scope trap", "Calculation slip". */
  trap: string;
  lessonRef?: LessonRef;
  /** Id of the passage or DILR set this question belongs to. */
  groupId?: string;
  /** Short paragraph shown above the prompt (para-summaries). */
  paragraph?: string;
  /** Numbered sentences, shown as 1, 2, 3... (para-jumbles, odd sentence out). */
  sentences?: string[];
};

export type McqQuestion = QuestionBase & {
  kind: 'mcq';
  /** Exactly 4 distinct options. */
  options: string[];
  answerIndex: number;
  /** Index of the most tempting wrong option. The sample distribution makes it the top wrong choice. */
  trapIndex: number;
};

export type TitaQuestion = QuestionBase & {
  kind: 'tita';
  /** Exact expected text: a number ("240", "12.5") or a digit sequence for para-jumbles ("3142"). */
  answer: string;
  /** Exactly 3 plausible wrong values, most common first. Never equal to the answer. */
  commonWrong: string[];
};

export type Question = McqQuestion | TitaQuestion;

// ---- Groups: RC passages and DILR sets ----

export type Passage = {
  id: string; // "RC1"
  kind: 'passage';
  section: 'VARC';
  title: string;
  topic: 'Reading comprehension';
  difficulty: Difficulty;
  /** 450 to 600 words in total. */
  paragraphs: string[];
  questionIds: string[];
};

export type StimulusBlock =
  | { type: 'text'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; caption?: string; columns: string[]; rows: (string | number)[][] }
  | { type: 'bars'; caption: string; unit: string; categories: string[]; series: { name: string; values: number[] }[] };

export type DilrFamily = 'circular-seating' | 'linear-arrangement' | 'di-table' | 'di-chart' | 'scheduling';

export type DilrSet = {
  id: string; // "S01".."S15" seating, "L01" linear, "T01" table, "C01" chart, "G01" grid/schedule
  kind: 'set';
  section: 'DILR';
  title: string;
  family: DilrFamily;
  topic: string;
  difficulty: Difficulty;
  expectedMinutes: number;
  /** Solver effort or step count behind the difficulty label. */
  effort: { measure: string; value: number };
  stimulus: StimulusBlock[];
  questionIds: string[];
};

export type Group = Passage | DilrSet;

// ---- Vocabulary ----

export type VocabWord = {
  word: string; // lower case, base form: "obfuscate"
  simple: string; // "hide"
  pos: 'noun' | 'verb' | 'adjective' | 'adverb';
  meaning: string; // one line of plain English
  example: string; // original sentence that uses the word
  /**
   * Inflected forms that appear in content, each mapped to the matching form of the simpler word,
   * so the swapped sentence stays grammatical: { obfuscates: 'hides', obfuscated: 'hid' }.
   */
  forms?: Record<string, string>;
};

/** Vocabulary practice items. A distractor must not be a synonym of the right answer. */
export type VocabPractice = {
  word: string;
  /** Format 1: a new sentence with the word used, and 4 simpler-word choices. */
  simpler: { sentence: string; options: string[]; answerIndex: number };
  /** Format 2: 4 sentences, only one uses the word correctly. */
  usage: { sentences: string[]; answerIndex: number };
  /** Format 3: sentence with "____", 4 words to fill. */
  blank: { sentence: string; options: string[]; answerIndex: number };
};

// ---- Fixed topic lists ----

export const QA_TOPICS = [
  'Percentages',
  'Profit and loss',
  'Ratio and proportion',
  'Time and work',
  'Time speed distance',
  'Simple and compound interest',
  'Averages',
  'Mixtures and alligation',
  'Equations',
  'Inequalities',
  'Functions',
  'Progressions',
  'Geometry',
  'Mensuration',
  'Number systems',
  'Permutations and combinations',
  'Probability',
  'Set theory',
] as const;

export const VARC_TOPICS = ['Reading comprehension', 'Para-jumbles', 'Para-summary', 'Odd sentence out'] as const;

export const DILR_TOPICS = ['Circular seating', 'Linear arrangement', 'Data tables', 'Data charts', 'Scheduling'] as const;
