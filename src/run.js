// Pure helpers for reasoning about a champion's progress.
//
// A champion's record is now a *log* of individual games (entry.games), each:
//   { id, result: 'win' | 'loss', date: string | null, source: 'manual' | 'riot' }
// Win/loss counts and completion are derived from that log rather than stored,
// so the same log serves both manual entry and a future Riot auto-import.

export const COMPLETION_MODES = [
  { key: 'win', label: 'Win', hint: 'Done when you win on the champion' },
  { key: 'any', label: 'Any game', hint: 'Done after any game, win or loss' },
]

export function gamesPlayed(entry) {
  return entry.games.length
}

export function lossCount(entry) {
  return entry.games.reduce((n, g) => n + (g.result === 'loss' ? 1 : 0), 0)
}

// Index of the first winning game in the log, or -1 if none.
export function firstWinIndex(entry) {
  return entry.games.findIndex((g) => g.result === 'win')
}

export function isWon(entry) {
  return firstWinIndex(entry) !== -1
}

// Which game number the (first) win came on — only meaningful once won.
export function gamesToWin(entry) {
  const i = firstWinIndex(entry)
  return i === -1 ? null : i + 1
}

// Is this champion complete under the given mode?
//   'win' → needs a win (or a manual override)
//   'any' → any logged game counts (or a manual override)
export function isComplete(entry, mode) {
  if (entry.manualDone) return true
  if (isWon(entry)) return true
  if (mode === 'any') return entry.games.length > 0
  return false
}

// Short human-readable status for a champion's game record.
export function statusText(entry) {
  if (isWon(entry)) return `Won on game ${gamesToWin(entry)}`
  const n = entry.games.length
  if (n > 0) return `${n} ${n === 1 ? 'game' : 'games'}, no win yet`
  return 'No games yet'
}
