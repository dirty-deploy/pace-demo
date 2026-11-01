import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Save, X } from 'lucide-react';
import { BANK, topicsBySection } from '../content';
import type { Section } from '../content/types';
import { Button, Chip, Dialog, toast } from '../components/ui';
import { toISO } from '../logic/dates';
import { BALANCED, buildDailySet, matchingQuestions, matchMix, mixSummary, type DailyConfig, type Mix } from '../logic/dailyset';
import { newId } from '../state/actions';
import { today, update, useApp } from '../state/store';
import { startAttempt } from '../state/testEngine';
import type { AppState, TestDef } from '../state/schema';
import '../styles/daily.css';

const COUNTS = [5, 10, 15, 20];
const TIMES = [10, 20, 30, 45];
const SECTIONS: Section[] = ['VARC', 'DILR', 'QA'];

function studentLevel(s: AppState) {
  const answered = s.attempts.flatMap((a) => a.questions).filter((q) => q.correct !== null);
  return { attempted: answered.length, accuracy: answered.length ? answered.filter((q) => q.correct).length / answered.length : null };
}

function lastAnsweredMap(s: AppState) {
  const out: Record<string, string> = {};
  for (const a of s.attempts) {
    const iso = toISO(new Date(a.endedAt));
    for (const q of a.questions) if (q.answer !== null && (!out[q.id] || out[q.id] < iso)) out[q.id] = iso;
  }
  return out;
}

/** Two thumbs on one track split 100% into Easy, Medium and Hard. */
function MixSlider({ mix, onChange }: { mix: Mix; onChange: (m: Mix) => void }) {
  const a = mix.Easy;
  const b = mix.Easy + mix.Medium;
  const setA = (v: number) => {
    const easy = Math.min(v, b);
    onChange({ Easy: easy, Medium: b - easy, Hard: 100 - b });
  };
  const setB = (v: number) => {
    const end = Math.max(v, a);
    onChange({ Easy: a, Medium: end - a, Hard: 100 - end });
  };
  return (
    <div>
      <div className="mix">
        <div className="mix-track" aria-hidden>
          <i className="mix-easy" style={{ width: `${a}%` }} />
          <i className="mix-med" style={{ width: `${b - a}%` }} />
          <i className="mix-hard" style={{ width: `${100 - b}%` }} />
        </div>
        <input type="range" min={0} max={100} step={5} value={a} onChange={(e) => setA(Number(e.target.value))} aria-label="Share of Easy questions" />
        <input type="range" min={0} max={100} step={5} value={b} onChange={(e) => setB(Number(e.target.value))} aria-label="Share of Easy and Medium questions together" />
      </div>
      <p className="small muted num">
        Easy {mix.Easy}% · Medium {mix.Medium}% · Hard {mix.Hard}%
      </p>
    </div>
  );
}

function startSet(config: DailyConfig, name: string, s: AppState): { route: string | null; shortBy: number } {
  const level = studentLevel(s);
  const mix = config.mix === 'match' ? matchMix(level.attempted, level.accuracy) : config.mix;
  const r = buildDailySet(config, BANK, mix, lastAnsweredMap(s), toISO(today()), newId('seed'));
  if (!r.questionIds.length) return { route: null, shortBy: r.shortBy };
  const id = newId('daily');
  const def: TestDef = {
    id,
    type: 'daily',
    name,
    mode: 'practice',
    capped: false,
    sections: [{ section: 'QA', name: 'Daily set', minutes: config.minutes, questionIds: r.questionIds }],
  };
  startAttempt(def);
  return { route: `/test/${id}`, shortBy: r.shortBy };
}

