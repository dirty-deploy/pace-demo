import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
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

const CARD_WIDTH = 320;

function WordCard({ hit, onClose, anchor, cardRef }: { hit: VocabHit; onClose: () => void; anchor: DOMRect; cardRef: RefObject<HTMLDivElement | null> }) {
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
    <div className="vw-card" ref={cardRef} role="dialog" aria-label={`Meaning of ${word.word}`} style={placeCard(anchor)}>
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
    </div>
  );
}

/** Keeps the card on screen, on whichever side of the word has more room. Mobile CSS overrides this. */
function placeCard(a: DOMRect) {
  const left = Math.max(8, Math.min(a.left, window.innerWidth - CARD_WIDTH - 8));
  const roomBelow = window.innerHeight - a.bottom - 14;
  const roomAbove = a.top - 14;
  if (roomBelow >= 300 || roomBelow >= roomAbove) return { left, top: a.bottom + 6, maxHeight: roomBelow };
  return { left, bottom: window.innerHeight - a.top + 6, maxHeight: roomAbove };
}

function Word({ text, surface, index }: { text: string; surface: string; index: number }) {
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const open = anchor !== null;
  useEffect(() => {
    if (!open) return;
    const close = () => setAnchor(null);
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!card.current?.contains(t) && !button.current?.contains(t)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        button.current?.focus();
      }
    };
    // The card is fixed to the screen, so it follows its word and closes once the word has gone.
    const onScroll = (e: Event) => {
      if (card.current?.contains(e.target as Node)) return;
      const rect = button.current?.getBoundingClientRect();
      if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) close();
      else setAnchor(rect);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);
  const hit = open ? hitFor(text, surface, index) : null;
  return (
    <>
      <button
        type="button"
        className="vw-btn"
        ref={button}
        aria-expanded={open}
        onClick={(e) => setAnchor(open ? null : e.currentTarget.getBoundingClientRect())}
      >
        {surface}
      </button>
      {hit && anchor && createPortal(<WordCard hit={hit} anchor={anchor} cardRef={card} onClose={() => setAnchor(null)} />, document.body)}
    </>
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
