import { memo, useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Pause, Play, RotateCcw, RotateCw, Search, X } from 'lucide-react';
import { usePageTitle } from '../components/Shell';
import { Button, Tag, toast } from '../components/ui';
import { Diagram } from '../content/lessons/diagrams';
import { formatTime, lessonById, lineIndexAt, revealCountAt, type Chapter, type Lesson, type Slide, type SlideBody, type TranscriptLine } from '../content/lessons';
import type { LessonId, Question } from '../content/types';
import { EARN_RULES } from '../logic/coins';
import { isCorrect } from '../logic/scoring';
import { earnCoins, logActivity } from '../state/actions';
import type { LessonProgress } from '../state/schema';
import { getState, update, useApp } from '../state/store';
import '../styles/lessons.css';

const SPEEDS = [1, 1.25, 1.5] as const;
type Speed = (typeof SPEEDS)[number];

const SEEK_STEP = 5;
const SAVE_EVERY_MS = 5000;
/** Real seconds of watching between streak updates. */
const LOG_EVERY = 15;
/** Share of the lesson that counts as watched. */
const DONE_SHARE = 0.9;
/** Longest single clock step. A hidden tab stops the frames, and that gap must not count as watching. */
const MAX_STEP = 0.25;
const PAINT_EVERY_MS = 100;
/** How long auto-scroll stays out of the way after the student scrolls the transcript. */
const SCROLL_REST_MS = 4000;

const EMPTY: LessonProgress = { position: 0, watchedSeconds: 0, done: false, practice: {} };

const round1 = (n: number) => Math.round(n * 10) / 10;

function patchLesson(id: LessonId, fn: (p: LessonProgress) => LessonProgress) {
  update((s) => ({ ...s, lessons: { ...s.lessons, [id]: fn({ ...EMPTY, ...s.lessons[id] }) } }));
}

function answerPractice(lessonId: LessonId, q: Question, answer: string) {
  if (getState().lessons[lessonId]?.practice?.[q.id]) return;
  const correct = isCorrect(q, answer) === true;
  patchLesson(lessonId, (p) => ({ ...p, practice: { ...p.practice, [q.id]: { answer, correct } } }));
  logActivity({ questions: 1 });
}

/** Marks the lesson done and pays the coin once only. */
function finishLesson(id: LessonId) {
  if (getState().lessons[id]?.done) return;
  const before = getState().coins.length;
  patchLesson(id, (p) => ({ ...p, done: true }));
  earnCoins('lesson');
  toast(getState().coins.length > before ? `Lesson finished. ${EARN_RULES.lesson.coins} coins added.` : 'Lesson finished.');
}

function startingPoint(lesson: Lesson, t: string | null): number {
  const asked = t === null ? NaN : Number(t);
  if (Number.isFinite(asked) && asked >= 0) return Math.min(asked, lesson.durationSeconds);
  const saved = getState().lessons[lesson.id]?.position ?? 0;
  return saved >= lesson.durationSeconds - 1 ? 0 : saved;
}

/**
 * The virtual clock. The live position sits in a ref and moves every animation frame; React only
 * hears about it ten times a second, so a playing lesson does not re-render the page at 60 fps.
 */
