import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent, type RefObject } from 'react';
import { Check } from 'lucide-react';
import { addBlock, removeBlock, updateBlock } from '../../state/actions';
import type { PlannerBlock } from '../../state/schema';
import { addDays, parseISO, toISO, weekday } from '../../logic/dates';
import { DAY_END, DAY_START, SLOT } from '../../logic/planner';
import { formatClock, subjectOf, type Subject } from '../../logic/quickadd';
import { toast } from '../ui';
import { activityOf, blockLabel, boxStyle, EVENING, layoutDay, nowMinutes, shortDay, shownMinutes, stepLength, stepStart, type Placed } from './model';
import { TitleField } from './TitleField';
import type { DragPreview, DragSource } from './useGridDrag';

type Draft = { dateISO: string; startMin: number; minutes: number };

const DRAFT_ID = 'draft';
const FULL_LANE: Placed = { lane: 0, lanes: 1 };
/** Shortest block with room for a title line and a details line. */
const TWO_LINES = 45;
const ROWS = (DAY_END - DAY_START) / SLOT;
const HOURS = Array.from({ length: ROWS / 2 }, (_, i) => DAY_START + i * 60);
const subjectClass = (s: Subject) => `s-${s.toLowerCase()}`;

function BlockCard({
  block,
  day,
  place,
  held,
  register,
  onGrab,
  onResize,
  onOpen,
  onKeyDown,
}: {
  block: PlannerBlock;
  day: number;
  place: Placed;
  held: boolean;
  register: (el: HTMLDivElement | null) => void;
  onGrab: (e: PointerEvent) => void;
  onResize: (e: PointerEvent) => void;
  onOpen: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
}) {
  const compact = shownMinutes(block.minutes) < TWO_LINES;
  const cls = ['pl-block', subjectClass(block.subject), compact && 'is-compact', block.done && 'is-done', held && 'is-held'].filter(Boolean).join(' ');
  const tick = block.done && <Check size={12} strokeWidth={1.5} aria-hidden />;
  return (
    <div
      ref={register}
      role="button"
      tabIndex={0}
      className={cls}
      style={boxStyle(day, block.startMin, block.minutes, place)}
      aria-label={blockLabel(block)}
      title={blockLabel(block)}
      onPointerDown={onGrab}
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      onKeyDown={onKeyDown}
    >
      {compact ? (
        <span className="pl-b-line">
          {tick}
          <span className="pl-b-subject">{block.subject}</span>
          <span className="pl-b-title">{block.title}</span>
        </span>
      ) : (
        <>
          <span className="pl-b-line">
            {tick}
            <span className="pl-b-title">{block.title}</span>
          </span>
          <span className="pl-b-meta">
            {block.subject} · {formatClock(block.startMin)} · {block.minutes} min
          </span>
        </>
      )}
      <span className="pl-resize" aria-hidden onPointerDown={onResize} />
    </div>
  );
}

function DraftBlock({
  draft,
  day,
  place,
  onSave,
  onCancel,
}: {
  draft: Draft;
  day: number;
  place: Placed;
  onSave: (title: string, viaEnter: boolean) => void;
  onCancel: (viaKey: boolean) => void;
}) {
  const [subject, setSubject] = useState<Subject>('Revision');
  return (
    <div
      className={`pl-block pl-draft ${subjectClass(subject)}`}
      style={boxStyle(day, draft.startMin, draft.minutes, place)}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <TitleField
        className="pl-draft-input"
        label={`Title for the block on ${shortDay(draft.dateISO)} at ${formatClock(draft.startMin)}`}
        onText={(t) => setSubject(subjectOf(t))}
        onSave={onSave}
        onCancel={onCancel}
      />
      <span className="pl-b-meta">
        {subject} · {formatClock(draft.startMin)} · {draft.minutes} min
      </span>
    </div>
  );
}

const previewSubject = (source: DragSource): Subject => (source.kind === 'template' ? source.template.subject : source.block.subject);

