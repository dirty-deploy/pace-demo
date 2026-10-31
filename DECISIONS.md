# Decisions and assumptions

One line per choice. Answers from the person who launched the build are marked (asked).

- Project root is `Pace_Demo_Build/`, next to BUILD_SPEC.md, so Vercel needs no root-directory setting (asked).
- Product name is "Pace"; the old "Meridian Pace" title on the journey diagram is treated as a working name (asked).
- Git commit uses the existing global identity and includes the Co-Authored-By line (asked).
- Nice-to-haves done: mistake-to-lesson card (replay) and share card with a demo invite code (Today). Linear seating not done (asked).
- Stack: Vite + React + TypeScript, React Router in hash mode, plain CSS files with custom properties, `three` loaded by dynamic import on the landing route only.
- Font: Onest is bundled through `@fontsource/onest` (same OFL font as Google Fonts) so it works offline and for the screenshot script. Weights 300, 400, 500 only.
- Icons: Lucide (MIT). Everything else is drawn in CSS, SVG or Three.js. No image files.
- Drag and drop uses `@dnd-kit` with pointer and keyboard sensors, plus left/right (desktop) or up/down (mobile) buttons on every card.
- State is in memory only. Reloading resets the demo, which is what a presenter wants. No localStorage, so nothing can fail when storage is blocked.
- The first drill round draws 5 of the 15 provided sets at random with at least one Easier and one Harder. "New round" runs the in-browser generator (styles easier, easier, medium, harder, harder, re-rolled until the round has both an Easier and a Harder set).
- Set codes (A to E) are assigned per round in the order shown, which is random with respect to difficulty. Seeded redo items from earlier sessions show their library id (for example "Set S07") so they never clash with a round letter.
- `searchNodes` counts one node per placement attempt plus 2 (the root and the fixed seat-0 placement). With that it reproduces `solverNodes` for all 15 provided sets exactly (tested).
- Difficulty labels for generated sets: score under 2.05 is Easier, under 2.8 is Medium, otherwise Harder. This matches all 15 provided sets. Mapping anchors are the min and max `solverNodes` of the provided sets (42 and 219).
- Reason text (7.2): the "mostly fixed" rule is checked first, then negative, then adjacency. With only positive clue types the "Mixed clues" branch cannot be reached (fixed + adjacency = clues, and adjacency under 2 means fixed is at least clues minus 1). It is kept as specified and unit-tested with a synthetic set.
- Cap is `capSeconds(expected, paceFactor)`, rounded to 10 s. Pace uses the demo history plus the student's own attempts this visit.
- Per-question seconds: time goes to the question most recently focused or answered. Before any interaction it goes to question 1. Time spent while a dialog is open is not counted.
- The cap dialog pauses the clock. Escape does not close it. The "Leave this set?" dialog (from the close button) closes with Escape and means "stay".
- A set counts as "hit the cap" once the cap dialog has appeared, even if the student then leaves or extends.
- Attempt `endedAt - startedAt` equals active seconds (paused time excluded), so replay minutes match the on-screen timer.
- Redo picks (exactly 3): sets where the cap was hit (most minutes over the cap first), then sets with wrong answers, then the slowest correct sets (spent divided by expected), then, if fewer than 3 sets were attempted, unattempted sets from the round in recommended order, labelled "Not reached this round".
- Redo dates are today + gap (6 days with 29 days left), so they are normally not due today. The replay button therefore says "Add to today's plan" and puts the items in the redo schedule, which Today shows under "Redo items scheduled". Items whose date is today or earlier join the plan path.
- Two redo items from earlier sessions (Set S07 from 28 Oct, Set S12 from 26 Oct) are seeded as due today so the plan, the "Redo due today 2" tile and the dropped-items line work from the first visit. Their due date is the device date. They are fictional and consistent with the pace history in demo_student.json.
- The pre-recorded sample replay uses the sample attempt data with fixed set labels (A to E) and schedules its redo dates from today's date.
- A "done" session in the weekday dots means at least 70% of planned minutes. This gives "4 of 5 planned sessions done" with the demo data.
- Topic rule: fewer than 5 attempts shows "Not enough data yet". The attempt count for Circular seating grows by one per attempt in this visit.
- The plan fills in the order drill, capped set, replay, redo, extra set; an item that does not fit is dropped, and later smaller items may still fit.
- Capped set on Today: the drill's top pick after a drill, otherwise the middle-difficulty set of the current round.
- Landing: scroll-driven Three.js scene on desktop. Static CSS version when WebGL is missing, reduced motion is on, or the screen is under 600 px wide.
- Secondary buttons use a conic-gradient beam border (CSS `@property`); browsers without it show the static border only.
- Selected chips are filled cream rather than gold, so gold stays reserved for the single primary action on a screen (the hover sweep is gold).
- Screenshots: the script patches `Date` with an offset so today reads 2026-10-31 while timers keep running; it moves the offset forward to reach the drill warning and the cap. Mobile shots use a 2x device scale factor. In full-page mobile shots the fixed tab bar appears mid-page; that is a capture artifact.
- No analytics, sound, backend, environment variables or server functions.
- `reference/inspiration/` (frames from other products) is git-ignored: it is input material only and should not be published with the demo. The rest of the supplied kit (specs, data, own diagrams) is committed.
