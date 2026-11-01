import type { ReactNode } from 'react';
import { FRACTION_TABLE } from './qa-percent-fractions';
import type { DiagramId } from './types';

// Every colour is a CSS variable, so the diagrams follow the light and dark themes.
// `step` is how many reveal lines have been spoken on the slide so far.

type DiagramProps = { step: number };

function Svg({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg className="lp-diagram" viewBox="0 0 640 300" role="img" aria-label={label}>
      {children}
    </svg>
  );
}

function T({
  x,
  y,
  children,
  size = 20,
  color = 'var(--text)',
  anchor = 'middle',
  weight = 400,
}: {
  x: number;
  y: number;
  children: ReactNode;
  size?: number;
  color?: string;
  anchor?: 'start' | 'middle' | 'end';
  weight?: number;
}) {
  return (
    <text x={x} y={y} fontSize={size} fill={color} textAnchor={anchor} fontWeight={weight} dominantBaseline="middle">
      {children}
    </text>
  );
}

function Box({
  x,
  y,
  w,
  h,
  fill = 'var(--surface-2)',
  stroke = 'var(--line)',
  dashed,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill?: string;
  stroke?: string;
  dashed?: boolean;
}) {
  return <rect x={x} y={y} width={w} height={h} rx={8} fill={fill} stroke={stroke} strokeWidth={1.5} strokeDasharray={dashed ? '6 5' : undefined} />;
}

/** Fades its children in once `on` is true. */
function Show({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <g className="dg-fade" style={{ opacity: on ? 1 : 0 }}>
      {children}
    </g>
  );
}

/** Straight arrow with a small head. Only for horizontal or vertical runs. */
function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--muted)" strokeWidth={1.5} />
      <path d="M0 0 L-9 -5 L-9 5 Z" fill="var(--muted)" transform={`translate(${x2} ${y2}) rotate(${angle})`} />
    </g>
  );
}

function InferenceScale({ step }: DiagramProps) {
  return (
    <Svg label="A line of three boxes. Stated, in the text. Inferred, forced by the text, marked as where the answer sits. Guessed, merely likely.">
      <line x1={30} y1={130} x2={610} y2={130} stroke="var(--line)" strokeWidth={2} />
      <Show on={step >= 1}>
        <Box x={30} y={80} w={170} h={100} />
        <T x={115} y={115} weight={500}>
          Stated
        </T>
        <T x={115} y={148} size={18} color="var(--muted)">
          In the text
        </T>
      </Show>
      <Show on={step >= 3}>
        <Box x={235} y={80} w={170} h={100} fill="var(--primary-soft)" stroke="var(--primary)" />
        <T x={320} y={115} weight={500} color="var(--primary)">
          Inferred
        </T>
        <T x={320} y={148} size={18} color="var(--primary)">
          Forced by the text
        </T>
        <T x={320} y={222} color="var(--primary)" weight={500}>
          The answer sits here
        </T>
      </Show>
      <Show on={step >= 2}>
        <Box x={440} y={80} w={170} h={100} />
        <T x={525} y={115} weight={500}>
          Guessed
        </T>
        <T x={525} y={148} size={18} color="var(--muted)">
          Merely likely
        </T>
      </Show>
    </Svg>
  );
}

function NegationFlow({ step }: DiagramProps) {
  return (
    <Svg label="Flow chart. Flip the option, then ask if the passage still stands. If the flipped option breaks the passage, keep the original. If the passage stands, drop it.">
      <Box x={20} y={30} w={170} h={70} />
      <T x={105} y={65}>
        The option
      </T>
      <Show on={step >= 1}>
        <Arrow x1={190} y1={65} x2={232} y2={65} />
        <Box x={235} y={30} w={170} h={70} />
        <T x={320} y={65}>
          Flip it
        </T>
      </Show>
      <Show on={step >= 2}>
        <Arrow x1={405} y1={65} x2={447} y2={65} />
        <Box x={450} y={30} w={170} h={70} fill="var(--primary-soft)" stroke="var(--primary)" />
        <T x={535} y={52} size={18} color="var(--primary)">
          Does the passage
        </T>
        <T x={535} y={78} size={18} color="var(--primary)">
          still stand?
        </T>
      </Show>
      <Show on={step >= 3}>
        <line x1={535} y1={100} x2={535} y2={140} stroke="var(--muted)" strokeWidth={1.5} />
        <line x1={190} y1={140} x2={535} y2={140} stroke="var(--muted)" strokeWidth={1.5} />
        <Arrow x1={190} y1={140} x2={190} y2={177} />
        <Box x={40} y={180} w={270} h={84} stroke="var(--ok)" />
        <T x={175} y={208} weight={500} color="var(--ok)">
          No, it breaks
        </T>
        <T x={175} y={238} size={18}>
          The original was forced
        </T>
      </Show>
      <Show on={step >= 4}>
        <line x1={480} y1={140} x2={480} y2={177} stroke="var(--muted)" strokeWidth={1.5} />
        <Arrow x1={480} y1={150} x2={480} y2={177} />
        <Box x={345} y={180} w={270} h={84} stroke="var(--bad)" />
        <T x={480} y={208} weight={500} color="var(--bad)">
          Yes, it stands
        </T>
        <T x={480} y={238} size={18}>
          The original was a guess
        </T>
      </Show>
    </Svg>
  );
}

