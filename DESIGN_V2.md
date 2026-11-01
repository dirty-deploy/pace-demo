# Pace v2 design: a calm study app

This file **replaces** v1's `DESIGN.md`. Where they differ, this one wins.

## 1. The idea in one line

A well-made study notebook: warm paper background, dark ink text, one deep aubergine colour for actions, and a little gold only for rewards and streaks. It should feel like a place to concentrate, not a product launch.

**What v1 got wrong, and must not come back:** dark-only theme, giant display type, uppercase headlines, 3D slabs, glow effects, a light beam around buttons, chapter numerals, a cinematic landing page. Those say "tech demo". Students need clarity.

## 2. Colour tokens

Define as CSS custom properties on `:root` (light) and `[data-theme="dark"]` (dark). Use only these.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F8F6F2` | `#141216` | Page background (warm paper / soft ink) |
| `--surface` | `#FFFFFF` | `#1C1A1F` | Cards, sidebar, test panels |
| `--surface-2` | `#F2EFE9` | `#24212A` | Inputs, hovered rows, table stripes |
| `--line` | `#E6E1D8` | `#2F2B35` | Borders, dividers |
| `--text` | `#1F1B22` | `#EEEAF0` | Main text |
| `--muted` | `#6A6370` | `#A39CA8` | Secondary text |
| `--primary` | `#45234A` | `#C9A6CF` | Primary buttons, active nav, links, focus ring (deep aubergine) |
| `--primary-soft` | `#F1E9F2` | `#2D2333` | Selected rows, active tabs, chips |
| `--gold` | `#C98A1B` | `#E3AE4F` | Streak, coins, rewards only |
| `--ok` | `#2E7D53` | `#5CC28C` | Correct |
| `--bad` | `#B93A32` | `#F07A70` | Wrong |
| `--warn` | `#B9650F` | `#F0A04B` | Time warnings and the cap |
| `--info` | `#2F5E8C` | `#8DB7E3` | Marked-for-review in the test palette |