function useClock(lesson: Lesson, start: number) {
  const { id, durationSeconds: duration } = lesson;
  const [position, setPosition] = useState(start);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeedState] = useState<Speed>(1);
  const [status, setStatus] = useState('');
  const pos = useRef(start);
  const rate = useRef<number>(1);
  const running = useRef(false);
  const watchedBefore = useRef(getState().lessons[id]?.watchedSeconds ?? 0);
  // Real seconds not yet saved, real seconds not yet logged, lesson seconds played this visit.
  const pending = useRef({ save: 0, log: 0, covered: 0, dirty: false });

  const save = useCallback(() => {
    const p = pending.current;
    if (!p.dirty) return;
    const add = p.save;
    p.save = 0;
    p.dirty = false;
    const position = round1(pos.current);
    patchLesson(id, (x) => ({ ...x, position, watchedSeconds: round1(x.watchedSeconds + add) }));
  }, [id]);

  const flushLog = useCallback(() => {
    const p = pending.current;
    const n = Math.floor(p.log);
    if (n < 1) return;
    p.log -= n;
    logActivity({ lessonSeconds: n, minutes: n / 60 });
  }, []);

  const seek = useCallback(
    (t: number) => {
      const next = Math.min(duration, Math.max(0, t));
      if (next === pos.current) return;
      pos.current = next;
      pending.current.dirty = true;
      setPosition(next);
    },
    [duration],
  );

  const setRunning = useCallback((on: boolean) => {
    running.current = on;
    setPlaying(on);
  }, []);

  const toggle = useCallback(() => {
    if (running.current) {
      setRunning(false);
      setStatus('Paused');
      return;
    }
    if (pos.current >= duration) seek(0);
    setRunning(true);
    setStatus('Playing');
  }, [duration, seek, setRunning]);

  const nudge = useCallback((delta: number) => seek(pos.current + delta), [seek]);

  /** A deliberate jump from the transcript or a chapter, which is worth announcing. */
  const jump = useCallback(
    (t: number) => {
      seek(t);
      setStatus(`Jumped to ${formatTime(t)}`);
    },
    [seek],
  );

  const setSpeed = useCallback((s: Speed) => {
    rate.current = s;
    setSpeedState(s);
  }, []);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = performance.now();
    let painted = last;
    let saved = last;
    const tick = (now: number) => {
      const real = Math.min(Math.max(0, now - last) / 1000, MAX_STEP);
      last = now;
      const p = pending.current;
      const next = Math.min(duration, pos.current + real * rate.current);
      p.covered += next - pos.current;
      p.save += real;
      p.log += real;
      p.dirty = true;
      pos.current = next;
      if (p.log >= LOG_EVERY) flushLog();
      if (now - saved >= SAVE_EVERY_MS) {
        saved = now;
        save();
      }
      // At 1.5× a full watch is only two thirds of the real time, so this compares lesson seconds.
      if (watchedBefore.current + p.covered >= DONE_SHARE * duration) finishLesson(id);
      if (next >= duration) {
        finishLesson(id);
        setPosition(duration);
        setRunning(false);
        setStatus('Lesson finished. The practice questions are below.');
        return;
      }
      if (now - painted >= PAINT_EVERY_MS) {
        painted = now;
        setPosition(next);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      save();
      flushLog();
    };
  }, [playing, duration, id, save, flushLog, setRunning]);

  useEffect(() => {
    const leave = () => {
      save();
      flushLog();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') leave();
    };
    window.addEventListener('pagehide', leave);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', leave);
      document.removeEventListener('visibilitychange', onVisibility);
      leave();
    };
  }, [save, flushLog]);

  return { position, playing, speed, status, toggle, seek, nudge, jump, setSpeed };
}

// ---- Slides ----

function Revealed({ on, now, children, className }: { on: boolean; now?: boolean; children: ReactNode; className?: string }) {
  return (
    <li className={className} data-on={on} data-now={now || undefined}>
      {children}
    </li>
  );
}

