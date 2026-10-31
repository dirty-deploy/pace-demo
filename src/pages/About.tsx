import { Eyebrow, CREDIT } from '../components/ui';

export default function About() {
  return (
    <article className="about">
      <Eyebrow>About this demo</Eyebrow>
      <h1 className="display">A concept, not a product.</h1>

      <section>
        <h2 className="h3">What this is</h2>
        <p>
          Pace is a small clickable demo of three practice features: a set-pick drill, a capped attempt with a 10-minute replay, and a plan that resizes itself to the time you have. It shows how a decision-practice layer could sit on top of an existing free CAT preparation platform, Prepito (prepito.in).
        </p>
        <p>
          Prepito is a separate product that our team evaluated. The features shown here are proposals. Nothing on this site is Prepito's design, content or code, and it is not affiliated with or endorsed by Prepito.
        </p>
        <p className="credit-box">{CREDIT}</p>
      </section>

      <section>
        <h2 className="h3">How the practice sets are made</h2>
        <p>
          Every set is an original circular-seating puzzle with fictional names. A generator writes the clues, and a brute-force solver checks all 120 possible arrangements to confirm that each set has exactly one. Then it removes any clue that isn't needed. The "New round" button runs the same generator in your browser.
        </p>
        <p>
          Difficulty is estimated from how much searching the solver needs: the more placements it tries before it can rule out the wrong arrangements, the harder we call the set. These estimates have not been checked against how long real students take.
        </p>
      </section>

      <section>
        <h2 className="h3">The formulas, one sentence each</h2>
        <dl className="formulas">
          <dt>Order agreement</dt>
          <dd>We compare every pair of sets in your order with the recommended order, and report how many of the 10 pairs agree (Kendall's tau).</dd>
          <dt>Recommended order</dt>
          <dd>Sets sorted by estimated difficulty, easiest first; ties go to the set with fewer clues, then to the one with more fixed-position clues.</dd>
          <dt>Cap</dt>
          <dd>The set's expected minutes multiplied by your pace (the median of actual ÷ expected time, kept between 0.8 and 1.5), rounded to 10 seconds, with one extension of 2 minutes.</dd>
          <dt>Today's plan</dt>
          <dd>Your minutes today multiplied by the average share of planned minutes you completed in your last five sessions, filled in order: drill, one capped set, replay, redo items, then extra sets.</dd>
          <dt>Redo dates</dt>
          <dd>A redo comes back after 20% of the days left to CAT, at least one day. This is a rule of thumb from spacing research and is being tested; it is not a proven optimum.</dd>
          <dt>Topic labels</dt>
          <dd>A topic is only labelled once you have at least 5 attempts in it; before that you see "Not enough data yet".</dd>
        </dl>
      </section>

      <section>
        <h2 className="h3">Your data</h2>
        <p>No data leaves your browser. Nothing is stored on a server. Reloading the page starts the demo again. The student, sessions and pace history shown before you try anything are fictional sample data.</p>
        <p>There is no AI in this demo. The recommendations come from fixed rules and the solver described above.</p>
      </section>
    </article>
  );
}
