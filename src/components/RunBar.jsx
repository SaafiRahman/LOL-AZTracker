// Run switcher + management: pick the active run, or create / rename / delete.
export default function RunBar({ runs, activeRunId, onSelect, onNew, onRename, onDelete }) {
  return (
    <div className="run-bar">
      <label className="run-select-label" htmlFor="run-select">
        Run
      </label>
      <select
        id="run-select"
        className="run-select"
        value={activeRunId}
        onChange={(e) => onSelect(e.target.value)}
      >
        {runs.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
      <button type="button" className="run-btn" onClick={onNew}>
        + New run
      </button>
      <button type="button" className="run-btn" onClick={onRename}>
        Rename
      </button>
      {runs.length > 1 && (
        <button type="button" className="run-btn danger" onClick={onDelete}>
          Delete
        </button>
      )}
    </div>
  )
}
