---
name: LoL A–Z Challenge Tracker
description: The run's next champion holds the screen; one Import moves the A–Z run forward.
colors:
  hex-black: "#010a13"
  hex-navy: "#0a1428"
  hex-panel: "#0a1a2f"
  hex-panel-2: "#071523"
  hex-raise: "#0e2138"
  hex-rule: "#10203a"
  hex-track: "#1a2a3c"
  hex-empty: "#3a4c63"
  gold: "#c8aa6e"
  gold-bright: "#f0e6d2"
  gold-dim: "#8a6a35"
  gold-line: "#463714"
  gold-hair: "#2b2412"
  blue: "#0596aa"
  blue-bright: "#0ac8e6"
  win: "#2ee08a"
  loss: "#ff6b78"
  loss-ink: "#ffd2d6"
  text: "#e6e0d0"
  text-dim: "#a8a293"
  text-faint: "#8d8878"
typography:
  display:
    fontFamily: "Cinzel, Georgia, 'Times New Roman', serif"
    fontSize: "clamp(3rem, 8vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Cinzel, Georgia, 'Times New Roman', serif"
    fontSize: "1.35rem"
    fontWeight: 600
  letter-divider:
    fontFamily: "Cinzel, Georgia, 'Times New Roman', serif"
    fontSize: "1.05rem"
    fontWeight: 700
  title:
    fontFamily: "Marcellus, Georgia, serif"
    fontSize: "1.15rem"
    fontWeight: 400
  name:
    fontFamily: "Marcellus, Georgia, serif"
    fontSize: "1.05rem"
    fontWeight: 400
  stat:
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    fontFeature: "tnum"
  body:
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif"
    fontSize: "0.87rem"
    fontWeight: 600
  field-label:
    fontFamily: "Marcellus, Georgia, serif"
    fontSize: "0.87rem"
    fontWeight: 400
rounded:
  none: "0px"
  control: "2px"
  avatar: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
  gutter: "clamp(16px, 3vw, 40px)"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.hex-black}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.gold-bright}"
    textColor: "{colors.hex-black}"
  button-primary-lg:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.hex-black}"
    rounded: "{rounded.control}"
    padding: "12px 26px"
    height: "54px"
  button-outline:
    textColor: "{colors.gold-bright}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
    height: "40px"
  button-ghost:
    textColor: "{colors.text-dim}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
    height: "40px"
  button-ghost-hover:
    backgroundColor: "{colors.hex-panel}"
    textColor: "{colors.gold-bright}"
  button-win:
    textColor: "{colors.win}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
    height: "40px"
  button-loss:
    textColor: "{colors.loss}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
    height: "40px"
  segmented-selected:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.hex-black}"
    padding: "6px 14px"
    height: "36px"
  chip:
    textColor: "{colors.text-dim}"
    rounded: "{rounded.control}"
    padding: "6px 14px"
    height: "36px"
  chip-selected:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.hex-black}"
  input:
    backgroundColor: "{colors.hex-panel-2}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
    height: "40px"
  panel:
    backgroundColor: "{colors.hex-panel}"
    rounded: "{rounded.none}"
    padding: "20px 24px"
  toast:
    backgroundColor: "{colors.hex-raise}"
    textColor: "{colors.text}"
    rounded: "{rounded.none}"
    padding: "8px 8px 8px 18px"
---

# Design System: LoL A–Z Challenge Tracker

## Overview

**Creative North Star: "The Hextech Ledger"**

The tracker reads like an engraved ledger kept inside the League client: a near-black navy field, thin gold hairlines that rule the page into sections, and one champion's splash art bleeding in from the right as if lit from behind the glass. The current champion is the hero; everything else (the trophy shelf, the alphabet roster) sits beneath it as record-keeping. Density is calm at the top and tight below: the Spotlight breathes, the roster is a compact table with letter dividers.

Ornament comes from type and line, never from effects. Cinzel carries names and section heads with carved, inscriptional weight; Marcellus softens labels and champion names; the platform sans handles every number and control, always with tabular figures. Color is almost entirely gold-on-navy, with three signals that each mean exactly one thing: teal is now (the current champion and anything live), green is a win, red is a loss.

Corners are square or nearly so. Depth is drawn with hairlines and tonal steps, with a soft dark drop shadow only on surfaces that float above the page (Run settings, the toast, the share dialog).

**Key Characteristics:**
- Near-black navy ground with gold hairline rules dividing every region.
- Splash art masked into the field from the right; a navy scrim keeps the text column clean.
- Cinzel display at up to 6rem for the current champion; Marcellus for names and field labels; system sans with tabular figures for data.
- Teal = current/live, green = win, red = loss; gold for everything structural and the primary action.
- Square panels, 2px control corners, no nested cards.
- Motion is a short rise on reveal and a slow fill on the A→Z track; all of it collapses under reduced motion.

