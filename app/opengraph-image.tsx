import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'
export const alt = 'Defne Genç — Portfolio'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Bayer 8×8 ordered dither — same algorithm as the inline DitherformLogo
const BAYER_8 = [
  [ 0,32, 8,40, 2,34,10,42],
  [48,16,56,24,50,18,58,26],
  [12,44, 4,36,14,46, 6,38],
  [60,28,52,20,62,30,54,22],
  [ 3,35,11,43, 1,33, 9,41],
  [51,19,59,27,49,17,57,25],
  [15,47, 7,39,13,45, 5,37],
  [63,31,55,23,61,29,53,21],
].map(r => r.map(v => (v + 0.5) / 64))

function computeDitherCells(grid: number): [number, number][] {
  const cx = grid * 0.32, cy = grid * 0.5
  const rOuter = grid * 0.55, rInner = rOuter * 0.45
  const cells: [number, number][] = []
  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < grid; x++) {
      const dx = x - cx, dy = y - cy
      const d = Math.sqrt(dx * dx + dy * dy)
      let v: number
      if (d < rInner) v = 1
      else if (d > rOuter) v = 0
      else v = 1 - (d - rInner) / (rOuter - rInner)
      if (x < grid * 0.18 && y > grid * 0.08 && y < grid * 0.92) v = Math.max(v, 1)
      if (v > BAYER_8[y % 8][x % 8]) cells.push([x, y])
    }
  }
  return cells
}

export default function OGImage() {
  const grid = 56
  const cell = 8   // px per cell at 56-grid — total logo ~448×448px
  const cells = computeDitherCells(grid)
  const logoSize = grid * cell

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          background: '#070707',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 48,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Ditherform mark */}
        <div style={{ position: 'relative', width: logoSize, height: logoSize, display: 'flex' }}>
          {cells.map(([x, y]) => (
            <div
              key={`${x}-${y}`}
              style={{
                position: 'absolute',
                left: x * cell,
                top: y * cell,
                width: cell,
                height: cell,
                background: '#e8e8e3',
              }}
            />
          ))}
        </div>

        {/* name + subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ color: '#e8e8e3', fontSize: 84, fontWeight: 400, letterSpacing: '-3px', lineHeight: 1 }}>
            DEFNE GENÇ
          </div>
          <div style={{ color: '#666662', fontSize: 26, letterSpacing: '3px' }}>
            STANFORD CS HCI · APM @ COINBASE
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