const FUNNEL = [
  { orders: 24, label: 'All orders of 4 sentences', width: 330 },
  { orders: 6, label: 'One firm pair', width: 210 },
  { orders: 2, label: 'Opening found too', width: 120 },
  { orders: 1, label: 'One more link', width: 66 },
];

function PjFunnel({ step }: DiagramProps) {
  return (
    <Svg label="Four bars that shrink. 24 orders at the start, 6 with one firm pair, 2 with the opening as well, and 1 with one more link.">
      {FUNNEL.map((row, i) => {
        const y = 12 + i * 72;
        const last = i === FUNNEL.length - 1;
        return (
          <Show key={row.orders} on={step >= i}>
            <Box x={20} y={y} w={row.width} h={56} fill="var(--primary-soft)" stroke={last ? 'var(--primary)' : 'var(--line)'} />
            <T x={20 + row.width / 2} y={y + 28} size={24} weight={500} color="var(--primary)">
              {row.orders}
            </T>
            <T x={row.width + 36} y={y + 28} anchor="start">
              {row.label}
            </T>
          </Show>
        );
      })}
    </Svg>
  );
}

const CHAIN = [
  { n: 3, link: '' },
  { n: 1, link: 'then' },
  { n: 4, link: 'but' },
  { n: 2, link: 'them' },
];

function PjChain({ step }: DiagramProps) {
  return (
    <Svg label="Sentences joined in a chain: 3, then 1 because of the word then, then 4 because of but, then 2 because of them. The order is 3142.">
      {CHAIN.map((c, i) => {
        const x = 24 + i * 156;
        return (
          <Show key={c.n} on={step >= Math.max(i, 1)}>
            {i > 0 && (
              <>
                <Arrow x1={x - 56} y1={100} x2={x - 2} y2={100} />
                <T x={x - 29} y={72} size={18} color="var(--primary)" weight={500}>
                  {c.link}
                </T>
              </>
            )}
            <Box x={x} y={55} w={100} h={90} fill={i === 0 ? 'var(--primary-soft)' : 'var(--surface-2)'} stroke={i === 0 ? 'var(--primary)' : 'var(--line)'} />
            <T x={x + 50} y={100} size={32} weight={500}>
              {c.n}
            </T>
          </Show>
        );
      })}
      <Show on={step >= 1}>
        <T x={74} y={170} size={18} color="var(--muted)">
          Opening
        </T>
      </Show>
      <Show on={step >= 4}>
        <T x={320} y={240} size={26} weight={500} color="var(--primary)">
          Type 3142
        </T>
      </Show>
    </Svg>
  );
}

const SCALE = 12.3;
const BAR_X = 128;

function Segment({ from, minutes, y, text, strong }: { from: number; minutes: number; y: number; text: string; strong?: boolean }) {
  const x = BAR_X + from * SCALE;
  const w = minutes * SCALE;
  return (
    <>
      <Box x={x} y={y} w={w} h={56} fill={strong ? 'var(--primary-soft)' : 'var(--surface-2)'} stroke={strong ? 'var(--primary)' : 'var(--line)'} />
      <T x={x + w / 2} y={y + 28} size={18} color={strong ? 'var(--primary)' : 'var(--text)'}>
        {text}
      </T>
    </>
  );
}

