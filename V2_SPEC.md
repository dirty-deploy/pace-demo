# Pace v2: from concept demo to a complete study website

Read this whole file, then `DESIGN_V2.md`, before changing any code.

You are working in the existing **Pace v1** repository (Vite + React + TypeScript, deployed on Vercel). v1 built a landing page and four screens: Today, Set-pick drill, Capped attempt + Replay, About. It also has the seating-puzzle solver, `sample_sets.json`, `demo_student.json`, tests and a screenshot script. **Keep the logic, the solver, the tests and the Vercel set-up. Rebuild the product around them.**

Feedback on v1 from the people who will present it:
- It looks like a tech showcase (dark, 3D slabs, giant type, glow). It should look and feel like a **calm, well-organised study app** that a CAT aspirant would open every day.
- It is a handful of clickable screens. Judges expect a **complete website**: every link goes somewhere real, every page has real content, and a student could actually study on it for a week.

---

## 0. How we work (unattended)

1. Ask all your questions in **one** message at the start. The person will be away after about 5 minutes. After that, never stop to ask: use the defaults in section 14, log every choice in `DECISIONS.md`, and keep going.
2. Work in the phases of section 13. **Commit to git after each phase** with a clear message, so a working version always exists.
3. After each phase: `npm run test`, `npm run build`, then the screenshot script. Open the screenshots, compare them with `DESIGN_V2.md`, fix problems, then move on.
4. If time is short, follow the cut list in section 13. Never leave a broken link or an empty page: hide a section rather than ship it half-done.

## 1. What the website is

**Pace** is a free CAT preparation website. It is a concept redesign by Team Apex of the student experience of **Prepito** (prepito.in), an independent CAT/XAT prep platform, showing how it could be simpler and how a "decision practice" layer (set-pick drill, time caps, 10-minute replay, a plan that fits your day) would sit inside it.

The **information architecture follows the flow a Prepito student already knows** (dashboard with analytics, review, planner, community, rewards; practice with daily questions, video lessons, notes, vocabulary, past-paper style tests and sectional tests). That's intentional: it's a redesign proposal, so the flow should feel familiar. **The visual design, every word of copy, and all content must be our own.**

### Attribution and honesty rules (hard rules)

- Keep the credit footer on every page: *"Pace is a concept redesign by Team Apex, showing features proposed for Prepito (prepito.in), an independent CAT preparation platform. Not affiliated with or endorsed by Prepito. All questions, lessons and notes on this site are original."*
- Never use the name "Prepito" as the site name, logo or page title. No Prepito logo, cat mascot, coin artwork, colours copied value-for-value, layouts copied screen-for-screen, or any of its text, questions or explanations. Do not fetch anything from prepito.in.
- **No real CAT questions or passages.** Everything is original (section 9).
- **Anything that imitates other people's activity is labelled.** Percent-of-students-per-option, community answers, alum notes and any counts of other users are sample data in this demo. Each such block carries a small, visible "Sample data" tag with a tooltip: "This is a demo. Numbers and posts from other students are illustrative." Alum authors are fictional and shown as "Sample alum". Never present invented people as real.
- There is no AI in the product. Don't add a chatbot or claim AI features.

## 2. Users and the one-week story

The site must support this story end to end, with nothing faked in the clicks:

1. A student lands on `/`, reads a plain explanation, clicks **Start preparing**.
2. **Onboarding** (`/start`, 4 short steps): name, exam (CAT 2026 or XAT 2027), exam date (default 29 Nov 2026), study time available (weekday minutes, weekend minutes), target percentile (optional). There's also a link "Explore with a demo profile" that loads the sample student from `demo_student.json`.
3. **Home** shows only what matters today (section 4.1). They start today's plan.
4. They take a **daily set** they customised, a **sectional test**, and a **full mock** in a CAT-style test window.
5. After each test: a **result**, a **10-minute replay**, and a **review** of every question with the explanation, option percentages, community answers and clickable vocabulary.
6. They watch a **lesson**, read its transcript, answer the practice questions under it.
7. They **plan** the rest of the week in the planner in under a minute.
8. Their **streak**, **analytics** and **coins** update from what they actually did. They see that unused coins can become a discount on Meridian Learning courses.

