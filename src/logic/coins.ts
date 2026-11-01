export type EarnAction = 'mock' | 'sectional' | 'daily' | 'lesson' | 'review' | 'streak';
export type SpendItem = 'shield' | 'mock-unlock' | 'formula-sheet';

export const EARN_RULES: Record<EarnAction, { coins: number; dailyCap: number; label: string }> = {
  mock: { coins: 50, dailyCap: 1, label: 'Full mock finished' },
  sectional: { coins: 20, dailyCap: 2, label: 'Sectional test finished' },
  daily: { coins: 10, dailyCap: 2, label: 'Daily set finished' },
  lesson: { coins: 5, dailyCap: 3, label: 'Lesson finished' },
  review: { coins: 10, dailyCap: 2, label: 'Review completed' },
  streak: { coins: 2, dailyCap: 1, label: 'Streak day' },
};

export const SPEND_ITEMS: Record<SpendItem, { coins: number; label: string; detail: string }> = {
  shield: { coins: 40, label: 'Streak shield', detail: 'Covers one missed day, so your streak carries on.' },
  'mock-unlock': { coins: 100, label: 'Open Mock 2 early', detail: 'Mock 2 opens after you finish Mock 1. This opens it now.' },
  'formula-sheet': { coins: 30, label: 'Printable formula sheet', detail: 'One page of the formulas from the QA lessons, ready to print.' },
};

export type CoinEntry = {
  id: string;
  at: number;
  dayISO: string;
  delta: number;
  action: EarnAction | SpendItem | 'meridian';
  label: string;
};

export const balanceOf = (ledger: CoinEntry[]) => ledger.reduce((a, e) => a + e.delta, 0);

export function earnedToday(ledger: CoinEntry[], action: EarnAction, dayISO: string): number {
  return ledger.filter((e) => e.action === action && e.dayISO === dayISO).length;
}

/** Returns the new entry, or null when today's cap for this action is already reached. */
export function earn(ledger: CoinEntry[], action: EarnAction, at: number, dayISO: string): CoinEntry | null {
  const rule = EARN_RULES[action];
  if (earnedToday(ledger, action, dayISO) >= rule.dailyCap) return null;
  return { id: `c${at}-${ledger.length}`, at, dayISO, delta: rule.coins, action, label: rule.label };
}

/** Returns the new entry, or null when the balance is too low. */
export function spend(ledger: CoinEntry[], item: SpendItem, at: number, dayISO: string): CoinEntry | null {
  const { coins, label } = SPEND_ITEMS[item];
  if (balanceOf(ledger) < coins) return null;
  return { id: `c${at}-${ledger.length}`, at, dayISO, delta: -coins, action: item, label };
}

export const COINS_PER_STEP = 100;
export const RUPEES_PER_STEP = 50;
export const MAX_DISCOUNT_SHARE = 0.3;

export type Discount = { rupees: number; coinsUsed: number; capRupees: number; finalPrice: number; capped: boolean };

/** 100 coins = ₹50, only in whole steps, never above 30% of the course price. */
export function discountFor(coins: number, price: number): Discount {
  const capRupees = Math.floor(price * MAX_DISCOUNT_SHARE);
  const stepsByCoins = Math.floor(Math.max(0, coins) / COINS_PER_STEP);
  const stepsByCap = Math.floor(capRupees / RUPEES_PER_STEP);
  const steps = Math.min(stepsByCoins, stepsByCap);
  const rupees = steps * RUPEES_PER_STEP;
  return { rupees, coinsUsed: steps * COINS_PER_STEP, capRupees, finalPrice: price - rupees, capped: stepsByCoins > stepsByCap };
}

/** Demo coupon, for example MER-4K2Q-9XPL. The same inputs give the same code. */
export function couponCode(seed: string): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let h = 2166136261;
  let out = '';
  for (let i = 0; i < 8; i++) {
    for (const c of `${seed}:${i}`) {
      h ^= c.charCodeAt(0);
      h = Math.imul(h, 16777619);
    }
    out += alphabet[(h >>> 0) % alphabet.length];
  }
  return `MER-${out.slice(0, 4)}-${out.slice(4)}`;
}
