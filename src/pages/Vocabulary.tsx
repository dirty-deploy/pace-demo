import { useEffect, useMemo, useRef, useState } from 'react';
import { BookMarked, CalendarCheck, Check, X } from 'lucide-react';
import { Button, Empty, Progress, Tabs, Tag } from '../components/ui';
import type { VocabWord } from '../content/types';
import { VOCAB } from '../content/vocab';
import { VOCAB_PRACTICE } from '../content/vocabPractice';
import { parseISO, shortDate } from '../logic/dates';
import { MASTERED_LEVEL, newWordState, reviewWord, todaysWords, type WordState } from '../logic/vocabSpacing';
import { logActivity, todayISO } from '../state/actions';
import { update, useApp } from '../state/store';
import '../styles/vocab.css';

type Tab = 'today' | 'words' | 'practice';
type Format = 'simpler' | 'usage' | 'blank';
type Question = { word: VocabWord; format: Format; sentence: string | null; options: string[]; answer: number };
type Run = { questions: Question[]; index: number; picked: number | null; correct: number; answered: number; done: boolean };

const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'words', label: 'My words' },
  { id: 'practice', label: 'Practice' },
];
const FORMATS: Format[] = ['simpler', 'usage', 'blank'];
const LETTERS = ['A', 'B', 'C', 'D'];
const DAILY_WORDS = 8;
const MAX_DAILY_WORDS = 10;
const RUN_LENGTH = 6;

const WORD_LIST = VOCAB.map((w) => w.word);
const BY_WORD = new Map(VOCAB.map((w) => [w.word, w]));
const PRACTICE = new Map(VOCAB_PRACTICE.map((p) => [p.word, p]));

/** Words still to do today. A word added today can come back from todaysWords twice, so this drops repeats. */
function pendingWords(vocab: Record<string, WordState>, iso: string): string[] {
  return [...new Set(todaysWords(WORD_LIST, vocab, iso, MAX_DAILY_WORDS))];
}

/** Moves the options around, so the place of an answer can't be remembered from an earlier round. */
function shuffled(options: string[], answer: number) {
  const order = options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { options: order.map((i) => options[i]), answer: order.indexOf(answer) };
}

/** One question per word, so a single round can't move a word up twice. Formats take turns. */
function buildQuestions(words: string[]): Question[] {
  const offset = Math.floor(Math.random() * FORMATS.length);
  const usable = words.filter((w) => BY_WORD.has(w) && PRACTICE.has(w)).slice(0, RUN_LENGTH);
  return usable.map((w, i) => {
    const word = BY_WORD.get(w) as VocabWord;
    const data = PRACTICE.get(w)!;
    const format = FORMATS[(i + offset) % FORMATS.length];
    if (format === 'usage') return { word, format, sentence: null, ...shuffled(data.usage.sentences, data.usage.answerIndex) };
    const item = format === 'simpler' ? data.simpler : data.blank;
    return { word, format, sentence: item.sentence, ...shuffled(item.options, item.answerIndex) };
  });
}

/** Finds the word in a sentence, including its inflected forms. */
function splitAtWord(sentence: string, word: VocabWord): [string, string, string] | null {
  const surfaces = [word.word, ...Object.keys(word.forms ?? {})].sort((a, b) => b.length - a.length);
  const stem = word.word.slice(0, Math.max(4, word.word.length - 2));
  const found = new RegExp(`\\b(?:${surfaces.join('|')})\\b`, 'i').exec(sentence) ?? new RegExp(`\\b${stem}\\w*`, 'i').exec(sentence);
  return found ? [sentence.slice(0, found.index), found[0], sentence.slice(found.index + found[0].length)] : null;
}

function nextDate(state: WordState | undefined, iso: string): string | null {
  if (!state?.dueISO) return null;
  return state.dueISO <= iso ? 'Due today' : `Back on ${shortDate(parseISO(state.dueISO))}`;
}

function Mastery({ state }: { state: WordState | undefined }) {
  if (!state || state.seen === 0) {
    return (
      <Tag>
        <i className="voc-dot-new" aria-hidden />
        New
      </Tag>
    );
  }
  const known = state.level >= MASTERED_LEVEL;
  return (
    <Tag tone={known ? 'ok' : 'primary'}>
      <i className="dot" aria-hidden />
      {known ? 'Known' : 'Learning'}
    </Tag>
  );
}

function WordCard({ word, state, iso, done }: { word: VocabWord; state: WordState | undefined; iso: string; done?: boolean }) {
  const next = nextDate(state, iso);
  return (
    <li className="card voc-word">
      <div className="row-between">
        <h2 className="card-title">{word.word}</h2>
        <div className="row">
          {done && (
            <span className="small muted voc-done">
              <Check size={14} strokeWidth={1.5} aria-hidden />
              Practised today
            </span>
          )}
          <Mastery state={state} />
        </div>
      </div>
      <p>
        <span className="muted">Simpler word:</span> {word.simple}
      </p>
      <p>{word.meaning}</p>
      <p className="muted voc-example">{word.example}</p>
      {next && <p className="small muted num">{next}</p>}
    </li>
  );
}

