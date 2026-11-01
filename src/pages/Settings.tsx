import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, RotateCcw, Upload } from 'lucide-react';
import { Button, Chip, Dialog, Tabs, toast, type TabDef } from '../components/ui';
import { EXAM_DATE, XAT_DATE } from '../logic/dates';
import { saveProfile, saveSettings, todayISO } from '../state/actions';
import { exportFilename, exportJson, importSummary, parseImport } from '../state/importExport';
import type { AppState, ExamName, Profile, Theme } from '../state/schema';
import { getState, isUsingStorage, resetAll, setState, useApp } from '../state/store';
import '../styles/settings.css';

type Tab = 'profile' | 'study' | 'theme' | 'data';

const TABS: TabDef<Tab>[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'study', label: 'Study' },
  { id: 'theme', label: 'Theme' },
  { id: 'data', label: 'Your data' },
];

const EXAM_DATES: Record<ExamName, string> = { 'CAT 2026': EXAM_DATE, 'XAT 2027': XAT_DATE };

const THEMES: { id: Theme; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System' },
];

const MIN_MINUTES = 10;
const MAX_MINUTES = 720;

function ProfileTab({ profile }: { profile: Profile }) {
  const [name, setName] = useState(profile.name);
  const [target, setTarget] = useState(profile.targetPercentile === null ? '' : String(profile.targetPercentile));
  const [exam, setExam] = useState<ExamName>(profile.exam);
  const [examDate, setExamDate] = useState(profile.examDate);
  const [error, setError] = useState('');

  const pct = Number(target);

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Add a name, so Pace knows what to call you.');
    if (target !== '' && !(pct > 0 && pct <= 100)) return setError('Enter a percentile between 1 and 100, or leave it blank.');
    if (!examDate) return setError('Pick an exam date.');
    setError('');
    saveProfile({ name: name.trim(), targetPercentile: target === '' ? null : pct, exam, examDate });
    toast('Profile saved.');
  };

  return (
    <form className="stack" onSubmit={save} noValidate>
      <section className="card st-form" aria-labelledby="st-profile-title">
        <h2 className="section-title" id="st-profile-title">
          Profile
        </h2>
        <label className="field">
          <span>Name</span>
          <input className="input" value={name} autoComplete="given-name" onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field">
          <span>Target percentile</span>
          <input className="input num" type="number" inputMode="decimal" min={1} max={100} step="any" value={target} onChange={(e) => setTarget(e.target.value)} />
          <small>Optional.</small>
        </label>
      </section>
      <section className="card st-form" aria-labelledby="st-exam-title">
        <h2 className="section-title" id="st-exam-title">
          Exam and date
        </h2>
        <label className="field">
          <span>Exam</span>
          <select
            className="select"
            value={exam}
            onChange={(e) => {
              const next = e.target.value as ExamName;
              setExam(next);
              setExamDate(EXAM_DATES[next]);
            }}
          >
            {(Object.keys(EXAM_DATES) as ExamName[]).map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Exam date</span>
          <input className="input num" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
          <small>The days-to-exam count and your redo dates use this date.</small>
        </label>
      </section>
      <SaveRow error={error} />
    </form>
  );
}

function SaveRow({ error }: { error: string }) {
  return (
    <div className="stack">
      {error && (
        <p className="st-error" role="alert">
          {error}
        </p>
      )}
      <div>
        <Button variant="primary" type="submit">
          Save changes
        </Button>
      </div>
    </div>
  );
}

