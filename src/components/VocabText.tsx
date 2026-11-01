import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { VOCAB, vocabByWord } from '../content';
import type { VocabWord } from '../content/types';
import { newWordState } from '../logic/vocabSpacing';
import { todayISO } from '../state/actions';
import { update, useApp } from '../state/store';
import { Button, toast } from './ui';

/** Surface form in lower case → base word. */
const FORM_TO_WORD = new Map<string, string>();
for (const w of VOCAB) {
  FORM_TO_WORD.set(w.word, w.word);
  for (const f of Object.keys(w.forms ?? {})) FORM_TO_WORD.set(f.toLowerCase(), w.word);
}

const PATTERN = new RegExp(`\\b(${[...FORM_TO_WORD.keys()].sort((a, b) => b.length - a.length).join('|')})\\b`, 'gi');

export type VocabHit = { word: VocabWord; surface: string; sentence: string; swapped: string };

function sentenceAround(text: string, index: number): string {
  const before = text.slice(0, index);
  const start = Math.max(before.lastIndexOf('. '), before.lastIndexOf('? '), before.lastIndexOf('! '));
  const rest = text.slice(index).search(/[.?!](\s|$)/);
  return text.slice(start < 0 ? 0 : start + 2, rest < 0 ? text.length : index + rest + 1).trim();
}

function matchCase(source: string, target: string) {
  return source[0] === source[0].toUpperCase() ? target[0].toUpperCase() + target.slice(1) : target;
}

export function hitFor(text: string, surface: string, index: number): VocabHit | null {
  const base = FORM_TO_WORD.get(surface.toLowerCase());
  const word = base ? vocabByWord.get(base) : undefined;
  if (!word) return null;
  const sentence = sentenceAround(text, index);
  const simple = word.forms?.[surface.toLowerCase()] ?? word.simple;
  const swapped = sentence.replace(new RegExp(`\\b${surface}\\b`), matchCase(surface, simple));
  return { word, surface, sentence, swapped };
}

function WordCard({ hit, onClose, right }: { hit: VocabHit; onClose: () => void; right: boolean }) {
  const { word } = hit;
  const added = useApp((s) => !!s.vocab[word.word]?.added);
  const add = () => {
    update((s) => ({
      ...s,
      vocab: { ...s.vocab, [word.word]: { ...(s.vocab[word.word] ?? newWordState()), added: true, dueISO: s.vocab[word.word]?.dueISO ?? todayISO() } },
    }));
    toast(`Added "${word.word}" to My words`);
  };
  return (
    <span className={`vw-card${right ? ' right' : ''}`} role="dialog" aria-label={`Meaning of ${word.word}`}>
      <span className="row-between">
        <span>
          <b className="vw-word">{word.word}</b> <span className="muted">→ {word.simple}</span>
        </span>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
          <X size={16} strokeWidth={1.5} aria-hidden />
        </button>
      </span>
      <span className="vw-line">{word.meaning}</span>
      <span className="vw-label">With the simpler word</span>
      <span className="vw-line">{hit.swapped}</span>
      <span className="vw-label">Another example</span>
      <span className="vw-line">{word.example}</span>
      {added ? (
        <span className="vw-added small">
          <Check size={14} strokeWidth={2} aria-hidden /> In <Link to="/learn/vocab">My words</Link>
        </span>
      ) : (
        <Button onClick={add}>Add to my words</Button>
      )}
    </span>
  );
}

function Word({ text, surface, index }: { text: string; surface: string; index: number }) {
  const [open, setOpen] = useState(false);
  const [right, setRight] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  const hit = open ? hitFor(text, surface, index) : null;
  return (
    <span className="vw" ref={ref}>
      <button
        type="button"
        className="vw-btn"
        aria-expanded={open}
        onClick={() => {
          const r = ref.current?.getBoundingClientRect();
          setRight(!!r && r.left > window.innerWidth / 2);
          setOpen((o) => !o);
        }}
      >
        {surface}
      </button>
      {hit && <WordCard hit={hit} right={right} onClose={() => setOpen(false)} />}
    </span>
  );
}

/** Text with vocabulary words dotted-underlined. Click one for its word card. */
export function VocabText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(PATTERN)) {
    const i = m.index;
    if (i > last) parts.push(text.slice(last, i));
    parts.push(<Word key={i} text={text} surface={m[0]} index={i} />);
    last = i + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
