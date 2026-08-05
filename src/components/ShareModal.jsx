import { useEffect, useRef, useState } from 'react'
import { renderShareCard, canvasToBlob } from '../shareCard.js'

// Renders the progress share card and offers download / copy.
export default function ShareModal({ runName, stats, ratingLabel, onClose }) {
  const canvasRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)

  useEffect(() => {
    if (canvasRef.current) {
      renderShareCard(canvasRef.current, { runName, stats, ratingLabel }).catch(() => {})
    }
  }, [runName, stats, ratingLabel])

  async function handleDownload() {
    const blob = await canvasToBlob(canvasRef.current)
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'az-challenge.png'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleCopy() {
    setCopyError(false)
    try {
      const blob = await canvasToBlob(canvasRef.current)
      await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopyError(true) // some browsers block image clipboard — fall back to download
    }
  }

  return (
    <div className="share-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Share your progress">
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-preview">
          <canvas ref={canvasRef} className="share-canvas" />
        </div>
        <div className="share-actions">
          <button type="button" className="share-btn primary" onClick={handleDownload}>
            Download image
          </button>
          <button type="button" className="share-btn" onClick={handleCopy}>
            {copied ? 'Copied ✓' : 'Copy image'}
          </button>
          <button type="button" className="share-btn ghost" onClick={onClose}>
            Close
          </button>
        </div>
        {copyError && (
          <p className="share-hint">Your browser blocked copying images — use “Download image” instead.</p>
        )}
      </div>
    </div>
  )
}
