import { useCallback, useId, useMemo, useRef, useState, useSyncExternalStore, type PointerEvent } from 'react';
import { CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react';
import { BlockDialog } from '../components/planner/BlockDialog';
import { DayList } from '../components/planner/DayList';
import { MissedTray } from '../components/planner/MissedTray';
import { QuickAdd } from '../components/planner/QuickAdd';
import { Templates } from '../components/planner/Templates';
import { WeekGrid } from '../components/planner/WeekGrid';
import { nowMinutes, shortDay, tomorrowSlot, type Template } from '../components/planner/model';
import { useGridDrag, type DragPreview, type DragSource } from '../components/planner/useGridDrag';
import { Button, toast } from '../components/ui';
import { addDays, parseISO, shortDate, toISO, weekOf } from '../logic/dates';
import { fillWeek, nextFreeSlot } from '../logic/planner';
import { formatClock } from '../logic/quickadd';
import { completionRate } from '../logic/session';
import { addBlock, updateBlock } from '../state/actions';
import type { PlannerBlock } from '../state/schema';
import { today, useApp } from '../state/store';
import '../styles/planner.css';

const MOBILE = '(max-width: 767px)';

function useIsMobile() {
  return useSyncExternalStore(
    (notify) => {
      const media = window.matchMedia(MOBILE);
      media.addEventListener('change', notify);
      return () => media.removeEventListener('change', notify);
    },
    () => window.matchMedia(MOBILE).matches,
  );
}

export default function Planner() {
  const blocks = useApp((s) => s.planner);
  const sessions = useApp((s) => s.sessions);
  const profile = useApp((s) => s.profile);
  const mobile = useIsMobile();

  const now = today();
  const todayISO = toISO(now);

  // The selected day: the week shown on desktop, and also the day listed on mobile.
  const [selected, setSelected] = useState(todayISO);
  const [openId, setOpenId] = useState<string | null>(null);
  const [revealId, setRevealId] = useState<string | null>(null);
  const [live, setLive] = useState('');
  const helpId = useId();

  const layerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const drag = useGridDrag(layerRef, scrollerRef);

  const week = useMemo(() => weekOf(parseISO(selected)), [selected]);
  const thisWeek = week.some((d) => toISO(d) === todayISO);
  const open = blocks.find((b) => b.id === openId) ?? null;
  const missed = useMemo(
    () => blocks.filter((b) => b.dateISO < todayISO && !b.done).sort((a, b) => b.dateISO.localeCompare(a.dateISO) || b.startMin - a.startMin),
    [blocks, todayISO],
  );

  const closeDialog = useCallback(() => setOpenId(null), []);

  const afterDelete = () => {
    setOpenId(null);
    // The block that opened the dialog is gone, so focus goes back to the page.
    requestAnimationFrame(() => (layerRef.current ?? document.getElementById('main'))?.focus({ preventScroll: true }));
  };

  const showBlock = (id: string, dateISO: string) => {
    setSelected(dateISO);
    setRevealId(id);
  };

  const addTemplate = (t: Template, dateISO: string, startMin: number) => {
    const { title, subject, minutes, activity } = t;
    return addBlock({ title, subject, minutes, activity, dateISO, startMin });
  };

  const pickTemplate = (t: Template) => {
    const start = nextFreeSlot(blocks, todayISO, t.minutes, nowMinutes(now));
    if (start === null) {
      toast('No free slot left today. Try another day.');
      return;
    }
    showBlock(addTemplate(t, todayISO, start), todayISO);
    toast(`${t.title} added at ${formatClock(start)}.`);
  };

  const onDrop = (p: DragPreview) => {
    const dateISO = toISO(week[p.day]);
    const { source } = p;
    if (source.kind === 'template') {
      addTemplate(source.template, dateISO, p.startMin);
      setLive(`${source.template.title} added on ${shortDay(dateISO)} at ${formatClock(p.startMin)}`);
    } else if (source.kind === 'move') {
      updateBlock(source.block.id, { dateISO, startMin: p.startMin });
      setLive(`${source.block.title} moved to ${shortDay(dateISO)}, ${formatClock(p.startMin)}`);
    } else {
      updateBlock(source.block.id, { minutes: p.minutes });
      setLive(`${source.block.title} is now ${p.minutes} min`);
    }
  };

  const beginDrag = (e: PointerEvent, source: DragSource) => drag.begin(e, source, onDrop);

  const moveMissed = (b: PlannerBlock) => {
    const slot = tomorrowSlot(blocks, b, now);
    if (!slot) {
      toast('Tomorrow is full. Open the block to pick another day.');
      return;
    }
    updateBlock(b.id, slot);
    showBlock(b.id, slot.dateISO);
    toast(`Moved to tomorrow at ${formatClock(slot.startMin)}.`);
  };

  const fill = () => {
    if (!profile) return;
    const rate = completionRate(sessions.filter((x) => x.date < todayISO).slice(-5));
    const added = fillWeek(week, now, profile.weekdayMinutes, profile.weekendMinutes, rate, blocks);
    added.forEach((b) => addBlock(b));
    if (added.length) {
      toast(`Added ${added.length} ${added.length === 1 ? 'block' : 'blocks'}. Move or delete any of them.`);
    } else {
      toast(toISO(week[6]) < todayISO ? 'That week has passed. Go to this week to fill it.' : 'This week already holds what fits.');
    }
  };

  const shiftWeek = (days: number) => setSelected(toISO(addDays(parseISO(selected), days)));

  return (
    <div className="pl-page">
      <div className="pl-top">
        <QuickAdd blocks={blocks} now={now} onAdded={showBlock} />
        <Button variant="primary" icon={CalendarRange} className="pl-fill" onClick={fill}>
          Fill my week
        </Button>
      </div>

      <Templates draggable={!mobile} onPick={pickTemplate} onGrab={(e, template) => beginDrag(e, { kind: 'template', template })} wasDragged={drag.wasDragged} />

      <MissedTray blocks={missed} onOpen={setOpenId} onMove={moveMissed} />

      <div className="pl-bar">
        <div className="pl-weeknav">
          <Button icon={ChevronLeft} className="pl-icon-btn" aria-label="Previous week" onClick={() => shiftWeek(-7)}>
            {null}
          </Button>
          <Button icon={ChevronRight} className="pl-icon-btn" aria-label="Next week" onClick={() => shiftWeek(7)}>
            {null}
          </Button>
          <h2 className="pl-weeklabel num" aria-live="polite">
            {shortDate(week[0])} to {shortDate(week[6])}
          </h2>
          {!thisWeek && (
            <Button variant="ghost" onClick={() => setSelected(todayISO)}>
              This week
            </Button>
          )}
        </div>
        {!mobile && (
          <p id={helpId} className="pl-help">
            Keys: arrows pick a slot or move a block, Shift + up or down resizes, Enter adds or opens, Delete removes.
          </p>
        )}
      </div>

      {mobile ? (
        <DayList week={week} now={now} selected={selected} blocks={blocks} onSelect={setSelected} onOpen={setOpenId} />
      ) : (
        <WeekGrid
          week={week}
          now={now}
          blocks={blocks}
          layerRef={layerRef}
          scrollerRef={scrollerRef}
          preview={drag.preview}
          helpId={helpId}
          revealId={revealId}
          beginDrag={beginDrag}
          wasDragged={drag.wasDragged}
          onOpen={setOpenId}
          onShowDay={setSelected}
          announce={setLive}
        />
      )}

      {drag.preview?.source.kind === 'template' && (
        <div className="pl-ghost" style={{ left: drag.preview.x, top: drag.preview.y }} aria-hidden>
          {drag.preview.source.template.title} · {drag.preview.source.template.minutes}m
        </div>
      )}

      <div className="sr-only" role="status" aria-live="polite">
        {live}
      </div>

      {open && <BlockDialog block={open} todayISO={todayISO} onClose={closeDialog} onDeleted={afterDelete} />}
    </div>
  );
}