## 3. Site map and navigation

Group navigation into clear categories. This directly fixes "too cluttered: too much information without proper category".

**Public**
- `/` Landing
- `/start` Onboarding
- `/about` About this concept (credits, method, formulas, honesty notes)

**App** (sidebar on desktop, bottom bar on mobile with 5 items: Home, Practice, Learn, Progress, More)

| Group | Page | Route |
|---|---|---|
| — | Home | `/home` |
| **Practice** | Daily set | `/practice/daily` |
| | Tests: Mocks and Sectional | `/practice/tests` (tabs: Full mocks · Sectional · Topic tests) |
| | DILR set-pick drill | `/practice/drill` |
| **Learn** | Lessons | `/learn/lessons`, `/learn/lessons/:id` |
| | Notes (alum notes + my notes) | `/learn/notes` |
| | Vocabulary | `/learn/vocab` |
| **Progress** | Review (all attempts, replay, question review) | `/progress/review`, `/progress/review/:attemptId` |
| | Analytics | `/progress/analytics` |
| | Planner | `/progress/planner` |
| | Streak | `/progress/streak` |
| **Community** | Discussions | `/community` |
| | Rewards | `/rewards` |
| — | Settings (profile, study time, theme, reset demo, export/import data) | `/settings` |

Test-taking routes run outside the app shell, full screen: `/test/:testId`, `/test/:testId/result`.

