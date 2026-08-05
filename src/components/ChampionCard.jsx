import { useState } from 'react'
import { ROLES } from '../constants.js'
import { isComplete, statusText, firstWinIndex, championKda } from '../run.js'
import StarRating from './StarRating.jsx'
import GameRow from './GameRow.jsx'

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
  const kda = championKda(entry)
  const [open, setOpen] = useState(false)

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

      <div className="champ-quick">
        <span className="game-add-label">Log a game</span>
        <button type="button" className="pill win" onClick={() => onAddGame('win')}>
          + Win
        </button>
        <button type="button" className="pill loss" onClick={() => onAddGame('loss')}>
          + Loss
        </button>
        {kda && (
          <span
            className="champ-kda"
            title={`Average over ${kda.games} game${kda.games === 1 ? '' : 's'} · ${kda.ratio.toFixed(2)} KDA`}
          >
            <span className="champ-kda-label">KDA</span>
            {kda.avgK.toFixed(1)} / {kda.avgD.toFixed(1)} / {kda.avgA.toFixed(1)}
          </span>
        )}
        <span className="games-status">{statusText(entry)}</span>
      </div>

      <div className="champ-more">
        <button
          type="button"
          className={`champ-more-summary${open ? ' is-open' : ''}`}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <span className="champ-more-chevron" aria-hidden="true">▾</span>
          <span className="champ-more-label">
            {games.length > 0 ? `Game log · ${games.length}` : 'Details & notes'}
          </span>
        </button>

        <div className={`champ-more-collapse${open ? ' is-open' : ''}`}>
          <div className="champ-more-inner">
            <div className="champ-more-body">
          {games.length > 0 && (
            <ol className="game-log">
              {games.map((g, i) => (
                <GameRow
                  key={g.id}
                  game={g}
                  index={i}
                  isWinGame={i === winIdx}
                  championName={champion.name}
                  onUpdateGame={onUpdateGame}
                  onRemoveGame={onRemoveGame}
                />
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
          </div>
        </div>
      </div>
    </li>
  )
}
