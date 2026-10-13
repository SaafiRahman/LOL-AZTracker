import { Fragment } from 'react'
import { FILTERS, ROLES } from '../constants.js'
import { isComplete, isWon, lossCount, gamesToWin, championKda, firstWinIndex } from '../run.js'
import StarRating from './StarRating.jsx'
import GameRow from './GameRow.jsx'
import Icon from './Icon.jsx'

const roleLabel = (key) => ROLES.find((r) => r.key === key)?.label ?? ''

// The full run as a ledger: one row per champion in A→Z order with letter
// dividers. Rows read as done / current / upcoming; opening a row shows its log,
// rating, role and notes.
export default function Roster({
  champions,
  poolIndex,
  entryFor,
  mode,
  currentId,
  expanded,
  onToggle,
  filter,
  onFilter,
  search,
  onSearch,
  rowActions,
}) {
  let lastLetter = null
  return (
    <section className="roster" aria-labelledby="roster-heading">
      <div className="section-head roster-head">
        <h2 id="roster-heading">Roster</h2>
        <div className="roster-tools">
          <div className="segmented" role="group" aria-label="Show">
            {FILTERS.map((f) => (
              <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => onFilter(f.key)}>
                {f.label}
              </button>
            ))}
          </div>
          <label className="search">
            <Icon name="search" size={16} />
            <span className="visually-hidden">Search champions</span>
            <input type="search" className="input" placeholder="Search champions" value={search} onChange={(e) => onSearch(e.target.value)} />
          </label>
        </div>
      </div>

      {champions.length === 0 ? (
        <p className="empty">
          No champions match this view.{' '}
          <button type="button" className="link-btn" onClick={() => { onFilter('all'); onSearch('') }}>
            Show all
          </button>
        </p>
      ) : (
        <table className="ledger">
          <thead>
            <tr>
              <th scope="col" className="col-num">#</th>
              <th scope="col">Champion</th>
              <th scope="col" className="col-wl">W–L</th>
              <th scope="col" className="col-status">Status</th>
              <th scope="col" className="col-kda">Avg KDA</th>
              <th scope="col" className="col-rating">Fun</th>
              <th scope="col" className="col-role">Role</th>
            </tr>
          </thead>
          <tbody>
            {champions.map((c) => {
              const letter = c.name[0].toUpperCase()
              const divider = letter !== lastLetter
              lastLetter = letter
              return (
                <Fragment key={c.id}>
                  {divider && (
                    <tr className="letter-row">
                      <th scope="rowgroup" colSpan={7}>
                        {letter}
                      </th>
                    </tr>
                  )}
                  <RosterRow
                    champion={c}
                    number={poolIndex.get(c.id) + 1}
                    entry={entryFor(c.id)}
                    mode={mode}
                    current={c.id === currentId}
                    open={expanded.has(c.id)}
                    onToggle={() => onToggle(c.id)}
                    actions={rowActions(c.id)}
                  />
                </Fragment>
              )
            })}
          </tbody>
        </table>
      )}
    </section>
  )
}

