import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'
export const alt = "Defne's Portfolio"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/* The link preview: the tile field at rest with the name set plain and white
   over it, taking its contrast from the dark background showing through the
   gaps between tiles.

   Satori renders this, and it supports only a flexbox subset: no SVG grids, no
   CSS grid. The field is therefore emitted as absolutely positioned divs, one
   per visible tile, which is why the cell count is kept modest. */

const COLS = 60
const ROWS = 32
const ACCENT = '#F2B26B'
const BG = '#0A0A0A'

const hash = (x: number, y: number) => {
  const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return h - Math.floor(h)
}

export default function OGImage() {
  const cellW = size.width / COLS
  const cellH = size.height / ROWS
  const tiles: React.ReactElement[] = []

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const nx = x / COLS, ny = y / ROWS
      // the same standing field the canvas breathes, frozen at t = 0
      const spatial = Math.sin(nx * 7) * Math.cos(ny * 5) + Math.sin(nx * 13 + ny * 9) * 0.5
      const a = Math.max(0, Math.min(1, (spatial + 2) / 4 + (hash(x, y) - 0.5) * 0.22))
      if (a <= 0.04) continue
      tiles.push(
        <div
          key={`${x}-${y}`}
          style={{
            position: 'absolute',
            left: x * cellW + cellW * 0.12,
            top: y * cellH + cellH * 0.12,
            width: cellW * 0.76,
            height: cellH * 0.76,
            background: ACCENT,
            opacity: a,
          }}
        />
      )
    }
  }

  return new ImageResponse(
    (
      <div style={{ width: size.width, height: size.height, display: 'flex', position: 'relative', background: BG }}>
        {tiles}
        <div
          style={{
            position: 'absolute',
            left: 76,
            bottom: 64,
            display: 'flex',
            color: '#FFFFFF',
            fontSize: 78,
            fontWeight: 700,
            letterSpacing: '-0.03em',
          }}
        >
          Defne{'\u2019'}s Portfolio
        </div>
      </div>
    ),
    { ...size }
  )
}