Top bar inside the app: page title on the left; on the right only three things: the **days-to-exam chip**, the **streak chip** and the **coins chip**. No banners. No permanent pop-ups. (Prepito shows a permanent trial banner and a sync warning that covers content: don't repeat either.)

## 4. Pages

### 4.1 Home (decluttered)

At most **four blocks above the fold** on a laptop. Order:

1. Greeting line ("Good evening, Ash") and one muted line: "29 days to CAT · You have 60 min today" (change link).
2. **Today's plan** card (the session builder from v1): planned minutes with the sizing sentence, then 3 to 5 plan items as a checklist, each with duration and a Start button. Items come from the plan formula, the planner's blocks for today and due redo items. One primary button: "Start next".
3. **Streak** card: current streak, best streak, this week as 7 day cells, and the exact rule for today ("Answer 1 question or watch 5 minutes of a lesson to keep your streak"). Shows "Done for today ✓" once met.
4. **Continue** card: the one unfinished thing (a paused test or lesson) with a Resume button. Hidden if there is nothing to continue.

Below the fold, a single row of four plain links: Daily set · Tests · Lessons · Vocabulary. Nothing else. All other information lives on its own page.

### 4.2 Daily set (customisable): feature request 9

- A builder with four controls and a live summary:
  - **Number of questions:** 5 / 10 / 15 / 20 / custom (5 to 30)
  - **Total time:** 10 / 20 / 30 / 45 min / custom; also a toggle "No time limit"
  - **Difficulty:** Easy / Medium / Hard as a three-way mix slider, or "Match my level" (uses accuracy from analytics once there are 5 or more attempts; otherwise balanced)
  - **Topics:** multi-select chips by section (VARC, DILR, QA) and topic
- Summary: "15 questions · 30 min · mostly Medium · Percentages, Time & Work, RC". Primary button "Start set".
- **Save as my daily set** (name it). Saved sets appear as one-tap presets at the top. A default preset "Quick 10" exists.
- Questions are drawn from the bank (section 9) without repeating ones answered in the last 7 days where possible. If the filters leave too few questions, say how many are available and offer to widen the filter.
- Runs in the test window (4.4) in "practice" mode.

### 4.3 Tests

Tabs: **Full mocks** (2 original mocks), **Sectional** (VARC / DILR / QA, each 40 min, built from the bank), **Topic tests** (per topic, 5 to 8 questions, 15 min). Each list row: name, questions, minutes, difficulty tag, status (Not started / In progress / Done with score), and one button (Start / Resume / Review). Filters: section, topic, difficulty, status. Clean list, no clutter.

### 4.4 Test window (CAT-style, full screen)

Model the real exam experience, cleanly:
- Header: test name, section name, **section timer** (always visible; nothing may overlap it), and a "Pause" option in practice mode only.
- Left: the question (passage on the left and question on the right for RC and DILR sets; single column for QA). Right: **question palette** with status colours and a legend: Not visited, Not answered, Answered, Marked for review, Answered and marked.
- Bottom: Mark for review & next · Clear response · Save & next.
- **MCQ** (4 options) and **TITA** (type-in answer, numeric keypad) questions. Marking: +3 correct, −1 wrong MCQ, 0 wrong TITA.
- **Sections are locked** in mocks: 40 minutes each in the order VARC, DILR, QA; no early exit to the next section (show "Section ends in 12:40"). In practice mode, sections can be left early.
- An on-screen basic **calculator** in QA, as in the exam.
- **DILR capped mode** (v1 feature): in DILR practice and sectional tests, each set has a soft cap (v1 formula). At the cap, the v1 dialog appears. Not in full mocks, which stay exam-like.
- Autosave every answer in local storage. If the tab is closed, "Resume test" on Home and Tests.
- Submit → confirmation with a count of answered, not answered and marked → **Result**.

### 4.5 Result page

- Score, per-section score, accuracy, attempts, time per section. A one-line, honest predicted-percentile note only if the student has completed a full mock ("Rough estimate from a sample score table. Not a real percentile.").
- Three buttons: **10-minute replay**, **Review answers**, **Share result** (share card with an invite code, as in the v1 stretch feature).

### 4.6 Review and 10-minute replay

`/progress/review` lists all attempts (filters by type, section, date). `/progress/review/:attemptId` has two tabs:

**Replay tab** (v1 replay, now for any attempt): where the time went per section and per set; the start chosen vs recommended (DILR); cap hits; the clue where progress stopped; three redo items with spaced dates ("Add to plan").

**Questions tab:** palette to jump between questions, filters (Correct, Wrong, Skipped, Marked), and for each question:
1. Question with the student's answer and the correct answer marked.
2. **How everyone answered (feature 3):** a small horizontal bar per option with the percentage of students who chose it, the correct option highlighted, and "You" marked on the student's choice. Line under it: "1,240 attempts · 38% correct". Tagged "Sample data". Generate the distribution deterministically per question (seeded by question id) so it's stable, plausible (correct option usually 25 to 70%, the main trap option highest among the wrong ones), and add the student's own answer to the count. TITA: show "% answered correctly" and the 3 most common wrong values.
3. **Official explanation**, with the trap named ("Distortion trap", "Partial scope trap", "Calculation slip").
4. **Community answers (feature 4)**, shown right next to the explanation (a second column on desktop, a tab "Community · 3" on mobile): 2 to 3 sample answers per question, each with an author ("Sample student", "Sample alum, 99.2 %ile"), a short alternative method, and upvotes. The student can **add their own answer** (saved locally, shown with "You") and upvote. Sort: Top / New. "Sample data" tag on the block.
5. **Vocabulary in context (feature 10):** in every reviewed passage or question, words from the vocabulary list (section 9.5) are dotted-underlined. Clicking one opens a small card: the word, **a simpler word that means the same** ("obfuscate → hide"), a one-line meaning in plain English, the sentence from the passage with the simpler word swapped in, one more example sentence, and **Add to my words**. Added words appear in Vocabulary with a short practice.
6. "Jump to the concept" link to the lesson and timestamp that covers this question's idea (if one exists).

### 4.7 Lessons with transcripts and practice: feature 8

- `/learn/lessons`: lessons grouped by section and topic, each with duration, a progress bar, and "Done" when finished.
- `/learn/lessons/:id`: a **lesson player** built in code (no video files). It plays a timeline of original slides (title, diagrams drawn in SVG, worked steps appearing one by one), with play/pause, a scrubber, chapter markers, 1×/1.25×/1.5× speed and keyboard shortcuts (space, arrows). The "audio" is the transcript: the current sentence is highlighted as the lesson plays.
- **Transcript panel** beside the player (below on mobile): full text, timestamps, the current line highlighted, clicking a line jumps there, and a search box.
- **Chapters** listed under the player with timestamps.
- **Practice questions** under the transcript: 3 to 5 questions on exactly that lesson, answered inline with instant feedback and the explanation, counted in analytics.
- Watch time counts towards the streak (section 4.10). Progress resumes where the student left off.

### 4.8 Notes from alums: feature 6

- Two tabs: **Alum notes** and **My notes**.
- Alum notes: 12 or more original, genuinely useful notes (for example "How I chose DILR sets in the first 4 minutes", "My 3-pass approach to RC", "The 12 percentage-fraction pairs I memorised"), each with a fictional author label ("Sample alum · IIM A '25 · 99.4 %ile"), topic, reading time, upvotes, and **Save to my notes**. Clean reading layout, highlights allowed. "Sample data" tag on authors.
- Filters by section and topic; search.
- My notes: simple notes per topic (title, text, tags), created from scratch or from a saved alum note or a highlighted explanation line ("Save line to notes" in review).

### 4.9 Vocabulary

- Today's words (5 to 10, spaced repetition: a word comes back after 1, 3, 7, 14 days if missed or not yet known).
- "My words" (added from passages) with the simpler word, meaning, example, and a mastery dot.
- Short practice: three formats, each **not giving the answer away** (Prepito's context quiz gives it away: don't repeat that):
  1. Pick the simpler word for the underlined word in a new sentence.
  2. Pick the sentence where the word is used correctly.
  3. Fill the blank with one of 4 words.

### 4.10 Streak: feature 7

- **Rule:** a day counts if the student **answers at least 1 question** (anywhere) **or watches at least 5 minutes of lessons** (cumulative that day). Make both thresholds settings with these defaults.
- Show it better:
  - The top-bar chip shows the count and a small ring that fills when today's rule is met.
  - The Home card shows the rule for today in words, the week as 7 cells (done, missed, today), current and best streak.
  - `/progress/streak` shows a month calendar (heat cells by minutes studied), current and best streak, and a plain activity log ("Thu 29 Oct: 14 questions, 22 min of lessons").
- No flame emoji, no shaming copy. If missed: "Streaks restart. Your study time this month: 9 h 20 min."
- One **streak shield** can be bought with coins (covers one missed day).

### 4.11 Planner: feature 2 (low friction)

Goal: **create a study block in 2 interactions or fewer.**
- **Week view** (Mon to Sun, 6 am to midnight, 30-minute rows). Click an empty slot and a 45-minute block appears with an inline title field, already focused. Drag to move, drag the bottom edge to resize.
- **Quick-add bar** at the top: type "DILR sets 7pm 45m" or "RC tomorrow 8:30 30m" and press Enter. Parse subject, day, time and duration; show a preview chip before saving.
- **Templates row**: "DILR set-pick · 4m", "Sectional QA · 40m", "Daily set · 20m", "Lesson · 15m", "Vocab · 10m". Drag one onto the calendar, or click it to put it in the next free slot today.
- **Fill my week**: one button that lays out blocks from the student's weekday and weekend minutes and the plan formula (v1 session builder). The student can then delete or move any.
- Each block links to its activity: clicking "Sectional QA" offers "Start now".
- Ticking a block done updates Home and analytics. Overdue blocks appear in a small "Missed" tray with "Move to tomorrow".
- Mobile: a day list with a "+" button and the quick-add bar; no drag needed.

### 4.12 Analytics (no contradictions)

- Filters: exam, test type, date range.
- Sections: **Score trend** (mocks), **Time per section**, **Accuracy by topic** (a table, not a SWOT grid), **Time lost to caps** (DILR), and **Next steps** as three concrete actions with buttons (for example "Redo Set S07 · due today · 8 min").
- **The 5-attempt rule applies everywhere.** A topic with fewer than 5 attempts shows "Not enough data yet". No other block may label it a strength or weakness.

### 4.13 Community

- General discussions by topic (Strategy, VARC, DILR, QA, Mocks), each thread with replies and upvotes. Sample threads tagged "Sample data". The student can post and reply (saved locally).
- Per-question discussions are the community answers from 4.6, also reachable here.

### 4.14 Rewards and Meridian Learning discount: feature 5

- **Earn coins** for real actions with daily caps: a full mock (+50), a sectional (+20), a daily set (+10), a lesson finished (+5), a review completed (+10), a streak day (+2).
- **Spend in Pace:** streak shield (40), an extra mock unlocked early (100), a printable formula sheet (30). These actually work in the demo.
- **Or convert to a Meridian Learning discount:** unused coins convert at **100 coins = ₹50 off**, up to **30% of a course's price**, on Meridian Learning's paid courses (sample catalogue of 3 courses with sample prices). The student picks a course, sees the discount, and gets a demo coupon code (`MER-XXXX-XXXX`). Note: "Proposal for after the acquisition. Illustrative: no real coupon."
- A clear balance, history log and the earning rules on one page. No "coming soon" items.

### 4.15 Landing, onboarding, About, Settings

- **Landing:** calm and plain. A headline in our own words (for example "Prepare for CAT one good day at a time."), a short paragraph, a primary button "Start preparing", a secondary "Explore with a demo profile". Then three short sections with a real screenshot-style preview of the app (rendered components, not images): Practice like the exam · Learn from every attempt · Plan around your real day. Then the credit footer. **No 3D, no giant type, no glow.**
- **Onboarding:** 4 steps with a progress indicator; each step one question; Back and Skip; ends on Home with a first plan ready.
- **About:** v1 About, updated: what's proposed, the formulas, the honesty notes (sample data, fictional alums, original content), credits.
- **Settings:** profile, exam and date, study time, streak thresholds, theme (Light / Dark / System), **Reset demo**, **Export my data / Import** (JSON).

## 5. Keep from v1

- Solver, generator, Kendall's tau, cap, spacing and session-builder logic, and their tests.
- `sample_sets.json`, `demo_student.json`.
- Set-pick drill (restyled, now under Practice, also offered at the start of DILR sectionals: "Pick your order first? 4 min").
- Replay (now per attempt).
- Credit footer, About content, Vercel set-up (`vercel.json`, clean `npm ci && npm run build`).

## 6. Remove from v1

The Three.js landing scene and the `three` dependency, the giant "PACE" type, uppercase display headlines, glows, the beam and gold-glow buttons, tilted slabs, the timeline-carousel replay (replace with a calm vertical layout), and the dark-only theme.

## 7. State and data

- No backend, no login. All user data in `localStorage` under one versioned key (`pace.v2`), with every read and write in try/catch, and an in-memory fallback so the site works with storage blocked.
- Schema: profile, attempts (with per-question answer, time, marked state, and for DILR the set order and stalled clue), lesson progress, streak days, planner blocks, notes, vocab state, community posts by the student, coins ledger, saved daily-set presets, settings.
- First visit: empty profile → onboarding. "Explore with a demo profile" seeds a week of believable history (attempts, streak of 4 days, planner blocks, a few notes) so every page has something to show.
- Write a small `src/data/README.md` describing every content file and the schema.

## 8. Engineering

- Keep Vite + React + TypeScript + React Router (hash routing). Add only what is needed: an icon set (Lucide), and optionally `@dnd-kit` for the planner. No UI kit, no chart library heavier than needed (hand-built SVG charts are fine and preferred).
- Code-split by route so the first load stays small.
- Unit tests (Vitest) for: quick-add parsing, streak rule, coin ledger and discount cap, daily-set builder (filters, no repeats, not enough questions), test scoring (+3/−1/TITA), option-distribution generator (stable, sums to 100, correct option within range), section lock, plus the v1 tests.
- One Playwright end-to-end test of the one-week story's main path: onboarding → daily set → result → review (open a vocab card, add a community answer) → planner quick-add → streak updated.
- Accessibility: keyboard for everything (test window, palette, planner without drag), visible focus, labels, `aria-live` for timers, colour never the only signal. Works at 390 px and 1440 px.

## 9. Content (all original, all checked)

Put content in `src/content/` as typed JSON or TS files. Quality matters more than volume: a wrong answer key damages the whole demo.

### 9.1 Question bank (minimum)

- **QA: 70 questions** across Arithmetic (percentages, profit and loss, ratio, time and work, time-speed-distance, SI/CI, averages, mixtures), Algebra (equations, inequalities, functions, progressions), Geometry and mensuration, Number systems, Modern maths (P&C, probability, sets). About 30% TITA. **Every QA answer must be computed by code**: store each question with a small `solve()` or the parameters used to generate it, and add a test that recomputes every answer key.
- **DILR: 16 sets.** The 15 existing seating sets plus at least 6 new ones from other families that code can verify: linear arrangement (solver-checked), a data-interpretation table or chart set generated from random numbers with computed answers, and a scheduling/grid set solved by brute force. 3 to 5 questions per set. Each set has `expectedMinutes` and a difficulty label from solver effort or step count.
- **VARC: 6 original RC passages** (450 to 600 words each, on original topics, for example the economics of night markets, how bees agree on a new hive, the history of the metre) with 4 questions each; **10 para-jumbles** (TITA, original sentences); **8 para-summaries**; **6 odd-sentence-out**. Write each, then do a **second, separate review pass** for every VARC answer key: re-read the passage, justify the key in one line, check the distractors are clearly wrong, and log the check in `CONTENT_QA.md`. Fix anything doubtful or drop it.
- Every question: id, section, topic, sub-type, difficulty, `expectedSeconds`, options or TITA answer, explanation (plain language, names the trap), and a `lessonRef` where relevant.

### 9.2 Tests assembled from the bank

- **2 full mocks** in the current CAT pattern: 68 questions (VARC 24, DILR 22, QA 22), 40 minutes per section, VARC → DILR → QA.
- **Sectionals:** 3 per section.
- **Topic tests:** one per major topic.

### 9.3 Lessons: 6 slide lessons

RC: inference questions · Para-jumbles: finding the opening and the pairs · DILR: choosing your set in 4 minutes · DI: reading tables fast · QA: percentages as fractions · QA: time and work with LCM. Each 4 to 7 minutes, 10 to 16 slides, a full transcript of 500 to 900 words, chapters, and 3 to 5 practice questions.

### 9.4 Notes, community, distributions

- 12 alum notes (200 to 500 words each), useful and specific.
- Community answers: 2 to 3 for at least 60 questions (alternative methods, shortcuts, a common mistake).
- 8 sample discussion threads with 2 to 5 replies each.
- Option distributions generated as in 4.6.

### 9.5 Vocabulary list

150 words likely to appear in CAT-level passages, each with: simpler word, plain meaning, an original example sentence, part of speech. Make sure every RC passage contains 6 to 10 of them so feature 10 shows up everywhere.

## 10. Copy and tone

Plain, warm, short sentences. Talk like a good senior, not a marketing page. Say what happened and what to do next. Label estimates and sample data. No hype ("unlock", "supercharge", "seamless", "AI-powered", "revolutionary"). No exclamation marks except in the onboarding welcome.

## 11. Screenshots

Update `npm run screenshots` to capture, at 1440×900 and 390×844, with the demo profile and a fixed date of 2026-11-01: landing, onboarding step 1, home, daily-set builder, tests list, test window (VARC passage and DILR set), cap dialog, result, replay, review question with distribution + explanation + community, vocab card open, lesson player with transcript, notes, vocabulary practice, planner week with quick-add preview, analytics, streak page, community thread, rewards with the Meridian discount, settings, about. Also capture dark mode for home, test window and review.

## 12. Definition of done

1. Every route in section 3 works; no dead link or placeholder page anywhere (search the code for "TODO", "lorem", "coming soon": none may remain in the UI).
2. The one-week story in section 2 works end to end; the e2e test passes.
3. All ten feature requests are implemented as specified: declutter (4.1, 3), planner (4.11), option percentages (4.6), community answers (4.6), coins to Meridian discount (4.14), alum notes (4.8), streak (4.10), lesson practice and transcripts (4.7), customisable daily set (4.2), vocab in context (4.6 and 4.9).
4. Content minimums in section 9 met; all QA answer keys recomputed by tests; `CONTENT_QA.md` complete for VARC.
5. `npm ci && npm run test && npm run build` pass clean; Vercel config unchanged and valid.
6. Screenshots reviewed against `DESIGN_V2.md`, including its checklist; fixes made.
7. `README.md` updated (what it is, features, credits and honesty notes, run, build, deploy); `WALKTHROUGH.md` rewritten as a 3-minute presenter script following section 2; `DECISIONS.md` and `CHANGELOG.md` (v1 → v2) written.
8. Credit footer on every page; sample-data tags wherever other people's activity is shown.

## 13. Phases (commit after each)

1. **Foundation:** design tokens and components from `DESIGN_V2.md`, light/dark theme, app shell with grouped navigation, routing for every page (simple real content, not "coming soon"), state store and schema, onboarding, demo profile seed. Remove the 3D landing and its dependency.
2. **Content:** question bank, tests, vocab list, with the QA recompute tests and the VARC review pass.
3. **Test engine:** test window, scoring, result, autosave and resume, DILR cap mode, set-pick before DILR.
4. **Review:** replay per attempt, question review with option distribution, explanation, community answers, vocab cards, notes capture.
5. **Home, daily set, streak, planner.**
6. **Lessons** (player, transcript, chapters, practice), **notes**, **vocabulary practice**.
7. **Analytics, community, rewards + Meridian discount, settings, about, landing.**
8. **Polish:** screenshots, checklist, accessibility pass, docs, e2e test.

**Cut list if time runs out** (cut from the bottom first, and hide cut items from navigation): dark mode for non-key pages → community general threads (keep per-question answers) → third format of vocab practice → planner drag-resize (keep click-to-create, quick-add and templates) → second full mock → lessons 5 and 6. Never cut: the test window, review with features 3, 4 and 10, the daily-set builder, the planner quick-add, the streak rule, the coins → discount page, the credit footer and sample-data tags.

## 14. Defaults (use if nobody answers)

| Question | Default |
|---|---|
| Site name | Pace · subtitle "CAT prep · concept redesign for Prepito by Team Apex" |
| Theme | Light by default, dark available, follows system on first visit |
| Lessons | Code-built slide lessons with synced transcripts, no video files |
| Login / backend | None. localStorage with export/import. |
| Exam date | 29 Nov 2026 (CAT 2026) |
| Streak thresholds | 1 question or 5 lesson-minutes per day |
| Coin conversion | 100 coins = ₹50, max 30% of course price |
| Option-percentage data | Seeded sample data, tagged |
| Repo | Same repo as v1; keep git history; commit per phase on `main` |
