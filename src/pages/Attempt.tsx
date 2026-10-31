import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { Btn, CreditFooter, Eyebrow, Modal } from '../components/ui';
import { useStore } from '../state/store';
import { EXTENSION_SECONDS, capSeconds, mSS, mmss } from '../logic/cap';
import type { Attempt as AttemptT, PuzzleSet } from '../logic/types';

type Phase = 'run' | 'cap' | 'extended-cap' | 'confirm-leave';

function Scratch({ people }: { people: string[] }) {
  const [seats, setSeats] = useState<(string | null)[]>(Array(6).fill(null));
  const [sel, setSel] = useState<string | null>(null);
  const place = (i: number) => {
    if (sel) {
      setSeats((cur) => cur.map((n, k) => (k === i ? sel : n === sel ? null : n)));
      setSel(null);
    } else if (seats[i]) {
      setSeats((cur) => cur.map((n, k) => (k === i ? null : n)));
    }
  };
  const used = new Set(seats.filter(Boolean));
  return (
    <section className="scratch" aria-labelledby="scr-h">
      <h3 id="scr-h" className="h3">Scratch circle</h3>
      <p className="muted small">Pick a name, then a seat. Seat 1 is at the top; seats run clockwise. This is only a notepad, it never checks anything.</p>
      <div className="chips-row" role="group" aria-label="Names">
        {people.map((p) => (
          <button key={p} type="button" className={`name-chip${sel === p ? ' on' : ''}`} aria-pressed={sel === p} disabled={used.has(p) && sel !== p} onClick={() => setSel(sel === p ? null : p)}>
            {p}
          </button>
        ))}
      </div>
      <svg viewBox="-110 -110 220 220" className="circle" role="group" aria-label="Six seats around a table">
        <circle r="46" className="table" />
        {seats.map((n, i) => {
          const a = (-90 + i * 60) * (Math.PI / 180);
          const x = Math.cos(a) * 78;
          const y = Math.sin(a) * 78;
          return (
            <g key={i} transform={`translate(${x} ${y})`} tabIndex={0} role="button" aria-label={`Seat ${i + 1}${n ? `, ${n}` : ', empty'}`} className={`seat${n ? ' filled' : ''}`} onClick={() => place(i)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), place(i))}>
              <circle r="25" />
              <text y={n ? -2 : 4} textAnchor="middle" className="seat-n">{n ?? i + 1}</text>
              {n && <text y="12" textAnchor="middle" className="seat-s">seat {i + 1}</text>}
            </g>
          );
        })}
      </svg>
    </section>
  );
}

