import { Check, Play, Trash2 } from 'lucide-react';
import { removeBlock, updateBlock } from '../../state/actions';
import type { PlannerBlock } from '../../state/schema';
import { DAY_END, DAY_START, SLOT } from '../../logic/planner';
import { formatClock } from '../../logic/quickadd';
import { Button, Dialog, toast } from '../ui';
import { blockTime, setBlockDone } from './model';

const LENGTHS = [10, 15, 20, 30, 40, 45, 60, 75, 90, 120, 150, 180, 240];
const STARTS = Array.from({ length: (DAY_END - DAY_START) / SLOT }, (_, i) => DAY_START + i * SLOT);

const withCurrent = (list: number[], current: number) => Array.from(new Set([...list, current])).sort((a, b) => a - b);

/** Details for one block. The fields are the way to reschedule without dragging. */
export function BlockDialog({ block, todayISO, onClose, onDeleted }: { block: PlannerBlock; todayISO: string; onClose: () => void; onDeleted: () => void }) {
  const change = (patch: Partial<PlannerBlock>) => updateBlock(block.id, patch);

  const toggleDone = () => {
    setBlockDone(block.id, !block.done, todayISO);
    toast(block.done ? 'Marked not done.' : `Marked done. ${block.minutes} min added to today.`);
    onClose();
  };

  const remove = () => {
    removeBlock(block.id);
    toast(`Removed ${block.title}.`);
    onDeleted();
  };

  return (
    <Dialog
      title={block.title}
      onClose={onClose}
      actions={
        <>
          <Button variant="ghost" icon={Trash2} className="pl-dlg-delete" onClick={remove}>
            Delete
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button variant={block.activity ? 'secondary' : 'primary'} icon={Check} onClick={toggleDone}>
            {block.done ? 'Mark not done' : 'Mark done'}
          </Button>
          {block.activity && (
            <Button variant="primary" icon={Play} to={block.activity}>
              Start now
            </Button>
          )}
        </>
      }
    >
      <p className="muted">
        {block.subject} · {blockTime(block)}
        {block.done ? ' · Done' : ''}
      </p>
      <div className="pl-dlg-fields">
        <label className="field">
          <span>Day</span>
          <input
            className="input"
            type="date"
            value={block.dateISO}
            onChange={(e) => {
              if (e.target.value) change({ dateISO: e.target.value });
            }}
          />
        </label>
        <label className="field">
          <span>Start</span>
          <select
            className="select"
            value={block.startMin}
            onChange={(e) => {
              const startMin = Number(e.target.value);
              change({ startMin, minutes: Math.min(block.minutes, DAY_END - startMin) });
            }}
          >
            {withCurrent(STARTS, block.startMin).map((m) => (
              <option key={m} value={m}>
                {formatClock(m)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Length</span>
          <select className="select" value={block.minutes} onChange={(e) => change({ minutes: Number(e.target.value) })}>
            {withCurrent(LENGTHS, block.minutes)
              .filter((m) => block.startMin + m <= DAY_END)
              .map((m) => (
                <option key={m} value={m}>
                  {m} min
                </option>
              ))}
          </select>
        </label>
      </div>
    </Dialog>
  );
}
