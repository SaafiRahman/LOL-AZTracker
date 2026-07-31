import { ROLES, RESULTS } from '../constants.js'

// A single champion row: icon + name, plus the controls for tracking a game.
// `entry` is the saved state (or an empty entry); `onChange` receives a
// partial patch to merge into that champion's entry.
export default function ChampionCard({ champion, entry, onChange, index }) {
  const { completed, result, role, notes, date } = entry

  return (
    <li className={`champ-card${completed ? ' is-completed' : ''}`}>
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

        <label className="champ-complete">
          <input
            type="checkbox"
            checked={completed}
            onChange={(e) => onChange({ completed: e.target.checked })}
          />
          <span>Done</span>
        </label>
      </div>

      <div className="champ-controls">
        <div className="control-group" role="group" aria-label="Result">
          {RESULTS.map((r) => (
            <button
              key={r.key}
              type="button"
              className={`pill result-${r.key}${result === r.key ? ' is-active' : ''}`}
              onClick={() => onChange({ result: result === r.key ? null : r.key })}
            >
              {r.label}
            </button>
          ))}
        </div>

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
        </div>

        <div className="control-row">
          <input
            type="date"
            className="champ-date"
            value={date ?? ''}
            onChange={(e) => onChange({ date: e.target.value || null })}
            aria-label={`Date played for ${champion.name}`}
          />
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
