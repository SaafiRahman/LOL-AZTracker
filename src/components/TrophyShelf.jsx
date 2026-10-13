import { gamesToWin } from '../run.js'

// Finished champions as a strip of icons, in A→Z order. Each one jumps to its
// row in the roster.
export default function TrophyShelf({ champions, entryFor, avgGamesToWin, onJumpTo }) {
  if (!champions.length) return null
  return (
    <section className="shelf" aria-labelledby="shelf-heading">
      <div className="section-head">
        <h2 id="shelf-heading">Trophy shelf</h2>
        <p className="section-meta">
          <span className="num">{champions.length}</span> done
          {avgGamesToWin != null && (
            <>
              {' · '}
              <span className="num">{avgGamesToWin.toFixed(1)}</span> games per win on average
            </>
          )}
        </p>
      </div>
      <ul className="shelf-icons">
        {champions.map((c) => {
          const g = gamesToWin(entryFor(c.id))
          return (
            <li key={c.id}>
              <button
                type="button"
                className="shelf-icon"
                onClick={() => onJumpTo(c.id)}
                title={g ? `${c.name}, won on game ${g}` : c.name}
                aria-label={g ? `${c.name}, won on game ${g}` : `${c.name}, done`}
              >
                <img src={c.iconUrl} alt="" width={44} height={44} loading="lazy" />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
