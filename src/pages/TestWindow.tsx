import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, Calculator as CalcIcon, CircleAlert, Grid3x3, Pause, Play } from 'lucide-react';
import { getQuestion, groupOf, setById } from '../content';
import { getTest, testDifficulty, testMinutes } from '../content/tests';
import type { Question } from '../content/types';
import { Button, CreditFooter, Dialog, DifficultyTag, toast } from '../components/ui';
import { GroupBody } from '../components/test/Stimulus';
import { Calculator } from '../components/test/Calculator';
import { EXTENSION_SECONDS, mmss, mSS } from '../logic/cap';
import { isAnswered } from '../logic/scoring';
import { canLeaveSection, canOpenSection, canPause, nextSection, paletteState, PALETTE_LABEL, type PaletteState } from '../logic/testRules';
import { useApp } from '../state/store';
import { finishAttempt, saveAttempt, setIdsOf, startAttempt } from '../state/testEngine';
import type { ActiveAttempt, TestDef } from '../state/schema';
import '../styles/test.css';

const LEGEND: PaletteState[] = ['not-visited', 'not-answered', 'answered', 'marked', 'answered-marked'];
const PICK_SECONDS = 240;

function PalLetter({ state }: { state: PaletteState }) {
  return state === 'marked' || state === 'answered-marked' ? <i>M</i> : null;
}

// ---- Before the test ----

