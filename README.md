# Pace

A free CAT preparation website. Plan your day, practise in an exam-style test window, and learn from every attempt. There is no login and no backend. Your work stays in your browser.

> Pace is a concept redesign by Team Apex, showing features proposed for Prepito (prepito.in), an independent CAT preparation platform. Not affiliated with or endorsed by Prepito. All questions, lessons and notes on this site are original.

## Features

- **Home:** today's plan, streak and the one thing to continue.
- **Practice:** a customisable daily set, 2 full mocks, 9 sectionals, topic tests and a DILR set-pick drill.
- **Test window:** section timers, question palette, locked sections in mocks, calculator, autosave and resume.
- **Review:** a 10-minute replay of any attempt, plus every question with option percentages, an explanation, community answers and vocabulary in context.
- **Learn:** 6 slide lessons with synced transcripts and practice, alum notes, and vocabulary practice.
- **Progress:** planner with quick-add, analytics, and a streak calendar.
- **Community and rewards:** discussions, coins, and a Meridian Learning discount proposal.

## Honesty notes

- Option percentages, community answers, discussion threads and alum notes are sample data. Each block carries a "Sample data" tag, and alum authors are shown as "Sample alum".
- Percentile estimates come from a sample table and say so.
- Difficulty labels and expected times are estimates from solver effort or step counts, not from timed students.
- There is no AI in the product. Recommendations come from fixed rules.
- All questions are original. QA answer keys are recomputed by tests, and the VARC keys have a logged second review in `CONTENT_QA.md`.

## Run locally

Needs Node 18 or later.

```
npm ci
npm run dev        # http://localhost:5173
```

## Test and build

```
npm test             # Vitest: logic, solvers and all content
npm run build        # tsc --noEmit && vite build, output in dist/
npx playwright install chromium   # once
npm run e2e          # the main student story, against the built site
npm run screenshots  # needs a build first; writes screenshots/
```

Screenshots use the demo profile and a fixed date of 2026-11-01, at 1440x900 and 390x844, with dark versions of Home, the test window and review. Playwright does not run during `npm run build`.

## Deploy to Vercel

The Vercel set-up is unchanged from v1. `vercel.json` sets the Vite framework, `npm run build` and `dist`. There are no environment variables.

- From a linked repo, pushing to `main` deploys, if the project is connected to Git.
- From this folder, run `vercel --prod`.

## Docs

- `V2_SPEC.md` and `DESIGN_V2.md`: what was built and how it should look.
- `DECISIONS.md`: every choice made along the way.
- `CHANGELOG.md`: v1 to v2.
- `CONTENT_QA.md`: the VARC answer-key review.
- `WALKTHROUGH.md`: a 3-minute presenter script.
- `src/data/README.md`: content files and the saved-data schema.
