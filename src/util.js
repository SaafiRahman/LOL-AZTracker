// Small shared helpers.

// Unique id for log entries. crypto.randomUUID exists in all modern browsers;
// fall back to a timestamp+random for older/embedded contexts.
export function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

// Today's date as a local (not UTC) yyyy-mm-dd string, matching <input type="date">.
export function todayISO() {
  return toISODate(Date.now())
}

// An epoch-ms timestamp as a local yyyy-mm-dd string.
export function toISODate(ms) {
  const d = new Date(ms)
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}
