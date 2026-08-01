# LoL A–Z Challenge Tracker

A tracker for the **League of Legends A–Z challenge** — play every champion, one at a
time, in alphabetical order. Check each champion off as you go and record how the game went.

## Features

- Full champion roster pulled live from **Riot Data Dragon** (official names + icons),
  sorted A→Z and cached locally for 24h.
- Per-champion **game log**: add each game as a Win/Loss (auto-dated, editable), delete
  games, and see which game the win came on. Win/loss counts and completion are *derived*
  from the log. Each game carries a `source` (`manual` today, `riot` when auto-import lands).
- Overall **role** played, **notes**, a **fun rating** (0.5–5 half-stars), and a manual
  **Done** override per champion. The header shows your **average fun** across rated champs.
- **Riot auto-import** — enter your Riot ID (`Name#TAG`) + region, pick a queue filter, and
  pull recent games straight from Riot's Match-V5 API. Each game is matched to a champion in
  the run's pool and added to its log (tagged "from Riot"); already-imported matches are
  skipped, so re-importing is safe.
- **Multiple runs** — keep several A–Z runs (e.g. one per season), switch between them from
  a dropdown; each has its own name, config, and progress.
- **Champion-pool filter** — scope a run to specific champion **classes** (Fighter, Tank,
  Mage, Assassin, Marksman, Support) for a "Marksman-only" or "Support-only" A–Z. Progress
  and A–Z order follow the filtered pool.
- Run-level **completion mode** toggle — count a champion done *on a win* (play until you
  win) or *on any game*. Completion is computed from the toggle, so switching it
  re-evaluates every champion retroactively.
- Progress bar, champions-won count, total games, average games-to-win, and an "up next"
  pointer to the next champion.
- Filter (all / remaining / in progress / completed / won) and search.
- **Optional Google sign-in** (Firebase Auth) syncs your run + settings across devices via
  Firestore, live. Signed out, everything is saved locally in `localStorage` — no login
  needed. First sign-in seeds the cloud from your local data.

## Firebase setup

Copy `.env.example` to `.env` and fill in your Firebase web config (Project settings → your
web app). Enable **Google** sign-in under Authentication, create a **Firestore** database,
and publish security rules that scope each user to their own doc:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

If `.env` is absent the app still runs in local-only mode (`firebaseEnabled` is false).

### Riot API (auto-import)

Add a **server-side** key (no `VITE_` prefix, so it never reaches the browser):

```
RIOT_API_KEY=RGAPI-...
```

Get a Development key at [developer.riotgames.com](https://developer.riotgames.com) (it
expires every 24h). **Restart the dev server** after changing it. In dev, requests go through
a Vite middleware proxy ([`vite.config.js`](vite.config.js) → [`server/riot.js`](server/riot.js))
so the key stays off the client. For production, port that same handler to a serverless
function (Cloudflare Worker / Vercel) — the core logic in `server/riot.js` is host-agnostic.

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
  storage/storage.js     # localStorage persistence + entry migration
  firebase.js           # Firebase init (guarded; no-op if unconfigured)
  auth.js               # useAuth hook (Google sign-in/out)
  useStore.js           # run + settings persistence: Firestore when signed in, else local
  run.js                # pure log/completion helpers
  util.js               # uid + local date
  components/            # ProgressHeader, ChampionCard
  constants.js          # roles + filter definitions
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
