import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import { Btn, Eyebrow, Segments } from '../components/ui';
import { useStore } from '../state/store';
import { kendall, recommendedOrder, startCostMinutes } from '../logic/ranking';
import { reasonFor } from '../logic/reasons';

const ROW = 84;

export default function DrillResult() {
  const s = useStore();
  const nav = useNavigate();
  const [tip, setTip] = useState(false);
  if (!s.drill || s.drill.roundN !== s.round.n) return <Navigate to="/drill" replace />;

  const yours = s.drill.order.map((id) => s.getSet(id)!);
  const rec = recommendedOrder(yours);
  const recIds = rec.map((x) => x.id);
  const ag = kendall(s.drill.order, recIds);
  const cost = startCostMinutes(yours[0], rec[0]);
  const label = (id: string) => s.labelOf(id);
  const H = ROW * yours.length;

  return (
    <div className="result">
      <header>
        <Eyebrow>Round {s.round.n} · result</Eyebrow>
        {s.drill.auto && <p className="timeup-note" role="status">Time's up, we used your current order.</p>}
        <h1 className="display result-head">
          Your order agreed with the recommended order on {ag.concordant} of {ag.pairs} pairs of sets.
        </h1>
        <div className="method">
          <button type="button" className="link-btn" aria-expanded={tip} onClick={() => setTip((v) => !v)}>
            <Info size={16} strokeWidth={1.5} aria-hidden /> Method
          </button>
          {tip && (
            <p className="tip" role="note">
              Rank agreement is Kendall's tau: (agreeing pairs − disagreeing pairs) ÷ {ag.pairs}. Here it is <b className="tnum">{ag.tau.toFixed(2)}</b>, where 1 means the same order and −1 the reverse.
            </p>
          )}
        </div>
      </header>

      <section className="cols" aria-label="Your order next to the recommended order">
        <div className="col">
          <h2 className="col-h">Your order</h2>
          <ol>
            {yours.map((x, i) => (
              <li key={x.id} className={`rrow${recIds[i] === x.id ? ' right' : ''}`} style={{ height: ROW }}>
                <span className="rpos tnum">{i + 1}</span>
                <span className="rname">{label(x.id)}</span>
                <Segments minutes={x.expectedMinutes} lit={recIds[i] === x.id} />
                <span className="rmin tnum">≈ {x.expectedMinutes.toFixed(1)} min <em>(est.)</em></span>
              </li>
            ))}
          </ol>
        </div>
        <svg className="links" style={{ height: H }} viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" aria-hidden>
          {yours.map((x, i) => {
            const j = recIds.indexOf(x.id);
            const y1 = i * ROW + ROW / 2;
            const y2 = j * ROW + ROW / 2;
            return <path key={x.id} d={`M0 ${y1} C 50 ${y1}, 50 ${y2}, 100 ${y2}`} className={i === j ? 'l-same' : 'l-move'} vectorEffect="non-scaling-stroke" fill="none" />;
          })}
        </svg>
        <div className="col">
          <h2 className="col-h">Recommended order</h2>
          <ol>
            {rec.map((x, i) => (
              <li key={x.id} className="rrow rec" style={{ height: ROW }}>
                <span className="rpos tnum">{i + 1}</span>
                <span className="rname">{label(x.id)}</span>
                <Segments minutes={x.expectedMinutes} lit />
                <span className="rmin tnum">≈ {x.expectedMinutes.toFixed(1)} min <em>(est.)</em></span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="why-grid">
        <section aria-labelledby="why-h">
          <h2 id="why-h" className="h3">One reason per set</h2>
          <ul className="reasons">
            {rec.map((x) => (
              <li key={x.id}>
                <b>{label(x.id)}:</b> {reasonFor(x)}
              </li>
            ))}
          </ul>
        </section>
        <aside className="effect">
          {cost > 0 ? (
            <p>
              Starting with {label(yours[0].id)} instead of {label(rec[0].id)} would likely cost about <b className="tnum">{Math.round(cost)} minutes</b> (estimate).
            </p>
          ) : (
            <p>You'd start with the recommended set, {label(rec[0].id)}. No time lost on the first pick (estimate).</p>
          )}
        </aside>
      </div>

      <div className="actions">
        <Btn variant="primary" to={`/attempt/${rec[0].id}`}>
          Try the top set
        </Btn>
        {yours[0].id !== rec[0].id && <Btn to={`/attempt/${yours[0].id}`}>Try your first pick</Btn>}
        <Btn
          icon={false}
          onClick={() => {
            s.newRound();
            nav('/drill');
          }}
        >
          New round
        </Btn>
      </div>
      <p className="note-est">Recommended order uses an estimate of difficulty from our puzzle solver. It has not yet been checked against how long real students take.</p>
    </div>
  );
}
