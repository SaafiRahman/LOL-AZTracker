// Vercel serverless function — the production counterpart of the Vite dev
// middleware in vite.config.js. Same `/api/riot/matches` request contract and
// the same server/riot.js logic, so the client (src/api/riot.js) is unchanged.
//
// RIOT_API_KEY is read from the Vercel environment (server-side only — it has no
// VITE_ prefix, so it is never bundled into the browser).

import { fetchRecentGames, fetchGamesInRange } from '../../server/riot.js'

export default async function handler(req, res) {
  try {
    const q = req.query || {}
    const { gameName, tagLine, region } = q
    if (!gameName || !tagLine || !region) {
      return res.status(400).json({ error: 'Missing gameName, tagLine, or region' })
    }

    const common = { apiKey: process.env.RIOT_API_KEY, gameName, tagLine, region }
    const data =
      q.range === 'date'
        ? await fetchGamesInRange({
            ...common,
            queues: String(q.queues || '')
              .split(',')
              .map((s) => Number(s.trim()))
              .filter(Number.isFinite),
            startTime: q.startTime,
            endTime: q.endTime,
          })
        : await fetchRecentGames({
            ...common,
            count: Number(q.count || 20),
            queue: q.queue,
            type: q.type,
          })

    return res.status(200).json(data)
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message, status: e.status || 500 })
  }
}
