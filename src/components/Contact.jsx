import { useState } from 'react'
import { FEEDBACK_KINDS, MESSAGE_MIN, MESSAGE_MAX, sendFeedback } from '../api/feedback.js'
import Icon from './Icon.jsx'

const COOLDOWN_KEY = 'az-tracker:feedback-sent-at'
const COOLDOWN_MS = 60 * 1000

function recentlySent() {
  try {
    return Date.now() - Number(localStorage.getItem(COOLDOWN_KEY) || 0) < COOLDOWN_MS
  } catch {
    return false
  }
}

// "Report a bug or send feedback": a short form that writes to Firestore.
// Signed-in players get their Google email prefilled, but it stays optional.
export default function Contact({ auth }) {
  const [kind, setKind] = useState('bug')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState(auth.user?.email ?? '')
  const [website, setWebsite] = useState('') // honeypot: real people never see or fill this
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'sent'
  const [error, setError] = useState(null)

  const trimmed = message.trim()

  async function submit(e) {
    e.preventDefault()
    if (trimmed.length < MESSAGE_MIN) {
      setError(`Tell us a bit more: at least ${MESSAGE_MIN} characters.`)
      return
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('That email doesn’t look right. Fix it, or leave it empty.')
      return
    }
    if (website) {
      setStatus('sent') // quietly drop bot submissions
      return
    }
    if (recentlySent()) {
      setError('You just sent one. Give it a minute before sending another.')
      return
    }
    setError(null)
    setStatus('sending')
    try {
      await sendFeedback({ kind, message: trimmed, email: email.trim(), signedIn: !!auth.user })
      try {
        localStorage.setItem(COOLDOWN_KEY, String(Date.now()))
      } catch {
        // ignore private-mode failures
      }
      setStatus('sent')
      setMessage('')
    } catch (err) {
      setStatus('idle')
      setError(
        err?.code === 'permission-denied'
          ? 'That message couldn’t be sent. Check it’s under 2,000 characters and the email looks right.'
          : 'Couldn’t send right now. Check your connection and try again; your message is still here.',
      )
    }
  }

  return (
    <section id="contact" className="contact" aria-labelledby="contact-heading">
      <h2 id="contact-heading">Report a bug or send feedback</h2>
      <p className="contact-lead">
        Found something broken, or have an idea for the tracker? It goes straight to the developer.
      </p>

      {status === 'sent' ? (
        <div className="contact-sent" role="status">
          <p>
            <Icon name="check" size={18} /> Thanks, it’s sent.
            {email.trim() ? ` If a reply helps, it’ll go to ${email.trim()}.` : ''}
          </p>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStatus('idle')}>
            Send another
          </button>
        </div>
      ) : (
        <form className="contact-form" onSubmit={submit} noValidate>
          <div className="field">
            <span className="field-label" id="contact-kind">
              What is it?
            </span>
            <div className="segmented" role="group" aria-labelledby="contact-kind">
              {FEEDBACK_KINDS.map((k) => (
                <button key={k.key} type="button" aria-pressed={kind === k.key} onClick={() => setKind(k.key)}>
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          <label className="field">
            <span className="field-label">
              {kind === 'bug' ? 'What happened, and what did you expect?' : 'Your message'}
            </span>
            <textarea
              className="input contact-message"
              rows={5}
              maxLength={MESSAGE_MAX}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                setError(null)
              }}
              placeholder={
                kind === 'bug'
                  ? 'e.g. Importing from EUW skipped my Arena games from last night.'
                  : 'What would make the tracker better for you?'
              }
              aria-invalid={error && trimmed.length < MESSAGE_MIN ? 'true' : undefined}
              aria-describedby="contact-count"
              required
            />
            <span id="contact-count" className="contact-count num">
              {message.length} / {MESSAGE_MAX}
            </span>
          </label>

          <label className="field">
            <span className="field-label">Email, if you’d like a reply (optional)</span>
            <input
              className="input"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={254}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError(null)
              }}
            />
          </label>

          <label className="contact-trap" aria-hidden="true">
            Website
            <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>

          <p className="contact-note">
            We’ll also include your browser and operating system, screen size, and whether you’re
            signed in, to help track down bugs. No run data or Riot ID is sent.{' '}
            <a href="/privacy.html#feedback">Privacy policy</a>
          </p>

          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send'}
          </button>
        </form>
      )}
    </section>
  )
}
