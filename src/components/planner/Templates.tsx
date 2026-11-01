import type { PointerEvent } from 'react';
import { GripVertical } from 'lucide-react';
import { TEMPLATES, type Template } from './model';

/** Click puts a template in today's next free slot; on the week grid it can also be dragged. */
export function Templates({
  draggable,
  onPick,
  onGrab,
  wasDragged,
}: {
  draggable: boolean;
  onPick: (t: Template) => void;
  onGrab: (e: PointerEvent, t: Template) => void;
  wasDragged: () => boolean;
}) {
  const hint = draggable ? 'Click to add to the next free slot today, or drag onto the calendar.' : 'Tap to add to the next free slot today.';
  return (
    <div className="pl-templates" role="group" aria-label={`Templates. ${hint}`}>
      <span className="pl-templates-label">Templates</span>
      <div className="pl-template-list">
        {TEMPLATES.map((t) => (
          <button
            key={t.title}
            type="button"
            className={`chip pl-template${draggable ? ' is-draggable' : ''}`}
            title={hint}
            onPointerDown={draggable ? (e) => onGrab(e, t) : undefined}
            onClick={() => {
              if (!wasDragged()) onPick(t);
            }}
          >
            {draggable && <GripVertical size={14} strokeWidth={1.5} aria-hidden />}
            {t.title} · {t.minutes}m
          </button>
        ))}
      </div>
    </div>
  );
}
