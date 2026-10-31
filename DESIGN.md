# Design direction for Pace

Read this after BUILD_SPEC.md. Where the two disagree on visuals, this file wins. Section 10 of BUILD_SPEC.md is replaced by this file.

The site must not look AI-generated or templated. The way to get there is a small number of strong, specific ideas applied consistently, real copy, and restraint. The six reference sheets in `reference/inspiration/` show what to borrow. Each sheet is 8 frames from a screen recording. **Borrow the technique named below, never the content, art, logos, colours or text of those products.**

---

## 1. Mood in one line

A dark, quiet training room for a high-stakes exam: warm cream text on a plum-black ground, one gold light that marks the next action, and an ember colour that appears only when time is running out.

## 2. Palette (dark only)

The demo shows features proposed for Prepito, so the palette sits in the same family as a plum-and-cream study product (plum-black ground, cream text, warm gold accent) without copying any of Prepito's actual values or layout. Use exactly these tokens as CSS custom properties.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0E0B10` | Page background (plum-black) |
| `--surface` | `#17131A` | Cards, sidebar |
| `--surface-2` | `#211A25` | Raised cards, inputs, hovered rows |
| `--line` | `rgba(243,237,228,0.08)` | Hairline borders, dividers |
| `--text` | `#F3EDE4` | Primary text (warm cream) |
| `--muted` | `#A79E96` | Secondary text, labels |
| `--faint` | `#6E6670` | Tertiary text, watermark words at low opacity |
| `--gold` | `#E9B04A` | The single accent: primary buttons, active nav, current step, focus rings |
| `--gold-hi` | `#F7D27A` | Top of the gold button gradient |
| `--gold-glow` | `rgba(233,176,74,0.35)` | Glow under primary buttons and active slabs |
| `--plum` | `#5B2B52` | Secondary: selected rows, "your order" markers. Use sparingly. |
| `--ember` | `#E36A3C` | Time warnings only: last 60 s before the cap, the cap dialog |
| `--ok` | `#3FB37F` | Correct answers |
| `--bad` | `#E5484D` | Wrong answers |

Rules:
- Gold appears on **at most one primary action per screen**. Everything else is cream, muted or outlined.
- Ember appears **only** in timing contexts. Never decorative.
- No purple-to-blue gradients, no neon, no rainbow charts. The only gradient allowed is the gold button (`--gold-hi` to `--gold`, top to bottom).
- Contrast: body text on `--bg` and `--surface` must pass WCAG AA. Check muted text too.

## 3. Type

- Font: **Onest** (Google Fonts, OFL licence), weights 300, 400, 500 only. Fallback: system UI stack.
- Display and section headlines: Onest 400, uppercase, letter-spacing -0.012em, line-height 1.05. Desktop 46 px, mobile 32 px. Used sparingly: landing chapters and one headline per app screen at most.
- Body: Onest 300 to 400, 16 to 17 px, line-height 1.55, max line length about 68 characters.
- Small labels: 11 to 12 px, uppercase, letter-spacing 0.14em, `--muted`. A small gold dot before the label marks the active chapter or section ("● CHAPTER 01 — THE PICK").
- Numbers (timers, minutes, counts): `font-variant-numeric: tabular-nums`. Timers are large (48 to 64 px), weight 300.
- Big chapter numerals (`01 02 03 04`): 28 to 32 px, weight 300, `--faint`; the active one is `--gold`.

## 4. Buttons: exactly three kinds

Do not invent any other button style.

1. **Primary (from sheet `v8_gold_pill`):** a rounded pill with the gold gradient, dark text (`#1A1206`), 14 px 500 weight, a small line icon after the label, and a soft gold glow underneath (`box-shadow: 0 10px 30px -8px var(--gold-glow)`). On hover the glow grows slightly and the button lifts 1 px. One per screen.
2. **Secondary (from sheet `v6_beam_pill`):** a dark glass pill (`--surface` at 80% with a 1 px `--line` border and a faint inner top highlight). On hover or keyboard focus, a thin light "beam" travels once around the border (a conic-gradient border masked to the stroke, animated 1.2 s). Cream text, small arrow icon.
3. **Chip (from sheet `v7_fill_chip`):** for small choices such as the 30 / 45 / 60 / 90 minute chips and filters. Cream outline pill; on hover the gold fill sweeps in from the left (about 250 ms). Selected state stays filled.

All buttons: minimum 44 px tall on touch, visible focus ring in gold, disabled state at 40% opacity.

## 5. Screen by screen: what to borrow from where

### 5.1 Landing page `/#/` (technique from sheet `v3_scroll_chapters`)

This is a new route in front of the app. Build it as an **original** scroll story. Take only the *techniques* of that reference: a giant word behind a 3D scene, numbered chapters, a small chapter label, a vertical side label, an uppercase tight headline, and a scroll that moves the camera from chapter to chapter. **Do not use any temple, moon, torii, tree, lantern, Japanese text, the word "KAGE", its copy, its images or its source. Do not fetch anything from threeui.com.**

