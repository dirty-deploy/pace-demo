import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getQuestion } from '../content';
import { MOCKS, SECTIONALS, testDifficulty, testMinutes, testQuestions, TOPIC_TESTS } from '../content/tests';
import type { Difficulty, Section } from '../content/types';
import { Button, Chip, DifficultyTag, Tabs, Tag } from '../components/ui';
import { useApp } from '../state/store';
import type { AppState, TestDef } from '../state/schema';
import '../styles/tests.css';

type Tab = 'mocks' | 'sectional' | 'topic';
type Status = 'Not started' | 'In progress' | 'Done';

const TAB_LIST: { id: Tab; label: string }[] = [
  { id: 'mocks', label: 'Full mocks' },
  { id: 'sectional', label: 'Sectional' },
  { id: 'topic', label: 'Topic tests' },
];

const LISTS: Record<Tab, TestDef[]> = { mocks: MOCKS, sectional: SECTIONALS, topic: TOPIC_TESTS };

function statusOf(def: TestDef, s: AppState) {
  const last = [...s.attempts].reverse().find((a) => a.testId === def.id);
  const status: Status = s.active[def.id] ? 'In progress' : last ? 'Done' : 'Not started';
  return { status, last };
}

function Row({ def, s }: { def: TestDef; s: AppState }) {
  const { status, last } = statusOf(def, s);
  const locked = def.id === 'mock-2' && !s.attempts.some((a) => a.testId === 'mock-1') && !s.purchases.mockUnlocked;
  const statusText = status === 'Done' && last ? `Done · ${last.score} / ${last.max}` : locked ? 'Opens after Mock 1' : status;
  return (
    <li className="test-row">
      <span className="grow">
        <b>{def.name}</b>
        <span className="small muted num">
          {testQuestions(def).length} questions · {testMinutes(def)} min
        </span>
      </span>
      <DifficultyTag level={testDifficulty(def)} />
      <Tag tone={status === 'Done' ? 'ok' : status === 'In progress' ? 'primary' : undefined}>{statusText}</Tag>
      {status === 'Done' && last ? (
        <Button to={`/progress/review/${last.id}`}>Review</Button>
      ) : (
        <Button to={`/test/${def.id}`}>{status === 'In progress' ? 'Resume' : 'Start'}</Button>
      )}
    </li>
  );
}

export default function Tests() {
  const [params, setParams] = useSearchParams();
  const s = useApp();
  const raw = params.get('tab');
  const tab: Tab = raw === 'sectional' || raw === 'topic' ? raw : 'mocks';
  const [section, setSection] = useState<Section | 'all'>('all');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [topic, setTopic] = useState('all');

  const topics = useMemo(() => [...new Set(TOPIC_TESTS.flatMap((t) => testQuestions(t).map((id) => getQuestion(id).topic)))].sort(), []);

  const rows = LISTS[tab].filter((def) => {
    const ids = testQuestions(def);
    return (
      (section === 'all' || def.sections.some((x) => x.section === section)) &&
      (difficulty === 'all' || testDifficulty(def) === difficulty) &&
      (status === 'all' || statusOf(def, s).status === status) &&
      (topic === 'all' || ids.some((id) => getQuestion(id).topic === topic))
    );
  });

  return (
    <div className="stack">
      <Tabs label="Test type" tabs={TAB_LIST} value={tab} onChange={(t) => setParams({ tab: t }, { replace: true })} />
      <div className="row test-filters">
        {tab !== 'mocks' && (
          <div className="chips" role="group" aria-label="Section">
            {(['all', 'VARC', 'DILR', 'QA'] as const).map((x) => (
              <Chip key={x} selected={section === x} onClick={() => setSection(x)}>
                {x === 'all' ? 'All sections' : x}
              </Chip>
            ))}
          </div>
        )}
        {tab === 'topic' && (
          <select className="select test-select" value={topic} onChange={(e) => setTopic(e.target.value)} aria-label="Topic">
            <option value="all">All topics</option>
            {topics.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        )}
        <select className="select test-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty | 'all')} aria-label="Difficulty">
          <option value="all">Any difficulty</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
        <select className="select test-select" value={status} onChange={(e) => setStatus(e.target.value as Status | 'all')} aria-label="Status">
          <option value="all">Any status</option>
          <option>Not started</option>
          <option>In progress</option>
          <option>Done</option>
        </select>
      </div>
      {tab === 'mocks' && <p className="small muted">Each mock has 12 RC and 12 verbal questions in VARC, a mix set by the size of our question bank. Sectionals reuse some mock questions.</p>}
      {rows.length ? (
        <ul className="test-list">
          {rows.map((d) => (
            <Row key={d.id} def={d} s={s} />
          ))}
        </ul>
      ) : (
        <p className="muted">No tests match these filters.</p>
      )}
    </div>
  );
}
