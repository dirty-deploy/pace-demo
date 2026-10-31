import { lazy, Suspense } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Shell from './components/Shell';
import Today from './pages/Today';
import Drill from './pages/Drill';
import DrillResult from './pages/DrillResult';
import Replay from './pages/Replay';
import About from './pages/About';
import Attempt from './pages/Attempt';
import { StoreProvider } from './state/store';

const Landing = lazy(() => import('./pages/Landing'));

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <a href="#main" className="skip" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>Skip to content</a>
        <Routes>
          <Route
            path="/"
            element={
              <Suspense fallback={<div className="boot" aria-busy="true" />}>
                <Landing />
              </Suspense>
            }
          />
          <Route path="/attempt/:setId" element={<Attempt />} />
          <Route element={<Shell />}>
            <Route path="/today" element={<Today />} />
            <Route path="/drill" element={<Drill />} />
            <Route path="/drill/result" element={<DrillResult />} />
            <Route path="/replay" element={<Replay />} />
            <Route path="/about" element={<About />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
}
