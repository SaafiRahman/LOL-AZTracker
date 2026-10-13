import { useState } from 'react'
import { RIOT_REGIONS, QUEUE_FILTERS } from '../api/riot.js'
import { formImportOptions, accountQueue } from '../importPlan.js'
import Icon from './Icon.jsx'

// The full import form, opened from the spotlight. The range is either-or:
// "Last N matches" OR "By date" (from, optional to). The Riot ID, region and
// queue used here are saved and reused by one-click "Import new games".
export default function ImportOptions({ account, busy, onImport }) {
  const [gameName, setGameName] = useState(account?.gameName ?? '')
  const [tagLine, setTagLine] = useState(account?.tagLine ?? '')
  const [region, setRegion] = useState(account?.region ?? 'americas')
  const [queueKey, setQueueKey] = useState(() => accountQueue(account))
  const [rangeMode, setRangeMode] = useState('last') // 'last' | 'date'
  const [count, setCount] = useState(20)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [error, setError] = useState(null)

  function submit(e) {
    e.preventDefault()
    const opts = formImportOptions({ gameName, tagLine, region, queueKey, rangeMode, count, from, to })
    if (opts.error) {
      setError(opts.error)
      return
    }
    setError(null)
    onImport(opts)
  }

  return (
    <form id="import-options" className="import-options" onSubmit={submit}>
      <div className="field riot-id">
        <span className="field-label" id="opt-riot-id">
          Riot ID
        </span>
        <div className="riot-id-inputs" role="group" aria-labelledby="opt-riot-id">
          <input
            className="input"
            placeholder="Name"
            aria-label="Riot ID name"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            autoComplete="off"
            spellCheck="false"
          />
          <span className="riot-hash" aria-hidden="true">
            #
          </span>
          <input
            className="input tag"
            placeholder="TAG"
            aria-label="Riot ID tag"
            value={tagLine}
            onChange={(e) => setTagLine(e.target.value)}
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </div>

      <label className="field">
        <span className="field-label">Region</span>
        <select className="input" value={region} onChange={(e) => setRegion(e.target.value)}>
          {RIOT_REGIONS.map((r) => (
            <option key={r.key} value={r.key}>
              {r.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field-label">Queue</span>
        <select className="input" value={queueKey} onChange={(e) => setQueueKey(e.target.value)}>
          {QUEUE_FILTERS.map((q) => (
            <option key={q.key} value={q.key}>
              {q.label}
            </option>
          ))}
        </select>
      </label>

      <div className="field">
        <span className="field-label" id="opt-range">
          Range
        </span>
        <div className="segmented" role="group" aria-labelledby="opt-range">
          <button type="button" aria-pressed={rangeMode === 'last'} onClick={() => setRangeMode('last')}>
            Recent matches
          </button>
          <button type="button" aria-pressed={rangeMode === 'date'} onClick={() => setRangeMode('date')}>
            By date
          </button>
        </div>
      </div>

      {rangeMode === 'last' ? (
        <label className="field">
          <span className="field-label">How many</span>
          <select className="input" value={count} onChange={(e) => setCount(Number(e.target.value))}>
            {[10, 20, 30, 50].map((n) => (
              <option key={n} value={n}>
                Last {n}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <>
          <label className="field">
            <span className="field-label">From</span>
            <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">To (optional)</span>
            <input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
        </>
      )}

      <button type="submit" className="btn btn-primary" disabled={busy}>
        <Icon name="import" size={18} />
        {busy ? 'Importing…' : 'Import'}
      </button>

      {error && <p className="field-error">{error}</p>}
      <p className="import-options-note">
        Games land on the matching champions in this run. Matches you already imported are skipped,
        so importing again is always safe.
      </p>
    </form>
  )
}
