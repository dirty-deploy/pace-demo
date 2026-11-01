# Data and content

All content is original. Nothing here comes from a real exam paper or from Prepito.

## Files from v1 (`src/data`)

| File | What it holds |
|---|---|
| `sample_sets.json` | The 15 circular-seating sets, with clues, solutions and solver effort |
| `demo_student.json` | The fictional demo student: sessions, pace history, topic attempts |

## Content (`src/content`)

| File | What it holds |
|---|---|
| `types.ts` | The schema for questions, passages, DILR sets and vocabulary |
| `defineQa.ts` | Helper that builds a QA question from `params`, `solve()` and a hand-written `key` |
| `qa/` | 73 QA questions. `QA_BANK` is exported from `qa/index.ts` |
| `dilr/` | The 21 DILR sets. `verify.ts` has the brute-force solvers; `newSets.ts` the 6 new sets; `index.ts` adapts the seating sets |
| `varc/` | 6 RC passages, 10 para-jumbles, 8 para-summaries, 6 odd-sentence-out |
| `vocab.ts` | 150 words with the simpler word, meaning, example and inflected forms |
| `vocabPractice.ts` | Three practice formats for each word |
| `lessons/` | 6 slide lessons: slides, timed transcript, chapters, practice questions, SVG diagrams |
| `notes.ts` | Alum notes by fictional "Sample alum" authors |
| `community.ts` | Sample community answers per question |
| `threads.ts` | Sample discussion threads |
| `formulaSheet.ts` | The printable formula sheet reward |
| `tests.ts` | Assembles 2 mocks, 9 sectionals and the topic tests from the bank |
| `index.ts` | The combined bank and lookups |

## Saved data (`localStorage`, key `pace.v2`)

One versioned JSON object, typed as `AppState` in `src/state/schema.ts`. Every read and write is in try/catch, with an in-memory fallback, so the site works with storage blocked (`src/state/store.ts`).

| Field | What it holds |
|---|---|
| `version` | Schema version |
| `profile` | Name, exam, date, weekday and weekend minutes, target |
| `settings` | Theme and streak thresholds |
| `active` | Unfinished tests by test id: answers, timers, marks, cap tracks |
| `attempts` | Finished tests: per-question answer, time and marked state, plus DILR order and stalled clue |
| `drills` | Set-pick drill results |
| `redo` | Redo items with due dates |
| `lessons` | Position, watched time, done state, practice answers |
| `days` | Activity per date, for the streak |
| `planner` | Study blocks |
| `notes`, `noteUpvotes`, `noteHighlights` | My notes and alum-note state |
| `vocab`, `vocabDays` | Per-word spacing state and practice dates |
| `community` | The student's own answers, threads, replies and upvotes |
| `coins` | The coin ledger |
| `presets` | Saved daily sets |
| `purchases` | Shields, Mock 2 unlock, formula sheet, demo coupons |
| `sessions`, `pace` | Inputs to the v1 plan and cap formulas |
| `dayOverride` | Today's minutes, if changed on Home |

Export and import in Settings use this same object.
