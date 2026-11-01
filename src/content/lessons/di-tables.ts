import { defineLesson, r } from './types';

const COLUMNS = ['Store', 'Q1', 'Q2', 'Q3', 'Q4', 'Year'];

/** Sales by store and quarter, in ₹ lakh. Recomputed in tests/lessons.test.ts. */
export const DI_ROWS: (string | number)[][] = [
  ['Alpha', 120, 150, 135, 195, 600],
  ['Beta', 80, 96, 88, 136, 400],
  ['Gamma', 210, 189, 170, 231, 800],
  ['Delta', 60, 78, 87, 75, 300],
];

const TITLE = 'Sales by store, in ₹ lakh';

export default defineLesson({
  id: 'di-tables',
  title: 'DI: reading tables fast',
  section: 'DILR',
  topic: 'Data tables',
  summary: 'A fixed reading order, then three quick ways to compare numbers without long division.',
  slides: [
    {
      chapter: 'The reading order',
      body: { kind: 'title', title: 'DI: reading tables fast', subtitle: 'Frame first, questions next, numbers last' },
      lines: [
        'In a table set, the numbers are rarely the hard part.',
        'The hard part is how much time goes into reading them more than once.',
        'Most students start with the first row, and by the third question they are reading it again.',
        'This lesson gives you a fixed reading order and three quick ways to compare numbers.',
      ],
    },
    {
      concept: true,
      body: {
        kind: 'points',
        title: 'Read in this order',
        numbered: true,
        items: ['Frame first', 'Questions next', 'Numbers last'],
      },
      lines: [
        'Here is the order.',
        r('Read the frame first, which means everything except the numbers.'),
        r('Read the questions next, so you know what you are looking for.'),
        r('Read the numbers last, and only the ones a question needs.'),
        'It feels slow for ten seconds, and then it saves minutes.',
      ],
    },
    {
      body: { kind: 'diagram', title: 'What the frame tells you', diagram: 'di-frame' },
      lines: [
        'The frame has five parts.',
        r('The title and unit tell you what is measured, and whether it is in lakhs, thousands or percent.'),
        r('The column labels tell you what runs across.'),
        r('The row labels tell you what runs down.'),
        r('A totals row or column saves you from adding.'),
        r('A footnote can change everything, so never skip it.'),
      ],
    },
    {
      body: {
        kind: 'table',
        title: TITLE,
        columns: COLUMNS,
        rows: DI_ROWS,
        marks: [{ cols: [0] }, { cols: [1, 2, 3, 4] }, { cols: [5] }],
      },
      lines: [
        'Here is our table.',
        r('The rows are four stores.'),
        r('The columns are four quarters of one year.'),
        r("The last column is the year's total, already added for you."),
        'That took about ten seconds, and you have not read a single sales figure yet.',
      ],
    },
    {
      chapter: 'Comparing growth',
      body: {
        kind: 'table',
        title: TITLE,
        note: 'Which store grew fastest from Q1 to Q2?',
        columns: COLUMNS,
        rows: DI_ROWS,
        marks: [{ cols: [1, 2] }],
      },
      lines: [
        'First question: which store grew fastest from quarter 1 to quarter 2?',
        r('Only two columns matter, so let your eye ignore the rest.'),
        'Growth is the change divided by the starting value.',
      ],
    },
    {
      body: {
        kind: 'steps',
        title: 'Growth is change over base',
        given: 'Change from Q1 to Q2, divided by the Q1 value',
        items: [
          'Alpha: +30 on 120 = 1/4, or 25%',
          'Beta: +16 on 80 = 1/5, or 20%',
          'Gamma: −21 on 210, a fall',
          'Delta: +18 on 60 = 3/10, or 30%',
          'Delta grew fastest, though Alpha added the most',
        ],
      },
      lines: [
        r('Alpha gained 30 on 120, which is one quarter, or 25 percent.'),
        r('Beta gained 16 on 80, which is one fifth, or 20 percent.'),
        r('Gamma fell, so it is out.'),
        r('Delta gained 18 on 60, which is 3 tenths, or 30 percent.'),
        r('Delta grew fastest, even though Alpha added the most rupees.'),
        'Use fractions here, because you are only comparing, not reporting a number.',
      ],
    },
    {
      chapter: 'Comparing shares',
      body: {
        kind: 'table',
        title: TITLE,
        note: 'Which store made the largest share of its year in Q4?',
        columns: COLUMNS,
        rows: DI_ROWS,
        marks: [{ cols: [4, 5] }],
      },
      lines: [
        'Second question: which store earned the largest share of its year in quarter 4?',
        r('Now you need the Q4 column and the year column.'),
        'Four divisions sound slow, so do not do them.',
        'Instead, rescale every store to the same yearly total.',
      ],
    },
    {
      body: {
        kind: 'steps',
        title: 'Scale everything to one base',
        given: 'Bring each year to 400',
        items: [
          'Alpha: 600 → 400 is × 2/3, so 195 → 130',
          'Beta: already 400, so 136',
          'Gamma: 800 → 400 is ÷ 2, so 231 → 115.5',
          'Delta: 300 → 400 is × 4/3, so 75 → 100',
          'Beta is largest: 136 of 400, or 34%',
        ],
      },
      lines: [
        "Beta's total is already 400, so let us bring everyone to 400.",
        r("Alpha's 600 comes down to two thirds, so 195 becomes 130."),
        r('Beta stays at 136.'),
        r("Gamma's 800 halves, so 231 becomes 115.5."),
        r("Delta's 300 grows by a third, so 75 becomes 100."),
        r('Beta is the largest, at 136 out of 400, which is 34 percent.'),
      ],
    },
    {
      chapter: 'Comparing without calculating',
      body: {
        kind: 'table',
        title: TITLE,
        note: 'In how many quarters did Gamma beat Alpha and Beta together?',
        columns: COLUMNS,
        rows: DI_ROWS,
        marks: [
          { cells: [[0, 1], [1, 1], [2, 1]] },
          { cells: [[0, 2], [1, 2], [2, 2]] },
          { cells: [[0, 3], [1, 3], [2, 3]] },
          { cells: [[0, 4], [1, 4], [2, 4]] },
        ],
      },
      lines: [
        'Third question: in how many quarters did Gamma sell more than Alpha and Beta combined?',
        r('In quarter 1, Alpha and Beta make 200, and Gamma has 210, so that is one.'),
        r("In quarter 2, Alpha's 150 plus Beta's 96 clearly passes Gamma's 189."),
        r("In quarter 3, Alpha's 135 plus Beta's 88 is well past Gamma's 170."),
        r("In quarter 4, 195 plus 136 is far above Gamma's 231."),
        'So the answer is one quarter, and a rough sum was enough each time.',
      ],
    },
    {
      body: {
        kind: 'steps',
        title: 'Estimating a share',
        given: "Gamma's share of Q1 sales: 210 out of 470",
        items: ['Half of 470 = 235, which is 50%', 'A tenth of that = 23.5, which is 5%', '235 − 23.5 = 211.5, which is 45%', '210 is just below, so a little under 45%'],
      },
      lines: [
        'Sometimes the options are far apart, and a close estimate is enough.',
        "Say you need Gamma's share of quarter 1 sales, which is 210 out of 470.",
        r('Half of 470 is 235, which is 50 percent.'),
        r('One tenth of that is 23.5, which is 5 percent.'),
        r('Take it away and you get 211.5, which is 45 percent.'),
        r('Our 210 sits just below that, so the share is a little under 45 percent.'),
      ],
    },
    {
      chapter: 'Traps and checks',
      body: {
        kind: 'points',
        title: 'Three traps',
        items: [
          'A bigger gain is not a bigger growth rate',
          'Percent and percentage points are different',
          'The word of names your base',
        ],
      },
      lines: [
        r('A bigger gain is not a bigger growth rate, as Alpha and Delta just showed.'),
        r('A share going from 10 percent to 12 percent is a rise of 2 percentage points, but it is 20 percent growth.'),
        r('Watch the word of, because whatever follows it is your base.'),
      ],
    },
    {
      body: {
        kind: 'steps',
        title: 'Totals are a free check',
        given: 'Rows and columns must agree',
        items: ['Quarters: 470 + 513 + 480 + 637 = 2,100', 'Year column: 600 + 400 + 800 + 300 = 2,100', 'If they disagree, you have misread a number'],
      },
      lines: [
        'One last habit.',
        r('Add the four quarter totals, and you get 2,100.'),
        r('Add the year column, and you also get 2,100.'),
        r('If your own sums ever disagree, you have misread a number, so stop and look again.'),
      ],
    },
    {
      body: {
        kind: 'points',
        title: 'What to carry with you',
        items: ['Frame, questions, numbers', 'Growth: change over base', 'Shares: rescale to one base', 'Estimate when options are far apart'],
      },
      lines: [
        r('Read the frame, then the questions, then the numbers.'),
        r('For growth, divide the change by the base.'),
        r('For shares, rescale everything to one base.'),
        r('When the options are far apart, estimate.'),
        'The practice below uses a new table, so start with the frame.',
      ],
    },
  ],
  practice: [
    {
      kind: 'mcq',
      topic: 'Data tables',
      subType: 'Growth',
      difficulty: 'Easy',
      expectedSeconds: 60,
      paragraph: 'Units sold, in thousands, in 2024 then 2025.\nNorth: 240, 300\nSouth: 180, 216\nEast: 150, 165\nWest: 90, 126',
      prompt: 'Which region grew fastest in percentage terms from 2024 to 2025?',
      options: ['North', 'South', 'East', 'West'],
      answerIndex: 3,
      trapIndex: 0,
      explanation: 'Change over base: North 60/240 = 25%, South 36/180 = 20%, East 15/150 = 10%, West 36/90 = 40%. North added the most units, but West grew fastest.',
      trap: 'Bigger gain trap',
    },
    {
      kind: 'tita',
      topic: 'Data tables',
      subType: 'Totals',
      difficulty: 'Easy',
      expectedSeconds: 45,
      paragraph: 'Units sold, in thousands, in 2024 then 2025.\nNorth: 240, 300\nSouth: 180, 216\nEast: 150, 165\nWest: 90, 126',
      prompt: 'By how many thousand units did total sales rise from 2024 to 2025?',
      answer: '147',
      commonWrong: ['807', '660', '137'],
      explanation: 'You do not need either total. Add the changes: 60 + 36 + 15 + 36 = 147. As a check, the totals are 660 and 807, and 807 − 660 = 147.',
      trap: 'Calculation slip',
    },
    {
      kind: 'mcq',
      topic: 'Data tables',
      subType: 'Ratio',
      difficulty: 'Medium',
      expectedSeconds: 60,
      paragraph: 'Units sold, in thousands, in 2024 then 2025.\nNorth: 240, 300\nSouth: 180, 216\nEast: 150, 165\nWest: 90, 126',
      prompt: "In 2025, South's sales were what percent of North's?",
      options: ['72%', '75%', '80%', '139%'],
      answerIndex: 0,
      trapIndex: 1,
      explanation: 'Use the 2025 column only: 216 out of 300 is 72 out of 100, or 72%. The 75% comes from the 2024 column (180 out of 240).',
      trap: 'Wrong column trap',
    },
    {
      kind: 'mcq',
      topic: 'Data tables',
      subType: 'Share',
      difficulty: 'Hard',
      expectedSeconds: 90,
      paragraph: 'Units sold, in thousands, in 2024 then 2025.\nNorth: 240, 300\nSouth: 180, 216\nEast: 150, 165\nWest: 90, 126',
      prompt: "What happened to West's share of total sales from 2024 to 2025?",
      options: [
        'It fell by about 2 percentage points.',
        'It stayed the same.',
        'It rose by about 2 percentage points.',
        'It rose by about 40 percentage points.',
      ],
      answerIndex: 2,
      trapIndex: 3,
      explanation: "West's share went from 90/660, about 13.6%, to 126/807, about 15.6%. That is a rise of about 2 percentage points. West's sales grew by 40%, but that is growth in units, not a change in share.",
      trap: 'Percent versus percentage points trap',
    },
  ],
});
