// Modern maths: QA066 to QA073. Permutations and combinations, Probability, Set theory.

import { defineQa } from '../defineQa';
import type { QaQuestion } from '../defineQa';
import { factorial, fraction, nCr, withUnit } from './helpers';

export const MODERN: QaQuestion[] = [
  // ---- Permutations and combinations ----
  defineQa({
    id: 'QA066',
    topic: 'Permutations and combinations',
    subType: 'Repeated letters',
    difficulty: 'Easy',
    expectedSeconds: 65,
    kind: 'mcq',
    params: { letters: 6, repeats: 2 },
    prompt: (p) =>
      `How many different arrangements can be made using all ${p.letters} letters of the word MUMBAI?`,
    solve: (p) => factorial(p.letters) / factorial(p.repeats),
    key: 360,
    wrong: [720, 180, 120],
    explanation: (p) =>
      `With ${p.letters} letters all different, there would be ${p.letters}! = ${factorial(p.letters)} arrangements. But M appears ${p.repeats} times, so swapping the two Ms gives nothing new. Divide by ${p.repeats}!, which gives ${factorial(p.letters) / factorial(p.repeats)}.`,
    trap: 'Repetition trap',
  }),
  defineQa({
    id: 'QA067',
    topic: 'Permutations and combinations',
    subType: 'Committee with a condition',
    difficulty: 'Medium',
    expectedSeconds: 110,
    kind: 'mcq',
    params: { men: 6, women: 5, size: 4, minWomen: 2 },
    prompt: (p) =>
      `A Durga Puja committee of ${p.size} is to be chosen from ${p.men} men and ${p.women} women. The committee must have ${p.minWomen} or more women. How many different committees are possible?`,
    solve: (p) => {
      let ways = 0;
      for (let w = p.minWomen; w <= p.size; w += 1) ways += nCr(p.women, w) * nCr(p.men, p.size - w);
      return ways;
    },
    key: 215,
    wrong: [330, 150, 210],
    explanation: (p) => {
      const two = nCr(p.women, 2) * nCr(p.men, 2);
      const three = nCr(p.women, 3) * nCr(p.men, 1);
      const four = nCr(p.women, 4);
      return `Split by the number of women. Two women and two men: ${nCr(p.women, 2)} × ${nCr(p.men, 2)} = ${two}. Three women and one man: ${nCr(p.women, 3)} × ${p.men} = ${three}. Four women: ${four}. The total is ${two} + ${three} + ${four} = ${two + three + four}.`;
    },
    trap: 'Partial scope trap',
  }),
  defineQa({
    id: 'QA068',
    topic: 'Permutations and combinations',
    subType: 'Identical items with limits',
    difficulty: 'Hard',
    expectedSeconds: 190,
    kind: 'tita',
    params: { mangoes: 10, children: 4, least: 1, most: 4 },
    prompt: (p) =>
      `A grandmother in Ratnagiri gives ${p.mangoes} identical mangoes to her ${p.children} grandchildren, who are different people. Each child gets at least ${p.least} mango and no child gets more than ${p.most}. All ${p.mangoes} mangoes are given out. In how many ways can she do this?`,
    solve: (p) => {
      const count = (left: number, kids: number): number => {
        if (kids === 0) return left === 0 ? 1 : 0;
        let ways = 0;
        for (let m = p.least; m <= p.most; m += 1) ways += count(left - m, kids - 1);
        return ways;
      };
      return count(p.mangoes, p.children);
    },
    key: 44,
    commonWrong: [84, 74, 286],
    explanation: (p) =>
      `First give each child ${p.least} mango. That leaves ${p.mangoes - p.children} mangoes to share, with no child getting more than ${p.most - p.least} extra. Without the cap, there are C(9, 3) = 84 ways. Now remove the cases where one child gets 4 or more extra: 4 × C(5, 3) = 40. Two children cannot both go over, so the answer is 84 - 40 = 44.`,
    trap: 'Partial scope trap',
  }),

  // ---- Probability ----
  defineQa({
    id: 'QA069',
    topic: 'Probability',
    subType: 'Two dice',
    difficulty: 'Easy',
    expectedSeconds: 75,
    kind: 'mcq',
    params: { faces: 6 },
    prompt: (p) =>
      `Two fair ${p.faces}-sided dice are rolled in a board game. What is the probability that the sum of the two numbers is a perfect square?`,
    solve: (p) => {
      let hits = 0;
      for (let a = 1; a <= p.faces; a += 1) {
        for (let b = 1; b <= p.faces; b += 1) {
          if (Number.isInteger(Math.sqrt(a + b))) hits += 1;
        }
      }
      return hits / (p.faces * p.faces);
    },
    key: 7 / 36,
    format: fraction,
    wrong: [2 / 11, 1 / 9, 1 / 12],
    explanation: (p) =>
      `Sums run from 2 to 12, so the only perfect squares are 4 and 9. A sum of 4 happens in 3 ways and a sum of 9 happens in 4 ways. That is 7 of the ${p.faces * p.faces} equally likely outcomes, so the probability is 7/36.`,
    trap: 'Unequal outcomes trap',
  }),
  defineQa({
    id: 'QA070',
    topic: 'Probability',
    subType: 'Drawing without replacement',
    difficulty: 'Medium',
    expectedSeconds: 110,
    kind: 'mcq',
    params: { red: 5, blue: 4, green: 3, draw: 3 },
    prompt: (p) =>
      `A Puducherry bookshop's lucky-dip bag holds ${p.red} red, ${p.blue} blue and ${p.green} green tokens. A customer draws ${p.draw} tokens at once, without looking. What is the probability that the tokens are all of different colours?`,
    solve: (p) => (p.red * p.blue * p.green) / nCr(p.red + p.blue + p.green, p.draw),
    key: 3 / 11,
    format: fraction,
    wrong: [5 / 24, 1 / 22, 5 / 144],
    explanation: (p) => {
      const hits = p.red * p.blue * p.green;
      const all = nCr(p.red + p.blue + p.green, p.draw);
      return `There are C(${p.red + p.blue + p.green}, ${p.draw}) = ${all} ways to pick ${p.draw} tokens. Picking one of each colour can be done in ${p.red} × ${p.blue} × ${p.green} = ${hits} ways. So the probability is ${hits}/${all}, which is 3/11.`;
    },
    trap: 'With replacement trap',
  }),
  defineQa({
    id: 'QA071',
    topic: 'Probability',
    subType: 'Working back from the result',
    difficulty: 'Medium',
    expectedSeconds: 140,
    kind: 'tita',
    params: { shareA: 60, shareB: 40, faultyA: 2, faultyB: 12 },
    prompt: (p) =>
      `A Sriperumbudur plant has two lines. Line A makes ${p.shareA}% of its phone chargers and Line B makes ${p.shareB}%. ${p.faultyA}% of Line A's chargers and ${p.faultyB}% of Line B's chargers are faulty. A charger picked at random from the plant's output is found to be faulty. What is the probability that it came from Line B? Give your answer as a decimal.`,
    solve: (p) => (p.shareB * p.faultyB) / (p.shareA * p.faultyA + p.shareB * p.faultyB),
    key: 0.8,
    commonWrong: [0.4, 0.6, 0.06],
    explanation: (p) => {
      const a = (p.shareA * 10 * p.faultyA) / 100;
      const b = (p.shareB * 10 * p.faultyB) / 100;
      return `Think of 1000 chargers. Line A makes ${p.shareA * 10}, of which ${a} are faulty. Line B makes ${p.shareB * 10}, of which ${b} are faulty. So ${a + b} are faulty in all, and ${b} of them are from Line B. The probability is ${b} / ${a + b} = ${(p.shareB * p.faultyB) / (p.shareA * p.faultyA + p.shareB * p.faultyB)}.`;
    },
    trap: 'Wrong base trap',
  }),

  // ---- Set theory ----
  defineQa({
    id: 'QA072',
    topic: 'Set theory',
    subType: 'Three sets',
    difficulty: 'Medium',
    expectedSeconds: 125,
    kind: 'mcq',
    params: { cricket: 120, football: 90, kabaddi: 70, cf: 40, fk: 30, ck: 35, all: 15, total: 200 },
    prompt: (p) =>
      `At a Delhi college, each of ${p.total} students was asked about three sports. ${p.cricket} play cricket, ${p.football} play football and ${p.kabaddi} play kabaddi. ${p.cf} play both cricket and football, ${p.fk} play both football and kabaddi, and ${p.ck} play both cricket and kabaddi. These pair counts include the ${p.all} who play all three. How many students play exactly one of the three sports?`,
    solve: (p) =>
      p.cricket + p.football + p.kabaddi - 2 * (p.cf + p.fk + p.ck) + 3 * p.all,
    key: 115,
    format: withUnit('students'),
    wrong: [130, 85, 190],
    explanation: (p) => {
      const c = p.cricket - p.cf - p.ck + p.all;
      const f = p.football - p.cf - p.fk + p.all;
      const k = p.kabaddi - p.fk - p.ck + p.all;
      return `Those who play only cricket are ${p.cricket} - ${p.cf} - ${p.ck} + ${p.all} = ${c}, since the ${p.all} were removed twice. In the same way, only football is ${f} and only kabaddi is ${k}. So exactly one sport gives ${c} + ${f} + ${k} = ${c + f + k} students.`;
    },
    trap: 'Partial scope trap',
  }),
  defineQa({
    id: 'QA073',
    topic: 'Set theory',
    subType: 'Minimum overlap',
    difficulty: 'Hard',
    expectedSeconds: 150,
    kind: 'tita',
    params: { total: 100, hindi: 90, kannada: 85, tamil: 80, telugu: 75 },
    prompt: (p) =>
      `Of ${p.total} engineers at a Bengaluru office, ${p.hindi} speak Hindi, ${p.kannada} speak Kannada, ${p.tamil} speak Tamil and ${p.telugu} speak Telugu. What is the smallest possible number of engineers who speak all four languages?`,
    solve: (p) =>
      Math.max(
        0,
        p.total - (p.total - p.hindi) - (p.total - p.kannada) - (p.total - p.tamil) - (p.total - p.telugu),
      ),
    key: 30,
    commonWrong: [75, 55, 70],
    explanation: (p) => {
      const a = p.total - p.hindi;
      const b = p.total - p.kannada;
      const c = p.total - p.tamil;
      const d = p.total - p.telugu;
      return `Count the people who miss a language: ${a}, ${b}, ${c} and ${d}. To make the all-four group as small as possible, make these groups completely separate, so ${a + b + c + d} people each miss exactly one language. Everyone else speaks all four, so the minimum is ${p.total} - ${a + b + c + d} = ${p.total - a - b - c - d}.`;
    },
    trap: 'Maximum versus minimum trap',
  }),
];
