// The printable formula sheet bought with coins. Original wording. Plain text so it prints anywhere.

export type Formula = { name: string; formula: string };
export type FormulaGroup = { title: string; items: Formula[] };

export const FORMULA_SHEET: FormulaGroup[] = [
  {
    title: 'Percentages',
    items: [
      { name: 'Percent change', formula: '(new − old) ÷ old × 100' },
      { name: 'Two changes in a row, a% then b%', formula: 'net % = a + b + ab ÷ 100 (use − for a fall)' },
      { name: 'A is r% more than B, so B is less than A by', formula: 'r ÷ (100 + r) × 100 %' },
      { name: 'Fraction pairs', formula: '1/6 = 16.67%, 1/7 = 14.29%, 1/8 = 12.5%, 1/9 = 11.11%, 1/11 = 9.09%, 1/12 = 8.33%' },
    ],
  },
  {
    title: 'Profit and loss',
    items: [
      { name: 'Profit %', formula: 'profit ÷ cost price × 100' },
      { name: 'Selling price', formula: 'cost price × (100 + profit %) ÷ 100' },
      { name: 'After a discount', formula: 'selling price = marked price × (100 − discount %) ÷ 100' },
    ],
  },
  {
    title: 'Interest',
    items: [
      { name: 'Simple interest', formula: 'P × r × t ÷ 100' },
      { name: 'Compound amount', formula: 'P × (1 + r ÷ 100)^t' },
      { name: 'CI − SI over 2 years', formula: 'P × (r ÷ 100)²' },
    ],
  },
  {
    title: 'Ratio, averages, mixtures',
    items: [
      { name: 'Weighted average', formula: 'Σ(value × weight) ÷ Σ weight' },
      { name: 'Alligation', formula: 'cheaper : dearer = (dearer − mean) : (mean − cheaper)' },
      { name: 'Replacing x from V, n times', formula: 'pure left = V × (1 − x ÷ V)^n' },
    ],
  },
  {
    title: 'Time and work',
    items: [
      { name: 'A and B together', formula: 'ab ÷ (a + b) days' },
      { name: 'LCM method', formula: 'total work = LCM of the days; each rate = work ÷ own days' },
      { name: 'Workers, days, hours', formula: 'M1 D1 H1 ÷ W1 = M2 D2 H2 ÷ W2' },
      { name: 'Pipes', formula: 'net rate = filling rates − leaking rates' },
    ],
  },
  {
    title: 'Time, speed, distance',
    items: [
      { name: 'Base rule', formula: 'distance = speed × time' },
      { name: 'km/h to m/s', formula: 'multiply by 5/18' },
      { name: 'Average speed, equal distances', formula: '2ab ÷ (a + b)' },
      { name: 'Relative speed', formula: 'same way a − b; opposite ways a + b' },
      { name: 'Boats, speed b in still water, stream s', formula: 'down b + s; up b − s' },
      { name: 'Trains crossing', formula: 'sum of lengths ÷ relative speed' },
    ],
  },
  {
    title: 'Algebra',
    items: [
      { name: 'Quadratic ax² + bx + c = 0', formula: 'x = (−b ± √(b² − 4ac)) ÷ 2a' },
      { name: 'Sum and product of roots', formula: '−b ÷ a and c ÷ a' },
      { name: 'Cubes', formula: 'a³ ± b³ = (a ± b)(a² ∓ ab + b²)' },
      { name: 'Means of positive numbers', formula: 'AM ≥ GM ≥ HM' },
      { name: 'Logs', formula: 'log mn = log m + log n; log m^n = n log m; log_b a = log a ÷ log b' },
    ],
  },
  {
    title: 'Progressions',
    items: [
      { name: 'AP nth term', formula: 'a + (n − 1)d' },
      { name: 'AP sum', formula: 'n ÷ 2 × (first + last)' },
      { name: 'GP nth term', formula: 'a × r^(n − 1)' },
      { name: 'GP sum, r ≠ 1', formula: 'a(r^n − 1) ÷ (r − 1)' },
      { name: 'GP sum to infinity, |r| < 1', formula: 'a ÷ (1 − r)' },
    ],
  },
  {
    title: 'Geometry',
    items: [
      { name: 'Pythagoras triples', formula: '3-4-5, 5-12-13, 8-15-17, 7-24-25' },
      { name: 'Triangle area', formula: '½ × base × height' },
      { name: 'Heron, with s = half the perimeter', formula: '√(s(s − a)(s − b)(s − c))' },
      { name: 'Equilateral triangle area', formula: '√3 ÷ 4 × a²' },
      { name: 'Circle', formula: 'circumference 2πr; area πr²' },
      { name: 'Sector of angle θ', formula: 'area θ ÷ 360 × πr²' },
      { name: 'Polygon with n sides', formula: 'angle sum (n − 2) × 180°; diagonals n(n − 3) ÷ 2' },
    ],
  },
  {
    title: 'Mensuration',
    items: [
      { name: 'Cuboid', formula: 'volume lbh; surface 2(lb + bh + hl)' },
      { name: 'Cylinder', formula: 'volume πr²h; curved surface 2πrh' },
      { name: 'Cone, l = √(r² + h²)', formula: 'volume 1/3 × πr²h; curved surface πrl' },
      { name: 'Sphere', formula: 'volume 4/3 × πr³; surface 4πr²' },
    ],
  },
  {
    title: 'Number systems',
    items: [
      { name: 'Factors of p^a × q^b', formula: '(a + 1)(b + 1)' },
      { name: 'Two numbers', formula: 'HCF × LCM = their product' },
      { name: 'Zeros at the end of n!', formula: '⌊n/5⌋ + ⌊n/25⌋ + ⌊n/125⌋ + …' },
      { name: 'Divisibility', formula: '3 and 9: digit sum; 11: alternating digit sum' },
    ],
  },
  {
    title: 'Counting, probability, sets',
    items: [
      { name: 'Arrangements', formula: 'nPr = n! ÷ (n − r)!' },
      { name: 'Selections', formula: 'nCr = n! ÷ (r! (n − r)!)' },
      { name: 'Round a table', formula: '(n − 1)!' },
      { name: 'Repeated items', formula: 'n! ÷ (p! q! …)' },
      { name: 'Either event', formula: 'P(A or B) = P(A) + P(B) − P(A and B)' },
      { name: 'Independent events', formula: 'P(A and B) = P(A) × P(B)' },
      { name: 'Two sets', formula: 'n(A ∪ B) = n(A) + n(B) − n(A ∩ B)' },
    ],
  },
];
