import { useState } from 'react';
import { CalendarPlus, Check, Plus } from 'lucide-react';
import { addBlock } from '../../state/actions';
import type { PlannerBlock } from '../../state/schema';
import { toISO, weekday } from '../../logic/dates';
import { nextFreeSlot } from '../../logic/planner';
import { formatClock, subjectOf } from '../../logic/quickadd';
import { Button, Empty, toast } from '../ui';
import { activityOf, dayWord, freeStart, setBlockDone, shortDay } from './model';
import { TitleField } from './TitleField';

const NEW_MINUTES = 45;
const countText = (n: number) => `${n} ${n === 1 ? 'block' : 'blocks'}`;

/** The planner under 768 px: a day picker and a list. Blocks are rescheduled from their dialog. */
export function DayList({
  week,
  now,
  selected,
  blocks,
  onSelect,
  onOpen,
}: {
  week: Date[];
  now: Date;
  selected: string;
  blocks: PlannerBlock[];
  onSelect: (iso: string) => void;
  onOpen: (id: string) => void;
}) {
  const [adding, setAdding] = useState<number | null>(null);
  const todayISO = toISO(now);
  const list = blocks.filter((b) => b.dateISO === selected).sort((a, b) => a.startMin - b.startMin);

  const startAdding = () => {
    const start = freeStart(blocks, selected, NEW_MINUTES, now) ?? nextFreeSlot(blocks, selected, NEW_MINUTES);
    if (start === null) toast('This day is full.');
    else setAdding(start);
  };

  return (
    <div className="pl-daylist">
      <div className="pl-daypick" role="group" aria-label="Pick a day">
        {week.map((d) => {
          const iso = toISO(d);
          const count = blocks.filter((b) => b.dateISO === iso).length;
          return (
            <button
              key={iso}
              type="button"
              className={`pl-dayopt${iso === todayISO ? ' is-today' : ''}`}
              aria-pressed={iso === selected}
              aria-label={`${shortDay(iso)}${iso === todayISO ? ', today' : ''}, ${countText(count)}`}
              onClick={() => {
                setAdding(null);
                onSelect(iso);
              }}
            >
              <span>{weekday(d)}</span>
              <b className="num">{d.getDate()}</b>
              <i className={count ? 'has-blocks' : undefined} aria-hidden />
            </button>
          );
        })}
      </div>

      <div className="row-between">
        <h2 className="section-title">
          {dayWord(selected, now)} <span className="muted small">· {countText(list.length)}</span>
        </h2>
        <Button icon={Plus} onClick={startAdding}>
          Add block
        </Button>
      </div>

      {adding !== null && (
        <div className="pl-row pl-row-new">
          <span className="pl-row-time num">{formatClock(adding)}</span>
          <TitleField
            className="input"
            label={`Title for the block on ${shortDay(selected)} at ${formatClock(adding)}`}
            onSave={(title) => {
              addBlock({ title, subject: subjectOf(title), dateISO: selected, startMin: adding, minutes: NEW_MINUTES, activity: activityOf(title) });
              setAdding(null);
            }}
            onCancel={() => setAdding(null)}
          />
        </div>
      )}

      {list.length === 0 && adding === null ? (
        <Empty icon={CalendarPlus} text="Nothing planned yet. Add a block or pick a template." />
      ) : (
        <ul className="pl-rows-list">
          {list.map((b) => (
            <li key={b.id} className={`pl-row s-${b.subject.toLowerCase()}${b.done ? ' is-done' : ''}`}>
              <button
                type="button"
                className="pl-check"
                aria-pressed={b.done}
                aria-label={`${b.title}: ${b.done ? 'mark not done' : 'mark done'}`}
                onClick={() => setBlockDone(b.id, !b.done, todayISO)}
              >
                {b.done && <Check size={16} strokeWidth={1.5} aria-hidden />}
              </button>
              <button type="button" className="pl-row-main" onClick={() => onOpen(b.id)}>
                <span className="pl-row-title">{b.title}</span>
                <span className="pl-row-meta">
                  {b.subject} · {formatClock(b.startMin)} · {b.minutes} min
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