## Colors

A gold-on-navy palette in which three accent signals each carry a single meaning.

### Primary
- **Hextech Gold** (gold): the primary button fill, the pressed segment, completed letters on the A→Z track and its fill bar, roster letter dividers, the focus ring, links, the selection tint, and star fills.
- **Pale Gold Parchment** (gold-bright): hover state of the primary button; display and headline text; any text promoted on hover.
- **Burnished Gold** (gold-dim): outline-button and dialog borders, the roster header rule, the trophy-shelf icon frames, hover borders on controls.
- **Engraved Line** (gold-line): the default 1px border on every control, panel and divider; the top-bar rule.
- **Hairline Gold** (gold-hair): the faintest rule, inside lists (game rows, letter-row underline, settings footer).

### Secondary
- **Hextech Teal** (blue-bright): the current champion ("Up next, 38 of 173", the current A→Z segment and roster row frame), and live system state (syncing, import progress, "Riot" source tag). Teal never marks a selection; selection is gold.
- **Deep Teal** (blue): the border of the pending "apply settings" notice.

### Tertiary (semantic)
- **Victory Green** (win): win counts, the + Win button, the done check, recap "done" marks.
- **Defeat Red** (loss): loss counts, the + Loss button, destructive buttons, field and import errors.
- **Blush Ink** (loss-ink): body text inside the loss-tinted import error box.

### Neutral
- **Void Black** (hex-black): the page ground and the sticky roster header.
- **Hextech Navy** (hex-navy): the top of the share card's tonal ground.
- **Rule Navy** (hex-rule): ledger row dividers.
- **Track Navy** (hex-track): the empty part of every A→Z segment, on the page and the share card.
- **Empty Star** (hex-empty): an unfilled rating star.
- **Panel Navy** (hex-panel): Run settings, the share dialog, ghost-button and recap-item hover fill.
- **Deep Panel** (hex-panel-2): the Spotlight ground and input fields.
- **Raised Navy** (hex-raise): the toast.
- **Parchment Text** (text): body text.
- **Dim Text** (text-dim): secondary text, labels, hints, meta lines.
- **Faint Text** (text-faint): row numbers, placeholders, unreached A→Z letters. All three text tones hold at least 4.5:1 on Void Black and Panel Navy.

### Named Rules
**The One Meaning Rule.** Teal means now, green means won, red means lost. None of the three is used decoratively, and no fourth signal color exists.

**The Gold Fill Rule.** A solid gold fill marks the one primary action in its region (Import, Apply, Download) or the pressed segment of a segmented control. Everything else is outlined or ghosted.

**The Tinted Signal Rule.** A signal color used as a background appears only as a low tint of itself (teal at 6–10%, green and red at 8%) behind a full-strength border or text of the same hue.

## Typography

**Display Font:** Cinzel (with Georgia, Times New Roman)
**Label Font:** Marcellus (with Georgia)
**Body / Data Font:** Segoe UI (with system-ui, -apple-system)

**Character:** Cinzel's carved capitals give champion names and section heads the weight of an inscription; Marcellus is its softer cousin for names and labels. All numbers and controls drop to the platform sans so data stays fast to scan.

### Hierarchy
- **Display** (Cinzel 700, clamp(3rem, 8vw, 6rem), 0.95): the current champion's name in the Spotlight only. Steps down to clamp(2.4rem, 6vw, 4.5rem) when the run is complete.
- **Headline** (Cinzel 600, 1.35rem): section heads (Trophy shelf, roster). Run-settings legends use Cinzel 600 at 1rem; About uses 1.25rem.
- **Letter divider** (Cinzel 700, 1.05rem, gold): the A, B, C rows that break the roster ledger.
- **Title** (Marcellus, 1.15rem): the Spotlight subtitle line and the import recap summary.
- **Name** (Marcellus, 1.05rem): champion names in roster rows and recap items.
- **Stat** (sans 600, 1.5rem, tabular): record and last-game figures in the Spotlight.
- **Body** (sans 400, 15px, 1.5): everything else. Long prose holds to 52–70ch; About runs at 1.7 line height.
- **Label** (sans 600, 0.87rem): small buttons, chips, segments, table headers.
- **Field label** (Marcellus, 0.87rem, dim): the label above every form field.

### Named Rules
**The Tabular Figures Rule.** Every number (positions, records, KDA, counts, dates in tables) is set with tabular figures, via the `num` utility or on the whole ledger.

**The Carved Names Rule.** Serif faces are for names and headings. Numbers, buttons and running text never use Cinzel.

