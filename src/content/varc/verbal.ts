// Verbal ability: para-jumbles, para-summaries and odd sentence out. All original.
// Sentences are stored in printed order, so numbers in `answer` and in explanations
// refer to that printed order.

import type { LessonRef, McqQuestion, TitaQuestion } from '../types';

const PJ_LESSON: LessonRef = { lessonId: 'pj-opening-pairs', seconds: 60 };
const PJ_PROMPT = 'The sentences below, when properly sequenced, form a coherent paragraph. Type the sequence of sentence numbers.';
const PS_PROMPT = 'Which option best captures the essence of the paragraph?';
const OS_PROMPT = 'Four of the five sentences below form a coherent paragraph. Type the number of the sentence that does not belong.';

type PjSpec = Omit<TitaQuestion, 'kind' | 'section' | 'topic' | 'prompt' | 'lessonRef'>;
type PsSpec = Omit<McqQuestion, 'kind' | 'section' | 'topic' | 'prompt'>;
type OsSpec = Omit<TitaQuestion, 'kind' | 'section' | 'topic' | 'prompt'>;

const pj = (spec: PjSpec): TitaQuestion => ({
  ...spec,
  kind: 'tita',
  section: 'VARC',
  topic: 'Para-jumbles',
  prompt: PJ_PROMPT,
  lessonRef: PJ_LESSON,
});

const ps = (spec: PsSpec): McqQuestion => ({
  ...spec,
  kind: 'mcq',
  section: 'VARC',
  topic: 'Para-summary',
  prompt: PS_PROMPT,
});

const os = (spec: OsSpec): TitaQuestion => ({
  ...spec,
  kind: 'tita',
  section: 'VARC',
  topic: 'Odd sentence out',
  prompt: OS_PROMPT,
});

