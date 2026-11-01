import { describe, expect, it } from 'vitest';
import { QA_BANK } from '../src/content/qa';

/**
 * Independent check of the QA answer keys.
 *
 * Every solver below was written from the rendered prompt alone, without sight of
 * the author's solve(), key, or explanation. They prefer brute force, simulation
 * or exact arithmetic to the textbook formula, so that an error in one approach is
 * not repeated in the other. The trailing comment on each line is the value worked
 * out by hand before any comparison with the bank.
 *
 * Do not edit a solver to make it agree with a key. If one disagrees, work the
 * question by hand and decide which is wrong.
 */

// --- solvers begin
const ints = (lo: number, hi: number) => Array.from({ length: Math.max(hi - lo + 1, 0) }, (_, i) => lo + i);
const total = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const factorial = (n: number) => ints(2, n).reduce((f, i) => f * BigInt(i), 1n);
const gcd = (a: bigint, b: bigint): bigint => (b === 0n ? (a < 0n ? -a : a) : gcd(b, a % b));

/** The one integer in [lo, hi] that satisfies p. Throws on none or several, so a search also proves uniqueness. */
const only = (lo: number, hi: number, p: (n: number) => boolean) => {
  const hits: number[] = [];
  for (let n = lo; n <= hi; n++) if (p(n)) hits.push(n);
  if (hits.length !== 1) throw new Error(`expected one solution in ${lo}..${hi}, found ${hits.length}`);
  return hits[0];
};