function TodayTab({ run, onPractise }: { run: Run | null; onPractise: () => void }) {
  const vocab = useApp((s) => s.vocab);
  const iso = todayISO();
  const practised = useMemo(() => WORD_LIST.filter((w) => vocab[w]?.lastISO === iso), [vocab, iso]);
  const pending = useMemo(() => pendingWords(vocab, iso), [vocab, iso]);
  // Words practised today stay on the list, so it doesn't refill with new ones after a round.
  const shown = [...practised, ...pending].slice(0, Math.min(MAX_DAILY_WORDS, Math.max(DAILY_WORDS, practised.length)));

  if (!shown.length) {
    return <Empty icon={CalendarCheck} text="Nothing is due today. Your words come back on their dates." />;
  }

  return (
    <div className="stack">
      <div className="row-between">
        <p className="muted voc-rule">A word comes back after 1, 3, 7 and then 14 days. A miss brings it back tomorrow.</p>
        {(run || pending.length > 0) && (
          <Button variant="primary" onClick={onPractise}>
            {!run ? 'Practise these words' : run.done ? 'See my score' : 'Continue practice'}
          </Button>
        )}
      </div>
      <ul className="voc-list">
        {shown.map((w) => {
          const word = BY_WORD.get(w);
          return word ? <WordCard key={w} word={word} state={vocab[w]} iso={iso} done={practised.includes(w)} /> : null;
        })}
      </ul>
    </div>
  );
}

function MyWordsTab() {
  const vocab = useApp((s) => s.vocab);
  const iso = todayISO();
  const words = VOCAB.filter((w) => vocab[w.word]?.added);
  if (!words.length) {
    return (
      <Empty
        icon={BookMarked}
        text="Your words come from reviewed passages. Open a passage in Review, press an underlined word and add it."
        action={
          <Button variant="primary" to="/progress/review">
            Go to Review
          </Button>
        }
      />
    );
  }
  return (
    <ul className="voc-list">
      {words.map((w) => (
        <WordCard key={w.word} word={w} state={vocab[w.word]} iso={iso} />
      ))}
    </ul>
  );
}

function PracticeIntro({ count, doneToday, onStart, onSeeWords }: { count: number; doneToday: boolean; onStart: () => void; onSeeWords: () => void }) {
  if (!count) {
    return <Empty icon={CalendarCheck} text="No words are waiting for practice. They come back on their dates." action={<Button onClick={onSeeWords}>See my words</Button>} />;
  }
  return (
    <div className="card voc-run stack">
      <h2 className="section-title">
        {count} short {count === 1 ? 'question' : 'questions'} on today's words
      </h2>
      <ul className="voc-formats">
        <li>Pick the simpler word for an underlined word.</li>
        <li>Pick the sentence that uses a word correctly.</li>
        <li>Fill a blank with one of four words.</li>
      </ul>
      {doneToday && <p className="muted">You finished a round today. Another round moves on to the next words.</p>}
      <div>
        <Button variant="primary" onClick={onStart}>
          Start practice
        </Button>
      </div>
    </div>
  );
}

function Blank({ sentence }: { sentence: string }) {
  const parts = sentence.split(/_{2,}/);
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <>
              <span className="voc-blank" aria-hidden>
                ____
              </span>
              <span className="sr-only">blank</span>
            </>
          )}
        </span>
      ))}
    </>
  );
}

function Underlined({ question }: { question: Question }) {
  const sentence = question.sentence ?? '';
  const parts = splitAtWord(sentence, question.word);
  if (!parts) return <>{sentence}</>;
  return (
    <>
      {parts[0]}
      <u className="voc-target">{parts[1]}</u>
      {parts[2]}
      <span className="sr-only"> The underlined word is {parts[1]}.</span>
    </>
  );
}

function promptFor(q: Question): string {
  if (q.format === 'simpler') return 'Pick the simpler word for the underlined word.';
  if (q.format === 'usage') return `Pick the sentence that uses "${q.word.word}" correctly.`;
  return 'Pick the word that fills the blank.';
}

