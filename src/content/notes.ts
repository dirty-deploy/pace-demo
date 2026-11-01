// Alum notes. All original. The authors are fictional and always shown as "Sample alum".
// Notes keep to study method and make no claims about the real exam's format.

import type { Section } from './types';

export type NoteSection = Section | 'Strategy';

export type AlumNote = {
  id: string;
  title: string;
  section: NoteSection;
  topic: string;
  authorLabel: string;
  readingMinutes: number;
  upvotes: number;
  body: string[];
};

export const READING_WPM = 200;

export const wordCount = (body: string[]) => body.join(' ').split(/\s+/).filter(Boolean).length;

export const readingMinutesFor = (body: string[]) => Math.max(1, Math.round(wordCount(body) / READING_WPM));

const RAW_NOTES: Omit<AlumNote, 'readingMinutes'>[] = [
  {
    id: 'dilr-first-four-minutes',
    title: 'How I chose DILR sets in the first 4 minutes',
    section: 'DILR',
    topic: 'Set selection',
    authorLabel: "Sample alum · IIM A '25 · 99.4 %ile",
    upvotes: 214,
    body: [
      `For my first twenty mocks I started DILR with whichever set came first. Some days that worked. Most days I spent fifteen minutes on a set that was never going to open, and the rest of the section felt rushed. The fix was to treat the opening minutes as a job of their own. I read, I rank, and I do not pick up a pen.`,
      `I gave each set about 50 seconds. That is enough to read the setup and look at the questions, not to solve anything. I asked four things. How many entities and attributes are there? Are the clues direct ("A sits next to B") or conditional ("if A is not next to B, then C is")? Do the questions ask for one definite answer, or do they say "could be" and "must be", which usually means several cases? And can I already picture the grid?`,
      `Each set got a mark. S for start here, L for later, X for leave. A set got an S only if I could picture the grid and most clues were direct. Anything with long conditional chains or an unclear structure got an L, however interesting it looked. Interesting is not the same as doable.`,
      `After ranking I went to the S sets in order. I also kept one rule: if I had no new deduction in three or four minutes, I moved on and came back only if time remained. That rule mattered more than the ranking, because a wrong pick costs little if you leave early.`,
      `To train this, I ran a drill outside mocks. I took four sets I had not seen, ranked them in four minutes, then solved all of them untimed and checked whether my ranking matched how hard they turned out to be. In the first week I was right about half the time. After a month of doing this three times a week, I was usually right about my top two, which is all you need.`,
      `One warning. Four minutes worked for me with four sets. If your mock has a different number of sets, keep the time per set about the same and change the total.`,
    ],
  },
  {
    id: 'dilr-seating-setup',
    title: 'What I draw before I read a seating set’s questions',
    section: 'DILR',
    topic: 'Circular seating',
    authorLabel: "Sample alum · IIM C '24 · 98.9 %ile",
    upvotes: 138,
    body: [
      `Seating sets felt random to me until I noticed that I was losing time in the drawing, not the logic. I used to redraw the circle three times because I had started with a clue that fixed nothing. So I set a fixed order for my first two minutes.`,
      `First, I draw the structure once, with numbered seats. For a circle I mark which way everyone faces, because a clue like "to the immediate left" flips when people face outward. If some face in and some face out, I add a small arrow to each seat as soon as I know it.`,
      `Second, I sort the clues before I use any. I put a tick by definite clues, such as "A sits opposite B". I put a small c by conditional ones. I put a star by clues that mention a person who appears in two or more other clues. I always start with a starred definite clue, because it links the most information.`,
      `In a circle, nobody has a fixed seat until you place someone. So I put the person mentioned most often in seat 1 and work from there. This removes rotations, which look like different answers but are the same arrangement. With six people around a table, fixing one person leaves five to arrange, so there are 5 × 4 × 3 × 2 × 1 = 120 orders before any clue. Each good clue cuts that down quickly, which is why the order of clues matters.`,
      `When a clue leaves two options, I draw two small circles side by side and carry both. I stop at two. If a third case turns up, it usually means I skipped a stronger clue, so I look for it before I draw more.`,
      `Last, I read the questions before I finish the arrangement. Often a question can be answered from a partial grid, and one that asks "which of these could be true" can be solved by testing the options against the cases I already have. Marks come from the questions, not from a finished drawing.`,
      `I practised this on 30 sets over three weeks and timed only the first two minutes. Once the setup became automatic, the rest of the set got faster without my trying.`,
    ],
  },
  {
    id: 'dilr-reading-tables',
    title: 'How I read a data table before touching the questions',
    section: 'DILR',
    topic: 'Data tables',
    authorLabel: "Sample alum · IIM L '25 · 98.6 %ile",
    upvotes: 96,
    body: [
      `Data sets used to scare me because of the calculation. Then I reviewed twenty of my wrong answers and found that only three were arithmetic slips. The others came from misreading what a number stood for. So I changed how I spent my first minute.`,
      `Before the questions, I read the table like a sentence. What is one row? What is one column? What is the unit? Is it thousands or lakhs, a share or a count? I write the unit at the top of my sheet, because a question that moves from share to count is the usual place to slip.`,
      `Next I look for totals. If the table gives a total row, I add up one column roughly. It takes ten seconds, and it tells me whether the rows are complete or whether something is hidden in an "others" category. If the table gives percentages, I note the base beside them. A share of sales and a share of profit have different bases and cannot be added.`,
      `Then I mark the odd value in each row or column: the largest, the smallest, anything that breaks the trend. Many questions point at these. If I have already circled them, I do not need to scan again.`,
      `For calculations, I look at how far apart the options are before I do anything. If the options are 18%, 24%, 31% and 40%, then 37 out of 120 is a little above 30%, and I am done. If the options are 30.2% and 30.8%, I divide properly.`,
      `To compare two rises, I go in steps and stop as soon as I can. Is 340 to 410 a bigger rise than 510 to 600? The first is 70 on 340, a little over 20%. The second is 90 on 510, under 18%. That is enough.`,
      `I kept a small list of my reading mistakes: wrong unit, wrong base, wrong year. Before every data set in a mock I ran through that list in my head. It sounds too simple to help. Over two months it cut my wrong answers in this area by about half, and I did not get any faster at multiplying.`,
    ],
  },
  {
    id: 'rc-three-pass',
    title: 'My 3-pass approach to RC',
    section: 'VARC',
    topic: 'Reading comprehension',
    authorLabel: "Sample alum · IIM B '25 · 99.1 %ile",
    upvotes: 241,
    body: [
      `I used to read a passage once, slowly, trying to remember everything. By the fourth question I had forgotten the second paragraph and had to read it again. Three short passes worked better than one long one, and they took about the same time.`,
      `Pass one is the map, about two minutes for a passage of 500 words. I read normally, without underlining, and after each paragraph I ask what its job is. Does it state a problem, give an example, answer an objection? I jot three or four words for each paragraph. If I cannot say what a paragraph was doing, I reread only that one.`,
      `Pass two is the direct questions. I read all the question stems and pick the ones that point to one place: "according to the passage", "the author mentions X in order to". I go to the paragraph my map points to, read the lines around it, and answer. These should take about a minute each.`,
      `Pass three is inference and tone, and the questions about the whole passage, such as the main idea or what the author would agree with. By now I have read the passage once and parts of it twice, so these are easier than they would have been first. I eliminate before I choose. I look for the reason each option is wrong, and I pick the one left standing, even if I do not love it.`,
      `Two habits made this work. I never reread the whole passage, because the map tells me where to look. And I keep a strict budget. If a question is still open after two minutes, I pick between the two options that remain and move on.`,
      `To build this I did one passage a day for six weeks, then spent ten minutes on the options I had got wrong. For each one I wrote a line on why it was wrong, using words from the passage. That review was worth more than the practice itself. Reading more passages without it had not moved my accuracy at all.`,
      `If you read slowly, this still works. I read at about 220 words a minute. What changed was how much I read twice.`,
    ],
  },
  {
    id: 'rc-wrong-option-types',
    title: 'The four wrong-option types I learned to name',
    section: 'VARC',
    topic: 'Reading comprehension',
    authorLabel: "Sample alum · IIM K '24 · 98.7 %ile",
    upvotes: 172,
    body: [
      `Elimination got much easier once I stopped saying "this feels wrong" and started naming what was wrong. I went through about 200 of my RC errors and found that nearly all the wrong options fell into four types.`,
      `Distortion. The option uses the passage's words but changes the meaning. If the passage says remote work may reduce costs for some firms, the option says remote work reduces costs for firms. "May" and "some" have gone. Compare the strength of the words: may against will, some against all, often against always.`,
      `Partial scope. The option is true but covers only one paragraph, while the question asks about the whole passage. This is the usual trap on main-idea questions. Ask whether the author would accept this as a title for the whole piece, or just for one section.`,
      `Outside the passage. The option sounds sensible and matches what you know, but the passage never says it. This one catches well-read students. If you cannot point to a line that supports it, it goes, however true it is in real life.`,
      `Reversed logic. The option gets cause and effect backwards, or swaps who said what. The passage says lower rates led to more borrowing, and the option says more borrowing led to lower rates. Also watch for views the author reports but does not hold. Many passages describe a position only to argue with it.`,
      `Here is how to use this. In review, write the type beside every wrong option you picked, and do it for two weeks. You will find you have a favourite. Mine was partial scope, close to half of my errors. Once I knew that, I added one check for main-idea questions: before confirming, I asked which paragraph the option came from. If the answer was a single paragraph, I looked again.`,
      `A word about right answers. They often look dull and carefully worded, because they have to be defensible. If an option is exciting and absolute, treat that as a reason to check it, not a reason to pick it. This is a habit, not a law, so go back to the text each time.`,
    ],
  },
  {
    id: 'pj-pairs-first',
    title: 'Para-jumbles: I look for pairs, not the full order',
    section: 'VARC',
    topic: 'Para-jumbles',
    authorLabel: "Sample alum · IIM I '25 · 98.2 %ile",
    upvotes: 155,
    body: [
      `I used to try to find the first sentence, then the second, and so on. When the first guess was wrong, everything after it was wrong too. Now I ignore the full order at the start and look for two sentences that must sit together.`,
      `A pair is locked by something concrete. A pronoun with nothing to point to: "this decision", "such a shift", "they". A connector that needs something before it: "however", "as a result", "for instance". Or an idea that is new in one sentence and known in the other: "a tax on plastic" and then "the tax". Once you see "a" move to "the", you know the order of those two.`,
      `Here is a small made-up example. Sentence A: "The tax was dropped within a year." Sentence B: "The city introduced a tax on plastic bags." Sentence C: "Shop owners, however, simply passed the cost on to buyers." B must come before A, since "a tax" becomes "the tax". C needs the tax to exist, and its "however" needs something to push against, so it comes after B. The dropping of the tax reads best as the result. So the order is B, C, A.`,
      `For the opener, I test each candidate with one question: could this sentence start a conversation with someone who has read nothing? A sentence that begins with "this", "but" or "these critics" usually cannot. A general claim or a fresh name usually can. Do not trust this alone, since a general claim can also be a conclusion.`,
      `Then I build outward from the strongest pair. Usually I have a block of two or three sentences and one loose sentence. I try the loose sentence in each gap and read the whole thing once as a paragraph. If the flow breaks, I find the weakest link and change only that.`,
      `When I could not find a locked pair in about a minute, I moved on. A jumble that will not open gives nothing back, however long you look at it.`,
      `To practise, I took paragraphs from editorials, cut them into sentences, shuffled them, and rebuilt them a day later. It is free, and it teaches you how writers link ideas.`,
    ],
  },
  {
    id: 'oso-sentence-job',
    title: 'Odd sentence out: I ask what job each sentence does',
    section: 'VARC',
    topic: 'Odd sentence out',
    authorLabel: "Sample alum · IIM A '24 · 99.2 %ile",
    upvotes: 83,
    body: [
      `Odd sentence out questions look like para-jumbles, and I treated them that way for months. It helps to think of them differently. You are not looking for an order. You are looking for the sentence that does not belong to the argument the others are making.`,
      `First, I summarise each sentence in four or five words. Not the topic, the claim. "Crop yields fall without bees" is a claim. "Bees" is a topic. Doing this takes about 40 seconds and stops me from being fooled by shared words.`,
      `Shared words are the trap. The odd sentence is often about the same subject as the rest. In a small made-up case, four sentences discuss bees: they pollinate crops, pesticide use has cut their numbers, yields fall as their numbers fall, and farmers now pay to bring hives in. The fifth says that bees communicate by dancing. Same subject, different point. So the test is not whether a sentence is about bees, but whether it carries the argument forward.`,
      `Next, I try to form a chain with as many sentences as I can. Usually three link quickly. Then I test the remaining two. Which one can join the chain? The one that cannot join is the answer.`,
      `Watch for a sentence that looks odd only because it sits at a different level. An example can feel out of place until you notice that it illustrates another sentence's claim. Before I call a sentence odd, I ask whether it could be an example, a cause or a result of another sentence. If it could, it stays.`,
      `After a wrong answer, I do not just read the solution. I write out the paragraph with the correct sentences in order, to feel how they connect. That takes two minutes and shows me what I missed.`,
      `I did five of these a day for three weeks. My accuracy went up, not because I got cleverer, but because I stopped deciding on a feeling after one reading.`,
    ],
  },
  {
    id: 'ps-own-line-first',
    title: 'Para-summary: write your own line before you read the options',
    section: 'VARC',
    topic: 'Para-summary',
    authorLabel: "Sample alum · IIM L '24 · 98.4 %ile",
    upvotes: 77,
    body: [
      `My mistake with para-summaries was reading the options too soon. All four are written to sound like the paragraph, and once you have read them, your own reading is gone. So I cover them with my hand until I have an answer of my own.`,
      `Step one. Read the paragraph and find the sentence everything else supports. It is often not the first one. Examples, data and quotes support a point. They are not the point.`,
      `Step two. Say the point in one plain line, in your own words. If it needs two lines, you have not found it yet. Say a made-up paragraph describes how a town library added a cafe, longer hours and a repair desk, and how visits doubled once it stopped being only about books. My line would be: libraries do better when they offer more than books.`,
      `Step three. Compare the options against your line and look for four problems. Too narrow: "The cafe doubled visits." This takes one detail for the whole. Too broad: "Public institutions must change with the times." This goes past what the paragraph says. New claim: "Readers no longer care about books." Nothing in the paragraph says that. Wrong emphasis: the option has the right facts but turns a side detail into the main point.`,
      `Step four. Check the tone. If the paragraph is cautious, the summary cannot be certain. If the author is critical, a neutral description misses something.`,
      `For practice, I took any opinion piece, and after each paragraph I wrote one line of at most 12 words. A day later I compared the line with the paragraph. I did this for ten minutes each morning with my tea. It also helped my RC, since it is the same skill as making a paragraph map.`,
    ],
  },
  {
    id: 'qa-percent-fraction-pairs',
    title: 'The 12 percentage-fraction pairs I memorised',
    section: 'QA',
    topic: 'Percentages',
    authorLabel: "Sample alum · IIM A '25 · 99.6 %ile",
    upvotes: 263,
    body: [
      `Most percentage questions got easier once I stopped calculating percentages and started multiplying by fractions. These are the twelve pairs I made sure I knew without thinking. I left out the obvious ones like 1/2, 1/4 and 1/5. Recurring values are rounded to two places.`,
      `1/3 = 33.33%, 1/6 = 16.67%, 1/7 = 14.29%, 1/8 = 12.5%.`,
      `3/8 = 37.5%, 5/8 = 62.5%, 7/8 = 87.5%, 1/9 = 11.11%.`,
      `1/11 = 9.09%, 1/12 = 8.33%, 1/15 = 6.67%, 1/16 = 6.25%.`,
      `The first use is plain speed. 37.5% of 480 is 3/8 of 480, which is 180. 8.33% of 960 is 1/12 of 960, which is 80. 14.29% of 350 is 1/7 of 350, which is 50. If a number in a question is a neat multiple of 7, 8 or 12, one of these fractions is often at work.`,
      `The second use is rises and falls. A rise of 1/n is undone by a fall of 1/(n + 1). So a 25% rise (1/4) is undone by a 20% fall (1/5). A 33.33% rise (1/3) is undone by a 25% fall (1/4). A 12.5% rise (1/8) is undone by an 11.11% fall (1/9). The reason is simple. A rise of 1/n multiplies by (n + 1)/n, a fall of 1/(n + 1) multiplies by n/(n + 1), and the two cancel.`,
      `The third use is working backwards. A price is 630 after a 12.5% rise. The rise multiplied the old price by 9/8, so the old price is 630 × 8/9, which is 560. No equation needed.`,
      `To learn them I made flashcards and went both ways for two weeks: see the fraction, say the percentage, then the reverse. After that, in every percentage problem I forced myself to write the fraction first, even when the long way felt quicker. It is slower for about a week. Then it is faster for good.`,
    ],
  },
  {
    id: 'qa-successive-change',
    title: 'Successive percentage changes in one line',
    section: 'QA',
    topic: 'Percentages',
    authorLabel: "Sample alum · IIM C '25 · 99.0 %ile",
    upvotes: 119,
    body: [
      `A lot of arithmetic comes down to one line. Two changes of a% and b% in a row make a total change of a + b + ab/100 percent. Falls go in as negative numbers.`,
      `Try it. A rise of 20% and then 30%: 20 + 30 + (20 × 30)/100 = 56, so a 56% rise. Check: 1.2 × 1.3 = 1.56. A rise of 10% followed by a fall of 10%: 10 − 10 − 1 = −1, so a 1% fall. This is why equal moves up and down do not cancel.`,
      `For three changes, combine two and then add the third. Take +10%, +20% and −25%. The first two make 10 + 20 + 2 = 32. Then 32 − 25 − 8 = −1. So the total is a 1% fall. Check: 1.1 × 1.2 × 0.75 = 0.99.`,
      `The same line covers more than it seems to. Compound interest at 10% for two years is 10 + 10 + 1 = 21%. Add a third year and it is 21 + 10 + 2.1 = 33.1%. A rectangle with length up 20% and breadth down 10% has an area change of 20 − 10 − 2 = 8%, a rise. Revenue is price times units, so a 25% price rise with a 20% fall in units gives 25 − 20 − 5 = 0, no change. A shop that marks goods 40% above cost and gives a 20% discount makes 40 − 20 − 8 = 12, a 12% profit.`,
      `It breaks in one place. The line works only for changes that multiply. If a bill goes up 10% and a flat fee of 50 rupees is added, you have to work in steps. Also ask what each percentage is of. A 20% discount on the marked price and a 20% margin on cost have different bases.`,
      `I practised with ten mental problems a day on the bus for a week, with no paper. After that, I wrote the answer first and checked by multiplying only when the options were close.`,
    ],
  },
  {
    id: 'qa-time-work-lcm',
    title: 'Time and work: I assume the total and stop using fractions',
    section: 'QA',
    topic: 'Time and work',
    authorLabel: "Sample alum · IIM K '25 · 98.8 %ile",
    upvotes: 128,
    body: [
      `Fractions make time and work look harder than it is. Take the total work as the LCM of the times given, and everything becomes whole numbers.`,
      `A can finish a job in 12 days, B in 15 and C in 20. The LCM is 60, so call the job 60 units. A does 5 units a day, B does 4 and C does 3. Together they do 12 units a day, so they finish in 5 days. There was no adding of 1/12, 1/15 and 1/20 anywhere.`,
      `Pipes work the same way, with drains as negative. A tank fills through one pipe in 12 hours and another in 15, and a drain empties it in 20. On a 60-unit tank that is +5, +4 and −3 an hour. The net is 6 units an hour, so the tank fills in 10 hours.`,
      `When you are given pairs, add them. If A and B take 12 days, B and C take 15, and C and A take 20, then on a 60-unit job the pairs do 5, 4 and 3 units a day. Adding gives 12, which counts each person twice, so all three do 6 units a day and finish in 10 days. A alone does 6 − 4 = 2 units a day, so 30 days. B does 3 a day, so 20 days. C does 1 a day, so 60 days.`,
      `When you are given a speed ratio, use it as the rate. If A is twice as fast as B and together they take 8 days, the rates are 2 and 1, and the total is 3 × 8 = 24 units. So B alone takes 24 days and A takes 12.`,
      `When someone leaves halfway, count the work in the order it happens. A takes 10 days and B takes 15, so on a 30-unit job the rates are 3 and 2. They work together for 3 days and do 15 units. A leaves. B needs 15 ÷ 2 = 7.5 more days, so the job takes 10.5 days in all.`,
      `The habit to build is to write the rates in a row before anything else. Most of my slips in this topic came from rushing that one line.`,
    ],
  },
  {
    id: 'qa-time-splits',
    title: 'How I split my time in QA',
    section: 'QA',
    topic: 'Time splits',
    authorLabel: "Sample alum · IIM B '24 · 99.3 %ile",
    upvotes: 187,
    body: [
      `My QA score stayed flat for two months, even as I learned more topics. The problem was not knowledge. I was solving questions in the order they came and spending six minutes on whichever one happened to annoy me.`,
      `So I moved to three rounds on the 40-minute sectionals I practised with. The times below are what suited me. Use them as a start, not a rule.`,
      `Round one, 18 minutes. I go through every question and give each one about 20 seconds to decide. If I can see the method and it looks short, I solve it now. If I can see the method but it looks long, I mark it for round two. If I cannot see a way in, I skip it without marking. The aim of this round is to sort, and to take every short question on the paper.`,
      `Round two, 15 minutes. Marked questions only. I allow up to three minutes each and keep an eye on the clock. If I am not close at three minutes, I leave the question, even if I feel I am nearly there. That feeling was wrong more often than it was right.`,
      `Round three, 7 minutes. I recheck answers where I made an assumption, such as whether a variable had to be a whole number. If something has come to me on a skipped question, I try it. I do not start anything new in the last two minutes.`,
      `The most useful number was the time at which I finished round one. I wrote it down after every mock. If it was over 20 minutes, I had been solving when I should have been sorting.`,
      `Attempts are not the goal. My best mock had fewer attempts than my worst one. In mocks with negative marking, I answered a multiple-choice question only when I could remove at least two options for a real reason.`,
      `Give this three mocks before you judge it. In the first you will feel you are skipping too much. Afterwards, count the skipped questions you could have solved in under two minutes. Those are your sorting errors. Fix those before you try to get faster.`,
    ],
  },
  {
    id: 'strategy-mock-analysis',
    title: 'How I analysed a mock in 90 minutes',
    section: 'Strategy',
    topic: 'Mock analysis',
    authorLabel: "Sample alum · IIM A '25 · 99.5 %ile",
    upvotes: 228,
    body: [
      `I took about 40 mocks and wasted the first 15. I would check my score, feel good or bad, read a few solutions and book the next one. My scores began to move only when I gave every mock a fixed 90-minute review, on the same day or the next morning.`,
      `The first 20 minutes are for solving again without a clock. Before I look at any solution, I retry the questions I skipped or got wrong. This separates what I did not know from what I could not do under pressure. They need different fixes.`,
      `The next 40 minutes are for sorting. Every wrong or skipped question goes in one of four buckets. Concept gap: I do not know the method. Careless: I knew it and slipped. Selection: I should have skipped this one, or should have tried it. Time: I would have got it, but I ran out.`,
      `The next 20 minutes are for the questions I got right. I look at the ones that took too long. A question you solve in five minutes when a one-minute method exists has cost you another question, and the score will never show that.`,
      `The last 10 minutes are for one change. Only one, written as a sentence, for the next mock. For example: leave a DILR set if there is no new deduction in four minutes. Then I move the concept gaps to my list for the week.`,
      `The buckets tell you what to do. If most are concept gaps, more mocks will not help, so stop for a week and study. If most are selection or time, the problem is strategy, and you should drill choosing and leaving. If most are careless, look at how you write your working.`,
      `Do not compare percentiles across mock series. Scores move with the difficulty of the paper. Compare your bucket counts over time instead.`,
      `Two mocks a week was the most I could review properly. A mock you do not review is only a test of stamina.`,
    ],
  },
  {
    id: 'strategy-error-log',
    title: 'The error log that fit on one page',
    section: 'Strategy',
    topic: 'Mock analysis',
    authorLabel: "Sample alum · IIM I '24 · 98.5 %ile",
    upvotes: 101,
    body: [
      `My first error log was a spreadsheet with eleven columns. I filled it in for nine days and never opened it again. The log that lasted was one sheet of paper, kept in the front of my notebook, and it had three columns.`,
      `Column one is the pattern, in my own words, not the question. Not "question 14 from mock 6", but "forgot that the number of terms is one more than the number of gaps". If I could not say the pattern in one line, I had not understood the mistake yet.`,
      `Column two is the fix, also one line, written as an instruction to myself. "Check whether the variable must be a whole number before solving." "Reread the last line of a DILR question before marking."`,
      `Column three is a tally. Every time the same mistake came up again, I added a stroke. This is the column that does the work. After a month, three or four rows had five or more strokes, and those rows told me what to fix first.`,
      `I rewrote the sheet every two weeks. Patterns that had not returned were dropped, and the ones with the most strokes went to the top. Rewriting took ten minutes, and it was the best revision I did, because I had to read my own mistakes.`,
      `Before each mock I read the top five rows. That took one minute and changed how I started the paper. In the last week, this sheet replaced my formula notes as the thing I read every day.`,
      `Keep it small. A log you read every day beats a detailed one that you only fill in. If you find yourself adding columns, stop and go back to three.`,
    ],
  },
  {
    id: 'strategy-weekday-routine',
    title: 'A weekday routine that survived a full-time job',
    section: 'Strategy',
    topic: 'Planning',
    authorLabel: "Sample alum · IIM L '25 · 98.3 %ile",
    upvotes: 146,
    body: [
      `I prepared while working, so I had about 90 minutes on weekdays and five or six hours across the weekend. Big plans lasted a few days at most. What lasted was a boring routine in which each day had one job.`,
      `Mornings were 30 minutes, before I opened my phone: one RC passage and its review. This kept verbal alive every day without taking evening time, when I was too tired to read closely.`,
      `Evenings were 60 minutes, and the job changed with the day. Monday was a QA topic, learning or revising. Tuesday was two DILR sets. Wednesday was timed QA practice on Monday's topic. Thursday was para-jumbles and summaries. Friday was my error log and whatever I had dropped that week.`,
      `Saturday morning was a mock, at the time I expected to sit the real paper. Sunday morning was the review. Sunday evening I wrote out the next week in ten minutes and went no further ahead than that.`,
      `Two rules kept this alive. If I missed a day, I did not carry it forward. The work was gone, and the next day stayed the same. Carrying work forward is what had broken every earlier plan, because one bad evening turned into a pile.`,
      `The second rule was a minimum day. On the worst days I did one RC passage or ten questions, and that was enough. It sounds small, but it meant that I never had to restart. Most of my lost weeks had begun with one day of nothing.`,
      `I also stopped watching long lectures once the basics were done. An hour of watching felt like work, but after a mock I could rarely point to what it had changed. Solving and reviewing, in that order, was where my time went from then on.`,
    ],
  },
  {
    id: 'strategy-last-seven-days',
    title: 'Sleep and my routine in the last seven days',
    section: 'Strategy',
    topic: 'Exam week',
    authorLabel: "Sample alum · IIM C '24 · 99.2 %ile",
    upvotes: 192,
    body: [
      `The last week is about arriving rested and without surprises. Nothing you learn in those days will matter as much as how you feel in the exam hall.`,
      `I started with sleep. A week before the exam I fixed my waking time to match my slot, so that my brain was properly awake at that hour. For a morning slot, that meant getting up about three hours before the start and eating a normal breakfast. I went to bed at the same time every night and did no late revision.`,
      `My last full mock was five days before the exam. After that I did only small timed pieces: a couple of sets, one passage, a handful of questions. I was keeping my hand in, not measuring myself. A bad score that week can do real harm, and there is no time left to act on it.`,
      `From day four to day two I revised only my own material: the error log, a formula sheet and the percentage-fraction pairs. No new topics, no new tricks, and no new strategy from a video someone sent me. I used in the exam what I had used in mocks.`,
      `The day before, I stopped by evening. I packed my documents and checked the route and how long it would take. I ate food that I knew agreed with me, went for a walk, and stayed off prep groups, because other people's panic is catching.`,
      `If you cannot sleep on the last night, do not panic about that either. Many people sleep badly before an exam. One poor night after a steady week does much less damage than you fear, so just rest and let it be.`,
      `In the exam, treat each section as a new start. If one feels hard, it is probably hard for others too. Do what you planned, and leave the last section behind when the next one begins.`,
    ],
  },
];

export const ALUM_NOTES: AlumNote[] = RAW_NOTES.map((n) => ({ ...n, readingMinutes: readingMinutesFor(n.body) }));
