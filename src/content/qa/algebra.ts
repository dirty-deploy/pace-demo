// Algebra: QA036 to QA050. Equations, Inequalities, Functions, Progressions.

import { defineQa } from '../defineQa';
import type { QaQuestion } from '../defineQa';
import { fraction, gcd, inr, withUnit } from './helpers';

export const ALGEBRA: QaQuestion[] = [
  // ---- Equations ----
  defineQa({
    id: 'QA036',
    topic: 'Equations',
    subType: 'Linear pair',
    difficulty: 'Easy',
    expectedSeconds: 70,
    kind: 'mcq',
    params: { pens1: 3, books1: 2, bill1: 138, pens2: 2, books2: 3, bill2: 162 },
    prompt: (p) =>
      `At a Guwahati stationery shop, ${p.pens1} pens and ${p.books1} notebooks cost ${inr(p.bill1)}, while ${p.pens2} pens and ${p.books2} notebooks cost ${inr(p.bill2)}. What is the price of one notebook?`,
    solve: (p) =>
      (p.pens1 * p.bill2 - p.pens2 * p.bill1) / (p.pens1 * p.books2 - p.pens2 * p.books1),
    key: 42,
    format: inr,
    wrong: [18, 60, 24],
    explanation: (p) => {
      const sum = (p.bill1 + p.bill2) / 5;
      const gap = p.bill2 - p.bill1;
      return `Add the two bills: 5 pens and 5 notebooks cost ${inr(p.bill1 + p.bill2)}, so one pen and one notebook cost ${inr(sum)}. Subtract the bills: a notebook costs ${inr(gap)} more than a pen. So the notebook is (${sum} + ${gap}) / 2 = ${inr((sum + gap) / 2)}.`;
    },
    trap: 'Partial scope trap',
  }),
  defineQa({
    id: 'QA037',
    topic: 'Equations',
    subType: 'Roots of a quadratic',
    difficulty: 'Medium',
    expectedSeconds: 100,
    kind: 'mcq',
    params: { sum: 7, squares: 25 },
    prompt: (p) =>
      `The roots of x² - ${p.sum}x + k = 0 are α and β, and α² + β² = ${p.squares}. What is the value of k?`,
    solve: (p) => (p.sum * p.sum - p.squares) / 2,
    key: 12,
    wrong: [24, -12, 6],
    explanation: (p) =>
      `The sum of the roots is ${p.sum} and the product is k. Since (α + β)² = α² + β² + 2αβ, we get ${p.sum * p.sum} = ${p.squares} + 2k. So 2k = ${p.sum * p.sum - p.squares} and k = ${(p.sum * p.sum - p.squares) / 2}. Stopping at ${p.sum * p.sum - p.squares} forgets to halve.`,
    trap: 'Calculation slip',
  }),
  defineQa({
    id: 'QA038',
    topic: 'Equations',
    subType: 'Integer solutions',
    difficulty: 'Medium',
    expectedSeconds: 110,
    kind: 'tita',
    params: { total: 1000, small: 20, big: 50 },
    prompt: (p) =>
      `A Bhopal bank cashier must pay out exactly ${inr(p.total)} using only ${inr(p.small)} and ${inr(p.big)} notes, with at least one note of each kind. How many different combinations of the two notes can she use?`,
    solve: (p) => {
      let ways = 0;
      for (let bigs = 1; bigs * p.big < p.total; bigs += 1) {
        if ((p.total - bigs * p.big) % p.small === 0) ways += 1;
      }
      return ways;
    },
    key: 9,
    commonWrong: [10, 11, 20],
    explanation: (p) =>
      `Let there be a ${inr(p.small)} notes and b ${inr(p.big)} notes, so 2a + 5b = ${p.total / 10}. For a to be a whole number, b must be even. With both at least 1, b can be 2, 4, 6 and so on up to 18, because b = 20 leaves a = 0. That gives 9 combinations.`,
    trap: 'Off-by-one trap',
  }),
  defineQa({
    id: 'QA039',
    topic: 'Equations',
    subType: 'Logarithms',
    difficulty: 'Medium',
    expectedSeconds: 105,
    kind: 'mcq',
    params: { b1: 2, b2: 4, b3: 16, total: 7 },
    prompt: (p) =>
      `Find x if (log of x to base ${p.b1}) + (log of x to base ${p.b2}) + (log of x to base ${p.b3}) = ${p.total}.`,
    solve: (p) => {
      const coefficient = 1 + 1 / Math.log2(p.b2) + 1 / Math.log2(p.b3);
      return 2 ** (p.total / coefficient);
    },
    key: 16,
    wrong: [4, 2, 128],
    explanation: (p) =>
      `Let L be the log of x to base ${p.b1}. Then the log to base ${p.b2} is L/2 and the log to base ${p.b3} is L/4. So L + L/2 + L/4 = ${p.total}, which means 7L/4 = ${p.total} and L = 4. So x = 2 to the power 4, which is 16.`,
    trap: 'Partial scope trap',
  }),
  defineQa({
    id: 'QA040',
    topic: 'Equations',
    subType: 'Factoring integer pairs',
    difficulty: 'Hard',
    expectedSeconds: 170,
    kind: 'mcq',
    params: { n: 12 },
    prompt: (p) =>
      `How many ordered pairs of positive integers (x, y) satisfy 1/x + 1/y = 1/${p.n}?`,
    solve: (p) => {
      let pairs = 0;
      for (let x = p.n + 1; x <= p.n + p.n * p.n; x += 1) {
        if ((p.n * x) % (x - p.n) === 0) pairs += 1;
      }
      return pairs;
    },
    key: 15,
    wrong: [8, 30, 14],
    explanation: (p) =>
      `Clearing fractions gives xy - ${p.n}x - ${p.n}y = 0, so (x - ${p.n})(y - ${p.n}) = ${p.n * p.n}. Both brackets must be positive, since two negative brackets would each be above -${p.n} and could not multiply to ${p.n * p.n}. Now ${p.n * p.n} = 2⁴ × 3² has 5 × 3 = 15 factors, and each factor gives one ordered pair. So there are 15 pairs, and (24, 24) counts only once.`,
    trap: 'Ordered versus unordered trap',
  }),

  // ---- Inequalities ----
  defineQa({
    id: 'QA041',
    topic: 'Inequalities',
    subType: 'Quadratic inequality',
    difficulty: 'Easy',
    expectedSeconds: 70,
    kind: 'mcq',
    params: { b: 9, c: 14 },
    prompt: (p) => `How many integers x satisfy x² - ${p.b}x + ${p.c} < 0?`,
    solve: (p) => {
      let count = 0;
      for (let x = -100; x <= 100; x += 1) if (x * x - p.b * x + p.c < 0) count += 1;
      return count;
    },
    key: 4,
    wrong: [6, 5, 2],
    explanation: (p) =>
      `The expression factors as (x - 2)(x - 7), using 2 + 7 = ${p.b} and 2 × 7 = ${p.c}. It is negative only strictly between the roots, so 2 < x < 7. The integers are 3, 4, 5 and 6, which is 4 values. The roots themselves make it 0, not negative.`,
    trap: 'Endpoint trap',
  }),
  defineQa({
    id: 'QA042',
    topic: 'Inequalities',
    subType: 'Modulus',
    difficulty: 'Medium',
    expectedSeconds: 100,
    kind: 'tita',
    params: { a: 2, b: 7, limit: 9 },
    prompt: (p) => `Find the sum of all integers x that satisfy |${p.a}x - ${p.b}| ≤ ${p.limit}.`,
    solve: (p) => {
      let sum = 0;
      for (let x = -100; x <= 100; x += 1) if (Math.abs(p.a * x - p.b) <= p.limit) sum += x;
      return sum;
    },
    key: 35,
    commonWrong: [36, 27, 10],
    explanation: (p) =>
      `The condition means -${p.limit} ≤ ${p.a}x - ${p.b} ≤ ${p.limit}. Adding ${p.b} gives -${p.limit - p.b} ≤ ${p.a}x ≤ ${p.limit + p.b}, so -1 ≤ x ≤ 8. The integers are -1, 0, 1 and so on up to 8. Their sum is 36 - 1 = 35.`,
    trap: 'Endpoint trap',
  }),
  defineQa({
    id: 'QA043',
    topic: 'Inequalities',
    subType: 'Weighted AM-GM',
    difficulty: 'Hard',
    expectedSeconds: 165,
    kind: 'mcq',
    params: { total: 12 },
    prompt: (p) =>
      `a, b and c are positive real numbers with a + b + c = ${p.total}. What is the greatest possible value of a²bc?`,
    solve: (p) => 4 * (p.total / 4) ** 4,
    key: 324,
    wrong: [256, 288, 81],
    explanation: (p) =>
      `Split a into two equal parts, so the four numbers a/2, a/2, b, c add up to ${p.total}. By AM-GM, their product is largest when all four are equal, each ${p.total / 4}. That gives a = ${p.total / 2}, b = ${p.total / 4} and c = ${p.total / 4}. So a²bc = ${(p.total / 2) ** 2} × ${p.total / 4} × ${p.total / 4} = ${4 * (p.total / 4) ** 4}.`,
    trap: 'Equal split trap',
  }),

  // ---- Functions ----
  defineQa({
    id: 'QA044',
    topic: 'Functions',
    subType: 'Composition',
    difficulty: 'Easy',
    expectedSeconds: 65,
    kind: 'mcq',
    params: { m: 2, c: 3, s: 1, x1: 3, x2: 1 },
    prompt: (p) =>
      `Let f(x) = ${p.m}x + ${p.c} and g(x) = x² - ${p.s}. What is f(g(${p.x1})) - g(f(${p.x2}))?`,
    solve: (p) => {
      const f = (x: number) => p.m * x + p.c;
      const g = (x: number) => x * x - p.s;
      return f(g(p.x1)) - g(f(p.x2));
    },
    key: -5,
    wrong: [5, 19, 24],
    explanation: (p) => {
      const f = (x: number) => p.m * x + p.c;
      const g = (x: number) => x * x - p.s;
      return `Work from the inside out. g(${p.x1}) = ${g(p.x1)}, so f(g(${p.x1})) = ${f(g(p.x1))}. f(${p.x2}) = ${f(p.x2)}, so g(f(${p.x2})) = ${g(f(p.x2))}. The difference is ${f(g(p.x1))} - ${g(f(p.x2))} = ${f(g(p.x1)) - g(f(p.x2))}.`;
    },
    trap: 'Sign slip',
  }),
  defineQa({
    id: 'QA045',
    topic: 'Functions',
    subType: 'Functional equation',
    difficulty: 'Medium',
    expectedSeconds: 125,
    kind: 'tita',
    params: { first: 3, n: 10 },
    prompt: (p) =>
      `A function f on the positive integers has f(1) = ${p.first} and f(x + y) = f(x) + f(y) + 2xy for all positive integers x and y. What is f(${p.n})?`,
    solve: (p) => {
      let value = p.first;
      for (let k = 1; k < p.n; k += 1) value += p.first + 2 * k;
      return value;
    },
    key: 120,
    commonWrong: [30, 140, 75],
    explanation: (p) => {
      const extra = p.n * (p.n - 1);
      return `Put y = 1: f(x + 1) = f(x) + ${p.first} + 2x. So going from f(1) to f(${p.n}) adds ${p.first} nine times, plus 2 × (1 + 2 + ... + ${p.n - 1}) = ${extra}. That gives f(${p.n}) = ${p.first} + ${9 * p.first} + ${extra} = ${p.first + 9 * p.first + extra}. The formula is f(x) = x² + 2x, which fits f(1) = ${p.first}.`;
    },
    trap: 'Partial scope trap',
  }),
  defineQa({
    id: 'QA046',
    topic: 'Functions',
    subType: 'Repeating sequence',
    difficulty: 'Hard',
    expectedSeconds: 160,
    kind: 'mcq',
    params: { first: 2, n: 2026 },
    prompt: (p) =>
      `A function on the positive integers has f(1) = ${p.first} and f(n + 1) = (1 + f(n)) / (1 - f(n)) for every positive integer n. What is f(${p.n})?`,
    solve: (p) => {
      let top = p.first;
      let bottom = 1;
      for (let i = 1; i < p.n; i += 1) {
        const nextTop = bottom + top;
        const nextBottom = bottom - top;
        const common = gcd(nextTop, nextBottom);
        top = nextTop / common;
        bottom = nextBottom / common;
      }
      return top / bottom;
    },
    key: -3,
    format: fraction,
    wrong: [2, -1 / 2, 1 / 3],
    explanation: (p) =>
      `Compute the first few terms: f(1) = ${p.first}, f(2) = 3/(-1) = -3, f(3) = -2/4 = -1/2, f(4) = (1/2)/(3/2) = 1/3, and f(5) = (4/3)/(2/3) = 2. So the values repeat every 4 terms. ${p.n} leaves remainder ${p.n % 4} when divided by 4, so f(${p.n}) = f(${p.n % 4}) = -3.`,
    trap: 'Off-by-one trap',
  }),

  // ---- Progressions ----
  defineQa({
    id: 'QA047',
    topic: 'Progressions',
    subType: 'Arithmetic sum',
    difficulty: 'Easy',
    expectedSeconds: 75,
    kind: 'mcq',
    params: { start: 1200, step: 50, weeks: 20 },
    prompt: (p) =>
      `A Coimbatore mill makes ${p.start} metres of cloth in week 1 and steps up output by ${p.step} metres every week. How many metres does it make in the first ${p.weeks} weeks altogether?`,
    solve: (p) => (p.weeks * (2 * p.start + (p.weeks - 1) * p.step)) / 2,
    key: 33500,
    format: withUnit('metres'),
    wrong: [34000, 2150, 24000],
    explanation: (p) => {
      const last = p.start + (p.weeks - 1) * p.step;
      return `Week ${p.weeks} output is ${p.start} + ${p.weeks - 1} × ${p.step} = ${last} metres, since there are only ${p.weeks - 1} step-ups. The average week is (${p.start} + ${last}) / 2 = ${(p.start + last) / 2}. Total = ${p.weeks} × ${(p.start + last) / 2} = ${(p.weeks * (p.start + last)) / 2} metres.`;
    },
    trap: 'Off-by-one trap',
  }),
  defineQa({
    id: 'QA048',
    topic: 'Progressions',
    subType: 'Geometric growth',
    difficulty: 'Medium',
    expectedSeconds: 105,
    kind: 'mcq',
    params: { first: 3, ratio: 3, target: 1000 },
    prompt: (p) =>
      `A Jaipur food reel gets ${p.first} new shares on day 1. Each later day, the number of new shares is ${p.ratio} times that of the day before. On which day does the running total of shares first go above ${p.target}?`,
    solve: (p) => {
      let today = p.first;
      let total = p.first;
      let day = 1;
      while (total <= p.target) {
        today *= p.ratio;
        total += today;
        day += 1;
      }
      return day;
    },
    key: 6,
    format: (n) => `Day ${n}`,
    wrong: [7, 5, 26],
    explanation: (p) =>
      `The daily shares are 3, 9, 27, 81, 243 and 729. The running total after day 5 is 363, which is still under ${p.target}. Day 6 adds 729, taking it to 1092. So the total first passes ${p.target} on day 6, even though no single day has reached ${p.target} yet.`,
    trap: 'Partial scope trap',
  }),
  defineQa({
    id: 'QA049',
    topic: 'Progressions',
    subType: 'AP turning into GP',
    difficulty: 'Medium',
    expectedSeconds: 150,
    kind: 'tita',
    params: { sum: 21, add1: 1, add2: 1, add3: 5 },
    prompt: (p) =>
      `Three positive numbers in increasing arithmetic progression add up to ${p.sum}. If ${p.add1}, ${p.add2} and ${p.add3} are added to the first, second and third numbers respectively, the results form a geometric progression. What is the largest of the original numbers?`,
    solve: (p) => {
      const mid = p.sum / 3;
      const a = mid + p.add1;
      const b = mid + p.add3;
      const c = (mid + p.add2) ** 2;
      const d = (a - b + Math.sqrt((b - a) ** 2 - 4 * (c - a * b))) / 2;
      return mid + d;
    },
    key: 11,
    commonWrong: [15, 16, 7],
    explanation: (p) =>
      `Three numbers in AP adding to ${p.sum} have middle term ${p.sum / 3}, so they are ${p.sum / 3} - d, ${p.sum / 3} and ${p.sum / 3} + d. The new numbers are 8 - d, 8 and 12 + d, so (8 - d)(12 + d) = 64. This gives d² + 4d - 32 = 0, so d = 4 or d = -8. The numbers must increase, so d = 4 and they are 3, 7 and 11. The largest is 11.`,
    trap: 'Extra root trap',
  }),
  defineQa({
    id: 'QA050',
    topic: 'Progressions',
    subType: 'Sum under two remainders',
    difficulty: 'Hard',
    expectedSeconds: 190,
    kind: 'mcq',
    params: { m1: 5, r1: 2, m2: 7, r2: 3 },
    prompt: (p) =>
      `What is the sum of all three-digit numbers that leave remainder ${p.r1} when divided by ${p.m1} and remainder ${p.r2} when divided by ${p.m2}?`,
    solve: (p) => {
      let sum = 0;
      for (let x = 100; x <= 999; x += 1) if (x % p.m1 === p.r1 && x % p.m2 === p.r2) sum += x;
      return sum;
    },
    key: 14547,
    wrong: [13550, 14425, 14634],
    explanation: (p) =>
      `The smallest number meeting both conditions is 17, and they repeat every ${p.m1} × ${p.m2} = ${p.m1 * p.m2}. The three-digit ones run from 122 to 997, which is (997 - 122)/${p.m1 * p.m2} + 1 = 26 terms. Their sum is 26 × (122 + 997)/2 = 14547.`,
    trap: 'Off-by-one trap',
  }),
];
