import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui';
import { startRedo } from '../state/replayView';
import { useApp } from '../state/store';

/** Planner blocks for redo items link here. It opens the redo in the test window. */
export default function RedoStart() {
  const { id } = useParams();
  const nav = useNavigate();
  const entry = useApp((s) => s.redo.find((r) => r.id === id));
  useEffect(() => {
    if (entry) nav(startRedo(entry), { replace: true });
  }, [entry, nav]);
  if (entry) return null;
  return (
    <div className="stack">
      <p>This redo item is no longer on your list.</p>
      <Button to="/progress/review">See your attempts</Button>
    </div>
  );
}