function SetOrderPick({ def, onStart }: { def: TestDef; onStart: (order: string[]) => void }) {
  const [order, setOrder] = useState(() => setIdsOf(def));
  const [left, setLeft] = useState(PICK_SECONDS);
  const orderRef = useRef(order);
  orderRef.current = order;
  useEffect(() => {
    const id = window.setInterval(() => setLeft((x) => x - 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    if (left <= 0) onStart(orderRef.current);
  }, [left, onStart]);
  const move = (i: number, d: number) => {
    const next = [...order];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    setOrder(next);
  };
  return (
    <div className="tw-pre">
      <div className="row-between">
        <h1 className="page-title">Pick your order</h1>
        <span className="tw-timer num" role="timer">
          {mmss(left)}
        </span>
      </div>
      <p className="muted">Skim each set, then put the one you would start with on top. The replay compares your order with the recommended one.</p>
      <ol className="tw-order">
        {order.map((id, i) => {
          const set = setById(id);
          return (
            <li key={id} className="card">
              <div className="grow">
                <b className="tw-order-title">
                  {i + 1}. {set?.title}
                </b>
                <p className="small muted">
                  {set?.questionIds.length} questions · {set?.topic}
                </p>
              </div>
              <button type="button" className="icon-btn" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move ${set?.title} up`}>
                <ArrowUp size={18} strokeWidth={1.5} aria-hidden />
              </button>
              <button type="button" className="icon-btn" disabled={i === order.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${set?.title} down`}>
                <ArrowDown size={18} strokeWidth={1.5} aria-hidden />
              </button>
            </li>
          );
        })}
      </ol>
      <Button variant="primary" onClick={() => onStart(order)}>
        Start with this order
      </Button>
    </div>
  );
}

function PreTest({ def, onStart }: { def: TestDef; onStart: (order: string[] | null) => void }) {
  const [picking, setPicking] = useState(false);
  const canPick = def.type === 'sectional' && def.capped;
  const count = def.sections.reduce((a, s) => a + s.questionIds.length, 0);
  if (picking) return <SetOrderPick def={def} onStart={onStart} />;
  return (
    <div className="tw-pre">
      <h1 className="page-title">{def.name}</h1>
      <div className="row">
        <span className="small muted">
          {count} questions · {testMinutes(def)} min
        </span>
        <DifficultyTag level={testDifficulty(def)} />
      </div>
      <ul className="tw-rules">
        <li>Correct answer: +3. Wrong MCQ: −1. Wrong type-in answer: 0. Skipped: 0.</li>
        {def.mode === 'exam' ? (
          <li>Sections run in the order {def.sections.map((s) => s.section).join(', ')}, 40 minutes each. A section ends only when its clock reaches zero, as in the exam.</li>
        ) : (
          <li>This is practice. You can pause, and you can finish early.</li>
        )}
        {def.capped && <li>Each set has a soft time cap. When you reach it, you decide whether to move on.</li>}
        <li>Every answer saves as you go. If you close this tab, you can resume from Home or Tests.</li>
      </ul>
      <div className="row">
        <Button variant="primary" onClick={() => onStart(null)}>
          Start test
        </Button>
        {canPick && <Button onClick={() => setPicking(true)}>Pick your order first? 4 min</Button>}
        <Button variant="ghost" to="/practice/tests">
          Back to tests
        </Button>
      </div>
      <CreditFooter compact />
    </div>
  );
}

// ---- During the test ----

function Keypad({ value, onChange, sequence }: { value: string; onChange: (v: string) => void; sequence: boolean }) {
  const keys = sequence ? ['1', '2', '3', '4', '5', '6', '⌫'] : ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.', '-', '⌫'];
  const press = (k: string) => {
    if (k === '⌫') onChange(value.slice(0, -1));
    else if (k === '-') onChange(value.startsWith('-') ? value.slice(1) : `-${value}`);
    else if (k === '.' && value.includes('.')) return;
    else onChange(value + k);
  };
  return (
    <div className="tw-tita">
      <label className="field">
        <span>Your answer</span>
        <input
          className="input num"
          value={value}
          inputMode={sequence ? 'numeric' : 'decimal'}
          autoComplete="off"
          onChange={(e) => onChange(e.target.value.replace(sequence ? /[^0-9]/g : /[^0-9.-]/g, ''))}
        />
      </label>
      <div className="tw-keys" role="group" aria-label="Number pad">
        {keys.map((k) => (
          <button type="button" key={k} onClick={() => press(k)} aria-label={k === '⌫' ? 'Delete last digit' : k === '-' ? 'Minus sign' : k === '.' ? 'Decimal point' : k}>
            {k === '-' ? '−' : k}
          </button>
        ))}
      </div>
    </div>
  );
}

function QuestionBody({ q, answer, onAnswer, number, total }: { q: Question; answer: string | null; onAnswer: (v: string | null) => void; number: number; total: number }) {
  return (
    <div className="tw-q">
      <div className="row-between">
        <h2 className="tw-qno">
          Question {number} of {total}
        </h2>
        <span className="small muted">{q.kind === 'mcq' ? 'Choose one · +3, −1' : 'Type your answer · +3, 0'}</span>
      </div>
      {q.paragraph && <p className="tw-para">{q.paragraph}</p>}
      {q.sentences && (
        <ol className="tw-sentences">
          {q.sentences.map((s, i) => (
            <li key={i}>
              <b className="num">{i + 1}.</b> {s}
            </li>
          ))}
        </ol>
      )}
      <p className="tw-prompt">{q.prompt}</p>
      {q.kind === 'mcq' ? (
        <fieldset className="tw-options">
          <legend className="sr-only">Options</legend>
          {q.options.map((o, i) => (
            <label key={i} className={`tw-opt${answer === String(i) ? ' on' : ''}`}>
              <input type="radio" name={q.id} checked={answer === String(i)} onChange={() => onAnswer(String(i))} />
              <span>{o}</span>
            </label>
          ))}
        </fieldset>
      ) : (
        <Keypad value={answer ?? ''} onChange={(v) => onAnswer(v === '' ? null : v)} sequence={!!q.sentences} />
      )}
    </div>
  );
}

type Phase = 'run' | 'cap' | 'extended-cap' | 'confirm' | 'paused';

function Runner({ initial }: { initial: ActiveAttempt }) {
  const nav = useNavigate();
  const ref = useRef(initial);
  const [, force] = useState(0);
  const [phase, setPhaseState] = useState<Phase>('run');
  const [calc, setCalc] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [pane, setPane] = useState<'stimulus' | 'question'>('question');
  const [announce, setAnnounce] = useState('');
  const phaseRef = useRef<Phase>('run');
  const done = useRef(false);
  const lastTick = useRef(Date.now());
  const sinceSave = useRef(0);

  const setPhase = useCallback((p: Phase) => {
    phaseRef.current = p;
    lastTick.current = Date.now();
    setPhaseState(p);
  }, []);

  const commit = useCallback((next: ActiveAttempt, save = true) => {
    ref.current = next;
    force((x) => x + 1);
    if (save) saveAttempt(next);
  }, []);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    const id = finishAttempt(ref.current);
    nav(`/test/${ref.current.def.id}/result?a=${id}`, { replace: true });
  }, [nav]);

  const a = ref.current;
  const section = a.def.sections[a.sectionIndex];
  const qid = section.questionIds[a.questionIndex];
  const q = getQuestion(qid);
  const group = groupOf(q);
  const st = a.states[qid];
  const left = a.secondsLeft[a.sectionIndex];
  const track = q.groupId ? a.sets[q.groupId] : undefined;

  const goTo = useCallback(
    (index: number, sectionIndex = ref.current.sectionIndex) => {
      const cur = ref.current;
      const id = cur.def.sections[sectionIndex].questionIds[index];
      commit({ ...cur, sectionIndex, questionIndex: index, states: { ...cur.states, [id]: { ...cur.states[id], visited: true } } });
      setSheet(false);
      setPane('question');
    },
    [commit],
  );

  const moveToNextSection = useCallback(() => {
    const cur = ref.current;
    const next = nextSection(cur.sectionIndex, cur.def.sections.length);
    if (next === null) return finish();
    toast(`${cur.def.sections[cur.sectionIndex].section} time is over. ${cur.def.sections[next].section} starts now.`);
    setAnnounce(`${cur.def.sections[next].section} section started.`);
    goTo(0, next);
  }, [finish, goTo]);

  // The clock. Real elapsed time, limited so a sleeping laptop does not burn the section.
  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      const dt = Math.min(5, (now - lastTick.current) / 1000);
      lastTick.current = now;
      if (phaseRef.current !== 'run' || done.current) return;
      const cur = ref.current;
      const sec = cur.sectionIndex;
      const curId = cur.def.sections[sec].questionIds[cur.questionIndex];
      const curGroup = getQuestion(curId).groupId;
      const secondsLeft = [...cur.secondsLeft];
      if (secondsLeft[sec] !== null) secondsLeft[sec] = Math.max(0, (secondsLeft[sec] as number) - dt);
      const secondsUsed = [...cur.secondsUsed];
      secondsUsed[sec] += dt;
      const states = { ...cur.states, [curId]: { ...cur.states[curId], seconds: cur.states[curId].seconds + dt } };
      let sets = cur.sets;
      let capped: Phase | null = null;
      if (curGroup && sets[curGroup] && !sets[curGroup].left) {
        const t = sets[curGroup];
        const seconds = t.seconds + dt;
        const limit = t.capSeconds + (t.extended ? EXTENSION_SECONDS : 0);
        const reached = seconds >= limit;
        sets = { ...sets, [curGroup]: { ...t, seconds: Math.min(seconds, limit), hitCap: t.hitCap || reached } };
        if (reached) capped = t.extended ? 'extended-cap' : 'cap';
      }
      sinceSave.current += dt;
      const save = sinceSave.current >= 5 || !!capped;
      if (save) sinceSave.current = 0;
      commit({ ...cur, secondsLeft, secondsUsed, states, sets }, save);
      const l = secondsLeft[sec];
      if (l !== null) {
        const whole = Math.ceil(l);
        if (whole === 300 || whole === 60) setAnnounce(`${whole / 60} minute${whole === 60 ? '' : 's'} left in this section.`);
        if (l <= 0) return moveToNextSection();
      }
      if (capped) setPhase(capped);
    }, 1000);
    return () => window.clearInterval(id);
  }, [commit, moveToNextSection, setPhase]);

  useEffect(() => {
    const save = () => {
      if (!done.current) saveAttempt(ref.current);
    };
    window.addEventListener('pagehide', save);
    return () => {
      window.removeEventListener('pagehide', save);
      save();
    };
  }, []);

  const setAnswer = (v: string | null) => commit({ ...a, states: { ...a.states, [qid]: { ...st, answer: v } } });

  const nextQuestion = () => {
    if (a.questionIndex + 1 < section.questionIds.length) goTo(a.questionIndex + 1);
    else {
      goTo(0);
      if (a.def.mode === 'exam') toast('That was the last question. Back to the first.');
    }
  };

  const saveNext = () => nextQuestion();

  const markNext = () => {
    const cur = ref.current;
    ref.current = { ...cur, states: { ...cur.states, [qid]: { ...cur.states[qid], marked: !cur.states[qid].marked } } };
    nextQuestion();
  };

  const leaveSet = () => {
    const cur = ref.current;
    const g = q.groupId as string;
    const sets = { ...cur.sets, [g]: { ...cur.sets[g], left: true } };
    ref.current = { ...cur, sets };
    const nextIdx = section.questionIds.findIndex((id) => {
      const other = getQuestion(id).groupId;
      return other !== g && !(other && sets[other]?.left) && !isAnswered(cur.states[id].answer);
    });
    setPhase('run');
    if (nextIdx >= 0) goTo(nextIdx);
    else {
      force((x) => x + 1);
      toast('No sets left to open. You can check your answers or submit.');
    }
  };

  const extend = () => {
    const cur = ref.current;
    const g = q.groupId as string;
    commit({ ...cur, sets: { ...cur.sets, [g]: { ...cur.sets[g], extended: true } } });
    setPhase('run');
  };

  const stall = (index: number) => {
    const g = q.groupId as string;
    const t = a.sets[g];
    commit({ ...a, sets: { ...a.sets, [g]: { ...t, stalledClue: t.stalledClue === index ? null : index } } });
  };

  const saveExit = () => {
    saveAttempt(ref.current);
    done.current = true;
    nav('/home');
  };

  const answeredCount = Object.values(a.states).filter((x) => isAnswered(x.answer)).length;
  const markedCount = Object.values(a.states).filter((x) => x.marked).length;
  const total = Object.keys(a.states).length;
  const isLast = nextSection(a.sectionIndex, a.def.sections.length) === null;
  const canSubmit = a.def.mode === 'practice' || isLast;
  const canLeave = canLeaveSection(a.def.mode, left ?? 1);
  const clueAction = track
    ? (index: number) => (
        <button type="button" className={`tw-clue${track.stalledClue === index ? ' on' : ''}`} aria-pressed={track.stalledClue === index} onClick={() => stall(index)}>
          I'm on this clue
        </button>
      )
    : undefined;

  const palette = (
    <>
      <h2 className="small muted">{section.section === 'QA' && section.name === 'Daily set' ? 'Questions' : `${section.section} questions`}</h2>
      <div className="tw-pal">
        {section.questionIds.map((id, i) => {
          const s = a.states[id];
          const state = paletteState({ visited: s.visited, marked: s.marked, answered: isAnswered(s.answer) });
          return (
            <button
              type="button"
              key={id}
              className={`pal pal-${state}${i === a.questionIndex ? ' pal-now' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Question ${i + 1}, ${PALETTE_LABEL[state]}`}
              aria-current={i === a.questionIndex ? 'true' : undefined}
            >
              {i + 1}
              <PalLetter state={state} />
            </button>
          );
        })}
      </div>
      <ul className="tw-legend">
        {LEGEND.map((s) => (
          <li key={s}>
            <span className={`pal pal-sm pal-${s}`} aria-hidden />
            {PALETTE_LABEL[s]}
          </li>
        ))}
      </ul>
      <div className="tw-side-actions">
        {canSubmit ? (
          <Button block onClick={() => setPhase('confirm')}>
            Submit test
          </Button>
        ) : (
          <p className="small muted num">Section ends in {mSS(left ?? 0)}</p>
        )}
        {!isLast && a.def.mode === 'exam' && (
          <Button block disabled={!canLeave}>
            Next section
          </Button>
        )}
        <Button block variant="ghost" onClick={saveExit}>
          Save and exit
        </Button>
      </div>
      <CreditFooter compact />
    </>
  );

  return (
    <div className="tw">
      <header className="tw-head">
        <div className="tw-title">
          <b>{a.def.name}</b>
          <span className="small muted">
            {a.def.sections.length > 1 ? `Section ${a.sectionIndex + 1} of ${a.def.sections.length}: ` : ''}
            {section.name}
          </span>
        </div>
        {a.def.sections.length > 1 && (
          <ol className="tw-sections" aria-label="Sections">
            {a.def.sections.map((s, i) => (
              <li key={s.section} className={i === a.sectionIndex ? 'now' : ''} aria-current={i === a.sectionIndex ? 'step' : undefined}>
                {s.section}
                {!canOpenSection(a.def.mode, a.sectionIndex, i) && <span className="sr-only"> (locked)</span>}
              </li>
            ))}
          </ol>
        )}
        <div className="tw-head-actions">
          <button type="button" className="btn btn-secondary tw-only-mobile" onClick={() => setSheet(true)}>
            <Grid3x3 size={18} strokeWidth={1.5} aria-hidden />
            <span className="sr-only">Open question palette</span>
          </button>
          {q.section === 'QA' && (
            <Button icon={CalcIcon} onClick={() => setCalc((c) => !c)} aria-pressed={calc}>
              <span className="tw-hide-mobile">Calculator</span>
              <span className="sr-only tw-only-mobile">Calculator</span>
            </Button>
          )}
          {canPause(a.def.mode) && (
            <Button icon={Pause} onClick={() => setPhase('paused')}>
              <span className="tw-hide-mobile">Pause</span>
              <span className="sr-only tw-only-mobile">Pause</span>
            </Button>
          )}
          <span className={`tw-timer num${left !== null && left < 300 ? ' warn' : ''}`} role="timer" aria-label={left === null ? 'No time limit' : `Time left ${mSS(left)}`}>
            {left === null ? mSS(a.secondsUsed[a.sectionIndex]) : mmss(left)}
          </span>
        </div>
      </header>
      <p className="sr-only" role="status" aria-live="polite">
        {announce}
      </p>

      <div className="tw-body">
        <div className={`tw-main${group ? ' tw-split' : ''}`}>
          {group && (
            <div className="tw-switch tw-only-mobile" role="group" aria-label="Show">
              <button type="button" aria-pressed={pane === 'stimulus'} onClick={() => setPane('stimulus')}>
                {group.kind === 'passage' ? 'Passage' : 'Set'}
              </button>
              <button type="button" aria-pressed={pane === 'question'} onClick={() => setPane('question')}>
                Question
              </button>
            </div>
          )}
          {group && (
            <section className={`tw-stim${pane === 'stimulus' ? ' show' : ''}`} tabIndex={0} aria-label={group.kind === 'passage' ? 'Passage' : 'Set details'}>
              <GroupBody group={group} clueAction={clueAction} />
            </section>
          )}
          <section className={`tw-qcol${pane === 'question' || !group ? ' show' : ''}`} aria-label="Question">
            {track && (
              <p className="tw-cap small num">
                Set time {mSS(track.seconds)} of {mSS(track.capSeconds + (track.extended ? EXTENSION_SECONDS : 0))} cap
                {track.left ? ' · you left this set' : ''}
              </p>
            )}
            <QuestionBody key={qid} q={q} answer={st.answer} onAnswer={setAnswer} number={a.questionIndex + 1} total={section.questionIds.length} />
          </section>
        </div>
        <aside className="tw-side" aria-label="Question palette">
          {palette}
        </aside>
      </div>

      <footer className="tw-foot">
        <Button onClick={markNext}>Mark for review & next</Button>
        <Button onClick={() => setAnswer(null)}>Clear response</Button>
        <Button variant="primary" onClick={saveNext} className="tw-save">
          Save & next
        </Button>
      </footer>

      {calc && <Calculator onClose={() => setCalc(false)} />}

      {sheet && (
        <div className="tw-sheet" role="dialog" aria-modal="true" aria-label="Question palette">
          <div className="tw-sheet-body">
            {palette}
            <Button block onClick={() => setSheet(false)}>
              Close
            </Button>
          </div>
        </div>
      )}

      {(phase === 'cap' || phase === 'extended-cap') && track && (
        <Dialog
          title={phase === 'cap' ? 'Time to decide' : 'Your extra time is used'}
          actions={
            <>
              {phase === 'cap' && <Button onClick={extend}>Take 2 more minutes (once)</Button>}
              <Button variant="primary" onClick={leaveSet}>
                Leave this set
              </Button>
            </>
          }
        >
          <p>
            You've reached your cap for this set ({mSS(track.capSeconds + (track.extended ? EXTENSION_SECONDS : 0))}). In the exam, this is where a set starts costing you other marks.
          </p>
        </Dialog>
      )}

      {phase === 'confirm' && (
        <Dialog
          title="Submit this test?"
          onClose={() => setPhase('run')}
          actions={
            <>
              <Button onClick={() => setPhase('run')}>Keep working</Button>
              <Button variant="primary" onClick={finish}>
                Submit
              </Button>
            </>
          }
        >
          <ul className="tw-counts">
            <li>
              <b className="num">{answeredCount}</b> answered
            </li>
            <li>
              <b className="num">{total - answeredCount}</b> not answered
            </li>
            <li>
              <b className="num">{markedCount}</b> marked for review
            </li>
          </ul>
        </Dialog>
      )}

      {phase === 'paused' && (
        <Dialog
          title="Paused"
          actions={
            <>
              <Button onClick={saveExit}>Save and exit</Button>
              <Button variant="primary" icon={Play} onClick={() => setPhase('run')}>
                Resume
              </Button>
            </>
          }
        >
          <p>The clock has stopped. Your answers are saved.</p>
        </Dialog>
      )}
    </div>
  );
}