export const PARA_JUMBLES: TitaQuestion[] = [
  pj({
    id: 'PJ01',
    subType: 'Opening sentence',
    difficulty: 'Easy',
    expectedSeconds: 120,
    sentences: [
      'Trains changed that, because a timetable cannot work if every station keeps a different hour.',
      'Until the railways came, each British town kept its own local time, set by the sun overhead.',
      'Railway companies therefore adopted one standard time, and the towns slowly followed.',
      'The resulting gap of a few minutes between towns troubled nobody while travel remained slow.',
    ],
    answer: '2413',
    commonWrong: ['2143', '2134', '4213'],
    explanation:
      "Sentence 2 opens, because it sets the scene and points back to nothing. Sentence 4 follows, since 'the resulting gap' needs the separate town clocks of 2. Then comes the pair 1-3: 'Trains changed that' answers the calm of 4, and 'therefore' in 3 gives the result. Sentence 1 can look like an opener because it names trains, but 'that' has nothing to point to yet.",
    trap: 'Opening sentence trap',
  }),
  pj({
    id: 'PJ02',
    subType: 'Pronoun links',
    difficulty: 'Medium',
    expectedSeconds: 150,
    sentences: [
      'Those stairs did more than reach the water, since they let people follow the level down as it fell through the dry months.',
      'Piped supply later made these wells unnecessary, and many were left to silt up.',
      'In the dry parts of western India, builders once faced a simple problem: water lay far below the ground and was needed all year.',
      'Because people depended on them through those long months, the wells gathered carvings and shaded halls, and became places to meet.',
      'Their answer was the stepwell, a deep shaft reached by long flights of stone stairs.',
    ],
    answer: '35142',
    commonWrong: ['35412', '35124', '53142'],
    explanation:
      "Sentence 3 opens by stating the problem. Sentence 5 must follow, since 'their answer' needs that problem. The pair 5-1 is fixed: 'those stairs' points to the stairs in 5. The pair 1-4 is fixed too: 'those long months' points to the dry months in 1. Sentence 2 closes, because 'later' moves us past everything else. Placing 4 before 1 breaks the link to the dry months.",
    trap: 'Broken pair trap',
  }),
  pj({
    id: 'PJ03',
    subType: 'Pronoun links',
    difficulty: 'Easy',
    expectedSeconds: 120,
    sentences: [
      'That feeling is why the crossed-out price matters even when nobody has ever paid it.',
      'They are really giving the customer a number to compare against.',
      'A shopkeeper who marks a shirt at ₹2,000 and then crosses it out for ₹1,200 is not merely announcing a discount.',
      "Once that higher figure is in the buyer's head, the lower one feels like a bargain, whatever the shirt is worth.",
    ],
    answer: '3241',
    commonWrong: ['3421', '3214', '2341'],
    explanation:
      "Sentence 3 opens, because it introduces the shopkeeper that 'He' in 2 needs. The pair 3-2 is fixed: 'not merely' in 3 is answered by 'He is really' in 2. Sentence 4 comes next, since 'that higher figure' is the number mentioned in 2. Sentence 1 closes, because 'That feeling' points to the sense of a bargain in 4. Reading 4 before 2 breaks the 'not merely' pair.",
    trap: 'Broken pair trap',
  }),
  pj({
    id: 'PJ04',
    subType: 'Chronology',
    difficulty: 'Medium',
    expectedSeconds: 150,
    sentences: [
      'The method worked, but it was risky, since the dose could itself kill.',
      'His experiment showed that the milder infection gave protection too.',
      'The word vaccine, from the Latin for cow, still carries the memory of that discovery.',
      'Long before vaccines, people in parts of Asia and Africa had learned that a small, deliberate dose of smallpox could guard a person against a worse attack later.',
      'In 1796 Edward Jenner tried a safer idea, using cowpox, a mild disease caught from cattle, in place of smallpox.',
    ],
    answer: '41523',
    commonWrong: ['45123', '45213', '41253'],
    explanation:
      "Sentence 4 opens with the oldest event and names no earlier idea. Sentence 1 follows, since 'the method' is the deliberate dose in 4. Sentence 5 comes next: 'a safer idea' answers the risk in 1. The pair 5-2 is fixed, because 'his experiment' needs Jenner. Sentence 3 closes, since 'that discovery' looks back at the finding in 2. Jumping from 4 straight to 5 strands sentence 1, because 'the method' with its deadly dose no longer has anything to point to.",
    trap: 'Chronology trap',
  }),
  pj({
    id: 'PJ05',
    subType: 'Connector logic',
    difficulty: 'Medium',
    expectedSeconds: 140,
    sentences: [
      'It follows that two honest maps of one town can look quite different, because their makers wanted to answer different questions.',
      'To avoid such clutter, the mapmaker must decide what to ignore, and that decision is the real skill.',
      'Every map is an exercise in leaving things out.',
      'A city plan that marked each tree, drain and doorstep, for instance, would be too crowded to read.',
    ],
    answer: '3421',
    commonWrong: ['3241', '3412', '4321'],
    explanation:
      "Sentence 3 opens with the general claim. Sentence 4 gives the example of a crowded plan, and 'for instance' needs that claim before it. The pair 4-2 is fixed, because 'such clutter' in 2 needs the crowding in 4. Sentence 1 closes, since 'It follows' draws the result of the mapmaker's choice in 2. The tempting order puts 2 straight after 3, but then 'such clutter' points to nothing.",
    trap: 'Broken pair trap',
  }),
  pj({
    id: 'PJ06',
    subType: 'Chronology',
    difficulty: 'Medium',
    expectedSeconds: 150,
    sentences: [
      'These containers could move from truck to ship to train without being opened.',
      'For centuries, loading a ship meant moving cargo by hand, one sack or crate at a time.',
      'As handling costs fell, it became cheap to make goods in one country and sell them in another far away.',
      'In the 1950s, an American trucking businessman proposed a simple change: pack the goods into standard steel boxes and lift the boxes whole.',
      'Dock labour of this kind was slow, and a ship could spend more time in port than at sea.',
    ],
    answer: '25413',
    commonWrong: ['24135', '25431', '25134'],
    explanation:
      "Sentence 2 opens with the old way of working. The pair 2-5 is fixed, since 'of this kind' points to hand loading. Sentence 4 brings in the change, and the pair 4-1 is fixed too: 'these containers' are the steel boxes in 4. Sentence 3 closes with the result of cheaper handling. Moving 3 ahead of 1 puts the result before the means.",
    trap: 'Cause and effect trap',
  }),
  pj({
    id: 'PJ07',
    subType: 'Connector logic',
    difficulty: 'Easy',
    expectedSeconds: 120,
    sentences: [
      'Instead, each box carries a short code of colours and symbols that tells handlers where it is going.',
      'A box may pass through several hands on the way, but the code means that none of those hands needs to know the whole route.',
      'Many of the carriers have had little formal schooling, so the system cannot rely on long written addresses.',
      "Mumbai's lunch carriers move thousands of tiffin boxes across the city each day, and almost every box reaches the right desk.",
    ],
    answer: '4312',
    commonWrong: ['4132', '4123', '3412'],
    explanation:
      "Sentence 4 opens by naming the carriers. Sentence 3 follows, since 'the carriers' and 'the system' need that introduction. The pair 3-1 is fixed: 'Instead' in 1 replaces the long written addresses of 3. The pair 1-2 follows, because 'the code' in 2 is the code of 1. Sentence 1 cannot come straight after 4, since 'Instead' has nothing to replace until 3 mentions written addresses. Sentence 3 may feel like a start, but 'the carriers' assumes we already know who they are.",
    trap: 'Opening sentence trap',
  }),
  pj({
    id: 'PJ08',
    subType: 'Chronology',
    difficulty: 'Medium',
    expectedSeconds: 140,
    sentences: [
      'Several coastal communities are now replanting the very trees their parents removed.',
      'Then storms began reaching further inland, and people started to ask what had changed.',
      'Coastal villagers once saw mangrove swamps as waste ground, fit only for clearing.',
      'The answer lay in the tangled roots, which had been slowing the waves and holding the mud in place.',
      'Many such swamps were cut down to make room for shrimp ponds.',
    ],
    answer: '35241',
    commonWrong: ['35421', '35214', '53241'],
    explanation:
      "Sentence 3 opens by naming the swamps. The pair 3-5 is fixed, since 'such swamps' points back to 3. Sentence 2 comes next: 'Then' and 'what had changed' need the clearing in 5. The pair 2-4 is fixed too, since 'the answer' in 4 needs the question in 2. Sentence 1 closes in the present, with 'now'. Putting 4 before 2 gives the answer before anyone has asked.",
    trap: 'Chronology trap',
  }),
  pj({
    id: 'PJ09',
    subType: 'Mandatory pairs',
    difficulty: 'Hard',
    expectedSeconds: 170,
    sentences: [
      'Thus we are told that many hands make light work, and also that too many cooks spoil the broth.',
      'It shows that a proverb is less a law than a tool, useful in some situations and not in others.',
      'Proverbs often come in contradictory pairs.',
      'That both sayings survive does not show that folk wisdom is foolish.',
    ],
    answer: '3142',
    commonWrong: ['3421', '3124', '1342'],
    explanation:
      "Sentence 3 opens with the general claim. Sentence 1 must follow, since 'Thus' introduces the example of a pair. Sentence 4 comes next, because 'both sayings' needs the two proverbs in 1. The pair 4-2 is fixed: 'does not show' sets up 'It shows'. Starting with 1 is tempting because the proverbs are vivid, but 'Thus' needs something to follow from.",
    trap: 'Opening sentence trap',
  }),
  pj({
    id: 'PJ10',
    subType: 'Chronology',
    difficulty: 'Hard',
    expectedSeconds: 170,
    sentences: [
      'A stronger cable was laid in 1866 by the Great Eastern, then the largest ship afloat.',
      'Few people at the time could have guessed how thoroughly that speed would reshape markets and newspapers.',
      'The rejoicing did not last, because the signal weakened and the cable failed within weeks.',
      'The first telegraph cable across the Atlantic was completed in 1858, to great public celebration.',
      'This time the line held, and messages that had taken days by steamship now took minutes.',
    ],
    answer: '43152',
    commonWrong: ['41352', '43512', '14352'],
    explanation:
      "Sentence 4 opens, since 1858 is the earliest date and 'the first' needs no lead-in. The pair 4-3 is fixed: 'the rejoicing' is the celebration in 4. Sentence 1 follows with the second attempt. The pair 1-5 is fixed too: 'this time' needs the new cable. Sentence 2 closes, since 'that speed' points to the minutes in 5. Placing 1 straight after 4 splits that first pair, and 'stronger' then has no failed cable to be compared with.",
    trap: 'Broken pair trap',
  }),
];

