import { useState } from 'react'
import { RIOT_REGIONS, QUEUE_FILTERS } from '../api/riot.js'
import { parseRiotId, formatShortDate, accountQueue } from '../importPlan.js'
import { lossCount, isWon, championKda } from '../run.js'
import Icon from './Icon.jsx'

const SPLASH = (id) => `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${id}_0.jpg`
const LOADING = (id) => `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${id}_0.jpg`

// The first screen: the run's next champion, the import action that fills the
// run in, and the A→Z track. After an import the recap takes the import slot
// until dismissed.
export default function Spotlight({
  champion,
  position,
  total,
  entry,
  firstChampion,
  lastChampion,
  isNewRun,
  letters,
  account,
  sinceDate,
  importState,
  optionsOpen,
  onQuickImport,
  onFirstImport,
  onToggleOptions,
  onDismissRecap,
  onAddGame,
  onJumpTo,
  children,
}) {
  const art = champion ?? lastChampion
  return (
    <section className={`spotlight${champion ? '' : ' is-complete'}`} aria-labelledby="spotlight-name">
      {art && <SplashArt key={`art-${art.id}`} champion={art} />}

      <div className="spotlight-body" key={champion?.id ?? 'complete'}>
        {champion ? (
          <>
            <h2 id="spotlight-name" className="spotlight-name">
              {champion.name}
            </h2>
            <p className="spotlight-title">
              <span className="spotlight-position">
                Up next, <span className="num">{position}</span> of <span className="num">{total}</span>
              </span>
              <span className="spotlight-epithet">{champion.title}</span>
            </p>
            {isNewRun ? (
              <p className="spotlight-intro">
                The A–Z challenge: play every champion in alphabetical order, from{' '}
                {firstChampion?.name} to {lastChampion?.name}. Import your games from Riot and the
                tracker fills itself in.
              </p>
            ) : (
              <ChampionRecord entry={entry} />
            )}
          </>
        ) : (
          <>
            <h2 id="spotlight-name" className="spotlight-name">
              {firstChampion?.name} to {lastChampion?.name}
            </h2>
            <p className="spotlight-title">
              <span className="spotlight-position">Run complete</span>
              <span className="spotlight-epithet">
                Every champion in this run is done. Share the card, or start a new run.
              </span>
            </p>
          </>
        )}

        <div className="spotlight-actions">
          {importState.recap ? (
            <ImportRecap recap={importState.recap} onDismiss={onDismissRecap} onJumpTo={onJumpTo} />
          ) : account ? (
            <div className="import-row">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={onQuickImport}
                disabled={importState.busy}
              >
                <Icon name="import" size={20} />
                {importState.busy ? 'Importing…' : 'Import new games'}
              </button>
              <p className="import-meta">
                {account.gameName}#{account.tagLine}
                {' · '}
                {QUEUE_FILTERS.find((q) => q.key === accountQueue(account))?.label}
                {sinceDate ? ` · since ${formatShortDate(sinceDate)}` : ' · last 20 matches'}
              </p>
            </div>
          ) : (
            <FirstImport busy={importState.busy} onImport={onFirstImport} />
          )}

          {champion && (
            <div className="manual-log" role="group" aria-label={`Log a game on ${champion.name} by hand`}>
              <span className="manual-log-label">Log by hand</span>
              <button type="button" className="btn btn-win" onClick={() => onAddGame('win')}>
                <Icon name="plus" size={16} /> Win
              </button>
              <button type="button" className="btn btn-loss" onClick={() => onAddGame('loss')}>
                <Icon name="plus" size={16} /> Loss
              </button>
            </div>
          )}
        </div>

        {importState.error && (
          <p className="import-error" role="alert">
            {importState.error}
          </p>
        )}
        {importState.busy && (
          <p className="import-status" role="status">
            {importState.busyMessage}
          </p>
        )}

        <button
          type="button"
          className={`link-btn import-options-toggle${optionsOpen ? ' is-open' : ''}`}
          onClick={onToggleOptions}
          aria-expanded={optionsOpen}
          aria-controls="import-options"
        >
          Import options: queue, region, date range
          <Icon name="chevron" size={16} />
        </button>
      </div>

      {children}

      <AlphaTrack letters={letters} />
    </section>
  )
}

function SplashArt({ champion }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return (
    <picture className="spotlight-art" aria-hidden="true">
      <source media="(max-width: 720px)" srcSet={LOADING(champion.id)} />
      <img src={SPLASH(champion.id)} alt="" onError={() => setFailed(true)} />
    </picture>
  )
}

