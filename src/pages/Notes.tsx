import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BookmarkPlus, Check, Highlighter, NotebookPen, Pencil, Plus, SearchX, ThumbsUp, Trash2, X } from 'lucide-react';
import { usePageTitle } from '../components/Shell';
import { Button, Chip, Dialog, Empty, SampleTag, Tabs, Tag, toast } from '../components/ui';
import { ALUM_NOTES, type AlumNote, type NoteSection } from '../content/notes';
import { DILR_TOPICS, QA_TOPICS, VARC_TOPICS } from '../content/types';
import { addNote, removeNote, updateNote } from '../state/actions';
import { update, useApp } from '../state/store';
import type { Note } from '../state/schema';
import '../styles/notes.css';

type Tab = 'alum' | 'mine';
type Filters = { section: NoteSection | 'all'; topic: string; query: string };

const NO_FILTERS: Filters = { section: 'all', topic: 'all', query: '' };
const SECTIONS: (NoteSection | 'all')[] = ['all', 'VARC', 'DILR', 'QA', 'Strategy'];
const TABS: { id: Tab; label: string }[] = [
  { id: 'alum', label: 'Alum notes' },
  { id: 'mine', label: 'My notes' },
];
const ALUM_TAG = 'Alum note';
const NOTE_TOPICS = ['General', 'Strategy', ...VARC_TOPICS, ...DILR_TOPICS, ...QA_TOPICS];

const noteLinkId = (id: string) => `note-link-${id}`;
const matches = (haystack: string[], query: string) => haystack.join(' ').toLowerCase().includes(query.trim().toLowerCase());

// ---- Upvotes and highlights ----

function toggleNoteUpvote(id: string) {
  update((s) => {
    const noteUpvotes = { ...s.noteUpvotes };
    if (noteUpvotes[id]) delete noteUpvotes[id];
    else noteUpvotes[id] = true;
    return { ...s, noteUpvotes };
  });
}

function addHighlights(id: string, texts: string[]) {
  update((s) => {
    const current = s.noteHighlights[id] ?? [];
    return { ...s, noteHighlights: { ...s.noteHighlights, [id]: [...current, ...texts.filter((t) => !current.includes(t))] } };
  });
}

function removeHighlight(id: string, text: string) {
  update((s) => ({ ...s, noteHighlights: { ...s.noteHighlights, [id]: (s.noteHighlights[id] ?? []).filter((t) => t !== text) } }));
}

/** The selected text, one piece per paragraph, so a selection across paragraphs still matches later. */
function selectedPieces(body: HTMLElement): string[] {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || !selection.rangeCount) return [];
  const range = selection.getRangeAt(0);
  const pieces: string[] = [];
  body.querySelectorAll('p').forEach((p) => {
    if (!range.intersectsNode(p)) return;
    const part = document.createRange();
    part.selectNodeContents(p);
    if (range.compareBoundaryPoints(Range.START_TO_START, part) > 0) part.setStart(range.startContainer, range.startOffset);
    if (range.compareBoundaryPoints(Range.END_TO_END, part) < 0) part.setEnd(range.endContainer, range.endOffset);
    const text = part.toString().trim();
    if (text) pieces.push(text);
  });
  return pieces;
}

/** Splits a paragraph into plain and highlighted runs, merging any that overlap. */
function highlightRuns(text: string, highlights: string[]): { text: string; marked: boolean }[] {
  const spans: [number, number][] = [];
  for (const h of highlights) {
    if (!h) continue;
    for (let i = text.indexOf(h); i >= 0; i = text.indexOf(h, i + h.length)) spans.push([i, i + h.length]);
  }
  spans.sort((a, b) => a[0] - b[0]);
  const runs: { text: string; marked: boolean }[] = [];
  let at = 0;
  for (const [start, end] of spans) {
    if (end <= at) continue;
    const from = Math.max(start, at);
    if (from > at) runs.push({ text: text.slice(at, from), marked: false });
    runs.push({ text: text.slice(from, end), marked: true });
    at = end;
  }
  if (at < text.length) runs.push({ text: text.slice(at), marked: false });
  return runs;
}

// ---- Shared pieces ----

function AuthorLine({ label }: { label: string }) {
  return (
    <div className="note-author">
      <span className="small muted">{label}</span>
      <SampleTag />
    </div>
  );
}

