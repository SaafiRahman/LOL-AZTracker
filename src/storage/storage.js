// Persistence layer for a challenge run.
//
// Everything the app does with saved data goes through this module. Today it's
// backed by localStorage; swapping in Firebase later means reimplementing
// loadRun / saveRun (e.g. reading/writing a Firestore doc keyed by user id)
// without touching the components that call them.

const STORAGE_KEY = 'az-tracker:run:v1'

/**
 * A run is a map of championId -> entry:
 *   {
 *     completed: boolean,
 *     result: 'win' | 'loss' | null,
 *     role: 'top' | 'jungle' | 'mid' | 'bot' | 'support' | null,
 *     notes: string,
 *     date: string | null,   // ISO yyyy-mm-dd
 *   }
 * Champions with no entry are simply "not started".
 */
export function emptyEntry() {
  return { completed: false, result: null, role: null, notes: '', date: null }
}

export function loadRun() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveRun(run) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(run))
  } catch {
    // best-effort; ignore quota / private-mode failures
  }
}

export function clearRun() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
