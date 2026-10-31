import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Btn, Eyebrow } from '../components/ui';
import { SAMPLE_CODES, nowDate, useStore } from '../state/store';
import student from '../data/demo_student.json';
import type { Attempt, PuzzleSet } from '../logic/types';
import { attemptMinutes, pickRedo, startComparison, toRedoItems, wrongCount, type RedoItem } from '../logic/replay';
import { mSS } from '../logic/cap';
import { daysBetween, parseISO, shortDate, toISO, weekday } from '../logic/dates';
import { reasonFor } from '../logic/reasons';

const CONCEPTS = {
  opposite: {
    title: 'Reading opposite-seat clues',
    text: 'On a six-seat table, the person opposite you is exactly three seats away, in either direction. If you know one person\'s seat, the opposite seat is that number plus 3, wrapping after 6. Mark both ends of every opposite clue as a pair before you place anyone else.',
  },
  clockwise: {
    title: 'Following "clockwise of" clues',
    text: '"Immediately clockwise of Asha" is the next seat in the direction the clock hands move, not "to her left" or "to her right" as you picture it. Fix one direction on your drawing before you read any clue: seat numbers rise as you move clockwise.',
  },
  between: {
    title: 'Who sits between two people',
    text: '"Between A and B, going clockwise from A" is only a question when B is two seats along from A. Then exactly one seat lies between them, and it is the seat directly after A. Count the gap first, then read off the name.',
  },
} as const;

type Model = {
  sample: boolean;
  date: Date;
  attempts: Attempt[];
  roundSets: PuzzleSet[];
  label: (id: string) => string;
};

