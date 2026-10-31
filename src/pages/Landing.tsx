import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Btn, CreditFooter, Mark, useMedia } from '../components/ui';
import { webglAvailable } from '../landing/gl';
import type { SceneHandle } from '../landing/scene';
import { daysLeft } from '../logic/dates';
import { nowDate } from '../state/store';

const CHAPTERS = [
  {
    label: 'Chapter 01 — The pick',
    head: 'Five sets. Four minutes. Choose your start.',
    body: 'Before you solve anything, you choose. Rank five set previews in four minutes, then see how your order compares with the solver\'s estimate, one reason per set.',
  },
  {
    label: 'Chapter 02 — The cap',
    head: 'Know when a set is costing you.',
    body: 'Every set gets a cap based on your own pace. At the cap you leave, or take two more minutes, once.',
  },
  {
    label: 'Chapter 03 — The replay',
    head: 'Ten minutes. Nothing to type.',
    body: 'Afterwards, a replay shows where the time went and which three sets to redo, built from the attempt log. No tagging, no notes.',
  },
  {
    label: 'Chapter 04 — The plan',
    head: 'A session that fits your day.',
    body: 'Today\'s plan resizes itself to the minutes you actually have, using how much of your last five sessions you finished.',
  },
];

function TopChrome() {
  return (
    <>
      <Link to="/" className="l-brand" aria-label="Pace, decision practice, concept demo">
        <Mark size={26} />
        <span>
          <b>Pace</b>
          <small>decision practice · concept demo</small>
        </span>
      </Link>
      <nav className="l-links" aria-label="Main">
        <Link to="/today">Today</Link>
        <Link to="/drill">Drill</Link>
        <Link to="/replay">Replay</Link>
        <Link to="/about">About</Link>
      </nav>
    </>
  );
}

function Counter() {
  return <p className="l-count tnum">{daysLeft(nowDate())} days to CAT</p>;
}

function ChapterCopy({ i, h1 }: { i: number; h1?: boolean }) {
  const c = CHAPTERS[i];
  const H = h1 ? 'h1' : 'h2';
  return (
    <>
      <p className="l-label">
        <i className="eyebrow-dot" aria-hidden />
        {c.label}
      </p>
      <H className="l-head">{c.head}</H>
      <p className="l-body">{c.body}</p>
      {i === 3 && (
        <div className="l-cta">
          <Btn variant="primary" to="/today">
            Start today's plan
          </Btn>
          <Btn to="/drill">See the drill</Btn>
        </div>
      )}
    </>
  );
}

/** Flat, code-drawn version: used on phones, with reduced motion, or without WebGL. */
function StaticLanding() {
  return (
    <div className="l-static">
      <section className="ls-hero">
        <TopChrome />
        <div className="ls-word" aria-hidden>PACE</div>
        <div className="ls-cards" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <i key={i} style={{ ['--k' as string]: i }} className={i === 0 ? 'first' : ''} />
          ))}
        </div>
        <div className="ls-copy">
          <ChapterCopy i={0} h1 />
        </div>
      </section>
      {[1, 2, 3].map((i) => (
        <section key={i} className="ls-chapter">
          <span className={`ls-num tnum${i === 3 ? ' on' : ''}`}>0{i + 1}</span>
          <ChapterCopy i={i} />
        </section>
      ))}
      <Counter />
      <CreditFooter />
    </div>
  );
}

function AnimatedLanding({ onFail }: { onFail: () => void }) {
  const outer = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<SceneHandle | null>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  useEffect(() => {
    let dead = false;
    import('../landing/scene')
      .then((m) => {
        if (dead || !canvas.current || !stage.current) return;
        try {
          scene.current = m.createScene(canvas.current, stage.current);
          update();
        } catch {
          onFail();
        }
      })
      .catch(onFail);
    return () => {
      dead = true;
      scene.current?.dispose();
      scene.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = useCallback(() => {
    const el = outer.current;
    if (!el) return 0;
    const range = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top;
    return Math.min(3, Math.max(0, (-top / Math.max(1, range)) * 3));
  }, []);

  const update = useCallback(() => {
    const p = progress();
    scene.current?.setTarget(p);
    const a = Math.round(p);
    if (a !== activeRef.current) {
      activeRef.current = a;
      setActive(a);
    }
  }, [progress]);

  useEffect(() => {
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  const jump = (i: number) => {
    const el = outer.current;
    if (!el) return;
    const range = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (i / 3) * range, behavior: 'smooth' });
  };

  return (
    <>
      <div className="l-story" ref={outer}>
        <div className="l-stage" ref={stage}>
          <div className="l-giant" aria-hidden>PACE</div>
          <canvas ref={canvas} className="l-canvas" aria-hidden />
          <div className="l-vignette" aria-hidden />
          <TopChrome />
          <p className="l-side" aria-hidden>Decision practice</p>
          {CHAPTERS.map((_, i) => (
            <div key={i} className={`l-chapter${active === i ? ' on' : ''}`} aria-hidden={active !== i} style={{ visibility: active === i ? 'visible' : 'hidden' }}>
              <ChapterCopy i={i} h1={i === 0} />
            </div>
          ))}
          <ol className="l-nums" aria-label="Chapters">
            {CHAPTERS.map((c, i) => (
              <li key={i}>
                <button type="button" className={`tnum${active === i ? ' on' : ''}`} onClick={() => jump(i)} aria-label={`Go to ${c.label}`} aria-current={active === i}>
                  0{i + 1}
                </button>
              </li>
            ))}
          </ol>
          <Counter />
        </div>
      </div>
      <CreditFooter />
    </>
  );
}

export default function Landing() {
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const narrow = useMedia('(max-width: 599px)');
  const [gl] = useState(() => webglAvailable());
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const flat = reduced || narrow || !gl || failed;
  return <div className="landing">{flat ? <StaticLanding /> : <AnimatedLanding onFail={() => setFailed(true)} />}</div>;
}
