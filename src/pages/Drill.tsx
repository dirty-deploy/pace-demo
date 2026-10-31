import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, GripVertical } from 'lucide-react';
import { Btn, Eyebrow } from '../components/ui';
import { useStore } from '../state/store';
import { clueMix } from '../logic/reasons';
import { mmss } from '../logic/cap';
import type { PuzzleSet } from '../logic/types';

const DRILL_SECONDS = 240;
const GLOW = [1, 0.72, 0.48, 0.3, 0.16];

function Slab({ set, rank, total, code, onMove }: { set: PuzzleSet; rank: number; total: number; code: string; onMove: (dir: -1 | 1) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: set.id, transition: { duration: 250, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' } });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 5 : undefined };
  const glow = GLOW[rank] ?? 0.12;
  return (
    <li ref={setNodeRef} style={style} className={`slab-wrap${isDragging ? ' is-dragging' : ''}`}>
      <div className="slab" style={{ ['--glow' as string]: glow }}>
        <div className="slab-top" aria-hidden />
        <div className="slab-face">
          <div className="slab-head">
            <h3>Set {code}</h3>
            <span className="slab-rank tnum" aria-label={`Position ${rank + 1} of ${total}`}>{rank + 1}</span>
          </div>
          <p className="slab-family">Circular seating, 6 people</p>
          <p className="slab-mix">{clueMix(set)}</p>
          <p className="slab-q">{set.questions.length} questions</p>
          <div className="slab-ctl">
            <button type="button" className="grip" aria-label={`Drag Set ${code}. Or press space, then the arrow keys.`} {...attributes} {...listeners}>
              <GripVertical size={18} strokeWidth={1.5} aria-hidden />
            </button>
            <span className="mv">
              <button type="button" className="icon-btn" onClick={() => onMove(-1)} disabled={rank === 0} aria-label={`Move Set ${code} earlier`}>
                <ArrowLeft size={18} strokeWidth={1.5} className="ic-h" aria-hidden />
                <ArrowUp size={18} strokeWidth={1.5} className="ic-v" aria-hidden />
              </button>
              <button type="button" className="icon-btn" onClick={() => onMove(1)} disabled={rank === total - 1} aria-label={`Move Set ${code} later`}>
                <ArrowRight size={18} strokeWidth={1.5} className="ic-h" aria-hidden />
                <ArrowDown size={18} strokeWidth={1.5} className="ic-v" aria-hidden />
              </button>
            </span>
          </div>
        </div>
        <div className="slab-glow" aria-hidden />
      </div>
    </li>
  );
}

export default function Drill() {
  const s = useStore();
  const nav = useNavigate();
  const [order, setOrder] = useState<string[]>(s.round.ids);
  const [left, setLeft] = useState(DRILL_SECONDS);
  const [note, setNote] = useState('');
  const [timeUp, setTimeUp] = useState(false);
  const deadline = useRef(Date.now() + DRILL_SECONDS * 1000);
  const orderRef = useRef(order);
  orderRef.current = order;
  const done = useRef(false);
  const sRef = useRef(s);
  sRef.current = s;

  // A new round resets the working order and the clock.
  useEffect(() => {
    setOrder(s.round.ids);
    deadline.current = Date.now() + DRILL_SECONDS * 1000;
    setLeft(DRILL_SECONDS);
    setTimeUp(false);
    done.current = false;
  }, [s.round]);

  const submit = useCallback(
    (auto: boolean) => {
      if (done.current) return;
      done.current = true;
      sRef.current.submitDrill(orderRef.current, auto);
      nav('/drill/result');
    },
    [nav],
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      const l = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setLeft(l);
      if (l === 0) {
        setTimeUp(true);
        window.clearInterval(id);
        window.setTimeout(() => submit(true), 1400);
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [submit, s.round]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const sets = order.map((id) => s.getSet(id)!);
  const codeOf = (id: string) => s.codeOf(id) ?? '?';

  const move = (id: string, dir: -1 | 1) => {
    const i = order.indexOf(id);
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    setOrder(arrayMove(order, i, j));
    setNote(`Set ${codeOf(id)} moved to position ${j + 1} of ${order.length}.`);
  };
  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const from = order.indexOf(String(e.active.id));
    const to = order.indexOf(String(e.over.id));
    setOrder(arrayMove(order, from, to));
    setNote(`Set ${codeOf(String(e.active.id))} moved to position ${to + 1} of ${order.length}.`);
  };

  const warn = left <= 60;
  return (
    <div className="drill">
      <div className="watermark" aria-hidden>ROUND {s.round.n}</div>
      <header className="drill-head">
        <div>
          <Eyebrow>Round {s.round.n} · the pick</Eyebrow>
          <h1 className="display">Pick your order</h1>
          <p className="lede">Rank these sets in the order you'd attempt them. You're judging from the preview only, as you would in the exam's first minutes.</p>
        </div>
        <div className={`clock${warn ? ' warn' : ''}`} role="timer" aria-label="Time left in the drill">
          <span className="clock-num tnum">{mmss(left)}</span>
          <span className="clock-label">left to rank</span>
        </div>
      </header>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={order} strategy={rectSortingStrategy}>
          <ol className="slabs" aria-label="Sets, first choice at the start">
            {sets.map((set, i) => (
              <Slab key={set.id} set={set} rank={i} total={sets.length} code={codeOf(set.id)} onMove={(d) => move(set.id, d)} />
            ))}
          </ol>
        </SortableContext>
      </DndContext>

      <div className="drill-foot">
        <p className="hint">First in the row is the set you'd start with. Glow shows your current rank, not difficulty.</p>
        <Btn variant="primary" onClick={() => submit(false)}>
          Submit order
        </Btn>
      </div>
      {timeUp && <p className="timeup" role="status">Time's up, we used your current order.</p>}
      <p className="sr-only" aria-live="polite">{note}</p>
      <p className="sr-only" aria-live="assertive">{warn && left === 60 ? 'One minute left.' : ''}</p>
    </div>
  );
}
