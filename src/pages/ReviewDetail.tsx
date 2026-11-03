import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, Bookmark, Check, ChevronUp, CornerDownRight, Minus, X } from 'lucide-react';
import { COMMUNITY_ANSWERS } from '../content/community';
import { getQuestion, groupOf, setById } from '../content';
import { CONCEPT_SECONDS, lessonById } from '../content/lessons';
import type { Question } from '../content/types';
import { usePageTitle } from '../components/Shell';
import { Button, Chip, DifficultyTag, SampleTag, Stat, Tabs, Tag, toast } from '../components/ui';
import { GroupBody } from '../components/test/Stimulus';
import { VocabText } from '../components/VocabText';
import { mSS } from '../logic/cap';
import { shortDate, parseISO, weekday } from '../logic/dates';
import { distributionFor } from '../logic/distribution';
import { addCommunityAnswer, earnCoins, saveLineToNotes, toggleUpvote } from '../state/actions';
import { addRedoToPlan, redoFor, startComparisonOf, startRedo, unitLabel, unitsOf } from '../state/replayView';
import { update, useApp } from '../state/store';
import type { AttemptQuestion, AttemptRecord } from '../state/schema';
import '../styles/review.css';

// ---- Replay tab ----

function TimeBars({ rows }: { rows: { label: string; seconds: number; note?: string }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.seconds));
  return (
    <ul className="time-bars">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="row-between small">
            <span>{r.label}</span>
            <span className="num muted">
              {mSS(r.seconds)}
              {r.note ? ` · ${r.note}` : ''}
            </span>
          </div>
          <div className="progress">
            <i style={{ width: `${(r.seconds / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ReplayTab({ record }: { record: AttemptRecord }) {
  const nav = useNavigate();
  const redo = useApp((s) => s.redo);
  const units = useMemo(() => unitsOf(record), [record]);
  const sets = units.filter((u) => u.section === 'DILR');
  const items = useMemo(() => redoFor(record), [record]);
  const compare = startComparisonOf(record);
  const hits = record.dilr?.sets.filter((t) => t.hitCap) ?? [];
  const stalled = record.dilr?.sets.find((t) => t.stalledClue !== null);
  const stalledSet = stalled ? setById(stalled.setId) : undefined;
  const clues = stalledSet?.stimulus.flatMap((b) => (b.type === 'list' ? b.items : [])) ?? [];
  const allAdded = items.every((i) => redo.some((r) => r.id === i.id));

  return (
    <div className="stack replay">
      <section className="card">
        <h2 className="card-title">Where the time went</h2>
        <TimeBars rows={record.sections.map((s) => ({ label: s.section, seconds: s.seconds }))} />
        {sets.length > 0 && (
          <>
            <h3 className="replay-sub">DILR, set by set</h3>
            <TimeBars
              rows={sets.map((u) => ({
                label: u.label,
                seconds: u.seconds,
                note: `expected ${mSS(u.expectedMinutes * 60)}`,
              }))}
            />
          </>
        )}
      </section>

      {compare && (
        <section className="card">
          <h2 className="card-title">The start you chose</h2>
          <p>
            You started with {unitLabel(compare.yourFirst)}. {compare.same ? 'That is also the recommended start.' : `The recommended start was ${unitLabel(compare.recommendedFirst)}.`}
          </p>
          <p className="small muted">
            Your order agreed with the recommended order on {compare.agree.concordant} of {compare.agree.pairs} pairs of sets.
          </p>
        </section>
      )}

      {record.dilr && (
        <section className="card">
          <h2 className="card-title">Caps and stalls</h2>
          {hits.length ? (
            <ul className="stack-tight">
              {hits.map((t) => (
                <li key={t.setId}>
                  {unitLabel(t.setId)}: reached the {mSS(t.capSeconds)} cap{t.extended ? ', took the extra 2 minutes' : ''}
                  {t.left ? ', then left the set.' : '.'}
                </li>
              ))}
            </ul>
          ) : (
            <p>No caps reached in this attempt.</p>
          )}
          {stalled && stalledSet ? (
            <p className="replay-stall">
              Progress stopped on clue {(stalled.stalledClue as number) + 1} of {stalledSet.title}: "{clues[stalled.stalledClue as number]}"
            </p>
          ) : (
            <p className="small muted">No clue was marked. Use "I'm on this clue" during a set and it will show here.</p>
          )}
        </section>
      )}

      <section className="card">
        <h2 className="card-title">Three things to redo</h2>
        {items.length ? (
          <>
            <ul className="redo-list">
              {items.map((r) => {
                const known = redo.find((x) => x.id === r.id);
                const d = parseISO(r.dueISO);
                return (
                  <li key={r.id}>
                    <span className="grow">
                      <b>{r.label}</b>
                      <span className="small muted">
                        {r.reason} · {r.minutes} min · due {weekday(d)} {shortDate(d)}
                      </span>
                    </span>
                    {known && (
                      <Button variant="ghost" onClick={() => nav(startRedo(known))}>
                        Redo now
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
            <Button
              variant="primary"
              disabled={allAdded}
              onClick={() => {
                addRedoToPlan(items);
                toast('Added to your plan and planner');
              }}
            >
              {allAdded ? 'Added to plan' : 'Add to plan'}
            </Button>
          </>
        ) : (
          <p className="muted">Nothing to redo from this attempt. Answer a few questions and it will appear here.</p>
        )}
      </section>
    </div>
  );
}

// ---- Questions tab ----

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

function Options({ q, item }: { q: Question; item: AttemptQuestion }) {
  const dist = distributionFor(q, item.answer, item.correct);
  if (q.kind === 'mcq' && dist.kind === 'mcq') {
    return (
      <>
        <ul className="rv-options">
          {q.options.map((o, i) => {
            const correct = i === q.answerIndex;
            const you = item.answer === String(i);
            return (
              <li key={i} className={correct ? 'correct' : you ? 'wrong' : ''}>
                <div className="rv-opt-line">
                  <span className="rv-mark" aria-hidden>
                    {correct ? <Check size={16} strokeWidth={2} /> : you ? <X size={16} strokeWidth={2} /> : OPTION_LETTERS[i]}
                  </span>
                  <span className="grow">
                    <VocabText text={o} />
                  </span>
                  {you && <Tag>You</Tag>}
                  {correct && <span className="sr-only">Correct answer.</span>}
                  <span className="num small rv-pct">{dist.percents[i]}%</span>
                </div>
                <div className="rv-bar" aria-hidden>
                  <i style={{ width: `${dist.percents[i]}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
        <p className="row small muted rv-count">
          <span className="num">
            {dist.attempts.toLocaleString('en-IN')} attempts · {dist.correctPercent}% correct
          </span>
          <SampleTag />
        </p>
      </>
    );
  }
  if (q.kind === 'tita' && dist.kind === 'tita') {
    return (
      <>
        <div className="rv-tita">
          <p>
            Your answer: <b className="num">{item.answer ?? 'Not answered'}</b>
          </p>
          <p>
            Correct answer: <b className="num rv-ok">{q.answer}</b>
          </p>
        </div>
        <div className="rv-wrongs">
          <p className="small">How everyone answered</p>
          <ul>
            <li className="row-between small">
              <span>Answered correctly</span>
              <span className="num">{dist.correctPercent}%</span>
            </li>
            {dist.wrong.map((w) => (
              <li className="row-between small muted" key={w.value}>
                <span className="num">{w.value}</span>
                <span className="num">{w.percent}%</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="row small muted rv-count">
          <span className="num">{dist.attempts.toLocaleString('en-IN')} attempts</span>
          <SampleTag />
        </p>
      </>
    );
  }
  return null;
}

function splitLines(text: string): string[] {
  // Split at sentence ends only, so decimals such as 2.4 stay in one line.
  const lines = text.split(/(?<=[.!?])\s+(?![-=+×÷*/),])/).map((s) => s.trim()).filter(Boolean);
  return lines.length ? lines : [text];
}

function ExplanationPane({ q, sourceName }: { q: Question; sourceName: string }) {
  const ref = q.lessonRef;
  const lesson = ref ? lessonById(ref.lessonId) : undefined;
  return (
    <div className="stack rv-pane">
      <Tag tone="warn">{q.trap}</Tag>
      <ul className="rv-lines">
        {splitLines(q.explanation).map((line, i) => (
          <li key={i}>
            <span className="grow">{line}</span>
            <button type="button" className="icon-btn rv-save" title="Save line to notes" aria-label={`Save line to notes: ${line}`} onClick={() => saveLineToNotes(line, q.topic, sourceName)}>
              <Bookmark size={16} strokeWidth={1.5} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      {ref && lesson && (
        <Link to={`/learn/lessons/${ref.lessonId}?t=${CONCEPT_SECONDS[ref.lessonId]}`} className="row small">
          <CornerDownRight size={16} strokeWidth={1.5} aria-hidden />
          Jump to the concept: {lesson.title}
        </Link>
      )}
    </div>
  );
}

function CommunityPane({ q }: { q: Question }) {
  const mine = useApp((s) => s.community.answers[q.id]) ?? [];
  const upvoted = useApp((s) => s.community.upvoted);
  const [sort, setSort] = useState<'top' | 'new'>('top');
  const [text, setText] = useState('');
  const samples = COMMUNITY_ANSWERS[q.id] ?? [];
  const list = [
    ...mine.map((m) => ({ id: m.id, author: 'You', text: m.text, upvotes: m.upvotes, age: 0, you: true })),
    ...samples.map((m) => ({ id: m.id, author: m.author, text: m.text, upvotes: m.upvotes, age: m.daysAgo, you: false })),
  ].sort((a, b) => (sort === 'top' ? b.upvotes + (upvoted[b.id] ? 1 : 0) - (a.upvotes + (upvoted[a.id] ? 1 : 0)) : a.age - b.age));
  return (
    <div className="stack rv-pane">
      <div className="row-between">
        <div className="chips" role="group" aria-label="Sort answers">
          <Chip selected={sort === 'top'} onClick={() => setSort('top')}>
            Top
          </Chip>
          <Chip selected={sort === 'new'} onClick={() => setSort('new')}>
            New
          </Chip>
        </div>
        <SampleTag />
      </div>
      {list.length ? (
        <ul className="comm-list">
          {list.map((p) => (
            <li key={p.id}>
              <div className="row-between small">
                <b>{p.author}</b>
                <button type="button" className={`vote${upvoted[p.id] ? ' on' : ''}`} aria-pressed={!!upvoted[p.id]} onClick={() => toggleUpvote(p.id)} aria-label={`Upvote answer by ${p.author}`}>
                  <ChevronUp size={14} strokeWidth={1.5} aria-hidden /> <span className="num">{p.upvotes + (upvoted[p.id] ? 1 : 0)}</span>
                </button>
              </div>
              <p>{p.text}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">No answers yet. Yours can be the first.</p>
      )}
      <form
        className="stack-tight"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          addCommunityAnswer(q.id, text.trim());
          setText('');
          toast('Your answer is saved on this device');
        }}
      >
        <label className="field">
          <span>Add your answer</span>
          <textarea className="textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder="Share a shorter method, or a mistake to avoid" />
        </label>
        <button type="submit" className="btn btn-secondary rv-post" disabled={!text.trim()}>
          Post answer
        </button>
      </form>
    </div>
  );
}

function Passage({ q }: { q: Question }) {
  const group = groupOf(q);
  if (!group) return null;
  return (
    <details className="rv-passage" open>
      <summary>{group.kind === 'passage' ? 'Passage' : 'Set details'}</summary>
      <GroupBody group={group} renderText={(t) => <VocabText text={t} />} />
    </details>
  );
}

function QuestionReview({ record, item, index }: { record: AttemptRecord; item: AttemptQuestion; index: number }) {
  const q = getQuestion(item.id);
  const mine = useApp((s) => s.community.answers[q.id]?.length ?? 0);
  const count = (COMMUNITY_ANSWERS[q.id]?.length ?? 0) + mine;
  const [pane, setPane] = useState<'explain' | 'community'>('explain');
  const status = item.correct === null ? 'Skipped' : item.correct ? 'Correct' : 'Wrong';
  return (
    <div className="rv-grid">
      <article className="rv-left">
        <div className="row">
          <b className="rv-qno">Question {index + 1}</b>
          <Tag tone={item.correct === null ? undefined : item.correct ? 'ok' : 'bad'}>{status}</Tag>
          <DifficultyTag level={q.difficulty} />
          <Tag>{q.topic}</Tag>
          <span className="small muted num">{mSS(item.seconds)}</span>
        </div>
        <Passage q={q} />
        {q.paragraph && (
          <p className="tw-para">
            <VocabText text={q.paragraph} />
          </p>
        )}
        {q.sentences && (
          <ol className="tw-sentences">
            {q.sentences.map((s, i) => (
              <li key={i}>
                <b className="num">{i + 1}.</b> <VocabText text={s} />
              </li>
            ))}
          </ol>
        )}
        <p className="rv-prompt">
          <VocabText text={q.prompt} />
        </p>
        <Options q={q} item={item} />
      </article>
      <aside className="rv-right">
        <Tabs
          label="Answer help"
          value={pane}
          onChange={setPane}
          tabs={[
            { id: 'explain', label: 'Explanation' },
            { id: 'community', label: `Community · ${count}` },
          ]}
        />
        {pane === 'explain' ? <ExplanationPane q={q} sourceName={record.testName} /> : <CommunityPane q={q} />}
      </aside>
    </div>
  );
}

type Filter = 'all' | 'correct' | 'wrong' | 'skipped' | 'marked';

function QuestionsTab({ record }: { record: AttemptRecord }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [current, setCurrent] = useState(() => Math.max(0, record.questions.findIndex((q) => q.correct === false)));
  const match = (q: AttemptQuestion) =>
    filter === 'all' || (filter === 'correct' && q.correct === true) || (filter === 'wrong' && q.correct === false) || (filter === 'skipped' && q.correct === null) || (filter === 'marked' && q.marked);
  const visible = record.questions.map((q, i) => ({ q, i })).filter(({ q }) => match(q));
  const shown = visible.find((v) => v.i === current) ?? visible[0];
  const pos = shown ? visible.indexOf(shown) : -1;

  const finishReview = () => {
    if (record.reviewed) return;
    update((s) => ({ ...s, attempts: s.attempts.map((a) => (a.id === record.id ? { ...a, reviewed: true } : a)) }));
    earnCoins('review');
    toast('Review completed');
  };

  return (
    <div className="stack">
      <div className="chips" role="group" aria-label="Filter questions">
        {(['all', 'correct', 'wrong', 'skipped', 'marked'] as Filter[]).map((f) => (
          <Chip key={f} selected={filter === f} onClick={() => setFilter(f)}>
            {f[0].toUpperCase() + f.slice(1)}
          </Chip>
        ))}
      </div>
      <nav className="rv-pal" aria-label="Jump to a question">
        {visible.map(({ q, i }) => {
          const label = q.correct === null ? 'skipped' : q.correct ? 'correct' : 'wrong';
          return (
            <button type="button" key={q.id} className={`rv-chip rv-${label}${i === shown?.i ? ' now' : ''}`} onClick={() => setCurrent(i)} aria-label={`Question ${i + 1}, ${label}`} aria-current={i === shown?.i ? 'true' : undefined}>
              {q.correct === null ? <Minus size={12} aria-hidden /> : q.correct ? <Check size={12} aria-hidden /> : <X size={12} aria-hidden />}
              {i + 1}
            </button>
          );
        })}
      </nav>
      {shown ? (
        <>
          <QuestionReview key={shown.q.id} record={record} item={shown.q} index={shown.i} />
          <div className="row-between">
            <Button disabled={pos <= 0} onClick={() => setCurrent(visible[pos - 1].i)}>
              Previous
            </Button>
            {pos < visible.length - 1 ? (
              <Button variant="primary" icon={ArrowRight} onClick={() => setCurrent(visible[pos + 1].i)}>
                Next question
              </Button>
            ) : (
              <Button variant="primary" onClick={finishReview} disabled={record.reviewed}>
                {record.reviewed ? 'Review completed' : 'Finish review'}
              </Button>
            )}
          </div>
        </>
      ) : (
        <p className="muted">No questions match this filter.</p>
      )}
    </div>
  );
}

export default function ReviewDetail() {
  const { attemptId } = useParams();
  const [params, setParams] = useSearchParams();
  const record = useApp((s) => s.attempts.find((a) => a.id === attemptId));
  usePageTitle(record?.testName ?? null);
  const tab = params.get('tab') === 'questions' ? 'questions' : 'replay';
  if (!record) {
    return (
      <div className="stack">
        <p>We couldn't find that attempt. It may have been cleared by a reset.</p>
        <Button to="/progress/review">All attempts</Button>
      </div>
    );
  }
  return (
    <div className="stack-lg">
      <div className="stats">
        <Stat value={`${record.score} / ${record.max}`} label="Score" />
        <Stat value={record.accuracy === null ? 'None yet' : `${Math.round(record.accuracy * 100)}%`} label="Accuracy" />
        <Stat value={mSS(record.sections.reduce((a, s) => a + s.seconds, 0))} label="Time spent" />
      </div>
      <Tabs
        label="Review"
        value={tab}
        onChange={(t) => setParams({ tab: t }, { replace: true })}
        tabs={[
          { id: 'replay', label: 'Replay' },
          { id: 'questions', label: `Questions · ${record.questions.length}` },
        ]}
      />
      {tab === 'replay' ? <ReplayTab record={record} /> : <QuestionsTab record={record} />}
    </div>
  );
}
