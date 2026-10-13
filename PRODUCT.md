# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

League of Legends players doing the A–Z challenge: playing every champion one at a time, in alphabetical order, usually over weeks or months. The live site has 1000+ users. **Open:** no data yet on who they are (casual players, streamers or creators, completion-focused grinders). Don't design for one segment as if it were confirmed.

## Product Purpose

A free tracker for the A–Z challenge. It knows where you are in the run, keeps a log of every game on every champion, and imports matches from Riot so nothing needs to be entered by hand. Success means a player can open it after a game, see their progress and what's next at a glance, and trust that their run is saved.

## Positioning

Built for the A–Z challenge rather than as a general stats site. Order, progress, "up next" and completion rules all follow the challenge. On top of that it offers one-click Riot match import, per-run rules for what counts as done, and runs limited to a single champion class.

## Operating Context

- Usually opened between games, often on a second monitor or a phone next to the League client.
- Two ways to log: auto-import from a Riot ID (by last N games or by date range, filtered by queue) or manual entry. **Riot import is the main draw and the main way players log games** (per the developer). Design should put import first and manual entry second.
- Signed out, data lives in browser storage. Signed in with Google, it syncs live through Firestore.
- Players share progress by generating a canvas-drawn share card image.
- Live at lolazchallenge.xyz on Vercel. A Vercel serverless function proxies the Riot API, and Vercel Analytics is installed.

## Capabilities and Constraints

- **Stack:** React 18 and Vite, plain JavaScript (no TypeScript), Firebase Auth and Firestore on the Spark (free) plan, deployed on Vercel. One stylesheet: `src/index.css`.
- **Champion roster:** comes live from Riot Data Dragon with icons, sorted A–Z. Non-standard `_` variant ids are filtered out.
- **Per-champion data:** a game log (win/loss, date, source, KDA) plus role, notes, and a fun rating (half stars, 0.5–5). Win/loss counts, games-to-win, and completion are all derived from the log.
- **Runs:**
  - Multiple runs per player.
  - Each run sets its own completion mode ("win" means play until you win; "any" means one game counts).
  - A class filter (Fighter, Tank, Mage, Assassin, Marksman, Support) narrows the run's pool. Order, numbering, and progress all follow the narrowed pool.
- **Views:** grid and list layouts, filters, search, a progress header, a first-visit Welcome intro, and an About section.
- **Privacy:** a privacy policy (`public/privacy.html`) and a self-serve "delete my data" option.
- **Planned: Contact the developer.** A section for bug reports and feedback. Submissions go to a Firestore collection (no new third-party service), and the developer reads them in the Firebase console.
- **Must be preserved through the UI overhaul:**
  - The full current feature set. The overhaul is visual and UX work, not a cut to functionality.
  - Full use without an account. Sign-in stays optional.
  - The page title, meta description, and crawlable About section copy, all tuned for search.

## Brand Commitments

- Name: **LoL A–Z Challenge Tracker**. Domain: **lolazchallenge.xyz**. Both are fixed.
- Required attribution: "Champion data & images © Riot Games, via Data Dragon. Not endorsed by Riot Games." Riot assets are used under Riot's terms, and the site must never imply Riot endorses it.

## Evidence on Hand

- A live user base of 1000+ users, with no usage breakdown or segmentation yet.
- No testimonials, press, reviews, or user quotes. Don't invent any.
- Product facts and feature copy live in `README.md`, and SEO copy in `index.html` and the About section of `src/App.jsx`.

## Product Principles

1. **The run comes first.** Where you are, what's next, and how far you've come should be clear in seconds, between games.
2. **No logging chores.** Import first, manual entry as a fallback, and nothing typed twice.
3. **Your data, your call.** Works with no account, syncs if you choose to sign in, and can be deleted at any time.
4. **Preserve what players have built.** Changes must never lose or quietly reinterpret a player's existing runs and logs.
