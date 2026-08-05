// Persistence layer.
//
// The unit of storage is a *store*: { activeRunId, runs }, where each run is a
// self-contained A–Z challenge with its own config + progress. Everything the
// app persists goes through loadStore/saveStore (localStorage) or, when signed
// in, through Firestore in useStore.js — same shape either way.

import { uid } from '../util.js'

const STORE_KEY = 'az-tracker:store:v2'
// Legacy single-run keys, migrated into a store the first time we load.
const LEGACY_RUN_KEY = 'az-tracker:run:v1'
const LEGACY_SETTINGS_KEY = 'az-tracker:settings:v1'

/**
 * A champion entry within a run:
 *   {
 *     games: Array<{ id, result:'win'|'loss', date:string|null, source:'manual'|'riot' }>,
 *     manualDone: boolean,
 *     role: 'top'|'jungle'|'mid'|'bot'|'support'|null,
 *     notes: string,
 *   }
 */
export function emptyEntry() {
  return { games: [], manualDone: false, role: null, notes: '', rating: null }
}

// A fun rating is null (unrated) or a half-step number in [0.5, 5].
function normalizeRating(r) {
  if (typeof r !== 'number' || Number.isNaN(r)) return null
  if (r < 0.5 || r > 5) return null
  return Math.round(r * 2) / 2
}

// A K/D/A value: a non-negative integer, or null if unset.
function normalizeStat(v) {
  return Number.isFinite(v) && v >= 0 ? Math.floor(v) : null
}

function normalizeGame(g) {
  const game = {
    id: g.id ?? uid(),
    result: g.result === 'win' ? 'win' : 'loss',
    date: g.date ?? null,
    source: g.source === 'riot' ? 'riot' : 'manual',
    kills: normalizeStat(g.kills),
    deaths: normalizeStat(g.deaths),
    assists: normalizeStat(g.assists),
  }
  // Riot-imported games carry a matchId used for de-duplication.
  if (g.matchId) game.matchId = g.matchId
  return game
}

// Upgrade a stored entry to the current (game-log) shape. Handles the current
// games array, the { won, losses } counter, and the oldest { completed, result }.
export function normalizeEntry(raw) {
  if (!raw) return emptyEntry()

  if (Array.isArray(raw.games)) {
    return {
      ...emptyEntry(),
      ...raw,
      games: raw.games.map(normalizeGame),
      rating: normalizeRating(raw.rating),
    }
  }

  let won
  let losses
  if ('won' in raw || 'losses' in raw) {
    won = !!raw.won
    losses = raw.losses || 0
  } else {
    won = raw.result === 'win'
    losses = raw.result === 'loss' ? 1 : 0
  }

  const games = []
  for (let i = 0; i < losses; i += 1) {
    games.push({ id: uid(), result: 'loss', date: null, source: 'manual' })
  }
  if (won) {
    games.push({ id: uid(), result: 'win', date: raw.date ?? null, source: 'manual' })
  }

  return {
    games,
    manualDone: !!raw.manualDone || (!!raw.completed && !won),
    role: raw.role ?? null,
    notes: raw.notes ?? '',
    rating: normalizeRating(raw.rating),
  }
}

/**
 * A run:
 *   {
 *     id, name, createdAt,
 *     completionMode: 'win' | 'any',
 *     classFilter: string[],   // Data Dragon class tags; [] = all champions
 *     champions: { [champId]: entry },
 *   }
 */
export function createRun(name = 'My A–Z run', opts = {}) {
  return {
    id: uid(),
    name,
    createdAt: Date.now(),
    completionMode: opts.completionMode === 'any' ? 'any' : 'win',
    classFilter: Array.isArray(opts.classFilter) ? opts.classFilter : [],
    ratingLabel: typeof opts.ratingLabel === 'string' ? opts.ratingLabel : 'Rating',
    champions: {},
  }
}

function normalizeChampions(raw) {
  const out = {}
  if (raw) {
    for (const [id, entry] of Object.entries(raw)) out[id] = normalizeEntry(entry)
  }
  return out
}

export function normalizeRun(raw) {
  const base = createRun(raw?.name)
  return {
    id: raw?.id ?? base.id,
    name: raw?.name ?? base.name,
    createdAt: raw?.createdAt ?? base.createdAt,
    completionMode: raw?.completionMode === 'any' ? 'any' : 'win',
    classFilter: Array.isArray(raw?.classFilter) ? raw.classFilter : [],
    ratingLabel: typeof raw?.ratingLabel === 'string' ? raw.ratingLabel : 'Rating',
    champions: normalizeChampions(raw?.champions),
  }
}

// The saved Riot account for auto-import, or null.
function normalizeRiotAccount(raw) {
  if (!raw || !raw.gameName || !raw.tagLine || !raw.region) return null
  return { gameName: raw.gameName, tagLine: raw.tagLine, region: raw.region }
}

// Turn any persisted shape into { activeRunId, runs, riotAccount } with >=1 run.
export function normalizeStore(raw) {
  const riotAccount = normalizeRiotAccount(raw?.riotAccount)

  // Current shape: { activeRunId, runs }
  if (raw && raw.runs && typeof raw.runs === 'object') {
    const runs = {}
    for (const [id, r] of Object.entries(raw.runs)) {
      runs[id] = { ...normalizeRun(r), id } // the map key is authoritative
    }
    let activeRunId = raw.activeRunId
    if (!activeRunId || !runs[activeRunId]) activeRunId = Object.keys(runs)[0]
    if (!activeRunId) {
      const r = createRun()
      runs[r.id] = r
      activeRunId = r.id
    }
    return { activeRunId, runs, riotAccount }
  }

  // Legacy single-run shape: { run, settings }
  if (raw && (raw.run || raw.settings)) {
    const r = normalizeRun({
      name: 'My A–Z run',
      completionMode: raw.settings?.completionMode ?? 'win',
      champions: raw.run ?? {},
    })
    return { activeRunId: r.id, runs: { [r.id]: r }, riotAccount }
  }

  // Nothing yet: start with one empty run.
  const r = createRun()
  return { activeRunId: r.id, runs: { [r.id]: r }, riotAccount }
}

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return normalizeStore(JSON.parse(raw))

    // One-time migration from the pre-multi-run keys.
    const legacyRun = localStorage.getItem(LEGACY_RUN_KEY)
    const legacySettings = localStorage.getItem(LEGACY_SETTINGS_KEY)
    if (legacyRun || legacySettings) {
      return normalizeStore({
        run: legacyRun ? JSON.parse(legacyRun) : {},
        settings: legacySettings ? JSON.parse(legacySettings) : {},
      })
    }

    return normalizeStore(null)
  } catch {
    return normalizeStore(null)
  }
}

export function saveStore(store) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store))
  } catch {
    // best-effort; ignore quota / private-mode failures
  }
}

// Wipe the locally stored data (used by "Delete my data").
export function clearStore() {
  try {
    localStorage.removeItem(STORE_KEY)
  } catch {
    // ignore
  }
}
