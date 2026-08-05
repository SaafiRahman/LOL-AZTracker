import { useState } from 'react'

// One row in a champion's game log. K/D/A shows as plain text by default with a
// pencil affordance on hover; clicking it reveals the editable number fields.
export default function GameRow({ game, index, isWinGame, championName, onUpdateGame, onRemoveGame }) {
  const [editing, setEditing] = useState(false)
  const { id, result, date, source, kills, deaths, assists } = game
  const hasKda = kills != null || deaths != null || assists != null
  const show = (v) => (v == null ? '–' : v)
  const patch = (field, value) => onUpdateGame(id, { [field]: value === '' ? null : Number(value) })

  return (
    <li className={`game-row game-${result}`}>
      <span className="game-num">#{index + 1}</span>
      <span className={`game-badge badge-${result}`}>{result === 'win' ? 'Win' : 'Loss'}</span>
      {isWinGame && <span className="game-flag">🏆 win game</span>}

      {editing ? (
        <span className="game-kda editing">
          <input
            type="number"
            min="0"
            className="kda-input"
            placeholder="K"
            value={kills ?? ''}
            onChange={(e) => patch('kills', e.target.value)}
            aria-label={`Kills, game ${index + 1}`}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
          <span className="kda-sep">/</span>
          <input
            type="number"
            min="0"
            className="kda-input"
            placeholder="D"
            value={deaths ?? ''}
            onChange={(e) => patch('deaths', e.target.value)}
            aria-label={`Deaths, game ${index + 1}`}
          />
          <span className="kda-sep">/</span>
          <input
            type="number"
            min="0"
            className="kda-input"
            placeholder="A"
            value={assists ?? ''}
            onChange={(e) => patch('assists', e.target.value)}
            aria-label={`Assists, game ${index + 1}`}
          />
          <button
            type="button"
            className="kda-done"
            onClick={() => setEditing(false)}
            aria-label="Done editing K/D/A"
          >
            ✓
          </button>
        </span>
      ) : (
        <button
          type="button"
          className={`game-kda-display${hasKda ? '' : ' is-empty'}`}
          onClick={() => setEditing(true)}
          aria-label={hasKda ? `K/D/A ${show(kills)}/${show(deaths)}/${show(assists)} — edit` : 'Add K/D/A'}
        >
          {hasKda ? (
            <span className="kda-text">
              {show(kills)} / {show(deaths)} / {show(assists)}
            </span>
          ) : (
            <span className="kda-add">+ KDA</span>
          )}
          <span className="kda-edit-icon" aria-hidden="true">✎</span>
        </button>
      )}

      <input
        type="date"
        className="game-date"
        value={date ?? ''}
        onChange={(e) => onUpdateGame(id, { date: e.target.value || null })}
        aria-label={`Date of game ${index + 1} for ${championName}`}
      />
      {source === 'riot' && <span className="game-source">from Riot</span>}
      <button
        type="button"
        className="game-remove"
        aria-label={`Remove game ${index + 1} for ${championName}`}
        onClick={() => onRemoveGame(id)}
      >
        ×
      </button>
    </li>
  )
}