function DilrTwoStarts({ step }: DiagramProps) {
  return (
    <Svg label="Two timelines of 40 minutes, as a made-up example. Student A spends 18 minutes for 1 right, then 22 minutes for 5 right, 6 in total. Student B scans for 4 minutes, then gets 5, 4 and 2 right, 11 in total.">
      <T x={14} y={48} anchor="start" weight={500}>
        Student A
      </T>
      <Show on={step >= 1}>
        <Segment from={0} minutes={18} y={20} text="1 right" />
      </Show>
      <Show on={step >= 2}>
        <Segment from={18} minutes={22} y={20} text="5 right" />
        <T x={BAR_X} y={100} anchor="start" size={18} color="var(--muted)">
          Total: 6 right
        </T>
      </Show>
      <T x={14} y={168} anchor="start" weight={500}>
        Student B
      </T>
      <Show on={step >= 3}>
        <Segment from={0} minutes={4} y={140} text="Scan" />
        <Segment from={4} minutes={14} y={140} text="5 right" strong />
        <Segment from={18} minutes={14} y={140} text="4 right" strong />
        <Segment from={32} minutes={8} y={140} text="2 right" strong />
      </Show>
      <Show on={step >= 4}>
        <T x={BAR_X} y={220} anchor="start" size={18} color="var(--primary)" weight={500}>
          Total: 11 right
        </T>
      </Show>
      <T x={20} y={276} anchor="start" size={16} color="var(--muted)">
        A made-up example, not data
      </T>
    </Svg>
  );
}

const PLAN = [
  { from: 0, minutes: 4, label: 'Scan', note: '4' },
  { from: 4, minutes: 14, label: 'Best set', note: '14' },
  { from: 18, minutes: 14, label: 'Second set', note: '14' },
  { from: 32, minutes: 8, label: 'Third', note: '8' },
];

function DilrTimeBar({ step }: DiagramProps) {
  const unit = 14.5;
  const left = 30;
  return (
    <Svg label="A 40 minute bar split into 4 minutes to scan, 14 for the best set, 14 for the second set and 8 for a third set.">
      <rect x={left} y={90} width={40 * unit} height={90} rx={8} fill="var(--surface-2)" stroke="var(--line)" strokeWidth={1.5} />
      {PLAN.map((p, i) => {
        const x = left + p.from * unit;
        const w = p.minutes * unit;
        return (
          <Show key={p.label} on={step > i}>
            <Box x={x} y={90} w={w} h={90} fill={i === 0 ? 'var(--primary)' : 'var(--primary-soft)'} stroke="var(--primary)" />
            <T x={x + w / 2} y={135} size={24} weight={500} color={i === 0 ? 'var(--on-primary)' : 'var(--primary)'}>
              {p.note}
            </T>
            <T x={i === 0 ? x : x + w / 2} y={60} anchor={i === 0 ? 'start' : 'middle'} size={18}>
              {p.label}
            </T>
          </Show>
        );
      })}
      <T x={left} y={212} anchor="start" size={18} color="var(--muted)">
        0 min
      </T>
      <T x={left + 40 * unit} y={212} anchor="end" size={18} color="var(--muted)">
        40 min
      </T>
    </Svg>
  );
}

function FrameZone({ on, x, y, w, h, text }: { on: boolean; x: number; y: number; w: number; h: number; text: string }) {
  return (
    <>
      <Box x={x} y={y} w={w} h={h} fill={on ? 'var(--primary-soft)' : 'var(--surface-2)'} stroke={on ? 'var(--primary)' : 'var(--line)'} />
      <T x={x + w / 2} y={y + h / 2} size={18} color={on ? 'var(--primary)' : 'var(--muted)'} weight={on ? 500 : 400}>
        {on ? text : ''}
      </T>
    </>
  );
}

function DiFrame({ step }: DiagramProps) {
  const cells = [108, 153, 198].flatMap((y) => [186, 270, 354, 438].map((x) => ({ x, y })));
  return (
    <Svg label="A table outline with five labelled parts: title and unit, column labels, row labels, totals and a footnote.">
      <FrameZone on={step >= 1} x={20} y={8} w={600} h={44} text="Title and unit" />
      <FrameZone on={step >= 2} x={170} y={60} w={350} h={40} text="Column labels" />
      <FrameZone on={step >= 3} x={20} y={108} w={142} h={126} text="Row labels" />
      <FrameZone on={step >= 4} x={528} y={60} w={92} h={174} text="Totals" />
      <FrameZone on={step >= 5} x={20} y={244} w={600} h={44} text="Footnote" />
      {cells.map((c) => (
        <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y + 10} width={56} height={14} rx={4} fill="var(--line)" />
      ))}
    </Svg>
  );
}

