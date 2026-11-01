import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button, SampleTag, Tag } from '../components/ui';
import { paletteState, PALETTE_LABEL } from '../logic/testRules';
import '../styles/landing.css';

const PALETTE = Array.from({ length: 15 }, (_, i) => ({
  n: i + 1,
  state: paletteState({
    visited: i < 11,
    answered: [0, 1, 2, 4, 5, 7, 8].includes(i),
    marked: [3, 8].includes(i),
  }),
}));

const LETTER = { 'not-visited': '', 'not-answered': '', answered: '', marked: 'M', 'answered-marked': 'M' };

function PalettePreview() {
  return (
    <div className="lp-card" aria-label="Preview of the test window question palette">
      <div className="row-between">
        <span className="small">QA · Section 3 of 3</span>
        <span className="num lp-timer">Section ends in 12:40</span>
      </div>
      <div className="lp-palette" aria-hidden>
        {PALETTE.map((p) => (
          <span key={p.n} className={`pal pal-${p.state}`}>
            {p.n}
            {LETTER[p.state] && <i>{LETTER[p.state]}</i>}
          </span>
        ))}
      </div>
      <ul className="lp-legend">
        {(['answered', 'not-answered', 'marked', 'not-visited'] as const).map((s) => (
          <li key={s}>
            <span className={`pal pal-sm pal-${s}`} aria-hidden />
            {PALETTE_LABEL[s]}
          </li>
        ))}
      </ul>
    </div>
  );
}

const BARS = [
  { text: '₹1,250', pct: 18 },
  { text: '₹1,400', pct: 46, correct: true },
  { text: '₹1,500', pct: 29, you: true },
  { text: '₹1,600', pct: 7 },
];

function ReviewPreview() {
  return (
    <div className="lp-card" aria-label="Preview of a reviewed question showing how everyone answered">
      <div className="row-between">
        <span className="small">How everyone answered</span>
        <SampleTag />
      </div>
      <ul className="lp-bars">
        {BARS.map((b) => (
          <li key={b.text}>
            <div className="row-between small">
              <span>
                {b.text} {b.you && <Tag>You</Tag>} {b.correct && <Tag tone="ok">Correct</Tag>}
              </span>
              <span className="num">{b.pct}%</span>
            </div>
            <div className="lp-bar">
              <i style={{ width: `${b.pct}%`, background: b.correct ? 'var(--ok)' : 'var(--line)' }} />
            </div>
          </li>
        ))}
      </ul>
      <p className="small muted">Base change trap: the 20% rise is on the new price, not the old one.</p>
    </div>
  );
}

const DAY = [
  { time: '7 pm', title: 'Set-pick drill', mins: '4 min', tint: 'dilr' },
  { time: '7:30 pm', title: 'Sectional QA', mins: '40 min', tint: 'qa' },
  { time: '8:30 pm', title: 'Vocab', mins: '10 min', tint: 'revision' },
];

function PlannerPreview() {
  return (
    <div className="lp-card" aria-label="Preview of a planner day">
      <div className="lp-quick small muted">DILR sets 7pm 45m</div>
      <ul className="lp-day">
        {DAY.map((d) => (
          <li key={d.title}>
            <span className="small muted num">{d.time}</span>
            <div className={`lp-block lp-${d.tint}`}>
              <span>{d.title}</span>
              <span className="small muted">{d.mins}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const SECTIONS = [
  {
    title: 'Practice like the exam',
    text: 'Timed sections, a question palette, locked mocks and a basic calculator. Build a daily set in under a minute and run it in the same window, so test day feels familiar.',
    preview: <PalettePreview />,
  },
  {
    title: 'Learn from every attempt',
    text: 'After each test you get a 10-minute replay of where your time went, then every question with the explanation, the trap, and other ways to solve it.',
    preview: <ReviewPreview />,
  },
  {
    title: 'Plan around your real day',
    text: 'Tell Pace how much time you have and it sizes the plan to match. Type a block in plain words, drop it on the week, and move on to the actual studying.',
    preview: <PlannerPreview />,
  },
];

export default function Landing() {
  const nav = useNavigate();
  const demo = async () => {
    const { loadDemoProfile } = await import('../state/demo');
    loadDemoProfile();
    nav('/home');
  };
  return (
    <div className="landing fade-in">
      <section className="hero">
        <h1 className="hero-title">Prepare for CAT one good day at a time.</h1>
        <p className="hero-text">
          Pace is a free study site for CAT and XAT students. It shows you what matters today, gives you exam-style practice, and helps you learn from each attempt. No login needed. Your work stays in your browser.
        </p>
        <div className="row hero-actions">
          <Button variant="primary" to="/start" icon={ArrowRight}>
            Start preparing
          </Button>
          <Button onClick={demo}>Explore with a demo profile</Button>
        </div>
      </section>
      {SECTIONS.map((s, i) => (
        <section className={`lp-section${i % 2 ? ' lp-flip' : ''}`} key={s.title}>
          <div>
            <h2 className="lp-title">{s.title}</h2>
            <p className="muted">{s.text}</p>
          </div>
          {s.preview}
        </section>
      ))}
    </div>
  );
}
