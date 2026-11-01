import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, History } from 'lucide-react';
import { Button, Chip, Empty, Tag } from '../components/ui';
import { parseISO, shortDate, toISO, weekday } from '../logic/dates';
import { useApp } from '../state/store';
import type { Section } from '../content/types';
import type { TestType } from '../state/schema';
import '../styles/review.css';

const TYPES: { id: TestType | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'mock', label: 'Full mocks' },
  { id: 'sectional', label: 'Sectional' },
  { id: 'topic', label: 'Topic tests' },
  { id: 'daily', label: 'Daily sets' },
  { id: 'redo', label: 'Redos' },
];

const SECTIONS: (Section | 'all')[] = ['all', 'VARC', 'DILR', 'QA'];
const RANGES = [
  { id: 0, label: 'Any date' },
  { id: 7, label: 'Last 7 days' },
  { id: 30, label: 'Last 30 days' },
];

export default function Review() {
  const attempts = useApp((s) => s.attempts);
  const [type, setType] = useState<TestType | 'all'>('all');
  const [section, setSection] = useState<Section | 'all'>('all');
  const [range, setRange] = useState(0);

  const rows = useMemo(() => {
    const cutoff = range ? Date.now() - range * 86_400_000 : 0;
    return [...attempts]
      .reverse()
      .filter((a) => (type === 'all' || a.type === type) && (section === 'all' || a.sections.some((s) => s.section === section)) && a.endedAt >= cutoff);
  }, [attempts, type, section, range]);

  if (!attempts.length) {
    return <Empty icon={History} text="Your attempts will appear here, each with a replay and a review of every question." action={<Button to="/practice/daily">Start a daily set</Button>} />;
  }

  return (
    <div className="stack">
      <div className="stack review-filters">
        <div className="chips" role="group" aria-label="Filter by type">
          {TYPES.map((t) => (
            <Chip key={t.id} selected={type === t.id} onClick={() => setType(t.id)}>
              {t.label}
            </Chip>
          ))}
        </div>
        <div className="row">
          <div className="chips" role="group" aria-label="Filter by section">
            {SECTIONS.map((s) => (
              <Chip key={s} selected={section === s} onClick={() => setSection(s)}>
                {s === 'all' ? 'All sections' : s}
              </Chip>
            ))}
          </div>
          <select className="select review-range" value={range} onChange={(e) => setRange(Number(e.target.value))} aria-label="Filter by date">
            {RANGES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {rows.length ? (
        <ul className="attempt-list">
          {rows.map((a) => {
            const d = parseISO(toISO(new Date(a.endedAt)));
            return (
              <li key={a.id}>
                <Link to={`/progress/review/${a.id}`} className="attempt-row">
                  <span className="grow">
                    <b>{a.testName}</b>
                    <span className="small muted">
                      {weekday(d)} {shortDate(d)} · {a.sections.map((s) => s.section).join(', ')}
                    </span>
                  </span>
                  {a.reviewed && <Tag tone="ok">Reviewed</Tag>}
                  <span className="num attempt-score">
                    {a.score} / {a.max}
                  </span>
                  <ChevronRight size={18} strokeWidth={1.5} aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="muted">No attempts match these filters.</p>
      )}
    </div>
  );
}
