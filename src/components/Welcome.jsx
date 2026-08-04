// A one-time intro for first-time visitors, explaining the challenge and the
// three things you can do. Dismissal is remembered by the caller (localStorage),
// so returning users never see it.
export default function Welcome({ onDismiss }) {
  return (
    <section className="welcome">
      <button
        type="button"
        className="welcome-close"
        onClick={onDismiss}
        aria-label="Dismiss intro"
      >
        ×
      </button>

      <h2 className="welcome-title">New to the A–Z Challenge?</h2>
      <p className="welcome-lead">
        The A–Z challenge is playing <strong>every League champion</strong>, one per game, in
        alphabetical order — from Aatrox to Zyra. This tracker keeps your place and your stats.
      </p>

      <ol className="welcome-steps">
        <li>
          <span className="welcome-step-num">1</span>
          <span>
            <strong>Log your games.</strong> Hit <em>+ Win</em> / <em>+ Loss</em> on a champion — or
            auto-<strong>import your recent matches from Riot</strong> and they’ll land on the right
            champions automatically.
          </span>
        </li>
        <li>
          <span className="welcome-step-num">2</span>
          <span>
            <strong>Sign in with Google</strong> (optional) to sync your progress across devices.
            Not signed in? It still saves on this device.
          </span>
        </li>
        <li>
          <span className="welcome-step-num">3</span>
          <span>
            <strong>Track as you go.</strong> Rate each champ’s fun, see your win rate and
            “games-to-win,” and filter by role or run multiple challenges at once.
          </span>
        </li>
      </ol>

      <button type="button" className="welcome-got-it" onClick={onDismiss}>
        Got it — let’s go
      </button>
    </section>
  )
}
