// Number systems: QA060 to QA065.

import { defineQa } from '../defineQa';
import type { QaQuestion } from '../defineQa';
import { lcm, primePowerInFactorial, withUnit } from './helpers';

export const NUMBERS: QaQuestion[] = [
  defineQa({
    id: 'QA060',
    topic: 'Number systems',
    subType: 'LCM',
    difficulty: 'Medium',
    expectedSeconds: 100,
    kind: 'mcq',
    params: { a: 12, b: 18, c: 30, minutes: 10 },
    prompt: (p) =>
      `Three strings of Diwali lights blink every ${p.a}, ${p.b} and ${p.c} seconds, and all three blink together at exactly 7:00:00 pm. After that moment, how many more times do all three blink together up to and including 7:${p.minutes}:00 pm?`,
    solve: (p) => Math.floor((p.minutes * 60) / lcm(lcm(p.a, p.b), p.c)),
    key: 3,
    wrong: [4, 100, 6],
    explanation: (p) => {
      const period = lcm(lcm(p.a, p.b), p.c);
      return `They blink together every LCM(${p.a}, ${p.b}, ${p.c}) = ${period} seconds. The window is ${p.minutes * 60} seconds, and ${p.minutes * 60} / ${period} is between 3 and 4. So they blink together at 3 more moments: 7:03, 7:06 and 7:09. The blink at 7:00:00 itself is not counted.`;
    },
    trap: 'Off-by-one trap',
  }),
  defineQa({
    id: 'QA061',
    topic: 'Number systems',
    subType: 'Trailing zeros',
    difficulty: 'Medium',
    expectedSeconds: 100,
    kind: 'tita',
    params: { n: 250 },
    prompt: (p) =>
      `How many zeros are at the end of the product 1 × 2 × 3 × ... × ${p.n}, written out in full?`,
    solve: (p) => primePowerInFactorial(p.n, 5),
    key: 62,
    commonWrong: [50, 60, 25],
    explanation: (p) =>
      `Each end zero needs a pair of 2 and 5, and 2s are far more common, so we count the 5s. Multiples of 5 give ${Math.floor(p.n / 5)}, multiples of 25 give ${Math.floor(p.n / 25)} more, and multiples of 125 give ${Math.floor(p.n / 125)} more. The total is ${primePowerInFactorial(p.n, 5)}.`,
    trap: 'Higher powers trap',
  }),
  defineQa({
    id: 'QA062',
    topic: 'Number systems',
    subType: 'Remainders of powers',
    difficulty: 'Medium',
    expectedSeconds: 115,
    kind: 'mcq',
    params: { base: 7, power: 2026, divisor: 25 },
    prompt: (p) => `What is the remainder when ${p.base} raised to the power ${p.power} is divided by ${p.divisor}?`,
    solve: (p) => {
      let remainder = 1;
      for (let i = 0; i < p.power; i += 1) remainder = (remainder * p.base) % p.divisor;
      return remainder;
    },
    key: 24,
    wrong: [1, 18, 7],
    explanation: (p) =>
      `Powers of ${p.base} divided by ${p.divisor} leave 7, 24, 18, 1 and then repeat, so the cycle length is 4. ${p.power} = 4 × ${Math.floor(p.power / 4)} + ${p.power % 4}, so the remainder is the second value in the cycle. That is 24.`,
    trap: 'Off-by-one trap',
  }),
  defineQa({
    id: 'QA063',
    topic: 'Number systems',
    subType: 'Counting factors',
    difficulty: 'Medium',
    expectedSeconds: 120,
    kind: 'mcq',
    params: { total: 1800, multipleOf: 6 },
    prompt: (p) =>
      `A Dharwad sweet shop packs exactly ${p.total} pedas into one or more identical boxes with no peda left over. The number of pedas per box must be a multiple of ${p.multipleOf}. How many different box sizes are possible?`,
    solve: (p) => {
      let sizes = 0;
      for (let size = p.multipleOf; size <= p.total; size += p.multipleOf) {
        if (p.total % size === 0) sizes += 1;
      }
      return sizes;
    },
    key: 18,
    format: withUnit('sizes'),
    wrong: [36, 27, 9],
    explanation: (p) =>
      `A box size must divide ${p.total} = 2³ × 3² × 5² and also be a multiple of ${p.multipleOf} = 2 × 3. So it uses 2 to the power 1, 2 or 3, which is 3 choices, and 3 to the power 1 or 2, which is 2 choices. The power of 5 can be 0, 1 or 2, which is 3 choices. That gives 3 × 2 × 3 = 18 sizes.`,
    trap: 'Partial scope trap',
  }),
  defineQa({
    id: 'QA064',
    topic: 'Number systems',
    subType: 'Highest power in a factorial',
    difficulty: 'Hard',
    expectedSeconds: 155,
    kind: 'mcq',
    params: { n: 150, base: 12 },
    prompt: (p) =>
      `Let N be the product of all integers from 1 to ${p.n}. What is the largest integer k such that ${p.base} raised to the power k divides N exactly?`,
    solve: (p) =>
      Math.min(Math.floor(primePowerInFactorial(p.n, 2) / 2), primePowerInFactorial(p.n, 3)),
    key: 72,
    wrong: [73, 146, 48],
    explanation: (p) => {
      const twos = primePowerInFactorial(p.n, 2);
      const threes = primePowerInFactorial(p.n, 3);
      return `${p.base} = 2² × 3, so we need both primes. N contains 2 to the power ${twos}, which gives ${Math.floor(twos / 2)} pairs of 2s. N contains 3 to the power ${threes}. Each ${p.base} uses one pair and one 3, so the smaller count wins, and k = ${Math.min(Math.floor(twos / 2), threes)}. Here the 3s run out before the pairs of 2s do.`;
    },
    trap: 'Limiting prime trap',
  }),
  defineQa({
    id: 'QA065',
    topic: 'Number systems',
    subType: 'Difference of squares',
    difficulty: 'Hard',
    expectedSeconds: 160,
    kind: 'mcq',
    params: { n: 720 },
    prompt: (p) => `How many pairs of positive integers (a, b) with a > b satisfy a² - b² = ${p.n}?`,
    solve: (p) => {
      let pairs = 0;
      for (let d = 1; d * d < p.n; d += 1) {
        if (p.n % d === 0 && (p.n / d - d) % 2 === 0) pairs += 1;
      }
      return pairs;
    },
    key: 9,
    wrong: [15, 18, 30],
    explanation: (p) =>
      `Write ${p.n} = (a - b)(a + b). These two factors are both even or both odd, and since ${p.n} is even they must both be even. Setting a - b = 2u and a + b = 2v gives uv = ${p.n / 4} with u < v. ${p.n / 4} has 18 factors and is not a perfect square, so it splits into 9 pairs, which gives 9 solutions.`,
    trap: 'Parity trap',
  }),
];