function Run({ set }: { set: PuzzleSet }) {
  const s = useStore();
  const nav = useNavigate();
  const capSec = capSeconds(set.expectedMinutes, s.pace);
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState<Phase>('run');
  const [extended, setExtended] = useState(false);
  const [hitCap, setHitCap] = useState(false);
  const [stalled, setStalled] = useState<number | null>(null);
  const [chosen, setChosen] = useState<(string | null)[]>([null, null, null]);
  const [announce, setAnnounce] = useState('');
  const el = useRef(0);
  const qSecs = useRef([0, 0, 0]);
  const focusQ = useRef(0);
  const last = useRef(Date.now());
  const startedAt = useRef(Date.now());
  const finished = useRef(false);
  const phaseRef = useRef<Phase>('run');
  const extRef = useRef(false);
  phaseRef.current = phase;
  extRef.current = extended;
  const limit = capSec + (extended ? EXTENSION_SECONDS : 0);

  const finish = useCallback(
    (left: boolean) => {
      if (finished.current) return;
      finished.current = true;
      const qs = set.questions.map((q, i) => ({ chosen: chosen[i], correct: chosen[i] === null ? null : chosen[i] === q.answer, seconds: Math.round(qSecs.current[i]) }));
      const attempt: AttemptT = {
        setId: set.id,
        startedAt: startedAt.current,
        endedAt: startedAt.current + Math.round(el.current * 1000),
        capMinutes: capSec / 60,
        hitCap,
        extended,
        left,
        stalledOnClue: stalled,
        questions: qs,
      };
      s.addAttempt(attempt);
      nav('/replay');
    },
    [chosen, capSec, extended, hitCap, nav, s, set, stalled],
  );

  useEffect(() => {
    last.current = Date.now();
    const id = window.setInterval(() => {
      const now = Date.now();
      const dt = (now - last.current) / 1000;
      last.current = now;
      if (phaseRef.current !== 'run' || finished.current) return;
      const lim = capSec + (extRef.current ? EXTENSION_SECONDS : 0);
      const next = Math.min(lim, el.current + dt);
      qSecs.current[focusQ.current] += next - el.current;
      el.current = next;
      setElapsed(next);
      if (next >= lim) {
        setHitCap(true);
        setPhase(extRef.current ? 'extended-cap' : 'cap');
        setAnnounce(`You've reached your cap for this set, ${mSS(lim)}.`);
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [capSec]);

  const remaining = limit - elapsed;
  const warn = remaining <= 60 && phase === 'run';
  const pct = Math.min(100, (elapsed / limit) * 100);

  return (
    <div className="focus">
      <div className="focus-top">
        <button type="button" className="icon-btn close" aria-label="Close this set" onClick={() => setPhase('confirm-leave')}>
          <X size={20} strokeWidth={1.5} aria-hidden />
        </button>
        <div className="progress" role="progressbar" aria-label="Time used against the cap" aria-valuemin={0} aria-valuemax={Math.round(limit)} aria-valuenow={Math.round(elapsed)}>
          <i className={warn || phase !== 'run' ? 'warn' : ''} style={{ width: `${pct}%` }} />
        </div>
        <p className={`timeline tnum${warn || phase !== 'run' ? ' warn' : ''}`}>
          Time on this set <b>{mmss(elapsed)}</b> · Cap <b>{mmss(limit)}</b>
        </p>
      </div>

      <div className="focus-body">
        <header className="focus-head">
          <Eyebrow>{s.labelOf(set.id)} · {set.id} · Circular seating</Eyebrow>
          <h1 className="h2">Six people sit around a round table.</h1>
          <p className="lede small">{set.people.join(', ')}. Seats are equally spaced. Every clue below is true.</p>
        </header>
        <div className="focus-grid">
          <section aria-labelledby="clues-h">
            <h2 id="clues-h" className="h3">Clues</h2>
            <ol className="clues">
              {set.clues.map((c, i) => (
                <li key={i} className={stalled === i ? 'on' : ''}>
                  <span className="cn tnum">{i + 1}</span>
                  <span className="ct">{c}</span>
                  <button type="button" className="mini-toggle" aria-pressed={stalled === i} onClick={() => setStalled(stalled === i ? null : i)}>
                    I'm on this clue
                  </button>
                </li>
              ))}
            </ol>
            <Scratch people={set.people} />
          </section>
          <section aria-labelledby="q-h">
            <h2 id="q-h" className="h3">Questions</h2>
            <ol className="qs">
              {set.questions.map((q, qi) => (
                <li key={qi}>
                  <fieldset onFocus={() => (focusQ.current = qi)}>
                    <legend>
                      <span className="tnum">{qi + 1}.</span> {q.prompt}
                    </legend>
                    <div className="opts">
                      {q.options.map((o) => (
                        <label key={o} className={`opt${chosen[qi] === o ? ' on' : ''}`}>
                          <input
                            type="radio"
                            name={`q${qi}`}
                            checked={chosen[qi] === o}
                            onChange={() => {
                              focusQ.current = qi;
                              setChosen((c) => c.map((x, k) => (k === qi ? o : x)));
                            }}
                          />
                          <span>{o}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <div className="focus-foot">
          <Btn variant="primary" onClick={() => finish(false)}>Finish</Btn>
        </div>
      </div>
      <CreditFooter />
      <p className="sr-only" role="status" aria-live="assertive">{announce}</p>

      {(phase === 'cap' || phase === 'extended-cap') && (
        <Modal labelledBy="cap-h" describedBy="cap-d" tone="ember">
          <p className="modal-eyebrow">Cap reached</p>
          <h2 id="cap-h" className="h2">{phase === 'cap' ? 'Time to decide.' : 'Your extra time is used.'}</h2>
          <p id="cap-d">
            You've reached your cap for this set ({mSS(limit)}). In the exam, this is where a set starts costing you other marks.
          </p>
          <div className="modal-actions">
            <Btn variant="primary" onClick={() => finish(true)}>Leave this set</Btn>
            {phase === 'cap' && (
              <Btn
                icon={false}
                onClick={() => {
                  last.current = Date.now();
                  setExtended(true);
                  setPhase('run');
                }}
              >
                Take 2 more minutes (once)
              </Btn>
            )}
          </div>
        </Modal>
      )}
      {phase === 'confirm-leave' && (
        <Modal labelledBy="lv-h" onEscape={() => { last.current = Date.now(); setPhase('run'); }}>
          <h2 id="lv-h" className="h2">Leave this set?</h2>
          <p>Your time and answers so far go into the replay.</p>
          <div className="modal-actions">
            <Btn variant="primary" onClick={() => finish(true)}>Leave this set</Btn>
            <Btn icon={false} onClick={() => { last.current = Date.now(); setPhase('run'); }}>Stay on it</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function Attempt() {
  const { setId } = useParams();
  const s = useStore();
  const set = setId ? s.getSet(setId) : undefined;
  if (!set) return <Navigate to="/drill" replace />;
  return <Run key={set.id} set={set} />;
}
