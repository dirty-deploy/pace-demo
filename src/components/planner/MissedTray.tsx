import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { PlannerBlock } from '../../state/schema';
import { Button } from '../ui';
import { blockTime } from './model';

const SHOWN = 3;

export function MissedTray({ blocks, onOpen, onMove }: { blocks: PlannerBlock[]; onOpen: (id: string) => void; onMove: (b: PlannerBlock) => void }) {
  const [all, setAll] = useState(false);
  if (!blocks.length) return null;
  const list = all ? blocks : blocks.slice(0, SHOWN);
  return (
    <section className="pl-missed" aria-labelledby="pl-missed-title">
      <div className="pl-missed-head">
        <h2 id="pl-missed-title" className="pl-missed-title">
          Missed <span className="num muted">{blocks.length}</span>
        </h2>
        {blocks.length > SHOWN && !all && (
          <Button variant="ghost" onClick={() => setAll(true)}>
            Show all {blocks.length}
          </Button>
        )}
      </div>
      <ul className="pl-missed-list">
        {list.map((b) => (
          <li key={b.id}>
            <button type="button" className="pl-missed-name" onClick={() => onOpen(b.id)}>
              <span>{b.title}</span>
              <small>{blockTime(b)}</small>
            </button>
            <Button variant="ghost" icon={ArrowRight} onClick={() => onMove(b)} aria-label={`Move ${b.title} to tomorrow`}>
              Move to tomorrow
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