function fmtStamp(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${weekday(d)} ${shortDate(d)} · ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function Replay() {
  const s = useStore();
  const now = nowDate();

  const model: Model = useMemo(() => {
    if (s.attempts.length) {
      return { sample: false, date: new Date(s.attempts[0].startedAt), attempts: s.attempts, roundSets: s.roundSets, label: s.labelOf };
    }
    const sr = student.sampleReplay;
    const base = new Date(2026, 9, 30, 10, 0).getTime();
    let t = base;
    const attempts: Attempt[] = sr.attempts.map((a) => {
      const start = t;
      const end = start + a.minutesSpent * 60000;
      t = end + 90_000;
      return {
        setId: a.setId,
        startedAt: start,
        endedAt: end,
        capMinutes: a.capMinutes,
        hitCap: a.hitCap,
        extended: a.extended,
        left: a.left,
        stalledOnClue: a.stalledOnClue,
        questions: a.questions.map((q) => ({ chosen: null, correct: q.correct, seconds: q.seconds })),
      };
    });
    const roundSets = sr.pickedOrder.map((id) => s.getSet(id)!);
    return { sample: true, date: new Date(base), attempts, roundSets, label: (id: string) => (SAMPLE_CODES[id] ? `Set ${SAMPLE_CODES[id]}` : `Set ${id}`) };
  }, [s.attempts, s.roundSets, s.labelOf, s]);

  const getSet = (id: string) => s.getSet(id)!;
  const { attempts, label } = model;

  useEffect(() => {
    if (!model.sample) s.markReplayViewed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model.sample]);

  const start = startComparison(attempts, model.roundSets, getSet);
  const stallAttempt = [...attempts].reverse().find((a) => a.stalledOnClue !== null);
  const redo = useMemo(() => {
    const picks = pickRedo(attempts, model.roundSets, getSet);
    return toRedoItems(picks, getSet, label, now, toISO);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempts, model.roundSets]);
  const redoItems: RedoItem[] = redo.map((r) => r.item);
  const added = redoItems.every((r) => s.redoQueue.some((q) => q.setId === r.setId && q.dueISO === r.dueISO));

  // The first wrong answer, if any, drives the concept card.
  let concept: (typeof CONCEPTS)[keyof typeof CONCEPTS] | null = null;
  for (const a of attempts) {
    const set = getSet(a.setId);
    const wi = a.questions.findIndex((q) => q.correct === false);
    if (wi >= 0) {
      const p = set.questions[wi].prompt;
      concept = p.includes('opposite') ? CONCEPTS.opposite : p.includes('between') ? CONCEPTS.between : CONCEPTS.clockwise;
      break;
    }
  }
  const [conceptOpen, setConceptOpen] = useState(false);

  const when = (a: Attempt) => fmtStamp(new Date(a.startedAt));
  const startLine = start
    ? start.same
      ? `You started with ${label(start.yourFirst.id)}, the recommended start. No time lost on the first pick (estimate).`
      : `You started with ${label(start.yourFirst.id)}. ${label(start.recommended.id)} was the recommended start; it would likely have saved about ${Math.round(start.costMinutes)} minutes (estimate).`
    : 'No start to compare yet.';

  const correctTotal = attempts.flatMap((a) => a.questions).filter((q) => q.correct === true).length;
  const answeredTotal = attempts.flatMap((a) => a.questions).filter((q) => q.correct !== null).length;
  const wrongTotal = attempts.reduce((n, a) => n + wrongCount(a), 0);
  const longestQ = attempts
    .flatMap((a) => a.questions.map((q, i) => ({ setId: a.setId, q: i, seconds: q.seconds })))
    .sort((x, y) => y.seconds - x.seconds)[0];

  type Moment = { key: string; stamp: string; title: string; body: ReactNode };
  const moments: Moment[] = [
    {
      key: 'time',
      stamp: fmtStamp(model.date),
      title: 'Where your time went',
      body: (
        <ul className="tw">
          {attempts.map((a, i) => {
            const spent = attemptMinutes(a) * 60;
            const cap = a.capMinutes * 60;
            const total = Math.max(spent, cap + (a.extended ? 120 : 0)) * 1.08;
            return (
              <li key={i}>
                <div className="tw-head">
                  <b>{label(a.setId)}</b>
                  <span className="tnum">{mSS(spent)} of {mSS(cap)} cap</span>
                </div>
                <div className="tw-bar" aria-hidden>
                  <i className={`tw-fill${a.hitCap ? ' over' : ''}`} style={{ width: `${(spent / total) * 100}%` }} />
                  <i className="tw-cap" style={{ left: `${(cap / total) * 100}%` }} />
                </div>
                <p className="tw-note">
                  {a.hitCap ? 'Cap hit' : 'Inside the cap'}
                  {a.extended ? ', then +2 minutes taken' : ''}
                  {a.left ? ', then you left the set' : ', then you finished'}.
                </p>
              </li>
            );
          })}
          {answeredTotal > 0 && (
            <li className="tw-sum">
              <p className="moment-text">{correctTotal} right, {wrongTotal} wrong of {answeredTotal} answered.</p>
              {longestQ && <p className="tw-note">Longest on question {longestQ.q + 1} of {label(longestQ.setId)}: {mSS(longestQ.seconds)}.</p>}
            </li>
          )}
        </ul>
      ),
    },
    { key: 'start', stamp: 'The first minutes', title: 'Your start vs the recommended start', body: <p className="moment-text">{startLine}</p> },
    {
      key: 'stall',
      stamp: stallAttempt ? when(stallAttempt) : 'No stall marked',
      title: 'Where you stalled',
      body: stallAttempt ? (
        <>
          <p className="moment-text">You were on clue {(stallAttempt.stalledOnClue as number) + 1} when progress stopped.</p>
          <blockquote className="clue-quote">{getSet(stallAttempt.setId).clues[stallAttempt.stalledOnClue as number]}</blockquote>
        </>
      ) : (
        <p className="moment-text">No clue was marked this time. Use "I'm on this clue" while you work and the replay will show where you stalled.</p>
      ),
    },
    ...redo.map((r, i) => ({
      key: `redo-${i}`,
      stamp: `Redo ${i + 1} of 3`,
      title: `${r.item.label} · ${r.item.setId}`,
      body: (
        <>
          <p className="moment-text">
            Redo {r.item.label} on <b>{shortDate(r.date)}</b> ({r.gap} day{r.gap > 1 ? 's' : ''} from now).
          </p>
          <p className="muted small">{r.item.note}. About {r.item.minutes.toFixed(1)} min (estimate).</p>
          <p className="muted small">{reasonFor(getSet(r.item.setId))}</p>
        </>
      ),
    })),
    ...(concept
      ? [
          {
            key: 'concept',
            stamp: 'From a wrong answer',
            title: 'A concept to revisit',
            body: (
              <>
                <p className="moment-text">Jump to the concept: "{concept.title}", 2 min (sample).</p>
                {conceptOpen ? <p className="explainer">{concept.text}</p> : null}
                <Btn small icon={<BookOpen size={16} strokeWidth={1.5} aria-hidden />} onClick={() => setConceptOpen((v) => !v)} aria-expanded={conceptOpen}>
                  {conceptOpen ? 'Hide the explainer' : 'Open the 2-minute explainer'}
                </Btn>
              </>
            ),
          },
        ]
      : []),
  ];

  const [idx, setIdx] = useState(0);
  const go = (n: number) => setIdx(Math.max(0, Math.min(moments.length - 1, n)));
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') (e.preventDefault(), go(idx + 1));
    if (e.key === 'ArrowLeft') (e.preventDefault(), go(idx - 1));
  };
  const down = useRef<number | null>(null);


  return (
    <div className="replay">
      <div className="watermark day" aria-hidden>{weekday(model.date).toUpperCase()}</div>
      <header className="replay-head">
        <Eyebrow>{model.sample ? 'Sample replay' : 'Replay · built from your attempt log'}</Eyebrow>
        <h1 className="display">Your 10-minute replay</h1>
        {model.sample && <p className="sample-tag">Sample replay. Do a drill to see your own.</p>}
        <p className="lede small">Nothing to type or tag. Everything here comes from what you did on the set.</p>
      </header>

      <section
        className="carousel"
        aria-roledescription="carousel"
        aria-label="Moments from your session"
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={(e) => (down.current = e.clientX)}
        onPointerUp={(e) => {
          if (down.current === null) return;
          const dx = e.clientX - down.current;
          down.current = null;
          if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1));
        }}
      >
        <div className="ticks" aria-hidden />
        <div className="centerline" aria-hidden />
        <div className="track" style={{ ['--i' as string]: idx }}>
          {moments.map((m, i) => (
            <article
              key={m.key}
              className={`moment${i === idx ? ' active' : ''}`}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${moments.length}: ${m.title}`}
              aria-hidden={i !== idx}
              onClick={() => i !== idx && go(i)}
            >
              <p className="stamp tnum">{m.stamp}</p>
              <h2 className="moment-title">{m.title}</h2>
              <div className="moment-body">{m.body}</div>
            </article>
          ))}
        </div>
      </section>

      <div className="car-ctl">
        <button type="button" className="icon-btn" onClick={() => go(idx - 1)} disabled={idx === 0} aria-label="Previous moment">
          <ChevronLeft size={20} strokeWidth={1.5} aria-hidden />
        </button>
        <span className="tnum dots" aria-live="polite">{idx + 1} / {moments.length}</span>
        <button type="button" className="icon-btn" onClick={() => go(idx + 1)} disabled={idx === moments.length - 1} aria-label="Next moment">
          <ChevronRight size={20} strokeWidth={1.5} aria-hidden />
        </button>
      </div>

      <div className="replay-act">
        {added ? (
          <>
            <p className="added"><Check size={18} strokeWidth={1.5} aria-hidden /> Added. These three redo items now sit in your plan and come due from {shortDate(redo[0].date)}.</p>
            <Btn variant="primary" to="/today">See today's plan</Btn>
          </>
        ) : (
          <>
            <p className="muted small">The three items with the most time lost, spaced about 20% of the days left to CAT apart from today.</p>
            <Btn variant="primary" onClick={() => s.addRedo(redoItems)}>
              Add to today's plan
            </Btn>
          </>
        )}
      </div>

      <section className="plain" aria-labelledby="plain-h">
        <h2 id="plain-h" className="h3">The same replay as a list</h2>
        <dl>
          <dt>Where your time went</dt>
          <dd>
            {attempts.map((a) => `${label(a.setId)}: ${mSS(attemptMinutes(a) * 60)} of a ${mSS(a.capMinutes * 60)} cap${a.hitCap ? ', cap hit' : ''}${a.extended ? ', extended once' : ''}${a.left ? ', left' : ', finished'}`).join('. ')}.
            {answeredTotal > 0 && ` Answers: ${correctTotal} right, ${wrongTotal} wrong of ${answeredTotal} answered.`}
          </dd>
          <dt>Your start</dt>
          <dd>{startLine}</dd>
          <dt>Where you stalled</dt>
          <dd>{stallAttempt ? `Clue ${(stallAttempt.stalledOnClue as number) + 1}: ${getSet(stallAttempt.setId).clues[stallAttempt.stalledOnClue as number]}` : 'No clue was marked.'}</dd>
          <dt>Redo list</dt>
          <dd>
            <ol>
              {redo.map((r) => (
                <li key={r.item.setId}>
                  Redo {r.item.label} on {shortDate(r.date)} ({daysBetween(now, r.date)} days from now). {r.item.note}.
                </li>
              ))}
            </ol>
          </dd>
        </dl>
        <p className="muted small">Dates follow a rule of thumb from spacing research ({shortDate(parseISO('2026-11-29'))} is exam day) that is still being tested, not a proven optimum.</p>
      </section>
    </div>
  );
}
