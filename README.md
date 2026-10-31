# Pace: a decision-practice layer (concept demo)

A small static, clickable demo of three practice features for students preparing for the CAT: a **set-pick drill**, a **capped attempt with a 10-minute replay**, and **today's plan**, a session builder sized to the time the student has. There is no backend, no login and no real user data.

> Concept demo by Team Apex. Shows features proposed for Prepito (prepito.in), an independent CAT preparation platform. Not affiliated with or endorsed by Prepito. All content in this demo is original.

Practice sets are original circular-seating puzzles, generated and checked by our own brute-force solver. Difficulty numbers are estimates and have not been checked against real students.

## Run locally

Needs Node 18 or later.

```
npm ci
npm run dev        # http://localhost:5173
```

## Build, test, screenshots

```
npm run build        # tsc --noEmit && vite build, output in dist/
npx vite preview     # serve dist/ locally
npm test             # Vitest: solver, generator, ranking, cap, spacing, plan
npx playwright install chromium   # once
npm run build && npm run screenshots
```

Screenshots of every route at 1440x900 and 390x844 are written to `screenshots/`, using a fixed date of 2026-10-31 (29 days to CAT). Playwright and the tests are dev dependencies and do not run during `npm run build`.

## Deploy to Vercel

The project sits at the folder root, `vercel.json` is included, and the Vite preset is detected automatically.

**A. GitHub and the Vercel dashboard**

1. Create an empty GitHub repository.
2. `git remote add origin <your repo URL>`
3. `git push -u origin main`
4. In Vercel: Add New, Project, import the repo, leave the detected settings (build `npm run build`, output `dist`), then Deploy.

**B. Vercel CLI**

1. `npm i -g vercel`
2. Run `vercel` in this folder and accept the defaults.
3. `vercel --prod`

No environment variables are needed. Routing uses the URL hash, so direct links work on any static host.

## Formulas

- **Order agreement:** Kendall's tau over the 10 pairs of 5 sets, shown as "agreed on C of 10 pairs". Recommended order is ascending difficulty score; ties go to fewer clues, then more fixed-position clues.
- **Cap:** expected minutes x pace factor, where pace is the median of actual / expected minutes, clamped to 0.8 to 1.5 (1.0 with no history), rounded to 10 seconds. One extension of 2 minutes.
- **Redo date:** today + max(1, round(0.2 x days left to CAT)). A rule of thumb from spacing research that is still being tested.
- **Today's plan:** minutes available x mean completion rate of the last five sessions (each capped at 100%). Filled in order: drill (4), one capped set, replay (10), redo items due today, extra sets. Anything that doesn't fit is listed as dropped.
- **Topic labels:** need at least 5 attempts; otherwise "Not enough data yet".
- **Difficulty:** log of the solver's search nodes mapped linearly to 1 to 5 and to 5 to 12 expected minutes.

## Structure

- `src/logic/`: pure, unit-tested functions (solver, generator, ranking, cap, spacing, session, replay).
- `src/pages/`, `src/components/`, `src/state/`: the screens, shared UI and in-memory store.
- `src/landing/scene.ts`: the Three.js scene, loaded only on the landing route.
- `DESIGN.md`, `BUILD_SPEC.md`: the visual and functional specs. `DECISIONS.md`: every assumption. `WALKTHROUGH.md`: a 2-minute presenter script.