function StudyTab({ profile, settings }: { profile: Profile; settings: AppState['settings'] }) {
  const [weekday, setWeekday] = useState(String(profile.weekdayMinutes));
  const [weekend, setWeekend] = useState(String(profile.weekendMinutes));
  const [questions, setQuestions] = useState(String(settings.streakQuestions));
  const [lessonMinutes, setLessonMinutes] = useState(String(settings.streakLessonMinutes));
  const [error, setError] = useState('');

  const q = Number(questions);
  const m = Number(lessonMinutes);
  const goodMinutes = (v: string) => Number.isFinite(Number(v)) && v !== '' && Number(v) >= MIN_MINUTES && Number(v) <= MAX_MINUTES;
  const goodRule = Number.isInteger(q) && q >= 1 && Number.isInteger(m) && m >= 1;

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!goodMinutes(weekday) || !goodMinutes(weekend)) return setError(`Study time needs to be between ${MIN_MINUTES} and ${MAX_MINUTES} minutes.`);
    if (!goodRule) return setError('Streak thresholds need to be whole numbers of 1 or more.');
    setError('');
    saveProfile({ weekdayMinutes: Number(weekday), weekendMinutes: Number(weekend) });
    saveSettings({ streakQuestions: q, streakLessonMinutes: m });
    toast('Study settings saved.');
  };

  return (
    <form className="stack" onSubmit={save} noValidate>
      <section className="card st-form" aria-labelledby="st-study-title">
        <h2 className="section-title" id="st-study-title">
          Study time
        </h2>
        <div className="st-pair">
          <label className="field">
            <span>Weekday minutes</span>
            <input className="input num" type="number" inputMode="numeric" min={MIN_MINUTES} max={MAX_MINUTES} step={5} value={weekday} onChange={(e) => setWeekday(e.target.value)} />
          </label>
          <label className="field">
            <span>Weekend minutes</span>
            <input className="input num" type="number" inputMode="numeric" min={MIN_MINUTES} max={MAX_MINUTES} step={5} value={weekend} onChange={(e) => setWeekend(e.target.value)} />
          </label>
        </div>
      </section>
      <section className="card st-form" aria-labelledby="st-streak-title">
        <h2 className="section-title" id="st-streak-title">
          Streak thresholds
        </h2>
        <div className="st-pair">
          <label className="field">
            <span>Questions a day</span>
            <input className="input num" type="number" inputMode="numeric" min={1} step={1} value={questions} onChange={(e) => setQuestions(e.target.value)} />
          </label>
          <label className="field">
            <span>Lesson minutes a day</span>
            <input className="input num" type="number" inputMode="numeric" min={1} step={1} value={lessonMinutes} onChange={(e) => setLessonMinutes(e.target.value)} />
          </label>
        </div>
        {goodRule && (
          <p className="muted small">
            A day counts if you answer at least {q} {q === 1 ? 'question' : 'questions'} or watch {m} {m === 1 ? 'minute' : 'minutes'} of lessons.
          </p>
        )}
        <p className="muted small">A change applies to past days too, so your streak count may move.</p>
      </section>
      <SaveRow error={error} />
    </form>
  );
}

function ThemeTab({ theme }: { theme: Theme }) {
  return (
    <section className="card stack st-form" aria-labelledby="st-theme-title">
      <h2 className="section-title" id="st-theme-title">
        Theme
      </h2>
      <div className="chips" role="group" aria-labelledby="st-theme-title">
        {THEMES.map((t) => (
          <Chip key={t.id} selected={theme === t.id} onClick={() => saveSettings({ theme: t.id })}>
            {t.label}
          </Chip>
        ))}
      </div>
      <p className="muted small">System follows the setting on your device. A change applies straight away.</p>
    </section>
  );
}

