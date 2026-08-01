import { ROLES } from '../constants.js'
import { isComplete, statusText, firstWinIndex } from '../run.js'
import StarRating from './StarRating.jsx'

// A single champion row: icon + name, an "add game" control, the game log, and
// overall role/notes. `onChange` patches entry-level fields (role/notes/
// manualDone); the game callbacks mutate the per-champion log.
export default function ChampionCard({
  champion,
  entry,
  index,
  mode,
  onChange,
  onAddGame,
  onRemoveGame,
  onUpdateGame,
}) {
  const { games, role, notes, rating } = entry
  const complete = isComplete(entry, mode)
  const winIdx = firstWinIndex(entry)

  return (
    <li className={`champ-card${complete ? ' is-completed' : ''}`}>
      <div className="champ-main">
        <span className="champ-index">{index + 1}</span>
        <img
          className="champ-icon"
          src={champion.iconUrl}
          alt=""
          loading="lazy"
          width={48}
          height={48}
        />
        <div className="champ-name">
          <span className="champ-name-main">{champion.name}</span>
          <span className="champ-title">{champion.title}</span>
        </div>

        <StarRating value={rating} onChange={(v) => onChange({ rating: v })} />

        <label className="champ-complete">
          <input
            type="checkbox"
            checked={complete}
            onChange={(e) => onChange({ manualDone: e.target.checked })}
          />
          <span>Done</span>
        </label>
      </div>

      <div className="champ-controls">
        <div className="game-add">
          <span className="game-add-label">Log a game:</span>
          <button type="button" className="pill win" onClick={() => onAddGame('win')}>
            + Win
          </button>
          <button type="button" className="pill loss" onClick={() => onAddGame('loss')}>
            + Loss
          </button>
          <span className="games-status">{statusText(entry)}</span>
        </div>

        {games.length > 0 && (
          <ol className="game-log">
            {games.map((g, i) => (
              <li key={g.id} className={`game-row game-${g.result}`}>
                <span className="game-num">#{i + 1}</span>
                <span className={`game-badge badge-${g.result}`}>
                  {g.result === 'win' ? 'Win' : 'Loss'}
                </span>
                {i === winIdx && <span className="game-flag">🏆 win game</span>}
                <input
                  type="date"
                  className="game-date"
                  value={g.date ?? ''}
                  onChange={(e) => onUpdateGame(g.id, { date: e.target.value || null })}
                  aria-label={`Date of game ${i + 1} for ${champion.name}`}
                />
                {g.source === 'riot' && <span className="game-source">from Riot</span>}
                <button
                  type="button"
                  className="game-remove"
                  aria-label={`Remove game ${i + 1} for ${champion.name}`}
                  onClick={() => onRemoveGame(g.id)}
                >
                  ×
                </button>
              </li>
            ))}
          </ol>
        )}

        <div className="control-group" role="group" aria-label="Role">
          {ROLES.map((r) => (
            <button
              key={r.key}
              type="button"
              className={`pill role${role === r.key ? ' is-active' : ''}`}
              onClick={() => onChange({ role: role === r.key ? null : r.key })}
            >
              {r.label}
            </button>
          ))}
          <input
            type="text"
            className="champ-notes"
            placeholder="Notes…"
            value={notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            aria-label={`Notes for ${champion.name}`}
          />
        </div>
      </div>
    </li>
  )
}
