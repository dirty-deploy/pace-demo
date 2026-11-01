// Sample community answers shown beside the official explanation in the review page (V2_SPEC 4.6, item 4).
// All of this is sample data: the authors are fictional labels, and the upvotes and dates are illustrative.
// The UI carries the "Sample data" tag on this block. Checked by tests/community.test.ts.

export type SampleAnswer = { id: string; author: string; text: string; upvotes: number; daysAgo: number };

export const COMMUNITY_ANSWERS: Record<string, SampleAnswer[]> = {
  // ---- QA ----
  QA001: [
    { id: 'QA001-c1', author: 'Sample alum, 97.4 %ile', text: 'Net change shortcut: a + b + ab/100. Here 20 - 25 + (20 × -25)/100 = -5 - 5 = -10%, so the cake ends at 480 × 0.9 = ₹432. It works for any two successive changes.', upvotes: 169, daysAgo: 6 },
    { id: 'QA001-c2', author: 'Sample student', text: "Order doesn't matter when both changes are multipliers. I did the cut first because 3/4 of 480 is a clean 360, and then 360 × 6/5 = 432.", upvotes: 79, daysAgo: 32 },
    { id: 'QA001-c3', author: 'Sample alum, 97.8 %ile', text: 'Quick sanity check in rupees: the rise adds ₹96 and takes the price to ₹576, but the cut removes 25% of 576, which is ₹144. The cut is bigger than the rise, so you end ₹48 below where you started.', upvotes: 107, daysAgo: 26 },
  ],
  QA002: [
    { id: 'QA002-c1', author: 'Sample alum, 98.1 %ile', text: 'A rise of 1/8 on the old wage is 1/9 of the new wage. So the raise is 27000 / 9 = ₹3,000 directly, and you never need the old wage. In general, a rise of 1/n is 1/(n + 1) of the new figure.', upvotes: 133, daysAgo: 35 },
    { id: 'QA002-c2', author: 'Sample student', text: 'Check ₹3,375 by working forward. It would make the old wage 23,625, and 12.5% of that is about 2,953, not 3,375. With ₹3,000 the old wage is 24,000, and 1/8 of it is exactly 3,000.', upvotes: 174, daysAgo: 49 },
  ],
  QA003: [
    { id: 'QA003-c1', author: 'Sample alum, 98.3 %ile', text: 'One line does it. Valid votes are 0.8 × 0.95 = 0.76 of members, and the margin is 0.2 of that, so 0.152 of members = 380. That gives 380 / 0.152 = 2500.', upvotes: 133, daysAgo: 44 },
    { id: 'QA003-c2', author: 'Sample student', text: 'Common mistake: skipping a layer. 2375 is 1900 / 0.8, which ignores the invalid votes. 1900 and 2000 in the options are the valid votes and the votes cast, so check which stage you stopped at.', upvotes: 91, daysAgo: 49 },
    { id: 'QA003-c3', author: 'Sample alum, 98.7 %ile', text: 'The round options suggest working forward. 2500 members, 2000 voted, 1900 valid, margin 380. Every percentage comes out clean, which is a good sign.', upvotes: 157, daysAgo: 26 },
  ],
  QA004: [
    { id: 'QA004-c1', author: 'Sample alum, 98.9 %ile', text: 'Take Tenzin as 100. Imran is 120 and Kavya is 150, so the gap of 50 units is ₹27,000 and one unit is ₹540. Imran is 120 × 540 = ₹64,800.', upvotes: 10, daysAgo: 55 },
    { id: 'QA004-c2', author: 'Sample student', text: 'Common mistake: the ₹72,000 option comes from adding 25% and 20% to get 45%. Then 27,000 / 0.45 makes Tenzin ₹60,000 and Imran ₹72,000. Chained percentages multiply, 1.25 × 1.2 = 1.5, so the true gap is 50%.', upvotes: 57, daysAgo: 50 },
  ],
  QA005: [
    { id: 'QA005-c1', author: 'Sample student', text: 'Assume numbers: ₹100 a litre and 10 litres is ₹1,000. The new price is ₹125 and the budget is ₹1,100, so the family buys 8.8 litres. That is 1.2 litres less out of 10, or 12%.', upvotes: 129, daysAgo: 57 },
    { id: 'QA005-c2', author: 'Sample alum, 99.1 %ile', text: 'Shortcut for this type: cut needed = (price rise - spend rise) / (100 + price rise). Here (25 - 10) / 125 = 15/125 = 12%. The 125 in the bottom is why plain 15% is wrong.', upvotes: 2, daysAgo: 57 },
  ],
  QA006: [
    { id: 'QA006-c1', author: 'Sample student', text: 'Above ₹6,00,000 the tax is 0.2I - 1,05,000, which is the same as 20% of (I - 5,25,000). So treat it as a flat 20% above 5,25,000. Then 1.2I - 5,25,000 = 1.6(I - 5,25,000), which gives 0.4I = 3,15,000 and I = ₹7,87,500.', upvotes: 40, daysAgo: 19 },
    { id: 'QA006-c2', author: 'Sample alum, 99.2 %ile', text: "Always check slab answers. Last year's tax is 15,000 + 20% of 1,87,500 = ₹52,500. This year's income is ₹9,45,000 and the tax is 15,000 + 20% of 3,45,000 = ₹84,000, which is exactly 1.6 times.", upvotes: 109, daysAgo: 2 },
    { id: 'QA006-c3', author: 'Sample alum, 99.4 %ile', text: "Common mistake: entering 945000, which is this year's income, or 52500, which is last year's tax. The question wants last year's income, so read it again before you type.", upvotes: 3, daysAgo: 33 },
  ],
  QA010: [
    { id: 'QA010-c1', author: 'Sample alum, 99.6 %ile', text: 'Think of the offer as a discount: the customer gets 5 for the price of 4, so the real selling price is 4/5 of the tag. The shop needs ₹2,400 per saree on average. Tag = 2,400 × 5/4 = ₹3,000.', upvotes: 71, daysAgo: 38 },
    { id: 'QA010-c2', author: 'Sample student', text: 'Common mistake: stopping at ₹2,400. Try it: 4 paid sarees bring in ₹9,600 while 5 sarees cost ₹10,000, so that tag is a loss, not a 20% profit.', upvotes: 131, daysAgo: 60 },
  ],
  QA011: [
    { id: 'QA011-c1', author: 'Sample alum, 99.7 %ile', text: 'Work in percentages of the list price. If cost is c%, then 95 - c = 3(85 - c), so 2c = 160 and c = 80. Cost is 80% of list, and since 10% of list is ₹900, cost is ₹7,200.', upvotes: 85, daysAgo: 27 },
    { id: 'QA011-c2', author: 'Sample student', text: 'You can pick this from the options. Both discounts give a profit, so the cost has to be below ₹7,650, the lower selling price. Marking ₹9,000 is a mistake, because that is the list price, and ₹7,200 is the only option under ₹7,650.', upvotes: 161, daysAgo: 46 },
  ],
  QA012: [
    { id: 'QA012-c1', author: 'Sample alum, 99.9 %ile', text: "I scale the money down first. Capitals of 60k, 90k and 1.2 lakh become 2, 3 and 4, so the stakes are 24, 24 and 4m, where m is Joseph's months. Joseph has 1/4 of the total when 4m = (48 + 4m)/4, which gives m = 4. The join month is then 12 - 4 = 8.", upvotes: 34, daysAgo: 17 },
    { id: 'QA012-c2', author: 'Sample alum, 98 %ile', text: "Common mistake: ticking 4 months. That is how long Joseph's money was in, and the question asks when Joseph joined, which is 8. I label the two numbers separately now.", upvotes: 2, daysAgo: 20 },
    { id: 'QA012-c3', author: 'Sample student', text: 'Check at the end: stakes of ₹7.2 lakh, ₹7.2 lakh and ₹4.8 lakh are in the ratio 3:3:2, and 2 parts out of 8 is 1/4.', upvotes: 30, daysAgo: 22 },
  ],
  QA013: [
    { id: 'QA013-c1', author: 'Sample student', text: 'The total before the change must be a multiple of 3 + 5 = 8. Among the options only 48 is, so you are done without any algebra.', upvotes: 27, daysAgo: 47 },
    { id: 'QA013-c2', author: 'Sample alum, 99 %ile', text: 'Another route: the net staff change is +6 - 2 = +4, and the total after must be a multiple of 13. So I looked for a multiple of 8 that becomes a multiple of 13 when 4 is added: 48 becomes 52. Then 18 + 6 = 24 and 30 - 2 = 28, and 24:28 is 6:7.', upvotes: 179, daysAgo: 37 },
  ],
  QA014: [
    { id: 'QA014-c1', author: 'Sample alum, 97.4 %ile', text: "You don't need the fixed part at all. From 55 to 75 students is 20 more at ₹2,400 each, so the bill is 1,62,000 + 48,000 = ₹2,10,000. Divide by 75 to get ₹2,800.", upvotes: 44, daysAgo: 40 },
    { id: 'QA014-c2', author: 'Sample alum, 97.8 %ile', text: "Range check: each student's share is ₹2,400 plus a slice of the fixed part, so it must be above ₹2,400. The share also falls as more people eat, and at 55 students it is about ₹2,945. So ₹3,150, the 40-student figure, and ₹2,400 are both out.", upvotes: 77, daysAgo: 56 },
  ],
  QA015: [
    { id: 'QA015-c1', author: 'Sample student', text: 'Use 35 units for the fund, since 7 and 5 both divide it. Daphi has 10, Ibarisha 7 and Lari 18. The gap of 3 units is ₹2,100, so a unit is ₹700 and Lari gets 18 × 700 = ₹12,600.', upvotes: 40, daysAgo: 49 },
    { id: 'QA015-c2', author: 'Sample alum, 98.1 %ile', text: 'Common mistake: reading 2/5 and 1/4 as shares of the whole fund. They are shares of what the other two get. The wrong reading makes the fund ₹14,000 and Lari ₹4,900, which looks believable but fails when you put it back in.', upvotes: 2, daysAgo: 51 },
  ],
  QA019: [
    { id: 'QA019-c1', author: 'Sample alum, 98.3 %ile', text: "Check by counting each person's days. Harleen works days 1, 3, 5, 7 and 9, so 5 days or 15 units. Yusuf works days 2, 4, 6 and 8 plus half of day 10, so 4.5 days or 9 units. 15 + 9 = 24, the full job.", upvotes: 41, daysAgo: 58 },
    { id: 'QA019-c2', author: 'Sample alum, 98.7 %ile', text: "Common mistake: doubling the together time. Together they need 4.8 days, and twice that is 9.6, which feels right for alternate days. It fails because the pattern doesn't end on a clean pair, and the faster worker gets the extra full day.", upvotes: 8, daysAgo: 51 },
  ],
  QA020: [
    { id: 'QA020-c1', author: 'Sample student', text: 'Imagine nobody leaves. Meher would add 3 × 4 = 12 units and Nikhil 2 × 6 = 12 units, so the team would do 60 + 24 = 84 units. At 6 units a day that is 14 days.', upvotes: 57, daysAgo: 20 },
    { id: 'QA020-c2', author: 'Sample alum, 98.9 %ile', text: 'Timeline check: Nikhil leaves after day 8 and Meher after day 10. Days 1 to 8 give 48 units, days 9 and 10 give 8 at 4 a day, and days 11 to 14 give 4 with Om alone. That adds up to 60.', upvotes: 133, daysAgo: 18 },
  ],
  QA021: [
    { id: 'QA021-c1', author: 'Sample student', text: 'Use pace instead of worker-hours. In 10 days the crew did 25%, so the remaining 75% is 3 times that work, and at the old pace it would take 30 days. There are only 20, so daily output must go up 1.5 times. That is 40 × 8 × 1.5 = 480 worker-hours a day, or 48 workers on 10-hour shifts.', upvotes: 6, daysAgo: 60 },
    { id: 'QA021-c2', author: 'Sample alum, 99.1 %ile', text: 'Two mistakes to avoid. Writing 48 gives the total crew, and the question asks for the extra workers. Writing 20 means you forgot that the shift went up from 8 to 10 hours.', upvotes: 149, daysAgo: 36 },
  ],
  QA022: [
    { id: 'QA022-c1', author: 'Sample alum, 99.2 %ile', text: 'Without the halt the answer is the harmonic mean of 30 and 60: 2 × 30 × 60 / 90 = 40 km/h. A halt only adds time, so the true figure must be below 40. 18 would mean 20 hours in all, far too long when the moving time is 9 hours, so 36 is the one that fits.', upvotes: 144, daysAgo: 40 },
    { id: 'QA022-c2', author: 'Sample alum, 99.4 %ile', text: "Easy slip: forgetting the halt. 360 / 9 gives 40, and that option is there for anyone who does this. Read 'counting the halt' twice.", upvotes: 159, daysAgo: 17 },
  ],
  QA023: [
    { id: 'QA023-c1', author: 'Sample alum, 99.6 %ile', text: 'You can also use a ratio of times. Length L takes 12 seconds and L + 300 takes 27, so L/(L + 300) = 12/27 = 4/9. That gives L = 240 m, and 240 / 12 = 20 m/s.', upvotes: 157, daysAgo: 38 },
    { id: 'QA023-c2', author: 'Sample alum, 99.7 %ile', text: 'Fast conversion: 10 m/s is 36 km/h, so 20 m/s is 72 km/h. The 20 km/h option is the m/s figure with the wrong unit on it, which is the slip to avoid.', upvotes: 100, daysAgo: 59 },
  ],
  QA024: [
    { id: 'QA024-c1', author: 'Sample alum, 99.9 %ile', text: 'Since 24 km divides nicely, try a current that makes both speeds factors of 24. With c = 2 the speeds are 12 and 8, so the times are 2 + 3 = 5 hours. Done without touching the quadratic.', upvotes: 179, daysAgo: 12 },
    { id: 'QA024-c2', author: 'Sample student', text: 'Round-trip average speed is 48/5 = 9.6 km/h, and for a boat it also equals (u² - c²)/u. So 9.6 = (100 - c²)/10, which gives c² = 4. Common mistake: entering 9.6, or taking 10 - 9.6 = 0.4 as the current.', upvotes: 164, daysAgo: 13 },
    { id: 'QA024-c3', author: 'Sample alum, 98 %ile', text: 'Watch the last step. 100 - c² = 96 gives c² = 4, and entering 4 is a mistake. The current is the root, 2 km/h.', upvotes: 30, daysAgo: 35 },
  ],
  QA025: [
    { id: 'QA025-c1', author: 'Sample alum, 99 %ile', text: 'Rule for a circular track: reduce the speed ratio to lowest terms a:b. Opposite directions give a + b meeting points, and the same direction gives a - b. Here 5:3 gives 8.', upvotes: 26, daysAgo: 44 },
    { id: 'QA025-c2', author: 'Sample alum, 97.4 %ile', text: 'Check with laps. After 400 seconds Aarav has done 5 laps and Diya 3, so both are back at the start together for the first time. They meet every 50 seconds, which makes 8 meetings in that cycle, all at different points.', upvotes: 161, daysAgo: 17 },
    { id: 'QA025-c3', author: 'Sample alum, 97.8 %ile', text: 'Common mistake: forgetting to reduce the ratio. With speeds of 6 and 4 m/s the ratio is 3:2, so that would be 5 points, not 10.', upvotes: 6, daysAgo: 58 },
  ],
  QA026: [
    { id: 'QA026-c1', author: 'Sample alum, 98.1 %ile', text: "Check using the other rider. Anil does 24 km while Bashir does 36, so the speeds are 2:3. When they have covered 180 km together, Anil has 72 and Bashir 108. Bashir's 108 is 60 to Rampur and 48 back, which gives the same point.", upvotes: 69, daysAgo: 47 },
    { id: 'QA026-c2', author: 'Sample student', text: "The 'three times the first distance' rule needs a head-on second meeting. That holds only when the faster rider is less than 2 times as fast as the slower one, or else the slower one gets caught from behind before reaching the far end. Here 36:24 is 1.5, so it is safe.", upvotes: 153, daysAgo: 48 },
    { id: 'QA026-c3', author: 'Sample alum, 98.3 %ile', text: 'Common mistake: entering 12. That is the distance from Sonpur, and the question asks from Rampur. Entering 72 is the other slip, since that is how far Anil rode, not where Anil is.', upvotes: 62, daysAgo: 56 },
  ],
  QA027: [
    { id: 'QA027-c1', author: 'Sample student', text: 'For 2 years, CI - SI = P × (r/100)². So 40,000 × 1/100 = ₹400. One line, and no need to work out either interest.', upvotes: 29, daysAgo: 2 },
    { id: 'QA027-c2', author: 'Sample alum, 98.7 %ile', text: "₹8,400 in the options is Sunita's total compound interest, and ₹4,000 is one year's simple interest. Doubling ₹400 to ₹800 is a mistake too: interest on interest shows up only in year 2, so it happens once.", upvotes: 180, daysAgo: 46 },
  ],
  QA028: [
    { id: 'QA028-c1', author: 'Sample student', text: 'Think in exponents. 8 = 2³ took 9 years, so each power of 2 takes 3 years, and 4 = 2² takes 2 × 3 = 6 years. The rate itself never matters.', upvotes: 26, daysAgo: 45 },
    { id: 'QA028-c2', author: 'Sample alum, 98.9 %ile', text: 'Rough check: 1.26 cubed is about 2, so the rate is near 26% a year. The rule of 72 then gives 72/26, close to 3 years to double. That matches, so 6 years to reach 4 times feels right.', upvotes: 45, daysAgo: 15 },
  ],
  QA030: [
    { id: 'QA030-c1', author: 'Sample alum, 99.1 %ile', text: 'Assume the whole crew weighed 58 kg each, so the average is 58. The new average is 59.5, a total of 476. The seven who stay still total 406, so the new rower is 476 - 406 = 70 kg.', upvotes: 37, daysAgo: 30 },
    { id: 'QA030-c2', author: 'Sample alum, 99.2 %ile', text: 'Common mistake: writing 59.5 by adding 1.5 once. The 1.5 is per person, so the new rower has to bring 8 lots of it. And 46 fails the direction check, since the average went up and the new rower must be heavier than 58.', upvotes: 123, daysAgo: 39 },
  ],
  QA031: [
    { id: 'QA031-c1', author: 'Sample alum, 99.4 %ile', text: 'No need for the total. The net correction is 36 - 18 = 18 marks across 50 students, so the average moves by 18/50 = 0.36. That gives 62.36.', upvotes: 105, daysAgo: 23 },
    { id: 'QA031-c2', author: 'Sample alum, 99.6 %ile', text: 'Each wrong option here is one specific mistake. 63.08 treats both errors as additions, using 54/50. 62.72 fixes only the first entry. 61.64 moves the right amount in the wrong direction.', upvotes: 5, daysAgo: 40 },
  ],
  QA032: [
    { id: 'QA032-c1', author: 'Sample student', text: 'You can skip the totals. The 20 students who stay gain 0.5 each, which is 10 marks in all. So the student who left was 10 below the old average of 80, which means 70 marks.', upvotes: 13, daysAgo: 28 },
    { id: 'QA032-c2', author: 'Sample alum, 99.7 %ile', text: "Same idea for Section B. The newcomer scored 20 above B's average of 50, and that 20 is shared among 10 students, so the average rises by 2 to 52.", upvotes: 12, daysAgo: 60 },
  ],
  QA033: [
    { id: 'QA033-c1', author: 'Sample alum, 99.9 %ile', text: 'Balance method: the cheap tea is ₹40 short per kg across 60 kg, a shortfall of ₹2,400. Each kg of dear tea is ₹80 over, so 2,400 / 80 = 30 kg.', upvotes: 122, daysAgo: 41 },
    { id: 'QA033-c2', author: 'Sample student', text: 'Check the final average: (60 × 300 + 30 × 420) / 90 = 30,600 / 90 = ₹340. Common mistake: flipping the ratio. That gives 120 kg, and the blend would come out at ₹380.', upvotes: 106, daysAgo: 9 },
  ],
  QA034: [
    { id: 'QA034-c1', author: 'Sample student', text: 'Direct formula for repeated replacement: milk left = 40 × (1 - 8/40)² = 40 × 16/25 = 25.6. With more rounds you only change the power.', upvotes: 23, daysAgo: 20 },
    { id: 'QA034-c2', author: 'Sample alum, 98 %ile', text: 'Check from the water side: after round 1 there are 8 litres of water, and round 2 removes 1/5 of it and adds 8 more, making 14.4. Then 40 - 14.4 = 25.6. Entering 14.4 by itself is a mistake, because that is the water.', upvotes: 27, daysAgo: 19 },
  ],
  QA036: [
    { id: 'QA036-c1', author: 'Sample alum, 99 %ile', text: 'Options work well here. Try ₹42: 2 notebooks cost 84, so 3 pens cost 54 and a pen is 18. The second bill then reads 36 + 126 = 162, which matches.', upvotes: 14, daysAgo: 50 },
    { id: 'QA036-c2', author: 'Sample alum, 97.4 %ile', text: "Before solving anything: the bill with more notebooks is higher, so a notebook costs more than a pen. If your two answers are 18 and 42, the notebook has to be the 42. Marking 18 is a mistake, since that is the pen's price.", upvotes: 169, daysAgo: 7 },
    { id: 'QA036-c3', author: 'Sample alum, 97.8 %ile', text: "If you don't spot the add-and-subtract trick, plain elimination is fine. Double the first bill and triple the second: 6p + 4n = 276 and 6p + 9n = 486. Subtracting gives 5n = 210, so n = 42.", upvotes: 28, daysAgo: 40 },
  ],
  QA037: [
    { id: 'QA037-c1', author: 'Sample student', text: 'Try small integers. Two numbers adding to 7 with squares adding to 25 are 3 and 4, since 9 + 16 = 25. So k = 3 × 4 = 12.', upvotes: 94, daysAgo: 51 },
    { id: 'QA037-c2', author: 'Sample alum, 98.1 %ile', text: 'The options can be tested in one line, because α² + β² = 49 - 2k. k = 24 gives 1, k = -12 gives 73, k = 6 gives 37, and only k = 12 gives 25.', upvotes: 155, daysAgo: 22 },
  ],
  QA038: [
    { id: 'QA038-c1', author: 'Sample student', text: 'Find one solution and slide. 45 ₹20 notes and 2 ₹50 notes make ₹1,000. Swapping 5 twenties for 2 fifties keeps the total, so the ₹20 count goes 45, 40, and so on down to 5, which is 9 values.', upvotes: 93, daysAgo: 47 },
    { id: 'QA038-c2', author: 'Sample alum, 98.3 %ile', text: "Common mistake: counting 11 or 10. The ₹50 count can be any even number from 0 to 20, which is 11 values, but 'at least one of each' removes both ends. So 11 - 2 = 9.", upvotes: 170, daysAgo: 38 },
  ],
  QA039: [
    { id: 'QA039-c1', author: 'Sample student', text: 'Test the options, because logs of powers of 2 are easy. For x = 16 the logs are 4, 2 and 1, which add to 7. No need to change any base.', upvotes: 117, daysAgo: 60 },
    { id: 'QA039-c2', author: 'Sample alum, 98.7 %ile', text: 'Common mistake: marking 4. That is L, the log to base 2, and the question asks for x. The final step is x = 2⁴ = 16.', upvotes: 3, daysAgo: 8 },
  ],
  QA040: [
    { id: 'QA040-c1', author: 'Sample alum, 98.9 %ile', text: 'General rule: 1/x + 1/y = 1/n has as many ordered positive solutions as n² has factors. Here n = 12 and 144 has 15 factors. An example pair is (13, 156), since 1/13 + 1/156 = 13/156 = 1/12.', upvotes: 98, daysAgo: 24 },
    { id: 'QA040-c2', author: 'Sample student', text: 'The 8 option is the unordered count, and marking it is a mistake. 144 is a square, so its 15 factors make 7 swappable pairs plus the middle one, (24, 24), and 7 + 1 = 8. The question says ordered, so (13, 156) and (156, 13) are different and 15 stands.', upvotes: 25, daysAgo: 26 },
  ],
  QA043: [
    { id: 'QA043-c1', author: 'Sample alum, 99.1 %ile', text: 'For a product like a²bc with a fixed sum, split the sum in the ratio of the powers, 2:1:1. So 12 becomes 6, 3 and 3, and the value is 36 × 9 = 324.', upvotes: 163, daysAgo: 23 },
    { id: 'QA043-c2', author: 'Sample student', text: 'Common mistake: assuming the equal split wins. a = b = c = 4 gives only 256, while a = 6 and b = c = 3 gives 324. The a² rewards giving a a bigger share.', upvotes: 73, daysAgo: 52 },
  ],
  QA044: [
    { id: 'QA044-c1', author: 'Sample student', text: 'Common mistake: doing f first in f(g(3)) because it is written first. That gives g(f(3)) = g(9) = 80, which should look wrong next to these options. The inner function always goes first.', upvotes: 61, daysAgo: 23 },
    { id: 'QA044-c2', author: 'Sample alum, 99.2 %ile', text: 'If you like algebra, build the two formulas once: f(g(x)) = 2x² + 1 and g(f(x)) = (2x + 3)² - 1. Then 2(9) + 1 = 19 and 25 - 1 = 24, so the difference is -5. This pays off when a question needs several values.', upvotes: 7, daysAgo: 16 },
  ],
  QA045: [
    { id: 'QA045-c1', author: 'Sample student', text: 'Doubling beats going one by one. f(2) = 3 + 3 + 2 = 8, f(4) = 8 + 8 + 8 = 24, f(5) = 24 + 3 + 8 = 35, and f(10) = 35 + 35 + 50 = 120. Four steps.', upvotes: 2, daysAgo: 34 },
    { id: 'QA045-c2', author: 'Sample alum, 99.4 %ile', text: 'The 2xy looks like the middle term of (x + y)². So I guessed f(x) = x² + cx, and f(1) = 3 gives c = 2. Putting that back into the equation confirms it, so f(10) = 100 + 20 = 120.', upvotes: 26, daysAgo: 45 },
    { id: 'QA045-c3', author: 'Sample alum, 99.6 %ile', text: 'Common mistake: treating f as linear and writing f(10) = 10 × f(1) = 30. That throws away the 2xy term, which is where most of the value comes from.', upvotes: 8, daysAgo: 11 },
  ],
  QA046: [
    { id: 'QA046-c1', author: 'Sample student', text: "You don't need to rely on spotting the cycle. Substituting once shows f(n + 2) = -1/f(n), so f(n + 4) = f(n) for any starting value. As a check, f(1) × f(3) = 2 × (-1/2) = -1.", upvotes: 49, daysAgo: 11 },
    { id: 'QA046-c2', author: 'Sample alum, 99.7 %ile', text: 'Neat link: if f(n) = tan θ, then (1 + tan θ)/(1 - tan θ) = tan(θ + 45°). Each step adds 45°, and tan repeats after 180°, so the cycle is 4 steps.', upvotes: 6, daysAgo: 36 },
    { id: 'QA046-c3', author: 'Sample alum, 99.9 %ile', text: 'Common mistake: mismatching remainders. The cycle starts at f(1), so remainder 1 means f(1), remainder 2 means f(2), and remainder 0 means f(4). 2026 = 4 × 506 + 2, so it is f(2) = -3.', upvotes: 98, daysAgo: 35 },
  ],
  QA049: [
    { id: 'QA049-c1', author: 'Sample alum, 98 %ile', text: 'After the additions the sum is 28 and the middle term is 8. So the outer two add to 20 and multiply to 8² = 64, which makes them 4 and 16. That gives the GP 4, 8, 16, and taking away 1, 1 and 5 gives 3, 7, 11.', upvotes: 2, daysAgo: 10 },
    { id: 'QA049-c2', author: 'Sample alum, 99 %ile', text: 'Common mistake: entering 15. That comes from d = -8, which gives 15, 7, -1. It does form a GP after the additions, 16, 8, 4, but the numbers must be positive and increasing, so it fails on both counts.', upvotes: 84, daysAgo: 32 },
  ],
  QA050: [
    { id: 'QA050-c1', author: 'Sample alum, 97.4 %ile', text: 'Remainder check on the options. Each of the 26 terms leaves 2 when divided by 5, so the sum leaves the same as 52, which is 2. The sum must end in 2 or 7, and only 14547 does.', upvotes: 18, daysAgo: 24 },
    { id: 'QA050-c2', author: 'Sample student', text: 'Common mistake: counting 25 terms. Dropping the last term, 997, gives 13550, which is sitting in the options. Use (last - first)/gap + 1 every time.', upvotes: 143, daysAgo: 48 },
    { id: 'QA050-c3', author: 'Sample alum, 97.8 %ile', text: 'To find the first number fast, list numbers leaving 3 on division by 7, which are 3, 10, 17, and stop at the first that leaves 2 on division by 5. That is 17, and 17 + 35 × 3 = 122 is the first three-digit one.', upvotes: 104, daysAgo: 57 },
  ],
  QA051: [
    { id: 'QA051-c1', author: 'Sample student', text: 'No square roots needed if you know your triples. 7-24-25 gives the first height, and 15-20-25 is just 3-4-5 times 5. So the heights are 24 and 20.', upvotes: 32, daysAgo: 25 },
    { id: 'QA051-c2', author: 'Sample alum, 98.1 %ile', text: 'If you forget a triple, use difference of squares: 25² - 7² = 18 × 32 = 576, which is 24². And 25² - 15² = 10 × 40 = 400, which is 20².', upvotes: 169, daysAgo: 46 },
    { id: 'QA051-c3', author: 'Sample alum, 98.3 %ile', text: "Common mistake: marking 20, which is the new height, not the slide. The question wants the change, 24 - 20 = 4. I circle 'by how many' now.", upvotes: 83, daysAgo: 60 },
  ],
  QA052: [
    { id: 'QA052-c1', author: 'Sample student', text: 'I prefer pairs minus sides. 12 vertices make C(12, 2) = 66 pairs, and 12 of those pairs are the sides. That leaves 54, and it also shows why 66 is the tempting wrong answer.', upvotes: 27, daysAgo: 38 },
    { id: 'QA052-c2', author: 'Sample alum, 98.7 %ile', text: 'If you doubt the formula n(n - 3)/2, test it on a square: 4 × 1 / 2 = 2, which is right. A pentagon gives 5, also right. It takes a few seconds and saves the halving error that gives 108.', upvotes: 47, daysAgo: 39 },
  ],
  QA053: [
    { id: 'QA053-c1', author: 'Sample alum, 98.9 %ile', text: 'Both chords use the same 5-12-13 triple, with half-chords of 12 and 5. So the distances just swap: 5 and 12. No square roots.', upvotes: 6, daysAgo: 1 },
    { id: 'QA053-c2', author: 'Sample alum, 99.1 %ile', text: 'Sanity check: a longer chord sits closer to the centre, so the 24 cm chord at 5 cm and the 10 cm chord at 12 cm makes sense. Common mistake: taking 12 - 5 = 7, which would put both chords on the same side of the centre.', upvotes: 15, daysAgo: 17 },
  ],
  QA054: [
    { id: 'QA054-c1', author: 'Sample alum, 99.2 %ile', text: 'Go straight for the quadrilateral. Areas are 9 and 25 for the small and big triangles, so the strip is 16 out of 25. 125 × 16/25 = 80.', upvotes: 8, daysAgo: 22 },
    { id: 'QA054-c2', author: 'Sample alum, 99.4 %ile', text: 'Three mistakes to avoid. PS:SQ = 3:2 means the similar triangles are 3:5, not 3:2. Using 3/5 on area without squaring gives 75. And 45 is the small triangle, not the quadrilateral.', upvotes: 7, daysAgo: 6 },
  ],
  QA055: [
    { id: 'QA055-c1', author: 'Sample alum, 99.6 %ile', text: 'Shortcut for right triangles: area = r × (r + hypotenuse). Here 6 × (6 + 34) = 240. This works because the semi-perimeter is exactly r + hypotenuse.', upvotes: 6, daysAgo: 26 },
    { id: 'QA055-c2', author: 'Sample alum, 99.7 %ile', text: 'Common mistake: the 480 option comes from multiplying r by the full perimeter, 6 × 80, or from 16 × 30 without halving. Area is r times the semi-perimeter. You can also confirm the legs: 16² + 30² = 256 + 900 = 1156 = 34².', upvotes: 2, daysAgo: 44 },
  ],
  QA056: [
    { id: 'QA056-c1', author: 'Sample alum, 99.9 %ile', text: 'There is a neat form for this: 1/√x = 1/√9 + 1/√4 = 1/3 + 1/2 = 5/6. So √x = 6/5 and x = 1.44. It is just the span equation divided through.', upvotes: 141, daysAgo: 13 },
    { id: 'QA056-c2', author: 'Sample alum, 98 %ile', text: 'Where 2√(ab) comes from: the centres are a + b apart and differ in height by a - b. So the gap along the line is √((a + b)² - (a - b)²) = √(4ab). Worth deriving once, because then you trust it.', upvotes: 95, daysAgo: 38 },
    { id: 'QA056-c3', author: 'Sample alum, 99 %ile', text: 'Common mistake: entering 1.2. That is √x, not x. Sanity check: 1.44 is well below 4, which fits a small circle in the gap.', upvotes: 6, daysAgo: 9 },
  ],
  QA057: [
    { id: 'QA057-c1', author: 'Sample alum, 97.4 %ile', text: 'Cancel before you multiply. 22/7 × 7 × 7 × 5 / 55 = 22 × 7 × 5 / 55, and 22 × 5 / 55 = 2, so the answer is 2 × 7 = 14.', upvotes: 27, daysAgo: 17 },
    { id: 'QA057-c2', author: 'Sample alum, 97.8 %ile', text: 'Common mistake: using 14 as the radius. Doubling the radius makes the volume 4 times bigger, so that route gives 56 hours. Seeing 56, exactly 4 times 14, in the options is the hint.', upvotes: 145, daysAgo: 31 },
  ],
  QA058: [
    { id: 'QA058-c1', author: 'Sample student', text: 'Let s = 3.5. The cylinder has radius 2s and height 8s, so its volume is π × 4s² × 8s = 32πs³. One sphere is (4/3)πs³. Then 32 ÷ 4/3 = 24.', upvotes: 5, daysAgo: 45 },
    { id: 'QA058-c2', author: 'Sample alum, 98.1 %ile', text: 'Common mistake: entering 32. That drops the 4/3 from the sphere formula and uses πr³. It is an easy slip, because 32 looks like a clean answer.', upvotes: 137, daysAgo: 45 },
  ],
  QA060: [
    { id: 'QA060-c1', author: 'Sample alum, 98.3 %ile', text: 'Prime factors give the LCM fastest: 12 = 2² × 3, 18 = 2 × 3², 30 = 2 × 3 × 5. Take the highest power of each: 4 × 9 × 5 = 180 seconds, or 3 minutes. Then it is just 10 minutes divided by 3 minutes, rounded down.', upvotes: 3, daysAgo: 38 },
    { id: 'QA060-c2', author: 'Sample student', text: 'Common mistake: the option 100 comes from using the HCF, since 600 / 6 = 100. The HCF is the biggest number dividing all three, but blinking together needs a multiple of all three, which is the LCM.', upvotes: 166, daysAgo: 57 },
  ],
  QA061: [
    { id: 'QA061-c1', author: 'Sample alum, 98.7 %ile', text: 'Faster layout: keep dividing by 5 and add the quotients. 250 gives 50, then 10, then 2. So 50 + 10 + 2 = 62.', upvotes: 74, daysAgo: 24 },
    { id: 'QA061-c2', author: 'Sample student', text: 'Common mistake: stopping at 60. 125 and 250 each hold three 5s, so each adds one more 5 beyond what the 5 and 25 counts already saw. That is the extra 2.', upvotes: 58, daysAgo: 48 },
  ],
  QA066: [
    { id: 'QA066-c1', author: 'Sample alum, 98.9 %ile', text: 'Slot method: choose 2 of the 6 places for the Ms, which is C(6, 2) = 15. The other four letters are all different, so they fill the rest in 24 ways. 15 × 24 = 360.', upvotes: 3, daysAgo: 34 },
    { id: 'QA066-c2', author: 'Sample student', text: 'Common mistake: dividing by 2 twice and getting 180. Only M repeats. U, B, A and I appear once each.', upvotes: 147, daysAgo: 42 },
  ],
  QA067: [
    { id: 'QA067-c1', author: 'Sample alum, 99.1 %ile', text: 'Complement is quicker. All committees: C(11, 4) = 330. Remove no women, C(6, 4) = 15, and exactly one woman, 5 × C(6, 3) = 100. That leaves 330 - 115 = 215.', upvotes: 3, daysAgo: 32 },
    { id: 'QA067-c2', author: 'Sample student', text: 'Common mistake: choosing 2 women first and then any 2 from the remaining 9, which gives 10 × 36 = 360. A committee with 3 women gets counted three times that way, so the split by cases is needed.', upvotes: 128, daysAgo: 4 },
  ],
  QA069: [
    { id: 'QA069-c1', author: 'Sample alum, 99.2 %ile', text: 'For two dice, the number of ways to get sum s is 6 - |s - 7|. So sum 4 has 6 - 3 = 3 ways and sum 9 has 6 - 2 = 4 ways. It saves writing the pairs out.', upvotes: 65, daysAgo: 2 },
    { id: 'QA069-c2', author: 'Sample alum, 99.4 %ile', text: 'Common mistake: the 2/11 option is 2 good sums out of 11 possible sums. That fails because the sums are not equally likely: a 7 has 6 ways and a 2 has only 1. Always count over the 36 ordered outcomes.', upvotes: 7, daysAgo: 45 },
  ],
  QA070: [
    { id: 'QA070-c1', author: 'Sample alum, 99.6 %ile', text: 'Token by token also works. One fixed colour order has probability 5/12 × 4/11 × 3/10 = 1/22, and there are 6 colour orders, so 6/22 = 3/11. Forget the 6 and you land on the 1/22 option.', upvotes: 175, daysAgo: 21 },
    { id: 'QA070-c2', author: 'Sample alum, 99.7 %ile', text: 'Common mistake: the 5/24 option keeps 12 in every denominator, 6 × 5/12 × 4/12 × 3/12. The tokens are drawn at once, so nothing goes back and the pool shrinks to 11 and then 10.', upvotes: 143, daysAgo: 47 },
    { id: 'QA070-c3', author: 'Sample alum, 99.9 %ile', text: 'Sanity check by cases: all the same colour is 10 + 4 + 1 = 15 ways, exactly two the same is 70 + 48 + 27 = 145 ways, and all different is 60. These add up to 220, so nothing was missed.', upvotes: 33, daysAgo: 22 },
  ],
  QA072: [
    { id: 'QA072-c1', author: 'Sample student', text: 'Formula: exactly one = (sum of singles) - 2 × (sum of pairs) + 3 × (all three). That is 280 - 210 + 45 = 115.', upvotes: 5, daysAgo: 8 },
    { id: 'QA072-c2', author: 'Sample alum, 98 %ile', text: 'Full check: at least one sport is 280 - 105 + 15 = 190, exactly two is 25 + 15 + 20 = 60, and all three is 15. Then 115 + 60 + 15 = 190, which fits. Common mistake: 130 is what you get by subtracting only the 60 from 190, because the 15 are still inside it.', upvotes: 6, daysAgo: 35 },
  ],
  QA073: [
    { id: 'QA073-c1', author: 'Sample alum, 99 %ile', text: 'Direct formula for this type: minimum in all k groups = sum of the groups - (k - 1) × total. Here 330 - 3 × 100 = 30.', upvotes: 10, daysAgo: 32 },
    { id: 'QA073-c2', author: 'Sample student', text: 'Common mistake: entering 75. That is the largest possible overlap, set by the smallest group. The question asks for the smallest, so the people who miss a language should be kept as separate as possible.', upvotes: 2, daysAgo: 37 },
  ],
  // ---- DILR ----
  'S08-1': [
    { id: 'S08-1-c1', author: 'Sample student', text: 'Chain the fixed clues: Asha at seat 0, Chetan at 2, Farhan at 3. The free seats are 1, 4 and 5, and Divya must be two seats clockwise of Esha, which works only with Esha at 5 and Divya at 1. Seat 5 is opposite seat 2.', upvotes: 12, daysAgo: 32 },
    { id: 'S08-1-c2', author: 'Sample alum, 97.4 %ile', text: 'Check an opposite seat by counting both ways. From Chetan going anticlockwise you pass Divya and Asha and reach Esha, the same person as the clockwise count. If the two counts disagree, the layout has an error.', upvotes: 64, daysAgo: 49 },
  ],
  'S08-2': [
    { id: 'S08-2-c1', author: 'Sample alum, 97.8 %ile', text: 'This one is a clue in disguise. The set states outright that Farhan is immediately clockwise of Chetan, so no arrangement is needed. Scan the clues before you start any question in a set.', upvotes: 112, daysAgo: 6 },
    { id: 'S08-2-c2', author: 'Sample alum, 98.1 %ile', text: "Common mistake: flipping the phrase. 'X is clockwise of Y' means start at Y, move clockwise and land on X. Read it the other way and you pick Divya, who is on Chetan's anticlockwise side.", upvotes: 146, daysAgo: 31 },
  ],
  'S08-3': [
    { id: 'S08-3-c1', author: 'Sample alum, 98.3 %ile', text: "Try each name in the gap, with Asha at 0, Chetan at 2 and Farhan at 3 already fixed. If Chetan were the gap, Divya would need Farhan's seat. If Farhan were the gap, Esha would need Chetan's seat. Bilal fails the same way, so only Asha works.", upvotes: 70, daysAgo: 54 },
    { id: 'S08-3-c2', author: 'Sample alum, 98.7 %ile', text: 'The clue gives one seat between Esha and Divya on the clockwise side, so there is exactly one name to find. The anticlockwise way from Esha passes Bilal, Farhan and Chetan, so if you are seeing three names, you are going the wrong way.', upvotes: 44, daysAgo: 2 },
  ],
  'S12-1': [
    { id: 'S12-1-c1', author: 'Sample alum, 98.9 %ile', text: "You don't need Bilal or Farhan. Put Asha at seat 0 and Chetan at seat 2. Chetan's neighbours are Divya and Esha, and Asha can't sit next to Divya, so Divya is at seat 3, straight across from seat 0.", upvotes: 103, daysAgo: 29 },
    { id: 'S12-1-c2', author: 'Sample student', text: "Common mistake: reading 'two seats clockwise' as two people in between. The set defines it as one seat in between. The wrong reading puts Chetan opposite Asha, and Chetan is an option.", upvotes: 17, daysAgo: 23 },
  ],
  'S12-2': [
    { id: 'S12-2-c1', author: 'Sample alum, 99.1 %ile', text: "Only one clue separates Farhan and Bilal. With Asha, Esha, Chetan and Divya in seats 0 to 3, those two share seats 4 and 5. Bilal can't be opposite Esha, and seat 4 is opposite seat 1, so Bilal takes seat 5.", upvotes: 5, daysAgo: 59 },
    { id: 'S12-2-c2', author: 'Sample alum, 99.2 %ile', text: 'I write the circle as one line, A E C D F B, with left to right meaning clockwise. The clockwise neighbour is always the next letter to the right, wrapping round at the end. It stops me from reading the circle backwards.', upvotes: 101, daysAgo: 18 },
  ],
  'S12-3': [
    { id: 'S12-3-c1', author: 'Sample alum, 99.4 %ile', text: "Two clues do all the work: Chetan is next to Divya and next to Esha, so Chetan is in the seat between them. You don't have to build the whole table for this.", upvotes: 14, daysAgo: 22 },
    { id: 'S12-3-c2', author: 'Sample student', text: 'A check on direction: the other way round from Esha to Divya passes Asha, Bilal and Farhan, three people. The question expects one name, so clockwise from Esha has to be the short side.', upvotes: 2, daysAgo: 26 },
  ],
  'S14-1': [
    { id: 'S14-1-c1', author: 'Sample alum, 99.6 %ile', text: 'Start with the linked pair: Esha right after Asha, so seats 0 and 1. Divya is two seats before Esha, which gives seat 5. That leaves seats 2, 3 and 4, and the one-seat gap between Chetan and Farhan forces Bilal into seat 3, opposite Asha.', upvotes: 26, daysAgo: 28 },
    { id: 'S14-1-c2', author: 'Sample student', text: 'Write down the three opposite pairs once you have the table: Asha and Bilal, Esha and Farhan, Chetan and Divya. Any later opposite question is then a lookup, and you avoid counting mistakes.', upvotes: 29, daysAgo: 13 },
  ],
  'S14-2': [
    { id: 'S14-2-c1', author: 'Sample student', text: 'Once Asha, Esha and Divya are in seats 0, 1 and 5, only 2, 3 and 4 are free. Farhan is two seats clockwise of Chetan, so Chetan must take 2 and Farhan 4. Seat 2 is the next one after Esha.', upvotes: 28, daysAgo: 20 },
    { id: 'S14-2-c2', author: 'Sample alum, 99.7 %ile', text: 'Common mistake: using the Esha and Asha clue backwards. Esha is immediately clockwise of Asha, so Asha is the one anticlockwise of Esha, not clockwise. Moving clockwise from Esha leads to Chetan.', upvotes: 27, daysAgo: 58 },
  ],
  'S14-3': [
    { id: 'S14-3-c1', author: 'Sample student', text: 'A shortcut by leftovers. Asha, Esha and Divya are placed by two clues, which leaves Bilal, Chetan and Farhan. Chetan and Farhan have one seat between them, and the only person left for that seat is Bilal.', upvotes: 24, daysAgo: 22 },
    { id: 'S14-3-c2', author: 'Sample alum, 99.9 %ile', text: 'Seat numbers help: Chetan at 2 and Farhan at 4 means the answer is whoever is at 3. If you solved the opposite question in this set, you already know that is Bilal.', upvotes: 166, daysAgo: 23 },
  ],
  'L01-1': [
    { id: 'L01-1-c1', author: 'Sample alum, 98 %ile', text: 'Place the fixed clues first: Meher at 4 and Oviya at 3. Now Nikhil can only be at 1 or 2, and that one clue settles Sanjay at 5. Ritu, Qadir and Pranav are a chain, so they just fill 1, 6 and 7 in order.', upvotes: 71, daysAgo: 14 },
    { id: 'L01-1-c2', author: 'Sample alum, 99 %ile', text: "Common mistake: flipping ahead and behind. I write the queue with the counter on the left, so behind always means moving right. Sanjay's right-hand neighbour is Qadir.", upvotes: 51, daysAgo: 31 },
  ],
  'L01-2': [
    { id: 'L01-2-c1', author: 'Sample student', text: 'You can answer without placing Qadir or Pranav. Sanjay is at 5 and the free positions are 1, 6 and 7. Ritu must be ahead of both Qadir and Pranav, so Ritu takes 1.', upvotes: 140, daysAgo: 44 },
    { id: 'L01-2-c2', author: 'Sample alum, 97.4 %ile', text: "Count check: 3 between, plus Ritu and Sanjay, plus the 2 behind Sanjay makes 7. If your count doesn't reach 7, you have added or missed someone.", upvotes: 94, daysAgo: 13 },
  ],
  'L01-3': [
    { id: 'L01-3-c1', author: 'Sample alum, 97.8 %ile', text: 'Position from the front + position from the back = total + 1. For seven students that is 8, so third from the back is position 5, which is Sanjay.', upvotes: 41, daysAgo: 27 },
    { id: 'L01-3-c2', author: 'Sample alum, 98.1 %ile', text: "You don't need the full queue. Position 5 comes from the Nikhil and Sanjay clue alone, once Meher and Oviya are placed. Ritu, Qadir and Pranav can wait.", upvotes: 13, daysAgo: 49 },
  ],
  'L01-4': [
    { id: 'L01-4-c1', author: 'Sample student', text: "Don't rewrite the queue. Two places behind Oviya is position 5 whatever happens, so you only need to know who holds 5 after the swap. Sanjay held it, and the swap hands it to Nikhil.", upvotes: 3, daysAgo: 59 },
    { id: 'L01-4-c2', author: 'Sample alum, 98.3 %ile', text: "Direction check: going two places the wrong way lands on position 1, which is Ritu. Ritu isn't an option, a small hint that the count should go towards the back.", upvotes: 33, daysAgo: 47 },
  ],
  'T01-1': [
    { id: 'T01-1-c1', author: 'Sample alum, 98.7 %ile', text: "Read the options first. Notebook isn't offered, and File folder at 40 × 190 is under ₹8,000. That leaves three multiplications, and in hundreds they are 168, 162.5 and 165, for Pen pack, Sketch pad and Geometry box.", upvotes: 143, daysAgo: 11 },
    { id: 'T01-1-c2', author: 'Sample student', text: 'Careful with rounding here. The top three are within ₹550 of each other. If you round 105 down to 100, Pen pack looks like ₹16,000 and drops to third, so use exact figures.', upvotes: 118, daysAgo: 31 },
  ],
  'T01-2': [
    { id: 'T01-2-c1', author: 'Sample student', text: 'If you have already done Week 2 for the first question, use differences. Units changed by -10, -10, 0, +30 and +10, so revenue changed by -750 - 1,050 + 4,500 + 400 = +3,100. Then 70,650 - 3,100 = 67,550.', upvotes: 103, daysAgo: 26 },
    { id: 'T01-2-c2', author: 'Sample alum, 98.9 %ile', text: "Common mistake: missing the last row. Pair up to reduce slips: 14,250 + 17,850 = 32,100 and 16,250 + 12,000 = 28,250. Those make 60,350, an easy place to stop by accident, and the File folder's 7,200 takes it to 67,550.", upvotes: 134, daysAgo: 31 },
  ],
  'T01-3': [
    { id: 'T01-3-c1', author: 'Sample student', text: 'Know your eighths. 30/80 = 3/8, and since 1/8 is 12.5%, the answer is 37.5% with no division.', upvotes: 102, daysAgo: 19 },
    { id: 'T01-3-c2', author: 'Sample alum, 99.1 %ile', text: 'Ratio view: 110/80 = 1.375, so the rise is 37.5%. Common mistake: entering 137.5, which is Week 2 as a percent of Week 1, not the rise.', upvotes: 66, daysAgo: 31 },
  ],
  'T01-4': [
    { id: 'T01-4-c1', author: 'Sample alum, 99.2 %ile', text: "Notebook and File folder both sold 370 units, so the bigger margin wins and File folder is out without multiplying. Geometry box has a slightly higher margin than Notebook but about half the units, so it is out too. Sketch pad's 25 × 260 is well below 30 × 370.", upvotes: 7, daysAgo: 39 },
    { id: 'T01-4-c2', author: 'Sample student', text: "Common mistake: thinking in percentages. File folder doubles its buying price, a 100% markup and the best in the table. The question asks for rupees of profit, so the percentage doesn't decide it.", upvotes: 38, daysAgo: 60 },
  ],
  'T01-5': [
    { id: 'T01-5-c1', author: 'Sample alum, 99.4 %ile', text: 'Cross-check through totals: revenue rose by ₹3,100 and buying cost rose by ₹2,300, from -450 - 900 + 3,450 + 200. Profit rose by the difference, ₹800.', upvotes: 107, daysAgo: 20 },
    { id: 'T01-5-c2', author: 'Sample alum, 99.6 %ile', text: 'Two options are half of the working: ₹1,250 is the rises alone and ₹450 is the falls alone. Stopping at either one is a mistake. The answer nets them: 1,250 - 450 = 800.', upvotes: 139, daysAgo: 18 },
    { id: 'T01-5-c3', author: 'Sample student', text: "If you don't trust the change method, full totals work. Week 1 profit is 5,700 + 2,550 + 3,250 + 2,800 + 3,600 = ₹17,900, and Week 2 is 5,400 + 2,400 + 3,250 + 3,850 + 3,800 = ₹18,700. It takes longer but gives the same ₹800.", upvotes: 3, daysAgo: 22 },
  ],
  'G01-1': [
    { id: 'G01-1-c1', author: 'Sample student', text: 'Treat Yamini, Tanvi, an empty day and Uday as one block of four days. It fits only Monday to Thursday or Tuesday to Friday. Friday belongs to Vikram, so the block starts on Monday and Uday lands on Thursday.', upvotes: 179, daysAgo: 8 },
    { id: 'G01-1-c2', author: 'Sample alum, 99.7 %ile', text: "You don't need the zones at all for this one, apart from linking Vikram to Friday through East. Leave the other zone clues for the questions that need them.", upvotes: 71, daysAgo: 48 },
  ],
  'G01-2': [
    { id: 'G01-2-c1', author: 'Sample student', text: "Go through the options. Central is on Tuesday, so it is out. West can't be Monday because North has to come before it. North on Monday would leave South after Central, which breaks that clue, so only South survives.", upvotes: 91, daysAgo: 15 },
    { id: 'G01-2-c2', author: 'Sample alum, 99.9 %ile', text: "Of the two order clues, start with the one that has a fixed end. Central's day is known, so South has just one place to go. North before West has no fixed end yet, so it can't help with Monday.", upvotes: 62, daysAgo: 24 },
  ],
  'G01-3': [
    { id: 'G01-3-c1', author: 'Sample alum, 98 %ile', text: 'Use the complement. All five rounds add to 14 + 11 + 9 + 16 + 6 = 56. Thursday is West and Friday is East, so take away 16 + 9 = 25 to get 31.', upvotes: 7, daysAgo: 40 },
    { id: 'G01-3-c2', author: 'Sample alum, 99 %ile', text: "Riders aren't needed for this. Monday is South, Tuesday is Central, and the two zones left before Friday go North then West, so Wednesday is 14 km. That is 11 + 6 + 14.", upvotes: 70, daysAgo: 55 },
  ],
  'G01-4': [
    { id: 'G01-4-c1', author: 'Sample alum, 97.4 %ile', text: 'The shortest round is Central, and a clue says Tanvi covers Central. So the question really asks who works the day after Tanvi. In the Yamini, Tanvi, gap, Uday block, the gap is the only day left for Zubin.', upvotes: 14, daysAgo: 10 },
    { id: 'G01-4-c2', author: 'Sample student', text: 'Common mistake: marking Uday, because the clue about Uday mentions Tanvi. Uday is two days after Tanvi, so that is Thursday, not Wednesday.', upvotes: 62, daysAgo: 53 },
  ],
  // ---- VARC ----
  'RC1-1': [
    { id: 'RC1-1-c1', author: 'Sample alum, 97.8 %ile', text: 'I run a two-step filter on main idea questions. The passage says what night markets are and also what reform should do, so the answer must cover both. Only two options touch policy, and one of those goes too far.', upvotes: 13, daysAgo: 1 },
    { id: 'RC1-1-c2', author: 'Sample student', text: "The option about shared crowds is tempting because the crowd point really is in the passage. But it is one paragraph's point, and the passage never says crowds keep food cheaper than in restaurants. A true detail is not a central argument, so marking it is a mistake.", upvotes: 94, daysAgo: 37 },
    { id: 'RC1-1-c3', author: 'Sample alum, 98.1 %ile', text: 'Common mistake: picking the option about charm and disorder. The author brings up that way of seeing markets early only to reject it, and the close says authenticity is not the measure.', upvotes: 9, daysAgo: 27 },
  ],
  'RC1-2': [
    { id: 'RC1-2-c1', author: 'Sample alum, 98.3 %ile', text: "Eliminate with the author's own views. Drains are welcomed, rivalry between sellers is treated as normal, and the feel of authenticity is set aside. That leaves the cook who can't afford to try.", upvotes: 2, daysAgo: 55 },
    { id: 'RC1-2-c2', author: 'Sample student', text: 'You can spot this before the last paragraph. The reform paragraph ends on the low-budget cook moving away, and that is the loss the author minds most.', upvotes: 57, daysAgo: 39 },
  ],
  'RC1-3': [
    { id: 'RC1-3-c1', author: 'Sample alum, 98.7 %ile', text: 'Use the question as a search key. Only one paragraph raises this puzzle, and the answer sits in the next few lines. No need to reread the whole passage.', upvotes: 56, daysAgo: 14 },
    { id: 'RC1-3-c2', author: 'Sample alum, 98.9 %ile', text: 'The rent-sharing option borrows from a different paragraph, and picking it is a mistake. Rent comes up as a problem for a single vendor, but nowhere does the passage say that stallholders split it.', upvotes: 89, daysAgo: 32 },
  ],
  'RC1-4': [
    { id: 'RC1-4-c1', author: 'Sample student', text: "A test I use for weaken questions: flip the option and see if the argument gets stronger. If most buyers did rely on queues, kitchens and faces, the author's account would gain support. So the original option really does attack it.", upvotes: 168, daysAgo: 6 },
    { id: 'RC1-4-c2', author: 'Sample alum, 99.1 %ile', text: "The supermarket option is a distractor. Supermarkets using a similar signal doesn't show the signal fails in night markets. If anything, it suggests the signal works.", upvotes: 64, daysAgo: 31 },
  ],
  'RC2-1': [
    { id: 'RC2-1-c1', author: 'Sample student', text: 'Look at how the space is divided. Four paragraphs describe the process and one judges the lesson for people, so the purpose has to cover both parts. Only one option does: how the swarm chooses, and how far that can guide people.', upvotes: 34, daysAgo: 56 },
    { id: 'RC2-1-c2', author: 'Sample alum, 99.2 %ile', text: "The option on political terms comes from a single remark in the first paragraph. It never gets developed, so it can't be the main purpose.", upvotes: 89, daysAgo: 17 },
    { id: 'RC2-1-c3', author: 'Sample alum, 99.4 %ile', text: "The honesty option reverses the author. The passage says the bees' honesty isn't a virtue at all, since they have nothing to gain from lying.", upvotes: 174, daysAgo: 60 },
  ],
  'RC2-2': [
    { id: 'RC2-2-c1', author: 'Sample student', text: "Two options go straight away: the queen takes no part in the choice, and the swarm doesn't wait for everyone to agree. That leaves the fading dance and the follower's own visit. Imitation means copying, and only the visit checks copying.", upvotes: 51, daysAgo: 29 },
    { id: 'RC2-2-c2', author: 'Sample alum, 99.6 %ile', text: 'The passage gives two safeguards in a row, so match each to its job. One checks a claim against the real site, and the other stops loyalty lasting forever. Note down which does what, because they are easy to swap under time pressure.', upvotes: 133, daysAgo: 24 },
  ],
  'RC2-3': [
    { id: 'RC2-3-c1', author: 'Sample student', text: "The option about followers copying mixes up the two safeguards. Checking a site in person is a separate mechanism, and taking away the fading doesn't touch it. The option about better sites gaining faster has no support either, because nothing suggests that rivals who never stop would help the better sites.", upvotes: 41, daysAgo: 60 },
    { id: 'RC2-3-c2', author: 'Sample alum, 99.7 %ile', text: "Why the quorum option is too strong: a quorum only needs enough scouts at one site at the same moment. A stubborn group at a weak site wouldn't rule that out, and nothing in the passage says it would.", upvotes: 32, daysAgo: 5 },
  ],
  'RC2-4': [
    { id: 'RC2-4-c1', author: 'Sample student', text: "The neutral option catches people who confuse balanced with neutral. The author does take a position: some lessons carry over and the bigger comparison doesn't. A balanced view is still a view.", upvotes: 36, daysAgo: 3 },
    { id: 'RC2-4-c2', author: 'Sample alum, 99.9 %ile', text: "Admiring fails on the ending, where the author says outright that bees aren't a model of good citizenship. The praise is for the procedure, not for the bees' character.", upvotes: 3, daysAgo: 28 },
  ],
  'RC3-1': [
    { id: 'RC3-1-c1', author: 'Sample student', text: 'Look for where the author speaks in the first person. In this passage that comes near the end, right after the view the author turns down. The central claim sits there, and it is about being shared and stable.', upvotes: 6, daysAgo: 1 },
    { id: 'RC3-1-c2', author: 'Sample alum, 98 %ile', text: 'Two of the wrong options twist smaller points. Physics is said to keep the old length, not to find a natural basis for it. And other countries accepted the metre because it seemed to belong to nobody, which is close to the opposite of French power spreading.', upvotes: 68, daysAgo: 54 },
  ],
  'RC3-2': [
    { id: 'RC3-2-c1', author: 'Sample alum, 99 %ile', text: "Dates help. The speed of light definition came in 1983, long after the first bar, so the option saying it happened at once can't be right. And the undisclosed problem was in Méchain's own data, not in later surveys being hidden.", upvotes: 70, daysAgo: 38 },
    { id: 'RC3-2-c2', author: 'Sample student', text: 'A memory line for this one: the object stayed, the meaning moved. The whole argument runs on that turn, and the same pattern comes back with krypton and light.', upvotes: 59, daysAgo: 19 },
  ],
  'RC3-3': [
    { id: 'RC3-3-c1', author: 'Sample alum, 97.4 %ile', text: 'The number itself is a clue. Anyone choosing a natural unit freely would pick a round figure. An ugly fraction is what you get when you fit a new definition around a length you refuse to change.', upvotes: 69, daysAgo: 44 },
    { id: 'RC3-3-c2', author: 'Sample student', text: "The other distractors add things the passage never says. It doesn't say how the speed of light was first measured, and it doesn't call the 1983 definition less exact. Each redefinition was meant to keep the length as close as instruments allowed.", upvotes: 125, daysAgo: 19 },
  ],
  'RC3-4': [
    { id: 'RC3-4-c1', author: 'Sample alum, 97.8 %ile', text: 'Write the pattern in a few words before reading the options: value stays, original reason goes. I find that stops surface details like cups or currencies from pulling me in.', upvotes: 66, daysAgo: 56 },
    { id: 'RC3-4-c2', author: 'Sample alum, 98.1 %ile', text: 'Two yes or no tests settle it. Did the value stay the same? Did the old reason for it go away? The cup, the currency and the school all fail the first test, and only the club passes both.', upvotes: 3, daysAgo: 15 },
  ],
  PJ01: [
    { id: 'PJ01-c1', author: 'Sample alum, 98.3 %ile', text: 'Use time as the sorting key. 2 and 4 describe how things were, 1 is the change, and 3 is what came after. That order needs no pronoun hunting at all.', upvotes: 18, daysAgo: 23 },
    { id: 'PJ01-c2', author: 'Sample alum, 98.7 %ile', text: "Sentence 4 can't go after 1. It describes a calm period when small gaps didn't matter, and once trains arrive that calm is over. So the orders with 4 after 1 fall away.", upvotes: 26, daysAgo: 46 },
    { id: 'PJ01-c3', author: 'Sample student', text: 'Common mistake: opening with 4. It talks about a gap between towns as if we already know their clocks differ, and that fact only comes in 2.', upvotes: 166, daysAgo: 35 },
  ],
  PJ02: [
    { id: 'PJ02-c1', author: 'Sample student', text: 'Fix the ends first. 3 states the problem and stands on its own, and 2 moves to a later time, so it can only close. That leaves 5, 1 and 4, just six possible orders, and the link words settle them quickly.', upvotes: 115, daysAgo: 13 },
    { id: 'PJ02-c2', author: 'Sample alum, 98.9 %ile', text: 'The shape here is problem, solution, detail, social effect, decline. Spotting that shape first made the link words feel like a check rather than the method.', upvotes: 90, daysAgo: 18 },
    { id: 'PJ02-c3', author: 'Sample alum, 99.1 %ile', text: 'Common mistake: opening with 5. It is framed as an answer, so a problem has to come before it.', upvotes: 53, daysAgo: 60 },
  ],
  PJ03: [
    { id: 'PJ03-c1', author: 'Sample student', text: 'Work from both ends. 3 is the only sentence that sets the scene, so it opens, and 1 looks back at a feeling the buyer already has, so it closes. Only 2 and 4 remain, and 4 refers to a number that 2 has just introduced.', upvotes: 14, daysAgo: 57 },
    { id: 'PJ03-c2', author: 'Sample alum, 99.2 %ile', text: "Common mistake: 3421. The higher figure in 4 looks like it can point at ₹2,000 in 3, so the sentence feels fine there. But 3 sets up a contrast that 2 finishes, and those two can't be split.", upvotes: 179, daysAgo: 47 },
  ],
  PJ04: [
    { id: 'PJ04-c1', author: 'Sample alum, 99.4 %ile', text: 'Pick out the time markers first: 4 is long ago, 5 has a year, and 3 is about today. That gives 4, 5, 3. Then 1 attaches to the older method, and 2 attaches to the person in 5.', upvotes: 106, daysAgo: 9 },
    { id: 'PJ04-c2', author: 'Sample alum, 99.6 %ile', text: "Common mistake: 41253, with 2 ahead of 5. Sentence 2 refers to someone's experiment, but nobody has been named until 5.", upvotes: 150, daysAgo: 55 },
  ],
  PJ05: [
    { id: 'PJ05-c1', author: 'Sample student', text: 'Try reading each sentence alone. 1 needs something to follow from and 2 needs the clutter it refers to, so neither can open. Between 3 and 4, the general claim goes first and the example after it.', upvotes: 174, daysAgo: 5 },
    { id: 'PJ05-c2', author: 'Sample alum, 99.7 %ile', text: "Common mistake: 3412, ending on 2. The line about two honest maps is a conclusion, so it has to come after the mapmaker's choice is described, not before.", upvotes: 89, daysAgo: 1 },
  ],
  PS01: [
    { id: 'PS01-c1', author: 'Sample alum, 99.9 %ile', text: "Put it in your own words before reading the options: experts can't see the steps any more. With that in mind, the options about pride, about knowledge not mattering, and about learners working alone all drop out.", upvotes: 67, daysAgo: 45 },
    { id: 'PS01-c2', author: 'Sample alum, 98 %ile', text: 'The option saying teaching has nothing to do with knowledge is the extreme one. The paragraph says a newer tutor may teach better, not that subject knowledge is useless.', upvotes: 2, daysAgo: 31 },
  ],
  PS02: [
    { id: 'PS02-c1', author: 'Sample student', text: 'The last sentence often carries the summary, and here it contrasts choice with need. So look for the option that keeps both sides of that contrast. Only one does.', upvotes: 3, daysAgo: 14 },
    { id: 'PS02-c2', author: 'Sample alum, 99 %ile', text: "The option about wealthy people stopping adds advice the writer never gives. The paragraph describes and warns, but it doesn't tell anyone what to wear. Watch for a summary that turns an observation into a rule.", upvotes: 25, daysAgo: 59 },
  ],
  PS03: [
    { id: 'PS03-c1', author: 'Sample student', text: 'Numbers make this clear. If a 70% forecast is well made, then out of 100 such days about 30 stay dry. So one dry day proves nothing alone, and you need the whole record.', upvotes: 60, daysAgo: 60 },
    { id: 'PS03-c2', author: 'Sample alum, 97.4 %ile', text: 'The option about dropping percentages blames the wrong thing. The complaint is about how people judge forecasts, and the fix offered is keeping score, not changing how forecasts are written.', upvotes: 68, daysAgo: 55 },
  ],
  PS04: [
    { id: 'PS04-c1', author: 'Sample student', text: 'Find the conclusion marker in the middle of the paragraph. What follows it is the idea of a translation as a judgment, and the sentences before it give the reason. A good summary keeps both.', upvotes: 7, daysAgo: 16 },
    { id: 'PS04-c2', author: 'Sample alum, 97.8 %ile', text: "Two extremes to reject. The paragraph says no version can keep everything, which is not the same as saying poems can't be translated. It also never says meaning should always win.", upvotes: 10, daysAgo: 36 },
  ],
  OS01: [
    { id: 'OS01-c1', author: 'Sample alum, 98.1 %ile', text: 'The other sentences share a frame: by day, at night, under cloud. Each gives a condition and a cue. Sentence 3 has neither, so it stands out.', upvotes: 2, daysAgo: 29 },
    { id: 'OS01-c2', author: 'Sample alum, 98.3 %ile', text: 'Common mistake: marking 1 because it sounds general. It is the topic sentence that the others depend on, so taking it out would leave them without a point.', upvotes: 58, daysAgo: 6 },
  ],
  OS02: [
    { id: 'OS02-c1', author: 'Sample alum, 98.7 %ile', text: "Try inserting the suspect. Put 2 right after 4 and the pronoun opening 5 now seems to point at coins, not merchants. The chain breaks, which confirms 2 doesn't belong.", upvotes: 3, daysAgo: 32 },
    { id: 'OS02-c2', author: 'Sample alum, 98.9 %ile', text: "Common mistake: marking 3 because the government appears suddenly. It is the end of the story, and it takes over the same practice the merchants started. A new actor doesn't mean a new topic.", upvotes: 108, daysAgo: 57 },
  ],
  OS03: [
    { id: 'OS03-c1', author: 'Sample alum, 99.1 %ile', text: 'Give each sentence a one-word tag: 4 cause, 2 choice, 3 effect, 1 result, 5 spelling. The odd tag shows up fast, with no need to build the whole paragraph.', upvotes: 4, daysAgo: 58 },
    { id: 'OS03-c2', author: 'Sample student', text: 'Common mistake: marking 1 because it starts abruptly. Put it last and it reads as the end point of the process, with the grandparents as the last speakers. Order the four first, and the one left over is the answer.', upvotes: 16, daysAgo: 34 },
  ],
};
