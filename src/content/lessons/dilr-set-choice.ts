import { defineLesson, r } from './types';

export default defineLesson({
  id: 'dilr-set-choice',
  title: 'DILR: choosing your set in 4 minutes',
  section: 'DILR',
  topic: 'Set selection',
  summary: 'Read before you solve: three signals that rank the sets, and how to decide when to leave one.',
  slides: [
    {
      chapter: 'Why the first minutes matter',
      body: { kind: 'title', title: 'DILR: choosing your set in 4 minutes', subtitle: 'Read first, rank the sets, then solve' },
      lines: [
        'DILR is the one section where choosing well can matter as much as solving well.',
        'You get 40 minutes and 22 questions, split across a handful of sets.',
        'Very few students finish them all, and you do not need to.',
        'Your score depends on which sets get your time.',
      ],
    },
    {
      body: { kind: 'diagram', title: 'Same ability, different start', diagram: 'dilr-two-starts' },
      lines: [
        'Here are two students of equal ability, in an example made up to show the point.',
        r('Student A starts with the first set on the screen, and it turns out to be hard, so 18 minutes bring one right answer.'),
        r('The rest of the section brings 5 more, so the total is 6.'),
        r('Student B spends 4 minutes looking first, and then starts with the easiest set.'),
        r('That student ends on 11 right, with no extra ability at all.'),
      ],
    },
    {
      chapter: 'The 4-minute scan',
      concept: true,
      body: { kind: 'diagram', title: 'One way to spend 40 minutes', diagram: 'dilr-time-bar' },
      lines: [
        'So make this your rule: the first 4 minutes are for reading, not solving.',
        r('Scan every set and rank them.'),
        r('Give your best set up to 14 minutes.'),
        r('Give your second set up to 14 minutes.'),
        r('Use the last 8 minutes for a third set, or to finish what is nearly done.'),
        'The exact split can change, but the scan stays.',
      ],
    },
    {
      body: {
        kind: 'points',
        title: 'One minute a set: three signals',
        numbered: true,
        items: ['Start: is there a fixed clue?', 'Size: how many things to place?', 'Questions: direct, or full of ifs?'],
      },
      lines: [
        'With four sets to scan, you have about a minute for each.',
        'Do not read every clue.',
        'Look for three signals.',
        r('The start: is there a clue that fixes something exactly?'),
        r('The size: how many things do you have to place?'),
        r('The questions: are they direct, or full of ifs?'),
      ],
    },
    {
      body: {
        kind: 'verdicts',
        title: 'Signal 1: a place to start',
        items: [
          { text: 'Fixed: Ravi is in seat 4.', verdict: 'Strongest', keep: true },
          { text: 'Relative: Ravi is two seats from Meena.', verdict: 'Needs a fixed point', keep: false },
          { text: 'Negative: Ravi is not next to Meena.', verdict: 'Weakest', keep: false },
        ],
      },
      lines: [
        'Clues are not equal.',
        r('A fixed clue places something exactly, so you can write it down straight away.'),
        r('A relative clue links two things, so it only helps once one of them is placed.'),
        r('A negative clue only rules things out, so it usually comes into use late.'),
        'Count the fixed clues, because two or three of them usually mean a quick start.',
      ],
    },
    {
      body: {
        kind: 'steps',
        title: 'Signal 2: size',
        given: 'Ways to order people in a row, before any clue',
        items: ['5 people: 120 orders', '6 people: 720 orders', '8 people: 40,320 orders', 'Bigger sets need more clues and more cases'],
      },
      lines: [
        'Size grows faster than it looks.',
        r('Five people in a row can be ordered in 120 ways.'),
        r('Six people give 720 ways.'),
        r('Eight people give 40,320 ways.'),
        r('Clues cut these numbers down, but a bigger set still needs more clues and more cases.'),
      ],
    },
    {
      body: {
        kind: 'verdicts',
        title: 'Signal 3: the questions',
        items: [
          { text: 'Who sits in seat 3?', verdict: 'Your grid shows it', keep: true },
          { text: 'How many sit between Ravi and Meena?', verdict: 'Same grid', keep: true },
          { text: 'If Tara moves to seat 2, who sits in seat 5?', verdict: 'A new case', keep: false },
        ],
      },
      lines: [
        'Now glance at the questions.',
        r('A direct question asks for something your finished grid will show.'),
        r('Most direct questions share that one grid, so one solve answers several questions.'),
        r('A question that begins with if changes the setup, so it is a small new puzzle of its own.'),
        'A set with many ifs takes longer than its clues suggest.',
      ],
    },
    {
      chapter: 'Ranking the sets',
      body: {
        kind: 'table',
        title: 'A quick scorecard',
        columns: ['Set', 'Start', 'Size', 'Questions', 'Good signs'],
        rows: [
          ['P: schedule', 'None fixed', 'Large', 'Two ifs', 0],
          ['Q: seating', 'Two fixed', 'Small', 'Two ifs', 2],
          ['R: table', 'Data given', 'Small', 'All direct', 3],
        ],
        marks: [{ rows: [0] }, { rows: [1] }, { rows: [2] }],
      },
      lines: [
        'Put the three signals together, and give each set one point for each good sign.',
        r('Set P has no fixed clue, many tasks and two if questions, so it scores nothing.'),
        r('Set Q has two fixed clues and a small size, so it scores 2.'),
        r('Set R gives its data directly, and all its questions are direct, so it scores 3.'),
        'Your order is R, then Q, and P only if time is left.',
        'Write that order down, so you do not argue with yourself later.',
      ],
    },
    {
      body: {
        kind: 'points',
        title: 'What not to judge by',
        items: [
          'Length: a long set may just give more fixed clues',
          'Family: a type you like can still be the hardest here',
          'Screen order: first on screen is not first to do',
        ],
      },
      lines: [
        'Some signals feel useful, but they mislead.',
        r('Length is one, because a set can be long simply because it gives you more fixed clues.'),
        r('Family is another, because a seating set you like can still be the hardest on the paper.'),
        r('Screen order is the third, because nothing says the first set is the one to do first.'),
      ],
    },
    {
      chapter: 'Knowing when to leave',
      body: {
        kind: 'points',
        title: 'Decide your exit before you start',
        items: ['Set your limit first', 'Nothing firm by the limit: leave', 'Leaving is a decision, not a failure'],
      },
      lines: [
        'The scan is only half the skill.',
        'The other half is leaving a set that has stopped paying.',
        r('Set your limit before you begin, while you are still calm.'),
        r('If you reach the limit with nothing firm on paper, leave.'),
        r('Leaving is a decision, not a failure, because every question in the next set carries the same marks.'),
        'In Pace, the soft cap on each DILR practice set does this job for you.',
      ],
    },
    {
      body: {
        kind: 'points',
        title: 'Before you leave a set',
        items: [
          'Try direct questions your partial grid can answer',
          'Type-in: enter your best value',
          'Multiple choice: guess only after ruling options out',
        ],
      },
      lines: [
        'Before you leave, collect what the set still offers.',
        r('Try any direct question your partial grid can already answer.'),
        r('On a type-in question, enter your best value, because a wrong one costs nothing.'),
        r('On multiple choice, a blind guess among four options averages zero marks, so guess only after ruling some out.'),
      ],
    },
    {
      body: {
        kind: 'points',
        title: 'What to carry with you',
        items: ['Read for 4 minutes, then solve', 'Three signals: start, size, questions', 'Write your ranking down', 'Decide your exit first'],
      },
      lines: [
        r('Read for 4 minutes, then solve.'),
        r('Judge each set by its start, its size and its questions.'),
        r('Write your ranking down, so you do not change your mind in a panic.'),
        r('Decide your exit before you begin.'),
        'The set-pick drill in Pace gives you this exact practice, and it shows how your order compares with the recommended one.',
        'Try the questions below first.',
      ],
    },
  ],
  practice: [
    {
      kind: 'mcq',
      topic: 'Linear arrangement',
      subType: 'Set selection',
      difficulty: 'Easy',
      expectedSeconds: 60,
      paragraph:
        'Set P: 6 people in a row. 3 clues give exact seats. All 4 questions are direct.\nSet Q: 8 tasks across 4 days. No clue fixes a task to a day. 2 of 4 questions begin with if.\nSet R: 7 people at a round table. 1 clue is fixed. 1 of 4 questions begins with if.',
      prompt: 'You have just scanned these three sets. Which do you start with?',
      options: ['Set P', 'Set Q', 'Set R', 'Whichever set comes first on the screen'],
      answerIndex: 0,
      trapIndex: 2,
      explanation:
        'Set P has all three good signs: fixed clues to start from, a small size and direct questions. Set R may feel familiar, but it has one fixed clue, more people and an if question. Set Q has no start at all.',
      trap: 'Familiar family trap',
    },
    {
      kind: 'mcq',
      topic: 'Linear arrangement',
      subType: 'Clue strength',
      difficulty: 'Easy',
      expectedSeconds: 45,
      prompt: 'Which clue gives you the strongest start in an 8-seat row?',
      options: [
        'Dev sits next to Ira.',
        'Dev is not in seat 1 or seat 8.',
        'Dev is in seat 5.',
        'Ira sits somewhere to the left of Dev.',
      ],
      answerIndex: 2,
      trapIndex: 1,
      explanation:
        'A fixed clue lets you write something down at once, and every relative clue about Dev then becomes usable. The second option names seats, but it only rules two out, so Dev could still be in any of six.',
      trap: 'Negative clue trap',
    },
    {
      kind: 'tita',
      topic: 'Linear arrangement',
      subType: 'Size check',
      difficulty: 'Easy',
      expectedSeconds: 45,
      prompt: 'Before any clue, in how many different orders can 6 people stand in a row?',
      answer: '720',
      commonWrong: ['120', '36', '30'],
      explanation: 'There are 6 choices for the first place, 5 for the next, and so on: 6 × 5 × 4 × 3 × 2 × 1 = 720. That is six times the 120 orders for 5 people.',
      trap: 'Calculation slip: 120 is the count for 5 people',
    },
    {
      kind: 'mcq',
      topic: 'Scheduling',
      subType: 'Exit decision',
      difficulty: 'Medium',
      expectedSeconds: 45,
      prompt:
        'You are ten minutes into your first set, past your limit, with nothing firm on paper. Your second-ranked set is untouched. What is the best move?',
      options: [
        'Stay, because leaving would waste the ten minutes already spent.',
        'Try any question the notes already answer, then move to the second set.',
        'Restart the same set from the first clue.',
        'Go to the set you ranked last, in case it is easier than it looked.',
      ],
      answerIndex: 1,
      trapIndex: 0,
      explanation:
        'The ten minutes are gone whatever you do. What matters is where the next minute earns the most, and that is an untouched set you ranked well. Collect anything quick first, then leave.',
      trap: 'Sunk cost trap',
    },
    {
      kind: 'tita',
      topic: 'Scheduling',
      subType: 'Guessing',
      difficulty: 'Medium',
      expectedSeconds: 60,
      prompt:
        'A multiple choice question has 4 options. A right answer earns +3 and a wrong one costs 1 mark. What is the average mark from a blind guess?',
      answer: '0',
      commonWrong: ['0.75', '1', '-0.75'],
      explanation: 'One time in four you gain 3, and three times in four you lose 1. So the average is (3 − 3) ÷ 4 = 0. Ruling out even one option makes the guess worth taking.',
      trap: 'Partial scope trap: counting only the right answers',
    },
  ],
});
