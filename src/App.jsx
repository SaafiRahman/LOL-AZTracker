import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchChampions } from './api/dataDragon.js'
import { emptyEntry } from './storage/storage.js'
import { isComplete, isWon, gamesPlayed, gamesToWin } from './run.js'
import { uid, todayISO, toISODate } from './util.js'
import { importMatches, importMatchesByDate } from './api/riot.js'
import { lastImportDate, quickImportOptions } from './importPlan.js'
import { useAuth } from './auth.js'
import { useStore } from './useStore.js'
import TopBar from './components/TopBar.jsx'
import RunSettings from './components/RunSettings.jsx'
import Spotlight from './components/Spotlight.jsx'
import ImportOptions from './components/ImportOptions.jsx'
import TrophyShelf from './components/TrophyShelf.jsx'
import Roster from './components/Roster.jsx'
import ShareModal from './components/ShareModal.jsx'
import Icon from './components/Icon.jsx'
import Contact from './components/Contact.jsx'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const poolFor = (champions, classFilter) =>
  classFilter?.length ? champions.filter((c) => c.tags?.some((t) => classFilter.includes(t))) : champions

export default function App() {
  const [champions, setChampions] = useState([])
  const [loadState, setLoadState] = useState('loading') // 'loading' | 'ready' | 'error'
  const [error, setError] = useState(null)

  const auth = useAuth()
  const store = useStore(auth.user)
  const { activeRun, runList, ready: storeReady, syncing } = store

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [shareOpen, setShareOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [expanded, setExpanded] = useState(() => new Set())
  const [importState, setImportState] = useState({ busy: false, busyMessage: '', error: null, recap: null })
  const [toast, setToast] = useState(null) // { message, undo? }
  const toastTimer = useRef(null)

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
  const pool = useMemo(() => poolFor(champions, activeRun?.classFilter), [champions, activeRun?.classFilter])
  const poolIndex = useMemo(() => new Map(pool.map((c, i) => [c.id, i])), [pool])

  const runChampions = activeRun?.champions ?? {}
  const mode = activeRun?.completionMode ?? 'win'
  const entryFor = (id) => runChampions[id] ?? emptyEntry()

  // The toast hides after 7s, but holds while it's hovered or focused so Undo
  // is never snatched away mid-reach.
  function startToastTimer() {
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 7000)
  }
  const holdToast = () => clearTimeout(toastTimer.current)

  function showToast(message, undo) {
    setToast({ message, undo })
    startToastTimer()
  }

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
    const current = runChampions[id] ?? emptyEntry()
    const index = current.games.findIndex((g) => g.id === gameId)
    if (index === -1) return
    const removed = current.games[index]
    store.mutateChampions((prev) => {
      const e = prev[id] ?? emptyEntry()
      return { ...prev, [id]: { ...e, games: e.games.filter((g) => g.id !== gameId) } }
    })
    const name = champions.find((c) => c.id === id)?.name ?? 'champion'
    showToast(`Removed a ${removed.result} from ${name}.`, () =>
      store.mutateChampions((prev) => {
        const e = prev[id] ?? emptyEntry()
        const games = [...e.games]
        games.splice(Math.min(index, games.length), 0, removed)
        return { ...prev, [id]: { ...e, games } }
      }),
    )
  }

  function updateGame(id, gameId, patch) {
    store.mutateChampions((prev) => {
      const current = prev[id] ?? emptyEntry()
      const games = current.games.map((g) => (g.id === gameId ? { ...g, ...patch } : g))
      return { ...prev, [id]: { ...current, games } }
    })
  }

  // --- run management (naming and confirmation happen in RunSettings) ---
  function handleReset() {
    store.resetActiveRun()
    showToast(`Cleared every game in “${activeRun.name}”.`)
  }

  // Throws on failure so RunSettings can show the error in place.
  async function handleDeleteData() {
    await store.deleteAccountData()
    await auth.logout()
    setSettingsOpen(false)
  }

  function handleNewRun(name) {
    store.addRun(name)
    showToast(`Started “${name}”.`)
  }
  function handleRenameRun(name) {
    store.renameRun(activeRun.id, name)
  }
  function handleDeleteRun() {
    const name = activeRun.name
    store.deleteRun(activeRun.id)
    showToast(`Deleted “${name}”.`)
  }

  function applySettings({ completionMode, classFilter }) {
    if (completionMode !== activeRun.completionMode) store.setCompletionMode(completionMode)
    if (classFilter.join() !== activeRun.classFilter.join()) store.setClassFilter(classFilter)
    setSettingsOpen(false)
    showToast('Run settings applied. Progress recounted.')
  }

  // How many champions would be done under a given rule set (for the settings preview).
  const previewCounts = (m, classFilter) => {
    const p = poolFor(champions, classFilter)
    let completed = 0
    for (const c of p) if (isComplete(runChampions[c.id] ?? emptyEntry(), m)) completed += 1
    return { total: p.length, completed }
  }

  // Fetch games from Riot and append them (as source:'riot') to the matching
  // champions in this run's pool, skipping already-imported matches. Leaves a
  // per-champion recap in the spotlight.
  async function runImport(opts) {
    const { mode: range, gameName, tagLine, region, queueKey } = opts
    setImportState({
      busy: true,
      busyMessage: range === 'date' ? 'Paging through your match history on Riot…' : 'Fetching your recent matches from Riot…',
      error: null,
      recap: null,
    })
    try {
      const result =
        range === 'date'
          ? await importMatchesByDate({
              gameName,
              tagLine,
              region,
              queues: opts.queues,
              type: opts.type,
              keepMode: opts.keepMode,
              startTime: opts.startTime,
              endTime: opts.endTime,
            })
          : await importMatches({ gameName, tagLine, region, count: opts.count, fetchParams: opts.fetchParams, keep: opts.keep })
      // Remember the Riot ID, region and queue so "Import new games" repeats them.
      store.setRiotAccount({ gameName, tagLine, region, queueKey })

      // Match-V5 championName matches Data Dragon ids (compared case-insensitively).
      const byId = new Map(pool.map((c) => [c.id.toLowerCase(), c]))
      const existing = new Set()
      for (const e of Object.values(runChampions)) for (const g of e.games) if (g.matchId) existing.add(g.matchId)
      // Oldest-first so the appended log stays chronological (like manual entries).
      const ordered = [...result.games].sort((a, b) => (a.date ?? 0) - (b.date ?? 0))

      let added = 0
      let skipped = 0
      let unmatched = 0
      const touched = new Map() // champ id → { wins, losses }
      let recapChamps = []
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
            kills: m.kills,
            deaths: m.deaths,
            assists: m.assists,
          }
          next[champ.id] = { ...current, games: [...current.games, game] }
          existing.add(m.matchId)
          added += 1
          const t = touched.get(champ.id) ?? { wins: 0, losses: 0 }
          t[m.win ? 'wins' : 'losses'] += 1
          touched.set(champ.id, t)
        }
        recapChamps = pool
          .filter((c) => touched.has(c.id))
          .map((c) => {
            const before = prev[c.id] ?? emptyEntry()
            const after = next[c.id]
            return {
              id: c.id,
              name: c.name,
              iconUrl: c.iconUrl,
              ...touched.get(c.id),
              completedNow: !isComplete(before, mode) && isComplete(after, mode),
              gamesToWin: gamesToWin(after),
            }
          })
        return next
      })

      setImportState({
        busy: false,
        busyMessage: '',
        error: null,
        recap: { added, skipped, unmatched, truncated: result.truncated, totalFound: result.totalFound, champions: recapChamps },
      })
      setOptionsOpen(false)
    } catch (e) {
      setImportState({ busy: false, busyMessage: '', error: e.message, recap: null })
    }
  }

  const sinceDate = useMemo(() => lastImportDate(runChampions), [runChampions])

  function quickImport() {
    runImport(quickImportOptions({ account: store.riotAccount, sinceDate }))
  }

  // First import from the spotlight form: the last 20 matches in the chosen queue.
  function firstImport(account) {
    runImport(quickImportOptions({ account, sinceDate: null }))
  }

  const stats = useMemo(() => {
    let completed = 0
    let won = 0
    let totalGames = 0
    let winGamesSum = 0
    let ratingSum = 0
    let ratedCount = 0
    let k = 0
    let d = 0
    let a = 0
    let kdaGames = 0
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
      for (const g of e.games) {
        if (g.kills != null && g.deaths != null && g.assists != null) {
          k += g.kills
          d += g.deaths
          a += g.assists
          kdaGames += 1
        }
      }
    }
    return {
      total: pool.length,
      completed,
      won,
      totalGames,
      avgGamesToWin: won ? winGamesSum / won : null,
      avgFun: ratedCount ? ratingSum / ratedCount : null,
      // KDA ratio (K+A)/D across all games that have full K/D/A.
      kda: kdaGames ? (k + a) / Math.max(d, 1) : null,
    }
  }, [pool, runChampions, mode])

  const nextChampion = useMemo(
    () => pool.find((c) => !isComplete(runChampions[c.id] ?? emptyEntry(), mode)),
    [pool, runChampions, mode],
  )

  const completedChampions = useMemo(
    () => pool.filter((c) => isComplete(runChampions[c.id] ?? emptyEntry(), mode)),
    [pool, runChampions, mode],
  )

  const letters = useMemo(
    () =>
      LETTERS.map((letter) => {
        const inLetter = pool.filter((c) => c.name[0].toUpperCase() === letter)
        return {
          letter,
          total: inLetter.length,
          done: inLetter.filter((c) => isComplete(runChampions[c.id] ?? emptyEntry(), mode)).length,
          current: nextChampion ? nextChampion.name[0].toUpperCase() === letter : false,
        }
      }),
    [pool, runChampions, mode, nextChampion],
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

  const toggleRow = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  // Open a champion's row in the roster and bring it into view.
  const [jumpTarget, setJumpTarget] = useState(null)
  function jumpTo(id) {
    setFilter('all')
    setSearch('')
    setExpanded((prev) => new Set(prev).add(id))
    setJumpTarget(id)
  }
  useEffect(() => {
    if (!jumpTarget) return
    const row = document.getElementById(`row-${jumpTarget}`)
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' })
      row.querySelector('.row-toggle')?.focus({ preventScroll: true })
    }
    setJumpTarget(null)
  }, [jumpTarget])

  const closeShare = useCallback(() => setShareOpen(false), [])

  if (loadState === 'loading' || !auth.ready || !storeReady || !activeRun) {
    return (
      <div className="app">
        <div className="centered-msg" role="status">
          Loading champions from Data Dragon…
        </div>
      </div>
    )
  }

  if (loadState === 'error') {
    return (
      <div className="app">
        <div className="centered-msg error" role="alert">
          <p>Couldn’t load the champion list from Riot’s Data Dragon.</p>
          <p className="error-detail">{error}</p>
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  const rowActions = (id) => ({
    onChange: (patch) => updateEntry(id, patch),
    onAddGame: (result) => addGame(id, result),
    onRemoveGame: (gameId) => removeGame(id, gameId),
    onUpdateGame: (gameId, patch) => updateGame(id, gameId, patch),
  })

  return (
    <div className="app">
      <a className="skip-link" href="#roster-heading">
        Skip to roster
      </a>

      <TopBar
        runs={runList}
        activeRunId={activeRun.id}
        onSelectRun={store.selectRun}
        settingsOpen={settingsOpen}
        onToggleSettings={() => setSettingsOpen((o) => !o)}
        onShare={() => setShareOpen(true)}
        auth={auth}
        syncing={syncing}
      />

      {settingsOpen && (
        <RunSettings
          key={activeRun.id}
          run={activeRun}
          runCount={runList.length}
          previewCounts={previewCounts}
          canDeleteRun={runList.length > 1}
          auth={auth}
          onApply={applySettings}
          onNewRun={handleNewRun}
          onRenameRun={handleRenameRun}
          onDeleteRun={handleDeleteRun}
          onResetRun={handleReset}
          onDeleteData={handleDeleteData}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      <main>
        <Spotlight
          champion={nextChampion}
          position={nextChampion ? poolIndex.get(nextChampion.id) + 1 : pool.length}
          total={pool.length}
          entry={nextChampion ? entryFor(nextChampion.id) : emptyEntry()}
          firstChampion={pool[0]}
          lastChampion={pool[pool.length - 1]}
          isNewRun={stats.totalGames === 0}
          letters={letters}
          account={store.riotAccount}
          sinceDate={sinceDate}
          importState={importState}
          optionsOpen={optionsOpen}
          onQuickImport={quickImport}
          onFirstImport={firstImport}
          onToggleOptions={() => setOptionsOpen((o) => !o)}
          onDismissRecap={() => setImportState((s) => ({ ...s, recap: null }))}
          onAddGame={(result) => nextChampion && addGame(nextChampion.id, result)}
          onJumpTo={jumpTo}
        >
          {optionsOpen && <ImportOptions account={store.riotAccount} busy={importState.busy} onImport={runImport} />}
        </Spotlight>

        <TrophyShelf
          champions={completedChampions}
          entryFor={entryFor}
          avgGamesToWin={stats.avgGamesToWin}
          onJumpTo={jumpTo}
        />

        <Roster
          champions={visibleChampions}
          poolIndex={poolIndex}
          entryFor={entryFor}
          mode={mode}
          currentId={nextChampion?.id}
          expanded={expanded}
          onToggle={toggleRow}
          filter={filter}
          onFilter={setFilter}
          search={search}
          onSearch={setSearch}
          rowActions={rowActions}
        />
      </main>

      {shareOpen && <ShareModal runName={activeRun.name} stats={stats} letters={letters} nextName={nextChampion?.name} onClose={closeShare} />}

      {toast && (
        <div
          className="toast"
          role="status"
          onMouseEnter={holdToast}
          onMouseLeave={startToastTimer}
          onFocus={holdToast}
          onBlur={startToastTimer}
        >
          <span>{toast.message}</span>
          {toast.undo && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                toast.undo()
                setToast(null)
              }}
            >
              <Icon name="undo" size={16} /> Undo
            </button>
          )}
          <button type="button" className="toast-close" aria-label="Dismiss" onClick={() => setToast(null)}>
            <Icon name="close" size={16} />
          </button>
        </div>
      )}

      <Contact key={auth.user?.uid ?? 'signed-out'} auth={auth} />

      <section className="about">
        <h2>About the League of Legends A–Z Challenge</h2>
        <p>
          The League of Legends A–Z challenge is a popular community run where you play every
          champion, one at a time, in alphabetical order from Aatrox to Zyra. Many players keep
          going on each champion until they win a game on them, and it&rsquo;s become a favourite of
          streamers and completionists looking for a long-term goal.
        </p>
        <p>
          This free A–Z challenge tracker keeps your place through every champion and records how
          each game went. Enter your Riot ID to auto-import your recent match history. It fills in
          the champion you played, win or loss, and your KDA automatically. Or you can log games by
          hand. Track your win/loss record, games-to-win, roles, ratings, and overall progress, and
          optionally sign in to sync across your devices.
        </p>
      </section>

      <footer className="app-footer">
        <a href="#contact" className="footer-link">
          Contact
        </a>
        <span className="footer-sep" aria-hidden="true">
          ·
        </span>
        <a href="/privacy.html" className="footer-link">
          Privacy Policy
        </a>
        <span className="footer-sep" aria-hidden="true">
          ·
        </span>
        Champion data &amp; images © Riot Games, via Data Dragon. Not endorsed by Riot Games.
        <p className="footer-credit">
          Made by Saafi Rahman
          <span className="footer-sep" aria-hidden="true">
            ·
          </span>
          <a href="https://github.com/SaafiRahman" className="footer-link" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <span className="footer-sep" aria-hidden="true">
            ·
          </span>
          <a
            href="https://www.linkedin.com/in/saafi-rahman/"
            className="footer-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </p>
      </footer>
    </div>
  )
}