const SOLVERS: Record<string, () => number> = {
  // Percentages
  QA001: () => (((480 * 120) / 100) * 75) / 100, // 432
  QA002: () => 27000 - only(1, 27000, (w) => w * 1125 === 27000 * 1000), // 3000
  QA003: () => only(1, 100000, (n) => n * 80 * 95 * (60 - 40) === 380 * 100 ** 3), // 2500
  QA004: () => (only(1, 1000000, (t) => (t * 120 * 125) / 10000 - t === 27000) * 120) / 100, // 64800
  QA005: () => 100 - (100 * 100 * 1.1) / 125, // 12
  QA006: () => {
    const tax = (x: number) => (Math.min(Math.max(x - 300000, 0), 300000) * 5) / 100 + (Math.max(x - 600000, 0) * 20) / 100;
    return only(600001, 5000000, (x) => Math.abs(tax((x * 6) / 5) - tax(x) * 1.6) < 1e-6);
  }, // 787500

  // Profit and loss
  QA007: () => (800 * 140 * 85) / 10000 - 800, // 152
  QA008: () => {
    const costPerGram = 1;
    const received = 0.9 * 1000 * costPerGram; // charged for a shown 1000 g
    const costOfRice = 750 * costPerGram; // what is really handed over
    return ((received - costOfRice) / costOfRice) * 100;
  }, // 20
  QA009: () => (2 * only(1, 34999, (c) => 120 * c === 90 * (35000 - c)) * 120) / 100 - 35000, // 1000
  QA010: () => only(1, 100000, (t) => 4 * t * 100 === 5 * 2000 * 120), // 3000
  QA011: () => {
    const list = only(1, 100000, (l) => l * (95 - 85) === 90000);
    return only(1, list, (c) => 95 * list - 100 * c === 3 * (85 * list - 100 * c));
  }, // 7200

  // Ratio and proportion
  QA012: () =>
    only(1, 11, (m) => {
      const joseph = 120000 * (12 - m);
      return 4 * joseph === 60000 * 12 + 90000 * 8 + joseph;
    }), // 8
  QA013: () => {
    const c = only(1, 300, (n) => (n * 5) % 3 === 0 && 7 * (n + 6) === 6 * ((n * 5) / 3 - 2));
    return c + (c * 5) / 3;
  }, // 48
  QA014: () => (126000 + ((75 - 40) * (162000 - 126000)) / (55 - 40)) / 75, // 2800
  QA015: () => {
    const lari = (d: number) => (5 * d) / 2 - (d - 2100);
    const d = only(2101, 100000, (x) => lari(x) > 0 && 4 * (x - 2100) === x + lari(x));
    return lari(d);
  }, // 12600

  // Time and work (job size picked so that rates are whole numbers)
  QA016: () => {
    let left = 60 - 8 * (3 + 2);
    let hours = 0;
    while (left > 0) {
      left -= 2;
      hours++;
    }
    return hours;
  }, // 10
  QA017: () => only(0, 100, (x) => (24 + x) * 10 === 24 * 15), // 12
  QA018: () => {
    const tank = 3600;
    let filled = 0;
    for (let minute = 0; minute < 300; minute++) filled += 5 + 3 - 2;
    let extra = 0;
    while (filled < tank) {
      filled += 5 + 3;
      extra++;
    }
    return extra / 60;
  }, // 3.75
  QA019: () => {
    let left = 24;
    for (let day = 0; ; day++) {
      const rate = day % 2 === 0 ? 3 : 2;
      if (left <= rate) return day + left / rate;
      left -= rate;
    }
  }, // 9.5
  QA020: () => only(1, 60, (T) => total(ints(1, T).map((day) => (day <= T - 4 ? 3 : 0) + (day <= T - 6 ? 2 : 0) + 1)) === 60), // 14
  QA021: () => {
    const done = 40 * 10 * 8;
    return only(0, 200, (x) => (40 + x) * 20 * 10 === done * 3);
  }, // 8

  // Time speed distance
  QA022: () => (180 + 180) / (180 / 30 + 1 + 180 / 60), // 36
  QA023: () => (only(1, 200, (v) => 27 * v - 12 * v === 300) * 18) / 5, // 72
  QA024: () => only(1, 999, (h) => Math.abs(24 / (10 + h / 100) + 24 / (10 - h / 100) - 5) < 1e-9) / 100, // 2
  QA025: () => {
    const points = new Set<number>();
    for (let t = 1; t <= 3200; t++) {
      const aarav = (5 * t) % 400;
      const diya = (400 - (3 * t) % 400) % 400;
      if (aarav === diya) points.add(aarav);
    }
    return points.size;
  }, // 8
  QA026: () => {
    // First meeting at 24 and 36 km gives speeds 2 and 3. Positions fold at the road ends.
    const fold = (x: number) => (x % 120 <= 60 ? x % 120 : 120 - (x % 120));
    let meetings = 0;
    let previous = -60;
    for (let t = 1; t < 200; t++) {
      const gap = fold(2 * t) - (60 - fold(3 * t));
      if (gap === 0 || gap * previous < 0) meetings++;
      if (meetings === 2) return fold(2 * t);
      previous = gap;
    }
    throw new Error('no second meeting');
  }, // 48

  // Simple and compound interest
  QA027: () => 40000 * 1.1 * 1.1 - 40000 - (40000 * 10 * 2) / 100, // 400
  QA028: () => only(1, 50, (y) => Math.abs((8 ** (1 / 9)) ** y - 4) < 1e-9), // 6
  QA029: () =>
    only(1, 33100, (p) => {
      let owed = 33100;
      for (let year = 0; year < 3; year++) owed = owed * 1.1 - p;
      return Math.abs(owed) < 1e-6;
    }), // 13310

  // Averages
  QA030: () => {
    const others = 7 * 60; // any seven weights give the same answer
    return only(1, 300, (w) => (others + w) / 8 === (others + 58) / 8 + 1.5);
  }, // 70
  QA031: () => (62 * 50 - 48 - 53 + 84 + 35) / 50, // 62.36
  QA032: () => (9 * 50 + only(0, 100, (m) => (21 * 80 - m) / 20 === 80.5)) / 10, // 52

  // Mixtures and alligation
  QA033: () => only(1, 1000, (x) => 60 * 300 + 420 * x === 340 * (60 + x)), // 30
  QA034: () => {
    let milk = 40;
    for (let round = 0; round < 2; round++) milk -= (8 * milk) / 40;
    return milk;
  }, // 25.6
  QA035: () => only(1, 119, (x) => 120 * 15 + 30 * 40 === 25 * (120 - x + 30)), // 30

  // Equations
  QA036: () => only(1, 100, (n) => (2 * (138 - 2 * n)) / 3 + 3 * n === 162), // 42
  QA037: () => {
    const alpha = ints(-50, 50).find((a) => a * a + (7 - a) * (7 - a) === 25);
    if (alpha === undefined) throw new Error('no root');
    return alpha * (7 - alpha);
  }, // 12
  QA038: () => total(ints(1, 50).map((twenties) => ints(1, 20).filter((fifties) => 20 * twenties + 50 * fifties === 1000).length)), // 9
  QA039: () => only(1, 100000, (x) => Math.abs(Math.log(x) * (1 / Math.log(2) + 1 / Math.log(4) + 1 / Math.log(16)) - 7) < 1e-9), // 16
  QA040: () => ints(1, 20000).filter((x) => x > 12 && (12 * x) % (x - 12) === 0).length, // 15

  // Inequalities
  QA041: () => ints(-1000, 1000).filter((x) => x * x - 9 * x + 14 < 0).length, // 4
  QA042: () => total(ints(-1000, 1000).filter((x) => Math.abs(2 * x - 7) <= 9)), // 35
  QA043: () => {
    let best = 0;
    for (let a = 1; a <= 118; a++) for (let b = 1; b <= 119 - a; b++) best = Math.max(best, a * a * b * (120 - a - b));
    return best / 10000; // grid in tenths, so a + b + c = 120 units
  }, // 324

  // Functions
  QA044: () => {
    const f = (x: number) => 2 * x + 3;
    const g = (x: number) => x * x - 1;
    return f(g(3)) - g(f(1));
  }, // -5
  QA045: () => {
    const f = [0, 3];
    for (let n = 2; n <= 10; n++) {
      const x = Math.floor(n / 2);
      f[n] = f[x] + f[n - x] + 2 * x * (n - x);
    }
    return f[10];
  }, // 120
  QA046: () => {
    let n = 2n;
    let d = 1n;
    for (let i = 1; i < 2026; i++) {
      const top = d + n;
      const bottom = d - n;
      const g = gcd(top, bottom);
      n = top / g;
      d = bottom / g;
    }
    return Number(n) / Number(d);
  }, // -3

  // Progressions
  QA047: () => total(ints(0, 19).map((w) => 1200 + 50 * w)), // 33500
  QA048: () => {
    let fresh = 3;
    let running = 3;
    let day = 1;
    while (running <= 1000) {
      fresh *= 3;
      running += fresh;
      day++;
    }
    return day;
  }, // 6
  QA049: () => 7 + only(1, 6999, (m) => Math.abs((8 - m / 1000) * (12 + m / 1000) - 64) < 1e-9) / 1000, // 11
  QA050: () => total(ints(100, 999).filter((n) => n % 5 === 2 && n % 7 === 3)), // 14547

  // Geometry
  QA051: () => Math.sqrt(25 ** 2 - 7 ** 2) - Math.sqrt(25 ** 2 - 15 ** 2), // 4
  QA052: () => {
    const sides = only(3, 1000, (n) => (n - 2) * 180 === 150 * n);
    let diagonals = 0;
    for (let i = 0; i < sides; i++) {
      for (let j = i + 1; j < sides; j++) if (j - i !== 1 && j - i !== sides - 1) diagonals++;
    }
    return diagonals;
  }, // 54
  QA053: () => {
    const above = Math.sqrt(13 ** 2 - 12 ** 2);
    const below = -Math.sqrt(13 ** 2 - 5 ** 2);
    return above - below;
  }, // 17
  QA054: () => {
    // P at the origin, Q(5,0), R(0,50) has area 125. S and T are 3/5 of the way along.
    const corners = [[3, 0], [5, 0], [0, 50], [0, 30]];
    let twice = 0;
    corners.forEach(([x1, y1], i) => {
      const [x2, y2] = corners[(i + 1) % 4];
      twice += x1 * y2 - x2 * y1;
    });
    return Math.abs(twice) / 2;
  }, // 80
  QA055: () => {
    // Right angle at the origin, legs on the axes, so the incentre is (6,6). Its distance to x/a + y/b = 1 must be 6.
    const leg = (m: number) => Math.sqrt(34 ** 2 - (m / 1000) ** 2);
    const m = only(1000, 24000, (k) => Math.abs(((k / 1000) * leg(k) - 6 * (k / 1000) - 6 * leg(k)) / 34 - 6) < 1e-9);
    return ((m / 1000) * leg(m)) / 2;
  }, // 240
  QA056: () => {
    // L is the x-axis, centres (0,9) and (x2,4). Bisect on the third radius.
    const x2 = Math.sqrt(13 ** 2 - 5 ** 2);
    const excess = (r: number) => Math.hypot(x2 - Math.sqrt((9 + r) ** 2 - (9 - r) ** 2), 4 - r) - (4 + r);
    let lo = 0.001;
    let hi = 3.999;
    for (let i = 0; i < 100; i++) {
      const mid = (lo + hi) / 2;
      if (excess(mid) > 0) lo = mid;
      else hi = mid;
    }
    return lo;
  }, // 1.44

  // Mensuration
  QA057: () => (22 * 7 * 7 * 5) / (7 * 55), // 14
  QA058: () => only(1, 1000, (n) => 3 * 14 * 14 * 56 === n * 4 * 7 * 7 * 7), // 24 (lengths in half-cm)
  QA059: () => {
    const base = (35 * 216) / 360;
    return (22 * base * base * Math.sqrt(35 ** 2 - base ** 2)) / (3 * 7);
  }, // 12936

  // Number systems
  QA060: () => ints(1, 600).filter((t) => t % 12 === 0 && t % 18 === 0 && t % 30 === 0).length, // 3
  QA061: () => /0*$/.exec(factorial(250).toString())?.[0].length ?? 0, // 62
  QA062: () => Number(7n ** 2026n % 25n), // 24
  QA063: () => ints(1, 1800).filter((s) => 1800 % s === 0 && s % 6 === 0).length, // 18
  QA064: () => {
    const n = factorial(150);
    let k = 0;
    while (n % 12n ** BigInt(k + 1) === 0n) k++;
    return k;
  }, // 72
  QA065: () => total(ints(1, 400).map((a) => ints(1, a - 1).filter((b) => a * a - b * b === 720).length)), // 9

  // Permutations and combinations
  QA066: () => {
    const seen = new Set<string>();
    const place = (left: string, built: string) => {
      if (left === '') seen.add(built);
      for (let i = 0; i < left.length; i++) place(left.slice(0, i) + left.slice(i + 1), built + left[i]);
    };
    place('MUMBAI', '');
    return seen.size;
  }, // 360
  QA067: () =>
    ints(0, 2 ** 11 - 1).filter((mask) => {
      const picked = ints(0, 10).filter((person) => (mask >> person) & 1);
      return picked.length === 4 && picked.filter((person) => person < 5).length >= 2;
    }).length, // 215
  QA068: () => {
    let ways = 0;
    for (const a of ints(1, 4)) for (const b of ints(1, 4)) for (const c of ints(1, 4)) for (const d of ints(1, 4)) if (a + b + c + d === 10) ways++;
    return ways;
  }, // 44

  // Probability
  QA069: () => total(ints(1, 6).map((a) => ints(1, 6).filter((b) => Number.isInteger(Math.sqrt(a + b))).length)) / 36, // 7/36
  QA070: () => {
    const bag = [...'rrrrr', ...'bbbb', ...'ggg'];
    let hits = 0;
    let draws = 0;
    for (let i = 0; i < 12; i++) {
      for (let j = i + 1; j < 12; j++) {
        for (let k = j + 1; k < 12; k++) {
          draws++;
          if (new Set([bag[i], bag[j], bag[k]]).size === 3) hits++;
        }
      }
    }
    return hits / draws;
  }, // 3/11
  QA071: () => {
    const lineA = (60000 * 2) / 100;
    const lineB = (40000 * 12) / 100;
    return lineB / (lineA + lineB);
  }, // 0.8

  // Set theory
  QA072: () => {
    const [cf, fk, ck] = [40 - 15, 30 - 15, 35 - 15];
    const cricketOnly = only(0, 120, (x) => x + cf + ck + 15 === 120);
    const footballOnly = only(0, 90, (x) => x + cf + fk + 15 === 90);
    const kabaddiOnly = only(0, 70, (x) => x + fk + ck + 15 === 70);
    if (cricketOnly + footballOnly + kabaddiOnly + cf + fk + ck + 15 > 200) throw new Error('over 200 students');
    return cricketOnly + footballOnly + kabaddiOnly;
  }, // 115
  QA073: () => {
    // Exact search over who lacks which language: 10, 15, 20 and 25 lacks must all be placed.
    // dp holds the most engineers those lacks can touch. Everyone else speaks all four.
    const index = (h: number, k: number, ta: number, te: number) => ((h * 16 + k) * 21 + ta) * 26 + te;
    const dp = new Array<number>(index(10, 15, 20, 25) + 1).fill(-1);
    dp[0] = 0;
    const lacks = ints(1, 15).map((m) => [m & 1, (m >> 1) & 1, (m >> 2) & 1, (m >> 3) & 1]);
    for (let h = 0; h <= 10; h++) {
      for (let k = 0; k <= 15; k++) {
        for (let ta = 0; ta <= 20; ta++) {
          for (let te = 0; te <= 25; te++) {
            const here = dp[index(h, k, ta, te)];
            if (here < 0) continue;
            for (const [a, b, c, d] of lacks) {
              if (h + a > 10 || k + b > 15 || ta + c > 20 || te + d > 25) continue;
              const next = index(h + a, k + b, ta + c, te + d);
              dp[next] = Math.max(dp[next], here + 1);
            }
          }
        }
      }
    }
    return 100 - dp[index(10, 15, 20, 25)];
  }, // 30
};
// --- solvers end