function ChampionRecord({ entry }) {
  const games = entry.games.length
  if (!games) return <p className="spotlight-record">No games on this champion yet.</p>
  const wins = games - lossCount(entry)
  const last = entry.games[entry.games.length - 1]
  const hasKda = last.kills != null && last.deaths != null && last.assists != null
  const kda = championKda(entry)
  return (
    <dl className="spotlight-record">
      <div>
        <dt>Record</dt>
        <dd className="num">
          {wins}–{games - wins}
        </dd>
      </div>
      <div>
        <dt>Last game</dt>
        <dd className={`num ${last.result}`}>
          {last.result === 'win' ? 'Win' : 'Loss'}
          {hasKda && ` · ${last.kills}/${last.deaths}/${last.assists}`}
        </dd>
      </div>
      {kda && !isWon(entry) && games > 1 && (
        <div>
          <dt>Avg KDA</dt>
          <dd className="num">{kda.ratio.toFixed(2)}</dd>
        </div>
      )}
    </dl>
  )
}

function FirstImport({ busy, onImport }) {
  const [riotId, setRiotId] = useState('')
  const [region, setRegion] = useState('americas')
  const [queueKey, setQueueKey] = useState('all')
  const [error, setError] = useState(null)

  function submit(e) {
    e.preventDefault()
    const id = parseRiotId(riotId)
    if (!id) {
      setError('Enter your Riot ID as Name#TAG, for example Faker#KR1.')
      return
    }
    setError(null)
    onImport({ ...id, region, queueKey })
  }

  return (
    <form className="first-import" onSubmit={submit}>
      <label className="field">
        <span className="field-label">Your Riot ID</span>
        <input
          className="input input-lg"
          placeholder="Name#TAG"
          value={riotId}
          onChange={(e) => setRiotId(e.target.value)}
          autoComplete="off"
          spellCheck="false"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'first-import-error' : undefined}
        />
      </label>
      <label className="field">
        <span className="field-label">Region</span>
        <select className="input input-lg" value={region} onChange={(e) => setRegion(e.target.value)}>
          {RIOT_REGIONS.map((r) => (
            <option key={r.key} value={r.key}>
              {r.label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span className="field-label">Queue</span>
        <select className="input input-lg" value={queueKey} onChange={(e) => setQueueKey(e.target.value)}>
          {QUEUE_FILTERS.map((q) => (
            <option key={q.key} value={q.key}>
              {q.label}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>
        <Icon name="import" size={20} />
        {busy ? 'Importing…' : 'Import my games'}
      </button>
      {error && (
        <p id="first-import-error" className="field-error">
          {error}
        </p>
      )}
    </form>
  )
}

function ImportRecap({ recap, onDismiss, onJumpTo }) {
  const { added, skipped, unmatched, truncated, totalFound, champions } = recap
  const finished = champions.filter((c) => c.completedNow)
  return (
    <div className="recap" role="status">
      <div className="recap-head">
        <p className="recap-summary">
          {added === 0 ? 'No new games since your last import.' : `${added} new game${added === 1 ? '' : 's'} imported`}
          {finished.length > 0 &&
            ` · ${finished.length} champion${finished.length === 1 ? '' : 's'} done`}
        </p>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onDismiss}>
          <Icon name="check" size={16} /> Got it
        </button>
      </div>
      {champions.length > 0 && (
        <ul className="recap-list">
          {champions.slice(0, 6).map((c) => (
            <li key={c.id}>
              <button type="button" className="recap-item" onClick={() => onJumpTo(c.id)}>
                <img src={c.iconUrl} alt="" width={36} height={36} />
                <span className="recap-name">{c.name}</span>
                <span className="recap-games num">
                  {c.wins > 0 && <span className="win">{c.wins}W</span>}
                  {c.losses > 0 && <span className="loss">{c.losses}L</span>}
                </span>
                {c.completedNow && (
                  <span className="recap-done">
                    <Icon name="check" size={14} /> done
                    {c.gamesToWin ? ` in ${c.gamesToWin}` : ''}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      {(skipped > 0 || unmatched > 0 || truncated || champions.length > 6) && (
        <p className="recap-note">
          {[
            champions.length > 6 && `+${champions.length - 6} more champions`,
            skipped > 0 && `${skipped} already logged`,
            unmatched > 0 && `${unmatched} not in this run’s pool`,
            truncated &&
              `${totalFound} games found; one import fetches up to 80, so import again for the rest`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      )}
    </div>
  )
}

// 26 letter segments, filled up to where the run is. Letters with no champions
// in this run's pool (possible with a class filter) are drawn empty.
function AlphaTrack({ letters }) {
  const done = letters.filter((l) => l.total > 0 && l.done === l.total).length
  const withChamps = letters.filter((l) => l.total > 0).length
  return (
    <ol className="alpha-track" aria-label={`Letters complete: ${done} of ${withChamps}`}>
      {letters.map((l) => {
        const state =
          l.total === 0 ? 'none' : l.done === l.total ? 'done' : l.current ? 'current' : l.done > 0 ? 'partial' : 'todo'
        return (
          <li key={l.letter} className={`alpha-seg is-${state}`} title={l.total ? `${l.letter}: ${l.done} of ${l.total}` : `${l.letter}: no champions in this pool`}>
            <span className="alpha-letter">{l.letter}</span>
            <span className="alpha-bar">
              <span style={{ width: l.total ? `${(l.done / l.total) * 100}%` : 0 }} />
            </span>
          </li>
        )
      })}
    </ol>
  )
}
