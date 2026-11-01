import { useState } from 'react';
import { ChevronLeft, ChevronRight, Repeat2, ShieldCheck } from 'lucide-react';
import { Button, Empty, Stat } from '../components/ui';
import { balanceOf, SPEND_ITEMS } from '../logic/coins';
import { addDays, parseISO, shortDate, toISO, weekday, weekOf } from '../logic/dates';
import { bestStreak, currentStreak, formatHours, heatLevel, minutesInMonth, ruleMet, type DayActivity, type StreakRule } from '../logic/streak';
import { ruleOf } from '../state/actions';
import { today, useApp } from '../state/store';
import '../styles/streak.css';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const LOG_STEP = 10;

const LEGEND = [
  { level: 0, label: 'None' },
  { level: 1, label: 'Under 20 min' },
  { level: 2, label: '20 to 44' },
  { level: 3, label: '45 to 89' },
  { level: 4, label: '90 or more' },
];

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

const dayName = (d: Date) => `${weekday(d)} ${shortDate(d)}`;

/** "14 questions, 22 min of lessons", leaving out whatever is zero. */
function activityText(day: DayActivity | undefined): string {
  const parts: string[] = [];
  if (day?.questions) parts.push(plural(day.questions, 'question'));
  if (day?.lessonSeconds) parts.push(`${Math.max(1, Math.round(day.lessonSeconds / 60))} min of lessons`);
  if (!parts.length && day?.minutes) parts.push(`${Math.round(day.minutes)} min of study`);
  if (day?.shielded) parts.push('covered by a shield');
  return parts.length ? parts.join(', ') : 'nothing logged';
}

const hasActivity = (d: DayActivity) => d.questions > 0 || d.lessonSeconds > 0 || d.minutes > 0;

function ruleSentence(rule: StreakRule, ending: string): string {
  return `Answer ${plural(rule.questions, 'question')} or watch ${plural(rule.lessonMinutes, 'minute')} of a lesson to ${ending}.`;
}

function monthWeeks(year: number, month: number): Date[][] {
  const weeks: Date[][] = [];
  let monday = weekOf(parseISO(`${year}-${String(month + 1).padStart(2, '0')}-01`))[0];
  do {
    weeks.push(weekOf(monday));
    monday = addDays(monday, 7);
  } while (monday.getMonth() === month);
  return weeks;
}

function DayCell({ date, day, month, todayISO }: { date: Date; day: DayActivity | undefined; month: number; todayISO: string }) {
  const iso = toISO(date);
  const future = iso > todayISO;
  const isToday = iso === todayISO;
  const cls = ['st-day', `st-heat-${future ? 0 : heatLevel(day?.minutes ?? 0)}`, date.getMonth() !== month && 'is-outside', isToday && 'is-today'].filter(Boolean).join(' ');
  const label = future ? dayName(date) : `${dayName(date)}${isToday ? ', today' : ''}: ${activityText(day)}`;
  return (
    <td title={label}>
      <div className={cls}>
        <span aria-hidden className="num">
          {date.getDate()}
        </span>
        {day?.shielded && <ShieldCheck size={14} strokeWidth={1.5} className="st-shield" aria-hidden />}
        <span className="sr-only">{label}</span>
      </div>
    </td>
  );
}

