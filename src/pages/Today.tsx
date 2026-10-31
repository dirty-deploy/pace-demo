import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Clock3, Copy, Gauge, RotateCcw } from 'lucide-react';
import { Btn, Chip, Disc, Eyebrow } from '../components/ui';
import { useStore, nowDate } from '../state/store';
import { usePlan } from '../state/plan';
import { parseISO, shortDate, toISO, weekOf, weekday } from '../logic/dates';
import student from '../data/demo_student.json';

const QUICK = [30, 45, 60, 90];

function WeekCard() {
  const now = nowDate();
  const todayISO = toISO(now);
  const sessions = student.lastFiveSessions;
  const done = sessions.filter((s) => s.completedMinutes / s.plannedMinutes >= 0.7).length;
  return (
    <section className="card week" aria-labelledby="week-h">
      <Eyebrow>
        <span id="week-h">This week</span>
      </Eyebrow>
      <ul className="week-dots" aria-label="Sessions this week">
        {weekOf(now).map((d) => {
          const iso = toISO(d);
          const s = sessions.find((x) => x.date === iso);
          const isDone = !!s && s.completedMinutes / s.plannedMinutes >= 0.7;
          const state = iso === todayISO ? 'today' : isDone ? 'done' : 'planned';
          return (
            <li key={iso} className={`wd wd-${state}`}>
              <i aria-hidden />
              <span>{weekday(d).slice(0, 3)}</span>
              <span className="sr-only">{state === 'today' ? 'today' : state === 'done' ? 'session done' : 'planned'}</span>
            </li>
          );
        })}
      </ul>
      <p className="week-line">
        {done} of {sessions.length} planned sessions done
      </p>
      <p className="week-note">A training log, not a streak. A session counts as done at 70% of its planned minutes.</p>
    </section>
  );
}

