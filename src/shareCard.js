// Renders a shareable progress card onto a canvas (1200×630, good for social
// embeds). Pure canvas — no external images, so it never taints and always
// exports cleanly. Colours come from the page's CSS tokens (index.css :root)
// so the card always matches the site.

const W = 1200
const H = 630
const PAD = 72
const SITE = 'lolazchallenge.xyz'

const FALLBACK = {
  'hex-black': '#010a13',
  'hex-navy': '#0a1428',
  'hex-track': '#1a2a3c',
  gold: '#c8aa6e',
  'gold-bright': '#f0e6d2',
  'gold-line': '#463714',
  'blue-bright': '#0ac8e6',
  win: '#2ee08a',
  text: '#e6e0d0',
  'text-dim': '#a8a293',
}

function readTokens() {
  const css = getComputedStyle(document.documentElement)
  const t = {}
  for (const [name, fallback] of Object.entries(FALLBACK)) {
    t[name] = css.getPropertyValue(`--${name}`).trim() || fallback
  }
  return t
}

const DISPLAY = "'Cinzel', Georgia, serif"
const ALT = "'Marcellus', Georgia, serif"
const BODY = "'Segoe UI', system-ui, sans-serif"

/**
 * @param canvas  a <canvas> element to draw into
 * @param data    { runName, stats: { total, completed, avgGamesToWin, avgFun, kda },
 *                  letters: [{ letter, total, done, current }], nextName }
 */
export async function renderShareCard(canvas, { runName, stats, letters = [], nextName }) {
  // Make sure the display fonts are ready before measuring/drawing text.
  try {
    await Promise.all([document.fonts.load(`700 40px ${DISPLAY}`), document.fonts.load(`24px ${ALT}`)])
    await document.fonts.ready
  } catch {
    // fonts API unavailable — fall back to serif below
  }

  const c = readTokens()
  const ctx = canvas.getContext('2d')
  canvas.width = W
  canvas.height = H

  // Ground: a tonal step from navy to black, like the page.
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, c['hex-navy'])
  bg.addColorStop(1, c['hex-black'])
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Hairline frame with engraved gold corners. Square, like the site.
  ctx.strokeStyle = c['gold-line']
  ctx.lineWidth = 2
  ctx.strokeRect(28, 28, W - 56, H - 56)
  ctx.strokeStyle = c.gold
  for (const [x, y, dx, dy] of [
    [28, 28, 1, 1],
    [W - 28, 28, -1, 1],
    [28, H - 28, 1, -1],
    [W - 28, H - 28, -1, -1],
  ]) {
    ctx.beginPath()
    ctx.moveTo(x + dx * 28, y)
    ctx.lineTo(x, y)
    ctx.lineTo(x, y + dy * 28)
    ctx.stroke()
  }

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  // Run name, then what it is.
  ctx.fillStyle = c['gold-bright']
  ctx.font = `700 58px ${DISPLAY}`
  ctx.fillText(clip(ctx, runName || 'My A–Z run', W - PAD * 2 - 300), PAD, 140)
  ctx.fillStyle = c['text-dim']
  ctx.font = `26px ${ALT}`
  ctx.fillText('League of Legends A–Z Challenge', PAD, 182)

  // Champions done, set against the run's size (top right).
  ctx.textAlign = 'right'
  ctx.fillStyle = c.gold
  ctx.font = `700 72px ${DISPLAY}`
  const doneText = String(stats.completed)
  ctx.fillText(doneText, W - PAD - measure(ctx, `${BODY}`, ` / ${stats.total}`, '600 30px'), 140)
  ctx.fillStyle = c['text-dim']
  ctx.font = `600 30px ${BODY}`
  ctx.fillText(` / ${stats.total}`, W - PAD, 140)
  ctx.font = `24px ${ALT}`
  ctx.fillText('champions done', W - PAD, 182)

  // The A→Z track: 26 letters, each filled by how much of it is done.
  const trackTop = 262
  const gap = 6
  const segW = (W - PAD * 2 - gap * 25) / 26
  letters.forEach((l, i) => {
    const x = PAD + i * (segW + gap)
    const state = l.total === 0 ? 'none' : l.done === l.total ? 'done' : l.current ? 'current' : 'todo'
    ctx.textAlign = 'center'
    ctx.font = `600 22px ${DISPLAY}`
    ctx.fillStyle = state === 'done' ? c.gold : state === 'current' ? c['blue-bright'] : c['text-dim']
    ctx.globalAlpha = state === 'none' ? 0.35 : 1
    ctx.fillText(l.letter, x + segW / 2, trackTop)
    const barY = trackTop + 16
    const barH = state === 'current' ? 10 : 6
    ctx.fillStyle = c['hex-track']
    ctx.fillRect(x, barY, segW, barH)
    if (l.total > 0 && l.done > 0) {
      ctx.fillStyle = state === 'current' ? c['blue-bright'] : c.gold
      ctx.fillRect(x, barY, (segW * l.done) / l.total, barH)
    }
    ctx.globalAlpha = 1
  })

  // Stats, separated by hairlines rather than boxed.
  const stats4 = [
    { label: 'Avg games per win', value: stats.avgGamesToWin != null ? stats.avgGamesToWin.toFixed(1) : '—', color: c['gold-bright'] },
    { label: 'Avg fun', value: stats.avgFun != null ? `${stats.avgFun.toFixed(1)} / 5` : '—', color: c.gold },
    { label: 'Avg KDA', value: stats.kda != null ? stats.kda.toFixed(2) : '—', color: c['blue-bright'] },
    { label: 'Up next', value: nextName ?? 'Run complete', color: nextName ? c.text : c.win },
  ]
  const statTop = 380
  const colW = (W - PAD * 2) / stats4.length
  ctx.strokeStyle = c['gold-line']
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PAD, statTop)
  ctx.lineTo(W - PAD, statTop)
  ctx.stroke()
  stats4.forEach((s, i) => {
    const x = PAD + i * colW
    if (i > 0) {
      ctx.beginPath()
      ctx.moveTo(x, statTop + 24)
      ctx.lineTo(x, statTop + 130)
      ctx.stroke()
    }
    const tx = i > 0 ? x + 28 : x
    ctx.textAlign = 'left'
    ctx.fillStyle = s.color
    ctx.font = i === 3 ? `400 40px ${ALT}` : `700 46px ${BODY}`
    ctx.fillText(clip(ctx, s.value, colW - 40), tx, statTop + 82)
    ctx.fillStyle = c['text-dim']
    ctx.font = `600 22px ${BODY}`
    ctx.fillText(s.label, tx, statTop + 120)
  })

  // Footer URL.
  ctx.textAlign = 'right'
  ctx.fillStyle = c.gold
  ctx.font = `600 22px ${BODY}`
  ctx.fillText(SITE, W - PAD, H - 60)
}

function measure(ctx, family, text, weightSize) {
  const prev = ctx.font
  ctx.font = `${weightSize} ${family}`
  const w = ctx.measureText(text).width
  ctx.font = prev
  return w
}

// Trim text to fit a max width, adding an ellipsis.
function clip(ctx, text, maxW) {
  if (ctx.measureText(text).width <= maxW) return text
  let t = text
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxW) t = t.slice(0, -1)
  return `${t}…`
}

// Export the current canvas as a PNG blob.
export function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}
