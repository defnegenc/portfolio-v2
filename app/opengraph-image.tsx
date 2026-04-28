import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'
export const alt = 'Defne Genç — Portfolio'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// 12×8 pixel eye grid (matches inline logo)
// 0=bg, 1=frame, 2=inner frame, 3=sclera, 4=iris, 5=pupil
const GRID = [
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,1,2,2,2,2,2,2,2,2,1,0],
  [1,2,2,3,3,3,3,3,3,2,2,1],
  [1,2,3,3,4,4,4,4,3,3,2,1],
  [1,2,3,4,4,5,5,4,4,3,2,1],
  [1,2,3,3,4,4,4,4,3,3,2,1],
  [0,1,2,2,2,2,2,2,2,2,1,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
]

const PALETTE: Record<number, string> = {
  0: '#0A0A0A',
  1: '#2E2E2C',
  2: '#1E1E1C',
  3: '#DEDAD2',
  4: '#4A4846',
  5: '#0A0A08',
}

const CELL = 44  // px per cell — large enough for clear cross-stitch gap
const GAP  = 6   // gap between cells

export default function OGImage() {
  const gridW = GRID[0].length * (CELL + GAP) - GAP  // 12*(44+6)-6 = 594px
  const gridH = GRID.length    * (CELL + GAP) - GAP  //  8*(44+6)-6 = 394px

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0A0A0A',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 52,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* pixel eye grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: GAP, width: gridW, height: gridH }}>
          {GRID.map((row, y) => (
            <div key={y} style={{ display: 'flex', gap: GAP }}>
              {row.map((v, x) => (
                <div
                  key={x}
                  style={{
                    width: CELL,
                    height: CELL,
                    background: PALETTE[v],
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* name + sub */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ color: '#E8E6E0', fontSize: 88, fontWeight: 400, letterSpacing: '-4px', lineHeight: 1 }}>
            DEFNE GENÇ
          </div>
          <div style={{ color: '#AEADA6', fontSize: 28, letterSpacing: '2px', textTransform: 'uppercase' }}>
            Stanford CS HCI · APM @ Coinbase
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
