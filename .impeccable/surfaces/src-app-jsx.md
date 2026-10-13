---
version: 1
slug: "src-app-jsx"
primary_target: "src/App.jsx"
related_targets: ["src/index.css","src/components"]
---

# Surface brief: main screen (src/App.jsx)

Mode: Operate. An A–Z player opens this between games (second monitor or phone). Riot import is the main way players log games (user-confirmed 2026-10-12); manual + Win / + Loss is secondary.

Must stay: every feature, full use without an account, the title, meta and About copy (same wording), Riot attribution, and the stored data shape.

Chosen structure: Up Next Spotlight (dealt card), steered to an import-first hero, with the Run Ledger's compact table as the roster.

## Direction contract

THESIS: The run's next champion holds the first screen, and one click on Import brings in tonight's games and moves the run forward. This refuses the category default of a stats dashboard on top of a card grid.

OWN-WORLD: The incumbent Hextech world, pushed further. Near-black navy ground, engraved gold hairlines, Cinzel display type, Marcellus for labels, the platform sans for data with tabular figures. Data Dragon splash art bleeds into the dark field. Teal marks the current champion, green a win, red a loss. No gradient text, no glows, no cards inside cards.

STORY: See who's next and where you are, import or log the result, and watch the run advance onto the trophy shelf. The full roster is a ledger beneath.

FIRST VIEWPORT: A slim top bar (name, run switcher, Run settings, Share, account). Then a full-width banner: splash art on the right, faded into the field on the left. In the left column: the name in Cinzel at about 6rem, the title, "#38 of 173", record and last KDA, then the primary Import button with the saved Riot ID (an inline Riot ID field on first visit), with + Win / + Loss as secondary buttons. An A→Z track of 26 letter segments sits along the bottom edge. The trophy shelf starts below.

FORM: Up Next Spotlight, #1 on my ordered list. seed: none (unavailable)

Signature interaction: after an import or win, the recap lands in the banner, the A→Z track advances, and the banner moves on to the next champion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Open decisions
- Seed reference: this version of the CLI has no SEED REFERENCE output or --check-seed verb, so the reference is recorded as unavailable.
