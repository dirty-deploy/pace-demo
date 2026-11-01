import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowBigUp, ArrowLeft, MessageSquare, MessagesSquare, Plus } from 'lucide-react';
import { usePageTitle } from '../components/Shell';
import { Button, Chip, Empty, SampleTag, Tag, toast } from '../components/ui';
import { THREAD_TOPICS, THREADS } from '../content/threads';
import { daysBetween, shortDate } from '../logic/dates';
import { addThread, addThreadReply, toggleUpvote } from '../state/actions';
import type { CommunityPost, CommunityState } from '../state/schema';
import { today, useApp } from '../state/store';
import '../styles/community.css';

type ReplyView = { id: string; author: string; text: string; upvotes: number; when: string; own: boolean };

type ThreadView = {
  id: string;
  topic: string;
  title: string;
  author: string;
  text: string;
  upvotes: number;
  when: string;
  own: boolean;
  replies: ReplyView[];
};

function ago(days: number): string {
  if (days <= 0) return 'Today';
  return days === 1 ? 'Yesterday' : `${days} days ago`;
}

const agoFrom = (at: number, now: Date) => ago(daysBetween(new Date(at), now));

const ownReply = (p: CommunityPost, now: Date): ReplyView => ({ id: p.id, author: 'You', text: p.text, upvotes: p.upvotes, when: agoFrom(p.at, now), own: true });

/** The student's threads first, then the samples, all in one shape. */
function allThreads(c: CommunityState, now: Date): ThreadView[] {
  const own: ThreadView[] = [...c.threads]
    .sort((a, b) => b.at - a.at)
    .map((t) => ({ id: t.id, topic: t.topic, title: t.title, author: 'You', text: t.text, upvotes: t.upvotes, when: agoFrom(t.at, now), own: true, replies: t.replies.map((r) => ownReply(r, now)) }));
  const samples: ThreadView[] = [...THREADS]
    .sort((a, b) => a.daysAgo - b.daysAgo)
    .map((t) => ({
      id: t.id,
      topic: t.topic,
      title: t.title,
      author: t.author,
      text: t.text,
      upvotes: t.upvotes,
      when: ago(t.daysAgo),
      own: false,
      replies: [...t.replies.map((r) => ({ ...r, when: ago(r.daysAgo), own: false })), ...(c.replies[t.id] ?? []).map((r) => ownReply(r, now))],
    }));
  return [...own, ...samples];
}

const countOf = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
const repliesText = (n: number) => (n === 1 ? '1 reply' : `${n} replies`);

function Upvote({ id, base, what }: { id: string; base: number; what: string }) {
  const on = useApp((s) => !!s.community.upvoted[id]);
  const count = base + (on ? 1 : 0);
  return (
    <button type="button" className="cm-upvote" aria-pressed={on} aria-label={`Upvote ${what}. ${countOf(count, 'upvote')}.`} onClick={() => toggleUpvote(id)}>
      <ArrowBigUp size={18} strokeWidth={1.5} fill={on ? 'currentColor' : 'none'} aria-hidden />
      <span className="num">{count}</span>
    </button>
  );
}