function SlideView({ body, step }: { body: SlideBody; step: number }) {
  switch (body.kind) {
    case 'title':
      return (
        <div className="sl sl-title">
          <h2>{body.title}</h2>
          <p>{body.subtitle}</p>
        </div>
      );
    case 'points':
      return (
        <div className="sl">
          <h2>{body.title}</h2>
          {body.lead && <blockquote className="sl-lead">{body.lead}</blockquote>}
          {body.items.length > 0 && (
            <ol className={`sl-list${body.numbered ? ' sl-numbered' : ''}`}>
              {body.items.map((item, i) => (
                <Revealed key={item} on={i < step}>
                  {body.numbered && <span className="sl-n">{i + 1}</span>}
                  <span>{item}</span>
                </Revealed>
              ))}
            </ol>
          )}
        </div>
      );
    case 'steps':
      return (
        <div className="sl">
          <h2>{body.title}</h2>
          <p className="sl-given">{body.given}</p>
          <ol className="sl-steps">
            {body.items.map((item, i) => (
              <Revealed key={item} on={i < step} now={i === step - 1}>
                {item}
              </Revealed>
            ))}
          </ol>
        </div>
      );
    case 'verdicts':
      return (
        <div className="sl">
          <h2>{body.title}</h2>
          <ul className="sl-verdicts">
            {body.items.map((item, i) => {
              const shown = i < step;
              return (
                <li key={item.text} data-out={shown && !item.keep}>
                  <span>{item.text}</span>
                  {shown && (
                    <Tag tone={item.keep ? 'ok' : 'bad'}>
                      {item.keep ? <Check size={12} strokeWidth={2} aria-hidden /> : <X size={12} strokeWidth={2} aria-hidden />}
                      {item.verdict}
                    </Tag>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      );
    case 'diagram':
      return (
        <div className="sl">
          <h2>{body.title}</h2>
          <div className="sl-fig">
            <Diagram id={body.diagram} step={step} />
          </div>
        </div>
      );
    case 'table': {
      const mark = step > 0 ? body.marks[step - 1] : undefined;
      const lit = (r: number, c: number) => !!mark && (mark.rows?.includes(r) || mark.cols?.includes(c) || mark.cells?.some(([a, b]) => a === r && b === c));
      return (
        <div className="sl">
          <h2>{body.title}</h2>
          {body.note && <p className="sl-given">{body.note}</p>}
          <table className="sl-table">
            <thead>
              <tr>
                {body.columns.map((c, i) => (
                  <th key={c} scope="col" data-on={!!mark?.cols?.includes(i)}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.rows.map((row, r) => (
                <tr key={row[0]}>
                  {row.map((cell, c) => (
                    <td key={c} data-on={lit(r, c)}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }
}

const Stage = memo(function Stage({ slide, step, total, onToggle }: { slide: Slide; step: number; total: number; onToggle: () => void }) {
  const title = slide.body.title;
  return (
    <div className="lp-stage" role="group" aria-roledescription="slide" aria-label={`Slide ${slide.index + 1} of ${total}: ${title}`} onClick={onToggle}>
      <div key={slide.index} className="lp-slide fade-in">
        <SlideView body={slide.body} step={step} />
      </div>
      <span className="lp-slide-count num" aria-hidden>
        {slide.index + 1} / {total}
      </span>
    </div>
  );
});

// ---- Controls ----

function Scrubber({ position, duration, chapters, onSeek }: { position: number; duration: number; chapters: Chapter[]; onSeek: (t: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const fromPointer = (e: ReactPointerEvent) => {
    const box = (ref.current as HTMLDivElement).getBoundingClientRect();
    onSeek((Math.min(1, Math.max(0, (e.clientX - box.left) / box.width)) || 0) * duration);
  };
  const onKeyDown = (e: ReactKeyboardEvent) => {
    const to: Record<string, number> = {
      Home: 0,
      End: duration,
      ArrowUp: position + SEEK_STEP,
      ArrowDown: position - SEEK_STEP,
      PageUp: position + 30,
      PageDown: position - 30,
    };
    if (!(e.key in to)) return;
    e.preventDefault();
    onSeek(to[e.key]);
  };
  const pct = (t: number) => `${(t / duration) * 100}%`;
  return (
    <div
      ref={ref}
      className="lp-scrub"
      role="slider"
      tabIndex={0}
      aria-label="Lesson position"
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(position)}
      aria-valuetext={`${formatTime(position)} of ${formatTime(duration)}`}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        fromPointer(e);
      }}
      onPointerMove={(e) => {
        if (dragging.current) fromPointer(e);
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
    >
      <div className="lp-track">
        <i style={{ width: pct(position) }} />
        {chapters
          .filter((c) => c.start > 0)
          .map((c) => (
            <b key={c.start} style={{ left: pct(c.start) }} title={c.title} />
          ))}
      </div>
      <span className="lp-thumb" style={{ left: pct(position) }} />
    </div>
  );
}

function marked(text: string, query: string): ReactNode {
  if (!query) return text;
  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.split(new RegExp(`(${safe})`, 'ig')).map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part));
}

const Transcript = memo(function Transcript({ lines, current, onJump }: { lines: TranscriptLine[]; current: number; onJump: (t: number) => void }) {
  const [query, setQuery] = useState('');
  const box = useRef<HTMLOListElement>(null);
  const touched = useRef(0);
  const firstRun = useRef(true);
  const q = query.trim();
  const visible = useMemo(() => {
    const needle = q.toLowerCase();
    return needle ? lines.filter((l) => l.text.toLowerCase().includes(needle)) : lines;
  }, [lines, q]);

  // Moves the panel's own scroll position. scrollIntoView could move the page as well.
  useEffect(() => {
    const list = box.current;
    const el = list?.querySelector<HTMLElement>('[aria-current="true"]');
    const initial = firstRun.current;
    firstRun.current = false;
    if (!list || !el || Date.now() - touched.current < SCROLL_REST_MS) return;
    const top = el.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop;
    const calm = initial || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    list.scrollTo({ top: Math.max(0, top - list.clientHeight / 3), behavior: calm ? 'auto' : 'smooth' });
  }, [current, q]);

  const noteScroll = () => {
    touched.current = Date.now();
  };

  return (
    <aside className="lp-transcript" aria-label="Transcript">
      <div className="lp-tx">
        <div className="lp-tx-head">
          <div className="lp-search">
            <Search size={16} strokeWidth={1.5} aria-hidden />
            <input type="search" className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the transcript" aria-label="Search the transcript" />
          </div>
          {q && (
            <p className="small muted" role="status">
              {visible.length === 1 ? '1 line matches' : `${visible.length} lines match`}
            </p>
          )}
        </div>
        <ol ref={box} className="lp-tx-list" onWheel={noteScroll} onTouchMove={noteScroll} onKeyDown={noteScroll}>
          {visible.map((l) => (
            <li key={l.index}>
              <button type="button" className="lp-line" aria-current={l.index === current ? 'true' : undefined} onClick={() => onJump(l.start)}>
                <span className="lp-ts">{formatTime(l.start)}</span>
                <span>{marked(l.text, q)}</span>
              </button>
            </li>
          ))}
          {!visible.length && <li className="lp-tx-none small muted">No lines match that search.</li>}
        </ol>
      </div>
    </aside>
  );
});

const Chapters = memo(function Chapters({ chapters, current, onJump }: { chapters: Chapter[]; current: number; onJump: (t: number) => void }) {
  return (
    <section className="stack" aria-labelledby="lp-chapters">
      <h2 id="lp-chapters" className="section-title">
        Chapters
      </h2>
      <ol className="lp-chapters">
        {chapters.map((c, i) => (
          <li key={c.start}>
            <button type="button" className="lp-chapter" aria-current={i === current ? 'true' : undefined} onClick={() => onJump(c.start)}>
              <span className="lp-ts">{formatTime(c.start)}</span>
              <span>{c.title}</span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
});

// ---- Practice ----

function correctLabel(q: Question): string {
  return q.kind === 'mcq' ? `The answer is ${String.fromCharCode(65 + q.answerIndex)}.` : `The answer is ${q.answer}.`;
}

function PracticeCard({ lessonId, q, n, saved }: { lessonId: LessonId; q: Question; n: number; saved: { answer: string; correct: boolean } | undefined }) {
  const [typed, setTyped] = useState('');
  const headingId = `${q.id}-prompt`;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (typed.trim()) answerPractice(lessonId, q, typed.trim());
  };
  return (
    <article className="card lp-q" aria-labelledby={headingId}>
      <p className="label">Question {n}</p>
      {q.paragraph && <p className="lp-q-para">{q.paragraph}</p>}
      {q.sentences && (
        <ol className="lp-q-sentences">
          {q.sentences.map((s, i) => (
            <li key={s}>
              <span className="num">{i + 1}.</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      )}
      <p id={headingId} className="lp-q-prompt">
        {q.prompt}
      </p>
      {q.kind === 'mcq' ? (
        <div className="lp-options" role="group" aria-labelledby={headingId}>
          {q.options.map((option, i) => {
            const chosen = saved?.answer === String(i);
            const right = !!saved && i === q.answerIndex;
            const state = right ? 'right' : chosen ? 'wrong' : undefined;
            return (
              <button key={option} type="button" className="lp-option" data-state={state} disabled={!!saved} onClick={() => answerPractice(lessonId, q, String(i))}>
                <span className="lp-option-letter">{String.fromCharCode(65 + i)}</span>
                <span className="grow">{option}</span>
                {right && (
                  <span className="lp-option-note">
                    <Check size={16} strokeWidth={1.5} aria-hidden />
                    Correct answer
                  </span>
                )}
                {chosen && !right && (
                  <span className="lp-option-note">
                    <X size={16} strokeWidth={1.5} aria-hidden />
                    Your answer
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : saved ? (
        <p className="small">
          Your answer: <span className="num">{saved.answer}</span>
        </p>
      ) : (
        <form className="lp-tita" onSubmit={submit}>
          <label className="field grow">
            <span>{q.sentences ? 'Your order' : 'Your answer'}</span>
            <input className="input num" inputMode={/^\d+$/.test(q.answer) ? 'numeric' : 'decimal'} autoComplete="off" value={typed} onChange={(e) => setTyped(e.target.value)} />
          </label>
          <Button type="submit" disabled={!typed.trim()}>
            Check
          </Button>
        </form>
      )}
      <div aria-live="polite">
        {saved && (
          <div className="lp-feedback" data-right={saved.correct}>
            <p className="row lp-feedback-head">
              {saved.correct ? <Check size={18} strokeWidth={1.5} aria-hidden /> : <X size={18} strokeWidth={1.5} aria-hidden />}
              {saved.correct ? 'Correct.' : `Not this time. ${correctLabel(q)}`}
            </p>
            <p>{q.explanation}</p>
            <p className="small muted">Trap: {q.trap}</p>
          </div>
        )}
      </div>
    </article>
  );
}

function Practice({ lesson }: { lesson: Lesson }) {
  const answers = useApp((s) => s.lessons[lesson.id]?.practice);
  const answered = lesson.practice.filter((q) => answers?.[q.id]).length;
  return (
    <section className="stack" aria-labelledby="lp-practice">
      <div className="row-between">
        <h2 id="lp-practice" className="section-title">
          Practice
        </h2>
        <span className="small muted num">
          {answered} of {lesson.practice.length} answered
        </span>
      </div>
      {lesson.practice.map((q, i) => (
        <PracticeCard key={q.id} lessonId={lesson.id} q={q} n={i + 1} saved={answers?.[q.id]} />
      ))}
    </section>
  );
}

function DoneTag({ id }: { id: LessonId }) {
  const done = useApp((s) => !!s.lessons[id]?.done);
  return done ? <Tag tone="ok">Done</Tag> : null;
}

// ---- Page ----

const isTyping = (el: EventTarget | null) => el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

function Player({ lesson }: { lesson: Lesson }) {
  const [params] = useSearchParams();
  const t = params.get('t');
  const [start] = useState(() => startingPoint(lesson, t));
  const { position, playing, speed, status, toggle, seek, nudge, jump, setSpeed } = useClock(lesson, start);
  const duration = lesson.durationSeconds;

  // A new ?t= while the page is open, for example from a second "Jump to the concept" link.
  useEffect(() => {
    const asked = t === null ? NaN : Number(t);
    if (Number.isFinite(asked) && asked >= 0) seek(asked);
  }, [t, seek]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || isTyping(e.target)) return;
      if (e.key === ' ') {
        // A focused button or link already acts on space. Toggling here as well would fire twice.
        if (e.target instanceof HTMLElement && e.target.closest('button, a')) return;
        e.preventDefault();
        if (!e.repeat) toggle();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        nudge(e.key === 'ArrowLeft' ? -SEEK_STEP : SEEK_STEP);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle, nudge]);

  const lineIndex = lineIndexAt(lesson, position);
  const slide = lesson.slides[lesson.transcript[lineIndex].slide];
  const step = revealCountAt(slide, position);
  const chapter = lesson.chapters.reduce((found, c, i) => (c.start <= position ? i : found), 0);
  const ended = position >= duration;

  return (
    <div className="lp">
      <div className="row-between">
        <Button variant="ghost" to="/learn/lessons" icon={ArrowLeft}>
          All lessons
        </Button>
        <DoneTag id={lesson.id} />
      </div>
      <div className="lp-top">
        <section className="lp-player" aria-label="Lesson player">
          <Stage slide={slide} step={step} total={lesson.slides.length} onToggle={toggle} />
          <div className="lp-controls">
            <Scrubber position={position} duration={duration} chapters={lesson.chapters} onSeek={seek} />
            <div className="lp-bar">
              <Button variant="primary" className="lp-play" icon={playing ? Pause : Play} onClick={toggle}>
                {playing ? 'Pause' : ended ? 'Replay' : 'Play'}
              </Button>
              <button type="button" className="lp-icon" aria-label="Back 5 seconds" title="Back 5 seconds" onClick={() => nudge(-SEEK_STEP)}>
                <RotateCcw size={18} strokeWidth={1.5} aria-hidden />
              </button>
              <button type="button" className="lp-icon" aria-label="Forward 5 seconds" title="Forward 5 seconds" onClick={() => nudge(SEEK_STEP)}>
                <RotateCw size={18} strokeWidth={1.5} aria-hidden />
              </button>
              <span className="lp-time num">
                {formatTime(position)} / {formatTime(duration)}
              </span>
              <div className="lp-speed" role="group" aria-label="Playback speed">
                {SPEEDS.map((s) => (
                  <button key={s} type="button" aria-pressed={speed === s} aria-label={`${s} times speed`} onClick={() => setSpeed(s)}>
                    {s}×
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
        <Transcript lines={lesson.transcript} current={lineIndex} onJump={jump} />
      </div>
      <Chapters chapters={lesson.chapters} current={chapter} onJump={jump} />
      <Practice lesson={lesson} />
      <p className="sr-only" role="status">
        {status}
      </p>
    </div>
  );
}

export default function LessonPlayer() {
  const { id } = useParams();
  const lesson = lessonById(id ?? '');
  usePageTitle(lesson?.title ?? null);
  if (!lesson) {
    return (
      <p>
        We could not find that lesson. <Link to="/learn/lessons">Back to Lessons</Link>
      </p>
    );
  }
  return <Player key={lesson.id} lesson={lesson} />;
}
