# Build spec: "Pace" decision-practice layer (clickable concept demo)

Read this whole file before you write any code. It is self-contained: you do not need any other background.

## 0. How we will work

1. **Ask all your questions in one batch, at the start.** The person who launched you is available for about 5 minutes and will then leave. After that, do not stop to ask anything. Where something is unclear, pick the default this spec gives (section 13), write the choice in `DECISIONS.md`, and keep going.
2. Work autonomously until the definition of done (section 12) is met, including running the build, the tests and the screenshot script yourself.
3. Keep a short running log in `DECISIONS.md` (one line per decision or assumption).

## 1. What you are building

A small, static, clickable web demo of three practice features for students preparing for the CAT, an Indian management entrance exam. The demo shows how a *decision-practice layer* could sit on top of an existing free prep platform called **Prepito** (prepito.in). It is a concept for illustration only: there is no backend, no login and no real user data.

The three features target three habits that cost students marks under time pressure:

| Feature | The habit it trains | Screen |
|---|---|---|
| **Set-pick drill** | Choosing which logic puzzle "set" to start with, out of several | `/drill` |
| **Capped attempt + 10-minute replay** | Leaving a set that is going nowhere, then reviewing the same day without typing anything | `/attempt/:setId`, `/replay` |
| **Today's plan (session builder)** | Planning a study session that fits the time the student actually has | `/today` |

There is also a landing page at `/` that introduces the three features as a short scroll story. Its design is in `DESIGN.md` section 5.1.

**Visual design lives in `DESIGN.md`. Read it before building any screen. It replaces section 10 of this file.**

Background you need about the exam, nothing more: the CAT has a section called DILR (Data Interpretation and Logical Reasoning). It gives students about 5 "sets", each a puzzle with 4 to 6 questions, and only 40 minutes. Strong students scan the sets first and start with the one that gives the most marks per minute. Weak choices, such as starting with the hardest set or staying on a stuck set too long, lose a lot of time.

## 2. Attribution and originality rules (hard rules, do not break)

Prepito is a real, independent product owned by someone else. This demo must credit it and must not copy it.

- **Credit, every screen:** a slim footer on every page reads:
  *"Concept demo by Team Apex. Shows features proposed for Prepito (prepito.in), an independent CAT preparation platform. Not affiliated with or endorsed by Prepito. All content in this demo is original."*
- **An `/about` page** explains in plain words: what the demo is, that Prepito is a separate product the team evaluated, that the features shown are proposals, that the practice sets are original puzzles generated and checked by our own solver, and that difficulty numbers are estimates.
- **Do not copy Prepito's design or content.** No Prepito logo, wordmark, mascot or cat character. Don't reproduce its exact colours or layout. The palette in `DESIGN.md` is deliberately in the same family (plum-black, cream, gold) so the concept feels at home next to Prepito, but every value and layout is our own. No Prepito questions, passages, explanations, screenshots or layouts. Do not fetch anything from prepito.in. You have not been given Prepito screenshots on purpose.
- **Do not use real exam content.** No real CAT questions or passages. Use only the puzzles in `data/sample_sets.json` and puzzles your own generator makes.
- **Do not invent real people or real data.** The student is "Demo student". All names in puzzles are fictional (Asha, Bilal, Chetan, Divya, Esha, Farhan).
- **No external images or icon packs that need licences.** Simple inline SVG icons you draw yourself, or a permissively licensed icon set (for example Lucide, MIT) are fine.

## 3. Product story (the click path a judge will follow)

0. Lands on the **landing page** (`/`), scrolls through four short chapters and clicks **Start today's plan**.
1. Arrives at **Today's plan** (`/today`). Sees "29 days to CAT" (computed from today's date and the exam date), a box asking "How many minutes do you have today?", and a plan that resizes itself.
2. Clicks **Start set-pick drill**. Sees 5 set "previews" (not the full puzzles) and 4 minutes to rank them in the order they would attempt them.
3. Submits. Sees how their order compares with the recommended order, in plain words, with one reason per set.
4. Clicks **Try the top set**. Gets the full puzzle with a soft time cap. When the cap is reached, a dialog offers **Leave this set** or **Take 2 more minutes (once)**.
5. Finishes or leaves. Lands on the **10-minute replay**: where the time went, what to redo, and when.
6. Returns home. Today's plan now shows the redo items scheduled.

