import { COMPLETION_MODES } from '../run.js'
import { CLASSES } from '../constants.js'

// Top-of-page summary: overall completion, win/game record, the next champion
// still to play in A→Z order, and the run's completion-mode + champion-pool config.
export default function ProgressHeader({
  stats,
  nextChampion,
  mode,
  onModeChange,
  classFilter,
  onClassFilterChange,
  onReset,
  onDeleteData,
  auth,
  syncing,
}) {
  const toggleClass = (key) =>
    onClassFilterChange(
      classFilter.includes(key)
        ? classFilter.filter((k) => k !== key)
        : [...classFilter, key],
    )

  const { total, completed, won, totalGames, avgGamesToWin, avgFun } = stats
  const pct = total ? Math.round((completed / total) * 100) : 0

  return (
    <header className="progress-header">
      <div className="progress-top">
        <div>
          <h1>A–Z Challenge Tracker</h1>
          <p className="subtitle">Play every champion, in alphabetical order.</p>
        </div>
        <div className="header-actions">
          {auth.firebaseEnabled &&
            (auth.user ? (
              <div className="account">
                <span className="sync-dot" title={syncing ? 'Syncing…' : 'Synced to cloud'}>
                  {syncing ? '↻ Syncing' : '✓ Synced'}
                </span>
                {auth.user.photoURL && (
                  <img className="avatar" src={auth.user.photoURL} alt="" width={26} height={26} />
                )}
                <button type="button" className="reset-btn" onClick={auth.logout}>
                  Sign out
                </button>
                <button
                  type="button"
                  className="delete-data-btn"
                  onClick={onDeleteData}
                  title="Permanently delete all your data"
                >
                  Delete my data
                </button>
              </div>
            ) : (
              <button type="button" className="signin-btn" onClick={auth.login}>
                Sign in with Google
              </button>
            ))}
          <button type="button" className="reset-btn" onClick={onReset}>
            Reset run
          </button>
        </div>
      </div>

      {auth.firebaseEnabled && !auth.user && (
        <p className="signin-hint">
          Playing locally on this device. Sign in to sync your run across devices.
        </p>
      )}

      <div className="mode-row">
        <span className="mode-label">Complete a champion on:</span>
        <div className="mode-toggle" role="group" aria-label="Completion mode">
          {COMPLETION_MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              className={`mode-btn${mode === m.key ? ' is-active' : ''}`}
              onClick={() => onModeChange(m.key)}
              title={m.hint}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pool-row">
        <span className="mode-label">Champion pool:</span>
        <div className="class-chips" role="group" aria-label="Champion classes">
          {CLASSES.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`chip${classFilter.includes(c.key) ? ' is-active' : ''}`}
              onClick={() => toggleClass(c.key)}
            >
              {c.label}
            </button>
          ))}
          {classFilter.length > 0 && (
            <button type="button" className="chip clear" onClick={() => onClassFilterChange([])}>
              Clear (all)
            </button>
          )}
        </div>
        <span className="pool-count">
          {classFilter.length ? `${stats.total} champions` : 'All champions'}
        </span>
      </div>

      <div className="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
        <span className="progress-label">
          {completed} / {total} champions · {pct}%
        </span>
      </div>

      <dl className="stat-row">
        <div className="stat">
          <dt>Won</dt>
          <dd className="stat-win">{won}</dd>
        </div>
        <div className="stat">
          <dt>Total games</dt>
          <dd>{totalGames}</dd>
        </div>
        <div className="stat">
          <dt>Avg games / win</dt>
          <dd>{avgGamesToWin != null ? avgGamesToWin.toFixed(1) : '—'}</dd>
        </div>
        <div className="stat">
          <dt>Avg fun</dt>
          <dd className="stat-fun">{avgFun != null ? `${avgFun.toFixed(1)} ★` : '—'}</dd>
        </div>
        <div className="stat stat-next">
          <dt>Up next</dt>
          <dd>{nextChampion ? nextChampion.name : '🎉 Done!'}</dd>
        </div>
      </dl>
    </header>
  )
}
