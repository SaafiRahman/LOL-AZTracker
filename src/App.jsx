import { useEffect, useMemo, useState } from 'react'
import { fetchChampions } from './api/dataDragon.js'
import { emptyEntry } from './storage/storage.js'
import { FILTERS } from './constants.js'
import { isComplete, isWon, gamesPlayed, gamesToWin } from './run.js'
import { uid, todayISO, toISODate } from './util.js'
import { importMatches, importMatchesByDate } from './api/riot.js'
import { useAuth } from './auth.js'
import { useStore } from './useStore.js'
import ProgressHeader from './components/ProgressHeader.jsx'
import ChampionCard from './components/ChampionCard.jsx'
import RunBar from './components/RunBar.jsx'
import RiotImport from './components/RiotImport.jsx'

export default function App() {
  const [champions, setChampions] = useState([])
  const [loadState, setLoadState] = useState('loading') // 'loading' | 'ready' | 'error'
  const [error, setError] = useState(null)

  const auth = useAuth()
  const store = useStore(auth.user)
  const { activeRun, runList, ready: storeReady, syncing } = store

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

  // The champion pool for the active run: all champions, or only those whose
  // class matches the run's classFilter.
  const pool = useMemo(() => {
    const cf = activeRun?.classFilter ?? []
    if (!cf.length) return champions
    return champions.filter((c) => c.tags?.some((t) => cf.includes(t)))
  }, [champions, activeRun?.classFilter])

  const runChampions = activeRun?.champions ?? {}
  const mode = activeRun?.completionMode ?? 'win'
  const entryFor = (id) => runChampions[id] ?? emptyEntry()

  function updateEntry(id, patch) {
    store.mutateChampions((prev) => {
      const current = prev[id] ?? emptyEntry()
      return { ...prev, [id]: { ...current, ...patch } }
    })
  }

  function addGame(id, result) {
    store.mutateChampions((prev) => {
      const current = prev[id] ?? emptyEntry()
      const game = { id: uid(), result, date: todayISO(), source: 'manual' }
      return { ...prev, [id]: { ...current, games: [...current.games, game] } }
    })
  }

  function removeGame(id, gameId) {
    store.mutateChampions((prev) => {
      const current = prev[id] ?? emptyEntry()
      return { ...prev, [id]: { ...current, games: current.games.filter((g) => g.id !== gameId) } }
    })
  }

  function updateGame(id, gameId, patch) {
    store.mutateChampions((prev) => {
      const current = prev[id] ?? emptyEntry()
      const games = current.games.map((g) => (g.id === gameId ? { ...g, ...patch } : g))
      return { ...prev, [id]: { ...current, games } }
    })
  }

  function handleReset() {
    if (!window.confirm(`Reset "${activeRun.name}"? This clears its progress.`)) return
    store.resetActiveRun()
  }

  // --- run management ---
  function handleNewRun() {
    const name = window.prompt('Name this run:', `Run ${runList.length + 1}`)
    if (name == null) return
    store.addRun(name.trim() || `Run ${runList.length + 1}`)
  }
  function handleRenameRun() {
    const name = window.prompt('Rename run:', activeRun.name)
    if (name == null) return
    store.renameRun(activeRun.id, name.trim() || activeRun.name)
  }
  function handleDeleteRun() {
    if (!window.confirm(`Delete run "${activeRun.name}"? This removes its progress.`)) return
    store.deleteRun(activeRun.id)
  }

  // Fetch recent games from Riot and append them (as source:'riot') to the
  // matching champions in this run's pool, skipping already-imported matches.
  async function handleRiotImport(opts) {
    const { mode, gameName, tagLine, region } = opts
    const result =
      mode === 'date'
        ? await importMatchesByDate({
            gameName,
            tagLine,
            region,
            queues: opts.queues,
            startTime: opts.startTime,
            endTime: opts.endTime,
          })
        : await importMatches({
            gameName,
            tagLine,
            region,
            count: opts.count,
            fetchParams: opts.fetchParams,
            keep: opts.keep,
          })
    const matches = result.games
    store.setRiotAccount({ gameName, tagLine, region })

    // Match-V5 championName matches Data Dragon ids (compared case-insensitively).
    const byId = new Map(pool.map((c) => [c.id.toLowerCase(), c]))

    // Existing imported matchIds across the run, for de-duplication.
    const existing = new Set()
    for (const e of Object.values(runChampions)) {
      for (const g of e.games) if (g.matchId) existing.add(g.matchId)
    }

    // Oldest-first so the appended log stays chronological (like manual entries).
    const ordered = [...matches].sort((a, b) => (a.date ?? 0) - (b.date ?? 0))

    let added = 0
    let skipped = 0
    let unmatched = 0
    store.mutateChampions((prev) => {
      const next = { ...prev }
      for (const m of ordered) {
        if (existing.has(m.matchId)) {
          skipped += 1
          continue
        }
        const champ = byId.get((m.championName || '').toLowerCase())
        if (!champ) {
          unmatched += 1
          continue
        }
        const current = next[champ.id] ?? emptyEntry()
        const game = {
          id: uid(),
          result: m.win ? 'win' : 'loss',
          date: m.date ? toISODate(m.date) : todayISO(),
          source: 'riot',
          matchId: m.matchId,
        }
        next[champ.id] = { ...current, games: [...current.games, game] }
        existing.add(m.matchId)
        added += 1
      }
      return next
    })

    const parts = [`Imported ${added} game${added === 1 ? '' : 's'}`]
    if (skipped) parts.push(`skipped ${skipped} already logged`)
    if (unmatched) parts.push(`${unmatched} not in this run’s pool`)
    let summary = `${parts.join(' · ')}.`
    if (result.truncated) {
      summary += ` Found ${result.totalFound} games in range — a dev key caps one import at 80, so narrow the date window to reach older ones.`
    }
    return summary
  }

  const stats = useMemo(() => {
    let completed = 0
    let won = 0
    let totalGames = 0
    let winGamesSum = 0
    let ratingSum = 0
    let ratedCount = 0
    for (const champ of pool) {
      const e = runChampions[champ.id]
      if (!e) continue
      if (isComplete(e, mode)) completed += 1
      if (isWon(e)) {
        won += 1
        winGamesSum += gamesToWin(e)
      }
      totalGames += gamesPlayed(e)
      if (e.rating != null) {
        ratingSum += e.rating
        ratedCount += 1
      }
    }
    return {
      total: pool.length,
      completed,
      won,
      totalGames,
      avgGamesToWin: won ? winGamesSum / won : null,
      avgFun: ratedCount ? ratingSum / ratedCount : null,
    }
  }, [pool, runChampions, mode])

  const nextChampion = useMemo(
    () => pool.find((c) => !isComplete(runChampions[c.id] ?? emptyEntry(), mode)),
    [pool, runChampions, mode],
  )

  const visibleChampions = useMemo(() => {
    const q = search.trim().toLowerCase()
    return pool.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q)) return false
      const e = runChampions[c.id] ?? emptyEntry()
      const complete = isComplete(e, mode)
      switch (filter) {
        case 'remaining':
          return !complete
        case 'inprogress':
          return !complete && e.games.length > 0
        case 'completed':
          return complete
        case 'won':
          return isWon(e)
        default:
          return true
      }
    })
  }, [pool, runChampions, mode, filter, search])

  if (loadState === 'loading' || !auth.ready || !storeReady || !activeRun) {
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
      <RunBar
        runs={runList}
        activeRunId={activeRun.id}
        onSelect={store.selectRun}
        onNew={handleNewRun}
        onRename={handleRenameRun}
        onDelete={handleDeleteRun}
      />

      <ProgressHeader
        stats={stats}
        nextChampion={nextChampion}
        mode={mode}
        onModeChange={store.setCompletionMode}
        classFilter={activeRun.classFilter}
        onClassFilterChange={store.setClassFilter}
        onReset={handleReset}
        auth={auth}
        syncing={syncing}
      />

      <RiotImport account={store.riotAccount} onImport={handleRiotImport} />

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
              index={pool.indexOf(champ)}
              entry={entryFor(champ.id)}
              mode={mode}
              onChange={(patch) => updateEntry(champ.id, patch)}
              onAddGame={(result) => addGame(champ.id, result)}
              onRemoveGame={(gameId) => removeGame(champ.id, gameId)}
              onUpdateGame={(gameId, patch) => updateGame(champ.id, gameId, patch)}
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