## Layout

A single centered column up to 1440px wide with a fluid side gutter (clamp(16px, 3vw, 40px)) and 64px of bottom padding. The order is fixed: a slim top bar (64px, gold-line rule beneath), an optional Run settings panel, the full-width Spotlight, the trophy shelf, the roster ledger, then About and the footer.

The Spotlight is a flex column at least clamp(460px, 64vh, 620px) tall. Its text column is capped at 680px with fluid padding (clamp(28px, 5vw, 56px) top, clamp(20px, 4vw, 56px) sides). Splash art occupies the right 72%. Actions sit at the bottom of the column via auto margin; the 26-segment A→Z track spans the bottom edge as an even grid.

Spacing is on a 4px base. The recurring steps are 4, 6, 8, 12, 16, 24 and 48px: 6–8px between related controls, 14–16px inside groups, 24px between Spotlight blocks, 48px between page sections, 72px before About.

Responsive behavior:
- **≤1100px:** the roster drops its KDA and role columns.
- **≤860px:** the expanded roster detail stacks to one column; top-bar button labels become visually hidden, leaving icons.
- **≤720px:** the top bar loses its rule and shortens the brand to "A–Z"; the run picker takes the free width. The Spotlight goes edge to edge, drops its minimum height, and swaps the splash for the portrait loading art, masked on two axes. Import and manual-log controls go full width. The A→Z track tightens to 2px gaps with 0.7rem letters. The roster hides W/L, rating and row numbers; search goes full width; shelf icons shrink to 38px.

## Elevation & Depth

Mostly flat: depth comes from tonal steps (Void Black ground, Deep Panel for the Spotlight and inputs, Panel Navy for floating panels, Raised Navy for the toast) and from gold hairlines. Shadows exist only under surfaces that sit above the page flow, and they are soft, dark and directionless in hue. The Spotlight's depth is photographic: the masked splash art and two navy scrims (a left-to-right scrim behind the text and a bottom fade behind the A→Z track).

### Shadow Vocabulary
- **Panel drop** (`box-shadow: 0 10px 30px -12px rgba(0, 0, 0, 0.7)`): the Run settings panel.
- **Toast drop** (`box-shadow: 0 16px 40px -12px rgba(0, 0, 0, 0.8)`): the bottom toast.
- **Dialog drop** (`box-shadow: 0 24px 60px -20px rgba(0, 0, 0, 0.9)`): the share dialog, over an 82% Void Black overlay.

### Named Rules
**The Hairline-First Rule.** Separate regions with a 1px gold rule or a tonal step before reaching for a shadow. A shadow means the surface floats.

**The No-Glow Rule.** Shadows are black, never colored. No glows around buttons, art or text.

## Shapes

Square by default. Panels, the Spotlight, the toast, the dialog, recap items and icon frames have no radius. Interactive controls (buttons, inputs, chips, segmented controls) take a barely-there 2px corner, enough to read as pressable without softening the engraved feel. The only round form is the account avatar. Champion icons are framed by a 1px border whose color carries state: gold-line at rest, gold when done, teal when current. The Spotlight carries a heavier gold bottom border than its sides, seating it on the page like a plaque.

## Components

### Buttons
Engraved and quiet: hairline outlines, with one gold fill per region.
- **Shape:** near-square (2px).
- **Primary:** gold fill, Void Black text, 40px tall, 8px 16px padding; large size 54px tall, 12px 26px, 1.06rem, used for the Spotlight's Import.
- **Hover / Focus:** primary brightens to Pale Gold; others shift border to Burnished Gold and text to Pale Gold. All transitions 160ms on the shared ease-out. Focus is a 2px gold outline at 2px offset.
- **Outline:** Burnished Gold border, Pale Gold text (Sign in, Copy).
- **Ghost:** transparent border, dim text; on hover or when active, gains the engraved line border and Panel Navy fill (top-bar actions).
- **Win / Loss:** outlined in the signal color at 50%, text in full signal; hover fills with an 8% tint.
- **Disabled:** 55% opacity with a progress cursor.
- **Link button:** underlined in Engraved Line, brightening to gold on hover; used for "Import options" and similar disclosures, its chevron rotating 180° when open.

### Segmented control and chips
- **Segmented:** a single engraved-line box split by internal rules; the pressed segment fills gold with black text. Used for exclusive choices (range, view, completion mode).
- **Chips:** individual outlined pills (2px) for multi-select (class pool, role); a selected chip fills gold with black text, the same as a pressed segment, so every selection in the app reads one way.