export default function Today() {
  const s = useStore();
  const nav = useNavigate();
  const plan = usePlan();
  const [raw, setRaw] = useState(String(s.windowMinutes));
  const [copied, setCopied] = useState(false);
  const now = nowDate();

  const setWindow = (n: number) => {
    const v = Math.max(0, Math.min(480, Math.round(n) || 0));
    s.setWindowMinutes(v);
    setRaw(String(v));
  };

  const current = plan.nodes.find((n) => n.current);
  const upcomingRedo = s.redoQueue.filter((r) => r.dueISO > toISO(now)).sort((a, b) => a.dueISO.localeCompare(b.dueISO));
  const pct = Math.round(plan.rate * 100);
  const buffer = Math.max(0, Math.round((plan.load - plan.used) * 10) / 10);
  const caption = `PACE-DEMO-7Q2K`;

  return (
    <div className="today">
      <h1 className="sr-only">Today's plan</h1>
      <p className="greeting">Good to see you. Here's today, sized to the time you have.</p>

      <section className="window card-flat" aria-labelledby="win-h">
        <div className="window-head">
          <h2 id="win-h" className="q">How much time do you have today?</h2>
          <div className="window-controls">
            <div className="chips" role="group" aria-label="Quick choices, in minutes">
              {QUICK.map((m) => (
                <Chip key={m} selected={s.windowMinutes === m} onClick={() => setWindow(m)}>
                  {m}
                </Chip>
              ))}
            </div>
            <label className="num">
              <span className="sr-only">Minutes available today</span>
              <input inputMode="numeric" value={raw} onChange={(e) => { setRaw(e.target.value.replace(/\D/g, '')); const n = parseInt(e.target.value, 10); s.setWindowMinutes(Number.isFinite(n) ? Math.min(480, n) : 0); }} onBlur={() => setRaw(String(s.windowMinutes))} />
              <em>min</em>
            </label>
          </div>
        </div>
        <p className="formula" aria-live="polite">
          You finished about <b>{pct}%</b> of what you planned over your last 5 sessions, so we've planned <b>{plan.load}</b> of your <b>{s.windowMinutes}</b> minutes.
        </p>
      </section>

      <div className="hero">
        <WeekCard />
        <section className="card plan" aria-labelledby="plan-h">
          <div className="plan-top">
            <span className="tag">Recommended · today</span>
            <h2 id="plan-h" className="plan-title">
              Today's plan · <span className="tnum">{plan.load}</span> of <span className="tnum">{s.windowMinutes}</span> min
            </h2>
          </div>
          {plan.nodes.length === 0 ? (
            <p className="empty">Nothing fits in {s.windowMinutes} minutes yet. The shortest item is the 4-minute drill.</p>
          ) : (
            <ol className="path">
              {plan.nodes.map((n) => (
                <li key={n.id} className={`node ${n.done ? 'is-done' : n.current ? 'is-current' : 'is-todo'}`} aria-current={n.current ? 'step' : undefined}>
                  <Disc state={n.done ? 'done' : n.current ? 'current' : 'todo'}>{n.done ? <CheckGlyph /> : null}</Disc>
                  <div className="node-body">
                    <p className="node-title">{n.label}</p>
                    <p className="node-detail">{n.detail}</p>
                  </div>
                  <span className="node-min tnum">{Math.round(n.minutes)} min</span>
                  {!n.done && !n.current && (
                    <Btn small icon={false} onClick={() => nav(n.to)} aria-label={`Start ${n.label}`}>
                      Start
                    </Btn>
                  )}
                  {n.done && <span className="node-done">Done</span>}
                </li>
              ))}
            </ol>
          )}
          {plan.dropped.length > 0 && (
            <p className="dropped">
              <b>Dropped to fit your time:</b> {plan.dropped.map((d) => `${d.label} (${Math.round(d.minutes)} min)`).join(', ')}.
            </p>
          )}
          <div className="plan-foot">
            <p className="plan-sum">
              {Math.round(plan.used)} min scheduled{buffer >= 1 ? `, ${Math.round(buffer)} min of slack` : ''}.
            </p>
            {current ? (
              <Btn variant="primary" onClick={() => nav(current.to)}>
                Start
              </Btn>
            ) : plan.nodes.length ? (
              <Btn variant="primary" to="/drill">
                New drill
              </Btn>
            ) : (
              <Btn variant="primary" to="/drill">
                Start set-pick drill
              </Btn>
            )}
          </div>
        </section>
      </div>

      <ul className="tiles" aria-label="Today at a glance">
        <li className="tile">
          <span className="tile-num tnum">{plan.load}<small> min</small></span>
          <span className="tile-label">Planned</span>
          <Clock3 size={18} strokeWidth={1.5} aria-hidden />
        </li>
        <li className="tile">
          <span className="tile-num tnum">×{s.pace.toFixed(2)}</span>
          <span className="tile-label">Your pace (estimate)</span>
          <Gauge size={18} strokeWidth={1.5} aria-hidden />
        </li>
        <li className="tile">
          <span className="tile-num tnum">{plan.redoDueToday}</span>
          <span className="tile-label">Redo due today</span>
          <RotateCcw size={18} strokeWidth={1.5} aria-hidden />
        </li>
      </ul>

      {upcomingRedo.length > 0 && (
        <section className="card-flat redo-sched" aria-labelledby="rs-h">
          <h2 id="rs-h" className="h3">Redo items scheduled</h2>
          <ul>
            {upcomingRedo.map((r) => (
              <li key={r.setId + r.dueISO}>
                <span className="rs-date tnum">{shortDate(parseISO(r.dueISO))}</span>
                <span>
                  <b>{r.label}</b> <em>{r.note}</em>
                </span>
                <span className="muted tnum">{r.minutes.toFixed(1)} min (estimate)</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="duo">
        <details className="card-flat sized">
          <summary>
            <span>How this plan is sized</span>
            <ChevronDown size={18} strokeWidth={1.5} aria-hidden />
          </summary>
          <p className="muted">
            Minutes available × the average share of planned minutes you completed in your last five sessions (each capped at 100%).
          </p>
          <ul className="bars" aria-label="Last five sessions, planned and completed minutes">
            {s.sessions.map((x) => (
              <li key={x.date}>
                <span className="b-date tnum">{shortDate(parseISO(x.date))}</span>
                <span className="b-track" aria-hidden>
                  <i className="b-plan" style={{ width: `${(x.plannedMinutes / 60) * 100}%` }} />
                  <i className="b-done" style={{ width: `${(x.completedMinutes / 60) * 100}%` }} />
                </span>
                <span className="b-num tnum">{x.completedMinutes} of {x.plannedMinutes} min</span>
              </li>
            ))}
          </ul>
          <p className="muted small">Mean completion rate: <b className="tnum">{pct}%</b></p>
        </details>

        <section className="card-flat topics" aria-labelledby="top-h">
          <h2 id="top-h" className="h3">Topics</h2>
          <ul>
            {s.topicAttempts.map((t) => (
              <li key={t.topic}>
                <span>{t.topic}</span>
                {t.attempts >= 5 && t.accuracy !== null ? (
                  <span className="tnum">
                    {Math.round(t.accuracy * 100)}% correct <em>over {t.attempts} attempts</em>
                  </span>
                ) : (
                  <span className="badge">Not enough data yet</span>
                )}
              </li>
            ))}
          </ul>
          <p className="muted small">A topic needs at least 5 attempts before we label it.</p>
        </section>
      </div>

      <section className="card-flat share" aria-labelledby="sh-h">
        <div>
          <h2 id="sh-h" className="h3">Share your week</h2>
          <p className="share-cap">
            This week: {s.sessions.filter((x) => x.completedMinutes / x.plannedMinutes >= 0.7).length} of {s.sessions.length} planned sessions done, {plan.load} min planned today. Try a set-pick round with my code {caption}.
          </p>
          <p className="muted small">Demo invite code. In the real product the link would carry the sharer's own activation code.</p>
        </div>
        <Btn
          icon={<Copy size={16} strokeWidth={1.5} aria-hidden />}
          onClick={() => {
            try {
              void navigator.clipboard.writeText(`Try a set-pick round with my code ${caption}`);
            } catch {
              /* clipboard unavailable: the text is on screen */
            }
            setCopied(true);
          }}
        >
          {copied ? 'Copied' : 'Copy caption'}
        </Btn>
      </section>
      <p className="sr-only" aria-live="polite">{`Plan updated: ${plan.nodes.length} items, ${Math.round(plan.used)} minutes.`}</p>
    </div>
  );
}

function CheckGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--text)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7.5l2.6 2.6L11 4.6" />
    </svg>
  );
}