export default function Streak() {
  const s = useApp();
  const now = today();
  const todayISO = toISO(now);
  const rule = ruleOf(s);
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [logShown, setLogShown] = useState(LOG_STEP);

  const logged = Object.keys(s.days)
    .filter((iso) => hasActivity(s.days[iso]) || s.days[iso].shielded)
    .sort()
    .reverse();

  if (!logged.length) {
    return (
      <div className="card">
        <Empty
          icon={Repeat2}
          text={ruleSentence(rule, 'start your streak')}
          action={
            <Button variant="primary" to="/practice/daily">
              Start the daily set
            </Button>
          }
        />
      </div>
    );
  }

  const current = currentStreak(s.days, now, rule);
  const best = bestStreak(s.days, rule);
  const doneToday = ruleMet(s.days[todayISO], rule);
  const onCurrentMonth = view.year === now.getFullYear() && view.month === now.getMonth();
  const { coins: shieldCost } = SPEND_ITEMS.shield;

  const stepMonth = (delta: number) =>
    setView(({ year, month }) => {
      const next = month + delta;
      return { year: year + Math.floor(next / 12), month: ((next % 12) + 12) % 12 };
    });

  return (
    <div className="st-page">
      <section className="card st-summary" aria-label="Your streak">
        <div className="stats">
          <Stat value={plural(current, 'day')} label="Current streak" />
          <Stat value={plural(best, 'day')} label="Best streak" />
          <Stat value={doneToday ? 'Done' : 'Not yet'} label="Today" note={s.days[todayISO] ? activityText(s.days[todayISO]) : undefined} />
        </div>
        <p>{ruleSentence(rule, 'keep your streak')}</p>
        {current === 0 && <p>Streaks restart. Your study time this month: {formatHours(minutesInMonth(s.days, now.getFullYear(), now.getMonth()))}.</p>}
      </section>

      <div className="st-columns">
        <section className="card st-month" aria-labelledby="st-month-title">
          <div className="st-month-head">
            <div>
              <h2 id="st-month-title" className="card-title" aria-live="polite">
                {MONTHS[view.month]} {view.year}
              </h2>
              <p className="muted small">{formatHours(minutesInMonth(s.days, view.year, view.month))} studied</p>
            </div>
            <div className="row">
              <Button icon={ChevronLeft} className="st-icon-btn" aria-label="Previous month" onClick={() => stepMonth(-1)}>
                {null}
              </Button>
              <Button icon={ChevronRight} className="st-icon-btn" aria-label="Next month" disabled={onCurrentMonth} onClick={() => stepMonth(1)}>
                {null}
              </Button>
            </div>
          </div>

          <table className="st-calendar">
            <caption className="sr-only">
              Study calendar for {MONTHS[view.month]} {view.year}
            </caption>
            <thead>
              <tr>
                {WEEKDAYS.map((d) => (
                  <th key={d} scope="col">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthWeeks(view.year, view.month).map((week) => (
                <tr key={toISO(week[0])}>
                  {week.map((date) => (
                    <DayCell key={toISO(date)} date={date} day={s.days[toISO(date)]} month={view.month} todayISO={todayISO} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="st-legend" aria-label="Minutes studied in a day">
            {LEGEND.map(({ level, label }) => (
              <li key={level}>
                <i className={`st-swatch st-heat-${level}`} aria-hidden />
                {label}
              </li>
            ))}
            <li>
              <ShieldCheck size={14} strokeWidth={1.5} aria-hidden />
              Shield used
            </li>
          </ul>
        </section>

        <div className="st-side">
          <section className="card st-shields" aria-labelledby="st-shields-title">
            <h2 id="st-shields-title" className="card-title">
              Streak shields
            </h2>
            <Stat value={s.purchases.shields} label={`${s.purchases.shields === 1 ? 'Shield' : 'Shields'} held`} />
            <p className="muted small">
              A shield covers one missed day. It costs {shieldCost} coins and you have {balanceOf(s.coins)}.
            </p>
            <Button variant="secondary" to="/rewards">
              Buy one in Rewards
            </Button>
          </section>

          <section className="card" aria-labelledby="st-log-title">
            <h2 id="st-log-title" className="card-title">
              Activity log
            </h2>
            <ol className="st-log">
              {logged.slice(0, logShown).map((iso) => (
                <li key={iso}>
                  {dayName(parseISO(iso))}: {activityText(s.days[iso])}
                </li>
              ))}
            </ol>
            {logged.length > logShown && (
              <Button variant="ghost" onClick={() => setLogShown((n) => n + LOG_STEP)}>
                Show more
              </Button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
