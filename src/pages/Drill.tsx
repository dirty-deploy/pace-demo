import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react';
import setsData from '../data/sample_sets.json';
import { Button, Tag } from '../components/ui';
import { mmss } from '../logic/cap';
import { kendall, recommendedOrder, startCostMinutes } from '../logic/ranking';
import { clueMix, reasonFor, setLetter } from '../logic/reasons';
import { seededRandom, shuffled } from '../logic/rng';
import type { PuzzleSet } from '../logic/types';
import { newId } from '../state/actions';
import { getState, update } from '../state/store';
import { startAttempt } from '../state/testEngine';
import type { TestDef } from '../state/schema';
import { setById } from '../content';
import '../styles/drill.css';

const SETS = setsData.sets as unknown as PuzzleSet[];
const DRILL_SECONDS = 240;

/** Five sets with at least one Easier and one Harder, as in v1. */
function pickRound(seed: string): PuzzleSet[] {
  const rand = seededRandom(seed);
  for (let i = 0; i < 200; i++) {
    const pick = shuffled(SETS, rand).slice(0, 5);
    const labels = pick.map((s) => s.difficultyLabel);
    if (labels.includes('Easier') && labels.includes('Harder')) return pick;
  }
  return SETS.slice(0, 5);
}

function Row({ set, code, rank, total, onMove }: { set: PuzzleSet; code: string; rank: number; total: number; onMove: (d: -1 | 1) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: set.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 5 : undefined };
  return (
    <li ref={setNodeRef} style={style} className={`drill-row${isDragging ? ' dragging' : ''}`}>
      <button type="button" className="icon-btn drill-grip" aria-label={`Drag Set ${code}. Or press space, then the arrow keys.`} {...attributes} {...listeners}>
        <GripVertical size={18} strokeWidth={1.5} aria-hidden />
      </button>
      <span className="drill-rank num">{rank + 1}</span>
      <span className="grow">
        <b>Set {code}</b>
        <span className="small muted">
          Circular seating, 6 people · {clueMix(set)} · {set.questions.length} questions
        </span>
      </span>
      <button type="button" className="icon-btn" onClick={() => onMove(-1)} disabled={rank === 0} aria-label={`Move Set ${code} up`}>
        <ArrowUp size={18} strokeWidth={1.5} aria-hidden />
      </button>
      <button type="button" className="icon-btn" onClick={() => onMove(1)} disabled={rank === total - 1} aria-label={`Move Set ${code} down`}>
        <ArrowDown size={18} strokeWidth={1.5} aria-hidden />
      </button>
    </li>
  );
}

type Done = { order: string[]; auto: boolean };

