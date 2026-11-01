import { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Shell, { PageFallback, PublicLayout } from './components/Shell';
import { Toasts } from './components/ui';
import { reconcileShields } from './state/actions';
import { useApp } from './state/store';
import type { Theme } from './state/schema';

const Landing = lazy(() => import('./pages/Landing'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const About = lazy(() => import('./pages/About'));
const Home = lazy(() => import('./pages/Home'));
const DailySet = lazy(() => import('./pages/DailySet'));
const Tests = lazy(() => import('./pages/Tests'));
const Drill = lazy(() => import('./pages/Drill'));
const Lessons = lazy(() => import('./pages/Lessons'));
const LessonPlayer = lazy(() => import('./pages/LessonPlayer'));
const Notes = lazy(() => import('./pages/Notes'));
const Vocabulary = lazy(() => import('./pages/Vocabulary'));
const Review = lazy(() => import('./pages/Review'));
const ReviewDetail = lazy(() => import('./pages/ReviewDetail'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Planner = lazy(() => import('./pages/Planner'));
const Streak = lazy(() => import('./pages/Streak'));
const Community = lazy(() => import('./pages/Community'));
const Rewards = lazy(() => import('./pages/Rewards'));
const Settings = lazy(() => import('./pages/Settings'));
const More = lazy(() => import('./pages/More'));
const TestWindow = lazy(() => import('./pages/TestWindow'));
const Result = lazy(() => import('./pages/Result'));
const RedoStart = lazy(() => import('./pages/RedoStart'));

function useTheme(theme: Theme) {
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && media.matches);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#141216' : '#F8F6F2');
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);
}

export default function App() {
  const theme = useApp((s) => s.settings.theme);
  useTheme(theme);
  useEffect(() => reconcileShields(), []);
  return (
    <HashRouter>
      <a
        href="#main"
        className="skip"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        Skip to content
      </a>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/start" element={<Onboarding />} />
          <Route path="/about" element={<About />} />
        </Route>
        <Route
          path="/test/:testId"
          element={
            <Suspense fallback={<PageFallback />}>
              <TestWindow />
            </Suspense>
          }
        />
        <Route
          path="/test/:testId/result"
          element={
            <Suspense fallback={<PageFallback />}>
              <Result />
            </Suspense>
          }
        />
        <Route element={<Shell />}>
          <Route path="/redo/:id" element={<RedoStart />} />
          <Route path="/home" element={<Home />} />
          <Route path="/practice/daily" element={<DailySet />} />
          <Route path="/practice/tests" element={<Tests />} />
          <Route path="/practice/drill" element={<Drill />} />
          <Route path="/learn/lessons" element={<Lessons />} />
          <Route path="/learn/lessons/:id" element={<LessonPlayer />} />
          <Route path="/learn/notes" element={<Notes />} />
          <Route path="/learn/vocab" element={<Vocabulary />} />
          <Route path="/progress/review" element={<Review />} />
          <Route path="/progress/review/:attemptId" element={<ReviewDetail />} />
          <Route path="/progress/analytics" element={<Analytics />} />
          <Route path="/progress/planner" element={<Planner />} />
          <Route path="/progress/streak" element={<Streak />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/:threadId" element={<Community />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/more" element={<More />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toasts />
    </HashRouter>
  );
}
