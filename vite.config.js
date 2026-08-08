import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fetchRecentGames, fetchGamesInRange } from './server/riot.js'

// Dev-only proxy for the Riot API. Runs inside the Vite dev server so the secret
// RIOT_API_KEY (a non-VITE_ env var) never reaches the browser bundle. In
// production this same handler moves to a serverless function.
function riotDevApi(env) {
  return {
    name: 'riot-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/riot/matches', async (req, res) => {
        const send = (status, body) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        }
        try {
          const url = new URL(req.url, 'http://localhost')
          const gameName = url.searchParams.get('gameName')
          const tagLine = url.searchParams.get('tagLine')
          const region = url.searchParams.get('region')
          const count = Number(url.searchParams.get('count') || 20)
          const queue = url.searchParams.get('queue') || undefined
          const type = url.searchParams.get('type') || undefined
          const keepMode = url.searchParams.get('keepMode') || undefined
          const startTime = url.searchParams.get('startTime') || undefined
          const endTime = url.searchParams.get('endTime') || undefined
          const range = url.searchParams.get('range') // 'date' → paginated range fetch
          if (!gameName || !tagLine || !region) {
            return send(400, { error: 'Missing gameName, tagLine, or region' })
          }
          const common = { apiKey: env.RIOT_API_KEY, gameName, tagLine, region }
          const data =
            range === 'date'
              ? await fetchGamesInRange({
                  ...common,
                  queues: (url.searchParams.get('queues') || '')
                    .split(',')
                    .map((s) => Number(s.trim()))
                    .filter(Number.isFinite),
                  type,
                  keepMode,
                  startTime,
                  endTime,
                })
              : await fetchRecentGames({ ...common, count, queue, type })
          return send(200, data)
        } catch (e) {
          return send(e.status || 500, { error: e.message, status: e.status || 500 })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '') // '' prefix → also loads non-VITE_ vars
  return {
    plugins: [react(), riotDevApi(env)],
  }
})
