import { useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Coins, History, Printer } from 'lucide-react';
import { Button, Empty, Stat, Tag, toast } from '../components/ui';
import { FORMULA_SHEET } from '../content/formulaSheet';
import { balanceOf, COINS_PER_STEP, couponCode, discountFor, EARN_RULES, earnedToday, MAX_DISCOUNT_SHARE, RUPEES_PER_STEP, SPEND_ITEMS, type EarnAction, type SpendItem } from '../logic/coins';
import { parseISO, shortDate } from '../logic/dates';
import { buy, newId, todayISO } from '../state/actions';
import { getState, update, useApp } from '../state/store';
import '../styles/rewards.css';

type Course = { id: string; name: string; price: number };

/** Sample catalogue. These are not real prices. */
const COURSES: Course[] = [
  { id: 'cat-foundation', name: 'CAT Foundation', price: 14999 },
  { id: 'mock-series', name: 'Mock Test Series', price: 2499 },
  { id: 'dilr-masterclass', name: 'DILR Masterclass', price: 4999 },
];

const HISTORY_STEP = 8;

const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const signed = (n: number) => `${n > 0 ? '+' : '−'}${Math.abs(n)}`;

/** Spends the coins and stores a demo coupon. Rechecks the balance inside the update. */
function redeem(course: Course, coins: number): string | null {
  let code: string | null = null;
  update((s) => {
    const d = discountFor(Math.min(coins, balanceOf(s.coins)), course.price);
    if (d.rupees <= 0) return s;
    const at = Date.now();
    code = couponCode(`${course.id}:${at}:${s.coins.length}`);
    const entry = { id: newId('c'), at, dayISO: todayISO(), delta: -d.coinsUsed, action: 'meridian' as const, label: `Meridian coupon: ${course.name}` };
    const coupon = { code, course: course.name, rupees: d.rupees, coins: d.coinsUsed, at };
    return { ...s, coins: [...s.coins, entry], purchases: { ...s.purchases, coupons: [...s.purchases.coupons, coupon] } };
  });
  return code;
}

function SpendCard({ item, status, children }: { item: SpendItem; status: ReactNode; children: ReactNode }) {
  const { label, detail, coins } = SPEND_ITEMS[item];
  return (
    <li className="card rw-spend">
      <div className="row-between">
        <h3 className="rw-spend-title">{label}</h3>
        <Tag>{coins} coins</Tag>
      </div>
      <p className="muted small">{detail}</p>
      <p className="small rw-spend-status">{status}</p>
      {children}
    </li>
  );
}

function SpendInPace({ balance, onSheet, sheetOpen }: { balance: number; onSheet: (open: boolean) => void; sheetOpen: boolean }) {
  const purchases = useApp((s) => s.purchases);
  const mock1Done = useApp((s) => s.attempts.some((a) => a.testId === 'mock-1'));

  const short = (item: SpendItem) => Math.max(0, SPEND_ITEMS[item].coins - balance);
  const shortLine = (item: SpendItem) => `You need ${short(item)} more coins for this.`;

  const buyShield = () => {
    const before = getState().purchases.shields;
    if (!buy('shield')) return;
    // buy() runs the shield check at once, so a missed yesterday is covered straight away.
    toast(getState().purchases.shields > before ? 'Streak shield added.' : 'Your shield covered yesterday, so your streak carries on.');
  };

  const mockOpen = purchases.mockUnlocked || mock1Done;
  const mockLine = mock1Done ? (
    <>
      You've finished Mock 1, so Mock 2 is already open. <Link to="/practice/tests">See full mocks</Link>
    </>
  ) : purchases.mockUnlocked ? (
    <>
      You've opened Mock 2. <Link to="/practice/tests">See full mocks</Link>
    </>
  ) : short('mock-unlock') ? (
    shortLine('mock-unlock')
  ) : (
    'Mock 2 is closed until you finish Mock 1.'
  );

  return (
    <section className="stack" aria-labelledby="rw-spend-title">
      <h2 className="section-title" id="rw-spend-title">
        Spend in Pace
      </h2>
      <ul className="rw-spend-grid">
        <SpendCard
          item="shield"
          status={short('shield') ? shortLine('shield') : purchases.shields ? `You hold ${purchases.shields}. A shield is used by itself the day after a missed day.` : 'A shield is used by itself the day after a missed day.'}
        >
          <Button variant="reward" disabled={!!short('shield')} onClick={buyShield}>
            Buy for {SPEND_ITEMS.shield.coins} coins
          </Button>
        </SpendCard>
        <SpendCard item="mock-unlock" status={mockLine}>
          <Button
            variant="reward"
            disabled={mockOpen || !!short('mock-unlock')}
            onClick={() => {
              if (buy('mock-unlock')) toast('Mock 2 is open. You can start it from Tests.');
            }}
          >
            Buy for {SPEND_ITEMS['mock-unlock'].coins} coins
          </Button>
        </SpendCard>
        <SpendCard item="formula-sheet" status={purchases.formulaSheet ? 'This is yours. It stays here to open and print whenever you like.' : short('formula-sheet') ? shortLine('formula-sheet') : 'You can print it as often as you like after buying.'}>
          {purchases.formulaSheet ? (
            <Button aria-expanded={sheetOpen} aria-controls="rw-sheet" onClick={() => onSheet(!sheetOpen)}>
              {sheetOpen ? 'Hide sheet' : 'Open sheet'}
            </Button>
          ) : (
            <Button
              variant="reward"
              disabled={!!short('formula-sheet')}
              onClick={() => {
                if (buy('formula-sheet')) onSheet(true);
              }}
            >
              Buy for {SPEND_ITEMS['formula-sheet'].coins} coins
            </Button>
          )}
        </SpendCard>
      </ul>
    </section>
  );
}

