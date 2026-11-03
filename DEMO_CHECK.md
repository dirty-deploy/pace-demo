# Demo check: the 7-step live path

Checked on the production build (`vite preview`) at 1440x900 and 390x844 by `scripts/audit.mjs` (flow "2. Demo path"), browser date pinned to Wed 4 Nov 2026. Status: **Works** = worked before this pass, **Fixed** = fixed in this pass.

## Before you go on stage (do this, step 4 depends on it)

The cap on a DILR set is the real cap: 5 to 8 minutes of set time. You cannot wait that long in a 7-minute talk. Prepare a near-cap set in a **separate window** (an Incognito window or a second Chrome profile), because "Explore with a demo profile" resets everything in the window where you click it.

1. In the separate window, open the site, click **Explore with a demo profile**.
2. Sidebar: **DILR set-pick drill** → **Lock in my order** → **Try the recommended first set**.
3. Answer one question. Watch "Set time m:ss of m:ss cap" under the question until it is about 20 seconds short of the cap.
4. Click **Save and exit** (palette column). The set clock stops while you are away.
5. On stage, when you reach step 4: switch to this window, go to **Home**, click **Resume** on the set. The cap dialog appears in about 20 seconds.

Checked: a set saved at 6:20 of a 6:40 cap resumed at 6:20 and showed the cap dialog 20 seconds later.

## The path

| # | Step | Exact clicks | What you should see | Status |
|---|---|---|---|---|
| 1 | Landing | Open `/` → **Explore with a demo profile** | Home loads, greeting for the demo student | Works |
| 2 | Home | (no click) | "Today's plan" with the plan items, streak, days to CAT | Works |
| 3 | Set-pick drill | Sidebar **DILR set-pick drill**. Reorder with drag or the arrow buttons on each set card. **Lock in my order** | The 4:00 drill timer counts down before you lock in. The result compares your order with the recommended one | Works |
| 4 | Capped DILR attempt | **Try the recommended first set** (or the prepared window above). At the cap: **Take 2 more minutes (once)**, or **Leave this set** | "Time to decide" dialog at the cap. After 2 more minutes, "Your extra time is used" with no second extension | Works |
| 4b | Leave | **Leave this set** | Goes straight to this attempt's 10-minute replay | **Fixed** (it used to stay in the test with a "No sets left" toast) |
| 5 | 10-minute replay | (lands on the **Replay** tab) | Your own attempt (not the sample replay): time per set, the cap, redo picks | Works |
| 6 | Review of a test | Sidebar **Review** → **Full mock 1** → **Questions** tab → question **1** | Option bars with % (sum 100), tick on the right option, **You** tag, **Sample data** tag | Works |
| 6b | Explanation | **Explanation** tab (right) | Trap tag, then full sentences: "B is right: ...", "C goes too far: ..." | **Fixed** (lines used to read "That is the second option.") |
| 6c | Community | **Community** tab → type in **Add your answer** → **Post answer** | Sample answers tagged; yours appears at once. Page no longer scrolls sideways | **Fixed** (page was 1465 px wide at 1440) |
| 6d | Vocabulary card | **Explanation** tab, then click a dotted word in the passage (Q1: "exorbitant") → **Add to my words** → **Close** | Card with the simpler word; the word is then in **Vocabulary** | Works |
| 7 | Planner quick add | Sidebar **Planner** → type `DILR sets 7pm 45m` in "Try: DILR sets 7pm 45m" → read the chip → **Enter** | Chip "DILR · DILR sets · Today 7 pm · 45 min"; block appears today at 7 pm | Works |

Also fixed and visible during the demo if you open them: result page says "Around 99.4 percentile" for 93/204 (was 95); DILR sectionals say "Question 1 of 22"; the credit in the test window sits under the palette instead of under the options; Streak's month total includes today.

If something goes wrong: **Settings → Your data → Reset demo**, or reload (progress is saved in the browser).
