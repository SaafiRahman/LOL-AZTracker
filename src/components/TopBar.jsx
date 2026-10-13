import Icon from './Icon.jsx'

// Slim app bar: product name, run switcher, and the few global actions. Run
// management, completion rules and account deletion live in Run settings.
export default function TopBar({ runs, activeRunId, onSelectRun, settingsOpen, onToggleSettings, onShare, auth, syncing }) {
  return (
    <header className="topbar">
      <h1 className="brand-heading">
        <a className="brand" href="/" aria-label="LoL A–Z Challenge Tracker, home">
          <span className="brand-long">A–Z Challenge Tracker</span>
          <span className="brand-short" aria-hidden="true">A–Z</span>
        </a>
      </h1>

      <label className="run-picker">
        <span className="visually-hidden">Active run</span>
        <select className="input input-quiet" value={activeRunId} onChange={(e) => onSelectRun(e.target.value)}>
          {runs.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </label>

      <div className="topbar-actions">
        <button
          type="button"
          className={`btn btn-ghost${settingsOpen ? ' is-active' : ''}`}
          onClick={onToggleSettings}
          aria-expanded={settingsOpen}
          aria-controls="run-settings"
        >
          <Icon name="settings" />
          <span className="btn-label">Run settings</span>
        </button>
        <button type="button" className="btn btn-ghost" onClick={onShare}>
          <Icon name="share" />
          <span className="btn-label">Share</span>
        </button>
        {auth.firebaseEnabled &&
          (auth.user ? (
            <span className="account" title={syncing ? 'Syncing…' : 'Synced to the cloud'}>
              {auth.user.photoURL && <img className="avatar" src={auth.user.photoURL} alt="" width={28} height={28} />}
              <span className={`sync-state${syncing ? ' is-syncing' : ''}`}>{syncing ? 'Syncing' : 'Synced'}</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={auth.logout}>
                Sign out
              </button>
            </span>
          ) : (
            <button type="button" className="btn btn-outline" onClick={auth.login}>
              Sign in<span className="signin-long"> to sync</span>
            </button>
          ))}
      </div>
    </header>
  )
}
