import { useState } from 'react'
import Icon from './Icon.jsx'

// Half-star fun rating, 0.5–5. `value` is null (unrated) or a half-step number.
// One focusable slider for keyboards (arrows step by half a star, Home/Delete
// clear); pointers get two hit areas per star (left = x.5, right = x).
// Clicking the current value clears it.
export default function StarRating({ value, onChange, label = 'Fun', championName }) {
  const [hover, setHover] = useState(null)
  const display = hover ?? value ?? 0
  const name = championName ? `${label} rating for ${championName}` : `${label} rating`

  const pick = (v) => onChange(value === v ? null : v)

  function onKeyDown(e) {
    const cur = value ?? 0
    let next
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(5, cur + 0.5)
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = cur - 0.5
    else if (e.key === 'End') next = 5
    else if (e.key === 'Home' || e.key === 'Delete' || e.key === 'Backspace') next = 0
    else return
    e.preventDefault()
    onChange(next <= 0 ? null : next)
  }

  return (
    <div className="rating" onPointerLeave={() => setHover(null)}>
      <span className="field-label" aria-hidden="true">
        {label}
      </span>
      <div
        className="stars"
        role="slider"
        tabIndex={0}
        aria-label={name}
        aria-valuemin={0}
        aria-valuemax={5}
        aria-valuenow={value ?? 0}
        aria-valuetext={value != null ? `${value} of 5 stars` : 'Not rated'}
        onKeyDown={onKeyDown}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const fill = Math.max(0, Math.min(1, display - (star - 1))) * 100
          return (
            <span className="star" key={star}>
              <span className="star-visual" aria-hidden="true">
                <Icon name="star" size={26} />
                <span className="star-fill" style={{ width: `${fill}%` }}>
                  <Icon name="star" size={26} filled />
                </span>
              </span>
              <span className="star-hit left" onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(star - 0.5)} onClick={() => pick(star - 0.5)} />
              <span className="star-hit right" onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(star)} onClick={() => pick(star)} />
            </span>
          )
        })}
      </div>
      <span className="rating-value num">{value != null ? value.toFixed(1) : 'Not rated'}</span>
    </div>
  )
}
