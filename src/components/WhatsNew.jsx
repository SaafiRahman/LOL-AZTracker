import { useEffect } from 'react'
import Icon from './Icon.jsx'

// One-time "what's new" card for returning players after the October 2026
// redesign. Bump the key in App.jsx (WHATS_NEW_KEY) to announce a future change.
export default function WhatsNew({ onDismiss }) {
  // Escape closes it, like the other panels.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDismiss])

  return (
    <aside className="whats-new" aria-labelledby="whats-new-heading">
      <button type="button" className="whats-new-close" aria-label="Close" onClick={onDismiss}>
        <Icon name="close" size={18} />
      </button>
      <h2 id="whats-new-heading">The tracker has a new look</h2>
      <p>
        Your next champion is up front, and <strong>Import new games</strong> now repeats your last
        import settings in one click. Run settings moved behind the gear icon.
      </p>
      <p>
        Spotted something off? There’s now a way to tell the developer directly.
      </p>
      <div className="whats-new-actions">
        <a className="btn btn-outline btn-sm" href="#contact" onClick={onDismiss}>
          Report a bug or send feedback
        </a>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onDismiss}>
          Got it
        </button>
      </div>
    </aside>
  )
}
