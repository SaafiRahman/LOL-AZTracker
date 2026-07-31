// Thin client for Riot's Data Dragon static CDN.
// Docs: https://developer.riotgames.com/docs/lol#data-dragon
// No API key required — these are public static assets.

const VERSIONS_URL = 'https://ddragon.leagueoflegends.com/api/versions.json'
const cdn = (version) => `https://ddragon.leagueoflegends.com/cdn/${version}`

// Cache the resolved version + champion list in localStorage so we don't
// re-hit the network on every load. Data Dragon changes ~every two weeks.
const CACHE_KEY = 'az-tracker:ddragon:v2'
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 // 24h

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null
    return parsed
  } catch {
    return null
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, fetchedAt: Date.now() }))
  } catch {
    // ignore quota / private-mode errors — cache is best-effort
  }
}

async function getLatestVersion() {
  const res = await fetch(VERSIONS_URL)
  if (!res.ok) throw new Error(`Failed to load Data Dragon versions (${res.status})`)
  const versions = await res.json()
  return versions[0]
}

// Data Dragon includes non-standard variant entries (e.g. "Jade_Ahri") whose
// id contains an underscore. Real champion ids never do, so we drop them — the
// A–Z challenge is about each actual champion, once. Applied on BOTH the cache
// and network paths so a stale cache written before this filter existed can't
// slip variants through.
const isRealChampion = (c) => !c.id.includes('_')

/**
 * Returns { version, champions } where champions is an array sorted A→Z:
 *   { id, key, name, title, iconUrl }
 */
export async function fetchChampions() {
  const cached = readCache()
  if (cached) {
    return { version: cached.version, champions: cached.champions.filter(isRealChampion) }
  }

  const version = await getLatestVersion()
  const res = await fetch(`${cdn(version)}/data/en_US/champion.json`)
  if (!res.ok) throw new Error(`Failed to load champion list (${res.status})`)
  const data = await res.json()

  const champions = Object.values(data.data)
    .filter(isRealChampion)
    .map((c) => ({
      id: c.id, // e.g. "Aatrox" — stable, safe as a storage key
      key: c.key, // numeric id as string
      name: c.name, // display name, e.g. "Aatrox"
      title: c.title, // e.g. "the Darkin Blade"
      iconUrl: `${cdn(version)}/img/champion/${c.image.full}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  writeCache({ version, champions })
  return { version, champions }
}
