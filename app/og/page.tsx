'use client'

/* Link-preview studies, all built on the field.

   Fourteen ways to set the name over the tile canvas. The question each one answers
   is where the type gets its contrast from: a plate behind it, a hole punched
   in the field, a solid strip, or nothing at all.

   Every card is shown twice, at 1200x630 and at the ~212px an iMessage bubble
   actually gives it. The second view decides it. Temporary: once one wins it
   replaces app/opengraph-image.tsx. */

import { useState } from 'react'
import Link from 'next/link'

const W = 1200, H = 630
const COLS = 60, ROWS = 32

const hash = (x: number, y: number) => {
  const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return h - Math.floor(h)
}

type Hole = { x0: number; y0: number; x1: number; y1: number; fade?: boolean }
/* The hover bloom, frozen. In the live canvas the pool brightens the tiles and
   pulls them toward the highlight tone; here it is a fixed spot behind the
   name, with the same wobbling edge so it does not read as a plain circle. */
type Bloom = { cx: number; cy: number; r: number }

/* Rainbow hover: the pool does not wash toward white, it rotates hue around
   the swatch and lifts lightness, the same narrow arc the canvas uses. */
function rotate(hex: string, dh: number, dl: number) {
  const n = parseInt(hex.slice(1), 16)
  let r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b)
  let l = (mx + mn) / 2, h = 0, sat = 0
  if (mx !== mn) {
    const d = mx - mn
    sat = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn)
    h = (mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4) / 6
  }
  h = ((h + dh) % 1 + 1) % 1
  l = Math.max(0, Math.min(1, l + dl))
  const S = Math.max(sat, 0.6)
  const q = l < 0.5 ? l * (1 + S) : l + S - l * S, p2 = 2 * l - q
  const f = (t: number) => { t = ((t % 1) + 1) % 1; return t < 1/6 ? p2 + (q - p2) * 6 * t : t < 1/2 ? q : t < 2/3 ? p2 + (q - p2) * (2/3 - t) * 6 : p2 }
  r = f(h + 1/3); g = f(h); b = f(h - 1/3)
  return '#' + [r, g, b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('')
}

/* The resting field, in grid units. `holes` are regions where the tiles drop
   away so type can sit on the background instead of on the pattern. */
function Field({ accent, holes = [], dim = 1, bloom }: { accent: string; holes?: Hole[]; dim?: number; bloom?: Bloom }) {
  const cells = []
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const nx = x / COLS, ny = y / ROWS
      const spatial = Math.sin(nx * 7) * Math.cos(ny * 5) + Math.sin(nx * 13 + ny * 9) * 0.5
      let a = (spatial + 2) / 4 + (hash(x, y) - 0.5) * 0.22
      for (const h of holes) {
        if (x >= h.x0 && x <= h.x1 && y >= h.y0 && y <= h.y1) {
          if (!h.fade) { a = 0; break }
          const edge = Math.min(x - h.x0, h.x1 - x, y - h.y0, h.y1 - y)
          a *= Math.min(1, edge / 3) > 0.9 ? 0 : 1 - Math.min(1, edge / 3)
        }
      }
      a = Math.max(0, Math.min(1, a)) * dim
      let fill = accent, size = 0.76, off = 0.12
      if (bloom) {
        /* Cells are square here, as they are in the canvas, so the distance is
           taken in plain grid units: scaling one axis was what bent the pool
           into an oval. */
        const dx = x - bloom.cx, dy = y - bloom.cy
        const ang = Math.atan2(dy, dx)
        const wob = 1 + 0.35 * Math.sin(ang * 3) + 0.2 * Math.sin(ang * 5)
        const inf = Math.max(0, 1 - Math.hypot(dx, dy) / (bloom.r * wob))
        if (inf > 0) {
          a = Math.min(1, a + inf * 0.85)
          const phase = ang / (Math.PI * 2) * 0.45 + inf * 0.25 + hash(x, y) * 0.06
          fill = rotate(accent, Math.sin(phase * Math.PI * 2) * 0.17, 0.1 + Math.cos(phase * Math.PI * 2) * 0.05)
          size = 0.76 + inf * 0.2
          off = (1 - size) / 2
        }
      }
      if (a > 0.02) cells.push(<rect key={`${x}-${y}`} x={x + off} y={y + off} width={size} height={size} fill={fill} opacity={a} />)
    }
  }
  return <svg width="100%" height="100%" viewBox={`0 0 ${COLS} ${ROWS}`} preserveAspectRatio="none">{cells}</svg>
}

