# Changelog

## v2: from concept demo to a study website

v1 was a landing page and four clickable screens. v2 is a complete site a student could study on for a week.

### Added
- Grouped navigation: Practice, Learn, Progress, Community. Sidebar on desktop, bottom bar on mobile.
- Onboarding with a demo profile option, and a Home page that shows only today.
- A question bank: 73 QA questions, 21 DILR sets, and 48 VARC questions including 6 original passages.
- A CAT-style test window: section timers, palette with five states, MCQ and type-in answers, section locks in mocks, calculator, autosave and resume.
- 2 full mocks, 9 sectionals and topic tests, built from the bank.
- Daily-set builder with saved presets.
- Result page and per-attempt review: replay, option percentages, explanations with named traps, community answers and vocabulary in context.
- 6 slide lessons with synced transcripts, chapters and practice questions, built in code with no video files.
- Alum notes and My notes.
- 150 vocabulary words with spaced practice in three formats.
- A streak with a clear rule, a month calendar and an activity log.
- A low-friction planner: click to create, quick-add in plain words, templates, and Fill my week.
- Analytics that applies the 5-attempt rule everywhere.
- Discussions, coins, spending in Pace, and a Meridian Learning discount proposal.
- Settings with theme, thresholds, reset, and data export and import.
- Saved progress in `localStorage`, with an in-memory fallback.
- Light and dark themes.
- Tests for the new logic and all content, plus a Playwright test of the main story.

### Changed
- Set-pick drill and replay are restyled. The drill sits under Practice, and replay now works for any attempt.
- The timeline-carousel replay is replaced by a calm vertical layout.
- The landing page is plain, with real component previews.
- The plan now draws on planner blocks, redo items, lessons and vocabulary.
- The About page covers the new formulas and honesty notes.

### Removed
- The Three.js landing scene and the `three` dependency.
- Giant display type, uppercase headlines, glows, beam buttons and tilted slabs.
- The dark-only theme.

### Kept
- The solver, Kendall's tau, cap, spacing and session-builder logic, with their tests.
- `sample_sets.json` and `demo_student.json`.
- The credit footer and the Vercel set-up.
