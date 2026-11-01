import { defineLesson, r } from './types';

export default defineLesson({
  id: 'pj-opening-pairs',
  title: 'Para-jumbles: finding the opening and the pairs',
  section: 'VARC',
  topic: 'Para-jumbles',
  summary: 'Stop trying whole orders. Collect firm links, find the opening, and join them into a chain.',
  slides: [
    {
      chapter: 'Collect links, not orders',
      body: { kind: 'title', title: 'Para-jumbles: finding the opening and the pairs', subtitle: 'Collect links, not orders' },
      lines: [
        'A para-jumble gives you four or five sentences in the wrong order, and you type the right order as a number.',
        'Most students read the sentences again and again, hoping the order will appear.',
        'There is a calmer way.',
        'You do not need to see the whole paragraph at once.',
      ],
    },
    {
      body: { kind: 'diagram', title: 'Each firm link cuts the work', diagram: 'pj-funnel' },
      lines: [
        'Four sentences can be arranged in 24 ways.',
        r('Find one firm pair and those two become a single block, which leaves 6 orders.'),
        r('Find the opening as well, and only 2 orders remain.'),
        r('One more link gives you the answer.'),
        'So you are never solving a whole paragraph.',
        'You are collecting links, one at a time.',
      ],
    },
    {
      chapter: 'The method',
      concept: true,
      body: {
        kind: 'points',
        title: 'The method in four moves',
        numbered: true,
        items: ['Hunt for firm pairs', 'Find the opening', 'Join the chain', 'Read it once, start to finish'],
      },
      lines: [
        'Here is the method in four moves.',
        r('First, hunt for firm pairs, meaning two sentences that must sit side by side.'),
        r('Second, find the opening sentence.'),
        r('Third, join what you have into a chain.'),
        r('Fourth, read the whole thing once from start to finish.'),
        'If a join feels rough when you read it, it is probably wrong.',
      ],
    },
    {
      body: {
        kind: 'points',
        title: 'Four sentences to order',
        numbered: true,
        items: [
          'Then automatic lamps arrived, and one by one the families moved inland.',
          'Many of them now log weather and sea data that no sensor collects as well.',
          'For two centuries, lighthouses on this coast were run by families who lived beside the lamp.',
          "But the keepers' skills did not vanish with the old lamps.",
        ],
      },
      lines: [
        'Here are four sentences about lighthouses.',
        r('Sentence 1: then automatic lamps arrived, and one by one the families moved inland.'),
        r('Sentence 2: many of them now log weather and sea data that no sensor collects as well.'),
        r('Sentence 3: for two centuries, lighthouses on this coast were run by families who lived beside the lamp.'),
        r("Sentence 4: but the keepers' skills did not vanish with the old lamps."),
      ],
    },
    {
      chapter: 'Finding the opening',
      body: {
        kind: 'points',
        title: 'What an opening looks like',
        items: [
          'Makes sense on its own',
          'Names its subject in full',
          'No this, these, such or they pointing back',
          'No but, however, then or so at the front',
        ],
      },
      lines: [
        'An opening sentence has to make sense with nothing before it.',
        r('Read it alone, and ask whether you feel lost.'),
        r('It names its subject in full, not with a pronoun.'),
        r('It has no word like this, these, such or they pointing back at something earlier.'),
        r('And it does not begin with but, however, then or so, because those words answer an earlier line.'),
      ],
    },
    {
      body: {
        kind: 'verdicts',
        title: 'Which one can open?',
        items: [
          { text: '1. Then automatic lamps arrived...', verdict: 'Then needs a before', keep: false },
          { text: '2. Many of them now log...', verdict: 'Them points back', keep: false },
          { text: '3. For two centuries, lighthouses...', verdict: 'Stands alone', keep: true },
          { text: "4. But the keepers' skills...", verdict: 'But answers a line', keep: false },
        ],
      },
      lines: [
        r('Sentence 1 starts with then, so something must come before it.'),
        r('Sentence 2 says many of them, and we do not yet know who they are.'),
        r('Sentence 3 stands alone, with a subject and a time frame.'),
        r('Sentence 4 starts with but, so it is replying to an earlier line.'),
        'That makes sentence 3 our opening.',
      ],
    },
    {
      chapter: 'Finding the pairs',
      body: {
        kind: 'points',
        title: 'Pair clue 1: pointing words',
        lead: 'A small boat left at dawn. The boat carried salt.',
        items: ['This, these, it, they: find the noun they point to', 'A, then the: first mention, then second mention'],
      },
      lines: [
        'Now the pairs, starting with the strongest clue of all.',
        r('Words like this, these, it and they point back to a noun, so find that noun.'),
        r('A change from a to the does the same job.'),
        'On the slide, a small boat comes first, and only then can we say the boat.',
      ],
    },
    {
      body: {
        kind: 'points',
        title: 'Pair clue 2: linking words',
        items: [
          'But, however, yet: a contrast with the line just before',
          'So, therefore: a result of the line just before',
          'Then, later, today: a place on a timeline',
        ],
      },
      lines: [
        'The second clue is linking words.',
        r('But, however and yet set up a contrast with the line just before.'),
        r('So and therefore give a result of the line just before.'),
        r('Then, later and today put sentences on a timeline.'),
      ],
    },
    {
      body: {
        kind: 'points',
        title: 'Pair clue 3: natural order',
        items: ['A claim, then its example', 'A question, then its answer', 'A full name, then the short form'],
      },
      lines: [
        'The third clue is natural order.',
        r('A claim usually comes before its example.'),
        r('A question comes before its answer.'),
        r('A full name comes before the short form, so the Reserve Bank of India comes before RBI.'),
      ],
    },
    {
      chapter: 'Building the chain',
      body: { kind: 'diagram', title: 'Join the links', diagram: 'pj-chain' },
      lines: [
        'Let us join our lighthouse sentences.',
        r('The word then in sentence 1 needs the family story in sentence 3 before it, so 3 goes before 1.'),
        r('The word but in sentence 4 pushes back against the families moving away, so 1 goes before 4.'),
        r('The phrase many of them in sentence 2 points to the keepers in sentence 4, so 4 goes before 2.'),
        r('The order is 3, 1, 4, 2, which you type as 3142.'),
        'Read it once, and it flows.',
      ],
    },
    {
      body: {
        kind: 'points',
        title: 'Three common traps',
        items: ['A general line can be the conclusion', 'A date does not make a sentence first', 'Same topic is not a pair'],
      },
      lines: [
        'Watch out for three common traps.',
        r('A broad, general line feels like an opening, but it is often the conclusion.'),
        r('A sentence with a date feels early, but the paragraph may be moving forward to that date.'),
        r('Two sentences on the same topic are not a pair unless a word ties them together.'),
        'A pair needs a hook in the language, not just a shared subject.',
      ],
    },
    {
      body: {
        kind: 'points',
        title: 'In the exam',
        items: ['About two or three minutes each', 'Lock your strongest pair first', 'Always type an answer'],
      },
      lines: [
        'In the exam, keep it simple.',
        r('Give a para-jumble about two or three minutes.'),
        r('Lock your strongest pair first, then test the orders that are left.'),
        r('Always type an answer, because a wrong type-in answer loses no marks.'),
      ],
    },
    {
      body: {
        kind: 'points',
        title: 'What to carry with you',
        items: [
          'Collect links, not orders',
          'Pairs: pointing words, linking words, natural order',
          'The opening makes sense alone',
          'Read the chain once before you type',
        ],
      },
      lines: [
        r('Collect links, not orders.'),
        r('Find pairs through pointing words, linking words and natural order.'),
        r('The opening must make sense alone.'),
        r('Read the finished chain once before you type it.'),
        'Now try the practice questions, and mark the hook in each pair as you go.',
      ],
    },
  ],
  practice: [
    {
      kind: 'tita',
      topic: 'Para-jumbles',
      subType: 'Opening and pairs',
      difficulty: 'Easy',
      expectedSeconds: 120,
      sentences: [
        'Printing later made them cheap, and the locks came off.',
        'Within a century, an apprentice could own a chart that only a captain could once afford.',
        'Early sea charts were drawn by hand on calfskin.',
        'These sheets were so costly that captains kept them under lock.',
      ],
      prompt: 'Arrange the sentences in the right order. Type the sentence numbers with no spaces.',
      answer: '3412',
      commonWrong: ['3142', '3421', '4312'],
      explanation:
        'Sentence 3 opens: it names early sea charts in full. "These sheets" in 4 points back to the charts, so 3 then 4. "The locks came off" in 1 needs the lock from 4, so 4 then 1. Sentence 2 looks back from a century later, so it closes.',
      trap: 'Pair missed: "the locks" must follow the lock in sentence 4',
    },
    {
      kind: 'tita',
      topic: 'Para-jumbles',
      subType: 'Opening and pairs',
      difficulty: 'Medium',
      expectedSeconds: 150,
      sentences: [
        'The railways changed that, because a train cannot run on a different noon in each town.',
        'Until the 1800s, every town kept its own time by the sun.',
        'So the companies pressed for one standard time across the country.',
        'A clock in one city could differ from the next by several minutes, and nobody minded.',
      ],
      prompt: 'Arrange the sentences in the right order. Type the sentence numbers with no spaces.',
      answer: '2413',
      commonWrong: ['2143', '2134', '4213'],
      explanation:
        'Sentence 2 opens with a time frame and a full subject. Sentence 4 spells out what that meant. "Changed that" in 1 needs the situation in 4 before it, so 4 then 1. "So the companies" in 3 is the result, and it needs the railways from 1 just before it.',
      trap: 'Pair missed: "changed that" must follow the situation it changes',
    },
    {
      kind: 'tita',
      topic: 'Para-jumbles',
      subType: 'Opening and pairs',
      difficulty: 'Hard',
      expectedSeconds: 180,
      sentences: [
        'Its price fell, and with it went a whole class of salt traders.',
        'For most of history, salt was hard to get and worth carrying across deserts.',
        'Then deep mining and cheap transport changed the sums.',
        'Today it is so common that restaurants leave it free on the table.',
        'Cities grew at its sources, and taxes on it paid for armies.',
      ],
      prompt: 'Arrange the sentences in the right order. Type the sentence numbers with no spaces.',
      answer: '25314',
      commonWrong: ['23514', '25134', '52314'],
      explanation:
        'Sentence 2 opens by naming salt. Sentence 5 stays in the same period of high value, and "its" needs salt before it. "Then" in 3 turns the story, 1 is the result of that turn, and "Today" in 4 ends the timeline.',
      trap: 'Timeline slip: sentence 5 belongs before the change in sentence 3',
    },
    {
      kind: 'mcq',
      topic: 'Para-jumbles',
      subType: 'Opening sentence',
      difficulty: 'Medium',
      expectedSeconds: 60,
      prompt: 'These four sentences come from one jumbled paragraph. Which is the best opening sentence?',
      options: [
        'In the end, a town is only as secure as its water.',
        'Such towns rarely appear on any map for visitors.',
        'Across the dry plains, small towns once lived off a single crop.',
        'The crop, however, failed three years in a row.',
      ],
      answerIndex: 2,
      trapIndex: 0,
      explanation:
        'Only the third sentence makes sense alone: it sets the place and names the subject. "Such towns" points back, and "the crop, however" answers an earlier line. The first sentence sounds broad, but "in the end" marks it as a conclusion.',
      trap: 'General line trap',
    },
  ],
});
