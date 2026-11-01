// The whole DILR bank: the 15 circular-seating sets from v1, adapted to the shared content schema,
// plus the 6 new sets from newSets.ts.

import data from '../../data/sample_sets.json';
import type { DifficultyLabel, PuzzleSet } from '../../logic/types';
import type { Difficulty, DilrSet, McqQuestion, Question } from '../types';
import { NEW_QUESTIONS, NEW_SETS } from './newSets';

const SEATING_SETS = data.sets as unknown as PuzzleSet[];

const DIFFICULTY: Record<DifficultyLabel, Difficulty> = { Easier: 'Easy', Medium: 'Medium', Harder: 'Hard' };

function seatingIntro(people: string[]): string {
  const list = `${people.slice(0, -1).join(', ')} and ${people[people.length - 1]}`;
  return (
    `Six friends, ${list}, sit around a circular table, equally spaced. Every seat is taken. ` +
    '"Clockwise" is the way the hands of a clock move, seen from above the table. ' +
    '"Two seats clockwise of" a person means two seats along that way, with one seat in between. ' +
    '"Next to" means in the seat on either side.'
  );
}

type SeatingKind = 'opposite' | 'clockwise' | 'between';

/** Reads a v1 prompt, for example "Who sits between Chetan and Asha, going clockwise from Chetan?". */
function readPrompt(prompt: string): { kind: SeatingKind; x: string } {
  const m = prompt.match(/^Who sits (directly opposite|immediately clockwise of|between) (\w+)/);
  if (!m) throw new Error(`Unknown seating prompt: ${prompt}`);
  const kind = m[1] === 'directly opposite' ? 'opposite' : m[1] === 'between' ? 'between' : 'clockwise';
  return { kind, x: m[2] };
}

const SUB_TYPE: Record<SeatingKind, string> = { opposite: 'Opposite', clockwise: 'Clockwise neighbour', between: 'Between' };
const TRAP: Record<SeatingKind, string> = { opposite: 'Opposite seat slip', clockwise: 'Direction slip', between: 'Between trap' };

/**
 * The most tempting wrong option. For clockwise and between questions this is the person the
 * reversed direction points to. Reversing does not change an opposite seat, so there it is the
 * person one seat short of opposite, on either side (at least one of the two is always an option).
 * If the reversed person is not an option, the first wrong one.
 */
function trapOption(kind: SeatingKind, at: (steps: number) => string, options: string[], answer: string): number {
  const candidates = kind === 'opposite' ? [at(2), at(-2)] : [at(-1)];
  const hit = candidates.find((name) => options.includes(name));
  return options.findIndex((o) => (hit ? o === hit : o !== answer));
}

function explain(kind: SeatingKind, sol: string[], x: string, answer: string, trapName: string, at: (steps: number) => string): string {
  const circle = `Only one arrangement fits every clue. Going clockwise from ${sol[0]}, the seats are ${sol.join(', ')}, and then back to ${sol[0]}.`;
  switch (kind) {
    case 'opposite':
      return `${circle} The opposite seat is three seats away. Counting clockwise from ${x}: ${at(1)}, ${at(2)}, ${at(3)}. So ${answer} sits directly opposite ${x}. Opposite seat slip: ${trapName} is two seats from ${x}, not three, so stopping one seat short gives the wrong name.`;
    case 'clockwise':
      return `${circle} The next seat clockwise from ${x} is ${answer}. Direction slip: ${at(-1)} is the neighbour on the anticlockwise side, so reading the circle backwards gives the wrong name.`;
    case 'between':
      return `${circle} Going clockwise from ${x}, the next seat is ${answer} and the seat after that is ${at(2)}. So ${answer} is the one between them. Between trap: ${at(-1)} also sits next to ${x}, but on the anticlockwise side, which is not the way the question goes.`;
  }
}

function seatingQuestions(s: PuzzleSet): McqQuestion[] {
  const difficulty = DIFFICULTY[s.difficultyLabel];
  const expectedSeconds = Math.round((s.expectedMinutes * 60) / s.questions.length);
  const sol = s.solutionClockwiseFrom;
  return s.questions.map((q, i) => {
    const { kind, x } = readPrompt(q.prompt);
    const at = (steps: number) => sol[(sol.indexOf(x) + steps + sol.length) % sol.length];
    const trapIndex = trapOption(kind, at, q.options, q.answer);
    return {
      id: `${s.id}-${i + 1}`,
      section: 'DILR',
      topic: 'Circular seating',
      subType: SUB_TYPE[kind],
      difficulty,
      expectedSeconds,
      prompt: q.prompt,
      explanation: explain(kind, sol, x, q.answer, q.options[trapIndex], at),
      trap: TRAP[kind],
      ...(i === 0 ? { lessonRef: { lessonId: 'dilr-set-choice' as const, seconds: 60 } } : {}),
      groupId: s.id,
      kind: 'mcq',
      options: q.options,
      answerIndex: q.options.indexOf(q.answer),
      trapIndex,
    };
  });
}

function seatingSet(s: PuzzleSet): DilrSet {
  return {
    id: s.id,
    kind: 'set',
    section: 'DILR',
    title: `Circular seating ${s.id}`,
    family: 'circular-seating',
    topic: 'Circular seating',
    difficulty: DIFFICULTY[s.difficultyLabel],
    expectedMinutes: s.expectedMinutes,
    effort: { measure: 'solver nodes', value: s.solverNodes },
    stimulus: [
      { type: 'text', text: seatingIntro(s.people) },
      { type: 'list', items: s.clues },
    ],
    questionIds: s.questions.map((_, i) => `${s.id}-${i + 1}`),
  };
}

export const DILR_SETS: DilrSet[] = [...SEATING_SETS.map(seatingSet), ...NEW_SETS];

export const DILR_QUESTIONS: Question[] = [...SEATING_SETS.flatMap(seatingQuestions), ...NEW_QUESTIONS];
