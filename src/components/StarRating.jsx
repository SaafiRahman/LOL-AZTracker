import { useState } from 'react'

// Half-star fun rating, 0.5–5. `value` is null (unrated) or a half-step number.
// Each star has two hit areas (left = x.5, right = x). Clicking the current
// value clears it; a ✕ also clears.
export default function StarRating({ value, onChange, label = 'Fun' }) {
  const [hover, setHover] = useState(null)
  const display = hover ?? value ?? 0

  const pick = (v) => onChange(value === v ? null : v)

  return (
    <div className="rating" onMouseLeave={() => setHover(null)}>
      <span className="rating-label">{label}</span>
      <div className="stars" role="group" aria-label={`${label} rating`}>
        {[1, 2, 3, 4, 5].map((star) => {
          const fill = Math.max(0, Math.min(1, display - (star - 1))) * 100
          return (
            <span className="star" key={star}>
              <span className="star-visual">
                ★<span className="star-fill" style={{ width: `${fill}%` }}>★</span>
              </span>
              <button
                type="button"
                className="star-hit left"
                aria-label={`${star - 0.5} stars`}
                onMouseEnter={() => setHover(star - 0.5)}
                onClick={() => pick(star - 0.5)}
              />
              <button
                type="button"
                className="star-hit right"
                aria-label={`${star} stars`}
                onMouseEnter={() => setHover(star)}
                onClick={() => pick(star)}
              />
            </span>
          )
        })}
      </div>
      {value != null && (
        <>
          <span className="rating-value">{value.toFixed(1)}</span>
          <button
            type="button"
            className="rating-clear"
            aria-label={`Clear ${label} rating`}
            onClick={() => onChange(null)}
          >
            ×
          </button>
        </>
      )}
    </div>
  )
}