const shell: React.CSSProperties = { position: 'absolute', inset: 0, background: '#0A0A0A', overflow: 'hidden' }
const NAME: React.CSSProperties = { fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }

type Card = { id: string; name: string; note: string; render: (a: string) => React.ReactNode }

const CARDS: Card[] = [
  {
    id: 'bloom-white', name: 'Bloom, white name', note: 'The hover pool frozen behind the name: tiles brighten, grow and pull toward white, exactly as they do under the cursor. The name sits on the hot spot in white.',
    render: a => (
      <div style={shell}>
        <Field accent={a} bloom={{ cx: 17, cy: 25, r: 15 }} />
        <div style={{ position: 'absolute', left: 76, bottom: 72, color: '#FFFFFF', fontSize: 82, textShadow: '0 0 34px rgba(10,10,10,.85)', ...NAME }}>Defne Genç</div>
      </div>
    ),
  },
  {
    id: 'bloom-knock', name: 'Bloom, knocked out', note: 'The same pool, but the letters are cut to the page background so the bloom reads as the thing behind the name rather than around it.',
    render: a => (
      <div style={shell}>
        <Field accent={a} bloom={{ cx: 17, cy: 25, r: 16 }} />
        <div style={{ position: 'absolute', left: 76, bottom: 72, color: '#0A0A0A', fontSize: 82, ...NAME }}>Defne Genç</div>
      </div>
    ),
  },
  {
    id: 'bloom-centre', name: 'Bloom, centred', note: 'Pool in the middle of the card with the name across it. The field is darkest at the corners, which frames the type without a plate.',
    render: a => (
      <div style={shell}>
        <Field accent={a} dim={0.75} bloom={{ cx: 30, cy: 16, r: 19 }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <div style={{ color: '#0A0A0A', fontSize: 92, ...NAME }}>Defne Genç</div>
          <div style={{ color: '#0A0A0A', fontSize: 32, opacity: 0.75 }}>defne.io</div>
        </div>
      </div>
    ),
  },
  {
    id: 'block-both', name: 'Blocked, both words', note: 'The whole name in one accent block, letters knocked out to the page background. No hole in the field: the block supplies its own contrast.',
    render: a => (
      <div style={shell}>
        <Field accent={a} />
        <div style={{ position: 'absolute', left: 76, bottom: 72 }}>
          <span style={{ background: a, color: '#0A0A0A', fontSize: 82, padding: '10px 22px', borderRadius: 10, ...NAME }}>Defne Genç</span>
        </div>
      </div>
    ),
  },
  {
    id: 'block-surname', name: 'Blocked surname', note: 'Only the surname takes the block; the first name sits plain and white on the field. Closest to how the bio highlights one phrase at a time.',
    render: a => (
      <div style={shell}>
        <Field accent={a} />
        <div style={{ position: 'absolute', left: 76, bottom: 72, display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <span style={{ color: '#FFFFFF', fontSize: 82, textShadow: '0 0 40px #0A0A0A', ...NAME }}>Defne</span>
          <span style={{ background: a, color: '#0A0A0A', fontSize: 82, padding: '10px 20px', borderRadius: 10, ...NAME }}>Genç</span>
        </div>
      </div>
    ),
  },
  {
    id: 'plain', name: 'Plain white', note: 'No plate at all. The name sits on the field in white and takes its contrast from the dark background showing through the gaps.',
    render: a => (
      <div style={shell}>
        <Field accent={a} />
        <div style={{ position: 'absolute', left: 76, bottom: 72, color: '#FFFFFF', fontSize: 82, ...NAME }}>Defne Genç</div>
      </div>
    ),
  },
  {
    id: 'shadow', name: 'White, shadowed', note: 'The same, with a dark glow under the letters. Reads at any size without adding a shape to the composition.',
    render: a => (
      <div style={shell}>
        <Field accent={a} />
        <div style={{ position: 'absolute', left: 76, bottom: 72, color: '#FFFFFF', fontSize: 82, textShadow: '0 0 40px #0A0A0A, 0 2px 12px #0A0A0A', ...NAME }}>Defne Genç</div>
      </div>
    ),
  },
]

export default function OgLab() {
  const [accent, setAccent] = useState('#F2B26B')
  const SWATCH = ['#F2B26B', '#7FA8F5', '#7EE38A', '#B9A6F5', '#F08AA8', '#F26A4B']

  return (
    <div style={{ position: 'fixed', inset: 0, overflowY: 'auto', background: '#0A0A0A', color: '#E8E6E0', fontFamily: 'var(--font-main)' }}>
      <style>{`
        .og-card { border: 1px solid rgba(232,230,224,.12); border-radius: 10px; overflow: hidden; position: relative; }
        .og-name { font-size: 1.05rem; font-weight: 600; }
        .og-note { font-size: 0.88rem; line-height: 1.5; color: #B9B7B1; max-width: 780px; margin-top: 0.3rem; }
        .og-chip { width: 22px; height: 22px; border-radius: 999px; border: 2px solid transparent; cursor: pointer; padding: 0; }
        .og-chip[data-on="1"] { border-color: #E8E6E0; }
        .og-bubble { background: #1C1C1E; border-radius: 18px; padding: 10px; width: 232px; }
        .og-row { display: flex; gap: 2rem; align-items: flex-start; flex-wrap: wrap; }
      `}</style>

      <div style={{ padding: 'clamp(1.25rem,3vw,2rem)', display: 'flex', flexDirection: 'column', gap: '2.2rem', maxWidth: 1180, margin: '0 auto' }}>
        <header>
          <Link href="/" style={{ fontSize: '0.9rem', color: '#B9B7B1', textDecoration: 'none' }}>← Work</Link>
          <h1 style={{ fontSize: 'clamp(1.5rem,2.6vw,2.1rem)', fontWeight: 600, letterSpacing: '-0.02em', marginTop: '0.5rem' }}>Link preview: the field</h1>
          <p style={{ fontSize: '0.98rem', lineHeight: 1.6, marginTop: '0.7rem', maxWidth: 820 }}>
            Ten ways to set the name over the field. Each one answers the same question differently: where does
            the type get its contrast from. The small card beside each is the size iMessage renders it.
          </p>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1rem' }}>
            {SWATCH.map(c => (
              <button key={c} className="og-chip" data-on={accent === c ? 1 : 0} style={{ background: c }} onClick={() => setAccent(c)} aria-label={c} />
            ))}
          </div>
        </header>

        {CARDS.map(c => (
          <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div>
              <div className="og-name">{c.name}</div>
              <div className="og-note">{c.note}</div>
            </div>
            <div className="og-row">
              <div className="og-card" style={{ width: 720, height: 720 * (H / W) }}>
                <div style={{ position: 'absolute', inset: 0, width: W, height: H, transform: `scale(${720 / W})`, transformOrigin: 'top left' }}>
                  {c.render(accent)}
                </div>
              </div>
              <div>
                <div className="og-bubble">
                  <div className="og-card" style={{ width: 212, height: 212 * (H / W), borderRadius: 12 }}>
                    <div style={{ position: 'absolute', inset: 0, width: W, height: H, transform: `scale(${212 / W})`, transformOrigin: 'top left' }}>
                      {c.render(accent)}
                    </div>
                  </div>
                  <div style={{ padding: '8px 4px 2px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Defne Genç</div>
                    <div style={{ fontSize: '0.75rem', color: '#8C8A85' }}>defne.io</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#8C8A85', marginTop: '0.5rem' }}>as iMessage shows it</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
