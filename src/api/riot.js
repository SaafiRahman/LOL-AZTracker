// Client for our Riot proxy (/api/riot/*). The proxy holds the API key; this
// just calls it and turns Riot's HTTP statuses into friendly messages.

// Regional routes the user picks from.
export const RIOT_REGIONS = [
  { key: 'americas', label: 'Americas (NA, BR, LATAM, OCE)' },
  { key: 'europe', label: 'Europe (EUW, EUNE, TR, RU)' },
  { key: 'asia', label: 'Asia (KR, JP)' },
  { key: 'sea', label: 'SEA' },
]

// Queue filters, used two ways:
//   • "Last N" mode → `fetchParams` narrows Riot's match-ids endpoint (single
//     stable queue id, or `type=normal` which Riot merges chronologically), and
//     `keep` filters the fetched games by `gameMode` ('CLASSIC' = Summoner's
//     Rift, 'ARAM', 'CHERRY' = Arena).
//   • "By date" mode → `queues` lists the exact queue ids to page through, so we
//     only spend match-detail fetches on games that count (no wasted Arena reads
//     for an SR filter). Empty = all queues.
export const QUEUE_FILTERS = [
  { key: 'all', label: 'All queues', queues: [], fetchParams: {}, keep: () => true },
  { key: 'ranked_solo', label: 'Ranked Solo/Duo', queues: [420], fetchParams: { queue: 420 }, keep: (g) => g.queueId === 420 },
  { key: 'ranked_flex', label: 'Ranked Flex', queues: [440], fetchParams: { queue: 440 }, keep: (g) => g.queueId === 440 },
  { key: 'normal_sr', label: "Normal (Summoner's Rift)", queues: [400, 430, 480, 490], fetchParams: { type: 'normal' }, keep: (g) => [400, 430, 480, 490].includes(g.queueId) },
  { key: 'aram', label: 'ARAM', queues: [450], fetchParams: { queue: 450 }, keep: (g) => g.gameMode === 'ARAM' },
  // Arena queue ids drift across seasons, so date mode pages by `type: normal`
  // (which Riot merges) and keeps only Arena (gameMode CHERRY) — catches them all.
  { key: 'arena', label: 'Arena', queues: [], dateType: 'normal', dateKeepMode: 'CHERRY', fetchParams: { type: 'normal' }, keep: (g) => g.gameMode === 'CHERRY' },
]

function messageForStatus(status, fallback) {
  switch (status) {
    case 400:
      return 'Check your Riot ID and region.'
    case 401:
    case 403:
      return 'Riot rejected the API key — it is likely expired (dev keys last only 24h) or invalid. Regenerate it at developer.riotgames.com, update RIOT_API_KEY in .env, and restart the dev server.'
    case 404:
      return 'Riot account not found — double-check the name, tag, and region.'
    case 429:
      return 'Riot rate limit hit — wait a minute and try again.'
    case 500:
      return fallback || 'Server error talking to Riot.'
    default:
      return fallback || `Riot API error (${status}).`
  }
}

/**
 * Fetch recent games for a Riot ID.
 * @returns {Promise<Array<{matchId,championName,win,date}>>}
 */
async function callProxy(search) {
  let res
  try {
    res = await fetch(`/api/riot/matches?${search}`)
  } catch {
    throw new Error('Could not reach the import server. Is the dev server running?')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(messageForStatus(data.status || res.status, data.error))
  }
  return data
}

// "Last N" mode: one recent page, filtered client-side by gameMode.
export async function importMatches({ gameName, tagLine, region, count = 20, fetchParams = {}, keep }) {
  const search = new URLSearchParams({ gameName, tagLine, region, count: String(count) })
  for (const [k, v] of Object.entries(fetchParams)) search.set(k, String(v))
  const data = await callProxy(search)
  return { games: keep ? data.games.filter(keep) : data.games }
}

// "By date" mode: page through the whole range for the given queue ids.
export async function importMatchesByDate({ gameName, tagLine, region, queues = [], type, keepMode, startTime, endTime }) {
  const search = new URLSearchParams({ gameName, tagLine, region, range: 'date' })
  if (queues.length) search.set('queues', queues.join(','))
  if (type) search.set('type', type)
  if (keepMode) search.set('keepMode', keepMode)
  if (startTime) search.set('startTime', String(startTime))
  if (endTime) search.set('endTime', String(endTime))
  const data = await callProxy(search)
  return { games: data.games, totalFound: data.totalFound, truncated: data.truncated }
}