export const PARA_SUMMARIES: McqQuestion[] = [
  ps({
    id: 'PS01',
    subType: 'Central idea',
    difficulty: 'Easy',
    expectedSeconds: 90,
    paragraph:
      'Experts often make poor teachers of beginners, and the reason is not arrogance. Over the years, the steps of a skill merge into one smooth motion, and the expert can no longer see them separately. Asked to explain, she skips what now feels obvious, leaving a gap that she cannot detect. A tutor who mastered the subject only last year may do better, not because she knows more, but because she still remembers where the difficulty lies. Knowledge, it seems, can erode the very memory of not knowing.',
    options: [
      'Deep mastery can hide the steps a beginner needs, so a recent learner may teach better.',
      'Experts are too proud to teach beginners, so tutors should be recent graduates.',
      'The ability to teach well has nothing to do with knowledge of the subject.',
      'Beginners learn best when they are left to work out difficult steps themselves.',
    ],
    answerIndex: 0,
    trapIndex: 1,
    explanation:
      'The paragraph says the steps of a skill blur together for the expert, so a newer tutor can sometimes teach better. A is right: it says exactly that. B is wrong: it names the cause the writer rules out in the opening line, since the reason is not arrogance.',
    trap: 'Reversal trap',
  }),
  ps({
    id: 'PS02',
    subType: 'Contrast',
    difficulty: 'Medium',
    expectedSeconds: 110,
    paragraph:
      'A repaired object used to be a sign of poverty. Today, the visible mend on a jacket or a cracked bowl can signal the opposite: taste, care and time to spare. This shift is easy to admire, but we should notice who benefits from it. The people who mend out of need have gained nothing. A patch on an expensive coat is a choice; a patch on the only coat a person owns is still a burden. Choosing to be frugal, in short, is not the same thing as having to be.',
    options: [
      'Wealthy people should stop wearing mended clothes out of respect for the poor.',
      'Repaired goods are now valued more highly than new goods of the same kind.',
      'Mending has become fashionable, and this has removed its old shame for the poor.',
      'Visible repair has become stylish, but choosing it differs from needing it.',
    ],
    answerIndex: 3,
    trapIndex: 2,
    explanation:
      'The paragraph has two moves: mending now signals taste, and that change does nothing for people who mend out of need. D is right: only it keeps both. C is wrong: it claims the poor have gained, which the writer directly denies.',
    trap: 'Reversal trap',
  }),
  ps({
    id: 'PS03',
    subType: 'Author\'s conclusion',
    difficulty: 'Medium',
    expectedSeconds: 110,
    paragraph:
      "A forecast of a seventy per cent chance of rain is often treated as a broken promise when the day stays dry. Yet a good forecaster should see it stay dry on about three such days in ten. The public's complaint rests on a common fallacy: judging a statement about chance by a single outcome. The remedy is not better weather science alone. It is a habit of keeping score across many forecasts, which is the only way a claim about chance can be fairly tested.",
    options: [
      'Forecasters should drop percentages, because the public tends to misread them.',
      'A forecast of chance can be judged fairly only across many cases, not on one day.',
      'A dry day after a forecast of rain shows that the forecast was probably wrong.',
      'Weather science has improved so much that its forecasts now rarely fail at all.',
    ],
    answerIndex: 1,
    trapIndex: 2,
    explanation:
      'The writer says one dry day proves nothing and that forecasts must be scored over many days. B is right: it states that point. C is wrong: it repeats the public mistake the paragraph is correcting.',
    trap: 'Reversal trap',
  }),
  ps({
    id: 'PS04',
    subType: 'Central idea',
    difficulty: 'Medium',
    expectedSeconds: 110,
    paragraph:
      'A translator of poetry is often told to be faithful, as though faithfulness were a single thing. But a poem offers several loyalties at once: to its meaning, its sound, its rhythm, its tone. Keeping one usually means betraying another, and no version can save them all. A good translation is therefore not a copy but a judgment, a record of what one reader thought mattered most. To ask for the perfect version is to misunderstand the nuance of the task.',
    options: [
      'Poems cannot be translated at all, so readers should learn the original language.',
      'A translator should always put the meaning of a poem ahead of its sound.',
      'Translating a poem means choosing among rival loyalties, so each version is a judgment.',
      'Translators betray the poets they work on, because they put their own views first.',
    ],
    answerIndex: 2,
    trapIndex: 3,
    explanation:
      'The paragraph says the loyalties compete, so every translation records a choice. C is right: it states that point. D borrows the word betray but changes its target: the writer means one quality gives way to another, not that the translator wrongs the poet.',
    trap: 'Distortion trap',
  }),
  ps({
    id: 'PS05',
    subType: 'Cause and effect',
    difficulty: 'Hard',
    expectedSeconds: 130,
    paragraph:
      'Most people assume that a distant deadline gives them more time to think. In practice, the extra weeks often fill with small tasks that feel urgent, and the real work begins only when the date is close. A tight deadline can hurt careful work, but a loose one seems to do something more insidious: it lets us believe that we are working while the hard part waits. This does not mean every project should be rushed. It means that extra time is worth little unless some of it is protected from the small jobs that rush in to fill it.',
    options: [
      'Tight deadlines produce better work than loose ones in nearly every project.',
      'People delay hard tasks mainly because they are afraid of failing at them.',
      'Extra time helps only if it is shielded from small tasks that would fill it.',
      'Long deadlines give people the time to think that careful work demands.',
    ],
    answerIndex: 2,
    trapIndex: 0,
    explanation:
      'The last sentence is the point: extra time is worth little unless it is protected. C is right: it says so. A is tempting but wrong: the writer warns that this does not mean every project should be rushed.',
    trap: 'Extreme language trap',
  }),
  ps({
    id: 'PS06',
    subType: 'Central idea',
    difficulty: 'Hard',
    expectedSeconds: 130,
    paragraph:
      "A museum label appears to be a plain statement of fact: a name, a date, a place. Yet every label is a small act of framing. To call a carved figure an artefact of 'primitive' art, or to note who donated it while leaving out how it was taken, is to tell a story while pretending to tell none. Some museums now rewrite their labels to name these silences. Critics call this politics. But the old labels were never free of politics; they merely obfuscated it.",
    options: [
      'Labels always carry a point of view, and rewriting them exposes it instead of adding it.',
      'Museums should drop labels altogether, because no label can ever be neutral.',
      'Rewritten labels have turned museums into political bodies, which critics rightly fear.',
      'Old labels are reliable on names and dates, and go wrong only on the donors.',
    ],
    answerIndex: 0,
    trapIndex: 2,
    explanation:
      'The writer says politics was always in the labels and was only hidden. A is right: rewriting them reveals something that was already there. C is wrong: it takes the side of the critics, while the writer answers them and disagrees.',
    trap: 'Reversal trap',
  }),
  ps({
    id: 'PS07',
    subType: 'Author\'s conclusion',
    difficulty: 'Medium',
    expectedSeconds: 100,
    paragraph:
      'A city that announces it has planted a million saplings has counted the easiest thing to count. Young trees die in large numbers when nobody waters them through their first dry seasons, and a sapling offers little shade for years. A mature tree, by contrast, is a piece of infrastructure that took decades to build. It follows that protecting one big old tree may often be worth more than planting many small ones, even though a planting ceremony photographs better. The number on the press release is seldom the tangible benefit.',
    options: [
      'Planting drives are useful mainly as ceremonies that raise public interest in trees.',
      'Saplings die in large numbers because cities tend to plant the wrong species.',
      'Cities should stop planting saplings and spend only on caring for old trees.',
      'Planting counts mislead, since the benefit comes from trees that survive and mature.',
    ],
    answerIndex: 3,
    trapIndex: 2,
    explanation:
      'The writer says the million-sapling figure measures the wrong thing, because the benefit comes from trees that live long enough to grow. D is right: it states that point. C goes too far: the writer says an old tree may often be worth more, not that planting should stop.',
    trap: 'Extreme language trap',
  }),
  ps({
    id: 'PS08',
    subType: 'Cause and effect',
    difficulty: 'Easy',
    expectedSeconds: 90,
    paragraph:
      'On many platforms, a rating of four stars out of five now reads as a warning. Buyers and riders have learned that anything below the top score can cost someone their living, so they give five stars out of kindness or guilt. The scale has failed not through a lack of data but through too much mercy. Once five stars became ubiquitous, the score stopped carrying information, and the few honest low marks began to do far more damage than they should.',
    options: [
      'Platforms deliberately inflate their ratings in order to keep sellers on their sites.',
      'Ratings given out of kindness have inflated the scale, so scores say little and low marks hurt.',
      'Customers have become more satisfied, which is why most ratings are now perfect.',
      'Honest low ratings are the most useful kind and deserve to be given more weight.',
    ],
    answerIndex: 1,
    trapIndex: 3,
    explanation:
      'The paragraph traces a chain: kindness pushes scores to the top, so the score loses meaning, and low marks bite too hard. B is right: it keeps that whole chain. D is wrong: it picks up one detail and adds a recommendation the writer never makes.',
    trap: 'Partial scope trap',
  }),
];