function Locked() {
  return (
    <div className="tw-pre">
      <CircleAlert size={32} strokeWidth={1.5} aria-hidden />
      <h1 className="page-title">Full mock 2 opens after Mock 1</h1>
      <p className="muted">Finish Full mock 1 first, or open this one early with 100 coins in Rewards.</p>
      <div className="row">
        <Button variant="primary" to="/test/mock-1">
          Go to Full mock 1
        </Button>
        <Button to="/rewards">Rewards</Button>
      </div>
      <CreditFooter compact />
    </div>
  );
}

function TestScreen({ testId }: { testId: string }) {
  const s = useApp();
  const stored = s.active[testId];
  const [attempt, setAttempt] = useState<ActiveAttempt | null>(stored ?? null);
  const def = stored?.def ?? getTest(testId);

  if (attempt) return <Runner key={attempt.id} initial={attempt} />;
  if (!s.profile?.onboarded) {
    return (
      <div className="tw-pre">
        <h1 className="page-title">Set up Pace first</h1>
        <p className="muted">It takes under a minute, and your test results will have somewhere to go.</p>
        <Link to="/start" className="btn btn-primary">
          Start preparing
        </Link>
        <CreditFooter compact />
      </div>
    );
  }
  if (!def) {
    return (
      <div className="tw-pre">
        <h1 className="page-title">That test isn't here</h1>
        <p className="muted">It may have been finished already, or the link is out of date.</p>
        <Link to="/practice/tests" className="btn btn-primary">
          See all tests
        </Link>
        <CreditFooter compact />
      </div>
    );
  }
  const mock1Done = s.attempts.some((x) => x.testId === 'mock-1');
  if (def.id === 'mock-2' && !mock1Done && !s.purchases.mockUnlocked) return <Locked />;
  return <PreTest def={def} onStart={(order) => setAttempt(startAttempt(def, order))} />;
}

/** Keyed by test id, so moving between tests never carries the previous attempt across. */
export default function TestWindow() {
  const { testId = '' } = useParams();
  return <TestScreen key={testId} testId={testId} />;
}
