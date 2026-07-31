// Top-of-page summary: overall completion, win/loss record, and the next
// champion still to play in A→Z order.
export default function ProgressHeader({ stats, nextChampion, onReset }) {
  const { total, completed, wins, losses } = stats
  const pct = total ? Math.round((completed / total) * 100) : 0
  const games = wins + losses
  const winRate = games ? Math.round((wins / games) * 100) : 0

  return (
    <header className="progress-header">
      <div className="progress-top">
        <div>
          <h1>A–Z Challenge Tracker</h1>
          <p className="subtitle">Play every champion, in alphabetical order.</p>
        </div>
        <button type="button" className="reset-btn" onClick={onReset}>
          Reset run
        </button>
      </div>

      <div className="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
        <span className="progress-label">
          {completed} / {total} champions · {pct}%
        </span>
      </div>

      <dl className="stat-row">
        <div className="stat">
          <dt>Wins</dt>
          <dd className="stat-win">{wins}</dd>
        </div>
        <div className="stat">
          <dt>Losses</dt>
          <dd className="stat-loss">{losses}</dd>
        </div>
        <div className="stat">
          <dt>Win rate</dt>
          <dd>{games ? `${winRate}%` : '—'}</dd>
        </div>
        <div className="stat stat-next">
          <dt>Up next</dt>
          <dd>{nextChampion ? nextChampion.name : '🎉 Done!'}</dd>
        </div>
      </dl>
    </header>
  )
}
