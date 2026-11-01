import { Button } from '../components/ui';
import { COINS_PER_STEP, EARN_RULES, MAX_DISCOUNT_SHARE, RUPEES_PER_STEP } from '../logic/coins';
import { MIN_ATTEMPTS } from '../logic/analytics';
import { DEFAULT_RULE } from '../logic/streak';
import { useApp } from '../state/store';
import '../styles/settings.css';

const earnList = Object.values(EARN_RULES)
  .map((r) => `${r.label.toLowerCase()} ${r.coins} (up to ${r.dailyCap} a day)`)
  .join(', ');

export default function About() {
  const onboarded = useApp((s) => !!s.profile?.onboarded);
  return (
    <article className="about">
      <header className="stack">
        <h1 className="page-title">About this concept</h1>
        <p>
          Pace is a free CAT preparation website built as a redesign proposal. You can study on it for real: tests, lessons, notes, a planner and a record of how you're doing. It's still a concept, not a product.
        </p>
      </header>

      <section aria-labelledby="ab-proposed">
        <h2 className="section-title" id="ab-proposed">
          What's proposed
        </h2>
        <p>
          The proposal has two parts. The first is a simpler student experience for Prepito: fewer things on each screen, pages grouped by what you're doing, and only what matters today on Home. The pages follow the flow a Prepito student already knows, on purpose, so the redesign feels familiar.
        </p>
        <p>The second is a decision-practice layer, because in CAT the choice of what to attempt and when to leave often costs more marks than the working does:</p>
        <ul>
          <li>a set-pick drill, where you rank DILR sets before you solve any</li>
          <li>a soft time cap on each DILR set in practice, with a choice to make when you reach it</li>
          <li>a 10-minute replay of every attempt, showing where the time went</li>
          <li>a plan sized to the time you actually have today</li>
        </ul>
        <p>Around these sit the everyday features: daily sets you can customise, option percentages and community answers in review, vocabulary in context, a clearer streak, and coins that can become a discount.</p>
      </section>

      <section aria-labelledby="ab-formulas">
        <h2 className="section-title" id="ab-formulas">
          The formulas, one or two sentences each
        </h2>
        <dl>
          <div>
            <dt>Order agreement</dt>
            <dd>We compare every pair of sets in your order with the recommended order, and report how many pairs agree (Kendall's tau).</dd>
          </div>
          <div>
            <dt>Recommended order</dt>
            <dd>Sets sorted by estimated difficulty, easiest first. In the drill, ties go to the set with fewer clues, then to the one with more fixed-position clues. In tests, a set's expected minutes stand in for difficulty.</dd>
          </div>
          <div>
            <dt>Cap</dt>
            <dd>The set's expected minutes multiplied by your pace (the median of actual ÷ expected time, kept between 0.8 and 1.5), rounded to 10 seconds, with one extension of 2 minutes. Full mocks have no caps.</dd>
          </div>
          <div>
            <dt>Today's plan</dt>
            <dd>Your minutes today multiplied by the average share of planned minutes you completed in your last five sessions. That time is filled in order: planner blocks for today, redo items due, the set-pick drill, a daily set, a replay, the next lesson, then vocabulary, up to five items.</dd>
          </div>
          <div>
            <dt>Redo dates</dt>
            <dd>A redo comes back after 20% of the days left to your exam, at least one day. This is a rule of thumb from spacing research and is being tested; it is not a proven optimum.</dd>
          </div>
          <div>
            <dt>Topic labels</dt>
            <dd>
              A topic is only labelled once you have at least {MIN_ATTEMPTS} attempts in it; before that you see "Not enough data yet". From there, 70% accuracy or more is a Strength, below 50% Needs work, and anything between is Steady. Skipped questions aren't attempts.
            </dd>
          </div>
          <div>
            <dt>Coins</dt>
            <dd>
              You earn for real actions, with daily caps: {earnList}. In the sample Meridian Learning offer, {COINS_PER_STEP} coins = ₹{RUPEES_PER_STEP} off, up to {Math.round(MAX_DISCOUNT_SHARE * 100)}% of a course's price.
            </dd>
          </div>
          <div>
            <dt>Streak</dt>
            <dd>
              A day counts if you answer at least {DEFAULT_RULE.questions} question or watch {DEFAULT_RULE.lessonMinutes} minutes of lessons that day. You can change both numbers in Settings. A streak shield covers one missed day.
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="ab-honest">
        <h2 className="section-title" id="ab-honest">
          What's real and what isn't
        </h2>
        <ul>
          <li>Sample data: option percentages, attempt counts, community answers, discussion threads and any other numbers or posts from other students are illustrative. Each block carries a "Sample data" tag.</li>
          <li>Fictional alums: every "Sample alum" is made up, percentile included. No real student wrote any of this.</li>
          <li>Original content: all questions, passages, lessons and notes were written for this site. None are real CAT questions.</li>
          <li>Estimates: difficulty, caps and the rough percentile on a mock result are estimates and have not been checked against how long real students take. They are labelled where they appear.</li>
          <li>Meridian Learning courses, prices and coupons are illustrative. No coupon is real.</li>
          <li>No AI: there is no AI in the product. The recommendations come from the fixed rules on this page and from the solver below.</li>
        </ul>
      </section>

      <section aria-labelledby="ab-sets">
        <h2 className="section-title" id="ab-sets">
          How the questions are checked
        </h2>
        <p>
          Circular-seating sets are original puzzles with fictional names. A generator writes the clues, a brute-force solver confirms each set has exactly one arrangement, and any clue that isn't needed is removed. Difficulty is estimated from how much searching the solver needs. The newer DILR sets are checked by code in the same spirit, and QA answers are computed by code rather than typed by hand.
        </p>
      </section>

      <section aria-labelledby="ab-data">
        <h2 className="section-title" id="ab-data">
          Your data
        </h2>
        <p>There are no accounts and no server. Everything you do stays in this browser, in local storage, and no data leaves it. If you clear your browser's storage it's gone, so Settings has an export to a file, an import and a reset.</p>
      </section>

      <section aria-labelledby="ab-credits">
        <h2 className="section-title" id="ab-credits">
          Credits
        </h2>
        <p>Concept, design, code and content by Team Apex.</p>
        <p>Prepito (prepito.in) is the separate, independent CAT preparation platform this proposal is written for. Our team evaluated it. It hasn't reviewed this work, and none of its design, text, questions or code appear here.</p>
        <p>Set in Onest and Source Serif 4. Icons from Lucide.</p>
      </section>

      <div>
        {onboarded ? (
          <Button variant="primary" to="/home">
            Back to Home
          </Button>
        ) : (
          <Button variant="primary" to="/start">
            Start preparing
          </Button>
        )}
      </div>
    </article>
  );
}
