// Renders a shareable progress card onto a canvas (1200×630, good for social
// embeds). Pure canvas — no external images, so it never taints and always
// exports cleanly.

const W = 1200
const H = 630
const GOLD = '#c8aa6e'
const GOLD_BRIGHT = '#f0e6d2'
const GOLD_DIM = '#785a28'
const BLUE = '#0ac8e6'
const WIN = '#2ee07a'
const TEXT_DIM = '#a09b8c'
const SITE = 'lolazchallenge.xyz'

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function corner(ctx, x, y, dx, dy) {
  ctx.beginPath()
  ctx.moveTo(x + dx * 22, y)
  ctx.lineTo(x, y)
  ctx.lineTo(x, y + dy * 22)
  ctx.stroke()
}

/**
 * @param canvas  a <canvas> element to draw into
 * @param data    { runName, stats: { total, completed, won, avgGamesToWin, avgFun, kda } }
 */
export async function renderShareCard(canvas, { runName, stats }) {
  // Make sure the display font is ready before measuring/drawing text.
  try {
    await document.fonts.load("700 40px 'Cinzel'")
    await document.fonts.ready
  } catch {
    // fonts API unavailable — fall back to serif below
  }

  const ctx = canvas.getContext('2d')
  canvas.width = W
  canvas.height = H

  // Background + top glow.
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#0a1428')
  bg.addColorStop(1, '#010a13')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  const glow = ctx.createRadialGradient(W / 2, -120, 60, W / 2, -120, 760)
  glow.addColorStop(0, 'rgba(20,41,74,0.85)')
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // Frame + corner accents.
  ctx.strokeStyle = GOLD_DIM
  ctx.lineWidth = 2
  ctx.strokeRect(26, 26, W - 52, H - 52)
  ctx.strokeStyle = GOLD
  ctx.lineWidth = 2
  corner(ctx, 26, 26, 1, 1)
  corner(ctx, W - 26, 26, -1, 1)
  corner(ctx, 26, H - 26, 1, -1)
  corner(ctx, W - 26, H - 26, -1, -1)

  const cx = W / 2
  ctx.textAlign = 'center'

  // Kicker.
  ctx.fillStyle = TEXT_DIM
  ctx.font = "600 20px 'Segoe UI', system-ui, sans-serif"
  ctx.fillText('L E A G U E   O F   L E G E N D S   ·   A – Z   C H A L L E N G E', cx, 92)

  // Run name.
  ctx.fillStyle = GOLD_BRIGHT
  ctx.font = "700 50px 'Cinzel', Georgia, serif"
  ctx.fillText(clip(ctx, runName || 'My A–Z run', W - 200), cx, 158)

  // Hero: big percentage.
  const pct = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0
  ctx.fillStyle = GOLD
  ctx.font = "700 108px 'Cinzel', Georgia, serif"
  ctx.fillText(`${pct}%`, cx, 268)
  ctx.fillStyle = TEXT_DIM
  ctx.font = "600 26px 'Segoe UI', system-ui, sans-serif"
  ctx.fillText(`${stats.completed} / ${stats.total} champions complete`, cx, 306)

  // Progress bar.
  const barX = 110
  const barW = W - 220
  const barY = 338
  const barH = 26
  ctx.fillStyle = '#0a1420'
  roundRect(ctx, barX, barY, barW, barH, barH / 2)
  ctx.fill()
  ctx.strokeStyle = GOLD_DIM
  ctx.lineWidth = 1
  roundRect(ctx, barX, barY, barW, barH, barH / 2)
  ctx.stroke()
  if (pct > 0) {
    const fillW = Math.max(barH, (barW * pct) / 100)
    const g = ctx.createLinearGradient(barX, 0, barX + fillW, 0)
    g.addColorStop(0, BLUE)
    g.addColorStop(1, GOLD)
    ctx.fillStyle = g
    roundRect(ctx, barX, barY, fillW, barH, barH / 2)
    ctx.fill()
  }

  // Stat tiles.
  const tiles = [
    { label: 'WON', value: String(stats.won), color: WIN },
    { label: 'AVG GAMES / WIN', value: stats.avgGamesToWin != null ? stats.avgGamesToWin.toFixed(1) : '—', color: GOLD_BRIGHT },
    { label: 'AVG RATING', value: stats.avgFun != null ? `${stats.avgFun.toFixed(1)}★` : '—', color: GOLD },
    { label: 'AVG KDA', value: stats.kda != null ? stats.kda.toFixed(2) : '—', color: BLUE },
  ]
  const tileGap = 18
  const tileTop = 410
  const tileH = 132
  const usable = W - 220
  const tileW = (usable - tileGap * (tiles.length - 1)) / tiles.length
  tiles.forEach((t, i) => {
    const x = 110 + i * (tileW + tileGap)
    ctx.fillStyle = 'rgba(10,20,35,0.7)'
    roundRect(ctx, x, tileTop, tileW, tileH, 10)
    ctx.fill()
    ctx.strokeStyle = 'rgba(120,90,40,0.5)'
    ctx.lineWidth = 1
    roundRect(ctx, x, tileTop, tileW, tileH, 10)
    ctx.stroke()

    ctx.textAlign = 'center'
    ctx.fillStyle = TEXT_DIM
    ctx.font = "600 17px 'Segoe UI', system-ui, sans-serif"
    ctx.fillText(t.label, x + tileW / 2, tileTop + 42)
    ctx.fillStyle = t.color
    ctx.font = "700 48px 'Segoe UI', system-ui, sans-serif"
    ctx.fillText(t.value, x + tileW / 2, tileTop + 96)
  })

  // Footer URL.
  ctx.textAlign = 'center'
  ctx.fillStyle = GOLD
  ctx.font = "600 22px 'Segoe UI', system-ui, sans-serif"
  ctx.fillText(SITE, cx, H - 46)
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