function download(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function DataTab() {
  const nav = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState('');
  const [pending, setPending] = useState<AppState | null>(null);
  const [resetting, setResetting] = useState(false);
  const closeImport = useCallback(() => setPending(null), []);
  const closeReset = useCallback(() => setResetting(false), []);

  // Shell sends anyone without a profile to /start the moment the store empties, and that beats a
  // navigation to /. So the store is emptied once the route has changed and this tab has gone.
  const resetOnLeave = useRef(false);
  useEffect(
    () => () => {
      if (resetOnLeave.current) resetAll();
    },
    [],
  );

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setImportError('');
    let text: string;
    try {
      text = await file.text();
    } catch {
      setImportError('That file could not be read. Nothing was changed.');
      return;
    } finally {
      // Lets the same file be chosen again after a fix.
      if (fileInput.current) fileInput.current.value = '';
    }
    const result = parseImport(text);
    if (result.ok) setPending(result.state);
    else setImportError(result.message);
  };

  const confirmImport = () => {
    if (!pending) return;
    setState(pending);
    setPending(null);
    toast('Your data has been imported.');
  };

  return (
    <div className="stack">
      <section className="card st-action" aria-labelledby="st-export-title">
        <div className="grow">
          <h2 className="section-title" id="st-export-title">
            Export my data
          </h2>
          <p className="muted small">Downloads everything Pace holds about you as a JSON file. It's the only copy outside this browser.</p>
        </div>
        <Button
          icon={Download}
          onClick={() => {
            download(exportJson(getState()), exportFilename(todayISO()));
            toast('Your data file is downloading.');
          }}
        >
          Export
        </Button>
      </section>
      <section className="card st-action" aria-labelledby="st-import-title">
        <div className="grow">
          <h2 className="section-title" id="st-import-title">
            Import
          </h2>
          <p className="muted small">Replaces what's in this browser with a file you exported. You'll be asked to confirm first.</p>
          {importError && (
            <p className="st-error" role="alert">
              {importError}
            </p>
          )}
        </div>
        <Button icon={Upload} onClick={() => fileInput.current?.click()}>
          Choose file
        </Button>
        <input ref={fileInput} type="file" accept=".json,application/json" aria-label="Choose a Pace data file" tabIndex={-1} hidden onChange={(e) => onFile(e.target.files?.[0])} />
      </section>
      <section className="card st-action" aria-labelledby="st-reset-title">
        <div className="grow">
          <h2 className="section-title" id="st-reset-title">
            Reset demo
          </h2>
          <p className="muted small">Clears your profile, attempts, coins and notes from this browser, and starts again from the first page.</p>
        </div>
        <Button icon={RotateCcw} onClick={() => setResetting(true)}>
          Reset demo
        </Button>
      </section>

      {pending && (
        <Dialog
          title="Replace your data with this file?"
          onClose={closeImport}
          actions={
            <>
              <Button onClick={closeImport}>Keep what I have</Button>
              <Button variant="primary" onClick={confirmImport}>
                Replace my data
              </Button>
            </>
          }
        >
          <p>{importSummary(pending)}</p>
          <p className="muted small">What's in this browser now will be overwritten. Export first if you want to keep it.</p>
        </Dialog>
      )}

      {resetting && (
        <Dialog
          title="Reset the demo?"
          onClose={closeReset}
          actions={
            <>
              <Button onClick={closeReset}>Keep my data</Button>
              <Button
                variant="primary"
                onClick={() => {
                  resetOnLeave.current = true;
                  nav('/');
                }}
              >
                Reset demo
              </Button>
            </>
          }
        >
          <p>This clears everything Pace holds in this browser. It can't be undone, unless you exported your data first.</p>
        </Dialog>
      )}
    </div>
  );
}

export default function Settings() {
  const s = useApp();
  const [tab, setTab] = useState<Tab>('profile');
  if (!s.profile) return null;
  return (
    <div className="stack st-page">
      {!isUsingStorage() && (
        <p className="st-notice" role="status">
          This browser is blocking storage, so your data lasts only until you close the tab. Export it if you want to keep it.
        </p>
      )}
      <Tabs tabs={TABS} value={tab} onChange={setTab} label="Settings sections" />
      <div role="tabpanel" aria-label={TABS.find((t) => t.id === tab)?.label}>
        {tab === 'profile' && <ProfileTab profile={s.profile} />}
        {tab === 'study' && <StudyTab profile={s.profile} settings={s.settings} />}
        {tab === 'theme' && <ThemeTab theme={s.settings.theme} />}
        {tab === 'data' && <DataTab />}
      </div>
    </div>
  );
}