The whole path should take a first-time visitor under 6 minutes.

## 4. Tech stack and constraints

- **Vite + React + TypeScript**, React Router (hash routing so it works on any static host). No backend.
- **State:** in memory (React context). Optionally mirror to `localStorage`, but wrap every read and write in try/catch and make the app work fully if storage is unavailable.
- **Styling:** plain CSS modules or a single CSS file with custom properties. No heavy UI kit needed.
- **3D:** `three` (MIT) for the landing scene only, loaded with a dynamic import. No other 3D or animation framework is needed; CSS transitions handle the rest. Do not use ThreeUI or any paid component library.
- **Fonts:** Onest from Google Fonts (OFL).
- **Drag and drop:** use `@dnd-kit/sortable` (MIT) or implement simple up/down buttons. Keyboard reordering is required either way (section 10).
- **Testing:** Vitest for logic. Playwright for the screenshot script (section 12).
- **Output:** `npm run build` produces a static `dist/` folder. The project must deploy to **Vercel** with zero configuration changes by the person deploying it (see 4.1).
- Node 18 or later. Keep dependencies minimal.

### 4.1 Vercel deployment (required)

The person will deploy this themselves on Vercel, either by importing a GitHub repo or with the Vercel CLI. You do not deploy it and you do not need an account. Make it deploy cleanly on the first try:

- Build the app at the **root of the project folder** (put `package.json` here, next to this spec), not in a subfolder, so Vercel detects it without setting a root directory.
- Vercel must auto-detect the **Vite** framework preset: build command `npm run build`, output directory `dist`. Add a `vercel.json` that states these explicitly:
  ```json
  {
    "framework": "vite",
    "buildCommand": "npm run build",
    "outputDirectory": "dist",
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```
  The rewrite keeps direct links and refreshes working even if routing changes from hash to path routing later.
- Commit `package-lock.json`. Pin dependency versions (no `latest`). Add `"engines": { "node": ">=18" }` in `package.json`.
- The build must pass with **no TypeScript errors** (Vercel fails the deploy on a failed `npm run build`). `npm run build` should run `tsc --noEmit && vite build`, or equivalent.
- Playwright and test tools must be `devDependencies` and must **not** run during `npm run build`, so the Vercel build stays fast and doesn't try to download browsers.
- No environment variables, secrets or server functions are needed. Don't add any.
- Add a `.gitignore` for `node_modules` and `dist`. Keep `screenshots/` committed.
- Initialise a git repository in the folder on branch `main` and make one clean commit, so the person can push it to GitHub and import it into Vercel.
- Before finishing, prove it works: run a clean install and build (`rm -rf node_modules dist && npm ci && npm run build`), then `npx vite preview` and open every route in Playwright.
- In `README.md`, write the two deploy paths step by step:
  1. **GitHub + Vercel dashboard:** create an empty GitHub repo, `git remote add origin …`, `git push -u origin main`, then in Vercel: Add New → Project → Import the repo → leave the detected settings → Deploy.
  2. **Vercel CLI:** `npm i -g vercel`, run `vercel` in the folder (accept defaults), then `vercel --prod`.

## 5. Routes

| Route | Purpose |
|---|---|
| `/#/` | Landing page: four-chapter scroll story with a Three.js scene (DESIGN.md 5.1) |
| `/#/today` | Today's plan (session builder), countdown, week log, stat tiles |
| `/#/drill` | Set-pick drill |
| `/#/drill/result` | Drill result |
| `/#/attempt/:setId` | Capped attempt on one set |
| `/#/replay` | 10-minute replay (uses the latest attempt, or the pre-recorded sample) |
| `/#/about` | About this demo, credits, method notes |

App navigation (sidebar on desktop, bottom tab bar on mobile, see DESIGN.md 5.2): **Today · Set-pick drill · Replay · About**. The wordmark is **Pace** with the subtitle "decision practice · concept demo". The wordmark links back to the landing page.

