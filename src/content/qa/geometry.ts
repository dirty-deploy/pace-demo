// Geometry and mensuration: QA051 to QA059.

import { defineQa } from '../defineQa';
import type { QaQuestion } from '../defineQa';
import { withUnit } from './helpers';

const cm = withUnit('cm');
const sqCm = withUnit('sq cm');
const cubicCm = withUnit('cubic cm');

export const GEOMETRY: QaQuestion[] = [
  // ---- Geometry ----
  defineQa({
    id: 'QA051',
    topic: 'Geometry',
    subType: 'Pythagoras',
    difficulty: 'Easy',
    expectedSeconds: 75,
    kind: 'mcq',
    params: { ladder: 25, base: 7, pulled: 8 },
    prompt: (p) =>
      `A ${p.ladder} m fire-brigade ladder leans against a vertical wall of a Thane high-rise, with its foot on level ground ${p.base} m from the wall. The foot is pulled ${p.pulled} m further from the wall, and the top slides down the wall. By how many metres does the top slide down?`,
    solve: (p) => {
      const before = Math.sqrt(p.ladder ** 2 - p.base ** 2);
      const after = Math.sqrt(p.ladder ** 2 - (p.base + p.pulled) ** 2);
      return before - after;
    },
    key: 4,
    format: withUnit('m'),
    wrong: [8, 20, 5],
    explanation: (p) => {
      const before = Math.sqrt(p.ladder ** 2 - p.base ** 2);
      const after = Math.sqrt(p.ladder ** 2 - (p.base + p.pulled) ** 2);
      return `At first the top is at height √(${p.ladder}² - ${p.base}²) = ${before} m. After the pull, the foot is ${p.base + p.pulled} m out, so the height is √(${p.ladder}² - ${p.base + p.pulled}²) = ${after} m. The top slides down ${before} - ${after} = ${before - after} m, not the same ${p.pulled} m as the foot.`;
    },
    trap: 'Linear change trap',
  }),
  defineQa({
    id: 'QA052',
    topic: 'Geometry',
    subType: 'Regular polygon',
    difficulty: 'Medium',
    expectedSeconds: 100,
    kind: 'tita',
    params: { interior: 150 },
    prompt: (p) =>
      `A floor tile in a Mysuru heritage hotel is a regular polygon with each interior angle equal to ${p.interior} degrees. How many diagonals does this polygon have?`,
    solve: (p) => {
      const sides = 360 / (180 - p.interior);
      return (sides * (sides - 3)) / 2;
    },
    key: 54,
    commonWrong: [108, 66, 12],
    explanation: (p) => {
      const n = 360 / (180 - p.interior);
      return `Each exterior angle is 180 - ${p.interior} = ${180 - p.interior} degrees, so the polygon has 360 / ${180 - p.interior} = ${n} sides. Each vertex connects by diagonal to ${n - 3} others, and each diagonal is shared by two vertices. So the count is ${n} × ${n - 3} / 2 = ${(n * (n - 3)) / 2}.`;
    },
    trap: 'Double counting trap',
  }),
  defineQa({
    id: 'QA053',
    topic: 'Geometry',
    subType: 'Chords',
    difficulty: 'Medium',
    expectedSeconds: 105,
    kind: 'mcq',
    params: { radius: 13, chordA: 24, chordB: 10 },
    prompt: (p) =>
      `A circle has radius ${p.radius} cm. Two parallel chords of lengths ${p.chordA} cm and ${p.chordB} cm lie on opposite sides of its centre. What is the distance between the two chords?`,
    solve: (p) =>
      Math.sqrt(p.radius ** 2 - (p.chordA / 2) ** 2) + Math.sqrt(p.radius ** 2 - (p.chordB / 2) ** 2),
    key: 17,
    format: cm,
    wrong: [7, 12, 26],
    explanation: (p) => {
      const a = Math.sqrt(p.radius ** 2 - (p.chordA / 2) ** 2);
      const b = Math.sqrt(p.radius ** 2 - (p.chordB / 2) ** 2);
      return `The perpendicular from the centre halves a chord. For the ${p.chordA} cm chord the distance from the centre is √(${p.radius}² - ${p.chordA / 2}²) = ${a} cm. For the ${p.chordB} cm chord it is √(${p.radius}² - ${p.chordB / 2}²) = ${b} cm. The chords are on opposite sides of the centre, so we add: ${a} + ${b} = ${a + b} cm.`;
    },
    trap: 'Same side trap',
  }),
  defineQa({
    id: 'QA054',
    topic: 'Geometry',
    subType: 'Similar triangles',
    difficulty: 'Medium',
    expectedSeconds: 110,
    kind: 'mcq',
    params: { upper: 3, lower: 2, area: 125 },
    prompt: (p) =>
      `In triangle PQR, point S lies on side PQ and point T lies on side PR, with ST parallel to QR and PS:SQ = ${p.upper}:${p.lower}. The area of triangle PQR is ${p.area} sq cm. What is the area of quadrilateral SQRT?`,
    solve: (p) => {
      const whole = (p.upper + p.lower) ** 2;
      return (p.area * (whole - p.upper ** 2)) / whole;
    },
    key: 80,
    format: sqCm,
    wrong: [75, 45, 50],
    explanation: (p) => {
      const sideParts = p.upper + p.lower;
      const small = (p.area * p.upper ** 2) / sideParts ** 2;
      return `ST is parallel to QR, so triangle PST is similar to triangle PQR with sides in the ratio ${p.upper}:${sideParts}. Areas go as the square of the sides, ${p.upper ** 2}:${sideParts ** 2}, so triangle PST has area ${p.area} × ${p.upper ** 2}/${sideParts ** 2} = ${small} sq cm. Quadrilateral SQRT is the rest: ${p.area} - ${small} = ${p.area - small} sq cm.`;
    },
    trap: 'Linear scale trap',
  }),
  defineQa({
    id: 'QA055',
    topic: 'Geometry',
    subType: 'Inradius of a right triangle',
    difficulty: 'Hard',
    expectedSeconds: 155,
    kind: 'mcq',
    params: { inradius: 6, hypotenuse: 34 },
    prompt: (p) =>
      `A right-angled triangle has a hypotenuse of ${p.hypotenuse} cm, and a circle of radius ${p.inradius} cm touches all three of its sides from the inside. What is the area of the triangle?`,
    solve: (p) => p.inradius * (p.inradius + p.hypotenuse),
    key: 240,
    format: sqCm,
    wrong: [480, 204, 111],
    explanation: (p) => {
      const legs = 2 * p.inradius + p.hypotenuse;
      const semi = (legs + p.hypotenuse) / 2;
      return `In a right triangle, inradius = (sum of legs - hypotenuse) / 2, so the legs add up to 2 × ${p.inradius} + ${p.hypotenuse} = ${legs} cm. The perimeter is ${legs} + ${p.hypotenuse} = ${legs + p.hypotenuse} cm, so the semi-perimeter is ${semi} cm. Area = inradius × semi-perimeter = ${p.inradius} × ${semi} = ${p.inradius * semi} sq cm. As a check, the legs are 16 and 30.`;
    },
    trap: 'Calculation slip',
  }),
  defineQa({
    id: 'QA056',
    topic: 'Geometry',
    subType: 'Touching circles on a line',
    difficulty: 'Hard',
    expectedSeconds: 200,
    kind: 'tita',
    params: { big: 9, small: 4 },
    prompt: (p) =>
      `Two circles of radii ${p.big} cm and ${p.small} cm touch each other externally, and both touch a straight line L from the same side. A third, smaller circle sits in the gap between them: it touches both circles from the outside and also touches L. What is the radius of the third circle, in cm?`,
    solve: (p) => (p.big * p.small) / (Math.sqrt(p.big) + Math.sqrt(p.small)) ** 2,
    key: 1.44,
    commonWrong: [1.2, 6, 12],
    explanation: (p) => {
      const rootBig = Math.sqrt(p.big);
      const rootSmall = Math.sqrt(p.small);
      const span = 2 * rootBig * rootSmall;
      const root = span / (2 * (rootBig + rootSmall));
      return `Two touching circles of radii a and b, both on one line, have touch points 2√(ab) apart along that line. So the two big circles have touch points ${span} cm apart. With third radius x, this span is also 2√(${p.big}x) + 2√(${p.small}x) = ${2 * (rootBig + rootSmall)}√x. So √x = ${span} / ${2 * (rootBig + rootSmall)} = ${root}, and x = ${(span * span) / (4 * (rootBig + rootSmall) ** 2)} cm.`;
    },
    trap: 'Stopped at the root',
  }),

  // ---- Mensuration ----
  defineQa({
    id: 'QA057',
    topic: 'Mensuration',
    subType: 'Cylinder volume',
    difficulty: 'Easy',
    expectedSeconds: 80,
    kind: 'mcq',
    params: { diameter: 14, depth: 5, rate: 55 },
    prompt: (p) =>
      `A cylindrical water tank in Jodhpur has a diameter of ${p.diameter} m and a depth of ${p.depth} m. A pump fills it at ${p.rate} cubic metres per hour. How many hours does it take to fill the empty tank? Take π = 22/7.`,
    solve: (p) => (22 * (p.diameter / 2) ** 2 * p.depth) / (7 * p.rate),
    key: 14,
    format: withUnit('hours'),
    wrong: [56, 4, 2],
    explanation: (p) => {
      const r = p.diameter / 2;
      const volume = (22 * r * r * p.depth) / 7;
      return `The radius is half the diameter, so ${r} m. Volume = 22/7 × ${r} × ${r} × ${p.depth} = ${volume} cubic metres. At ${p.rate} cubic metres an hour, this takes ${volume} / ${p.rate} = ${volume / p.rate} hours.`;
    },
    trap: 'Diameter as radius trap',
  }),
  defineQa({
    id: 'QA058',
    topic: 'Mensuration',
    subType: 'Recasting solids',
    difficulty: 'Medium',
    expectedSeconds: 115,
    kind: 'tita',
    params: { r: 7, h: 28, ball: 3.5 },
    prompt: (p) =>
      `A solid lead cylinder of radius ${p.r} cm and height ${p.h} cm is melted at a Kanpur foundry and recast, with no wastage, into solid spheres of radius ${p.ball} cm. How many spheres are made?`,
    solve: (p) => (3 * p.r * p.r * p.h) / (4 * p.ball * p.ball * p.ball),
    key: 24,
    commonWrong: [32, 3, 48],
    explanation: (p) =>
      `Number of spheres = cylinder volume / sphere volume, and π cancels. That is (${p.r}² × ${p.h}) / (4/3 × ${p.ball}³). Since ${p.r} = 2 × ${p.ball}, this simplifies to 3 × ${(p.r / p.ball) ** 2} × ${p.h / p.ball} / 4 = ${(3 * p.r * p.r * p.h) / (4 * p.ball * p.ball * p.ball)}.`,
    trap: 'Formula slip',
  }),
  defineQa({
    id: 'QA059',
    topic: 'Mensuration',
    subType: 'Sector rolled into a cone',
    difficulty: 'Hard',
    expectedSeconds: 170,
    kind: 'mcq',
    params: { slant: 35, angle: 216 },
    prompt: (p) =>
      `A Mumbai street vendor cuts a sector of radius ${p.slant} cm and central angle ${p.angle} degrees from a stiff sheet, and joins its two straight edges with no overlap to form an open cone. What is the volume of this cone? Take π = 22/7.`,
    solve: (p) => {
      const r = (p.slant * p.angle) / 360;
      const h = Math.sqrt(p.slant ** 2 - r ** 2);
      return (22 * r * r * h) / (7 * 3);
    },
    key: 12936,
    format: cubicCm,
    wrong: [16170, 38808, 2310],
    explanation: (p) => {
      const r = (p.slant * p.angle) / 360;
      const h = Math.sqrt(p.slant ** 2 - r ** 2);
      return `The sector's arc becomes the base circle, so 2πr = ${p.angle}/360 × 2π × ${p.slant}, which gives r = ${r} cm. The sector radius becomes the slant height, so the height is √(${p.slant}² - ${r}²) = ${h} cm. Volume = 1/3 × 22/7 × ${r} × ${r} × ${h} = ${(22 * r * r * h) / 21} cubic cm.`;
    },
    trap: 'Slant as height trap',
  }),
];
