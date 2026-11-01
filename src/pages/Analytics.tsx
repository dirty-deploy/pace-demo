import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BarChart3, Clock, ListChecks, TrendingUp, Timer } from 'lucide-react';
import { Button, Empty, Stat, Tabs, Tag, type TabDef } from '../components/ui';
import { questionById, setById } from '../content';
import { LESSON_QUESTIONS, LESSONS } from '../content/lessons';
import { TOPIC_TESTS, testMinutes } from '../content/tests';
import type { Question, Section } from '../content/types';
import { MIN_ATTEMPTS, topicRows, type AnsweredItem, type TopicRow } from '../logic/analytics';
import { mSS } from '../logic/cap';
import { parseISO, shortDate } from '../logic/dates';
import { formatHours } from '../logic/streak';
import { todayISO } from '../state/actions';
import type { AppState, AttemptRecord, ExamName, RedoEntry, TestType } from '../state/schema';
import { today, useApp } from '../state/store';
import '../styles/analytics.css';

type Tab = 'score' | 'time' | 'topics' | 'caps';

const TABS: TabDef<Tab>[] = [
  { id: 'score', label: 'Score trend' },
  { id: 'time', label: 'Time per section' },
  { id: 'topics', label: 'Accuracy by topic' },
  { id: 'caps', label: 'Time lost to caps' },
];

const EXAMS: ExamName[] = ['CAT 2026', 'XAT 2027'];

const TYPES: { id: TestType | 'all'; label: string }[] = [
  { id: 'all', label: 'All tests' },
  { id: 'mock', label: 'Full mocks' },
  { id: 'sectional', label: 'Sectional' },
  { id: 'topic', label: 'Topic tests' },
  { id: 'daily', label: 'Daily sets' },
  { id: 'redo', label: 'Redos' },
];

const RANGES = [
  { id: 0, label: 'Any date' },
  { id: 7, label: 'Last 7 days' },
  { id: 30, label: 'Last 30 days' },
];

const SECTIONS: Section[] = ['VARC', 'DILR', 'QA'];
const MS_DAY = 86_400_000;

const LESSON_LOOKUP = new Map<string, Question>(LESSON_QUESTIONS.map((q) => [q.id, q]));
const findQuestion = (id: string) => questionById(id) ?? LESSON_LOOKUP.get(id);

const percent = (share: number) => `${Math.round(share * 100)}%`;
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

// ---- Chart helpers ----

/** Charts draw at real pixel size, so their text stays readable at 390 px. */
function useWidth<T extends HTMLElement>(fallback = 560) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setWidth(Math.round(el.getBoundingClientRect().width) || fallback);
    read();
    const watcher = new ResizeObserver(read);
    watcher.observe(el);
    return () => watcher.disconnect();
  }, [fallback]);
  return [ref, width] as const;
}

/** A tick step that gives at most four intervals. */
function tickStep(range: number): number {
  return [10, 20, 25, 50, 100].find((step) => range / step <= 4) ?? 100;
}

type ScorePoint = { id: string; name: string; date: string; score: number; max: number };

