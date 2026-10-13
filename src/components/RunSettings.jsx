import { useState } from 'react'
import { COMPLETION_MODES } from '../run.js'
import { CLASSES } from '../constants.js'
import Icon from './Icon.jsx'

// What each destructive action asks before it runs.
const CONFIRMS = {
  reset: { label: 'Reset progress', danger: false, text: (run) => `Clear every game logged in “${run.name}”? Its settings stay.` },
  'delete-run': { label: 'Delete run', danger: true, text: (run) => `Delete “${run.name}” and all of its progress?` },
  'delete-data': {
    label: 'Delete everything',
    danger: true,
    text: () =>
      'Permanently delete ALL your data, every run, from the cloud and this device? This cannot be undone, and you will be signed out.',
  },
}

// Run settings panel. Completion mode and champion pool change what counts as
// done, so edits are staged here and previewed ("37 → 52 done") before Apply,
// instead of silently recounting the run on click. Run management happens in
// place: naming inline, and destructive actions confirm here rather than in a
// browser dialog.
export default function RunSettings({
  run,
  runCount,
  previewCounts,
  canDeleteRun,
  auth,
  onApply,
  onNewRun,
  onRenameRun,
  onDeleteRun,
  onResetRun,
  onDeleteData,
  onClose,
}) {
  const [mode, setMode] = useState(run.completionMode)
  const [pool, setPool] = useState(run.classFilter)
  const [naming, setNaming] = useState(null) // null | 'new' | 'rename'
  const [name, setName] = useState('')
  const [confirming, setConfirming] = useState(null) // null | key of CONFIRMS
  const [actionError, setActionError] = useState(null)

  function startNaming(kind) {
    setConfirming(null)
    setNaming(kind)
    setName(kind === 'rename' ? run.name : `Run ${runCount + 1}`)
  }

  function startConfirm(kind) {
    setNaming(null)
    setActionError(null)
    setConfirming(kind)
  }

  function submitName(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (naming === 'new') onNewRun(trimmed || `Run ${runCount + 1}`)
    else onRenameRun(trimmed || run.name)
    setNaming(null)
  }

  async function confirmAction() {
    setActionError(null)
    try {
      if (confirming === 'reset') onResetRun()
      else if (confirming === 'delete-run') onDeleteRun()
      else if (confirming === 'delete-data') await onDeleteData()
      setConfirming(null)
    } catch (e) {
      setActionError(`Could not delete your data: ${e.message}`)
    }
  }

  const dirty = mode !== run.completionMode || pool.join() !== run.classFilter.join()
  const before = previewCounts(run.completionMode, run.classFilter)
  const after = dirty ? previewCounts(mode, pool) : before

  const togglePool = (key) => setPool((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]))

  return (
    <section id="run-settings" className="run-settings" aria-label="Run settings">
      <div className="settings-grid">
        <fieldset className="settings-group">
          <legend>A champion is done after</legend>
          <div className="segmented">
            {COMPLETION_MODES.map((m) => (
              <button key={m.key} type="button" aria-pressed={mode === m.key} onClick={() => setMode(m.key)}>
                {m.key === 'win' ? 'A win' : 'Any game'}
              </button>
            ))}
          </div>
          <p className="settings-hint">
            {mode === 'win' ? 'Keep playing a champion until you win on them.' : 'One game on a champion counts, win or lose.'}
          </p>
        </fieldset>

        <fieldset className="settings-group">
          <legend>Champion pool</legend>
          <div className="chip-row">
            {CLASSES.map((c) => (
              <button key={c.key} type="button" className="chip" aria-pressed={pool.includes(c.key)} onClick={() => togglePool(c.key)}>
                {c.label}
              </button>
            ))}
          </div>
          <p className="settings-hint">
            {pool.length ? `${after.total} champions in these classes.` : 'All champions. Pick classes for a themed run, like Marksman only.'}
          </p>
        </fieldset>
      </div>

      {dirty && (
        <div className="settings-apply" role="status">
          <p>
            This recounts the whole run: <span className="num">{before.completed}</span> of{' '}
            <span className="num">{before.total}</span> done becomes <span className="num">{after.completed}</span> of{' '}
            <span className="num">{after.total}</span>. Your game logs are not changed.
          </p>
          <div className="settings-apply-actions">
            <button type="button" className="btn btn-ghost" onClick={() => { setMode(run.completionMode); setPool(run.classFilter) }}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={() => onApply({ completionMode: mode, classFilter: pool })}>
              Apply
            </button>
          </div>
        </div>
      )}

      {naming && (
        <form className="settings-inline" onSubmit={submitName}>
          <label className="field">
            <span className="field-label">{naming === 'new' ? 'Name the new run' : 'Rename this run'}</span>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
          </label>
          <button type="button" className="btn btn-ghost" onClick={() => setNaming(null)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {naming === 'new' ? 'Create run' : 'Save name'}
          </button>
        </form>
      )}

      {confirming && (
        <div className="settings-inline settings-confirm" role="alertdialog" aria-label={CONFIRMS[confirming].label}>
          <p>{CONFIRMS[confirming].text(run)}</p>
          <button type="button" className="btn btn-ghost" onClick={() => setConfirming(null)}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${CONFIRMS[confirming].danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={confirmAction}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          >
            {CONFIRMS[confirming].label}
          </button>
          {actionError && (
            <p className="field-error" role="alert">
              {actionError}
            </p>
          )}
        </div>
      )}

      <div className="settings-footer">
        <div className="settings-runs">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => startNaming('new')}>
            <Icon name="plus" size={16} /> New run
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => startNaming('rename')}>
            Rename run
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => startConfirm('reset')}>
            Reset progress
          </button>
          {canDeleteRun && (
            <button type="button" className="btn btn-ghost btn-sm danger" onClick={() => startConfirm('delete-run')}>
              Delete run
            </button>
          )}
        </div>
        <div className="settings-account">
          {auth.firebaseEnabled && auth.user ? (
            <button type="button" className="btn btn-ghost btn-sm danger" onClick={() => startConfirm('delete-data')}>
              Delete all my data
            </button>
          ) : (
            <span className="settings-hint">Saved in this browser. Sign in to sync across devices.</span>
          )}
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </section>
  )
}
