import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

type Variant = 'primary' | 'secondary';

type BtnProps = {
  variant?: Variant;
  to?: string;
  icon?: ReactNode | false;
  small?: boolean;
  children: ReactNode;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>;

/** The two pill buttons: gold primary (one per screen) and dark-glass secondary with a travelling beam. */
export function Btn({ variant = 'secondary', to, icon, small, children, className = '', ...rest }: BtnProps) {
  const cls = `btn btn-${variant}${small ? ' btn-small' : ''} ${className}`.trim();
  const ic = icon === false ? null : icon ?? (variant === 'primary' ? <ArrowRight size={18} strokeWidth={1.5} aria-hidden /> : <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden />);
  if (to) {
    return (
      <Link to={to} className={cls} aria-disabled={rest.disabled || undefined}>
        <span>{children}</span>
        {ic}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      <span>{children}</span>
      {ic}
    </button>
  );
}

/** Small choice pill: gold fill sweeps in on hover; stays filled when selected. */
export function Chip({ selected, children, ...rest }: { selected?: boolean; children: ReactNode } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>) {
  return (
    <button type="button" className="chip" aria-pressed={selected} {...rest}>
      <span>{children}</span>
    </button>
  );
}

export function Eyebrow({ children, dot = true, className = '' }: { children: ReactNode; dot?: boolean; className?: string }) {
  return (
    <p className={`eyebrow ${className}`.trim()}>
      {dot && <i className="eyebrow-dot" aria-hidden />}
      {children}
    </p>
  );
}

export const CREDIT =
  'Concept demo by Team Apex. Shows features proposed for Prepito (prepito.in), an independent CAT preparation platform. Not affiliated with or endorsed by Prepito. All content in this demo is original.';

export function CreditFooter() {
  return (
    <footer className="credit" role="contentinfo">
      <p>{CREDIT}</p>
    </footer>
  );
}

/** Code-drawn slab mark used in the wordmark. */
export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect x="8" y="5" width="16" height="20" rx="3.5" fill="none" stroke="var(--text)" strokeWidth="1.5" />
      <rect x="8" y="22.5" width="16" height="2.5" rx="1.25" fill="var(--gold)" />
      <rect x="12" y="10" width="8" height="1.5" rx=".75" fill="var(--text)" opacity=".5" />
      <rect x="12" y="14" width="5" height="1.5" rx=".75" fill="var(--text)" opacity=".5" />
    </svg>
  );
}

/** A disc drawn from concentric circles with a soft inner shadow, used as a plan node. */
export function Disc({ state, children }: { state: 'done' | 'current' | 'todo'; children?: ReactNode }) {
  const gold = state === 'current';
  return (
    <span className={`disc disc-${state}`} aria-hidden>
      <svg viewBox="0 0 48 48" width="48" height="48">
        <defs>
          <radialGradient id={`dg-${state}`} cx="50%" cy="38%" r="70%">
            <stop offset="0%" stopColor={gold ? '#F7D27A' : '#2A2230'} />
            <stop offset="100%" stopColor={gold ? '#E9B04A' : '#17131A'} />
          </radialGradient>
        </defs>
        <circle cx="24" cy="24" r="22" fill="none" stroke={gold ? 'rgba(233,176,74,.5)' : 'rgba(243,237,228,.14)'} strokeWidth="1" />
        <circle cx="24" cy="24" r="17" fill={`url(#dg-${state})`} />
        <circle cx="24" cy="24" r="17" fill="none" stroke="rgba(0,0,0,.45)" strokeWidth="3" style={{ filter: 'blur(2px)' }} clipPath="circle(17px at 24px 24px)" />
        <circle cx="24" cy="24" r="10" fill="none" stroke={gold ? 'rgba(26,18,6,.35)' : 'rgba(243,237,228,.12)'} strokeWidth="1" />
      </svg>
      <span className="disc-inner">{children}</span>
    </span>
  );
}

/** Segmented bar meter: one short vertical bar per minute. */
export function Segments({ minutes, lit }: { minutes: number; lit: boolean }) {
  const n = Math.max(1, Math.round(minutes));
  return (
    <span className={`segs${lit ? ' segs-lit' : ''}`} aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <i key={i} />
      ))}
    </span>
  );
}

/** Traps focus inside a dialog. Escape does nothing unless onEscape is given. */
export function Modal({ children, labelledBy, describedBy, onEscape, tone }: { children: ReactNode; labelledBy: string; describedBy?: string; onEscape?: () => void; tone?: 'ember' }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const root = ref.current!;
    const focusables = () => Array.from(root.querySelectorAll<HTMLElement>('button, [href], input, [tabindex]:not([tabindex="-1"])')).filter((el) => !el.hasAttribute('disabled'));
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onEscape?.();
        return;
      }
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      prev?.focus?.();
    };
  }, [onEscape]);
  return (
    <div className="modal-backdrop">
      <div ref={ref} role="alertdialog" aria-modal="true" aria-labelledby={labelledBy} aria-describedby={describedBy} className={`modal${tone === 'ember' ? ' modal-ember' : ''}`}>
        {children}
      </div>
    </div>
  );
}

/** Reads true once `query` matches; updates live. */
export function useMedia(query: string): boolean {
  const [m, setM] = useState(() => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false));
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia(query);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return m;
}
