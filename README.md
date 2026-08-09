# LoL A–Z Challenge Tracker

**Live at [lolazchallenge.xyz](https://lolazchallenge.xyz)**

A free web app for the League of Legends A–Z challenge, where you play every champion in the game one at a time, in alphabetical order. It keeps track of where you are, remembers how each game went, and can pull your matches straight from Riot so you never have to log anything by hand.

## What it does

Start at Aatrox, end at Zyra, and check off every champion in between. For each one you get a full game log, win and loss records, KDA, notes, a role, and a rating. Your progress bar, win count, and "up next" pointer all update as you go. Sign in with Google and it syncs across every device you own. Stay signed out and it saves everything right in your browser, no account required.

## Features

- **Live champion roster** pulled from Riot's official Data Dragon, always current with the latest patch, sorted A to Z with real names and icons.
- **One click game import.** Type your Riot ID, pick a queue, and it pulls your recent matches from Riot's Match-V5 API, matches each one to the right champion, and files it away. Already imported games are skipped, so you can re-import as often as you like.
- **KDA tracking** on every game, both from auto import and by hand, with per champion and overall averages.
- **Play until you win, or count any game.** A single toggle decides what "done" means for a whole run, and every champion re-evaluates instantly when you flip it.
- **Multiple runs** so you can keep one per season, or run a themed challenge side by side.
- **Class filtered runs.** Scope a run to Fighters, Tanks, Mages, Assassins, Marksmen, or Supports for a "Marksman only" A to Z, and the order and progress follow the smaller pool.
- **A shareable progress card.** Generate a clean image of your run to post anywhere.
- **Grid or list layout,** filters, search, notes, half star ratings, and a running tally of games played and average games it takes you to win.
- **Your data, your call.** A built in privacy policy and a self serve "delete my data" button, always available.

## Under the hood

A few of the more interesting problems this project solved:

- **Queues that change every season.** Riot's queue IDs drift over time (Arena alone has shipped under several different IDs), so instead of hard coding them the importer classifies games by their stable `gameMode` value. That means Arena, ARAM, and Summoner's Rift keep sorting correctly across seasons without any updates.
- **Getting your full history, not just the last 20 games.** The by date import pages through Riot's match list and fetches details sequentially to stay inside the API rate limits, then de-duplicates and drops remakes before anything reaches your log.
- **The API key never touches the browser.** In development the Riot key lives behind a Vite middleware proxy, and in production the exact same logic runs as a Vercel serverless function, so the secret stays server side in both.
- **Cloud sync that degrades gracefully.** Signed in, everything lives in Firestore and updates live. Signed out, it falls back to local storage with the same interface, and your first sign in seeds the cloud from whatever you already had locally.
- **A share card with no external images.** The progress card is drawn on an HTML canvas so it can be exported as a PNG without tainting the canvas or waiting on remote assets.

## Built with

React and Vite on the front end, Firebase Authentication and Firestore for accounts and sync, Riot's Data Dragon and Match-V5 APIs for champion and game data, and Vercel for hosting, serverless functions, and analytics. Plain JavaScript throughout.

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173. You will need a Firebase web config and a Riot API key in a `.env` file (see `.env.example`) for sign in and game import to work, though the tracker itself runs fine without either.

## Attribution

Champion data and images © Riot Games, retrieved via Data Dragon. This project is not endorsed by or affiliated with Riot Games.
