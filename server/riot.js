// Portable Riot API client — SERVER-SIDE ONLY (needs the secret API key).
//
// Used today by the Vite dev middleware (see vite.config.js). These functions
// only depend on `fetch`, so they port unchanged to a serverless function
// (Cloudflare Worker / Vercel) for production.
//
// `region` is a Riot *regional route*: 'americas' | 'europe' | 'asia' | 'sea'.
// Account-V1 and Match-V5 both route by region, so we don't need the platform.

const host = (region) => `https://${region}.api.riotgames.com`

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// GET with one automatic retry on 429 (rate limit), honoring Retry-After.
async function riotGet(url, apiKey, retriesLeft = 2) {
  const res = await fetch(url, { headers: { 'X-Riot-Token': apiKey } })
  if (res.status === 429 && retriesLeft > 0) {
    const wait = Number(res.headers.get('Retry-After') || 2)
    await sleep((wait + 1) * 1000)
    return riotGet(url, apiKey, retriesLeft - 1)
  }
  if (!res.ok) {
    const err = new Error(`Riot API responded ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

function assertKey(apiKey) {
  if (!apiKey) {
    const e = new Error('Server is missing RIOT_API_KEY — add it to .env and restart the dev server.')
    e.status = 500
    throw e
  }
}

async function resolvePuuid(base, apiKey, gameName, tagLine) {
  const account = await riotGet(
    `${base}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
    apiKey,
  )
  return account.puuid
}

// Turn a match id into a compact game record for this player.
async function fetchGame(base, apiKey, puuid, matchId) {
  const match = await riotGet(`${base}/lol/match/v5/matches/${matchId}`, apiKey)
  const me = match.info?.participants?.find((p) => p.puuid === puuid)
  if (!me) return null
  // Skip remakes: an early surrender means the game was cancelled (someone didn't
  // connect / the /remake vote passed), so it counts as neither a win nor a loss.
  if (me.gameEndedInEarlySurrender) return null
  return {
    matchId,
    championName: me.championName,
    win: !!me.win,
    kills: me.kills,
    deaths: me.deaths,
    assists: me.assists,
    queueId: match.info?.queueId,
    gameMode: match.info?.gameMode,
    date: match.info?.gameEndTimestamp ?? match.info?.gameCreation ?? null,
  }
}

/**
 * "Last N" fetch: a single page of recent match ids (optionally narrowed by
 * queue or type), then their details. Riot merges queues chronologically for
 * `type`, so this stays cheap for a recent-games scan.
 */
export async function fetchRecentGames({ apiKey, gameName, tagLine, region, count = 20, queue, type }) {
  assertKey(apiKey)
  const base = host(region)
  const puuid = await resolvePuuid(base, apiKey, gameName, tagLine)

  const idParams = new URLSearchParams({ start: '0', count: String(Math.min(Math.max(count, 1), 50)) })
  if (queue) idParams.set('queue', String(queue))
  else if (type) idParams.set('type', type)
  const matchIds = await riotGet(`${base}/lol/match/v5/matches/by-puuid/${puuid}/ids?${idParams}`, apiKey)

  const games = []
  for (const matchId of matchIds) {
    const game = await fetchGame(base, apiKey, puuid, matchId)
    if (game) games.push(game)
  }
  return { puuid, games }
}

// How many match *details* one import may fetch. Sits under the dev-key budget
// of 100 requests / 2 min (leaving room for the id + account requests).
const DETAIL_CAP = 80

/**
 * "By date" fetch: page through ALL match ids in [startTime, endTime] for the
 * given queue ids (empty = all queues), then fetch details up to DETAIL_CAP.
 * Fetching by exact queue id means every detail we spend is a keeper (no wasted
 * Arena fetches for a Summoner's-Rift filter).
 */
export async function fetchGamesInRange({ apiKey, gameName, tagLine, region, queues = [], startTime, endTime }) {
  assertKey(apiKey)
  const base = host(region)
  const puuid = await resolvePuuid(base, apiKey, gameName, tagLine)

  const queueList = queues.length ? queues : [null] // null → no queue filter (all)
  const idSet = new Set()

  for (const q of queueList) {
    let start = 0
    // Page (100 at a time) until the range is exhausted or we have enough
    // candidates to fill the cap.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const p = new URLSearchParams({ start: String(start), count: '100' })
      if (q != null) p.set('queue', String(q))
      if (startTime) p.set('startTime', String(startTime))
      if (endTime) p.set('endTime', String(endTime))
      const page = await riotGet(`${base}/lol/match/v5/matches/by-puuid/${puuid}/ids?${p}`, apiKey)
      for (const id of page) idSet.add(id)
      if (page.length < 100 || idSet.size >= DETAIL_CAP * 2) break
      start += page.length
    }
  }

  const totalFound = idSet.size
  const ids = [...idSet].slice(0, DETAIL_CAP)

  const games = []
  for (const matchId of ids) {
    const game = await fetchGame(base, apiKey, puuid, matchId)
    if (game) games.push(game)
  }
  games.sort((a, b) => (b.date ?? 0) - (a.date ?? 0)) // newest first

  return { puuid, games, totalFound, truncated: totalFound > DETAIL_CAP }
}