function QuestionView({ run, onPick, onNext, onEnd }: { run: Run; onPick: (i: number) => void; onNext: () => void; onEnd: () => void }) {
  const q = run.questions[run.index];
  const answered = run.picked !== null;
  const right = run.picked === q.answer;
  const last = run.index === run.questions.length - 1;
  const state = useApp((s) => s.vocab[q.word.word]);
  const headRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headRef.current?.focus();
  }, [run.index]);

  return (
    <div className="card voc-run stack">
      <div className="row-between">
        <span className="small muted num">
          Question {run.index + 1} of {run.questions.length}
        </span>
        <Button variant="ghost" onClick={onEnd}>
          End practice
        </Button>
      </div>
      <Progress value={(run.index + (answered ? 1 : 0)) / run.questions.length} label="Practice progress" />
      <h2 ref={headRef} tabIndex={-1} className="section-title voc-prompt">
        {promptFor(q)}
      </h2>
      {q.sentence && <p className="voc-sentence">{q.format === 'blank' ? <Blank sentence={q.sentence} /> : <Underlined question={q} />}</p>}
      <div className="voc-options" role="group" aria-label="Answer choices">
        {q.options.map((option, i) => {
          const isAnswer = answered && i === q.answer;
          const isWrongPick = answered && i === run.picked && !right;
          return (
            <button key={option} type="button" className={`voc-option${isAnswer ? ' is-right' : ''}${isWrongPick ? ' is-wrong' : ''}`} disabled={answered} onClick={() => onPick(i)}>
              <span className="voc-letter" aria-hidden>
                {LETTERS[i]}
              </span>
              <span className="grow">{option}</span>
              {isAnswer && (
                <span className="voc-mark">
                  <Check size={16} strokeWidth={1.5} aria-hidden />
                  {right ? 'Your answer, correct' : 'Correct answer'}
                </span>
              )}
              {isWrongPick && (
                <span className="voc-mark">
                  <X size={16} strokeWidth={1.5} aria-hidden />
                  Your answer
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div role="status">
        {answered && (
          <div className="voc-feedback">
            <p className="voc-verdict">{right ? 'Correct.' : 'Not this one.'}</p>
            <p>
              <b>{q.word.word}</b> ({q.word.simple}): {q.word.meaning}.
            </p>
            {nextDate(state, todayISO()) && <p className="small muted num">{nextDate(state, todayISO())}</p>}
          </div>
        )}
      </div>
      {answered && (
        <div>
          <Button variant="primary" autoFocus onClick={onNext}>
            {last ? 'See my score' : 'Next'}
          </Button>
        </div>
      )}
    </div>
  );
}

function FinishView({ run, onBack }: { run: Run; onBack: () => void }) {
  const headRef = useRef<HTMLHeadingElement>(null);
  const missed = run.answered - run.correct;
  useEffect(() => {
    headRef.current?.focus();
  }, []);
  return (
    <div className="card voc-run stack">
      <h2 ref={headRef} tabIndex={-1} className="section-title voc-prompt num">
        You got {run.correct} of {run.answered} right.
      </h2>
      <p className="muted">{missed ? `${missed} missed ${missed === 1 ? 'word comes' : 'words come'} back tomorrow. The rest come back on their dates.` : 'Each word comes back on its next date.'}</p>
      <div>
        <Button variant="primary" onClick={onBack}>
          Back to today's words
        </Button>
      </div>
    </div>
  );
}

export default function Vocabulary() {
  const vocab = useApp((s) => s.vocab);
  const doneToday = useApp((s) => s.vocabDays.includes(todayISO()));
  const [tab, setTab] = useState<Tab>('today');
  const [run, setRun] = useState<Run | null>(null);
  const pool = useMemo(() => pendingWords(vocab, todayISO()).filter((w) => BY_WORD.has(w) && PRACTICE.has(w)), [vocab]);

  const start = () => {
    const questions = buildQuestions(pool);
    if (questions.length) setRun({ questions, index: 0, picked: null, correct: 0, answered: 0, done: false });
    setTab('practice');
  };

  const pick = (i: number) => {
    if (!run || run.picked !== null) return;
    const q = run.questions[run.index];
    const right = i === q.answer;
    update((s) => ({ ...s, vocab: { ...s.vocab, [q.word.word]: reviewWord(s.vocab[q.word.word] ?? newWordState(), right, todayISO()) } }));
    setRun({ ...run, picked: i, correct: run.correct + (right ? 1 : 0), answered: run.answered + 1 });
  };

  const finish = (r: Run) => {
    if (!r.answered) {
      setRun(null);
      return;
    }
    const iso = todayISO();
    update((s) => (s.vocabDays.includes(iso) ? s : { ...s, vocabDays: [...s.vocabDays, iso] }));
    logActivity({ questions: r.answered });
    setRun({ ...r, done: true });
  };

  const next = () => {
    if (!run) return;
    if (run.index === run.questions.length - 1) finish(run);
    else setRun({ ...run, index: run.index + 1, picked: null });
  };

  return (
    <div className="stack">
      <Tabs tabs={TABS} value={tab} onChange={setTab} label="Vocabulary" />
      <div role="tabpanel" aria-label={TABS.find((t) => t.id === tab)?.label}>
        {tab === 'today' && <TodayTab run={run} onPractise={run ? () => setTab('practice') : start} />}
        {tab === 'words' && <MyWordsTab />}
        {tab === 'practice' &&
          (!run ? (
            <PracticeIntro count={Math.min(RUN_LENGTH, pool.length)} doneToday={doneToday} onStart={start} onSeeWords={() => setTab('words')} />
          ) : run.done ? (
            <FinishView
              run={run}
              onBack={() => {
                setRun(null);
                setTab('today');
              }}
            />
          ) : (
            <QuestionView run={run} onPick={pick} onNext={next} onEnd={() => finish(run)} />
          ))}
      </div>
    </div>
  );
}