function ScoreChart({ points }: { points: ScorePoint[] }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const height = 264;
  const margin = { top: 32, right: 32, bottom: 52, left: 40 };
  const plotW = Math.max(40, width - margin.left - margin.right);
  const plotH = height - margin.top - margin.bottom;

  const scores = points.map((p) => p.score);
  const step = tickStep(Math.max(...scores, 0) - Math.min(...scores, 0) || 40);
  const yMin = Math.floor(Math.min(0, ...scores) / step) * step;
  const yMax = Math.max(Math.ceil(Math.max(...scores, 1) / step) * step, yMin + step);
  const ticks = Array.from({ length: Math.round((yMax - yMin) / step) + 1 }, (_, i) => yMin + i * step);

  // Inset so the first score label clears the axis ticks.
  const inset = 24;
  const x = (i: number) => margin.left + (points.length === 1 ? plotW / 2 : inset + ((plotW - inset * 2) * i) / (points.length - 1));
  const y = (v: number) => margin.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i)} ${y(p.score)}`).join(' ');

  // Axis labels thin out when points are close. Scores stay on every point.
  const every = Math.max(1, Math.ceil(72 / (plotW / Math.max(1, points.length - 1 || 1))));
  const showAxis = (i: number) => i === points.length - 1 || (i % every === 0 && points.length - 1 - i >= every);

  const summary = points.map((p) => `${p.name}, ${p.date}: ${p.score} of ${p.max}`).join('. ');

  return (
    <div ref={ref} className="an-chart">
      <svg role="img" aria-label={`Score by mock. ${summary}.`} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line className="an-grid-line" x1={margin.left} x2={width - margin.right} y1={y(t)} y2={y(t)} />
            <text className="an-axis" x={margin.left - 8} y={y(t) + 4} textAnchor="end">
              {t}
            </text>
          </g>
        ))}
        {points.length > 1 && <path className="an-line" d={line} />}
        {points.map((p, i) => (
          <g key={p.id}>
            <title>{`${p.name}, ${p.date}: ${p.score} of ${p.max}`}</title>
            <circle className="an-point" cx={x(i)} cy={y(p.score)} r={5} />
            <text className="an-value" x={x(i)} y={y(p.score) - 12} textAnchor="middle">
              {p.score}
            </text>
            {showAxis(i) && (
              <text className="an-axis" x={x(i)} y={height - 28} textAnchor="middle">
                <tspan x={x(i)}>{p.name}</tspan>
                <tspan x={x(i)} dy={15}>
                  {p.date}
                </tspan>
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

type BarRow = { id: string; label: string; value: number; text: string };

/** Horizontal bars with the value written at the end of each label line. */
function Bars({ rows, tone, label }: { rows: BarRow[]; tone: 'primary' | 'warn'; label: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const rowH = 52;
  const barH = 12;
  const max = Math.max(1, ...rows.map((r) => r.value));
  const room = Math.floor(width / 15);
  const fit = (s: string) => (s.length > room ? `${s.slice(0, room - 1).trim()}…` : s);
  const summary = rows.map((r) => `${r.label}: ${r.text}`).join('. ');
  return (
    <div ref={ref} className="an-chart">
      <svg role="img" aria-label={`${label}. ${summary}.`} width={width} height={rows.length * rowH} viewBox={`0 0 ${width} ${rows.length * rowH}`}>
        {rows.map((r, i) => {
          const top = i * rowH + 26;
          const w = Math.max(4, (r.value / max) * width);
          const end = Math.min(4, w);
          return (
            <g key={r.id}>
              <title>{`${r.label}: ${r.text}`}</title>
              <text className="an-bar-label" x={0} y={top - 8}>
                {fit(r.label)}
              </text>
              <text className="an-bar-value" x={width} y={top - 8} textAnchor="end">
                {r.text}
              </text>
              <path
                className={`an-bar an-bar-${tone}`}
                d={`M0 ${top} H${w - end} Q${w} ${top} ${w} ${top + end} V${top + barH - end} Q${w} ${top + barH} ${w - end} ${top + barH} H0 Z`}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---- Derived data ----

function scorePoints(attempts: AttemptRecord[]): ScorePoint[] {
  return attempts
    .filter((a) => a.type === 'mock')
    .sort((a, b) => a.endedAt - b.endedAt)
    .map((a) => ({ id: a.id, name: a.testName.replace('Full mock', 'Mock'), date: shortDate(new Date(a.endedAt)), score: a.score, max: a.max }));
}

function trendLine(points: ScorePoint[]): string {
  const last = points[points.length - 1];
  if (points.length === 1) return `One mock so far: ${last.score} of ${last.max}. Take another to see a trend.`;
  const change = last.score - points[points.length - 2].score;
  const move = change === 0 ? 'level with' : `${change > 0 ? 'up' : 'down'} ${Math.abs(change)} from`;
  return `Latest score ${last.score} of ${last.max}, ${move} the mock before.`;
}

function sectionRows(attempts: AttemptRecord[]): BarRow[] {
  return SECTIONS.flatMap((section) => {
    const parts = attempts.flatMap((a) => a.sections.filter((s) => s.section === section));
    const seconds = parts.reduce((t, s) => t + s.seconds, 0);
    const questions = parts.reduce((t, s) => t + s.correct + s.wrong + s.skipped, 0);
    if (!questions) return [];
    return [{ id: section, label: section, value: seconds, text: `${formatHours(seconds / 60)} · ${mSS(seconds / questions)} a question` }];
  });
}

function capReport(attempts: AttemptRecord[]) {
  const over = new Map<string, number>();
  let tracked = 0;
  for (const a of attempts) {
    for (const t of a.dilr?.sets ?? []) {
      if (t.capSeconds <= 0) continue;
      tracked++;
      const extra = t.seconds - t.capSeconds;
      if (extra > 0) over.set(t.setId, (over.get(t.setId) ?? 0) + extra);
    }
  }
  const rows: BarRow[] = [...over.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id, seconds]) => ({ id, label: setById(id)?.title ?? id, value: seconds, text: `${(seconds / 60).toFixed(1)} min over` }));
  return { tracked, rows, totalMinutes: rows.reduce((t, r) => t + r.value, 0) / 60 };
}

type Step = { id: string; title: string; detail: string; cta: string; to: string };

function dueText(dueISO: string, iso: string): string {
  if (dueISO === iso) return 'due today';
  const date = shortDate(parseISO(dueISO));
  return dueISO < iso ? `was due ${date}` : `due ${date}`;
}

const redoStep = (r: RedoEntry, iso: string): Step => ({
  id: r.id,
  title: `Redo ${r.label}`,
  detail: `${dueText(r.dueISO, iso)} · ${r.minutes} min`,
  cta: 'Redo',
  to: `/redo/${r.id}`,
});

function topicStep(row: TopicRow): Step {
  const test = TOPIC_TESTS.find((t) => t.sections[0].questionIds.some((id) => questionById(id)?.topic === row.topic));
  const why = `${row.label}: ${percent(row.accuracy ?? 0)} over ${row.attempts} attempts`;
  return test
    ? { id: row.topic, title: `Practise ${row.topic}`, detail: `${why} · ${testMinutes(test)} min`, cta: 'Start test', to: `/test/${test.id}` }
    : { id: row.topic, title: `Practise ${row.topic}`, detail: `${why} · daily set`, cta: 'Open daily set', to: '/practice/daily' };
}

/** Three actions in priority order: redo items due, the weakest labelled topic, the next lesson. */
function nextSteps(s: AppState, rows: TopicRow[], iso: string): Step[] {
  const open = s.redo.filter((r) => !r.done).sort((a, b) => a.dueISO.localeCompare(b.dueISO));
  const weakest = rows
    .filter((r) => r.attempts >= MIN_ATTEMPTS && r.label !== 'Strength')
    .sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0))[0];
  const lesson = LESSONS.find((l) => !s.lessons[l.id]?.done);
  const steps: Step[] = [
    ...open.filter((r) => r.dueISO <= iso).map((r) => redoStep(r, iso)),
    ...(weakest ? [topicStep(weakest)] : []),
    ...(lesson
      ? [{ id: lesson.id, title: `Watch ${lesson.title}`, detail: `Lesson · ${Math.ceil(lesson.durationSeconds / 60)} min`, cta: 'Watch', to: `/learn/lessons/${lesson.id}` }]
      : []),
    ...open.filter((r) => r.dueISO > iso).map((r) => redoStep(r, iso)),
    { id: 'daily', title: 'Take a daily set', detail: 'Ten questions at your level · 20 min', cta: 'Open daily set', to: '/practice/daily' },
    { id: 'drill', title: 'Do the DILR set-pick drill', detail: 'Rank five sets · 4 min', cta: 'Start drill', to: '/practice/drill' },
  ];
  return steps.slice(0, 3);
}

// ---- Panels ----

function ScorePanel({ attempts }: { attempts: AttemptRecord[] }) {
  const points = scorePoints(attempts);
  if (!points.length) {
    return <Empty icon={TrendingUp} text="Your score trend will appear once a full mock is in this view." action={<Button to="/practice/tests">See full mocks</Button>} />;
  }
  return (
    <div className="stack">
      <ScoreChart points={points} />
      <p className="muted small">{trendLine(points)}</p>
    </div>
  );
}

function TimePanel({ attempts }: { attempts: AttemptRecord[] }) {
  const rows = sectionRows(attempts);
  if (!rows.length) return <Empty icon={Clock} text="Time per section will appear once a test is in this view." action={<Button to="/practice/tests">See all tests</Button>} />;
  return (
    <div className="stack">
      <Bars rows={rows} tone="primary" label="Time per section" />
      <p className="muted small">Total time in this view, and the average for each question you saw.</p>
    </div>
  );
}

function TopicsPanel({ rows, lessonNote }: { rows: TopicRow[]; lessonNote: string | null }) {
  if (!rows.length) return <Empty icon={ListChecks} text="Topics will appear once you answer a question in this view." action={<Button to="/practice/daily">Open daily set</Button>} />;
  return (
    <div className="stack">
      <div className="table-wrap">
        <table className="table an-table">
          <caption className="sr-only">Accuracy by topic</caption>
          <thead>
            <tr>
              <th scope="col">Topic</th>
              <th scope="col" className="an-num">
                Attempts
              </th>
              <th scope="col" className="an-num">
                Accuracy
              </th>
              <th scope="col">Label</th>
            </tr>
          </thead>
          {SECTIONS.map((section) => {
            const list = rows.filter((r) => r.section === section);
            if (!list.length) return null;
            return (
              <tbody key={section}>
                <tr className="an-group">
                  <th colSpan={4} scope="rowgroup">
                    {section}
                  </th>
                </tr>
                {list.map((r) => {
                  const labelled = r.attempts >= MIN_ATTEMPTS && r.accuracy !== null;
                  return (
                    <tr key={r.topic}>
                      <td>{r.topic}</td>
                      <td className="an-num">{r.attempts}</td>
                      <td className="an-num">
                        {labelled ? (
                          percent(r.accuracy as number)
                        ) : (
                          <span aria-label={`Shown after ${MIN_ATTEMPTS} attempts`} title={`Shown after ${MIN_ATTEMPTS} attempts`}>
                            –
                          </span>
                        )}
                      </td>
                      <td>
                        <Tag tone={r.label === 'Strength' ? 'ok' : r.label === 'Needs work' ? 'bad' : undefined}>{r.label}</Tag>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            );
          })}
        </table>
      </div>
      <p className="muted small">
        A topic gets a label after {MIN_ATTEMPTS} attempts. Skipped questions are not attempts. {lessonNote}
      </p>
    </div>
  );
}

function CapsPanel({ attempts }: { attempts: AttemptRecord[] }) {
  const { tracked, rows, totalMinutes } = capReport(attempts);
  if (!tracked) {
    return <Empty icon={Timer} text="This fills in after a DILR sectional or topic test. Full mocks have no caps, so they don't count here." action={<Button to="/practice/tests?tab=sectional">See sectionals</Button>} />;
  }
  return (
    <div className="stack">
      <div className="stats">
        <Stat value={totalMinutes.toFixed(1)} label="Minutes over cap" />
        <Stat value={`${rows.length} of ${tracked}`} label="Set attempts past the cap" />
      </div>
      {rows.length ? <Bars rows={rows} tone="warn" label="Minutes over cap per set" /> : <p>No set went past its cap in this view.</p>}
      <p className="muted small">Each cap is an estimate from a set's expected minutes and your own pace. Full mocks have no caps.</p>
    </div>
  );
}

function NextSteps({ steps }: { steps: Step[] }) {
  return (
    <section className="card an-steps" aria-labelledby="an-steps-title">
      <h2 className="section-title" id="an-steps-title">
        Next steps
      </h2>
      <ol>
        {steps.map((step, i) => (
          <li key={step.id}>
            <div className="grow">
              <b>{step.title}</b>
              <span className="small muted num">{step.detail}</span>
            </div>
            <Button variant={i === 0 ? 'primary' : 'secondary'} to={step.to}>
              {step.cta}
            </Button>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function Analytics() {
  const s = useApp();
  const [exam, setExam] = useState<ExamName>('CAT 2026');
  const [type, setType] = useState<TestType | 'all'>('all');
  const [range, setRange] = useState(0);
  const [tab, setTab] = useState<Tab>('score');

  const lessonItems = useMemo<AnsweredItem[]>(
    () => Object.values(s.lessons).flatMap((l) => Object.entries(l.practice ?? {}).map(([questionId, p]) => ({ questionId, correct: p.correct, seconds: 0 }))),
    [s.lessons],
  );

  // Attempts hold no exam field. Every test on Pace follows the CAT pattern, so they all file under CAT.
  const catView = exam === 'CAT 2026';
  const view = useMemo(() => {
    if (!catView) return [];
    const cutoff = range ? today().getTime() - range * MS_DAY : 0;
    return s.attempts.filter((a) => (type === 'all' || a.type === type) && a.endedAt >= cutoff);
  }, [s.attempts, catView, type, range]);

  // Lesson practice has no date or test type, so it only belongs in the widest view.
  const lessonsCount = catView && type === 'all' && range === 0;
  const rows = useMemo(() => {
    const items = view.flatMap((a) => a.questions.map((q): AnsweredItem => ({ questionId: q.id, correct: q.correct, seconds: q.seconds })));
    return topicRows(lessonsCount ? [...items, ...lessonItems] : items, findQuestion);
  }, [view, lessonItems, lessonsCount]);

  if (!s.attempts.length && !lessonItems.length) {
    return <Empty icon={BarChart3} text="Your charts will appear after your first test. A daily set is the quickest way to start." action={<Button variant="primary" to="/practice/daily">Open daily set</Button>} />;
  }

  const lessonNote = !lessonItems.length ? null : lessonsCount ? `Includes ${plural(lessonItems.length, 'lesson practice answer')}.` : 'Lesson practice has no date or test type, so it counts only under All tests and Any date.';
  const narrowed = type !== 'all' || range !== 0;
  const nothing = !view.length && !(lessonsCount && lessonItems.length);

  return (
    <div className="stack an-page">
      <form className="an-filters" aria-label="Filters" onSubmit={(e) => e.preventDefault()}>
        <label className="field">
          <span>Exam</span>
          <select className="select" value={exam} onChange={(e) => setExam(e.target.value as ExamName)}>
            {EXAMS.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Test type</span>
          <select className="select" value={type} onChange={(e) => setType(e.target.value as TestType | 'all')}>
            {TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Date range</span>
          <select className="select" value={range} onChange={(e) => setRange(Number(e.target.value))}>
            {RANGES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
      </form>

      <div className="an-layout">
        <section className="card an-main" aria-label="Your results">
          {!catView ? (
            <Empty
              icon={BarChart3}
              text="Every test on Pace follows the CAT pattern, so nothing is filed under XAT 2027. Your attempts are all under CAT 2026."
              action={<Button onClick={() => setExam('CAT 2026')}>Show CAT 2026</Button>}
            />
          ) : nothing ? (
            <Empty
              icon={BarChart3}
              text="No attempts match these filters."
              action={
                narrowed ? (
                  <Button
                    onClick={() => {
                      setType('all');
                      setRange(0);
                    }}
                  >
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="stack">
              <Tabs tabs={TABS} value={tab} onChange={setTab} label="Analytics views" />
              <div role="tabpanel" aria-label={TABS.find((t) => t.id === tab)?.label}>
                {tab === 'score' && <ScorePanel attempts={view} />}
                {tab === 'time' && <TimePanel attempts={view} />}
                {tab === 'topics' && <TopicsPanel rows={rows} lessonNote={lessonNote} />}
                {tab === 'caps' && <CapsPanel attempts={view} />}
              </div>
            </div>
          )}
        </section>
        <NextSteps steps={nextSteps(s, rows, todayISO())} />
      </div>
    </div>
  );
}