- **Scene:** Three.js (npm `three`, MIT). Five translucent dark slabs (the five "sets"), slightly rounded, with a thin cream edge and a soft gold glow underneath, floating at different depths. A slow idle drift. The background is `--bg` with a very subtle radial vignette.
- **Giant word:** "PACE" in Onest 400, about 38 vw, cream at about 85% opacity, sitting behind the slabs so the slabs partly cover it.
- **Four chapters**, advanced by scroll (and by clicking the numerals bottom-left):
  1. `CHAPTER 01 — THE PICK` · headline "FIVE SETS. FOUR MINUTES. CHOOSE YOUR START." · the slabs rearrange into a ranked row; the first glows gold.
  2. `CHAPTER 02 — THE CAP` · "KNOW WHEN A SET IS COSTING YOU." · camera moves close to one slab; a thin ring timer around it closes and turns ember.
  3. `CHAPTER 03 — THE REPLAY` · "TEN MINUTES. NOTHING TO TYPE." · slabs lay out flat on a horizontal timeline with tick marks.
  4. `CHAPTER 04 — THE PLAN` · "A SESSION THAT FITS YOUR DAY." · slabs stack into a short vertical checklist.
  Each chapter has one 2-line body paragraph (plain words, from BUILD_SPEC section 1), and the last chapter shows the primary button "Start today's plan" plus the secondary "See the drill".
- **Chrome:** top-left small wordmark "PACE" with the subtitle "decision practice · concept demo" in small caps; top-right text links Today · Drill · Replay · About; right edge a vertical label "DECISION PRACTICE" in small caps; bottom-left the numerals `01 02 03 04`; bottom-right a tiny counter "29 DAYS TO CAT".
- **Performance:** lazy-load Three.js only on this route (dynamic import). Cap the device pixel ratio at 1.75. Pause rendering when the tab is hidden or the canvas is off-screen.
- **Fallbacks:** if WebGL is unavailable, or `prefers-reduced-motion: reduce` is set, or the screen is under 600 px wide, show a static CSS version: the giant word, five layered flat cards and the chapters as normal stacked sections. It must still look intentional.
- The credit footer (BUILD_SPEC section 2) appears at the end of the landing page.

### 5.2 App shell (technique from sheet `v2_sidebar_widgets`)

- **Desktop:** a left sidebar on `--surface`, about 232 px wide: the wordmark at the top, then nav items with a line icon and label (Today, Set-pick drill, Replay, About). The active item is a filled cream pill with dark text. A collapsed icon rail between 768 and 1100 px.
- **Mobile:** the sidebar becomes a bottom tab bar with 4 icons and labels.
- **Top bar:** "Hey, Demo student" on the left; a chip "29 days to CAT · 29 Nov" on the right.
- **Do not borrow** that product's banners, ads, book covers, leagues, flame streaks or logo.

### 5.3 Today `/#/today` (technique from sheets `v1_path_home` and `v2_sidebar_widgets`)

- Small greeting line, then a **two-card hero**:
  - **Left, narrow card "This week":** a row of seven weekday dots (Mon to Sun). Filled cream = a session done, outlined = planned, gold = today. Under it, one line: "4 of 5 planned sessions done". This is a training log, **not a streak**: no flame, no streak counter, no points.
  - **Right, wide card**, labelled with a small gold tag "RECOMMENDED · TODAY": "Today's plan · 48 of 60 min". Below it, the plan as a **vertical path of nodes** joined by a thin line (drill → capped set → replay → redo items). Each node is a small code-drawn disc (concentric circles with a soft inner shadow), its label and minutes. The current node is gold. One primary button: "Start".
- The time input sits above the hero as chips (30 / 45 / 60 / 90) plus a small number field. Changing it re-flows the path with a short 200 ms transition.
- Below the hero, **three stat tiles** in a row: "Planned 48 min", "Your pace ×1.14 (estimate)", "Redo due today 2". Each tile has a big tabular number, a muted label and a tiny code-drawn line icon at the bottom. No percentage rings.
- "How this plan is sized" stays as an expandable panel under the tiles, and "Topics" as a quiet list with "Not enough data yet" badges.

### 5.4 Set-pick drill `/#/drill` (technique from sheet `v4_tilted_slabs`)

- The 5 set previews are drawn as **physical slabs** in a row on desktop: CSS `perspective: 1200px`, each card `rotateX(14deg)`, a darker top face, a thin cream edge, and a coloured glow strip under each slab. The glow encodes **the student's current rank**: rank 1 brightest gold, fading to faint at rank 5. It never encodes difficulty.
- Dragging a slab lifts it (translateZ and a stronger shadow). The others slide to make room (spring easing, about 250 ms).
- On mobile the slabs become a vertical list without tilt, keeping the glow strip on the left edge.
- The timer sits top-centre: big tabular numerals, `--text`, switching to `--ember` in the last 60 seconds.
- The background behind the slabs has a very faint large watermark of the round number ("ROUND 1") in `--faint` at about 6% opacity.

