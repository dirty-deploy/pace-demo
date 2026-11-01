// Small formatting and maths helpers shared by the QA question files.

/** Indian digit grouping: 1250000 becomes "12,50,000". Keeps any decimal part as it is. */
export function grouped(n: number): string {
  const [whole, decimals] = String(Math.abs(n)).split('.');
  const lastThree = whole.slice(-3);
  const rest = whole.slice(0, -3);
  const body = rest ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${lastThree}` : lastThree;
  return `${n < 0 ? '-' : ''}${body}${decimals ? `.${decimals}` : ''}`;
}

export const inr = (n: number): string => `₹${grouped(n)}`;

export const pct = (n: number): string => `${n}%`;

export const withUnit =
  (unit: string) =>
  (n: number): string =>
    `${n} ${unit}`;

/**
 * Shows a value as a reduced fraction, so the option on screen truly equals the number.
 * Throws if the value is not a fraction with a small denominator.
 */
export function fraction(n: number): string {
  for (let den = 1; den <= 5000; den += 1) {
    const num = Math.round(n * den);
    if (num / den === n) return den === 1 ? String(num) : `${num}/${den}`;
  }
  throw new Error(`No exact fraction found for ${n}`);
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

export function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

export function factorial(n: number): number {
  let out = 1;
  for (let i = 2; i <= n; i += 1) out *= i;
  return out;
}

/** Number of ways to choose r items from n. */
export function nCr(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  let out = 1;
  for (let i = 1; i <= r; i += 1) out = (out * (n - r + i)) / i;
  return out;
}

/** Exponent of a prime in n factorial. */
export function primePowerInFactorial(n: number, prime: number): number {
  let total = 0;
  for (let q = Math.floor(n / prime); q > 0; q = Math.floor(q / prime)) total += q;
  return total;
}
