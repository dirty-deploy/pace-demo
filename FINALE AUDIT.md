# Pace: pre-finale audit and fixes

Read this whole file first. You are working in the Pace repository (Vite + React + TypeScript, hash routing, deployed on Vercel). The site will be demoed live to judges in a 7 minute presentation. Your job has three parts:

1. Fix six known issues (section 3).
2. Go through the entire website by yourself, find what is broken or misleading, and fix only what is important and cheap (section 5).
3. Write a clear report of what works, what you fixed, and what is still broken, so the team can list honest limitations (section 7).

## 0. How we work

- **Questions:** ask everything you need in ONE message at the start. The person is available for about 5 minutes, then away for hours. After that, never stop to ask. Use the defaults in section 8 and log every choice in `DECISIONS.md`.
- **Safety first:** before changing anything, run `git tag pre-finale-backup` so the current version can always be restored. Commit after each phase with a clear message. Never force-push, never rewrite history, never push or deploy. The team deploys.
- **Token budget:** keep it lean.
  - Use search (grep, glob) and read only the lines you need. Never read `node_modules/`, `dist/`, `package-lock.json` or large content files in full; check content with short `node -e` scripts.
  - Trim command output: `npm run test -- --reporter=dot 2>&1 | tail -25`, `npm run build 2>&1 | tail -25`.
  - Screenshots cost a lot. Your audit script should log problems as text (section 4), and you open screenshots only for the screens you changed or where text logs aren't enough. Look at them in batches of up to 4.
- **Scope:** don't redesign, don't add features, don't rewrite content. This is a stabilise-and-report pass.

## 1. What the site is (context only)

Pace is a concept redesign of the student experience of Prepito, a real, independent CAT preparation platform. It is a front-end prototype: no backend, no login; data lives in the browser (localStorage, with an in-memory fallback). A demo profile ("Explore with a demo profile") seeds believable history. Other students' activity (answer shares, community answers, alum notes) is sample data and must stay labelled "Sample data". Every page carries a credit footer saying Pace is not affiliated with Prepito. Keep all of that intact.

The live demo path the team will show (protect this above everything else):

