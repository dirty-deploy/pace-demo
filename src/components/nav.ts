import {
  BarChart3,
  BookMarked,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Coins,
  History,
  Home,
  ListChecks,
  ListOrdered,
  Menu,
  MessagesSquare,
  NotebookPen,
  PlayCircle,
  Repeat2,
  Settings,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = { to: string; label: string; icon: LucideIcon; match?: string };
export type NavGroup = { label: string | null; items: NavItem[] };

export const NAV: NavGroup[] = [
  { label: null, items: [{ to: '/home', label: 'Home', icon: Home }] },
  {
    label: 'Practice',
    items: [
      { to: '/practice/daily', label: 'Daily set', icon: ListChecks },
      { to: '/practice/tests', label: 'Tests', icon: ClipboardList },
      { to: '/practice/drill', label: 'DILR set-pick drill', icon: ListOrdered },
    ],
  },
  {
    label: 'Learn',
    items: [
      { to: '/learn/lessons', label: 'Lessons', icon: PlayCircle },
      { to: '/learn/notes', label: 'Notes', icon: NotebookPen },
      { to: '/learn/vocab', label: 'Vocabulary', icon: BookMarked },
    ],
  },
  {
    label: 'Progress',
    items: [
      { to: '/progress/review', label: 'Review', icon: History },
      { to: '/progress/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/progress/planner', label: 'Planner', icon: CalendarDays },
      { to: '/progress/streak', label: 'Streak', icon: Repeat2 },
    ],
  },
  {
    label: 'Community',
    items: [
      { to: '/community', label: 'Discussions', icon: MessagesSquare },
      { to: '/rewards', label: 'Rewards', icon: Coins },
    ],
  },
];

export const SETTINGS_ITEM: NavItem = { to: '/settings', label: 'Settings', icon: Settings };

export const TAB_BAR: NavItem[] = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/practice/daily', label: 'Practice', icon: ClipboardList, match: '/practice' },
  { to: '/learn/lessons', label: 'Learn', icon: BookOpen, match: '/learn' },
  { to: '/progress/review', label: 'Progress', icon: TrendingUp, match: '/progress' },
  { to: '/more', label: 'More', icon: Menu, match: '/more' },
];

export const MORE_ITEMS: NavItem[] = [
  { to: '/community', label: 'Discussions', icon: MessagesSquare },
  { to: '/rewards', label: 'Rewards', icon: Coins },
  SETTINGS_ITEM,
  { to: '/about', label: 'About this concept', icon: BookOpen },
];

/** Title shown in the top bar, longest prefix wins. */
const TITLES: [string, string][] = [
  ['/home', 'Home'],
  ['/practice/daily', 'Daily set'],
  ['/practice/tests', 'Tests'],
  ['/practice/drill', 'DILR set-pick drill'],
  ['/learn/lessons', 'Lessons'],
  ['/learn/notes', 'Notes'],
  ['/learn/vocab', 'Vocabulary'],
  ['/progress/review', 'Review'],
  ['/progress/analytics', 'Analytics'],
  ['/progress/planner', 'Planner'],
  ['/progress/streak', 'Streak'],
  ['/community', 'Discussions'],
  ['/rewards', 'Rewards'],
  ['/settings', 'Settings'],
  ['/more', 'More'],
];

export function titleFor(pathname: string): string {
  return TITLES.find(([p]) => pathname === p || pathname.startsWith(`${p}/`))?.[1] ?? 'Pace';
}

export function groupFor(pathname: string): NavGroup | undefined {
  return NAV.find((g) => g.label && ['Practice', 'Learn', 'Progress'].includes(g.label) && g.items.some((i) => pathname.startsWith(i.to)));
}

/** Reading pages use the narrower column. */
export function widthFor(pathname: string): 'reading' | 'full' | 'normal' {
  if (pathname.startsWith('/progress/planner')) return 'full';
  return 'normal';
}