### Cards / Containers
- **Corner Style:** square.
- **Background:** Panel Navy for floating panels; Deep Panel for the Spotlight.
- **Shadow Strategy:** see Elevation; only floating surfaces carry one.
- **Border:** 1px Engraved Line; the share dialog uses Burnished Gold.
- **Internal Padding:** 20px 24px for Run settings, 20px for the dialog.
- Never nest one bordered container inside another; inner grouping uses hairline rules.

### Inputs / Fields
- **Style:** Deep Panel fill, 1px Engraved Line border, 2px corner, 40px tall (54px large), placeholder in Faint Text. A field label in Marcellus sits 6px above.
- **Hover:** border to Burnished Gold.
- **Focus:** border and a 2px outline in gold, no offset.
- **Quiet variant:** borderless, transparent, Marcellus in Pale Gold; used for the run switcher in the top bar.
- **Error:** a full-width line of red text beneath the row; import failures sit in a red-tinted, red-bordered block.

### Navigation
The top bar is a single 64px row: Cinzel 700 brand in Pale Gold, the quiet run switcher, then ghost icon-plus-label actions pushed right, and the account (avatar, sync state in dim or teal while syncing). A gold-line rule underlines it on wide screens. On narrow screens labels collapse to icons and the brand to "A–Z".

### Up Next Spotlight (signature)
The first screen. Splash art masked in from the right over Deep Panel, the champion name in display Cinzel, a Marcellus subtitle with the teal "Up next, N of M", a stat row, then actions at the bottom: the large gold Import button with the saved Riot ID beneath (or an inline Riot ID and region form on first visit) and a "Log by hand" + Win / + Loss pair. After an import, a recap replaces the import slot, ruled above in Burnished Gold, listing up to six champions as icon rows with W/L counts and green "done" marks. The art fades and scales in over 900ms; the text column rises in over 620ms with a slight blur clearing.

### A→Z Track (signature)
Twenty-six Cinzel letters over 4px bars along the Spotlight's bottom edge. Done letters and fills are gold; the current letter is teal with a 6px bar; letters with no champions in the run's pool drop to 35% opacity. Fills animate over 700ms.

### Roster Ledger
A full-width collapsing table with a sticky header (Void Black, Burnished Gold rule), Cinzel letter-divider rows, and 44px-tall row toggles (framed icon, Marcellus name, chevron). States: done rows dim their text and frame the icon in gold; the current row takes a 7% teal wash and teal frame and status; open rows expand a two-column detail (game log, role chips, star rating, notes) that rises in.

### Trophy Shelf
A wrapped strip of 44px champion icons in Burnished Gold frames, in A→Z order. Hover lifts an icon 2px and brightens its frame.

### Icons
One hand-drawn stroke set on a 24px grid at 1.75 stroke, round caps and joins, default 18px, always decorative (`aria-hidden`); the control carries the label.

### Motion
One easing for everything: `cubic-bezier(0.16, 1, 0.3, 1)`. Reveals use a 6px rise with fade (260ms for panels and details, 360ms for the recap); hover transitions run 160–200ms; the toast rises 12px over 320ms. Under `prefers-reduced-motion` every animation and transition collapses to 1ms.

## Do's and Don'ts

### Do:
- **Do** rule regions with 1px gold hairlines (Engraved Line, Hairline Gold) and step the navy tones for depth.
- **Do** keep teal for the current champion and live state, green for wins, red for losses (The One Meaning Rule).
- **Do** give each region at most one gold-filled action (The Gold Fill Rule).
- **Do** set every number in tabular figures and every name or heading in Cinzel or Marcellus.
- **Do** mask Data Dragon splash art into the field and back the text with a navy scrim so it never fights the controls.
- **Do** use the shared ease-out and the short rise for reveals, and honor reduced motion.

### Don't:
- **Don't** use gradient text, colored glows, or nested bordered cards.
- **Don't** round panels or containers; controls stop at 2px.
- **Don't** introduce a fourth accent hue or use teal, green or red as decoration.
- **Don't** set numbers, buttons or body copy in Cinzel.
- **Don't** add shadows to surfaces that sit in the page flow.

## Share card

`src/shareCard.js` draws the 1200×630 share image on a canvas and reads its colours from the `:root` tokens at render time, so it always matches the page. It follows the page's rules: square hairline frame with gold corner ticks, Cinzel run name, Marcellus subtitle below the heading (never an eyebrow above it), the 26-letter A→Z track, and stats separated by hairlines rather than boxed. "Fun" is the rating's name everywhere, the card included.

## Motion and reduced motion

Entrances use one ease-out curve. Under `prefers-reduced-motion`, panels and the spotlight still fade in (180ms, no travel, no blur) so changes stay legible; the toast appears without motion, and hover lift, chevron rotation and track-fill transitions are removed.
