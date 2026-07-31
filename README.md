# LoL A–Z Challenge Tracker

A tracker for the **League of Legends A–Z challenge** — play every champion, one at a
time, in alphabetical order. Check each champion off as you go and record how the game went.

## Features

- Full champion roster pulled live from **Riot Data Dragon** (official names + icons),
  sorted A→Z and cached locally for 24h.
- Per-champion tracking: **completed** toggle, **win/loss**, **role** played, **notes**,
  and **date**.
- Progress bar, win/loss record, win rate, and an "up next" pointer to the next champion.
- Filter (all / remaining / completed / wins / losses) and search.
- Progress is saved automatically in your browser (`localStorage`) — no login needed.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

Build for production with `npm run build` (output in `dist/`).

## Project structure

```
src/
  api/dataDragon.js      # Riot Data Dragon client (champion list + icons)
  storage/storage.js     # Persistence layer (localStorage today)
  components/            # ProgressHeader, ChampionCard
  constants.js          # roles, results, filter definitions
  App.jsx               # app state + wiring
```

## Adding cloud sync later

Persistence is deliberately isolated in [`src/storage/storage.js`](src/storage/storage.js).
All the app knows about are `loadRun()`, `saveRun(run)`, and `clearRun()`. To move from
local-only to Firebase (Auth + Firestore) for cross-device, multi-user runs, reimplement
those functions against Firestore — the components don't need to change.

## Attribution

Champion data and images © Riot Games, retrieved via Data Dragon. This project isn't
endorsed by or affiliated with Riot Games.
