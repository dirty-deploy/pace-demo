import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Button, CreditFooter, Dialog, Stat, toast } from '../components/ui';
import { mSS } from '../logic/cap';
import { roughPercentile } from '../logic/testRules';
import { hashString } from '../logic/rng';
import { useApp } from '../state/store';
import type { AttemptRecord } from '../state/schema';
import '../styles/result.css';

/** Demo invite code, stable per attempt. */
function inviteCode(id: string) {
  return `PACE-${hashString(id).toString(36).toUpperCase().padStart(6, '0').slice(0, 6)}`;
}

function ShareDialog({ record, name, onClose }: { record: AttemptRecord; name: string; onClose: () => void }) {
  const code = inviteCode(record.id);
  const text = `${name} scored ${record.score} of ${record.max} on ${record.testName} on Pace. Invite code: ${code}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast('Copied');
    } catch {
      toast('Could not copy. Select the text and copy it yourself.');
    }
  };
  return (
    <Dialog
      title="Share your result"
      onClose={onClose}
      actions={
        <>
          <Button onClick={onClose}>Close</Button>
          <Button variant="primary" onClick={copy}>
            Copy text
          </Button>
        </>
      }
    >
      <div className="share-card">
        <b>{record.testName}</b>
        <p className="share-score num">
          {record.score} / {record.max}
        </p>
        <p className="small muted">{record.accuracy === null ? 'No questions attempted' : `${Math.round(record.accuracy * 100)}% accuracy`}</p>
        <p className="small">
          Invite code <b className="num">{code}</b>
        </p>
      </div>
      <p className="small muted">Demo invite code. In a real product the link would carry your own code.</p>
    </Dialog>
  );
}

export default function Result() {
  const { testId } = useParams();
  const [params] = useSearchParams();
  const attempts = useApp((s) => s.attempts);
  const name = useApp((s) => s.profile?.name ?? 'A student');
  const [sharing, setSharing] = useState(false);
  const id = params.get('a');
  const record = attempts.find((a) => a.id === id) ?? [...attempts].reverse().find((a) => a.testId === testId);

  if (!record) {
    return (
      <div className="result">
        <h1 className="page-title">No result yet</h1>
        <p className="muted">Take this test and your score will show here.</p>
        <Link to="/practice/tests" className="btn btn-primary">
          See tests
        </Link>
        <CreditFooter compact />
      </div>
    );
  }

  const attempted = record.questions.filter((q) => q.correct !== null).length;
  const seconds = record.sections.reduce((a, s) => a + s.seconds, 0);
  const hasMock = attempts.some((a) => a.type === 'mock');
  const review = `/progress/review/${record.id}`;

  return (
    <div className="result fade-in">
      <p className="small muted">{record.testName}</p>
      <h1 className="page-title">Your result</h1>
      <div className="card stack">
        <div className="stats">
          <Stat value={`${record.score} / ${record.max}`} label="Score" />
          <Stat value={record.accuracy === null ? 'None yet' : `${Math.round(record.accuracy * 100)}%`} label="Accuracy" />
          <Stat value={`${attempted} of ${record.questions.length}`} label="Attempted" />
          <Stat value={mSS(seconds)} label="Time spent" />
        </div>
        {hasMock && record.type === 'mock' && (
          <p className="small muted">
            Around {roughPercentile(record.score)} percentile. Rough estimate from a sample score table. Not a real percentile.
          </p>
        )}
      </div>
      <div className="card">
        <h2 className="card-title">By section</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Section</th>
                <th scope="col">Score</th>
                <th scope="col">Correct</th>
                <th scope="col">Wrong</th>
                <th scope="col">Skipped</th>
                <th scope="col">Time</th>
              </tr>
            </thead>
            <tbody>
              {record.sections.map((s) => (
                <tr key={s.section}>
                  <td>{s.section}</td>
                  <td className="num">
                    {s.score} / {s.max}
                  </td>
                  <td className="num">{s.correct}</td>
                  <td className="num">{s.wrong}</td>
                  <td className="num">{s.skipped}</td>
                  <td className="num">{mSS(s.seconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="row">
        <Button variant="primary" to={`${review}?tab=replay`}>
          10-minute replay
        </Button>
        <Button to={`${review}?tab=questions`}>Review answers</Button>
        <Button onClick={() => setSharing(true)}>Share result</Button>
        <Button variant="ghost" to="/home">
          Back to Home
        </Button>
      </div>
      {sharing && <ShareDialog record={record} name={name} onClose={() => setSharing(false)} />}
      <CreditFooter compact />
    </div>
  );
}