function PfGrid({ step }: DiagramProps) {
  const w = 148;
  const h = 90;
  const label = FRACTION_TABLE.map(([d, pct]) => `1/${d} is ${pct}%`).join(', ');
  return (
    <Svg label={`Twelve fractions as percents: ${label}.`}>
      {FRACTION_TABLE.map(([d, pct, group], i) => {
        const x = 14 + (i % 4) * (w + 6);
        const y = 8 + Math.floor(i / 4) * (h + 7);
        const on = step >= group;
        return (
          <g key={d} className="dg-fade" style={{ opacity: on ? 1 : 0.3 }}>
            <Box x={x} y={y} w={w} h={h} fill={group === 3 ? 'var(--primary-soft)' : 'var(--surface-2)'} stroke={group === 3 ? 'var(--primary)' : 'var(--line)'} />
            <T x={x + w / 2} y={y + 30} size={24} weight={500}>
              1/{d}
            </T>
            <T x={x + w / 2} y={y + 64} size={20} color={group === 3 ? 'var(--primary)' : 'var(--muted)'}>
              {pct}%
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

function Blocks({ y, count, extra }: { y: number; count: number; extra: 'added' | 'removed' }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Box key={i} x={20 + i * 100} y={y} w={92} h={68} />
      ))}
      <Box
        x={20 + count * 100}
        y={y}
        w={92}
        h={68}
        fill={extra === 'added' ? 'var(--primary-soft)' : 'var(--surface)'}
        stroke={extra === 'added' ? 'var(--primary)' : 'var(--bad)'}
        dashed={extra === 'removed'}
      />
    </>
  );
}

function PfCancel({ step }: DiagramProps) {
  return (
    <Svg label="Four equal blocks with one added is up by a quarter, or 25 percent. Five blocks with one removed is down by a fifth, or 20 percent. It is the same block on a different base.">
      <Show on={step >= 1}>
        <T x={20} y={16} anchor="start">
          4 parts, add 1: up 1/4, or 25%
        </T>
        <Blocks y={36} count={4} extra="added" />
      </Show>
      <Show on={step >= 2}>
        <T x={20} y={132} anchor="start">
          5 parts, remove 1: down 1/5, or 20%
        </T>
        <Blocks y={152} count={4} extra="removed" />
      </Show>
      <Show on={step >= 3}>
        <T x={20} y={258} anchor="start" color="var(--primary)" weight={500}>
          Same block, new base
        </T>
      </Show>
    </Svg>
  );
}

function Split({ y, parts, fill, stroke }: { y: number; parts: number; fill: string; stroke: string }) {
  const width = 600;
  return (
    <>
      <rect x={20} y={y} width={width} height={40} rx={6} fill={fill} stroke={stroke} strokeWidth={1.5} />
      {Array.from({ length: parts - 1 }, (_, i) => {
        const x = 20 + ((i + 1) * width) / parts;
        return <line key={i} x1={x} y1={y} x2={x} y2={y + 40} stroke={stroke} strokeWidth={1} />;
      })}
    </>
  );
}

function TwUnits({ step }: DiagramProps) {
  return (
    <Svg label="The whole job is a bar of 60 units. A covers it in 12 days at 5 units a day. B covers it in 15 days at 4 units a day. Together they do 9 units a day.">
      <Show on={step >= 1}>
        <T x={20} y={14} anchor="start" size={18}>
          Whole job: 60 units
        </T>
        <Split y={28} parts={1} fill="var(--primary-soft)" stroke="var(--primary)" />
      </Show>
      <Show on={step >= 2}>
        <T x={20} y={90} anchor="start" size={18}>
          A: 12 days at 5 units a day
        </T>
        <Split y={104} parts={12} fill="var(--surface-2)" stroke="var(--muted)" />
      </Show>
      <Show on={step >= 3}>
        <T x={20} y={166} anchor="start" size={18}>
          B: 15 days at 4 units a day
        </T>
        <Split y={180} parts={15} fill="var(--surface-2)" stroke="var(--muted)" />
      </Show>
      <Show on={step >= 4}>
        <T x={20} y={258} anchor="start" size={22} weight={500} color="var(--primary)">
          Together: 9 a day, so 60 ÷ 9 = 6 2/3 days
        </T>
      </Show>
    </Svg>
  );
}

function Units({ y, count, tone }: { y: number; count: number; tone: 'add' | 'take' | 'net' }) {
  const stroke = tone === 'take' ? 'var(--bad)' : 'var(--primary)';
  const fill = tone === 'take' ? 'var(--surface)' : 'var(--primary-soft)';
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Box key={i} x={250 + i * 76} y={y} w={68} h={60} fill={fill} stroke={stroke} dashed={tone === 'take'} />
      ))}
    </>
  );
}