function Result({ round, codes, done, onNew }: { round: PuzzleSet[]; codes: Record<string, string>; done: Done; onNew: () => void }) {
  const nav = useNavigate();
  const rec = recommendedOrder(round);
  const recIds = rec.map((x) => x.id);
  const agree = kendall(done.order, recIds);
  const yourFirst = round.find((x) => x.id === done.order[0]) as PuzzleSet;
  const cost = startCostMinutes(yourFirst, rec[0]);

  const startTop = () => {
    const set = setById(rec[0].id);
    if (!set) return;
    const def: TestDef = {
      id: newId('set'),
      type: 'redo',
      name: `Capped set: Set ${codes[rec[0].id]}`,
      mode: 'practice',
      capped: true,
      sections: [{ section: 'DILR', name: 'DILR', minutes: null, questionIds: set.questionIds }],
    };
    startAttempt(def);
    nav(`/test/${def.id}`);
  };

  return (
    <div className="stack">
      {done.auto && <p className="small muted">Time's up. We used your current order.</p>}
      <div className="card stack">
        <h2 className="card-title">
          Your order agreed with the recommended order on {agree.concordant} of {agree.pairs} pairs of sets.
        </h2>
        <p className="small muted">{cost > 0 ? `Your first pick would likely cost about ${cost} more minutes than the recommended start.` : 'Your first pick matches the quickest start.'} This is an estimate from solver effort, not from timed students.</p>
      </div>
      <div className="drill-cols">
        <section className="card">
          <h3 className="section-title">Your order</h3>
          <ol className="drill-list-plain">
            {done.order.map((id, i) => (
              <li key={id}>
                <span className="num muted">{i + 1}</span> Set {codes[id]} {recIds[i] === id && <Tag tone="ok">Same place</Tag>}
              </li>
            ))}
          </ol>
        </section>
        <section className="card">
          <h3 className="section-title">Recommended order</h3>
          <ol className="drill-list-plain">
            {rec.map((x, i) => (
              <li key={x.id}>
                <span className="num muted">{i + 1}</span> Set {codes[x.id]}
                <span className="small muted drill-reason">{reasonFor(x)}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <div className="row">
        <Button variant="primary" onClick={startTop}>
          Try the recommended first set
        </Button>
        <Button onClick={onNew}>New round</Button>
      </div>
    </div>
  );
}

export default function Drill() {
  const [seed, setSeed] = useState(() => newId('round'));
  const round = useMemo(() => pickRound(seed), [seed]);
  const codes = useMemo(() => Object.fromEntries(round.map((s, i) => [s.id, setLetter(i)])), [round]);
  const [order, setOrder] = useState(() => round.map((s) => s.id));
  const [left, setLeft] = useState(DRILL_SECONDS);
  const [done, setDone] = useState<Done | null>(null);
  const [note, setNote] = useState('');
  const orderRef = useRef(order);
  orderRef.current = order;

  const finish = (auto: boolean) => {
    const final = orderRef.current;
    const recommended = recommendedOrder(round).map((s) => s.id);
    const tau = kendall(final, recommended).tau;
    update((s) => ({ ...s, drills: [...s.drills, { id: newId('d'), at: Date.now(), order: final, recommended, tau, setIds: round.map((x) => x.id) }] }));
    setDone({ order: final, auto });
  };
  const finishRef = useRef(finish);
  finishRef.current = finish;

  useEffect(() => {
    if (done) return;
    const id = window.setInterval(() => {
      setLeft((x) => {
        if (x <= 1) {
          window.clearInterval(id);
          finishRef.current(true);
          return 0;
        }
        return x - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [done, seed]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = order.indexOf(String(active.id));
    const to = order.indexOf(String(over.id));
    setOrder(arrayMove(order, from, to));
    setNote(`Set ${codes[String(active.id)]} moved to position ${to + 1}.`);
  };

  const move = (i: number, d: -1 | 1) => {
    const next = arrayMove(order, i, i + d);
    setOrder(next);
    setNote(`Set ${codes[order[i]]} moved to position ${i + d + 1}.`);
  };

  const newRound = () => {
    const next = newId('round');
    setSeed(next);
    setOrder(pickRound(next).map((s) => s.id));
    setLeft(DRILL_SECONDS);
    setDone(null);
  };

  if (done) return <Result round={round} codes={codes} done={done} onNew={newRound} />;

  const pace = getState().pace.length;
  return (
    <div className="stack">
      <div className="row-between">
        <p className="muted">Five sets, four minutes. Skim the clue mix and rank them in the order you would attempt them.</p>
        <span className={`drill-timer num${left <= 60 ? ' warn' : ''}`} role="timer" aria-label={`${mmss(left)} left`}>
          {mmss(left)}
        </span>
      </div>
      <p className="sr-only" aria-live="polite">
        {note}
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <ol className="drill-list">
            {order.map((id, i) => (
              <Row key={id} set={round.find((s) => s.id === id) as PuzzleSet} code={codes[id]} rank={i} total={order.length} onMove={(d) => move(i, d)} />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      <div className="row">
        <Button variant="primary" onClick={() => finish(false)}>
          Lock in my order
        </Button>
        <span className="small muted">{pace ? 'Your caps use your own pace so far.' : 'Your caps start from the expected time.'}</span>
      </div>
    </div>
  );
}