export function WeekGrid({
  week,
  now,
  blocks,
  layerRef,
  scrollerRef,
  preview,
  helpId,
  revealId,
  beginDrag,
  wasDragged,
  onOpen,
  onShowDay,
  announce,
}: {
  week: Date[];
  now: Date;
  blocks: PlannerBlock[];
  layerRef: RefObject<HTMLDivElement | null>;
  scrollerRef: RefObject<HTMLDivElement | null>;
  preview: DragPreview | null;
  helpId: string;
  revealId: string | null;
  beginDrag: (e: PointerEvent, source: DragSource) => void;
  wasDragged: () => boolean;
  onOpen: (id: string) => void;
  onShowDay: (iso: string) => void;
  announce: (text: string) => void;
}) {
  const days = useMemo(() => week.map(toISO), [week]);
  const todayIndex = days.indexOf(toISO(now));

  const [draft, setDraft] = useState<Draft | null>(null);
  const [cursor, setCursor] = useState({ day: Math.max(0, todayIndex), min: EVENING });

  const refs = useRef(new Map<string, HTMLDivElement>());
  const cursorRef = useRef<HTMLDivElement>(null);
  const focusAfter = useRef<string | null>(null);
  const draftAtPress = useRef(false);

  const shown = useMemo(
    () => blocks.filter((b) => days.includes(b.dateISO)).sort((a, b) => a.dateISO.localeCompare(b.dateISO) || a.startMin - b.startMin),
    [blocks, days],
  );

  const places = useMemo(() => {
    const map = new Map<string, Placed>();
    for (const iso of days) {
      const items = shown.filter((b) => b.dateISO === iso);
      const withDraft = draft?.dateISO === iso ? [...items, { ...draft, id: DRAFT_ID }] : items;
      layoutDay(withDraft).forEach((v, k) => map.set(k, v));
    }
    return map;
  }, [days, shown, draft]);

  const heldId = preview && preview.source.kind !== 'template' ? preview.source.block.id : null;

  // Open each week where its first block is, or on the part of the day still ahead.
  const weekStart = days[0];
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const layer = layerRef.current;
    if (!scroller || !layer) return;
    const first = shown.length ? Math.min(...shown.map((b) => b.startMin)) : todayIndex >= 0 ? nowMinutes(now) : EVENING;
    scroller.scrollTop = ((Math.max(DAY_START, first - SLOT) - DAY_START) / (DAY_END - DAY_START)) * layer.getBoundingClientRect().height;
    // Only when the week changes: moving a block should not jump the view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  useEffect(() => {
    if (revealId) refs.current.get(revealId)?.scrollIntoView({ block: 'nearest' });
  }, [revealId]);

  // Reordering keyed blocks can drop focus, so it is put back after every keyboard change.
  useEffect(() => {
    const target = focusAfter.current;
    if (!target) return;
    focusAfter.current = null;
    if (target === 'grid') {
      layerRef.current?.focus({ preventScroll: true });
      return;
    }
    const el = refs.current.get(target);
    el?.focus({ preventScroll: true });
    el?.scrollIntoView({ block: 'nearest' });
  });

  const openSlot = (day: number, min: number) => {
    setCursor({ day, min });
    setDraft({ dateISO: days[day], startMin: min, minutes: Math.min(45, DAY_END - min) });
  };

  const saveDraft = (title: string, viaEnter: boolean) => {
    if (!draft) return;
    const id = addBlock({ ...draft, title, subject: subjectOf(title), activity: activityOf(title) });
    setDraft(null);
    if (viaEnter) focusAfter.current = id;
  };

  const cancelDraft = (viaKey: boolean) => {
    setDraft(null);
    if (viaKey) focusAfter.current = 'grid';
  };

  const blockAt = (day: number, min: number) =>
    shown.find((b) => b.dateISO === days[day] && b.startMin < min + SLOT && min < b.startMin + shownMinutes(b.minutes));

  const onLayerClick = (e: MouseEvent<HTMLDivElement>) => {
    // A click that closes an open title box only closes it.
    if (wasDragged() || draftAtPress.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const day = Math.max(0, Math.min(6, Math.floor(((e.clientX - r.left) / r.width) * 7)));
    const row = Math.max(0, Math.min(ROWS - 1, Math.floor(((e.clientY - r.top) / r.height) * ROWS)));
    openSlot(day, DAY_START + row * SLOT);
  };

  const onLayerKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const step: Record<string, [number, number]> = { ArrowUp: [0, -SLOT], ArrowDown: [0, SLOT], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
    const move = step[e.key];
    if (move) {
      e.preventDefault();
      const day = Math.max(0, Math.min(6, cursor.day + move[0]));
      const min = Math.max(DAY_START, Math.min(DAY_END - SLOT, cursor.min + move[1]));
      setCursor({ day, min });
      const hit = blockAt(day, min);
      announce(`${shortDay(days[day])}, ${formatClock(min)}, ${hit ? hit.title : 'free'}`);
      requestAnimationFrame(() => cursorRef.current?.scrollIntoView({ block: 'nearest' }));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const hit = blockAt(cursor.day, cursor.min);
      if (hit) refs.current.get(hit.id)?.focus();
      else openSlot(cursor.day, cursor.min);
    }
  };

  const changeByKey = (b: PlannerBlock, patch: Partial<PlannerBlock>, message: string) => {
    updateBlock(b.id, patch);
    if (patch.dateISO && !days.includes(patch.dateISO)) onShowDay(patch.dateISO);
    focusAfter.current = b.id;
    announce(message);
  };

  const onBlockKey = (e: KeyboardEvent, b: PlannerBlock) => {
    const vertical = e.key === 'ArrowUp' || e.key === 'ArrowDown';
    if (vertical && e.shiftKey) {
      const minutes = stepLength(b, e.key === 'ArrowDown' ? 1 : -1);
      if (minutes !== b.minutes) changeByKey(b, { minutes }, `${b.title} is now ${minutes} min`);
    } else if (vertical) {
      const startMin = stepStart(b, e.key === 'ArrowDown' ? 1 : -1);
      if (startMin !== b.startMin) changeByKey(b, { startMin }, `${b.title} moved to ${formatClock(startMin)}`);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const dateISO = toISO(addDays(parseISO(b.dateISO), e.key === 'ArrowRight' ? 1 : -1));
      changeByKey(b, { dateISO }, `${b.title} moved to ${shortDay(dateISO)}`);
    } else if (e.key === 'Enter' || e.key === ' ') {
      onOpen(b.id);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      removeBlock(b.id);
      focusAfter.current = 'grid';
      toast(`Removed ${b.title}.`);
    } else {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="pl-scroller" ref={scrollerRef}>
      <div className="pl-inner">
        <div className="pl-head">
          <div />
          {week.map((d, i) => (
            <div key={days[i]} className={`pl-dayhead${i === todayIndex ? ' is-today' : ''}`} aria-current={i === todayIndex ? 'date' : undefined}>
              <span>{weekday(d)}</span>
              <b className="num">{d.getDate()}</b>
              {i === todayIndex && <span className="pl-today-tag">Today</span>}
            </div>
          ))}
        </div>
        <div className="pl-body">
          <div className="pl-hours" aria-hidden>
            {HOURS.map((min, i) => (
              <span key={min} style={{ top: `${(i / HOURS.length) * 100}%` }}>
                {formatClock(min)}
              </span>
            ))}
          </div>
          <div
            ref={layerRef}
            className="pl-grid"
            role="application"
            tabIndex={0}
            aria-label="Week grid. Use the arrow keys to pick a slot and Enter to add a block."
            aria-describedby={helpId}
            onPointerDown={() => {
              draftAtPress.current = draft !== null;
            }}
            onClick={onLayerClick}
            onKeyDown={onLayerKey}
          >
            <div className="pl-cols" aria-hidden>
              {days.map((iso, i) => (
                <i key={iso} className={i === todayIndex ? 'is-today' : undefined} />
              ))}
            </div>
            <div className="pl-rows" aria-hidden>
              {Array.from({ length: ROWS }, (_, i) => (
                <i key={i} />
              ))}
            </div>
            <div ref={cursorRef} className="pl-cursor" style={boxStyle(cursor.day, cursor.min, SLOT)} aria-hidden />
            {shown.map((b) => {
              const day = days.indexOf(b.dateISO);
              return (
                <BlockCard
                  key={b.id}
                  block={b}
                  day={day}
                  place={places.get(b.id) ?? FULL_LANE}
                  held={heldId === b.id}
                  register={(el) => {
                    if (el) refs.current.set(b.id, el);
                    else refs.current.delete(b.id);
                  }}
                  onGrab={(e) => beginDrag(e, { kind: 'move', block: b })}
                  onResize={(e) => {
                    e.stopPropagation();
                    beginDrag(e, { kind: 'resize', block: b, day });
                  }}
                  onOpen={() => {
                    if (!wasDragged()) onOpen(b.id);
                  }}
                  onKeyDown={(e) => onBlockKey(e, b)}
                />
              );
            })}
            {draft && <DraftBlock draft={draft} day={days.indexOf(draft.dateISO)} place={places.get(DRAFT_ID) ?? FULL_LANE} onSave={saveDraft} onCancel={cancelDraft} />}
            {preview?.inside && (
              <div className={`pl-preview ${subjectClass(previewSubject(preview.source))}`} style={boxStyle(preview.day, preview.startMin, preview.minutes)} aria-hidden>
                {formatClock(preview.startMin)} · {preview.minutes} min
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