export default function DailySet() {
  const nav = useNavigate();
  const s = useApp();
  const [count, setCount] = useState(10);
  const [customCount, setCustomCount] = useState(false);
  const [minutes, setMinutes] = useState<number | null>(20);
  const [customTime, setCustomTime] = useState(false);
  const [mix, setMix] = useState<Mix | 'match'>('match');
  const [topics, setTopics] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [presetName, setPresetName] = useState('');
  const groups = useMemo(topicsBySection, []);

  const config: DailyConfig = { count, minutes, mix, topics };
  const level = studentLevel(s);
  const effectiveMix = mix === 'match' ? matchMix(level.attempted, level.accuracy) : mix;
  const available = matchingQuestions(BANK, topics).length;
  const short = count > available;

  const topicText = !topics.length ? 'all topics' : topics.length > 3 ? `${topics.slice(0, 3).join(', ')} and ${topics.length - 3} more` : topics.join(', ');
  const summary = `${Math.min(count, available)} questions · ${minutes === null ? 'no time limit' : `${minutes} min`} · ${mixSummary(effectiveMix)} · ${topicText}`;

  const toggle = (t: string) => setTopics((xs) => (xs.includes(t) ? xs.filter((x) => x !== t) : [...xs, t]));

  const go = (c: DailyConfig, name: string) => {
    const r = startSet(c, name, s);
    if (r.route) nav(r.route);
    else toast('No questions match. Clear the topic filter and try again.');
  };

  const savePreset = () => {
    const name = presetName.trim();
    if (!name) return;
    update((x) => ({ ...x, presets: [...x.presets, { id: newId('p'), name, config }] }));
    setSaving(false);
    setPresetName('');
    toast(`Saved "${name}"`);
  };

  return (
    <div className="daily">
      <section aria-labelledby="preset-h">
        <h2 id="preset-h" className="section-title">
          My daily sets
        </h2>
        <ul className="presets">
          {s.presets.map((p) => (
            <li key={p.id} className="preset">
              <button type="button" className="preset-start" onClick={() => go(p.config, p.name)}>
                <Play size={16} strokeWidth={1.5} aria-hidden />
                <span>{p.name}</span>
                <small className="muted num">
                  {p.config.count} questions · {p.config.minutes === null ? 'no limit' : `${p.config.minutes} min`}
                </small>
              </button>
              {p.id !== 'quick-10' && (
                <button type="button" className="icon-btn" aria-label={`Delete ${p.name}`} onClick={() => update((x) => ({ ...x, presets: x.presets.filter((y) => y.id !== p.id) }))}>
                  <X size={16} strokeWidth={1.5} aria-hidden />
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="card stack-lg" aria-labelledby="build-h">
        <h2 id="build-h" className="card-title">
          Build a set
        </h2>
        <fieldset className="daily-field">
          <legend>Number of questions</legend>
          <div className="chips">
            {COUNTS.map((c) => (
              <Chip
                key={c}
                selected={!customCount && count === c}
                onClick={() => {
                  setCustomCount(false);
                  setCount(c);
                }}
              >
                {c}
              </Chip>
            ))}
            <Chip selected={customCount} onClick={() => setCustomCount(true)}>
              Custom
            </Chip>
            {customCount && (
              <input
                className="input daily-num"
                type="number"
                min={5}
                max={30}
                value={count}
                aria-label="Custom number of questions, 5 to 30"
                onChange={(e) => setCount(Math.max(5, Math.min(30, Number(e.target.value) || 5)))}
              />
            )}
          </div>
        </fieldset>

        <fieldset className="daily-field">
          <legend>Total time</legend>
          <div className="chips">
            {TIMES.map((t) => (
              <Chip
                key={t}
                selected={!customTime && minutes === t}
                onClick={() => {
                  setCustomTime(false);
                  setMinutes(t);
                }}
              >
                {t} min
              </Chip>
            ))}
            <Chip
              selected={customTime}
              onClick={() => {
                setCustomTime(true);
                setMinutes(minutes ?? 25);
              }}
            >
              Custom
            </Chip>
            {customTime && minutes !== null && (
              <input
                className="input daily-num"
                type="number"
                min={5}
                max={120}
                value={minutes}
                aria-label="Custom minutes"
                onChange={(e) => setMinutes(Math.max(5, Math.min(120, Number(e.target.value) || 5)))}
              />
            )}
            <Chip
              selected={minutes === null}
              onClick={() => {
                setCustomTime(false);
                setMinutes(minutes === null ? 20 : null);
              }}
            >
              No time limit
            </Chip>
          </div>
        </fieldset>

        <fieldset className="daily-field">
          <legend>Difficulty</legend>
          <div className="chips">
            <Chip selected={mix === 'match'} onClick={() => setMix('match')}>
              Match my level
            </Chip>
            <Chip selected={mix !== 'match'} onClick={() => setMix(mix === 'match' ? BALANCED : mix)}>
              Set the mix
            </Chip>
          </div>
          {mix === 'match' ? (
            <p className="small muted">{level.attempted >= 5 ? `Based on your ${Math.round((level.accuracy ?? 0) * 100)}% accuracy over ${level.attempted} questions.` : 'Balanced for now. It adjusts once you have 5 or more attempts.'}</p>
          ) : (
            <MixSlider mix={mix} onChange={setMix} />
          )}
        </fieldset>

        <fieldset className="daily-field">
          <legend>Topics</legend>
          {SECTIONS.map((sec) => (
            <div key={sec} className="daily-topics">
              <p className="small muted">{sec}</p>
              <div className="chips">
                {groups[sec].map((t) => (
                  <Chip key={t} selected={topics.includes(t)} onClick={() => toggle(t)}>
                    {t}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </fieldset>

        <div className="daily-summary" aria-live="polite">
          <p>{summary}</p>
          {short && (
            <p className="small">
              Only {available} questions match these topics.{' '}
              <button type="button" className="linklike" onClick={() => setTopics([])}>
                Widen to all topics
              </button>
            </p>
          )}
        </div>
        <div className="row">
          <Button variant="primary" icon={Play} onClick={() => go(config, 'Daily set')}>
            Start set
          </Button>
          <Button icon={Save} onClick={() => setSaving(true)}>
            Save as my daily set
          </Button>
        </div>
      </section>

      {saving && (
        <Dialog
          title="Name this set"
          onClose={() => setSaving(false)}
          actions={
            <>
              <Button onClick={() => setSaving(false)}>Cancel</Button>
              <Button variant="primary" onClick={savePreset} disabled={!presetName.trim()}>
                Save
              </Button>
            </>
          }
        >
          <label className="field">
            <span>Name</span>
            <input className="input" value={presetName} onChange={(e) => setPresetName(e.target.value)} placeholder="Morning QA" />
          </label>
          <p className="small muted">{summary}</p>
        </Dialog>
      )}
    </div>
  );
}
