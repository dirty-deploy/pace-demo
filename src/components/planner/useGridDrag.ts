import { useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';
import { DAY_END, DAY_START, SLOT } from '../../logic/planner';
import type { PlannerBlock } from '../../state/schema';
import { snapLength, snapStart, type Template } from './model';

export type DragSource =
  | { kind: 'move'; block: PlannerBlock }
  | { kind: 'resize'; block: PlannerBlock; day: number }
  | { kind: 'template'; template: Template };

export type DragPreview = {
  source: DragSource;
  day: number;
  startMin: number;
  minutes: number;
  /** Pointer position, kept only for the template ghost. */
  x: number;
  y: number;
  /** False when a template is held outside the grid; dropping there does nothing. */
  inside: boolean;
};

const THRESHOLD = 6;
const EDGE = 48;
const SPEED = 8;

const same = (a: DragPreview | null, b: DragPreview) =>
  !!a && a.day === b.day && a.startMin === b.startMin && a.minutes === b.minutes && a.x === b.x && a.y === b.y && a.inside === b.inside;

/**
 * One path for moving a block, resizing it and dropping a template. Everything is read from the
 * pointer against the grid's live rectangle, so scrolling mid-drag needs no special handling.
 */
export function useGridDrag(layerRef: RefObject<HTMLDivElement | null>, scrollerRef: RefObject<HTMLDivElement | null>) {
  const [preview, setPreview] = useState<DragPreview | null>(null);
  const dragged = useRef(false);

  const begin = (e: ReactPointerEvent, source: DragSource, onDrop: (p: DragPreview) => void) => {
    const layer = layerRef.current;
    const scroller = scrollerRef.current;
    if (e.button !== 0 || !layer || !scroller) return;
    const from = { x: e.clientX, y: e.clientY };
    let x = from.x;
    let y = from.y;
    let active = false;
    let raf = 0;
    let arrived = source.kind !== 'template';
    let last: DragPreview | null = null;

    const minuteAt = (py: number) => {
      const r = layer.getBoundingClientRect();
      return DAY_START + ((py - r.top) / r.height) * (DAY_END - DAY_START);
    };
    const grab = source.kind === 'move' ? minuteAt(from.y) - source.block.startMin : 0;

    const read = (): DragPreview => {
      const r = layer.getBoundingClientRect();
      const day = Math.max(0, Math.min(6, Math.floor(((x - r.left) / r.width) * 7)));
      if (source.kind === 'resize') {
        const { startMin } = source.block;
        return { source, day: source.day, startMin, minutes: snapLength(minuteAt(y), startMin), x: 0, y: 0, inside: true };
      }
      if (source.kind === 'move') {
        const { minutes } = source.block;
        return { source, day, startMin: snapStart(minuteAt(y) - grab, minutes), minutes, x: 0, y: 0, inside: true };
      }
      const { minutes } = source.template;
      const box = scroller.getBoundingClientRect();
      const inside = x >= r.left && x <= r.right && y >= Math.max(r.top, box.top) && y <= Math.min(r.bottom, box.bottom);
      return { source, day, startMin: snapStart(Math.floor(minuteAt(y) / SLOT) * SLOT, minutes), minutes, x, y, inside };
    };

    const tick = () => {
      const box = scroller.getBoundingClientRect();
      // A template arrives through the top edge, which must not scroll the slot away from under it.
      if (y >= box.top + EDGE && y <= box.bottom - EDGE) arrived = true;
      const holding = arrived && (source.kind !== 'template' || (y >= box.top && y <= box.bottom));
      if (holding && y < box.top + EDGE) scroller.scrollTop -= SPEED;
      else if (holding && y > box.bottom - EDGE) scroller.scrollTop += SPEED;
      const next = read();
      if (!same(last, next)) {
        last = next;
        setPreview(next);
      }
      raf = requestAnimationFrame(tick);
    };

    const onMove = (ev: PointerEvent) => {
      x = ev.clientX;
      y = ev.clientY;
      if (!active && Math.hypot(x - from.x, y - from.y) >= THRESHOLD) {
        active = true;
        dragged.current = true;
        document.body.classList.add('pl-dragging');
        raf = requestAnimationFrame(tick);
      }
    };

    const stop = (commit: boolean) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('keydown', onKey);
      if (!active) return;
      cancelAnimationFrame(raf);
      document.body.classList.remove('pl-dragging');
      setPreview(null);
      // The click that follows pointerup belongs to the drag, not to a slot or a block.
      window.setTimeout(() => {
        dragged.current = false;
      }, 0);
      if (commit) {
        const final = read();
        if (final.inside) onDrop(final);
      }
    };
    const onUp = () => stop(true);
    const onCancel = () => stop(false);
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') stop(false);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('keydown', onKey);
  };

  return { preview, begin, wasDragged: () => dragged.current };
}