### 5.5 Drill result `/#/drill/result` (technique from the segmented meters in sheet `v4_tilted_slabs`)

- Two columns, **Your order** and **Recommended order**. Each row shows the set code and a **segmented meter** of estimated minutes: one short vertical bar per minute (5 to 12 bars), bars filled cream with a soft glow, and the row's colour slightly tinted gold if the set is in the correct position. Thin connecting lines between the columns show where each set moved.
- The headline sentence ("Your order agreed with the recommended order on 7 of 10 pairs") is the only display-size text.
- The "estimate" note is always visible, in muted small text.

### 5.6 Capped attempt `/#/attempt/:setId` (technique from the lesson screen in sheet `v1_path_home`)

- **Focus mode:** hide the sidebar and the tab bar. A close "×" button top-left (asks "Leave this set?").
- A thin progress bar across the top shows time used against the cap: cream, turning ember in the last 60 seconds. The time text sits at its right end: "03:12 / 07:40".
- Content is centred, max width about 1040 px: the clue list on the left (numbered, each with an "I'm on this clue" toggle), the three questions on the right. Options are outlined boxes in a row (2 × 2 on mobile); the chosen one gets a cream fill.
- "Finish" is the primary button, bottom-centre.
- The cap dialog is a centred card on a dimmed backdrop, with an ember top border and the two choices from BUILD_SPEC 6.4 as a primary and a secondary button.

### 5.7 Replay `/#/replay` (technique from sheet `v5_timeline_carousel`)

- A horizontal **carousel of "moments"**. The centred card is full size and bright. The cards on either side are smaller (scale 0.82) and dimmed (opacity 0.45). A thin vertical cream line marks the centre. A row of fine tick marks runs behind the cards like a timeline.
- A **giant faint watermark** behind everything shows the day ("SAT") in `--faint` at about 7% opacity, so it reads as a date stamp.
- Above the centred card: a tiny date and time label and the moment's title.
- Moments, in order:
  1. Where your time went (minutes vs cap bars)
  2. The start you chose vs the recommended start
  3. Where you stalled (the clue text)
  4. to 6. One card per redo item, with its scheduled date
- Navigate with arrow keys, swipe, or by clicking a side card. Below the carousel, a plain stacked list of the same content for screen readers and quick scanning.
- The "Add to today's plan" primary button sits under the carousel.

### 5.8 About `/#/about`

A calm long-read page: the small-caps label style, one uppercase headline, comfortable body text, the formulas set as small monospace-free inline blocks on `--surface`. No illustrations needed.

## 6. Motion

- Easing: `cubic-bezier(0.2, 0.8, 0.2, 1)`. Durations 200 to 400 ms. Only the landing scene runs longer motion.
- Motion explains state (reordering, timer warning, moving between moments). No decorative floating, parallax or bouncing elsewhere.
- Respect `prefers-reduced-motion` everywhere: replace movement with opacity changes.

## 7. Icons and drawing

- Icons: Lucide (MIT), 1.5 px stroke, 18 to 20 px. Nothing filled, no emoji.
- Every visual is code-drawn: Three.js for the landing, CSS and SVG elsewhere. **No image files, no stock photos, no AI-generated art.**

## 8. Anti-"AI slop" checklist (check every screen before finishing)

- [ ] No generic hero copy ("Unlock your potential", "Supercharge", "Seamless", "AI-powered").
- [ ] No purple or blue gradients, no glassmorphism on every card (glass is for the secondary button only).
- [ ] Not everything centred: the app screens use left-aligned text and asymmetric two-card layouts.
- [ ] One primary (gold) action per screen.
- [ ] Spacing on an 8 px grid; consistent card radius (14 px for cards, full pill for buttons).
- [ ] At most two font weights visible per screen, plus the timer.
- [ ] Real, specific copy everywhere (minutes, set codes, dates). No lorem ipsum, no placeholder names beyond the fictional puzzle names.
- [ ] No emoji, mascots, confetti, streak flames, badges or leaderboards.
- [ ] Every number that is an estimate says so.

## 9. Do not copy (from any reference)

- From sheet `v1_path_home`: its purple brand colour, 3D illustrated icons, mascot, leagues, XP, wording and logo.
- From sheet `v2_sidebar_widgets`: its banners, ads, book covers, logo, league and streak widgets.
- From sheet `v3_scroll_chapters`: all art (temple, moon, trees, lanterns, grass), the word "KAGE", any Japanese text, any of its copy, its red accent, its source code and assets.
- From sheet `v4_tilted_slabs`: its labels ("Annual growth", "Member retention", …) and task text.
- From sheet `v5_timeline_carousel`: the social posts shown in it.
- From Prepito: its logo, cat mascot, layouts, exact colours, questions or text.

If a screen starts to look like a recognisable copy of any reference, change it.