1. Landing, then "Explore with a demo profile"
2. Home (today's plan)
3. Set pick drill: rank five sets, submit, see the result
4. A capped DILR attempt: reach the cap dialog, take 2 more minutes or leave
5. The 10 minute replay for that attempt
6. Review of a test: option shares, explanation, community answers, a vocabulary word card
7. Planner: quick add "DILR sets 7pm 45m"

## 2. Phase plan (commit after each)

1. Tag the backup. Read `README.md`, `DECISIONS.md` (only its last 40 lines) and the router file to list every route.
2. Fix the six known issues (section 3). Tests and build must pass.
3. Write and run the audit script (section 4). Triage (section 5). Fix what qualifies.
4. Re-run the audit. Re-capture screenshots only for screens you changed, check them, update `screenshots/`.
5. Write `AUDIT_REPORT.md` and `LIMITATIONS.md` (section 7). Final clean `npm ci && npm run test && npm run build`. Commit.

## 3. Known issues to fix

1. **Review page scrolls sideways.** `/progress/review/:attemptId` with the Community tab renders about 1465 px wide in a 1440 px window. Find the overflowing element (often a grid child that needs `min-width: 0`, a long unbroken string, or a fixed width) and fix it. Check 390 px width too.
2. **Predicted percentile is too low.** The result page shows "around 95 percentile" for 93/204, which looks wrong to anyone who has taken CAT. In `src/logic/testRules.ts`, recalibrate `SAMPLE_TABLE` to roughly: 0 to 20, 15 to 50, 30 to 75, 45 to 88, 60 to 95, 75 to 98, 90 to 99.3, 110 to 99.8, 204 to 100. Keep the label saying it's a rough estimate from a sample table, not a real percentile. Update its test.
3. **DILR sectionals have 23 or 24 questions.** The current CAT DILR section has 22, and the full mocks already use 22. Make every DILR sectional 22 questions (`src/content/tests.ts`). The test window must then say "Question 1 of 22".
4. **Some explanations read as fragments.** Lines like "That is the second option." or "The third option goes too far." sit alone with a bookmark icon. Each option's line must be one full sentence that names the option and says why it is right or wrong ("B is right: the passage says ...", "C goes too far: ..."). Fix the VARC explanation text where it's fragmentary and, if needed, the renderer. Don't change which option is correct. If you find an answer key you think is wrong, don't change it: list it in the report.
5. **Streak month total ignores today.** The streak page shows "November 2026 · 0 min studied" while the same page shows today's minutes. The month total must include today.
6. **Credit footer sits inside the exam screen** under the answer options. Move it out of the question column into the palette column in small text, so the exam screen stays clean. It must still be visible somewhere on the test window.

## 4. The audit: go through the whole site

Write `scripts/audit.mjs` using Playwright (already a dev dependency). Run it against a production build served locally (`npm run build && npx vite preview --port 4173`). Run it twice: once with a fresh profile (onboarding path) and once with the demo profile. Run every check at 1440x900 and at 390x844. Use a fixed date of 2026-11-04 if the app supports it, otherwise the device date (note which).

For **every route** in the router, record:
- Does it render without a blank screen or crash? Any uncaught page errors or `console.error` messages? Any failed network requests (404s for assets or fonts)?
- Horizontal overflow: is `document.documentElement.scrollWidth` bigger than the viewport width? If so, which element?
- Are there links or buttons that go nowhere: `href="#"`, links to routes that don't exist, buttons with no effect? Click every link and button that navigates (not destructive ones like "Reset demo"), and record where each one lands.
- Does the credit footer appear (or the small credit on the test window)?
- Is any text that should never appear on screen present: "TODO", "lorem", "undefined", "NaN", "[object Object]", "coming soon", "null"?
- Do "Sample data" tags appear wherever other students' activity is shown?
- Obvious layout breaks: text overlapping, elements cut off at 390 px, empty cards. Detect what you can in code (overlapping bounding boxes of key elements, zero-height containers); screenshot only the routes the script flags.

Then **walk the main flows end to end** with real clicks, and check the result of each step, not only that it rendered:
1. Onboarding (fresh profile) through all steps to Home. Skip works. Back works.
2. The demo path in section 1, every step. The drill timer counts down; submitting shows a result; the cap dialog appears at the cap; "Take 2 more minutes" works once only; "Leave" goes to the replay; the replay shows this attempt, not only sample data.
3. Daily set: build a custom set (count, time, difficulty, topics), save it as a preset, start it, answer a few, submit, see the result, open the review.
4. Full mock: start, answer in VARC, confirm the section lock (can't jump to DILR early in a mock), the timer counts, the calculator opens in QA, mark for review works, palette states and colours change correctly, submit, result, replay, review.
5. Scoring: answer a known set of questions and confirm the score follows +3 correct, −1 wrong MCQ, 0 wrong TITA.
6. Autosave and resume: start a test, reload the page, confirm "Resume" appears and answers are kept.
7. Review: option share bars sum to about 100% and mark the correct option and "You"; add a community answer and see it appear; open a vocabulary card and add the word; check it appears in Vocabulary.
8. Lessons: play, pause, scrub, change speed, click a transcript line to jump, answer the practice questions under it.
9. Planner: quick add "DILR sets 7pm 45m" and "RC tomorrow 8:30 30m" (check the preview chip and that the block lands on the right day and time), click an empty slot to add, a template chip, "Fill my week", tick a block done, move a missed block to tomorrow.
10. Streak: answer one question or watch 5 lesson minutes and confirm today counts.
11. Rewards: buy a streak shield; run the Meridian discount calculator (100 coins = ₹50, capped at 30% of the course price); confirm the balance and history update.
12. Analytics: topics with fewer than 5 attempts show "Not enough data yet" everywhere, and no other screen contradicts that.
13. Settings: change exam date and study minutes, switch theme (light, dark, system), export data, import it back, reset the demo.
14. Data checks: run the existing tests. Also write a quick check that every question has exactly one correct answer present in its options, every TITA answer is a number, and every test's question count matches its stated count. Don't print content; print only counts and failing ids.

## 5. Triage rules: fix or report

**Fix it now if both are true:**
- It matters: it breaks or embarrasses the demo path in section 1, crashes a page, shows wrong numbers or wrong scoring, makes a link dead, shows forbidden text, removes a "Sample data" tag or the credit, or looks clearly broken at 1440 or 390 px.
- It's cheap: roughly under 40 changed lines, confined to one or two files, no new dependency, no data model change, low risk of breaking something else.

**Otherwise don't fix it.** Record it in the report with a one-line description, where it happens, how severe it is (Demo-breaking / Visible / Minor), and a suggested fix.

Priority when time is short: the demo path first, then crashes and wrong numbers, then dead links and mobile layout, then everything else.

After each fix, re-run the specific check that found it. Never "fix" by hiding a feature unless it's broken and unfixable cheaply; if you hide one, say so in the report.

## 6. Don't touch

- The credit footer wording, the "Sample data" tags, the About page's honesty notes.
- Which answer is correct for any question (report doubtful keys instead).
- `vercel.json`, the build command, the routing mode.
- Git history. No force push, no deploy.

## 7. Deliverables

1. **`AUDIT_REPORT.md`**, short and scannable:
   - A summary line: routes checked, flows checked, issues found, fixed, left open.
   - A table of every route: route · renders (yes/no) · console errors · overflow at 1440 · overflow at 390 · notes.
   - A table of every flow from section 4: flow · result (Works / Partly works / Broken) · what happened · fixed?
   - A table of fixes made: issue · file(s) · what changed.
   - A table of open issues: issue · where · severity · suggested fix.
   - Any answer keys you think are wrong (question id and your reason), without changing them.
2. **`LIMITATIONS.md`**: the open issues rewritten as plain, honest one-liners the team can say to judges, grouped as "Known issues in the prototype" and "By design in this concept" (for example: no backend or login; data stays in the browser; other students' activity is sample data; difficulty estimates are not yet checked against real students' times; content is original but small). No more than 12 lines in total.
3. **`DEMO_CHECK.md`**: the section 1 demo path as a numbered checklist, each step marked Works / Fixed / Broken, with the exact clicks, so the presenter can rehearse it.
4. Updated `screenshots/` for the screens you changed.
5. Final state: `npm ci && npm run test && npm run build` pass. Everything committed on `main`, the `pre-finale-backup` tag in place, nothing pushed.

## 8. Defaults (use if nobody answers)

| Question | Default |
|---|---|
| Push or deploy? | No. Commit only. |
| Change answer keys? | No. Report them. |
| Fix size limit | About 40 lines, one or two files |
| Date for the audit | 2026-11-04 if the app supports a fixed date; otherwise device date |
| Mobile size | 390x844 |
| Something can't be tested (for example, a real file download) | Mark it "Not tested" with the reason |

## 9. When you finish

Reply with: how many routes and flows you checked, what you fixed, the open issues by severity, whether the demo path fully works, and the path to the three report files.
