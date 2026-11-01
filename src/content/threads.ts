// Sample discussion threads. Original text. Authors are fictional and labelled as samples.

export const THREAD_TOPICS = ['Strategy', 'VARC', 'DILR', 'QA', 'Mocks'] as const;
export type ThreadTopic = (typeof THREAD_TOPICS)[number];

export type SampleReply = { id: string; author: string; text: string; upvotes: number; daysAgo: number };

export type SampleThread = {
  id: string;
  topic: ThreadTopic;
  title: string;
  author: string;
  text: string;
  upvotes: number;
  daysAgo: number;
  replies: SampleReply[];
};

const STUDENT = 'Sample student';
const ALUM_992 = 'Sample alum, 99.2 %ile';
const ALUM_987 = 'Sample alum, 98.7 %ile';
const ALUM_995 = 'Sample alum, 99.5 %ile';

export const THREADS: SampleThread[] = [
  {
    id: 'th-final-month',
    topic: 'Strategy',
    title: 'Four weeks left. What should I keep and what should I drop?',
    author: STUDENT,
    text: 'I still have gaps in geometry and two topic lists I never finished. I keep adding things to the plan and finishing none of them. What would you actually do with the last four weeks?',
    upvotes: 42,
    daysAgo: 2,
    replies: [
      {
        id: 'th-final-month-r1',
        author: ALUM_992,
        text: 'Stop opening new topics about three weeks out. Two mocks a week, and a full review of each one the next day. The review is where the marks are. If a topic has not come up by now, it is cheaper to skip those questions than to learn it badly.',
        upvotes: 31,
        daysAgo: 2,
      },
      {
        id: 'th-final-month-r2',
        author: ALUM_987,
        text: 'I made one list of the ten mistakes I repeated most and read it before every mock. It was short enough to fit on a page. That helped me more than any new chapter.',
        upvotes: 18,
        daysAgo: 1,
      },
      {
        id: 'th-final-month-r3',
        author: STUDENT,
        text: 'Same situation last year. I dropped P&C completely and spent that time on arithmetic, which shows up far more often. No regrets.',
        upvotes: 9,
        daysAgo: 1,
      },
    ],
  },
  {
    id: 'th-working',
    topic: 'Strategy',
    title: 'Full-time job, about 90 minutes on weekdays. How do you split it?',
    author: STUDENT,
    text: 'I get home at 7 and can give about 90 minutes before I stop thinking clearly. Weekends are better. Is it worth touching all three sections every day, or should I rotate?',
    upvotes: 27,
    daysAgo: 5,
    replies: [
      {
        id: 'th-working-r1',
        author: ALUM_995,
        text: 'Rotate. One section a day gets you real depth in 90 minutes. Thirty minutes each is only enough to warm up. I did Monday VARC, Tuesday QA, Wednesday DILR, repeat, and kept the weekend for one mock and its review.',
        upvotes: 22,
        daysAgo: 4,
      },
      {
        id: 'th-working-r2',
        author: STUDENT,
        text: 'Read one passage on the way to work if you commute. It adds up, and it means the evening can go to whichever section needs a clear head.',
        upvotes: 11,
        daysAgo: 3,
      },
    ],
  },
  {
    id: 'th-rc-third',
    topic: 'VARC',
    title: 'My RC accuracy falls on the third passage. Stamina or method?',
    author: STUDENT,
    text: 'First two passages are fine, around 75 percent. By the third I am rereading the same lines and guessing. Do I need more reading practice, or something else?',
    upvotes: 35,
    daysAgo: 3,
    replies: [
      {
        id: 'th-rc-third-r1',
        author: ALUM_992,
        text: 'Check your clock first. If the first two passages took 14 minutes each, the third is not a stamina problem, it is a time problem and you are rushing. Try a fixed limit of about 10 minutes a passage for a week and see if the drop gets smaller.',
        upvotes: 26,
        daysAgo: 3,
      },
      {
        id: 'th-rc-third-r2',
        author: STUDENT,
        text: 'Writing one line per paragraph on the rough sheet stopped my rereading. When a question came, I knew where to look.',
        upvotes: 14,
        daysAgo: 2,
      },
      {
        id: 'th-rc-third-r3',
        author: ALUM_987,
        text: 'Also pick passage order. If the third passage on screen is the hardest one, read it last only if you have the time. Dropping one hard passage is a normal choice, not a failure.',
        upvotes: 12,
        daysAgo: 2,
      },
      {
        id: 'th-rc-third-r4',
        author: STUDENT,
        text: 'For me it was food. Mocks at 2 pm after a big lunch were always worse. Worth checking before you change your method.',
        upvotes: 6,
        daysAgo: 1,
      },
    ],
  },
  {
    id: 'th-pj-pairs',
    topic: 'VARC',
    title: 'Para-jumbles: do you find the opening first, or the pairs?',
    author: STUDENT,
    text: 'I was taught to find the opening sentence. Half the time two sentences both look like openers and I lose five minutes. Is there a faster way in?',
    upvotes: 24,
    daysAgo: 8,
    replies: [
      {
        id: 'th-pj-pairs-r1',
        author: ALUM_995,
        text: 'Pairs first. Look for a sentence with "this", "these", "however" or a pronoun, and find the one it points back to. Once you have one firm pair, the opening usually sorts itself out.',
        upvotes: 19,
        daysAgo: 8,
      },
      {
        id: 'th-pj-pairs-r2',
        author: STUDENT,
        text: 'A wrong type-in answer costs nothing in this format, so I always enter my best sequence. But I give each one three minutes at most.',
        upvotes: 8,
        daysAgo: 6,
      },
    ],
  },
  {
    id: 'th-leave-set',
    topic: 'DILR',
    title: 'How long do you stay on a set before leaving it?',
    author: STUDENT,
    text: 'I sank 19 minutes into a set last mock, got one answer, and never reached the easier set after it. How do you decide when to walk away?',
    upvotes: 51,
    daysAgo: 1,
    replies: [
      {
        id: 'th-leave-set-r1',
        author: ALUM_992,
        text: 'Spend the first four minutes reading all the sets and ranking them. Then give each set you start around 10 minutes. If you have no firm deduction after 5, move on. You can come back, and you usually come back faster.',
        upvotes: 37,
        daysAgo: 1,
      },
      {
        id: 'th-leave-set-r2',
        author: ALUM_987,
        text: 'Ask one question when you feel stuck: did the last two minutes give me anything new? If the answer is no, leave. Time already spent is not a reason to stay.',
        upvotes: 24,
        daysAgo: 1,
      },
      {
        id: 'th-leave-set-r3',
        author: STUDENT,
        text: 'The cap on sectionals helped me here. Seeing the prompt at the cap made me notice how often I keep going out of habit.',
        upvotes: 13,
        daysAgo: 0,
      },
    ],
  },
  {
    id: 'th-tables',
    topic: 'DILR',
    title: 'I read tables too slowly. Any drills that actually help?',
    author: STUDENT,
    text: 'Calculations are fine once I know what to compute. I just spend ages working out what the table is saying and what the units are.',
    upvotes: 19,
    daysAgo: 11,
    replies: [
      {
        id: 'th-tables-r1',
        author: ALUM_987,
        text: 'Before any question, spend 30 seconds on the headers: what is a row, what is a column, what is the unit, and are there totals. Say it to yourself. Most slips come from skipping this.',
        upvotes: 15,
        daysAgo: 10,
      },
      {
        id: 'th-tables-r2',
        author: STUDENT,
        text: 'Estimate instead of computing when the options are far apart. 487 out of 1,210 is a bit over 40 percent, and often that is enough.',
        upvotes: 10,
        daysAgo: 9,
      },
    ],
  },
  {
    id: 'th-fractions',
    topic: 'QA',
    title: 'Percent to fraction pairs: which ones are worth learning?',
    author: STUDENT,
    text: 'I have seen lists going up to 1/30. Do I really need all of that, or is a short list enough?',
    upvotes: 30,
    daysAgo: 6,
    replies: [
      {
        id: 'th-fractions-r1',
        author: ALUM_995,
        text: 'Learn 1/2 to 1/12, then the multiples of 1/8 and 1/6. So 3/8 = 37.5%, 5/8 = 62.5%, 5/6 = 83.33%. That covers almost everything. 37.5% of 64 is simply 3/8 of 64, which is 24.',
        upvotes: 21,
        daysAgo: 6,
      },
      {
        id: 'th-fractions-r2',
        author: STUDENT,
        text: 'The ones I kept mixing up were 1/7 = 14.29% and 1/9 = 11.11%. Writing them out for three days fixed it.',
        upvotes: 7,
        daysAgo: 4,
      },
      {
        id: 'th-fractions-r3',
        author: ALUM_992,
        text: 'A rise of 25% is multiply by 5/4, and a fall of 20% is multiply by 4/5, which is why they cancel. Thinking in multipliers helps more than the list itself.',
        upvotes: 16,
        daysAgo: 3,
      },
    ],
  },
  {
    id: 'th-mock-swing',
    topic: 'Mocks',
    title: 'My mock scores swing by 20 marks. Is that normal?',
    author: STUDENT,
    text: 'Last three mocks went 58, 81, 64 with no real change in how I prepared. I can not tell if I am improving or not.',
    upvotes: 38,
    daysAgo: 4,
    replies: [
      {
        id: 'th-mock-swing-r1',
        author: ALUM_987,
        text: 'Normal. One set clicking or not is worth 10 to 15 marks on its own. Look at the average of your last three or four mocks, not at any one score.',
        upvotes: 25,
        daysAgo: 4,
      },
      {
        id: 'th-mock-swing-r2',
        author: ALUM_995,
        text: 'Track questions attempted and accuracy separately. A lower score with better accuracy can be a good mock. It tells you the method is working and you need speed, which is the easier fix.',
        upvotes: 20,
        daysAgo: 3,
      },
      {
        id: 'th-mock-swing-r3',
        author: STUDENT,
        text: 'I stopped checking the score until I finished the review. It made the review honest, and I stopped writing off the bad days.',
        upvotes: 12,
        daysAgo: 2,
      },
    ],
  },
];

export const threadById = (id: string) => THREADS.find((t) => t.id === id);
