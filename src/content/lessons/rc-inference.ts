import { defineLesson, r } from './types';

export default defineLesson({
  id: 'rc-inference',
  title: 'RC: inference questions',
  section: 'VARC',
  topic: 'Reading comprehension',
  summary: 'What a passage forces you to accept, and one small test that catches options saying too much.',
  slides: [
    {
      chapter: 'What the question asks',
      body: { kind: 'title', title: 'RC: inference questions', subtitle: 'What the passage forces you to accept, and nothing more' },
      lines: [
        'Inference questions trip up even careful readers.',
        'You understand the passage, and then you pick an option that says a little too much.',
        'In this lesson we will fix that with a few plain habits and one small test.',
        'You can run that test on any option, in any passage.',
      ],
    },
    {
      body: { kind: 'diagram', title: 'Where the answer sits', diagram: 'inference-scale' },
      lines: [
        'Picture every option sitting somewhere on a line.',
        r('At one end is what the passage states outright.'),
        r('At the other end is what merely sounds likely.'),
        r('The answer to an inference question sits between the two.'),
        'The passage does not say it in so many words, but it leaves you no room to deny it.',
      ],
    },
    {
      chapter: 'The idea',
      concept: true,
      body: {
        kind: 'points',
        title: 'What an inference is',
        items: ['The smallest step from the text', 'Forced, not just likely', 'Holds on the passage alone'],
      },
      lines: [
        'So here is a working definition.',
        r('An inference is the smallest step you can take from the text.'),
        r('That step has to be forced, because likely is not enough.'),
        r('And it has to hold on the passage alone, so your own knowledge of the topic stays out of it.'),
        'Small, forced and from the text.',
        'Keep those three words in mind.',
      ],
    },
    {
      chapter: 'A worked example',
      body: {
        kind: 'points',
        title: 'A short passage',
        lead: 'When the town of Varsha moved its weekly market from the riverbank to the new bus stand, footfall rose by a third within a year. Yet the old potters, who had sold by the river for decades, stopped coming. They told the council that their buyers had always arrived by boat.',
        items: [],
      },
      lines: [
        'Let us try one.',
        'When the town of Varsha moved its weekly market from the riverbank to the new bus stand, footfall rose by a third within a year.',
        'Yet the old potters, who had sold by the river for decades, stopped coming.',
        'They told the council that their buyers had always arrived by boat.',
        'Notice the word yet, because it tells you the potters leaving was not what you would expect.',
      ],
    },
    {
      body: {
        kind: 'points',
        title: 'Which of these can be inferred?',
        items: [
          'A. The bus stand market earned more money than the river market.',
          "B. The potters' buyers found the new site harder to reach.",
          'C. The council moved the market to push the potters out.',
          'D. Every seller did better at the bus stand.',
        ],
      },
      lines: [
        'The question asks which option can be inferred.',
        r('Option A says the bus stand market earned more money than the river market.'),
        r("Option B says the potters' buyers found the new site harder to reach."),
        r('Option C says the council moved the market to push the potters out.'),
        r('Option D says every seller did better at the bus stand.'),
      ],
    },
    {
      body: {
        kind: 'points',
        title: 'Three moves before you choose',
        numbered: true,
        items: ['Find the anchor line', 'Say the small step yourself', 'Test each option against it'],
      },
      lines: [
        'Before you choose, make three moves.',
        r('First, find the anchor, which here is the last line about boats.'),
        r('Second, say the small step in your own words.'),
        'Buyers came by boat, so a market away from the river is harder for them to reach.',
        r('Third, test each option against that step.'),
      ],
    },
    {
      body: {
        kind: 'verdicts',
        title: 'Testing the options',
        items: [
          { text: 'A. Earned more money', verdict: 'Too far', keep: false },
          { text: 'B. Site harder for buyers to reach', verdict: 'Forced', keep: true },
          { text: 'C. Moved it to push the potters out', verdict: 'Invented', keep: false },
          { text: 'D. Every seller did better', verdict: 'Too strong', keep: false },
        ],
      },
      lines: [
        r('Option A talks about money, but the passage only gives footfall.'),
        'More visitors need not mean more sales, so this goes too far.',
        r('Option B matches our small step, so it stays.'),
        r('Option C gives the council a motive, and the passage never says why the market moved.'),
        r('Option D says every seller, yet the potters themselves stopped coming, so it is too strong.'),
      ],
    },
    {
      chapter: 'The negation test',
      body: { kind: 'diagram', title: 'When two options survive, flip them', diagram: 'negation-flow' },
      lines: [
        'Sometimes two options survive, and then you need a sharper tool.',
        r('Take the option and flip it, so that it says the opposite.'),
        r('Now ask whether the passage still makes sense.'),
        r('If the flipped option breaks the passage, the original was forced, so keep it.'),
        r('If the passage stands just fine, the original was only a guess, so drop it.'),
      ],
    },
    {
      body: {
        kind: 'steps',
        title: 'Flip A and B',
        given: 'Keep an option only if its opposite breaks the passage.',
        items: [
          'A flipped: the bus stand earned no more money.',
          'Nothing in the passage breaks. Drop A.',
          'B flipped: the new site was no harder for buyers to reach.',
          "The potters' reason collapses. Keep B.",
        ],
      },
      lines: [
        'Let us flip our two strongest options.',
        r('Flip A, and you get a bus stand market that earned no more money than the river market.'),
        r('The passage is perfectly happy with that, so A was never forced.'),
        r('Flip B, and the new site is no harder for buyers to reach.'),
        r("Now the potters' reason for leaving makes no sense, so B is the inference."),
      ],
    },
    {
      chapter: 'Words to watch',
      body: {
        kind: 'points',
        title: 'Small words carry inferences',
        lead: 'Few younger weavers still use the old dye.',
        items: [
          'Still: it was once more common',
          'Yet: what follows goes against what came before',
          'Even: this is the least expected case',
          'Only: everything else is shut out',
        ],
      },
      lines: [
        'Inference answers often hang on small words, so slow down for them.',
        'Take this sentence: few younger weavers still use the old dye.',
        r('Still tells you the dye was once more common.'),
        r('Yet tells you that what follows goes against what came before.'),
        r('Even marks the least expected case.'),
        r('Only shuts out everything else.'),
        'Notice what the sentence does not say, because it tells you nothing about older weavers.',
      ],
    },
    {
      body: {
        kind: 'points',
        title: 'Words inside the options',
        items: [
          'All, always, never, must, proves: check the passage claims as much',
          'Some, may, often, tends to: easier to defend',
          'This is a warning, not a rule',
        ],
      },
      lines: [
        'Now look at the words inside the options.',
        r('All, always, never, must and proves claim a lot, so check that the passage claims just as much.'),
        r('Some, may, often and tends to claim less, so they are easier to defend.'),
        r('Treat this as a warning and not as a rule, because a strong option can be right when the passage is equally strong.'),
      ],
    },
    {
      body: {
        kind: 'points',
        title: 'What to carry with you',
        items: [
          'Small, forced and from the text',
          'Say the step before you read the options',
          'Name why each option fails: too far, too strong, invented',
          'When two remain, flip them',
        ],
      },
      lines: [
        'Let us put it together.',
        r('An inference is small, forced and from the text.'),
        r('Say the step yourself before you read the options.'),
        r('Name why each wrong option fails, whether it goes too far, is too strong or is invented.'),
        r('And when two options remain, flip them.'),
        'The practice questions below use exactly these habits, so try them now while the idea is fresh.',
      ],
    },
  ],
  practice: [
    {
      kind: 'mcq',
      topic: 'Reading comprehension',
      subType: 'Inference',
      difficulty: 'Medium',
      expectedSeconds: 75,
      paragraph:
        'The Lakeside library stopped charging late fees three years ago. Since then, the number of books returned late has gone up slightly, but the number of members returning after a long gap has nearly doubled. The head librarian now says the fees were keeping away the very readers the library most wanted to reach.',
      prompt: 'Which of the following can best be inferred from the paragraph?',
      options: [
        'Some members had stayed away from the library because of the fees.',
        'Late fees are a poor idea for every public library.',
        'The library has lost money since it dropped the fees.',
        'Books now come back sooner than they did under the fees.',
      ],
      answerIndex: 0,
      trapIndex: 1,
      explanation:
        'Lapsed members came back once the fees ended, and the librarian says the fees kept readers away. The small, forced step is that fees kept some members away. Flip it and the librarian\'s claim falls apart. The second option widens one library to every library, the third is about money the paragraph never mentions, and the fourth contradicts the rise in late returns.',
      trap: 'Too strong trap',
    },
    {
      kind: 'mcq',
      topic: 'Reading comprehension',
      subType: 'Inference',
      difficulty: 'Medium',
      expectedSeconds: 60,
      paragraph: "Even the city's most careful bakers now buy their flour from the one mill left in the valley.",
      prompt: 'What does the word "even" allow you to infer?',
      options: [
        'Flour from this mill is better than flour from the mills that closed.',
        'One would have expected careful bakers to be the last to rely on a single mill.',
        'Every baker in the city buys from this mill.',
        'Careless bakers have stopped buying flour altogether.',
      ],
      answerIndex: 1,
      trapIndex: 2,
      explanation:
        '"Even" marks the least expected case, so careful bakers are the ones you would not have expected to do this. The sentence says nothing about flour quality. It hints that others buy from the mill too, but "every baker" goes further than the sentence does.',
      trap: 'Too strong trap',
    },
    {
      kind: 'mcq',
      topic: 'Reading comprehension',
      subType: 'Inference',
      difficulty: 'Hard',
      expectedSeconds: 90,
      paragraph:
        'Two river dolphin surveys, ten years apart, used the same boats and the same route. The second counted fewer animals. The researchers note, however, that the second survey ran two months later in the year, when the water is higher and dolphins spread into the side channels.',
      prompt: 'Which of the following is most strongly supported by the paragraph?',
      options: [
        'The dolphin population has not fallen in these ten years.',
        'The first survey was carried out carelessly.',
        'The lower count may not reflect a real fall in the population.',
        'Dolphins prefer high water to low water.',
      ],
      answerIndex: 2,
      trapIndex: 0,
      explanation:
        'The researchers offer a reason the second count could be low even without a real fall, so "may not reflect" is exactly as strong as the paragraph. Saying the population has not fallen claims far more, because the paragraph only raises a doubt. Nothing faults the first survey, and spreading into side channels at high water is not a stated preference.',
      trap: 'Too strong trap',
    },
    {
      kind: 'mcq',
      topic: 'Reading comprehension',
      subType: 'Negation test',
      difficulty: 'Easy',
      expectedSeconds: 60,
      paragraph: "Mira's workshop takes on one apprentice a year, chosen from those who have already spent a season repairing old looms.",
      prompt: 'Use the negation test. Which statement must be true if the paragraph is true?',
      options: [
        'Repairing old looms is the best training for a weaver.',
        'Mira herself began her career by repairing old looms.',
        'Few people apply to join the workshop each year.',
        "Each new apprentice in Mira's workshop has already worked on repairing old looms.",
      ],
      answerIndex: 3,
      trapIndex: 1,
      explanation:
        'Flip the last option: a new apprentice who has never repaired old looms. That breaks the paragraph, so the option is forced. Flip any other option and the paragraph still stands. Mira\'s own start sounds natural, but the paragraph says nothing about it.',
      trap: 'Sounds likely trap',
    },
  ],
});