function UpvoteChip({ note }: { note: AlumNote }) {
  const on = useApp((s) => !!s.noteUpvotes[note.id]);
  const count = note.upvotes + (on ? 1 : 0);
  return (
    <Chip selected={on} onClick={() => toggleNoteUpvote(note.id)} aria-label={`Upvote ${note.title}, ${count} upvotes`}>
      {!on && <ThumbsUp size={14} strokeWidth={1.5} aria-hidden />}
      <span className="num">{count}</span>
    </Chip>
  );
}

// ---- Reading a note ----

function NoteReader({ note }: { note: AlumNote }) {
  usePageTitle(note.title);
  const highlights = useApp((s) => s.noteHighlights[note.id]) ?? [];
  const saved = useApp((s) => s.notes.some((n) => n.source === note.title && n.tags.includes(ALUM_TAG)));
  const articleRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const pending = useRef<string[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    articleRef.current?.focus({ preventScroll: true });
  }, [note.id]);

  // Some touch browsers clear the selection when the button is tapped, so read it on the way down.
  const capture = () => {
    pending.current = bodyRef.current ? selectedPieces(bodyRef.current) : [];
  };

  const highlight = () => {
    const pieces = pending.current.length ? pending.current : bodyRef.current ? selectedPieces(bodyRef.current) : [];
    pending.current = [];
    if (!pieces.length) {
      toast('Select some text in the note first');
      return;
    }
    addHighlights(note.id, pieces);
    window.getSelection()?.removeAllRanges();
    toast('Highlight saved');
  };

  const save = () => {
    addNote({ title: note.title, text: note.body.join('\n\n'), tags: [ALUM_TAG], topic: note.topic, source: note.title });
    toast('Saved to My notes');
  };

  return (
    <article ref={articleRef} tabIndex={-1} className="note-article fade-in" aria-label={note.title}>
      <div>
        <Link to="/learn/notes" className="btn btn-ghost note-back">
          <ArrowLeft size={18} strokeWidth={1.5} aria-hidden />
          Back to alum notes
        </Link>
      </div>
      <div className="row">
        <Tag>{note.section}</Tag>
        <Tag tone="primary">{note.topic}</Tag>
        <span className="small muted num">{note.readingMinutes} min read</span>
      </div>
      <div className="note-byline">
        <AuthorLine label={note.authorLabel} />
        <UpvoteChip note={note} />
      </div>
      <div className="note-tools">
        <div className="row">
          <Button icon={Highlighter} onPointerDown={capture} onClick={highlight}>
            Highlight
          </Button>
          {saved ? (
            <Button icon={Check} to="/learn/notes?tab=mine">
              In my notes
            </Button>
          ) : (
            <Button variant="primary" icon={BookmarkPlus} onClick={save}>
              Save to my notes
            </Button>
          )}
        </div>
        <p className="small muted">Select text in the note, then press Highlight.</p>
      </div>
      <div ref={bodyRef} className="reading note-body">
        {note.body.map((para, i) => (
          <div className="note-para" key={i}>
            <p>{highlightRuns(para, highlights).map((run, j) => (run.marked ? <mark key={j}>{run.text}</mark> : <span key={j}>{run.text}</span>))}</p>
            <Button variant="ghost" className="note-para-hl" onClick={() => addHighlights(note.id, [para])}>
              Highlight this paragraph
            </Button>
          </div>
        ))}
      </div>
      {highlights.length > 0 && (
        <section className="card note-highlights" aria-label="Your highlights">
          <h2 className="section-title">Your highlights</h2>
          <ul className="stack">
            {highlights.map((h) => (
              <li key={h} className="note-highlight">
                <p className="grow">{h}</p>
                <Button variant="ghost" icon={X} onClick={() => removeHighlight(note.id, h)} aria-label={`Remove highlight: ${h.slice(0, 60)}`}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

// ---- Alum notes list ----

function AlumList({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const { section, topic, query } = filters;
  const topics = useMemo(() => [...new Set(ALUM_NOTES.filter((n) => section === 'all' || n.section === section).map((n) => n.topic))], [section]);
  const rows = useMemo(
    () =>
      ALUM_NOTES.filter(
        (n) => (section === 'all' || n.section === section) && (topic === 'all' || n.topic === topic) && matches([n.title, n.topic, n.section, n.authorLabel, ...n.body], query),
      ),
    [section, topic, query],
  );

  return (
    <div className="stack">
      <div className="chips" role="group" aria-label="Filter by section">
        {SECTIONS.map((s) => (
          <Chip key={s} selected={section === s} onClick={() => onChange({ ...filters, section: s, topic: 'all' })}>
            {s === 'all' ? 'All sections' : s}
          </Chip>
        ))}
      </div>
      <div className="note-filters">
        <label className="field">
          <span>Search</span>
          <input className="input" type="search" value={query} placeholder="Try: mock analysis" onChange={(e) => onChange({ ...filters, query: e.target.value })} />
        </label>
        <label className="field">
          <span>Topic</span>
          <select className="select" value={topic} onChange={(e) => onChange({ ...filters, topic: e.target.value })}>
            <option value="all">All topics</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="small muted num" role="status">
        {rows.length} {rows.length === 1 ? 'note' : 'notes'}
      </p>
      {rows.length ? (
        <ul className="note-grid">
          {rows.map((n) => (
            <li key={n.id}>
              <article className="card card-link note-card">
                <div className="row">
                  <Tag tone="primary">{n.topic}</Tag>
                  <span className="small muted num">{n.readingMinutes} min read</span>
                </div>
                <h2 className="card-title">
                  <Link id={noteLinkId(n.id)} className="note-card-title" to={`/learn/notes?note=${n.id}`}>
                    {n.title}
                  </Link>
                </h2>
                <p className="small muted note-card-excerpt">{n.body[0]}</p>
                <div className="note-card-foot">
                  <AuthorLine label={n.authorLabel} />
                  <UpvoteChip note={n} />
                </div>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <Empty icon={SearchX} text="No alum notes match that. Try a shorter search or another section." action={<Button onClick={() => onChange(NO_FILTERS)}>Clear filters</Button>} />
      )}
    </div>
  );
}

// ---- My notes ----

function NoteEditor({ note, onClose }: { note: Note | null; onClose: () => void }) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [text, setText] = useState(note?.text ?? '');
  const [topic, setTopic] = useState(note?.topic ?? 'General');
  const [tags, setTags] = useState(note?.tags.join(', ') ?? '');
  const topics = note && !NOTE_TOPICS.includes(note.topic) ? [note.topic, ...NOTE_TOPICS] : NOTE_TOPICS;
  const canSave = !!(title.trim() || text.trim());

  const save = () => {
    const body = text.trim();
    const cleanTitle = title.trim() || (body.length > 48 ? `${body.slice(0, 48).trim()}…` : body);
    const cleanTags = [...new Set(tags.split(',').map((t) => t.trim()).filter(Boolean))];
    if (note) updateNote(note.id, { title: cleanTitle, text: body, topic, tags: cleanTags });
    else addNote({ title: cleanTitle, text: body, topic, tags: cleanTags, source: null });
    toast('Note saved');
    onClose();
  };

  return (
    <Dialog
      title={note ? 'Edit note' : 'New note'}
      onClose={onClose}
      actions={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save} disabled={!canSave}>
            Save note
          </Button>
        </>
      }
    >
      <div className="stack">
        <label className="field">
          <span>Title</span>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="field">
          <span>Topic</span>
          <select className="select" value={topic} onChange={(e) => setTopic(e.target.value)}>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Text</span>
          <textarea className="textarea" rows={6} value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <label className="field">
          <span>Tags</span>
          <input className="input" value={tags} onChange={(e) => setTags(e.target.value)} />
          <small>Separate tags with commas.</small>
        </label>
      </div>
    </Dialog>
  );
}

const LONG_NOTE = 280;

function MyNoteCard({ note, onEdit, onDelete }: { note: Note; onEdit: (n: Note) => void; onDelete: (n: Note) => void }) {
  const [open, setOpen] = useState(false);
  const long = note.text.length > LONG_NOTE;
  const fromAlum = note.tags.includes(ALUM_TAG);
  return (
    <li className="card mynote">
      <h3 className="card-title">{note.title}</h3>
      {note.text && <p className={`mynote-text${long && !open ? ' clamped' : ''}`}>{note.text}</p>}
      {long && (
        <div>
          <Button variant="ghost" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? 'Show less' : 'Show all'}
          </Button>
        </div>
      )}
      {(note.tags.length > 0 || note.source) && (
        <div className="row mynote-meta">
          {note.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
          {note.source && <span className="small muted">From {note.source}</span>}
          {fromAlum && <SampleTag />}
        </div>
      )}
      <div className="row">
        <Button variant="ghost" icon={Pencil} onClick={() => onEdit(note)} aria-label={`Edit ${note.title}`}>
          Edit
        </Button>
        <Button variant="ghost" icon={Trash2} onClick={() => onDelete(note)} aria-label={`Delete ${note.title}`}>
          Delete
        </Button>
      </div>
    </li>
  );
}

function MyNotes() {
  const notes = useApp((s) => s.notes);
  const [topic, setTopic] = useState('all');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Note | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Note | null>(null);
  // Dialog re-focuses its first field whenever onClose changes, so these must stay stable.
  const closeEditor = useCallback(() => setEditing(null), []);
  const closeDelete = useCallback(() => setDeleting(null), []);

  const topics = useMemo(() => [...new Set(notes.map((n) => n.topic))].sort(), [notes]);
  const activeTopic = topic === 'all' || topics.includes(topic) ? topic : 'all';
  const groups = useMemo(() => {
    const byTopic = new Map<string, Note[]>();
    for (const n of notes) {
      if (activeTopic !== 'all' && n.topic !== activeTopic) continue;
      if (!matches([n.title, n.text, n.topic, n.source ?? '', ...n.tags], query)) continue;
      byTopic.set(n.topic, [...(byTopic.get(n.topic) ?? []), n]);
    }
    return [...byTopic.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [notes, activeTopic, query]);

  const dialogs = (
    <>
      {editing && <NoteEditor note={editing === 'new' ? null : editing} onClose={closeEditor} />}
      {deleting && (
        <Dialog
          title="Delete this note?"
          onClose={closeDelete}
          actions={
            <>
              <Button onClick={closeDelete}>Keep note</Button>
              <Button
                variant="primary"
                onClick={() => {
                  removeNote(deleting.id);
                  setDeleting(null);
                  toast('Note deleted');
                }}
              >
                Delete note
              </Button>
            </>
          }
        >
          <p>"{deleting.title}" will be removed from My notes. This can't be undone.</p>
        </Dialog>
      )}
    </>
  );

  if (!notes.length) {
    return (
      <>
        <Empty
          icon={NotebookPen}
          text="Your notes will appear here, whether you write them, save them from alum notes or keep lines from a review."
          action={
            <Button variant="primary" icon={Plus} onClick={() => setEditing('new')}>
              New note
            </Button>
          }
        />
        {dialogs}
      </>
    );
  }

  return (
    <div className="stack">
      <div className="note-filters note-filters-mine">
        <label className="field">
          <span>Search</span>
          <input className="input" type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <label className="field">
          <span>Topic</span>
          <select className="select" value={activeTopic} onChange={(e) => setTopic(e.target.value)}>
            <option value="all">All topics</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <Button variant="primary" icon={Plus} onClick={() => setEditing('new')}>
          New note
        </Button>
      </div>
      {groups.length ? (
        <div className="stack-lg">
          {groups.map(([name, list]) => (
            <section key={name} className="stack" aria-label={name}>
              <h2 className="section-title">{name}</h2>
              <ul className="stack">
                {list.map((n) => (
                  <MyNoteCard key={n.id} note={n} onEdit={setEditing} onDelete={setDeleting} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <Empty
          icon={SearchX}
          text="None of your notes match that."
          action={
            <Button
              onClick={() => {
                setQuery('');
                setTopic('all');
              }}
            >
              Clear filters
            </Button>
          }
        />
      )}
      {dialogs}
    </div>
  );
}

// ---- Page ----

export default function Notes() {
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const noteId = params.get('note');
  const note = ALUM_NOTES.find((n) => n.id === noteId);
  const tab: Tab = params.get('tab') === 'mine' ? 'mine' : 'alum';

  // Coming back from a note puts focus on the card it was opened from.
  const lastOpened = useRef<string | null>(null);
  useEffect(() => {
    if (note) {
      lastOpened.current = note.id;
    } else if (lastOpened.current) {
      document.getElementById(noteLinkId(lastOpened.current))?.focus();
      lastOpened.current = null;
    }
  }, [note]);

  if (note) return <NoteReader note={note} />;

  return (
    <div className="stack">
      <Tabs tabs={TABS} value={tab} onChange={(t) => setParams(t === 'mine' ? { tab: 'mine' } : {}, { replace: true })} label="Notes" />
      <div role="tabpanel" aria-label={tab === 'mine' ? 'My notes' : 'Alum notes'}>
        {tab === 'mine' ? <MyNotes /> : <AlumList filters={filters} onChange={setFilters} />}
      </div>
    </div>
  );
}
