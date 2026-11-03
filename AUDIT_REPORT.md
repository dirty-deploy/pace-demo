# Pace pre-finale audit report

**Summary:** 69 routes checked (190 runs: fresh and demo profiles, 1440x900 and 390x844), 14 flows checked. 12 issues found: 8 fixed (the 6 known ones plus 2 found by the audit), 4 left open (1 demo-breaking only for timing, with a workaround; 1 visible on mobile; 2 minor).

How it was run: `npm run build`, `npx vite preview --port 4173`, `node scripts/audit.mjs` (Playwright, Chromium). The browser clock is pinned to **2026-11-04 09:00** with Playwright's clock emulation (the app has no date hook and was not changed for this). Final state: `npm ci`, `npm run test` (935 tests, including the new `tests/datacheck.test.ts`), `npm run build` and the existing `npm run e2e` (10 tests) all pass.

## Routes

Every route rendered, with no uncaught page errors, no `console.error`, no failed requests or 404s, no horizontal overflow at either width, the credit present, no forbidden text ("TODO", "lorem", "undefined", "NaN", "[object Object]", "coming soon", "null"), no `href="#"`, no links to routes outside the router, no empty or overlapping cards and no cut-off buttons or headings. "Sample data" tags were present on Notes, Community and threads (the review page's option bars and Community tab are checked in the demo flow).

Notes column: "fresh profile → /start" means the page asks a new visitor to set up first (by design). "demo only" means the route was found by following links in the demo profile. "390: credit in palette sheet" is open issue 2. Dynamic routes: up to 3 of each kind were followed (lessons, notes, threads, reviews, tests, redo items).

| Route | Renders | Console/page errors | Overflow 1440 | Overflow 390 | Notes |
|---|---|---|---|---|---|
| `/` | yes | none | no | no |  |
| `/start` | yes | none | no | no |  |
| `/about` | yes | none | no | no |  |
| `/home` | yes | none | no | no | fresh profile → /start |
| `/practice/daily` | yes | none | no | no | fresh profile → /start |
| `/practice/tests` | yes | none | no | no | fresh profile → /start |
| `/practice/tests?tab=sectional` | yes | none | no | no | fresh profile → /start |
| `/practice/tests?tab=topic` | yes | none | no | no | fresh profile → /start |
| `/practice/drill` | yes | none | no | no | fresh profile → /start |
| `/learn/lessons` | yes | none | no | no | fresh profile → /start |
| `/learn/notes` | yes | none | no | no | fresh profile → /start |
| `/learn/vocab` | yes | none | no | no | fresh profile → /start |
| `/progress/review` | yes | none | no | no | fresh profile → /start |
| `/progress/analytics` | yes | none | no | no | fresh profile → /start |
| `/progress/planner` | yes | none | no | no | fresh profile → /start |
| `/progress/streak` | yes | none | no | no | fresh profile → /start |
| `/community` | yes | none | no | no | fresh profile → /start |
| `/rewards` | yes | none | no | no | fresh profile → /start |
| `/settings` | yes | none | no | no | fresh profile → /start |
| `/more` | yes | none | no | no | fresh profile → /start |
| `/test/mock-1` | yes | none | no | no |  |
| `/test/mock-2` | yes | none | no | no |  |
| `/test/sec-varc-1` | yes | none | no | no | 390: credit in palette sheet |
| `/test/sec-dilr-1` | yes | none | no | no |  |
| `/test/sec-qa-1` | yes | none | no | no |  |
| `/test/mock-1/result` | yes | none | no | no |  |
| `/redo/demo-sd1-S15` | yes | none | no | no | demo → /test/redo-demo-sd1-S15; 390: credit in palette sheet; demo only (found by crawl) |
| `/redo/demo-sd1-T01` | yes | none | no | no | demo → /test/redo-demo-sd1-T01; 390: credit in palette sheet; demo only (found by crawl) |
| `/progress/review/demo-mock1` | yes | none | no | no | demo only (found by crawl) |
| `/test/sec-varc-2` | yes | none | no | no | demo only (found by crawl) |
| `/test/sec-varc-3` | yes | none | no | no | demo only (found by crawl) |
| `/progress/review/demo-sd1` | yes | none | no | no | demo only (found by crawl) |
| `/test/sec-dilr-2` | yes | none | no | no | demo only (found by crawl) |
| `/test/sec-dilr-3` | yes | none | no | no | demo only (found by crawl) |
| `/progress/review/demo-sq1` | yes | none | no | no | demo only (found by crawl) |
| `/test/sec-qa-2` | yes | none | no | no | demo only (found by crawl) |
| `/test/sec-qa-3` | yes | none | no | no | demo only (found by crawl) |
| `/test/topic-rc` | yes | none | no | no | demo only (found by crawl) |
| `/test/topic-pj` | yes | none | no | no | demo only (found by crawl) |
| `/test/topic-ps` | yes | none | no | no | demo only (found by crawl) |
| `/test/topic-os` | yes | none | no | no | demo only (found by crawl) |
| `/test/topic-seating` | yes | none | no | no | demo only (found by crawl) |
| `/test/topic-linear` | yes | none | no | no | demo only (found by crawl) |
| `/test/topic-di` | yes | none | no | no | demo only (found by crawl) |
| `/test/topic-schedule` | yes | none | no | no | demo only (found by crawl) |
| `/test/topic-profit` | yes | none | no | no | demo only (found by crawl) |
| `/test/topic-time-work` | yes | none | no | no | demo only (found by crawl) |
| `/test/topic-tsd` | yes | none | no | no | demo only (found by crawl) |
| `/test/topic-ratio` | yes | none | no | no | demo only (found by crawl) |
| `/test/topic-interest` | yes | none | no | no | demo only (found by crawl) |
| `/test/topic-equations` | yes | none | no | no | demo only (found by crawl) |
| `/test/topic-functions` | yes | none | no | no | demo only (found by crawl) |
| `/test/topic-geometry` | yes | none | no | no | demo only (found by crawl) |
| `/test/topic-numbers` | yes | none | no | no | demo only (found by crawl) |
| `/test/topic-modern` | yes | none | no | no | demo only (found by crawl) |
| `/learn/lessons/rc-inference` | yes | none | no | no | demo only (found by crawl) |
| `/learn/lessons/pj-opening-pairs` | yes | none | no | no | demo only (found by crawl) |
| `/learn/lessons/dilr-set-choice` | yes | none | no | no | demo only (found by crawl) |
| `/learn/notes?note=dilr-first-four-minutes` | yes | none | no | no | demo only (found by crawl) |
| `/learn/notes?note=dilr-seating-setup` | yes | none | no | no | demo only (found by crawl) |
| `/learn/notes?note=dilr-reading-tables` | yes | none | no | no | demo only (found by crawl) |
| `/community/th-leave-set` | yes | none | no | no | demo only (found by crawl) |
| `/community/th-final-month` | yes | none | no | no | demo only (found by crawl) |
| `/community/th-rc-third` | yes | none | no | no | demo only (found by crawl) |
| `/community/th-mock-swing` | yes | none | no | no | demo only (found by crawl) |
| `/community/th-working` | yes | none | no | no | demo only (found by crawl) |
| `/community/th-fractions` | yes | none | no | no | demo only (found by crawl) |
| `/community/th-pj-pairs` | yes | none | no | no | demo only (found by crawl) |
| `/community/th-tables` | yes | none | no | no | demo only (found by crawl) |

## Flows (section 4)

| # | Flow | Result | What happened | Fixed? |
|---|---|---|---|---|
| 1 | Onboarding (fresh), 1440 and 390 | Works | All steps to Home. Back keeps the name. Skip moves one step at a time (4 clicks), then lands on Home | No change needed |
| 2 | Demo path, 1440 and 390 | Works | Drill timer 04:00 → 03:58; lock in shows the comparison; cap dialog at the cap (cap 5:40 to 7:40); "Take 2 more minutes" works once, then "Your extra time is used" with no second offer; Leave opens this attempt's replay | Yes: Leave used to stay in the test with a "No sets left" toast |
| 3 | Daily set | Works | RC, 5 questions, 10 min, Match my level; saved as preset "Audit RC"; started, answered 2, submitted, result, review | No change needed |
| 4 | Full mock | Works | VARC first; timer counts; Next section disabled and no DILR palette early; palette shows Answered and marked / Not answered / Not visited in 3 distinct colours; QA calculator 12×3 = 36; submit, result, replay, review | No change needed |
| 5 | Scoring | Works | QA sectional 1: right, wrong MCQ, wrong TITA, right, skip, right TITA, wrong TITA, wrong MCQ = 3−1+0+3+3+0−1 = 7; result shows 7 / 66 | No change needed |
| 6 | Autosave and resume | Works | Answer, reload: back on question 2 with the answer kept; Home shows "Resume" | No change needed |
| 7 | Review details | Works | Option shares sum to 100; tick on the correct option; "You" tag; Sample data tag; posted community answer appears; word card "exorbitant" added and found in Vocabulary | Yes: explanation lines (known issue 4) and sideways scroll (known issue 1) |
| 8 | Lessons | Works | Play advances the position, pause holds it; Home/End scrub; speed control; clicking a transcript line jumps; practice MCQ shows right/wrong. Speed change was clicked but its effect was not measured | No change needed |
| 9 | Planner | Works | "DILR sets 7pm 45m" → chip "Today 7 pm · 45 min", block Wed 4 Nov 7 pm; "RC tomorrow 8:30 30m" → chip "Tomorrow 8:30 am · 30 min", block Thu 5 Nov; empty-slot click adds a block; template chip adds a block; Fill my week 11 → 18 blocks; block marked done; a missed block (added for yesterday, since the demo has none at 09:00) moved to tomorrow | No change needed |
| 10 | Streak counts today | Works | One answered question makes today "Done"; month total includes today | Yes: month total (known issue 5), plus rounding follow-up |
| 11 | Rewards | Works | Shield: 165 → 125 coins; 100 coins = ₹50 off; coupon generated, balance and history update. The 30% cap could not be reached with the demo balance in the browser; it is covered by `tests/v2logic.test.ts:176` | No change needed |
| 12 | Analytics | Works | 22 topic rows, 15 under 5 attempts, all "Not enough data yet" with "–" accuracy; Home, Review, Lessons and Daily set name no thin topic as weak or strong | No change needed |
| 13 | Settings | Works | Exam date 30 Nov → Home says 26 days; weekday minutes saved after reload; Dark/Light/System switch the theme; export downloads JSON, import back works; Reset demo returns to the landing page. System theme was checked with a light OS setting only | No change needed |
| 14 | Data checks | Works | Existing tests pass. New `tests/datacheck.test.ts`: every MCQ has one correct index inside unique options, every TITA answer is a number, every test question exists once, mocks and sectionals have 24 VARC / 22 DILR / 22 QA. 0 failing ids | Yes: DILR sectionals were 23 and 24 (known issue 3) |

Not tested: clicking every non-link button on every page (every link target was checked instead; destructive buttons were skipped). The streak's "5 lesson minutes" path (the question path was tested).

## Fixes made

| Issue | File(s) | What changed |
|---|---|---|
| 1. Review scrolls sideways (1465 px at 1440, 495 px at 390) | `src/styles/base.css` | The cause was the hidden "Sample data" tooltip (240 px, left-anchored) still taking layout space. Hidden tips now use `display: none` and are capped at the viewport width |
| 2. Percentile too low | `src/logic/testRules.ts`, `tests/v2logic.test.ts` | New sample table; one decimal. 93/204 now reads "Around 99.4 percentile"; the "rough estimate, not a real percentile" label is unchanged |
| 3. DILR sectionals 23/24 questions | `src/content/tests.ts` | Whole sets swapped so each sectional has 22 ("Question 1 of 22"); set caps unaffected |
| 4. Fragmentary explanations | `src/content/varc/passages.ts`, `src/content/varc/verbal.ts`, `src/pages/ReviewDetail.tsx` | 32 VARC explanations rewritten: "B is right: ...", "C goes too far: ...". Keys unchanged. The review also split lines at every full stop, which broke QA and DILR explanations at decimals ("2.4") and factorials ("5!"); it now splits only at sentence ends |
| 5. Streak month total ignores today | `src/logic/streak.ts`, `src/state/testEngine.ts`, `src/pages/Streak.tsx`, `tests/v2logic.test.ts` | The month total uses the same whole minutes as the day lines (lesson time counts; a short test no longer rounds to 0) |
| 6. Credit inside the exam screen | `src/pages/TestWindow.tsx` | Moved from under the options to the bottom of the palette column, in small text |
| Found: Leave did not go to the replay | `src/pages/TestWindow.tsx` | Leaving the only set of a one-set attempt (drill, redo) finishes it and opens its replay |
| Found: explanation lines split at decimals | `src/pages/ReviewDetail.tsx` | See issue 4 |

Tooling added: `scripts/audit.mjs`, `tests/datacheck.test.ts`, and `ONLY=` in `scripts/screenshots.mjs` for partial re-capture. Screenshots 06 to 11 and 19 were re-captured.

## Open issues

| Issue | Where | Severity | Suggested fix |
|---|---|---|---|
| The set cap takes 5:40 to 7:40 of real time, too long to wait for in a 7-minute demo | Drill → "Try the recommended first set" | Demo-breaking (timing only; workaround in DEMO_CHECK.md) | A presenter-only switch (for example `?present` in the URL) that starts the set clock 15 s before its cap. About 15 lines in `TestWindow.tsx`. Not added because the brief says no new features |
| On phones the test window's credit shows only inside the palette sheet (it was moved out of the question column) | `/test/*` at 390 px | Visible (mobile only) | Add a one-line compact credit under the bottom bar or in the header on mobile |
| Vocabulary practice and lesson practice questions count for the streak but add no study minutes, so a questions-only day shows "0 min studied" | Streak | Minor | Log a small time per practice session |
| Hidden tooltips no longer fade in; an open tooltip on a tag near the right edge can still poke past the screen while hovered | "Sample data" tags | Minor | Anchor the tip to the right when the tag is in the right half |

## Answer keys

No answer key looks wrong. While rewriting the 32 VARC explanations, every ordinal reference in the old text ("That is the second option", "The third title") matched the stored key, and each described distractor ("the scornful option") matched a wrong option. No key was changed.