const IDS = ints(1, 73).map((n) => `QA${String(n).padStart(3, '0')}`);
const question = (id: string) => {
  const q = QA_BANK.find((x) => x.id === id);
  if (!q) throw new Error(`${id} is missing from QA_BANK`);
  return q;
};

/** Reads the number out of a rendered answer such as "₹1,000", "8 months", "Day 6" or "-1/2". */
const shownValue = (text: string) => {
  const match = text.replace(/[₹,]/g, '').match(/-?\d+(?:\.\d+)?(?:\/\d+)?/);
  if (!match) throw new Error(`no number in "${text}"`);
  const [top, bottom] = match[0].split('/');
  return Number(top) / (bottom ? Number(bottom) : 1);
};

const same = (a: number, b: number) => Math.abs(a - b) <= 1e-9;

describe('QA keys against independent solutions', () => {
  it.each(IDS)('%s: the key equals the independent value', (id) => {
    expect(SOLVERS[id]).toBeDefined();
    const value = SOLVERS[id]();
    expect(Math.abs(value - question(id).key)).toBeLessThanOrEqual(1e-9);
  });

  it.each(IDS)('%s: the answer the student sees equals the independent value', (id) => {
    const q = question(id);
    const value = SOLVERS[id]();
    if (q.kind === 'tita') {
      expect(same(Number(q.answer), value)).toBe(true);
    } else {
      expect(same(shownValue(q.options[q.answerIndex]), value)).toBe(true);
      expect(q.options.filter((option) => same(shownValue(option), value))).toHaveLength(1);
    }
  });
});