function TwNet({ step }: DiagramProps) {
  return (
    <Svg label="A tank of 18 units. The tap adds 3 units an hour, the leak takes away 2, so the net gain is 1 unit an hour and the tank fills in 18 hours.">
      <Show on={step >= 1}>
        <T x={20} y={46} anchor="start">
          Tap: +3 an hour
        </T>
        <Units y={16} count={3} tone="add" />
      </Show>
      <Show on={step >= 2}>
        <T x={20} y={122} anchor="start">
          Leak: −2 an hour
        </T>
        <Units y={92} count={2} tone="take" />
      </Show>
      <Show on={step >= 3}>
        <T x={20} y={198} anchor="start" weight={500}>
          Net: +1 an hour
        </T>
        <Units y={168} count={1} tone="net" />
        <T x={20} y={262} anchor="start" size={22} weight={500} color="var(--primary)">
          18 units ÷ 1 = 18 hours
        </T>
      </Show>
    </Svg>
  );
}

const TURNS: { who: 'A' | 'B'; units: number; from: number; group: number }[] = [
  { who: 'A', units: 3, from: 0, group: 1 },
  { who: 'B', units: 2, from: 3, group: 1 },
  { who: 'A', units: 3, from: 5, group: 1 },
  { who: 'B', units: 2, from: 8, group: 1 },
  { who: 'A', units: 3, from: 10, group: 1 },
  { who: 'B', units: 2, from: 13, group: 1 },
  { who: 'A', units: 3, from: 15, group: 1 },
  { who: 'B', units: 2, from: 18, group: 1 },
  { who: 'A', units: 3, from: 20, group: 2 },
  { who: 'B', units: 1, from: 23, group: 3 },
];

function TwAlternate({ step }: DiagramProps) {
  const unit = 25;
  const left = 20;
  return (
    <Svg label="A bar of 24 units. Eight days of turns finish 20 units, A adds 3 on day 9, and B finishes the last unit in half of day 10. The total is 9 and a half days.">
      <rect x={left} y={70} width={24 * unit} height={70} rx={6} fill="var(--surface-2)" stroke="var(--line)" strokeWidth={1.5} />
      <T x={left} y={44} anchor="start" size={18} color="var(--muted)">
        The job: 24 units. A does 3 a day, B does 2.
      </T>
      {TURNS.map((t) => {
        const x = left + t.from * unit;
        const w = t.units * unit;
        const isA = t.who === 'A';
        return (
          <Show key={t.from} on={step >= t.group}>
            <rect x={x} y={70} width={w} height={70} fill={isA ? 'var(--primary-soft)' : 'var(--surface)'} stroke="var(--primary)" strokeWidth={1.5} />
            <T x={x + w / 2} y={105} color="var(--primary)" weight={500}>
              {t.who}
            </T>
          </Show>
        );
      })}
      <Show on={step >= 1}>
        <T x={left + 10 * unit} y={166} size={18}>
          8 days: 20 units
        </T>
      </Show>
      <Show on={step >= 2}>
        <T x={left + 21.5 * unit} y={166} size={18}>
          Day 9
        </T>
      </Show>
      <Show on={step >= 3}>
        <T x={left + 24 * unit} y={194} size={18} anchor="end">
          Half of day 10
        </T>
        <T x={left} y={250} anchor="start" size={24} weight={500} color="var(--primary)">
          9 and a half days
        </T>
      </Show>
    </Svg>
  );
}

const DIAGRAMS: Record<DiagramId, (p: DiagramProps) => ReactNode> = {
  'inference-scale': InferenceScale,
  'negation-flow': NegationFlow,
  'pj-funnel': PjFunnel,
  'pj-chain': PjChain,
  'dilr-two-starts': DilrTwoStarts,
  'dilr-time-bar': DilrTimeBar,
  'di-frame': DiFrame,
  'pf-grid': PfGrid,
  'pf-cancel': PfCancel,
  'tw-units': TwUnits,
  'tw-net': TwNet,
  'tw-alternate': TwAlternate,
};

export function Diagram({ id, step }: { id: DiagramId; step: number }) {
  const Draw = DIAGRAMS[id];
  return <Draw step={step} />;
}
