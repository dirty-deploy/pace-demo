import { useId, useState } from 'react';
import { addBlock } from '../../state/actions';
import type { PlannerBlock } from '../../state/schema';
import { activityOf, parseBlock, quickAddChip } from './model';

export function QuickAdd({ blocks, now, onAdded }: { blocks: PlannerBlock[]; now: Date; onAdded: (id: string, dateISO: string) => void }) {
  const [text, setText] = useState('');
  const id = useId();
  const typed = text.trim().length > 0;
  const parsed = typed ? parseBlock(text, now, blocks) : null;

  const save = () => {
    if (!parsed) return;
    const { title, subject, dateISO, startMin, minutes } = parsed;
    const blockId = addBlock({ title, subject, dateISO, startMin, minutes, activity: activityOf(title) });
    setText('');
    onAdded(blockId, dateISO);
  };

  return (
    <form
      className="pl-quick"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <label className="sr-only" htmlFor={`${id}-input`}>
        Quick add a study block
      </label>
      <input
        id={`${id}-input`}
        className="input"
        value={text}
        placeholder="Try: DILR sets 7pm 45m"
        autoComplete="off"
        aria-describedby={id}
        onChange={(e) => setText(e.target.value)}
      />
      <div id={id} className="pl-quick-line" aria-live="polite">
        {parsed ? (
          <>
            <span className="pl-chip">{quickAddChip(parsed, now)}</span>
            <span className="pl-quick-hint">Enter saves</span>
          </>
        ) : typed ? (
          <span>That needs a title as well, for example RC tomorrow 8:30 30m.</span>
        ) : (
          <span>Days work too: RC tomorrow 8:30 30m.</span>
        )}
      </div>
    </form>
  );
}