## 6. Screen-by-screen specification

### 6.1 Today's plan (`/today`)

Top row:
- **Countdown chip:** "N days to CAT · 29 Nov 2026", N computed from the device date and `examDate` (minimum 0).
- **Greeting:** "Good to see you" (no name needed).

Main card, **"How much time do you have today?"**:
- A number input with quick chips: 30, 45, 60, 90 minutes. Default 60.
- Below it, the formula in plain words, live-updating:
  *"You finished about 79% of what you planned over your last 5 sessions, so we've planned 48 of your 60 minutes."*
- The plan list (auto-generated, not typed by the student), each row with a duration and a Start button:
  1. Set-pick drill: 4 min
  2. Capped set (the drill's top pick, or a medium set): cap from the formula in 7.3
  3. Replay: 10 min
  4. Redo items due today (from the spacing schedule in 7.5), each sized by its expected minutes
  5. If minutes remain, a second capped set; if the plan would overflow, drop the lowest-priority item and show "Dropped to fit your time: …"
- A small expandable **"How this plan is sized"** panel that shows the last 5 sessions as a tiny bar list (planned vs completed minutes) and the mean completion rate.

Side card, **"Topics"**: the four topics from `topicAttempts`. For any topic with fewer than 5 attempts, show the badge **"Not enough data yet"** instead of a strength or weakness label. Only topics with 5 or more attempts show accuracy. This rule is deliberate (see 7.6).

### 6.2 Set-pick drill (`/drill`)

Header: "Pick your order" with a **4:00 countdown** (visible, large enough to read at a glance). Under it, one line: "Rank these sets in the order you'd attempt them. You're judging from the preview only, as you would in the exam's first minutes."

Show **5 set preview cards**, drawn at random so that the round includes at least one "Easier" and one "Harder" set. A preview card shows only:
- Set code (for example "Set C")
- Family: "Circular seating, 6 people"
- Clue count and mix: for example "4 clues: 2 fixed positions, 1 adjacency, 1 negative"
- "3 questions"

Do **not** show the difficulty label, solver numbers or expected minutes on the preview. That would give the answer away.

Interaction:
- Drag to reorder, or use the up/down buttons on each card (keyboard accessible).
- **Submit order** button. If the timer runs out, submit automatically with the current order and show "Time's up, we used your current order."

### 6.3 Drill result (`/drill/result`)

- Headline in plain words, not a raw statistic: for example *"Your order agreed with the recommended order on 7 of 10 pairs of sets."* (pairs agreement from Kendall's tau, 7.1). Show tau itself only in a small "Method" tooltip.
- Two columns, **Your order** and **Recommended order**, with lines or arrows showing where each set moved.
- **One reason per set**, generated from its clue mix (7.2), for example: *"Set C: 3 clues, all fixed positions, quickest to lock down."* or *"Set A: 2 negative clues ('does not sit next to'), which leave many arrangements open."*
- Estimated time effect, labelled as an estimate: *"Starting with Set A instead of Set C would likely cost about 6 minutes (estimate)."* = expectedMinutes(your first) − expectedMinutes(recommended first), shown only if positive.
- Buttons: **Try the top set** (opens `/attempt/<recommended first>`), **Try your first pick**, **New round**.
- A note under the result, always visible: *"Recommended order uses an estimate of difficulty from our puzzle solver. It has not yet been checked against how long real students take."*

### 6.4 Capped attempt (`/attempt/:setId`)

Layout: puzzle on the left (6 names, numbered clues), questions on the right (3 multiple-choice questions, 4 options each). On narrow screens, stack vertically.

- **Time display:** "Time on this set 03:12 · Cap 07:40". The cap is from 7.3.
- A small "scratch" area is nice to have: a 6-seat circle drawing where the student can drag name chips into seats. It is optional. Do not let it auto-solve.
- Students can mark which clue they're on: each clue has a small "I'm on this clue" toggle. The latest toggled clue when time stops is recorded as `stalledOnClue`. If they never toggle, leave it null.
- **At the cap,** a dialog: *"You've reached your cap for this set (7:40). In the exam, this is where a set starts costing you other marks."* Two buttons: **Leave this set** and **Take 2 more minutes (once)**. If extended and the new limit is reached, the dialog shows only **Leave this set**.
- **Finish** button at any time. Answers are checked against `answer` in the data.
- After finishing or leaving, record the attempt (7.4) and go to `/replay`.

### 6.5 Replay (`/replay`)

Title: "Your 10-minute replay". Uses the latest attempt(s) from this session. If there are none, use `sampleReplay` from `demo_student.json` and show a small label "Sample replay. Do a drill to see your own."

Sections, top to bottom:
1. **Where your time went:** a horizontal bar per set attempted (minutes spent vs cap), marked when the cap was hit or extended. Times and plain words, not a score first.
2. **The start you chose vs the recommended start:** one sentence, for example *"You started with Set A. Set C was the recommended start; it would likely have saved about 6 minutes (estimate)."*
3. **Where you stalled:** if `stalledOnClue` is set, *"You were on clue 3 when progress stopped."* Show that clue's text.
4. **Redo list:** exactly 3 items, chosen as the items with the most time lost (sets where the cap was hit first, then wrong answers, then slowest correct answers). Each shows a **scheduled date** from the spacing rule in 7.5: *"Redo Set A on 4 Nov (5 days from now)."*
5. **Add to today's plan** button, which puts the items due today on the home plan.

The replay must need **zero typing or tagging** from the student. Everything comes from the attempt log.

### 6.6 About (`/about`)

Short plain-language page with:
- What this is (a concept demo of three proposed features for Prepito).
- Credit and disclaimer (the footer text, in full).
- How the practice sets are made: a generator writes original circular-seating puzzles and a brute-force solver checks that each has exactly one arrangement. Difficulty is estimated from how much searching the solver needs. These estimates have not been checked against real students yet.
- The formulas from section 7, written as one sentence each.
- "No data leaves your browser. Nothing is stored on a server."

## 7. Logic and formulas

Put all of this in `src/logic/` as pure, unit-tested functions.

### 7.1 Ranking agreement (Kendall's tau)

For the student's order and the recommended order of the same 5 sets, count concordant and discordant pairs over all 10 pairs. `tau = (C − D) / 10`. Show the student "agreed on C of 10 pairs". Recommended order = ascending `difficultyScore`; ties broken by fewer clues, then by more "fixed" clues.

### 7.2 Reason text per set

Rule-based, from `clueTypes` and clue count:
- Mostly fixed clues (fixed ≥ clues − 1): "N clues, mostly fixed positions: quickest to lock down."
- Any negative clues: "M negative clue(s) ('does not sit…'), which leave more arrangements open."
- Adjacency-heavy (adjacency ≥ 2): "Several 'sits next to' clues: each allows two placements, so expect more trial and error."
- Otherwise: "Mixed clues: middle of the pack."
Append the label: "(estimated: Easier / Medium / Harder)".

### 7.3 Time cap

`paceFactor = median(actualMinutes / expectedMinutes)` over `paceHistory` (and over the student's own attempts in this session as they are added). Clamp between 0.8 and 1.5. Default 1.0 if no history.

`cap = expectedMinutes × paceFactor`, rounded to the nearest 10 seconds. One extension of +2 minutes is allowed.

### 7.4 Attempt log (event schema)

```ts
type Attempt = {
  setId: string;
  startedAt: number;          // ms
  endedAt: number;            // ms
  capMinutes: number;
  hitCap: boolean;
  extended: boolean;
  left: boolean;              // true if the student chose "Leave this set"
  stalledOnClue: number | null;
  questions: { chosen: string | null; correct: boolean | null; seconds: number }[];
};
```

Track seconds per question as time spent while that question was the most recently focused or answered one. A simple approximation is fine. Document it in `DECISIONS.md`.

### 7.5 Spacing schedule for redo items

`daysLeft = max(0, examDate − today)` in days. `gap = max(1, round(0.2 × daysLeft))`. Redo date = today + gap. With 29 days left the gap is 6 days; with 7 or fewer days left it is 1 day. In the About page, say plainly that this is a rule of thumb from spacing research and is being tested, not a proven optimum.

### 7.6 "Not enough data yet" rule

Any per-topic label (strength, weakness, accuracy colour) needs **at least 5 attempts**. Below that, show "Not enough data yet". Apply this everywhere in the demo so no two screens ever disagree.

### 7.7 Session builder

`completionRate = mean(completedMinutes / plannedMinutes)` over `lastFiveSessions` (cap each ratio at 1.0). `plannedLoad = round(window × completionRate)`. Fill the plan in this priority order: set-pick drill (4), one capped set (its cap), replay (10), redo items due today (their expected minutes), then extra capped sets. Never exceed `plannedLoad`. Anything that doesn't fit goes in "Dropped to fit your time".

## 8. Data files (already provided)

- `data/sample_sets.json`: 15 original circular-seating sets, 5 per difficulty label. Each has `id`, `people`, `clues` (strings), `clueTypes`, `solutionClockwiseFrom`, 3 `questions` (`prompt`, 4 `options`, `answer`), `solverNodes`, `difficultyScore` (1 to 5), `expectedMinutes`, `difficultyLabel`. All 15 have been independently verified to have exactly one arrangement (with Asha fixed in the first seat to remove rotations) and correct answers.
- `data/demo_student.json`: fictional student profile, last 5 sessions, pace history, topic attempt counts, and a pre-recorded sample replay.

Copy both into `src/data/` and import them. Do not change the puzzle content. If you find an error, log it in `DECISIONS.md` and exclude that set rather than editing it.

## 9. Generator and solver (for the "New round" button)

Implement `src/logic/seating.ts`:
- `solve(clues): Arrangement[]` enumerates all 120 arrangements of 6 people around a circle with the first person fixed in seat 0, and returns those satisfying every clue.
- Clue kinds: `cw` (B sits immediately / two seats clockwise of A), `opp` (directly opposite), `adj` (next to), `nadj` (does not sit next to), `nopp` (does not sit opposite). Clockwise distance on 6 seats; opposite = distance 3.
- `generate(style)`: pick a random arrangement, take its true clues weighted by style (easier: mostly `cw`/`opp`; harder: more `adj`/`nadj`/`nopp`), add clues until `solve` returns exactly 1, then remove any clue whose removal keeps the solution unique. Keep sets with 3 to 7 clues.
- `searchNodes(clues)`: count backtracking nodes when placing people one by one and rejecting as soon as a fully assigned clue fails. `difficultyScore` and `expectedMinutes` map log(nodes) linearly onto 1 to 5 and 5 to 12 minutes, using the min and max of the provided 15 sets as anchors.
- Generate 3 questions per set from the solution: who sits opposite X; who sits immediately clockwise of X; who sits between A and B going clockwise from A (where B is two seats clockwise of A). Options are the correct answer plus 3 other names, excluding names that appear in the question.

**Unit tests (required):**
- Every set in `sample_sets.json` returns exactly one solution and it matches `solutionClockwiseFrom`.
- Every question's `answer` is correct for the solution, and appears once in `options`.
- 200 generated sets each have exactly one solution, 3 to 7 clues, and valid questions.
- Kendall's tau: identical orders give 1, reversed give −1, a known example gives the expected value.
- Cap, spacing and session-builder formulas, including edge cases (no history, 0 days left, window smaller than the drill).

## 10. Visual design: REPLACED BY `DESIGN.md`

Ignore the rest of this section where it conflicts with `DESIGN.md` (the site is dark only, palette and type are defined there). The old notes below remain only as background.

### 10 (old notes)

- Calm, light, study-tool feel. White and very light grey surfaces, dark ink text, **one teal accent** (`#0E7C86`) and **navy** (`#1F3A5F`) for headings. Status colours: amber `#B45309` for "cap reached", green `#047857` for correct, red `#B42318` for wrong. Do not use plum, maroon or cream.
- Typography: the system font stack, or "IBM Plex Sans" from Google Fonts. Body 15 to 16 px, generous line height.
- Rounded cards (8 px radius), thin borders, no heavy shadows, no gradients, no emoji, no mascots.
- Timers are large, tabular numerals, and change colour only near the cap (last 60 seconds amber).
- Support dark mode with the `prefers-color-scheme` media query, same tokens redefined.
- Every page shows the credit footer (section 2).

## 11. Copy and tone

- Plain, short sentences. Say what happened and what to do next.
- Label estimates as estimates every time ("about 6 minutes (estimate)").
- Never claim the feature improves scores. Say what it does.
- No hype words ("revolutionary", "seamless", "AI-powered"). There is no AI in this demo; don't imply there is.
- Use "set" for a DILR puzzle and "cap" for the time limit. Use the same word for the same thing on every screen.

## 10a. Accessibility and responsive behaviour

- Everything reachable and operable by keyboard, including reordering sets (up/down buttons or arrow keys on a focused card) and the cap dialog (focus trapped, Escape does not dismiss without a choice).
- Visible focus rings. Colour is never the only signal (add text or icons).
- Works at 390 px wide (phone) and 1440 px (laptop) without horizontal scrolling.
- `aria-live` announcement when the timer hits the cap.

## 12. Definition of done (check all before you stop)

1. `npm install`, `npm run test` and `npm run build` all succeed with no errors.
2. All routes work from the built `dist/` served statically (`npx vite preview` is fine).
3. The full click path in section 3 works end to end, and the replay updates after a real attempt.
4. **Screenshots:** a script `npm run screenshots` uses Playwright to capture every route at 1440×900 and 390×844 into `screenshots/`, including: the drill with cards visible, the drill result, the cap dialog open, the replay with real attempt data, and home with redo items added. Use a fixed date (2026-10-31) for screenshots so the countdown reads 29 days.
5. Open the screenshots yourself and fix anything clipped, overlapping or unreadable. Re-run until clean.
6. `README.md`: what it is, the credit and disclaimer, how to run, how to build, the Vercel deploy steps from 4.1, and the formulas.
6a. Vercel readiness from 4.1 is met: `vercel.json` present, clean `npm ci && npm run build` passes, tests and Playwright are not part of the build, git repo initialised with one commit on `main`.
7. `WALKTHROUGH.md`: a 2-minute presenter script following section 3, with what to click and one sentence to say on each screen.
8. `DECISIONS.md`: every assumption and default you chose.
9. No content copied from Prepito or from any real exam. Credit footer on every page.

## 13. Defaults (use these if nobody answers your questions)

| Question | Default |
|---|---|
| Framework | Vite + React + TypeScript |
| Deploy now? | No. Make it Vercel-ready (4.1); the person deploys it themselves. |
| Git branch name | `main` |
| Theme | Dark only, tokens from DESIGN.md |
| Landing 3D | Three.js, with the static fallback from DESIGN.md 5.1 |
| Images | None. Everything code-drawn. |
| Product name | "Pace" (subtitle "decision practice · concept demo") |
| Exam date | 29 Nov 2026 |
| Today's date | Device date; fixed 2026-10-31 for screenshots |
| Puzzle family | Circular seating only |
| Drill timer | 4 minutes |
| Extension | One, +2 minutes |
| Storage | In memory, optional localStorage mirror with try/catch |
| Analytics / tracking | None |
| Sound | None |

## 14. Out of scope

Login, backend, real payments, AI chat, video lessons, real CAT content, other puzzle families, community features, leaderboards, streaks or badges.

## 15. Nice to have, only after section 12 is complete

1. **Mistake → lesson moment:** on the replay, a wrong answer shows a card "Jump to the concept: 'Reading opposite-seat clues', 2 min (sample)", which opens a short original text explainer (no video).
2. **Share card with an invite code:** a "Share your week" card whose caption includes a demo invite code (for example `PACE-DEMO-7Q2K`), with a note that in the real product the link would carry the sharer's activation code.
3. A second puzzle family (linear seating) using the same solver approach.
