import { useCallback, useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Check, Info, type LucideIcon } from 'lucide-react';
import type { Difficulty } from '../content/types';

export const CREDIT =
  'Pace is a concept redesign by Team Apex, showing features proposed for Prepito (prepito.in), an independent CAT preparation platform. Not affiliated with or endorsed by Prepito. All questions, lessons and notes on this site are original.';

export const SAMPLE_TIP = 'This is a demo. Numbers and posts from other students are illustrative.';

export function CreditFooter({ compact }: { compact?: boolean }) {
  return (
    <footer className={`credit${compact ? ' credit-compact' : ''}`}>
      <p>{CREDIT}</p>
    </footer>
  );
}

type Variant = 'primary' | 'secondary' | 'ghost' | 'reward';

type BtnProps = {
  variant?: Variant;
  to?: string;
  icon?: LucideIcon;
  block?: boolean;
  children: ReactNode;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>;

export function Button({ variant = 'secondary', to, icon: Icon, block, children, className = '', ...rest }: BtnProps) {
  const cls = `btn btn-${variant}${block ? ' btn-block' : ''} ${className}`.trim();
  const icon = Icon ? <Icon size={18} strokeWidth={1.5} aria-hidden /> : null;
  if (to && !rest.disabled) {
    return (
      <Link to={to} className={cls} onClick={rest.onClick as never}>
        {icon}
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {icon}
      {children}
    </button>
  );
}

export function Chip({ selected, children, ...rest }: { selected?: boolean; children: ReactNode } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>) {
  return (
    <button type="button" className="chip" aria-pressed={!!selected} {...rest}>
      {selected && <Check size={14} strokeWidth={2} aria-hidden />}
      {children}
    </button>
  );
}

export type TabDef<T extends string> = { id: T; label: string };

export function Tabs<T extends string>({ tabs, value, onChange, label }: { tabs: TabDef<T>[]; value: T; onChange: (t: T) => void; label: string }) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = tabs[(i + delta + tabs.length) % tabs.length];
    onChange(next.id);
    refs.current[next.id]?.focus();
  };
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((t, i) => (
        <button
          key={t.id}
          ref={(el) => {
            refs.current[t.id] = el;
          }}
          type="button"
          role="tab"
          className="tab"
          aria-selected={t.id === value}
          tabIndex={t.id === value ? 0 : -1}
          onClick={() => onChange(t.id)}
          onKeyDown={(e) => onKey(e, i)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Stat({ value, label, note }: { value: ReactNode; label: string; note?: string }) {
  return (
    <div className="stat">
      <b>{value}</b>
      <span>{label}</span>
      {note && <small>{note}</small>}
    </div>
  );
}

export function Progress({ value, label }: { value: number; label: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <i style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Tag({ children, tone }: { children: ReactNode; tone?: 'ok' | 'bad' | 'warn' | 'primary' }) {
  return <span className={`tag${tone ? ` tag-${tone}` : ''}`}>{children}</span>;
}

export function DifficultyTag({ level }: { level: Difficulty }) {
  const tone = level === 'Easy' ? 'ok' : level === 'Hard' ? 'bad' : 'warn';
  return (
    <span className={`tag tag-${tone}`}>
      <i className="dot" aria-hidden />
      {level}
    </span>
  );
}

/** Required on every block that shows other students' activity. */
export function SampleTag() {
  return (
    <span className="tag sample" tabIndex={0} aria-label={`Sample data. ${SAMPLE_TIP}`}>
      <Info size={12} strokeWidth={1.5} aria-hidden />
      Sample data
      <span className="tip" role="tooltip" aria-hidden>
        {SAMPLE_TIP}
      </span>
    </span>
  );
}

export function Empty({ icon: Icon, text, action }: { icon: LucideIcon; text: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <Icon size={32} strokeWidth={1.5} aria-hidden />
      <p>{text}</p>
      {action}
    </div>
  );
}

/** Centred dialog. Focus stays inside; Escape closes only when onClose is given. */
export function Dialog({ title, children, actions, onClose }: { title: string; children: ReactNode; actions: ReactNode; onClose?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useRef(`dlg-${Math.random().toString(36).slice(2, 8)}`).current;
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const root = ref.current as HTMLDivElement;
    const focusables = () => Array.from(root.querySelectorAll<HTMLElement>('button, [href], input, textarea, select')).filter((el) => !el.hasAttribute('disabled'));
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
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
    root.addEventListener('keydown', onKey);
    return () => {
      root.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [onClose]);
  return (
    <div className="overlay">
      <div ref={ref} className="dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <h2 id={titleId}>{title}</h2>
        {children}
        <div className="dialog-actions">{actions}</div>
      </div>
    </div>
  );
}

// ---- Toasts ----

type ToastItem = { id: number; text: string };
let pushToast: ((text: string) => void) | null = null;

/** Shows a short message at the bottom left. Safe to call from anywhere. */
export function toast(text: string) {
  pushToast?.(text);
}

export function Toasts() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const add = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setItems((xs) => [...xs, { id, text }]);
    window.setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 3500);
  }, []);
  useEffect(() => {
    pushToast = add;
    return () => {
      pushToast = null;
    };
  }, [add]);
  return (
    <div className="toasts no-print" role="status" aria-live="polite">
      {items.map((t) => (
        <div className="toast" key={t.id}>
          {t.text}
        </div>
      ))}
    </div>
  );
}
