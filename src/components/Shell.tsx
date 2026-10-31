import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { CalendarCheck, History, Info, ListOrdered } from 'lucide-react';
import { useEffect } from 'react';
import { CreditFooter, Mark } from './ui';
import { daysLeft } from '../logic/dates';
import { nowDate } from '../state/store';

const NAV = [
  { to: '/today', label: 'Today', icon: CalendarCheck },
  { to: '/drill', label: 'Set-pick drill', short: 'Drill', icon: ListOrdered },
  { to: '/replay', label: 'Replay', icon: History },
  { to: '/about', label: 'About', icon: Info },
];

export function Wordmark() {
  return (
    <Link to="/" className="wordmark" aria-label="Pace, back to the landing page">
      <Mark />
      <span className="wordmark-text">
        <b>Pace</b>
        <small>decision practice · concept demo</small>
      </span>
    </Link>
  );
}

export function DaysChip() {
  return <span className="days-chip">{daysLeft(nowDate())} days to CAT · 29 Nov</span>;
}

export default function Shell() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="shell">
      <aside className="side" aria-label="Main">
        <Wordmark />
        <nav className="side-nav">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `side-link${isActive || (to === '/drill' && pathname.startsWith('/drill')) ? ' active' : ''}`} title={label}>
              <Icon size={20} strokeWidth={1.5} aria-hidden />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="shell-main">
        <header className="topbar">
          <span className="hey">Hey, Demo student</span>
          <DaysChip />
        </header>
        <main id="main" className="page" tabIndex={-1}>
          <Outlet />
        </main>
        <CreditFooter />
      </div>
      <nav className="tabbar" aria-label="Main">
        {NAV.map(({ to, label, short, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `tab${isActive || (to === '/drill' && pathname.startsWith('/drill')) ? ' active' : ''}`}>
            <Icon size={20} strokeWidth={1.5} aria-hidden />
            <span>{short ?? label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