export const ODD_ONE_OUT: TitaQuestion[] = [
  os({
    id: 'OS01',
    subType: 'Scope shift',
    difficulty: 'Easy',
    expectedSeconds: 90,
    sentences: [
      'Many migratory birds find their way by using more than one cue.',
      'During the day they can take direction from the position of the sun.',
      'Some small birds cover thousands of kilometres in a single season.',
      'At night, certain species steer by the pattern of the stars.',
      "When the sky is overcast, they seem able to sense the earth's magnetic field.",
    ],
    answer: '3',
    commonWrong: ['5', '1', '4'],
    explanation:
      'Sentences 1, 2, 4 and 5 form one paragraph about how birds find their way: the sun by day, the stars by night, magnetism under cloud. Sentence 3 is about how far birds fly, not how they steer. Sentence 5 can look odd because magnetism is surprising, but it is a third cue, which is what sentence 1 promised.',
    trap: 'Same topic trap',
  }),
  os({
    id: 'OS02',
    subType: 'Scope shift',
    difficulty: 'Medium',
    expectedSeconds: 110,
    sentences: [
      'These receipts could be exchanged at a distant branch, so that value travelled without the metal.',
      'Coins of that period were often cast with a square hole at the centre.',
      'In time the government took over the practice and issued paper of its own.',
      'Merchants in medieval China found that strings of copper coins were too heavy to carry far.',
      'They began leaving their coins with trusted agents and carrying paper receipts instead.',
    ],
    answer: '2',
    commonWrong: ['3', '1', '4'],
    explanation:
      'Sentences 4, 5, 1 and 3 tell a story in order: heavy coins, paper receipts, exchange at a distance, then government paper. Sentence 2 describes how coins looked, which plays no part in that story. It tempts because coins are mentioned in sentence 4 as well, but sharing a word is not the same as sharing a point.',
    trap: 'Keyword link trap',
  }),
  os({
    id: 'OS03',
    subType: 'Scope shift',
    difficulty: 'Medium',
    expectedSeconds: 110,
    sentences: [
      'Within two generations, the old language may survive only among grandparents.',
      'When one tongue brings jobs and schooling, families decide, quite reasonably, that their children should speak it.',
      'Each such decision is sensible on its own, yet together they can end a speech community.',
      'A language usually dies not because it is banned but because parents stop passing it on.',
      'Spelling is often what adult learners of a new language find hardest.',
    ],
    answer: '5',
    commonWrong: ['3', '1', '2'],
    explanation:
      'Sentences 4, 2, 3 and 1 explain how a language fades: parents stop passing it on, families make a sensible choice, those choices add up, and only grandparents are left. Sentence 5 is about adults learning a language, which is a different subject. Sentence 3 can feel like a general comment that does not belong, but its phrase each such decision points straight at sentence 2.',
    trap: 'Same topic trap',
  }),
  os({
    id: 'OS04',
    subType: 'Scope shift',
    difficulty: 'Hard',
    expectedSeconds: 130,
    sentences: [
      'The practical air-filled tyre, developed shortly before, made riding far more comfortable on rough roads.',
      'In the 1890s, the bicycle gave many women a new kind of independence.',
      'Long skirts proved awkward on the pedals, so some riders pushed for simpler clothing.',
      'A woman on a bicycle could travel without an escort, and that alone unsettled some observers.',
      "Campaigners for women's rights soon noticed that the machine was doing part of their work.",
    ],
    answer: '1',
    commonWrong: ['3', '5', '4'],
    explanation:
      "Sentences 2, 4, 3 and 5 are about the bicycle and women's freedom: travel without an escort, simpler clothing, support from campaigners. Sentence 1 is about the machine's comfort and has nothing to say about women. Sentence 3 can seem off the point because it is about skirts, but clothing was part of that same freedom.",
    trap: 'Same topic trap',
  }),
  os({
    id: 'OS05',
    subType: 'Scope shift',
    difficulty: 'Medium',
    expectedSeconds: 100,
    sentences: [
      'Tiny bubbles trapped in the layers hold samples of the air of that time.',
      'Scientists drill into old ice because it keeps a record of past climate.',
      'By reading the ice downward, researchers can track how the atmosphere has changed over long periods.',
      'Melting glaciers also feed many of the great rivers of Asia in the summer.',
      "Each year's snowfall is pressed into a layer, much as a tree adds a ring.",
    ],
    answer: '4',
    commonWrong: ['1', '5', '3'],
    explanation:
      'Sentences 2, 5, 1 and 3 explain ice as a record: why scientists drill, how layers form, what the bubbles hold, and what can be read from them. Sentence 4 is about ice as a water source today. The word also makes it sound like it belongs, but nothing else in the set is about rivers.',
    trap: 'Connector trap',
  }),
  os({
    id: 'OS06',
    subType: 'Scope shift',
    difficulty: 'Easy',
    expectedSeconds: 90,
    sentences: [
      'The first digit points to a broad region of the country, and later digits narrow it down.',
      'Before the code, clerks had to cope with towns that shared names and with addresses in many languages.',
      'Personal letters have fallen sharply in number now that most people prefer messaging.',
      "India's postal index number, introduced in 1972, gave every delivery area a six-digit code.",
      "A sorter can therefore route a letter correctly without knowing the town's name.",
    ],
    answer: '3',
    commonWrong: ['2', '5', '1'],
    explanation:
      'Sentences 2, 4, 1 and 5 explain the postal code: the problem before it, the code itself, how the digits work, and how that helps a sorter. Sentence 3 is about the decline of letters, which has nothing to do with how the code works. Sentence 2 can look out of place because it goes back in time, but it sets up the problem the code solves.',
    trap: 'Same topic trap',
  }),
];