function FormulaSheet() {
  return (
    <section className="card rw-sheet" id="rw-sheet" aria-labelledby="rw-sheet-title">
      <div className="row-between">
        <div>
          <h2 className="section-title" id="rw-sheet-title">
            Formula sheet
          </h2>
          <p className="muted small">Pace QA formulas. Check the conditions in each one before you use it.</p>
        </div>
        <Button className="no-print" icon={Printer} onClick={() => window.print()}>
          Print
        </Button>
      </div>
      <div className="rw-sheet-grid">
        {FORMULA_SHEET.map((group) => (
          <div className="rw-sheet-group" key={group.title}>
            <h3>{group.title}</h3>
            <dl>
              {group.items.map((f) => (
                <div key={f.name}>
                  <dt>{f.name}</dt>
                  <dd>{f.formula}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}

function Meridian({ balance }: { balance: number }) {
  const coupons = useApp((s) => s.purchases.coupons);
  const [courseId, setCourseId] = useState(COURSES[0].id);
  // Null until the student types, so the box follows the most they can use.
  const [typed, setTyped] = useState<string | null>(null);
  const course = COURSES.find((c) => c.id === courseId) as Course;
  const most = discountFor(balance, course.price).coinsUsed;
  const asked = typed === null ? most : Math.max(0, Math.floor(Number(typed)) || 0);
  const d = discountFor(Math.min(asked, balance), course.price);

  const notes: string[] = [];
  if (asked > balance) notes.push(`You have ${balance} coins.`);
  if (d.capped && asked >= d.coinsUsed + COINS_PER_STEP) notes.push(`The limit on this course is ${rupees(d.capRupees)}.`);
  else if (d.rupees > 0 && Math.min(asked, balance) !== d.coinsUsed) notes.push(`Coins count in steps of ${COINS_PER_STEP}.`);

  const result =
    balance < COINS_PER_STEP
      ? `You need ${COINS_PER_STEP} coins for ${rupees(RUPEES_PER_STEP)} off. You have ${balance}.`
      : d.rupees <= 0
        ? `Use at least ${COINS_PER_STEP} coins for a discount.`
        : `${d.coinsUsed} coins take ${rupees(d.rupees)} off ${course.name}. You would pay ${rupees(d.finalPrice)}. ${notes.join(' ')}`.trim();

  const generate = () => {
    const code = redeem(course, asked);
    if (!code) return;
    setTyped(null);
    toast(`Demo coupon ${code} added below.`);
  };

  return (
    <section className="card stack" aria-labelledby="rw-meridian-title">
      <div className="row-between">
        <h2 className="section-title" id="rw-meridian-title">
          Meridian Learning discount
        </h2>
        <Tag>Sample prices</Tag>
      </div>
      <p className="muted">
        Unused coins can become money off a Meridian Learning course: {COINS_PER_STEP} coins = {rupees(RUPEES_PER_STEP)} off, up to {Math.round(MAX_DISCOUNT_SHARE * 100)}% of the course price. The three courses and their prices below are samples.
      </p>
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          generate();
        }}
      >
        <div className="rw-form-grid">
          <label className="field">
            <span>Course</span>
            <select className="select" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              {COURSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {rupees(c.price)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Coins to use</span>
            <input className="input num" type="number" inputMode="numeric" min={0} step={COINS_PER_STEP} value={typed ?? String(most)} onChange={(e) => setTyped(e.target.value)} />
            <small>Your balance is {balance} coins.</small>
          </label>
        </div>
        <p className="rw-result" aria-live="polite">
          {result}
        </p>
        <div>
          <Button variant="reward" type="submit" disabled={d.rupees <= 0}>
            Get a demo coupon
          </Button>
        </div>
      </form>
      <p className="muted small">Proposal for after the acquisition. Illustrative: no real coupon.</p>
      {coupons.length > 0 && (
        <div className="stack rw-coupons">
          <h3 className="rw-spend-title">Your demo coupons</h3>
          <ul>
            {[...coupons]
              .sort((a, b) => b.at - a.at)
              .map((c) => (
                <li key={c.code}>
                  <code>{c.code}</code>
                  <span className="grow">{c.course}</span>
                  <span className="small muted num">
                    {rupees(c.rupees)} off · {c.coins} coins · {shortDate(new Date(c.at))}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function EarningRules() {
  const ledger = useApp((s) => s.coins);
  const iso = todayISO();
  return (
    <section className="card stack" aria-labelledby="rw-earn-title">
      <h2 className="section-title" id="rw-earn-title">
        How you earn coins
      </h2>
      <div className="table-wrap">
        <table className="table">
          <caption className="sr-only">Earning rules and daily caps</caption>
          <thead>
            <tr>
              <th scope="col">What you do</th>
              <th scope="col" className="rw-num">
                Coins
              </th>
              <th scope="col" className="rw-num">
                Daily cap
              </th>
              <th scope="col" className="rw-num">
                Today
              </th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(EARN_RULES) as EarnAction[]).map((action) => {
              const rule = EARN_RULES[action];
              return (
                <tr key={action}>
                  <td>{rule.label}</td>
                  <td className="rw-num">+{rule.coins}</td>
                  <td className="rw-num">{rule.dailyCap} a day</td>
                  <td className="rw-num">
                    {earnedToday(ledger, action, iso)} of {rule.dailyCap}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="muted small">After a daily cap the action still counts for your progress, but it pays no more coins that day.</p>
    </section>
  );
}

function HistoryLog() {
  const ledger = useApp((s) => s.coins);
  const [shown, setShown] = useState(HISTORY_STEP);
  const rows = [...ledger].reverse();
  return (
    <section className="card stack" aria-labelledby="rw-history-title">
      <h2 className="section-title" id="rw-history-title">
        History
      </h2>
      {rows.length === 0 ? (
        <Empty icon={History} text="Each coin you earn or spend will be listed here. Finishing a daily set is the quickest way to earn some." action={<Button to="/practice/daily">Open daily set</Button>} />
      ) : (
        <>
          <ul className="rw-history">
            {rows.slice(0, shown).map((e) => (
              <li key={e.id}>
                <span className="grow">
                  {e.label}
                  <span className="small muted">{shortDate(parseISO(e.dayISO))}</span>
                </span>
                <b className="num">{signed(e.delta)}</b>
              </li>
            ))}
          </ul>
          {rows.length > shown && (
            <div>
              <Button variant="ghost" onClick={() => setShown(rows.length)}>
                Show all {rows.length}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default function Rewards() {
  const ledger = useApp((s) => s.coins);
  const shields = useApp((s) => s.purchases.shields);
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetAnchor = useRef<HTMLDivElement>(null);
  const balance = balanceOf(ledger);
  const earned = ledger.reduce((t, e) => t + Math.max(0, e.delta), 0);

  const onSheet = (open: boolean) => {
    setSheetOpen(open);
    if (open) window.setTimeout(() => sheetAnchor.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  return (
    <div className={`stack-lg rw-page${sheetOpen ? ' rw-printing' : ''}`}>
      <section className="card rw-balance" aria-label="Your coins">
        <div className="stats">
          <Stat
            value={
              <>
                <Coins size={22} strokeWidth={1.5} className="gold rw-coin" aria-hidden />
                {balance}
              </>
            }
            label="Coin balance"
          />
          <Stat value={earned} label="Coins earned so far" />
          <Stat value={shields} label="Streak shields held" />
        </div>
      </section>
      <SpendInPace balance={balance} onSheet={onSheet} sheetOpen={sheetOpen} />
      <div ref={sheetAnchor} className="rw-sheet-slot">
        {sheetOpen && <FormulaSheet />}
      </div>
      <Meridian balance={balance} />
      <div className="rw-columns">
        <EarningRules />
        <HistoryLog />
      </div>
    </div>
  );
}
