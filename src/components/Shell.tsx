import { createContext, Suspense, useContext, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { CalendarClock, Coins } from 'lucide-react';
import { CreditFooter } from './ui';
import { groupFor, NAV, SETTINGS_ITEM, TAB_BAR, titleFor, widthFor, type NavItem } from './nav';
import { today, useApp } from '../state/store';
import { daysLeft, toISO } from '../logic/dates';
import { currentStreak, ruleMet } from '../logic/streak';
import { balanceOf } from '../logic/coins';
import { ruleOf } from '../state/actions';

export function Brand() {
  return (
    <Link to="/home" className="brand" aria-label="Pace home">
      <b>Pace</b>
      <small>CAT prep · concept redesign for Prepito by Team Apex</small>
    </Link>
  );
}

function SideLink({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <NavLink to={item.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} title={item.label}>
      <Icon size={18} strokeWidth={1.5} aria-hidden />
      <span>{item.label}</span>
    </NavLink>
  );
}

/** Small ring that fills when today's rule is met. */
function Ring({ done }: { done: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="gold">
      <circle cx="8" cy="8" r="6" fill="none" stroke="var(--line)" strokeWidth="2.5" />
      {done && <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2.5" />}
    </svg>
  );
}

function TopChips() {
  const s = useApp();
  const now = today();
  const rule = ruleOf(s);
  const streak = currentStreak(s.days, now, rule);
  const doneToday = ruleMet(s.days[toISO(now)], rule);
  const coins = balanceOf(s.coins);
  const days = s.profile ? daysLeft(now, s.profile.examDate) : 0;
  const exam = s.profile?.exam.split(' ')[0] ?? 'CAT';
  return (
    <div className="topbar-chips">
      <Link to="/settings" className="top-chip" aria-label={`${days} days to ${exam}`}>
        <CalendarClock size={16} strokeWidth={1.5} aria-hidden />
        {days}
        <span className="hide-mobile"> days to {exam}</span>
      </Link>
      <Link to="/progress/streak" className="top-chip" aria-label={`Streak ${streak} ${streak === 1 ? 'day' : 'days'}. Today ${doneToday ? 'done' : 'not done yet'}.`}>
        <Ring done={doneToday} />
        {streak}
      </Link>
      <Link to="/rewards" className="top-chip" aria-label={`${coins} coins`}>
        <Coins size={16} strokeWidth={1.5} className="gold" aria-hidden />
        {coins}
      </Link>
    </div>
  );
}

/** Lets a detail page replace the top-bar title, for example with a lesson's name. */
const TitleCtx = createContext<(t: string | null) => void>(() => {});

export function usePageTitle(title: string | null) {
  const set = useContext(TitleCtx);
  useEffect(() => {
    set(title);
    return () => set(null);
  }, [title, set]);
}

export function PageFallback() {
  return <div aria-busy="true" style={{ minHeight: 240 }} />;
}

export default function Shell() {
  const { pathname } = useLocation();
  const profile = useApp((s) => s.profile);
  const [custom, setCustom] = useState<string | null>(null);
  const title = custom ?? titleFor(pathname);
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${titleFor(pathname)} · Pace`;
  }, [pathname]);
  const group = useMemo(() => groupFor(pathname), [pathname]);
  const width = widthFor(pathname);

  if (!profile?.onboarded) return <Navigate to="/start" replace />;

  return (
    <div className="shell">
      <aside className="side" aria-label="Main navigation">
        <Brand />
        {NAV.map((g) => (
          <nav className="nav-group" key={g.label ?? 'top'} aria-label={g.label ?? 'Home'}>
            {g.label && <div className="nav-label">{g.label}</div>}
            {g.items.map((i) => (
              <SideLink key={i.to} item={i} />
            ))}
          </nav>
        ))}
        <div className="nav-spacer" />
        <nav className="nav-group" aria-label="Account">
          <SideLink item={SETTINGS_ITEM} />
        </nav>
      </aside>
      <div className="main-col">
        <header className="topbar">
          <h1 className="page-title">{title}</h1>
          <TopChips />
        </header>
        {group && (
          <nav className="subnav" aria-label={`${group.label} pages`}>
            {group.items.map((i) => (
              <NavLink key={i.to} to={i.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {i.label}
              </NavLink>
            ))}
          </nav>
        )}
        <main id="main" tabIndex={-1} className={`page${width === 'reading' ? ' page-reading' : width === 'full' ? ' page-full' : ''}`}>
          <TitleCtx.Provider value={setCustom}>
            <Suspense fallback={<PageFallback />}>
              <Outlet />
            </Suspense>
          </TitleCtx.Provider>
        </main>
        <CreditFooter />
      </div>
      <nav className="tabbar" aria-label="Main">
        {TAB_BAR.map(({ to, label, icon: Icon, match }) => (
          <NavLink key={to} to={to} className={({ isActive }) => (isActive || (match && pathname.startsWith(match)) ? 'active' : '')}>
            <Icon size={20} strokeWidth={1.5} aria-hidden />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

/** Layout for /, /start and /about: no sidebar, credit footer at the bottom. */
export function PublicLayout() {
  const onboarded = useApp((s) => !!s.profile?.onboarded);
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = pathname === '/about' ? 'About this concept · Pace' : pathname === '/start' ? 'Get started · Pace' : 'Pace · CAT prep, one good day at a time';
  }, [pathname]);
  return (
    <div className="public">
      <header className="public-top">
        <Link to="/" className="brand" aria-label="Pace, back to the first page">
          <b>Pace</b>
          <small>CAT prep · concept redesign for Prepito by Team Apex</small>
        </Link>
        <nav className="row" aria-label="Site">
          <Link to="/about" className="btn btn-ghost">
            About
          </Link>
          {onboarded && (
            <Link to="/home" className="btn btn-ghost">
              Go to Home
            </Link>
          )}
        </nav>
      </header>
      <main id="main" tabIndex={-1} className="public-main">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <CreditFooter />
    </div>
  );
}
