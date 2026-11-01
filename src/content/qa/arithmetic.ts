// Arithmetic: QA001 to QA035.
// Percentages, Profit and loss, Ratio and proportion, Time and work, Time speed distance,
// Simple and compound interest, Averages, Mixtures and alligation.

import { defineQa } from '../defineQa';
import type { QaQuestion } from '../defineQa';
import type { LessonRef } from '../types';
import { gcd, inr, pct, withUnit } from './helpers';

const PERCENT_LESSON: LessonRef = { lessonId: 'qa-percent-fractions', seconds: 60 };
const WORK_LESSON: LessonRef = { lessonId: 'qa-time-work-lcm', seconds: 60 };

export const ARITHMETIC: QaQuestion[] = [
  // ---- Percentages ----
  defineQa({
    id: 'QA001',
    topic: 'Percentages',
    subType: 'Successive change',
    difficulty: 'Easy',
    expectedSeconds: 70,
    kind: 'mcq',
    params: { price: 480, up: 20, down: 25 },
    prompt: (p) =>
      `A Pune bakery sold a celebration cake at ${inr(p.price)}. In January it raised the price by ${p.up}%. In March it cut the new price by ${p.down}%. What is the price of the cake after both changes?`,
    solve: (p) => (p.price * (100 + p.up) * (100 - p.down)) / 10000,
    key: 432,
    format: inr,
    wrong: [456, 360, 576],
    explanation: (p) =>
      `A ${p.up}% rise is the same as multiplying by 6/5, and a ${p.down}% cut is multiplying by 3/4. So the new price is ${p.price} × 6/5 × 3/4 = ${inr((p.price * 6 * 3) / 20)}. You cannot net the two changes to -5%, because the cut applies to the raised price, not the original.`,
    trap: 'Base change trap',
    lessonRef: PERCENT_LESSON,
  }),
  defineQa({
    id: 'QA002',
    topic: 'Percentages',
    subType: 'Reverse percentage',
    difficulty: 'Easy',
    expectedSeconds: 75,
    kind: 'tita',
    params: { now: 27000, rise: 12.5 },
    prompt: (p) =>
      `After a ${p.rise}% raise, Sarita's monthly wage at a Jaipur handloom unit is ${inr(p.now)}. By how many rupees did her monthly wage go up?`,
    solve: (p) => (p.now * p.rise) / (100 + p.rise),
    key: 3000,
    commonWrong: [3375, 24000, 30375],
    explanation: (p) =>
      `${p.rise}% is 1/8, so the new wage is 9/8 of the old wage. Old wage = ${p.now} × 8/9 = ${inr((p.now * 8) / 9)}, so the raise is ${inr(p.now / 9)}. Taking 1/8 of ${inr(p.now)} gives ${inr(p.now / 8)}, but that uses the new wage as the base.`,
    trap: 'Base change trap',
    lessonRef: PERCENT_LESSON,
  }),
  defineQa({
    id: 'QA003',
    topic: 'Percentages',
    subType: 'Layered percentages',
    difficulty: 'Medium',
    expectedSeconds: 120,
    kind: 'mcq',
    params: { margin: 380, absent: 20, invalid: 5, win: 60 },
    prompt: (p) =>
      `In a vote on rooftop solar panels at a Nagpur housing society, ${p.absent}% of the registered members did not vote. Of the votes cast, ${p.invalid}% were invalid. The proposal took ${p.win}% of the valid votes and all other valid votes went against it, so it passed by a margin of ${p.margin} votes. How many members are registered?`,
    solve: (p) => {
      const valid = (p.margin * 100) / (2 * p.win - 100);
      const cast = (valid * 100) / (100 - p.invalid);
      return (cast * 100) / (100 - p.absent);
    },
    key: 2500,
    wrong: [2375, 2000, 1900],
    explanation: (p) =>
      `The margin is ${p.win}% - ${100 - p.win}% = ${2 * p.win - 100}% of valid votes, which is 1/5, so valid votes = ${p.margin} × 5 = ${p.margin * 5}. Valid votes are ${100 - p.invalid}% of votes cast, so votes cast = ${p.margin * 5} × 20/19 = ${(p.margin * 100) / 19}. Votes cast are ${100 - p.absent}% of members, so members = ${(p.margin * 100) / 19} × 5/4 = ${(p.margin * 125) / 19}.`,
    trap: 'Partial scope trap',
    lessonRef: PERCENT_LESSON,
  }),
  defineQa({
    id: 'QA004',
    topic: 'Percentages',
    subType: 'Comparison chain',
    difficulty: 'Medium',
    expectedSeconds: 110,
    kind: 'mcq',
    params: { kavyaOverImran: 25, imranOverTenzin: 20, gap: 27000 },
    prompt: (p) =>
      `At a Bengaluru startup, Kavya's monthly salary is ${p.kavyaOverImran}% more than Imran's, and Imran's is ${p.imranOverTenzin}% more than Tenzin's. Kavya earns ${inr(p.gap)} a month more than Tenzin. What is Imran's monthly salary?`,
    solve: (p) => {
      const scaled = (100 + p.kavyaOverImran) * (100 + p.imranOverTenzin);
      const tenzin = (p.gap * 10000) / (scaled - 10000);
      return (tenzin * (100 + p.imranOverTenzin)) / 100;
    },
    key: 64800,
    format: inr,
    wrong: [72000, 54000, 81000],
    explanation: (p) =>
      `Call Tenzin's salary T. Imran earns 6/5 of T, and Kavya earns 5/4 of that, which is 3/2 of T. So the gap of ${inr(p.gap)} is T/2, giving T = ${inr(p.gap * 2)}. Imran earns 6/5 × ${p.gap * 2} = ${inr((p.gap * 2 * 6) / 5)}.`,
    trap: 'Base change trap',
    lessonRef: PERCENT_LESSON,
  }),
  defineQa({
    id: 'QA005',
    topic: 'Percentages',
    subType: 'Price and consumption',
    difficulty: 'Medium',
    expectedSeconds: 105,
    kind: 'mcq',
    params: { priceRise: 25, spendRise: 10 },
    prompt: (p) =>
      `The price of cooking oil goes up by ${p.priceRise}%. A Bhopal family is willing to raise its monthly spend on oil by only ${p.spendRise}%. By what percentage must the family cut the quantity of oil it uses?`,
    solve: (p) => 100 - ((100 + p.spendRise) * 100) / (100 + p.priceRise),
    key: 12,
    format: pct,
    wrong: [15, 20, 10],
    explanation: (p) =>
      `Spend is price times quantity, so new quantity = new spend / new price. The new price is 5/4 of the old one and the new spend is 11/10 of the old one. New quantity = 11/10 × 4/5 = 22/25, which is 88% of the old quantity. So the cut is ${100 - ((100 + p.spendRise) * 100) / (100 + p.priceRise)}%, not ${p.priceRise - p.spendRise}%.`,
    trap: 'Base change trap',
    lessonRef: PERCENT_LESSON,
  }),
  defineQa({
    id: 'QA006',
    topic: 'Percentages',
    subType: 'Slab tax',
    difficulty: 'Hard',
    expectedSeconds: 190,
    kind: 'tita',
    params: { free: 300000, band: 300000, lowRate: 5, highRate: 20, incomeRise: 20, taxRise: 60 },
    prompt: (p) =>
      `Under a made-up state tax, the first ${inr(p.free)} of yearly income is tax free, the next ${inr(p.band)} is taxed at ${p.lowRate}%, and all income above ${inr(p.free + p.band)} is taxed at ${p.highRate}%. Lakshmi earned more than ${inr(p.free + p.band)} last year. This year her income rose by ${p.incomeRise}% and her tax rose by ${p.taxRise}%. What was her income last year, in rupees?`,
    solve: (p) => {
      const scaledConstant = p.lowRate * p.band - p.highRate * (p.free + p.band);
      return (p.taxRise * scaledConstant) / (p.highRate * (p.incomeRise - p.taxRise));
    },
    key: 787500,
    commonWrong: [900000, 945000, 52500],
    explanation: (p) => {
      const slabTax = (p.band * p.lowRate) / 100;
      const constant = ((p.free + p.band) * p.highRate) / 100 - slabTax;
      return `Let last year's income be I. Her tax is ${slabTax} + 0.2(I - ${p.free + p.band}), which simplifies to 0.2I - ${constant}. This year her tax is 0.24I - ${constant}. Setting 0.24I - ${constant} = 1.6(0.2I - ${constant}) gives 0.08I = ${0.6 * constant}, so I = ${inr(787500)}.`;
    },
    trap: 'Partial scope trap',
  }),

  // ---- Profit and loss ----
  defineQa({
    id: 'QA007',
    topic: 'Profit and loss',
    subType: 'Markup and discount',
    difficulty: 'Easy',
    expectedSeconds: 70,
    kind: 'mcq',
    params: { cost: 800, markup: 40, discount: 15 },
    prompt: (p) =>
      `A Moradabad brass seller buys a lamp for ${inr(p.cost)}, marks it ${p.markup}% above cost, and then gives a ${p.discount}% discount on the marked price. What is her profit on the lamp?`,
    solve: (p) => (p.cost * (100 + p.markup) * (100 - p.discount)) / 10000 - p.cost,
    key: 152,
    format: inr,
    wrong: [200, 168, 320],
    explanation: (p) => {
      const marked = (p.cost * (100 + p.markup)) / 100;
      const sale = (marked * (100 - p.discount)) / 100;
      return `Marked price = ${p.cost} × 1.4 = ${inr(marked)}. The discount is ${p.discount}% of this, so the selling price is ${inr(sale)}. Profit = ${sale} - ${p.cost} = ${inr(sale - p.cost)}. Subtracting ${p.discount} from ${p.markup} would wrongly treat both percentages as if they had the same base.`;
    },
    trap: 'Base change trap',
  }),
  defineQa({
    id: 'QA008',
    topic: 'Profit and loss',
    subType: 'Faulty weights',
    difficulty: 'Medium',
    expectedSeconds: 110,
    kind: 'tita',
    params: { below: 10, grams: 750 },
    prompt: (p) =>
      `Dhaval, who runs a kirana shop in Rajkot, charges ${p.below}% less than his cost price per kg for rice. His faulty scale, however, hands over only ${p.grams} g whenever it shows 1 kg. What is his actual profit as a percentage of the cost of the rice he hands over? Enter the number only.`,
    solve: (p) => ((100 - p.below) * 1000) / p.grams - 100,
    key: 20,
    commonWrong: [15, 33.33, 25],
    explanation: (p) =>
      `Say rice costs him ₹100 per kg. For every shown kg he collects ₹${100 - p.below}, but he hands over rice that cost him only ₹${p.grams / 10}. Profit = ${100 - p.below - p.grams / 10} on ${p.grams / 10}, which is 1/5 or 20%. The percentage must be taken on ${p.grams / 10}, the actual cost, not on 100.`,
    trap: 'Base change trap',
  }),
  defineQa({
    id: 'QA009',
    topic: 'Profit and loss',
    subType: 'Two items, same selling price',
    difficulty: 'Medium',
    expectedSeconds: 125,
    kind: 'mcq',
    params: { total: 35000, gain: 20, loss: 10 },
    prompt: (p) =>
      `A Nehru Place dealer buys two used laptops for ${inr(p.total)} in all. She sells both at the same price, making a ${p.gain}% profit on the first and a ${p.loss}% loss on the second. What is her overall profit in rupees?`,
    solve: (p) => {
      const first = (p.total * (100 - p.loss)) / (200 + p.gain - p.loss);
      const sale = (first * (100 + p.gain)) / 100;
      return 2 * sale - p.total;
    },
    key: 1000,
    format: inr,
    wrong: [1750, 3000, 2000],
    explanation: (p) => {
      const first = (p.total * (100 - p.loss)) / (200 + p.gain - p.loss);
      const second = p.total - first;
      const sale = (first * (100 + p.gain)) / 100;
      return `Same selling price means 1.2 × first cost = 0.9 × second cost, so the costs are in the ratio 3:4. That makes the costs ${inr(first)} and ${inr(second)}, and each laptop sells for ${inr(sale)}. Total sales are ${inr(2 * sale)}, so the overall profit is ${inr(2 * sale - p.total)}. Averaging ${p.gain}% and -${p.loss}% would only work if the costs were equal.`;
    },
    trap: 'Equal base assumption',
  }),
  defineQa({
    id: 'QA010',
    topic: 'Profit and loss',
    subType: 'Free items offer',
    difficulty: 'Easy',
    expectedSeconds: 85,
    kind: 'mcq',
    params: { cost: 2000, profit: 20, pay: 4, free: 1 },
    prompt: (p) =>
      `A Kanchipuram saree shop runs a "buy ${p.pay}, get ${p.free} free" offer: a customer pays the tag price for ${p.pay} sarees and takes ${p.pay + p.free}. Each saree costs the shop ${inr(p.cost)}. What tag price per saree gives the shop a ${p.profit}% profit on the whole offer?`,
    solve: (p) => ((p.pay + p.free) * p.cost * (100 + p.profit)) / (100 * p.pay),
    key: 3000,
    format: inr,
    wrong: [2400, 2880, 2500],
    explanation: (p) => {
      const bundleCost = (p.pay + p.free) * p.cost;
      const target = (bundleCost * (100 + p.profit)) / 100;
      return `The ${p.pay + p.free} sarees cost ${inr(bundleCost)}, so the shop needs ${inr(target)} for ${p.profit}% profit. That money comes from only ${p.pay} paid sarees. Tag price = ${target} / ${p.pay} = ${inr(target / p.pay)}.`;
    },
    trap: 'Partial scope trap',
  }),
  defineQa({
    id: 'QA011',
    topic: 'Profit and loss',
    subType: 'Two discount scenarios',
    difficulty: 'Hard',
    expectedSeconds: 160,
    kind: 'mcq',
    params: { smallDiscount: 5, bigDiscount: 15, times: 3, gap: 900 },
    prompt: (p) =>
      `A Thrissur jeweller lists a silver anklet set at a fixed price. If she gives a ${p.smallDiscount}% discount on the list price, her profit is ${p.times} times the profit she would make with a ${p.bigDiscount}% discount. These two profits differ by ${inr(p.gap)}. What did the set cost her?`,
    solve: (p) => {
      const list = (p.gap * 100) / (p.bigDiscount - p.smallDiscount);
      return (list * (p.times * (100 - p.bigDiscount) - (100 - p.smallDiscount))) / (100 * (p.times - 1));
    },
    key: 7200,
    format: inr,
    wrong: [9000, 8550, 7650],
    explanation: (p) => {
      const list = (p.gap * 100) / (p.bigDiscount - p.smallDiscount);
      return `The two selling prices differ by ${p.bigDiscount - p.smallDiscount}% of list, and that difference is the gap of ${inr(p.gap)}, so the list price is ${inr(list)}. The selling prices are then ${inr(0.95 * list)} and ${inr(0.85 * list)}. If the smaller profit is P, then 3P - P = ${p.gap}, so P = ${p.gap / 2}. Cost = ${0.85 * list} - ${p.gap / 2} = ${inr(0.85 * list - p.gap / 2)}.`;
    },
    trap: 'Partial scope trap',
  }),

  // ---- Ratio and proportion ----
  defineQa({
    id: 'QA012',
    topic: 'Ratio and proportion',
    subType: 'Partnership',
    difficulty: 'Medium',
    expectedSeconds: 125,
    kind: 'mcq',
    params: { reena: 60000, salim: 90000, joseph: 120000, salimJoin: 4, year: 12, shareOf: 4 },
    prompt: (p) =>
      `Reena starts a Kochi cloud kitchen with ${inr(p.reena)}. Salim joins ${p.salimJoin} months later with ${inr(p.salim)}, and Joseph joins some whole number of months after the start with ${inr(p.joseph)}. Profit at the end of ${p.year} months is shared in proportion to capital multiplied by months invested, and Joseph gets exactly 1/${p.shareOf} of it. How many months after the start did Joseph join?`,
    solve: (p) => {
      const others = p.reena * p.year + p.salim * (p.year - p.salimJoin);
      const josephMonths = others / (p.shareOf - 1) / p.joseph;
      return p.year - josephMonths;
    },
    key: 8,
    format: withUnit('months'),
    wrong: [4, 9, 3],
    explanation: (p) => {
      const r = p.reena * p.year;
      const s = p.salim * (p.year - p.salimJoin);
      const months = (r + s) / (p.shareOf - 1) / p.joseph;
      return `Reena's stake is ${p.reena} × ${p.year} = ${r} and Salim's is ${p.salim} × ${p.year - p.salimJoin} = ${s}. If Joseph has 1/${p.shareOf} of the total, the other two have 3/4, so Joseph's stake is ${r + s} / 3 = ${(r + s) / 3}. That means he stayed ${(r + s) / 3} / ${p.joseph} = ${months} months. He joined ${p.year} - ${months} = ${p.year - months} months after the start.`;
    },
    trap: 'Partial scope trap',
  }),
  defineQa({
    id: 'QA013',
    topic: 'Ratio and proportion',
    subType: 'Changing ratio',
    difficulty: 'Medium',
    expectedSeconds: 100,
    kind: 'mcq',
    params: { cooks: 3, waiters: 5, joined: 6, left: 2, newCooks: 6, newWaiters: 7 },
    prompt: (p) =>
      `At a Goa beach cafe, cooks and waiters are in the ratio ${p.cooks}:${p.waiters}. For the season, ${p.joined} more cooks join and ${p.left} waiters leave, which changes the ratio to ${p.newCooks}:${p.newWaiters}. How many cooks and waiters together were there before the change?`,
    solve: (p) => {
      const k =
        (p.newCooks * p.left + p.newWaiters * p.joined) / (p.newCooks * p.waiters - p.newWaiters * p.cooks);
      return (p.cooks + p.waiters) * k;
    },
    key: 48,
    wrong: [52, 30, 18],
    explanation: (p) => {
      const k =
        (p.newCooks * p.left + p.newWaiters * p.joined) / (p.newCooks * p.waiters - p.newWaiters * p.cooks);
      return `Let the staff be ${p.cooks}k cooks and ${p.waiters}k waiters. Then (${p.cooks}k + ${p.joined}) / (${p.waiters}k - ${p.left}) = ${p.newCooks}/${p.newWaiters}, which gives 21k + 42 = 30k - 12, so k = ${k}. That is ${p.cooks * k} cooks and ${p.waiters * k} waiters, or ${(p.cooks + p.waiters) * k} before the change. The figure after the change would be ${(p.cooks + p.waiters) * k + p.joined - p.left}, which is not what is asked.`;
    },
    trap: 'Partial scope trap',
  }),
  defineQa({
    id: 'QA014',
    topic: 'Ratio and proportion',
    subType: 'Fixed plus variable cost',
    difficulty: 'Medium',
    expectedSeconds: 130,
    kind: 'mcq',
    params: { n1: 40, bill1: 126000, n2: 55, bill2: 162000, n3: 75 },
    prompt: (p) =>
      `A Roorkee hostel's monthly mess bill has a fixed part plus a part that is directly proportional to the number of students eating. The bill is ${inr(p.bill1)} with ${p.n1} students and ${inr(p.bill2)} with ${p.n2} students. If ${p.n3} students eat next month and split the bill equally, how much does each student pay?`,
    solve: (p) => {
      const perHead = (p.bill2 - p.bill1) / (p.n2 - p.n1);
      const fixed = p.bill1 - p.n1 * perHead;
      return (fixed + p.n3 * perHead) / p.n3;
    },
    key: 2800,
    format: inr,
    wrong: [2400, 3150, 2640],
    explanation: (p) => {
      const perHead = (p.bill2 - p.bill1) / (p.n2 - p.n1);
      const fixed = p.bill1 - p.n1 * perHead;
      const total = fixed + p.n3 * perHead;
      return `${p.n2 - p.n1} extra students add ${inr(p.bill2 - p.bill1)}, so the variable part is ${inr(perHead)} per student. The fixed part is ${p.bill1} - ${p.n1} × ${perHead} = ${inr(fixed)}. With ${p.n3} students the bill is ${inr(total)}, so each pays ${inr(total / p.n3)}.`;
    },
    trap: 'Partial scope trap',
  }),
  defineQa({
    id: 'QA015',
    topic: 'Ratio and proportion',
    subType: 'Fraction of the rest',
    difficulty: 'Hard',
    expectedSeconds: 165,
    kind: 'tita',
    params: { aNum: 2, aDen: 5, bNum: 1, bDen: 4, gap: 2100 },
    prompt: (p) =>
      `Three sisters in Shillong share a wedding-gift fund. Daphi gets ${p.aNum}/${p.aDen} of what Ibarisha and Lari get together. Ibarisha gets ${p.bNum}/${p.bDen} of what Daphi and Lari get together. Daphi gets ${inr(p.gap)} more than Ibarisha. How many rupees does Lari get?`,
    solve: (p) => {
      const aParts = p.aNum + p.aDen;
      const bParts = p.bNum + p.bDen;
      const total = (p.gap * aParts * bParts) / (p.aNum * bParts - p.bNum * aParts);
      return total - (total * p.aNum) / aParts - (total * p.bNum) / bParts;
    },
    key: 12600,
    commonWrong: [4900, 24500, 7000],
    explanation: (p) => {
      const aParts = p.aNum + p.aDen;
      const bParts = p.bNum + p.bDen;
      const total = (p.gap * aParts * bParts) / (p.aNum * bParts - p.bNum * aParts);
      const a = (total * p.aNum) / aParts;
      const b = (total * p.bNum) / bParts;
      return `If Daphi gets ${p.aNum}/${p.aDen} of the other two, she holds ${p.aNum} parts out of ${aParts}, which is ${p.aNum}/${aParts} of the whole fund. In the same way Ibarisha holds ${p.bNum}/${bParts} of the fund. The gap is ${p.aNum}/${aParts} - ${p.bNum}/${bParts} = 3/35 of the fund, so the fund is ${inr(total)}. Daphi has ${inr(a)}, Ibarisha ${inr(b)}, and Lari the remaining ${inr(total - a - b)}.`;
    },
    trap: 'Wrong whole trap',
  }),

  // ---- Time and work ----
  defineQa({
    id: 'QA016',
    topic: 'Time and work',
    subType: 'One worker leaves',
    difficulty: 'Easy',
    expectedSeconds: 80,
    kind: 'mcq',
    params: { asha: 20, bilal: 30, together: 8 },
    prompt: (p) =>
      `Tailors Asha and Bilal in Ludhiana take an order of school uniforms. Alone, Asha would need ${p.asha} hours and Bilal ${p.bilal} hours. They work together for ${p.together} hours, then Asha leaves. How many more hours does Bilal need to finish alone?`,
    solve: (p) => (p.asha * p.bilal - p.together * (p.asha + p.bilal)) / p.asha,
    key: 10,
    format: withUnit('hours'),
    wrong: [18, 20, 12],
    explanation: (p) => {
      const units = 60;
      const a = units / p.asha;
      const b = units / p.bilal;
      const left = units - p.together * (a + b);
      return `Take the order as ${units} units, the LCM of ${p.asha} and ${p.bilal}. Asha does ${a} units an hour and Bilal ${b}, so together they do ${p.together} × ${a + b} = ${p.together * (a + b)} units. That leaves ${left} units, and Bilal needs ${left} / ${b} = ${left / b} hours. The question asks for the extra hours, not the total ${p.together + left / b}.`;
    },
    trap: 'Partial scope trap',
    lessonRef: WORK_LESSON,
  }),
  defineQa({
    id: 'QA017',
    topic: 'Time and work',
    subType: 'Workers and days',
    difficulty: 'Easy',
    expectedSeconds: 65,
    kind: 'mcq',
    params: { workers: 24, days: 15, target: 10 },
    prompt: (p) =>
      `A Gurugram site plans to finish a boundary wall with ${p.workers} workers in ${p.days} days. The owner now wants it done in ${p.target} days, starting from day 1, with every worker equally fast. How many extra workers must be hired?`,
    solve: (p) => (p.workers * p.days) / p.target - p.workers,
    key: 12,
    format: withUnit('workers'),
    wrong: [36, 8, 5],
    explanation: (p) => {
      const work = p.workers * p.days;
      return `The wall is ${p.workers} × ${p.days} = ${work} worker-days of work. Finishing in ${p.target} days needs ${work} / ${p.target} = ${work / p.target} workers. That is ${work / p.target - p.workers} more than the ${p.workers} already on the job.`;
    },
    trap: 'Partial scope trap',
    lessonRef: WORK_LESSON,
  }),
  defineQa({
    id: 'QA018',
    topic: 'Time and work',
    subType: 'Pipes and drains',
    difficulty: 'Medium',
    expectedSeconds: 120,
    kind: 'mcq',
    params: { inA: 12, inB: 20, drain: 30, firstPhase: 5, units: 60 },
    prompt: (p) =>
      `Two inlet pipes can fill an Ooty resort's water tank in ${p.inA} hours and ${p.inB} hours respectively. A drain can empty the full tank in ${p.drain} hours. All three are opened together on an empty tank, and after ${p.firstPhase} hours the drain is shut. How many more hours does it take to fill the tank?`,
    solve: (p) => {
      const fill = p.units / p.inA + p.units / p.inB;
      const net = fill - p.units / p.drain;
      return (p.units - net * p.firstPhase) / fill;
    },
    key: 3.75,
    format: withUnit('hours'),
    wrong: [5, 8.75, 6],
    explanation: (p) => {
      const a = p.units / p.inA;
      const b = p.units / p.inB;
      const c = p.units / p.drain;
      const done = (a + b - c) * p.firstPhase;
      return `Take the tank as ${p.units} units. The inlets add ${a} and ${b} units an hour and the drain removes ${c}, a net of ${a + b - c}. In ${p.firstPhase} hours that fills ${done} units, leaving ${p.units - done}. With the drain shut the rate is ${a + b}, so the rest takes ${p.units - done} / ${a + b} = ${(p.units - done) / (a + b)} hours.`;
    },
    trap: 'Partial scope trap',
    lessonRef: WORK_LESSON,
  }),
  defineQa({
    id: 'QA019',
    topic: 'Time and work',
    subType: 'Alternate days',
    difficulty: 'Medium',
    expectedSeconds: 130,
    kind: 'tita',
    params: { harleen: 8, yusuf: 12, units: 24 },
    prompt: (p) =>
      `Two Chandigarh data-entry operators are given a digitisation job. Harleen alone would need ${p.harleen} days and Yusuf alone ${p.yusuf} days. They work on alternate days, one full day each, with Harleen on day 1. How many days does the job take? Count a part of the last day as the fraction of that day actually worked.`,
    solve: (p) => {
      const rates = [p.units / p.harleen, p.units / p.yusuf];
      let left = p.units;
      let day = 0;
      for (;;) {
        const rate = rates[day % 2];
        if (left <= rate) return day + left / rate;
        left -= rate;
        day += 1;
      }
    },
    key: 9.5,
    commonWrong: [10, 9.6, 4.8],
    explanation: (p) => {
      const h = p.units / p.harleen;
      const y = p.units / p.yusuf;
      return `Take the job as ${p.units} units, so Harleen does ${h} a day and Yusuf ${y}. Each 2-day pair does ${h + y} units, and 4 pairs finish ${4 * (h + y)} units in 8 days. Day 9 is Harleen's, which brings it to ${4 * (h + y) + h}. The last unit is Yusuf's on day 10, and it takes him half a day, so the total is 9.5 days.`;
    },
    trap: 'Off-by-one trap',
    lessonRef: WORK_LESSON,
  }),
  defineQa({
    id: 'QA020',
    topic: 'Time and work',
    subType: 'Workers leave before the end',
    difficulty: 'Hard',
    expectedSeconds: 155,
    kind: 'mcq',
    params: { meera: 20, nikhil: 30, om: 60, meeraEarly: 4, nikhilEarly: 6, units: 60 },
    prompt: (p) =>
      `Alone, Meera, Nikhil and Om can finish a mural at a Nashik railway station in ${p.meera}, ${p.nikhil} and ${p.om} days respectively. All three start together. Meera stops ${p.meeraEarly} days before the mural is finished and Nikhil stops ${p.nikhilEarly} days before it is finished, while Om works till the end. How many days does the mural take in all?`,
    solve: (p) => {
      const m = p.units / p.meera;
      const n = p.units / p.nikhil;
      const o = p.units / p.om;
      return (p.units + m * p.meeraEarly + n * p.nikhilEarly) / (m + n + o);
    },
    key: 14,
    format: withUnit('days'),
    wrong: [12, 10, 6],
    explanation: (p) => {
      const m = p.units / p.meera;
      const n = p.units / p.nikhil;
      const o = p.units / p.om;
      const extra = m * p.meeraEarly + n * p.nikhilEarly;
      return `Take the mural as ${p.units} units, so the daily rates are ${m}, ${n} and ${o}. If the job takes T days, then ${m}(T - ${p.meeraEarly}) + ${n}(T - ${p.nikhilEarly}) + ${o}T = ${p.units}. This gives ${m + n + o}T = ${p.units + extra}, so T = ${(p.units + extra) / (m + n + o)} days. Leaving out Nikhil's early exit gives 12, which only covers part of the condition.`;
    },
    trap: 'Partial scope trap',
    lessonRef: WORK_LESSON,
  }),
  defineQa({
    id: 'QA021',
    topic: 'Time and work',
    subType: 'Worker-hours',
    difficulty: 'Hard',
    expectedSeconds: 170,
    kind: 'tita',
    params: { men: 40, hours: 8, planned: 30, elapsed: 10, donePct: 25, newHours: 10 },
    prompt: (p) =>
      `A contractor plans to lay a cable duct for the Lucknow Metro in ${p.planned} days with ${p.men} workers on ${p.hours}-hour shifts. After ${p.elapsed} days, only ${p.donePct}% of the work is done. For the remaining ${p.planned - p.elapsed} days, the contractor extends the shift to ${p.newHours} hours and hires extra workers who are as fast as the others. Every worker does the same amount of work per hour throughout. How many extra workers does he need to finish exactly on time?`,
    solve: (p) => {
      const doneHours = p.men * p.hours * p.elapsed;
      const total = (doneHours * 100) / p.donePct;
      return (total - doneHours) / ((p.planned - p.elapsed) * p.newHours) - p.men;
    },
    key: 8,
    commonWrong: [48, 20, 24],
    explanation: (p) => {
      const doneHours = p.men * p.hours * p.elapsed;
      const total = (doneHours * 100) / p.donePct;
      const left = total - doneHours;
      const needed = left / ((p.planned - p.elapsed) * p.newHours);
      return `So far he has used ${p.men} × ${p.hours} × ${p.elapsed} = ${doneHours} worker-hours for ${p.donePct}% of the job. The whole job is ${total} worker-hours, so ${left} remain. In ${p.planned - p.elapsed} days of ${p.newHours} hours he needs ${left} / ${(p.planned - p.elapsed) * p.newHours} = ${needed} workers. That is ${needed - p.men} more than the ${p.men} he has.`;
    },
    trap: 'Partial scope trap',
    lessonRef: WORK_LESSON,
  }),

  // ---- Time speed distance ----
  defineQa({
    id: 'QA022',
    topic: 'Time speed distance',
    subType: 'Average speed with a halt',
    difficulty: 'Easy',
    expectedSeconds: 80,
    kind: 'mcq',
    params: { distance: 180, out: 30, back: 60, halt: 1 },
    prompt: (p) =>
      `A Kerala State bus runs ${p.distance} km from Kochi to Kozhikode at ${p.out} km/h, halts for ${p.halt} hour at Kozhikode, and returns along the same road at ${p.back} km/h. What is its average speed for the whole round trip, counting the halt?`,
    solve: (p) => (2 * p.distance) / (p.distance / p.out + p.distance / p.back + p.halt),
    key: 36,
    format: withUnit('km/h'),
    wrong: [45, 40, 18],
    explanation: (p) => {
      const a = p.distance / p.out;
      const b = p.distance / p.back;
      return `The trip out takes ${a} hours and the return takes ${b} hours. With the ${p.halt}-hour halt, the total time is ${a + b + p.halt} hours for ${2 * p.distance} km. Average speed = ${2 * p.distance} / ${a + b + p.halt} = ${(2 * p.distance) / (a + b + p.halt)} km/h. Average speed is always total distance over total time, never the mean of the two speeds.`;
    },
    trap: 'Simple mean trap',
  }),
  defineQa({
    id: 'QA023',
    topic: 'Time speed distance',
    subType: 'Trains',
    difficulty: 'Medium',
    expectedSeconds: 100,
    kind: 'mcq',
    params: { pole: 12, platform: 300, cross: 27 },
    prompt: (p) =>
      `A train running at a steady speed passes a signal pole in ${p.pole} seconds. It then takes ${p.cross} seconds to fully cross a ${p.platform} m platform at Itarsi junction. What is its speed?`,
    solve: (p) => (p.platform / (p.cross - p.pole)) * (18 / 5),
    key: 72,
    format: withUnit('km/h'),
    wrong: [20, 40, 90],
    explanation: (p) =>
      `Passing the pole covers the train's own length, and crossing the platform covers its length plus ${p.platform} m. So the extra ${p.cross - p.pole} seconds are spent on the ${p.platform} m alone. Speed = ${p.platform} / ${p.cross - p.pole} = ${p.platform / (p.cross - p.pole)} m/s. Multiply by 18/5 to convert: ${(p.platform / (p.cross - p.pole)) * (18 / 5)} km/h.`,
    trap: 'Unit trap',
  }),
  defineQa({
    id: 'QA024',
    topic: 'Time speed distance',
    subType: 'Boats and streams',
    difficulty: 'Medium',
    expectedSeconds: 130,
    kind: 'tita',
    params: { boat: 10, distance: 24, time: 5 },
    prompt: (p) =>
      `A Varanasi boatman rows at ${p.boat} km/h in still water. He rows ${p.distance} km downstream along the Ganga, turns around at once, and rows back to his starting ghat. The round trip takes ${p.time} hours. What is the speed of the current in km/h?`,
    solve: (p) => Math.sqrt(p.boat * p.boat - (2 * p.distance * p.boat) / p.time),
    key: 2,
    commonWrong: [0.4, 4, 9.6],
    explanation: (p) => {
      const c = Math.sqrt(p.boat * p.boat - (2 * p.distance * p.boat) / p.time);
      return `Let the current be c. Then ${p.distance}/(${p.boat} + c) + ${p.distance}/(${p.boat} - c) = ${p.time}. Adding the fractions gives ${2 * p.distance * p.boat}/(${p.boat * p.boat} - c²) = ${p.time}, so ${p.boat * p.boat} - c² = ${(2 * p.distance * p.boat) / p.time}. That gives c² = ${c * c} and c = ${c} km/h.`;
    },
    trap: 'Average speed trap',
  }),
  defineQa({
    id: 'QA025',
    topic: 'Time speed distance',
    subType: 'Circular track',
    difficulty: 'Medium',
    expectedSeconds: 125,
    kind: 'mcq',
    params: { track: 400, fast: 5, slow: 3 },
    prompt: (p) =>
      `Aarav and Diya start together from the same point on a ${p.track} m circular track at a Patiala stadium and run in opposite directions without stopping, at ${p.fast} m/s and ${p.slow} m/s. If they keep running forever, at how many different points on the track will they meet?`,
    solve: (p) => (p.fast + p.slow) / gcd(p.fast, p.slow),
    key: 8,
    format: withUnit('points'),
    wrong: [2, 15, 5],
    explanation: (p) => {
      const every = p.track / (p.fast + p.slow);
      return `They close a full lap every ${p.track} / ${p.fast + p.slow} = ${every} seconds. In that time Aarav runs ${p.fast * every} m, which is ${p.fast}/${p.fast + p.slow} of a lap. Each meeting is that same step further along, and ${p.fast} and ${p.fast + p.slow} have no common factor, so ${(p.fast + p.slow) / gcd(p.fast, p.slow)} different points appear before they repeat. The answer ${p.fast - p.slow} applies to runners going the same way.`;
    },
    trap: 'Direction trap',
  }),
  defineQa({
    id: 'QA026',
    topic: 'Time speed distance',
    subType: 'Second meeting',
    difficulty: 'Hard',
    expectedSeconds: 175,
    kind: 'tita',
    params: { road: 60, first: 24 },
    prompt: (p) =>
      `Anil and Bashir, two cycle couriers, start at the same moment from opposite ends of a straight ${p.road} km road, Anil from Rampur and Bashir from Sonpur. Each rides at his own constant speed and turns back instantly on reaching the far end. They first meet ${p.first} km from Rampur. How far from Rampur, in km, do they meet the second time?`,
    solve: (p) => 2 * p.road - 3 * p.first,
    key: 48,
    commonWrong: [12, 72, 36],
    explanation: (p) =>
      `By the first meeting, the two have together covered one road length, and Anil has done ${p.first} km of it. By the second meeting they have together covered three road lengths, so Anil has ridden 3 × ${p.first} = ${3 * p.first} km. That takes him to Sonpur and ${3 * p.first - p.road} km back. So he is ${p.road} - ${3 * p.first - p.road} = ${2 * p.road - 3 * p.first} km from Rampur.`,
    trap: 'Reference point trap',
  }),

  // ---- Simple and compound interest ----
  defineQa({
    id: 'QA027',
    topic: 'Simple and compound interest',
    subType: 'CI minus SI',
    difficulty: 'Easy',
    expectedSeconds: 70,
    kind: 'mcq',
    params: { principal: 40000, rate: 10 },
    prompt: (p) =>
      `Sunita keeps ${inr(p.principal)} in a deposit at ${p.rate}% a year for 2 years. Her neighbour keeps the same amount for the same time at the same rate. Sunita's interest is compounded yearly and her neighbour's is simple interest. How much more interest does Sunita earn?`,
    solve: (p) => (p.principal * p.rate * p.rate) / 10000,
    key: 400,
    format: inr,
    wrong: [800, 4000, 8400],
    explanation: (p) => {
      const yearly = (p.principal * p.rate) / 100;
      return `Simple interest is ${inr(yearly)} a year, so ${inr(2 * yearly)} in all. With compounding, year 2 also earns ${p.rate}% on year 1's ${inr(yearly)} of interest. That extra is ${inr((yearly * p.rate) / 100)}, and it is the whole difference.`;
    },
    trap: 'Calculation slip',
  }),
  defineQa({
    id: 'QA028',
    topic: 'Simple and compound interest',
    subType: 'Growth multiples',
    difficulty: 'Medium',
    expectedSeconds: 100,
    kind: 'tita',
    params: { big: 8, years: 9, small: 4 },
    prompt: (p) =>
      `A sum placed in a Mangaluru cooperative deposit grows to ${p.big} times itself in ${p.years} years at a fixed compound rate. In how many years, at the same rate, does the sum grow to ${p.small} times itself?`,
    solve: (p) => (p.years * Math.log2(p.small)) / Math.log2(p.big),
    key: 6,
    commonWrong: [4.5, 3, 2.25],
    explanation: (p) =>
      `Under compounding, multiples work by powers. ${p.big} is 2 × 2 × 2, so the sum doubles every ${p.years / 3} years. ${p.small} is 2 × 2, which is two doublings, or ${(p.years * 2) / 3} years. Scaling ${p.years} years by ${p.small}/${p.big} would be treating the growth as if it were simple interest.`,
    trap: 'Linear growth trap',
  }),
  defineQa({
    id: 'QA029',
    topic: 'Simple and compound interest',
    subType: 'Equal instalments',
    difficulty: 'Hard',
    expectedSeconds: 180,
    kind: 'mcq',
    params: { loan: 33100, rate: 10 },
    prompt: (p) =>
      `Deepak, a Sangli farmer, borrows ${inr(p.loan)} for a tractor at ${p.rate}% a year compounded yearly. He repays in three equal instalments, at the end of year 1, year 2 and year 3, and this clears the loan exactly. How much is each instalment?`,
    solve: (p) => {
      const g = 100 + p.rate;
      return (p.loan * g * g * g) / (100 * (g * g + 100 * g + 10000));
    },
    key: 13310,
    format: inr,
    wrong: [12100, 10000, 14641],
    explanation: (p) => {
      const g = 100 + p.rate;
      const x = (p.loan * g * g * g) / (100 * (g * g + 100 * g + 10000));
      const afterOne = (p.loan * g) / 100 - x;
      const afterTwo = (afterOne * g) / 100 - x;
      return `Grow everything to the end of year 3: the loan becomes ${p.loan} × 1.331, and the instalments become 1.21x, 1.1x and x. So 3.31x = ${p.loan} × 1.331, which gives x = ${inr(x)}. To check, the balance is ${inr(afterOne)} after year 1 and ${inr(afterTwo)} after year 2. With ${p.rate}% added, that last balance is ${inr((afterTwo * g) / 100)}, exactly one instalment.`;
    },
    trap: 'Timing trap',
  }),

  // ---- Averages ----
  defineQa({
    id: 'QA030',
    topic: 'Averages',
    subType: 'Replacement',
    difficulty: 'Easy',
    expectedSeconds: 65,
    kind: 'tita',
    params: { crew: 8, rise: 1.5, replaced: 58 },
    prompt: (p) =>
      `The average weight of the ${p.crew} rowers in an Alappuzha snake-boat crew goes up by ${p.rise} kg when a rower weighing ${p.replaced} kg is replaced by a new rower. What is the new rower's weight in kg?`,
    solve: (p) => p.replaced + p.crew * p.rise,
    key: 70,
    commonWrong: [59.5, 46, 68.5],
    explanation: (p) =>
      `The total weight of the crew goes up by ${p.crew} × ${p.rise} = ${p.crew * p.rise} kg. All of that increase comes from the swap, so the new rower is ${p.crew * p.rise} kg heavier than the old one. That makes him ${p.replaced} + ${p.crew * p.rise} = ${p.replaced + p.crew * p.rise} kg.`,
    trap: 'Partial scope trap',
  }),
  defineQa({
    id: 'QA031',
    topic: 'Averages',
    subType: 'Correcting errors',
    difficulty: 'Medium',
    expectedSeconds: 105,
    kind: 'mcq',
    params: { n: 50, avg: 62, trueA: 84, readA: 48, trueB: 35, readB: 53 },
    prompt: (p) =>
      `A Hyderabad teacher finds the average of ${p.n} students' test marks to be ${p.avg}. She later notices two entry errors: a score of ${p.trueA} was entered as ${p.readA}, and a score of ${p.trueB} was entered as ${p.readB}. What is the correct average?`,
    solve: (p) => (p.n * p.avg + (p.trueA - p.readA) + (p.trueB - p.readB)) / p.n,
    key: 62.36,
    wrong: [63.08, 62.72, 61.64],
    explanation: (p) => {
      const up = p.trueA - p.readA;
      const down = p.readB - p.trueB;
      const fixed = p.n * p.avg + up - down;
      return `The recorded total is ${p.n} × ${p.avg} = ${p.n * p.avg}. The first fix adds ${up} marks and the second removes ${down}, a net change of +${up - down}. The correct total is ${fixed}, so the average is ${fixed} / ${p.n} = ${fixed / p.n}.`;
    },
    trap: 'Sign slip',
  }),
  defineQa({
    id: 'QA032',
    topic: 'Averages',
    subType: 'Transfer between groups',
    difficulty: 'Medium',
    expectedSeconds: 145,
    kind: 'mcq',
    params: { nA: 21, avgA: 80, nB: 9, avgB: 50, rise: 0.5 },
    prompt: (p) =>
      `Section A of a Kolkata school has ${p.nA} students with an average of ${p.avgA} marks, and Section B has ${p.nB} students with an average of ${p.avgB} marks. One student moves from A to B, and that score moves too. Section A's average goes up by ${p.rise} marks. What is Section B's new average?`,
    solve: (p) => {
      const moved = p.nA * p.avgA - (p.nA - 1) * (p.avgA + p.rise);
      return (p.nB * p.avgB + moved) / (p.nB + 1);
    },
    key: 52,
    format: withUnit('marks'),
    wrong: [54, 70, 51.95],
    explanation: (p) => {
      const totalA = p.nA * p.avgA;
      const newA = (p.nA - 1) * (p.avgA + p.rise);
      const moved = totalA - newA;
      const totalB = p.nB * p.avgB + moved;
      return `Section A's total was ${totalA}. After the move it has ${p.nA - 1} students averaging ${p.avgA + p.rise}, a total of ${newA}, so the student scored ${moved}. Section B's total becomes ${p.nB * p.avgB} + ${moved} = ${totalB}. With ${p.nB + 1} students, the new average is ${totalB / (p.nB + 1)} marks. Section A's average can rise only if the student scored below it, so ${p.avgA} + ${(p.nA - 1) * p.rise} = ${p.avgA + (p.nA - 1) * p.rise} cannot be his score.`;
    },
    trap: 'Sign slip',
  }),

  // ---- Mixtures and alligation ----
  defineQa({
    id: 'QA033',
    topic: 'Mixtures and alligation',
    subType: 'Alligation',
    difficulty: 'Easy',
    expectedSeconds: 75,
    kind: 'mcq',
    params: { dear: 420, cheap: 300, blend: 340, cheapKg: 60 },
    prompt: (p) =>
      `A Darjeeling tea blender wants a blend worth ${inr(p.blend)} per kg. She has ${p.cheapKg} kg of tea worth ${inr(p.cheap)} per kg and will add tea worth ${inr(p.dear)} per kg. How many kg of the costlier tea must she add?`,
    solve: (p) => (p.cheapKg * (p.blend - p.cheap)) / (p.dear - p.blend),
    key: 30,
    format: withUnit('kg'),
    wrong: [120, 40, 80],
    explanation: (p) =>
      `The cheap tea is ${inr(p.blend - p.cheap)} below the blend and the dear tea is ${inr(p.dear - p.blend)} above it. Quantities go opposite to these gaps, so dear : cheap = ${p.blend - p.cheap} : ${p.dear - p.blend} = 1 : 2. With ${p.cheapKg} kg of cheap tea, she needs ${(p.cheapKg * (p.blend - p.cheap)) / (p.dear - p.blend)} kg of dear tea.`,
    trap: 'Flipped ratio trap',
  }),
  defineQa({
    id: 'QA034',
    topic: 'Mixtures and alligation',
    subType: 'Repeated replacement',
    difficulty: 'Medium',
    expectedSeconds: 110,
    kind: 'tita',
    params: { can: 40, drawn: 8 },
    prompt: (p) =>
      `An Anand dairy can holds ${p.can} litres of pure milk. A worker draws out ${p.drawn} litres and refills the can with water, then mixes it well. The worker then draws out ${p.drawn} litres of the mixture and again refills with water. How many litres of milk are in the can now?`,
    solve: (p) => (p.can * (p.can - p.drawn) * (p.can - p.drawn)) / (p.can * p.can),
    key: 25.6,
    commonWrong: [24, 32, 14.4],
    explanation: (p) => {
      const first = p.can - p.drawn;
      const milk = (first * (p.can - p.drawn)) / p.can;
      return `Each round keeps ${p.can - p.drawn}/${p.can} = 4/5 of the milk in the can. After round 1 there are ${first} litres of milk. After round 2 there are ${first} × 4/5 = ${milk} litres. The second draw removes mixture, not pure milk, so you cannot just subtract ${2 * p.drawn} litres.`;
    },
    trap: 'Linear removal trap',
  }),
  defineQa({
    id: 'QA035',
    topic: 'Mixtures and alligation',
    subType: 'Evaporation and adding syrup',
    difficulty: 'Medium',
    expectedSeconds: 145,
    kind: 'mcq',
    params: { juice: 120, sugarPct: 15, syrup: 30, syrupPct: 40, finalPct: 25 },
    prompt: (p) =>
      `A Mandya jaggery unit has ${p.juice} litres of cane juice that is ${p.sugarPct}% sugar by volume. It boils off some water, losing no sugar, and then adds ${p.syrup} litres of syrup that is ${p.syrupPct}% sugar by volume. The final mix is ${p.finalPct}% sugar by volume. How many litres of water were boiled off?`,
    solve: (p) => {
      const sugar = (p.juice * p.sugarPct) / 100 + (p.syrup * p.syrupPct) / 100;
      const finalVolume = (sugar * 100) / p.finalPct;
      return p.juice + p.syrup - finalVolume;
    },
    key: 30,
    format: withUnit('litres'),
    wrong: [90, 48, 78],
    explanation: (p) => {
      const a = (p.juice * p.sugarPct) / 100;
      const b = (p.syrup * p.syrupPct) / 100;
      const finalVolume = ((a + b) * 100) / p.finalPct;
      return `The juice has ${a} litres of sugar and the syrup adds ${b}, so the final mix has ${a + b} litres of sugar. At ${p.finalPct}%, that means a final volume of ${finalVolume} litres. Without any boiling the volume would be ${p.juice} + ${p.syrup} = ${p.juice + p.syrup} litres. So ${p.juice + p.syrup - finalVolume} litres of water were boiled off.`;
    },
    trap: 'Partial scope trap',
  }),
];