function NewThread({ onClose }: { onClose: () => void }) {
  const nav = useNavigate();
  const first = useRef<HTMLSelectElement>(null);
  const [topic, setTopic] = useState<string>(THREAD_TOPICS[0]);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const ready = title.trim().length > 0 && text.trim().length > 0;

  useEffect(() => first.current?.focus(), []);

  const post = () => {
    if (!ready) return;
    const id = addThread(topic, title.trim(), text.trim());
    toast('Posted. It is saved in this browser only.');
    nav(`/community/${id}`);
  };

  return (
    <form
      className="card stack"
      aria-label="Start a thread"
      onSubmit={(e) => {
        e.preventDefault();
        post();
      }}
    >
      <div className="cm-form-grid">
        <label className="field">
          <span>Topic</span>
          <select ref={first} className="select" value={topic} onChange={(e) => setTopic(e.target.value)}>
            {THREAD_TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Title</span>
          <input className="input" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} />
        </label>
      </div>
      <label className="field">
        <span>Your post</span>
        <textarea className="textarea" value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <div className="row">
        <Button variant="primary" type="submit" disabled={!ready}>
          Post thread
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function PerQuestion() {
  const attempts = useApp((s) => s.attempts);
  const latest = [...attempts].sort((a, b) => b.endedAt - a.endedAt).slice(0, 4);
  return (
    <section className="card stack cm-side" aria-labelledby="cm-pq-title">
      <h2 className="section-title" id="cm-pq-title">
        Per-question discussions
      </h2>
      {latest.length === 0 ? (
        <Empty icon={MessageSquare} text="After your first test, each question gets its own answers from other students in Review." action={<Button to="/practice/daily">Open daily set</Button>} />
      ) : (
        <>
          <p className="muted small">Answers to each question live in Review, next to its explanation. Open a recent attempt to read them or add yours.</p>
          <ul className="cm-pq">
            {latest.map((a) => (
              <li key={a.id}>
                <Link to={`/progress/review/${a.id}?tab=questions`}>{a.testName}</Link>
                <span className="small muted num">
                  {shortDate(new Date(a.endedAt))} · {countOf(a.questions.length, 'question')}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function ThreadList() {
  const community = useApp((s) => s.community);
  const [topic, setTopic] = useState<string>('All');
  const [writing, setWriting] = useState(false);
  const threads = useMemo(() => allThreads(community, today()), [community]);
  const shown = threads.filter((t) => topic === 'All' || t.topic === topic);

  return (
    <div className="cm-layout">
      <div className="stack cm-main">
        {writing ? (
          <NewThread onClose={() => setWriting(false)} />
        ) : (
          <div>
            <Button variant="primary" icon={Plus} onClick={() => setWriting(true)}>
              Start a thread
            </Button>
          </div>
        )}
        <div className="row">
          <h2 className="section-title">Threads</h2>
          <SampleTag />
        </div>
        <div className="chips" role="group" aria-label="Filter by topic">
          {['All', ...THREAD_TOPICS].map((t) => (
            <Chip key={t} selected={topic === t} onClick={() => setTopic(t)}>
              {t}
            </Chip>
          ))}
        </div>
        {shown.length === 0 ? (
          <Empty icon={MessagesSquare} text="No threads on this topic yet." />
        ) : (
          <ul className="cm-list">
            {shown.map((t) => (
              <li key={t.id}>
                <div className="grow">
                  <Link className="cm-title" to={`/community/${t.id}`}>
                    {t.title}
                  </Link>
                  <span className="cm-meta small muted">
                    <Tag>{t.topic}</Tag>
                    {t.own && <Tag tone="primary">You</Tag>}
                    <span className="num">{repliesText(t.replies.length)}</span>
                    <span>{t.when}</span>
                  </span>
                </div>
                <Upvote id={t.id} base={t.upvotes} what={t.title} />
              </li>
            ))}
          </ul>
        )}
      </div>
      <PerQuestion />
    </div>
  );
}

function Post({ author, own, when, text, children }: { author: string; own: boolean; when: string; text: string; children: React.ReactNode }) {
  return (
    <>
      <div className="cm-post-head small">
        {own ? <Tag tone="primary">You</Tag> : <b>{author}</b>}
        <span className="muted">{when}</span>
      </div>
      <p className="cm-text">{text}</p>
      <div className="cm-post-foot">{children}</div>
    </>
  );
}

function ThreadPage({ id }: { id: string }) {
  const community = useApp((s) => s.community);
  const thread = useMemo(() => allThreads(community, today()).find((t) => t.id === id), [community, id]);
  const [reply, setReply] = useState('');
  usePageTitle(thread ? thread.title : null);

  if (!thread) {
    return <Empty icon={MessagesSquare} text="This thread isn't here. It may have been in data that was reset." action={<Button to="/community">See all discussions</Button>} />;
  }

  const send = () => {
    const text = reply.trim();
    if (!text) return;
    addThreadReply(thread.id, text);
    setReply('');
    toast('Reply saved in this browser.');
  };

  return (
    <div className="stack cm-thread">
      <Link to="/community" className="btn btn-ghost cm-back">
        <ArrowLeft size={18} strokeWidth={1.5} aria-hidden />
        All discussions
      </Link>
      <div className="row">
        <Tag>{thread.topic}</Tag>
        {!thread.own && <SampleTag />}
      </div>
      <article className="card">
        <Post author={thread.author} own={thread.own} when={thread.when} text={thread.text}>
          <Upvote id={thread.id} base={thread.upvotes} what="this post" />
        </Post>
      </article>
      <section className="stack" aria-labelledby="cm-replies-title">
        <h2 className="section-title" id="cm-replies-title">
          {repliesText(thread.replies.length)}
        </h2>
        {thread.replies.length > 0 && (
          <ul className="cm-replies">
            {thread.replies.map((r) => (
              <li key={r.id}>
                <Post author={r.author} own={r.own} when={r.when} text={r.text}>
                  <Upvote id={r.id} base={r.upvotes} what={r.own ? 'your reply' : `reply from ${r.author}`} />
                </Post>
              </li>
            ))}
          </ul>
        )}
      </section>
      <form
        className="stack"
        aria-label="Reply to this thread"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <label className="field">
          <span>Your reply</span>
          <textarea className="textarea" value={reply} onChange={(e) => setReply(e.target.value)} />
          <small>Saved in this browser only. Nobody else can see it.</small>
        </label>
        <div>
          <Button variant="primary" type="submit" disabled={!reply.trim()}>
            Post reply
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function Community() {
  const { threadId } = useParams();
  return threadId ? <ThreadPage key={threadId} id={threadId} /> : <ThreadList />;
}
