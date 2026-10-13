import { QUEUE_FILTERS } from './api/riot.js'

// Helpers for the one-click "Import new games" flow. They turn the saved Riot
// account + the run's existing log into the same options object the full
// import form produces, so both paths share App.runImport.

// The queue filter saved with the account (from the last import), or 'all'.
export function accountQueue(account) {
  const key = account?.queueKey
  return QUEUE_FILTERS.some((q) => q.key === key) ? key : 'all'
}

// Newest date (yyyy-mm-dd) among games imported from Riot in this run, or null.
export function lastImportDate(runChampions) {
  let latest = null
  for (const e of Object.values(runChampions)) {
    for (const g of e.games) {
      if (g.source === 'riot' && g.date && (!latest || g.date > latest)) latest = g.date
    }
  }
  return latest
}

// "Name#TAG" → { gameName, tagLine }, splitting on the last '#'. Null if either
// half is missing.
export function parseRiotId(text) {
  const raw = text.trim()
  const i = raw.lastIndexOf('#')
  if (i <= 0) return null
  const gameName = raw.slice(0, i).trim()
  const tagLine = raw.slice(i + 1).trim()
  return gameName && tagLine ? { gameName, tagLine } : null
}

// Options for an import "since last time", reusing the account's Riot ID,
// region and queue: by date from the start of the day of the newest imported
// game (already-imported matches are skipped by matchId), or the last 20
// matches when nothing has been imported into this run yet.
export function quickImportOptions({ account, sinceDate }) {
  const queueKey = accountQueue(account)
  const filter = QUEUE_FILTERS.find((q) => q.key === queueKey) ?? QUEUE_FILTERS[0]
  const id = { gameName: account.gameName, tagLine: account.tagLine, region: account.region, queueKey }
  if (sinceDate) {
    return {
      mode: 'date',
      ...id,
      queues: filter.queues,
      type: filter.dateType,
      keepMode: filter.dateKeepMode,
      startTime: Math.floor(new Date(`${sinceDate}T00:00:00`).getTime() / 1000),
    }
  }
  return { mode: 'last', ...id, count: 20, fetchParams: filter.fetchParams, keep: filter.keep }
}

// Turn the import form's fields into options for App.runImport. Returns
// { error } when the fields are incomplete.
export function formImportOptions({ gameName, tagLine, region, queueKey, rangeMode, count, from, to }) {
  if (!gameName.trim() || !tagLine.trim()) return { error: 'Enter your Riot ID: game name and tag.' }
  if (rangeMode === 'date' && !from) return { error: 'Pick a start date, or switch to "Last N".' }
  const filter = QUEUE_FILTERS.find((q) => q.key === queueKey) ?? QUEUE_FILTERS[0]
  const id = { gameName: gameName.trim(), tagLine: tagLine.trim().replace(/^#/, ''), region, queueKey }
  if (rangeMode === 'date') {
    return {
      mode: 'date',
      ...id,
      queues: filter.queues,
      type: filter.dateType,
      keepMode: filter.dateKeepMode,
      startTime: Math.floor(new Date(`${from}T00:00:00`).getTime() / 1000),
      endTime: to ? Math.floor(new Date(`${to}T23:59:59`).getTime() / 1000) : undefined,
    }
  }
  return { mode: 'last', ...id, count, fetchParams: filter.fetchParams, keep: filter.keep }
}

export function formatShortDate(iso) {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
