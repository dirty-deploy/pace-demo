import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Play } from 'lucide-react';
import { lessonById, LESSONS } from '../content/lessons';
import { Button, Chip, Dialog, Stat } from '../components/ui';
import { daysLeft, toISO, weekday, weekOf } from '../logic/dates';
import { bestStreak, currentStreak, ruleMet, weekStates, type DayState } from '../logic/streak';
import { setBlockDone } from '../components/planner/model';
import { ruleOf } from '../state/actions';
import { today, update, useApp } from '../state/store';
import { buildTodayPlan, type PlanItem } from '../state/todayPlan';
import '../styles/home.css';

function greeting(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const CELL_TEXT: Record<DayState, string> = {
  done: 'done',
  missed: 'missed',
  today: 'today, not done yet',
  'today-done': 'today, done',
  future: 'not reached yet',
};

function PlanRow({ item, onDone }: { item: PlanItem; onDone: (item: PlanItem) => void }) {
  return (
    <li className={`plan-row${item.done ? ' done' : ''}`}>
      {item.blockId ? (
        <input type="checkbox" className="plan-check" checked={item.done} onChange={() => onDone(item)} aria-label={`Mark ${item.label} done`} />
      ) : (
        <span className={`plan-tick${item.done ? ' on' : ''}`} aria-hidden>
          {item.done && <Check size={14} strokeWidth={2} />}
        </span>
      )}
      <span className="grow">
        <span className="plan-label">{item.label}</span>
        <span className="small muted">
          {item.minutes} min{item.detail ? ` · ${item.detail}` : ''}
          {item.done ? ' · done' : ''}
        </span>
      </span>
      {!item.done && <Link to={item.to} className="btn btn-secondary" aria-label={`Start ${item.label}`}>Start</Link>}
    </li>
  );
}

function MinutesDialog({ current, onClose }: { current: number; onClose: () => void }) {
  const set = (minutes: number) => {
    const date = toISO(today());
    update((s) => ({ ...s, dayOverride: { date, minutes } }));
    onClose();
  };
  return (
    <Dialog title="How much time do you have today?" onClose={onClose} actions={<Button onClick={onClose}>Keep {current} min</Button>}>
      <div className="chips">
        {[15, 30, 45, 60, 90, 120, 180].map((m) => (
          <Chip key={m} selected={m === current} onClick={() => set(m)}>
            {m} min
          </Chip>
        ))}
      </div>
    </Dialog>
  );
}

export default function Home() {
  const s = useApp();
  const nav = useNavigate();
  const [changing, setChanging] = useState(false);
  const now = today();
  const plan = useMemo(() => buildTodayPlan(s, now), [s]); // eslint-disable-line react-hooks/exhaustive-deps
  const profile = s.profile;
  const rule = ruleOf(s);
  const iso = toISO(now);
  const met = ruleMet(s.days[iso], rule);
  const week = weekOf(now);
  const states = weekStates(week, s.days, now, rule);
  const next = plan.items.find((i) => !i.done);
  const allDone = plan.items.length > 0 && !next;

  // The one unfinished thing: a paused test first, otherwise a lesson in progress.
  const paused = Object.values(s.active).sort((a, b) => b.updatedAt - a.updatedAt)[0];
  const lessonId = LESSONS.find((l) => s.lessons[l.id]?.position > 0 && !s.lessons[l.id]?.done)?.id;
  const lesson = lessonId ? lessonById(lessonId) : undefined;

  const pct = Math.round(plan.rate * 100);
  const sizing =
    plan.load < plan.windowMinutes
      ? `You have ${plan.windowMinutes} min. You've been finishing about ${pct}% of what you plan, so today is sized to ${plan.load} min.`
      : `You have ${plan.windowMinutes} min, and today is sized to fill it.`;

  return (
    <div className="home">
      <div className="home-greet">
        <p className="section-title">
          {greeting(now.getHours())}, {profile?.name}
        </p>
        <p className="muted">
          {daysLeft(now, profile?.examDate)} days to {profile?.exam.split(' ')[0]} · You have {plan.windowMinutes} min today{' '}
          <button type="button" className="linklike" onClick={() => setChanging(true)}>
            change
          </button>
        </p>
      </div>
      <div className="home-grid">
        <div className="stack">
          <section className="card" aria-labelledby="plan-h">
            <h2 id="plan-h" className="card-title">
              Today's plan
            </h2>
            <p className="small muted plan-size">{sizing}</p>
            {plan.items.length ? (
              <ul className="plan-list">
                {plan.items.map((i) => (
                  <PlanRow key={i.id} item={i} onDone={(item) => setBlockDone(item.blockId as string, !item.done, iso)} />
                ))}
              </ul>
            ) : (
              <p className="muted plan-empty">Nothing fits in {plan.load} min. Give yourself a little more time, or do a quick set of questions.</p>
            )}
            {next && (
              <Button variant="primary" icon={Play} onClick={() => nav(next.to)}>
                Start next
              </Button>
            )}
            {allDone && <p className="plan-end">That's today's plan done. Well worked.</p>}
          </section>
          {(paused || lesson) && (
            <section className="card continue" aria-labelledby="cont-h">
              <div className="grow">
                <h2 id="cont-h" className="card-title">
                  Continue
                </h2>
                <p className="small muted">{paused ? `${paused.def.name} · ${Object.values(paused.states).filter((q) => q.answer).length} answered so far` : lesson?.title}</p>
              </div>
              <Button to={paused ? `/test/${paused.def.id}` : `/learn/lessons/${lesson?.id}`}>Resume</Button>
            </section>
          )}
        </div>
        <section className="card streak-card" aria-labelledby="streak-h">
          <h2 id="streak-h" className="card-title">
            Streak
          </h2>
          <div className="stats">
            <Stat value={currentStreak(s.days, now, rule)} label="Current" />
            <Stat value={bestStreak(s.days, rule)} label="Best" />
          </div>
          <ul className="week-cells" aria-label="This week">
            {week.map((d, i) => (
              <li key={i} className={`week-cell cell-${states[i]}`} aria-label={`${weekday(d)}, ${CELL_TEXT[states[i]]}`}>
                <span aria-hidden>{weekday(d)[0]}</span>
                <i aria-hidden>{states[i] === 'done' || states[i] === 'today-done' ? <Check size={14} strokeWidth={2} /> : states[i] === 'missed' ? '–' : ''}</i>
              </li>
            ))}
          </ul>
          {met ? (
            <p className="streak-done">
              <Check size={16} strokeWidth={2} aria-hidden /> Done for today
            </p>
          ) : (
            <p className="small">
              Answer {rule.questions} question{rule.questions > 1 ? 's' : ''} or watch {rule.lessonMinutes} minutes of a lesson to keep your streak.
            </p>
          )}
        </section>
      </div>
      <nav className="home-links" aria-label="Shortcuts">
        <Link to="/practice/daily">Daily set</Link>
        <Link to="/practice/tests">Tests</Link>
        <Link to="/learn/lessons">Lessons</Link>
        <Link to="/learn/vocab">Vocabulary</Link>
      </nav>
      {changing && <MinutesDialog current={plan.windowMinutes} onClose={() => setChanging(false)} />}
    </div>
  );
}