Rules:
- One filled `--primary` button per view. Other actions are outlined or text buttons.
- Gold never appears on buttons except in Rewards.
- No gradients, no glow, no coloured shadows. One soft shadow token for raised cards: `0 1px 2px rgba(31,27,34,.06), 0 4px 12px rgba(31,27,34,.04)`.
- Check WCAG AA for text and for the test palette colours (add a shape or letter to each palette state so colour isn't the only signal).

## 3. Type

- **UI and body:** "Onest" (Google Fonts), weights 400 and 500 (600 for numbers in stat cards only).
- **Page titles and the landing headline:** "Source Serif 4" (Google Fonts), weight 600, sentence case. A serif title gives the "notebook" feel; use it only for page titles (one per page) and the landing headline.
- Sizes: page title 28 px (mobile 24), section title 18 px / 500, body 15 to 16 px, small 13 px, labels 12 px sentence case (not uppercase, no wide letter-spacing).
- Line height 1.55 for body; reading pages (passages, notes, transcripts) max 68 characters per line and 17 px.
- Numbers: `tabular-nums`. Test timers 20 px / 500 in the header, never huge.

## 4. Layout

- **App shell:** sidebar 240 px on `--surface` with a thin right border. Navigation in labelled groups ("Practice", "Learn", "Progress", "Community"), small muted group labels, items with an 18 px Lucide icon and a label. The active item gets `--primary-soft` background and `--primary` text. The sidebar collapses to icons below 1100 px and becomes a bottom bar below 768 px.
- **Content width:** 1080 px max for app pages, 760 px for reading pages, full width for the test window and the planner.
- **Grid and spacing:** 8 px grid. Card padding 20 to 24 px. Gaps between blocks 16 to 24 px. Plenty of white space; nothing touches.
- **Cards:** radius 12 px, 1 px `--line` border, the soft shadow only on cards that can be clicked.
- **Above the fold:** at most four blocks. If a page needs more, use tabs or a "Show more" section.
- Left-aligned text. Centre only empty states and the landing hero.

## 5. Components (build these once, reuse everywhere)

- **Buttons:** Primary (filled aubergine, white text), Secondary (outlined), Ghost (text). 40 px tall (44 px on touch), radius 10 px, 14 px / 500 text, optional leading icon. Hover: slightly darker; press: 1 px down. No other button styles.
- **Chips:** selectable pills for filters and options, `--surface-2`; selected = `--primary-soft` with `--primary` text and a check icon.
- **Tabs:** text tabs with a 2 px underline in `--primary`.
- **Inputs:** 40 px, `--surface`, 1 px border, focus ring 2 px `--primary` at 35%.
- **Stat block:** big number (24 px / 600), small label under it, optional tiny trend text. Max 3 or 4 in a row.
- **Progress bar:** 6 px, rounded, `--primary` on `--surface-2`.
- **Tags:** small rounded labels for difficulty (Easy / Medium / Hard as text plus a dot), topic, status, and the **Sample data** tag (`--surface-2`, muted text, an info icon, a tooltip).
- **Empty states:** one line explaining what will appear and one button to make it happen. No illustrations needed; a single Lucide icon at 32 px is enough.
- **Toasts:** bottom-left, short, auto-dismiss, never covering the test timer or buttons.
- **Dialog:** centred card, max 480 px, clear title, one primary and one secondary action.

## 6. Screen notes

- **Home:** a calm column on the left (Today's plan, Continue) and a narrower column on the right (Streak). Today's plan is a checklist with durations and Start buttons, not a fancy path.
- **Test window:** the most important screen. It must feel exactly like an exam: white panels, clear question numbering, the palette on the right with a legend, the timer always visible top-right, buttons in a fixed bottom bar. No decoration at all. Passages scroll independently from questions.
- **Review question:** two columns on desktop. Left: question, the options with "How everyone answered" bars inline under each option (thin bars, percentage at the end, correct option in `--ok`, "You" tag on the student's choice). Right: tabs "Explanation" and "Community · 3". Vocabulary words have a dotted underline in `--primary`; the word card is a small popover.
- **Lesson player:** a 16:9 stage on `--surface` with slides drawn in SVG and HTML, controls under it (play, scrubber with chapter ticks, time, speed), the transcript on the right with the current line highlighted in `--primary-soft`, chapters and practice questions below.
- **Planner:** a clean week grid with hour labels, today's column lightly tinted, blocks as soft-coloured rounded rectangles by section (VARC, DILR, QA, Revision: four muted tints derived from the palette), the quick-add bar at the top with a placeholder "Try: DILR sets 7pm 45m", and template chips beside it.
- **Streak:** month grid of day cells (5 shades of `--gold` by minutes, empty for none), current and best streak as stat blocks, the rule in a sentence.
- **Rewards:** balance as a stat block with a small coin icon (a simple circle with "P" is not ours to use; draw a plain circle with a star or use the Lucide "coins" icon), earning rules as a clear table, Spend in Pace as three cards, and the Meridian discount calculator as a simple form with a live result line.
- **Landing:** sentence-case serif headline, one paragraph, two buttons, then three alternating sections each pairing a short text with a real rendered component preview (a mini test palette, a review card with option bars, a planner day). Credit footer. Nothing animates except a gentle fade-in.

## 7. Motion

150 to 250 ms ease-out for hover, tabs, dialogs and list changes. No parallax, no floating, no scroll-jacking. Respect `prefers-reduced-motion`.

## 8. Icons and imagery

Lucide icons, 1.5 px stroke, 18 to 20 px. No emoji. No mascots or characters. No stock photos, no AI images. Diagrams in lessons are clean SVG in the same palette.

## 9. "Doesn't look AI-made" checklist (check every screen)

- [ ] Light, calm, readable. Would a student happily study on this for two hours?
- [ ] Clear grouping: each page has one job; information is in categories, not piled up.
- [ ] One primary button per view.
- [ ] No gradients, glows, glass effects, neon, 3D, giant type or uppercase headlines.
- [ ] Real, specific copy and numbers everywhere; no lorem ipsum, no "coming soon", no generic hero lines.
- [ ] Consistent spacing, radius and type scale across all pages.
- [ ] Every number from other students has a "Sample data" tag; every estimate says it's an estimate.
- [ ] The test window looks like an exam, not a dashboard.
- [ ] No emoji, mascots or confetti.
- [ ] Works and looks deliberate at 390 px.

## 10. Do not copy

- From Prepito: the logo, cat mascots, coin artwork, the exact plum/cream values, screen layouts, banners, any text, questions or explanations.
- From any app used as inspiration (Brilliant, Marks, Kage and others): logos, illustrations, mascots, copy, colours.
- The inspiration sheets from v1 (`reference/inspiration/`) are now only loosely relevant. Use them for small things (the focused question screen, grouped sidebar, weekday cells) and ignore the dark/3D ones.
