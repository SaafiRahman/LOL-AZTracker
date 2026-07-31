import { useEffect, useMemo, useState } from 'react'
import { fetchChampions } from './api/dataDragon.js'
import { loadRun, saveRun, clearRun, emptyEntry } from './storage/storage.js'
import { FILTERS } from './constants.js'
import ProgressHeader from './components/ProgressHeader.jsx'
import ChampionCard from './components/ChampionCard.jsx'

export default function App() {
  const [champions, setChampions] = useState([])
  const [loadState, setLoadState] = useState('loading') // 'loading' | 'ready' | 'error'
  const [error, setError] = useState(null)

  const [run, setRun] = useState(() => loadRun())
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  // Load the champion roster once on mount.
  useEffect(() => {
    let cancelled = false
    fetchChampions()
      .then(({ champions }) => {
        if (cancelled) return
        setChampions(champions)
        setLoadState('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
        setLoadState('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Persist the run whenever it changes.
  useEffect(() => {
    saveRun(run)
  }, [run])

  const entryFor = (id) => run[id] ?? emptyEntry()

  function updateEntry(id, patch) {
    setRun((prev) => {
      const current = prev[id] ?? emptyEntry()
      const next = { ...current, ...patch }
      // Recording a result implies the champion was played.
      if (patch.result != null) next.completed = true
      return { ...prev, [id]: next }
    })
  }

  function handleReset() {
    if (!window.confirm('Reset your entire run? This clears all progress.')) return
    clearRun()
    setRun({})
  }

  const stats = useMemo(() => {
    let completed = 0
    let wins = 0
    let losses = 0
    for (const champ of champions) {
      const e = run[champ.id]
      if (!e) continue
      if (e.completed) completed += 1
      if (e.result === 'win') wins += 1
      else if (e.result === 'loss') losses += 1
    }
    return { total: champions.length, completed, wins, losses }
  }, [champions, run])

  // First champion in A→Z order that hasn't been completed.
  const nextChampion = useMemo(
    () => champions.find((c) => !(run[c.id]?.completed)),
    [champions, run],
  )

  const visibleChampions = useMemo(() => {
    const q = search.trim().toLowerCase()
    return champions.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q)) return false
      const e = run[c.id]
      switch (filter) {
        case 'remaining':
          return !e?.completed
        case 'completed':
          return !!e?.completed
        case 'wins':
          return e?.result === 'win'
        case 'losses':
          return e?.result === 'loss'
        default:
          return true
      }
    })
  }, [champions, run, filter, search])

  if (loadState === 'loading') {
    return (
      <div className="app">
        <div className="centered-msg">Loading champions from Data Dragon…</div>
      </div>
    )
  }

  if (loadState === 'error') {
    return (
      <div className="app">
        <div className="centered-msg error">
          <p>Couldn’t load the champion list.</p>
          <p className="error-detail">{error}</p>
          <button type="button" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <ProgressHeader stats={stats} nextChampion={nextChampion} onReset={handleReset} />

      <div className="toolbar">
        <div className="filter-tabs">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`tab${filter === f.key ? ' is-active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          className="search"
          placeholder="Search champion…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {visibleChampions.length === 0 ? (
        <div className="centered-msg">No champions match this view.</div>
      ) : (
        <ul className="champ-list">
          {visibleChampions.map((champ) => (
            <ChampionCard
              key={champ.id}
              champion={champ}
              index={champions.indexOf(champ)}
              entry={entryFor(champ.id)}
              onChange={(patch) => updateEntry(champ.id, patch)}
            />
          ))}
        </ul>
      )}

      <footer className="app-footer">
        Champion data & images © Riot Games, via Data Dragon. Not endorsed by Riot Games.
      </footer>
    </div>
  )
}
