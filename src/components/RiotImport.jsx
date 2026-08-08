import { useState } from 'react'
import { RIOT_REGIONS, QUEUE_FILTERS } from '../api/riot.js'

// Panel for importing recent games from a Riot ID. `onImport` does the actual
// fetch + merge and resolves to a summary string; this component owns the form
// inputs and status display.
//
// The range is either-or: "Last N matches" OR "By date" (from, optional to) —
// never both at once.
export default function RiotImport({ account, onImport }) {
  const [gameName, setGameName] = useState(account?.gameName ?? '')
  const [tagLine, setTagLine] = useState(account?.tagLine ?? '')
  const [region, setRegion] = useState(account?.region ?? 'americas')
  const [queueKey, setQueueKey] = useState('all')
  const [rangeMode, setRangeMode] = useState('last') // 'last' | 'date'
  const [count, setCount] = useState(20)
  const [from, setFrom] = useState('') // yyyy-mm-dd
  const [to, setTo] = useState('') // yyyy-mm-dd (optional)
  const [status, setStatus] = useState(null) // { type: 'info'|'success'|'error', message }
  const [busy, setBusy] = useState(false)

  async function handleImport() {
    if (!gameName.trim() || !tagLine.trim()) {
      setStatus({ type: 'error', message: 'Enter your Riot ID — game name and tag.' })
      return
    }
    if (rangeMode === 'date' && !from) {
      setStatus({ type: 'error', message: 'Pick a start date, or switch to "Last N".' })
      return
    }

    setBusy(true)
    setStatus({
      type: 'info',
      message:
        rangeMode === 'date'
          ? 'Paging through your history from Riot… this can take a bit.'
          : 'Fetching matches from Riot…',
    })
    try {
      const filter = QUEUE_FILTERS.find((q) => q.key === queueKey) ?? QUEUE_FILTERS[0]
      const id = {
        gameName: gameName.trim(),
        tagLine: tagLine.trim().replace(/^#/, ''),
        region,
      }

      let summary
      if (rangeMode === 'date') {
        // Local start-of-day for `from`, end-of-day for `to`; Riot wants seconds.
        const startTime = Math.floor(new Date(`${from}T00:00:00`).getTime() / 1000)
        const endTime = to ? Math.floor(new Date(`${to}T23:59:59`).getTime() / 1000) : undefined
        summary = await onImport({
          mode: 'date',
          ...id,
          queues: filter.queues,
          type: filter.dateType,
          keepMode: filter.dateKeepMode,
          startTime,
          endTime,
        })
      } else {
        summary = await onImport({
          mode: 'last',
          ...id,
          count,
          fetchParams: filter.fetchParams,
          keep: filter.keep,
        })
      }
      setStatus({ type: 'success', message: summary })
    } catch (e) {
      setStatus({ type: 'error', message: e.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <details className="riot-import">
      <summary>Import games from Riot</summary>
      <div className="riot-body">
        <div className="riot-id-field">
          <span className="riot-id-label">Your Riot ID</span>
          <div className="riot-id-row">
            <input
              className="riot-input name"
              placeholder="Name"
              aria-label="Riot ID name"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
            />
            <span className="riot-hash">#</span>
            <input
              className="riot-input tag"
              placeholder="TAG"
              aria-label="Riot ID tagline"
              value={tagLine}
              onChange={(e) => setTagLine(e.target.value)}
            />
          </div>
        </div>

        <div className="riot-options">
          <label className="riot-field">
            <span>Region</span>
            <select value={region} onChange={(e) => setRegion(e.target.value)}>
              {RIOT_REGIONS.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>

          <label className="riot-field">
            <span>Queue</span>
            <select value={queueKey} onChange={(e) => setQueueKey(e.target.value)}>
              {QUEUE_FILTERS.map((q) => (
                <option key={q.key} value={q.key}>
                  {q.label}
                </option>
              ))}
            </select>
          </label>

          <div className="riot-field">
            <span>Range</span>
            <div className="mode-toggle" role="group" aria-label="Import range">
              <button
                type="button"
                className={`mode-btn${rangeMode === 'last' ? ' is-active' : ''}`}
                onClick={() => setRangeMode('last')}
              >
                Last N
              </button>
              <button
                type="button"
                className={`mode-btn${rangeMode === 'date' ? ' is-active' : ''}`}
                onClick={() => setRangeMode('date')}
              >
                By date
              </button>
            </div>
          </div>

          {rangeMode === 'last' ? (
            <label className="riot-field">
              <span>Matches</span>
              <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
                {[10, 20, 30, 50].map((n) => (
                  <option key={n} value={n}>
                    Last {n}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <>
              <label className="riot-field">
                <span>From</span>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <label className="riot-field">
                <span>To (optional)</span>
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </label>
            </>
          )}

          <button type="button" className="riot-import-btn" onClick={handleImport} disabled={busy}>
            {busy ? 'Importing…' : 'Import'}
          </button>
        </div>

        {status && <p className={`riot-status ${status.type}`}>{status.message}</p>}

        <p className="riot-note">
          Games are matched to champions in this run’s pool and added to their log. Already-imported
          matches are skipped, so you can import again safely.
        </p>
      </div>
    </details>
  )
}
