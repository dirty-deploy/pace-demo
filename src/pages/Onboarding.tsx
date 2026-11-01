import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button, Chip, Progress } from '../components/ui';
import { update } from '../state/store';
import { newProfile, type ExamName } from '../state/schema';
import { EXAM_DATE, XAT_DATE } from '../logic/dates';
import '../styles/onboarding.css';

const STEPS = 4;
const WEEKDAY = [30, 45, 60, 90, 120];
const WEEKEND = [60, 90, 120, 180, 240];
const EXAM_DATES: Record<ExamName, string> = { 'CAT 2026': EXAM_DATE, 'XAT 2027': XAT_DATE };

export default function Onboarding() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [exam, setExam] = useState<ExamName>('CAT 2026');
  const [examDate, setExamDate] = useState(EXAM_DATE);
  const [weekdayMinutes, setWeekday] = useState(60);
  const [weekendMinutes, setWeekend] = useState(120);
  const [target, setTarget] = useState('');

  const finish = () => {
    const pct = Number(target);
    update((s) => ({
      ...s,
      profile: newProfile({
        name: name.trim() || 'there',
        exam,
        examDate,
        weekdayMinutes,
        weekendMinutes,
        targetPercentile: target && pct > 0 && pct <= 100 ? pct : null,
        onboarded: true,
      }),
    }));
    nav('/home');
  };

  const next = () => (step === STEPS ? finish() : setStep(step + 1));

  const demo = async () => {
    const { loadDemoProfile } = await import('../state/demo');
    loadDemoProfile();
    nav('/home');
  };

  return (
    <div className="onb fade-in">
      <p className="small muted">Step {step} of {STEPS}</p>
      <Progress value={step / STEPS} label={`Step ${step} of ${STEPS}`} />
      <form
        className="onb-step"
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        {step === 1 && (
          <>
            <h1 className="page-title">Welcome to Pace! What should we call you?</h1>
            <label className="field">
              <span>Your name</span>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus autoComplete="given-name" />
            </label>
          </>
        )}
        {step === 2 && (
          <>
            <h1 className="page-title">Which exam are you preparing for?</h1>
            <div className="chips" role="group" aria-label="Exam">
              {(Object.keys(EXAM_DATES) as ExamName[]).map((e) => (
                <Chip
                  key={e}
                  selected={exam === e}
                  onClick={() => {
                    setExam(e);
                    setExamDate(EXAM_DATES[e]);
                  }}
                >
                  {e}
                </Chip>
              ))}
            </div>
            <label className="field">
              <span>Exam date</span>
              <input className="input" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} required />
              <small>{exam === 'XAT 2027' ? 'This is an assumed date. Change it once the official one is out.' : 'Change it if yours is different.'}</small>
            </label>
          </>
        )}
        {step === 3 && (
          <>
            <h1 className="page-title">How much time do you have to study?</h1>
            <fieldset className="onb-fieldset">
              <legend>On a weekday</legend>
              <div className="chips">
                {WEEKDAY.map((m) => (
                  <Chip key={m} selected={weekdayMinutes === m} onClick={() => setWeekday(m)}>
                    {m} min
                  </Chip>
                ))}
              </div>
            </fieldset>
            <fieldset className="onb-fieldset">
              <legend>On a weekend day</legend>
              <div className="chips">
                {WEEKEND.map((m) => (
                  <Chip key={m} selected={weekendMinutes === m} onClick={() => setWeekend(m)}>
                    {m} min
                  </Chip>
                ))}
              </div>
            </fieldset>
          </>
        )}
        {step === 4 && (
          <>
            <h1 className="page-title">Do you have a target percentile?</h1>
            <label className="field">
              <span>Target percentile (optional)</span>
              <input className="input" inputMode="decimal" type="number" min="1" max="100" step="0.1" value={target} onChange={(e) => setTarget(e.target.value)} autoFocus />
              <small>It's fine to leave this empty. You can set it later in Settings.</small>
            </label>
          </>
        )}
        <div className="row-between onb-actions">
          <div className="row">
            {step > 1 && (
              <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
          </div>
          <div className="row">
            <Button variant="ghost" onClick={next}>
              Skip
            </Button>
            <button type="submit" className="btn btn-primary">
              {step === STEPS ? 'Finish' : 'Continue'}
              <ArrowRight size={18} strokeWidth={1.5} aria-hidden />
            </button>
          </div>
        </div>
      </form>
      <p className="small muted">
        Just looking around?{' '}
        <button type="button" className="linklike" onClick={demo}>
          Explore with a demo profile
        </button>
        . <Link to="/about">About this concept</Link>.
      </p>
    </div>
  );
}