function RosterRow({ champion, number, entry, mode, current, open, onToggle, actions }) {
  const complete = isComplete(entry, mode)
  const games = entry.games.length
  const losses = lossCount(entry)
  const kda = championKda(entry)
  const g2w = gamesToWin(entry)
  const state = complete ? 'done' : current ? 'current' : games > 0 ? 'progress' : 'todo'

  let status
  if (complete) status = g2w ? `Won on game ${g2w}` : entry.manualDone ? 'Marked done' : 'Done'
  else if (current) status = 'Up next'
  else if (games > 0) status = `${games} game${games === 1 ? '' : 's'}, no win yet`
  else status = '—'

  return (
    <>
      <tr id={`row-${champion.id}`} className={`ledger-row is-${state}${open ? ' is-open' : ''}`}>
        <td className="col-num num">{number}</td>
        <td className="col-name">
          <button type="button" className="row-toggle" onClick={onToggle} aria-expanded={open} aria-controls={`detail-${champion.id}`}>
            <img src={champion.iconUrl} alt="" width={36} height={36} loading="lazy" />
            <span className="row-name">{champion.name}</span>
            <Icon name="chevron" size={16} className="row-chevron" />
          </button>
        </td>
        <td className="col-wl num">{games ? `${games - losses}–${losses}` : '—'}</td>
        <td className="col-status">
          {complete && <Icon name="check" size={16} className="status-check" />}
          {status}
        </td>
        <td className="col-kda num">{kda ? `${kda.avgK.toFixed(1)} / ${kda.avgD.toFixed(1)} / ${kda.avgA.toFixed(1)}` : '—'}</td>
        <td className="col-rating num">{entry.rating != null ? (
            <>
              {entry.rating.toFixed(1)}
              <Icon name="star" size={14} filled className="inline-star" />
            </>
          ) : (
            '—'
          )}</td>
        <td className="col-role">{roleLabel(entry.role) || '—'}</td>
      </tr>
      {open && (
        <tr id={`detail-${champion.id}`} className="ledger-detail">
          <td colSpan={7}>
            <ChampionDetail champion={champion} entry={entry} mode={mode} complete={complete} {...actions} />
          </td>
        </tr>
      )}
    </>
  )
}

function ChampionDetail({ champion, entry, mode, complete, onChange, onAddGame, onRemoveGame, onUpdateGame }) {
  const { games, role, notes, rating } = entry
  const winIdx = firstWinIndex(entry)
  // Completion that comes from the log can't be unticked here; the manual
  // override only matters when the log hasn't completed the champion.
  const logComplete = isWon(entry) || (mode === 'any' && games.length > 0)

  return (
    <div className="detail">
      <div className="detail-col">
        <div className="detail-log-actions" role="group" aria-label={`Log a game on ${champion.name}`}>
          <button type="button" className="btn btn-win btn-sm" onClick={() => onAddGame('win')}>
            <Icon name="plus" size={16} /> Win
          </button>
          <button type="button" className="btn btn-loss btn-sm" onClick={() => onAddGame('loss')}>
            <Icon name="plus" size={16} /> Loss
          </button>
          {logComplete ? (
            <span className="done-note">
              <Icon name="check" size={16} /> {isWon(entry) ? `Done, won on game ${winIdx + 1}` : 'Done, played once'}
            </span>
          ) : (
            <label className="check">
              <input type="checkbox" checked={!!entry.manualDone} onChange={(e) => onChange({ manualDone: e.target.checked })} />
              <span>Mark as done without a win</span>
            </label>
          )}
        </div>

        {games.length > 0 ? (
          <ol className="game-log" aria-label={`Game log for ${champion.name}`}>
            {games.map((g, i) => (
              <GameRow key={g.id} game={g} index={i} isWinGame={i === winIdx} championName={champion.name} onUpdateGame={onUpdateGame} onRemoveGame={onRemoveGame} />
            ))}
          </ol>
        ) : (
          <p className="detail-empty">No games yet. Import from Riot, or log one above.</p>
        )}
      </div>

      <div className="detail-col detail-meta">
        <StarRating value={rating} onChange={(v) => onChange({ rating: v })} label="Fun" championName={champion.name} />
        <div className="field">
          <span className="field-label" id={`role-${champion.id}`}>
            Role
          </span>
          <div className="chip-row" role="group" aria-labelledby={`role-${champion.id}`}>
            {ROLES.map((r) => (
              <button key={r.key} type="button" className="chip" aria-pressed={role === r.key} onClick={() => onChange({ role: role === r.key ? null : r.key })}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <label className="field">
          <span className="field-label">Notes</span>
          <textarea className="input notes" rows={2} placeholder="Build, matchup, how it felt…" value={notes} onChange={(e) => onChange({ notes: e.target.value })} />
        </label>
      </div>
    </div>
  )
}
