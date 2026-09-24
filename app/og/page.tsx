'use client'

/* Prototypes for the link preview card.

   This is the image iMessage, Slack and Twitter unfurl. It is 1200x630 and it
   is usually seen about 200px wide in a chat bubble, so anything under ~48px
   of type is a grey smudge. Each option below is shown at real aspect and at
   the size a message bubble actually gives it, because that second view is the
   only one that decides whether it works.

   Temporary. Once one wins it replaces app/opengraph-image.tsx. */

import { useState } from 'react'
import Link from 'next/link'

const BAYER = [
  [0,32,8,40,2,34,10,42], [48,16,56,24,50,18,58,26],
  [12,44,4,36,14,46,6,38], [60,28,52,20,62,30,54,22],
  [3,35,11,43,1,33,9,41], [51,19,59,27,49,17,57,25],
  [15,47,7,39,13,45,5,37], [63,31,55,23,61,29,53,21],
].map(r => r.map(v => (v + 0.5) / 64))

const hash = (x: number, y: number) => {
  const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return h - Math.floor(h)
}

// the dithered D, as a list of filled cells on a grid
function ditherD(grid: number) {
  const cx = grid * 0.32, cy = grid * 0.5
  const rOuter = grid * 0.55, rInner = rOuter * 0.45
  const out: [number, number][] = []
  for (let y = 0; y < grid; y++) for (let x = 0; x < grid; x++) {
    const d = Math.hypot(x - cx, y - cy)
    let v = d < rInner ? 1 : d > rOuter ? 0 : 1 - (d - rInner) / (rOuter - rInner)
    if (x < grid * 0.18 && y > grid * 0.08 && y < grid * 0.92) v = 1
    if (v > BAYER[y % 8][x % 8]) out.push([x, y])
  }
  return out
}

// the tile field, as it renders at rest
function field(cols: number, rows: number, seedBias = 0) {
  const out: { x: number; y: number; a: number }[] = []
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const nx = x / cols, ny = y / rows
    const spatial = Math.sin(nx * 7) * Math.cos(ny * 5) + Math.sin(nx * 13 + ny * 9) * 0.5
    const v = (spatial + 2) / 4 + (hash(x, y) - 0.5) * 0.22 + seedBias
    out.push({ x, y, a: Math.max(0, Math.min(1, v)) })
  }
  return out
}

type Card = { id: string; name: string; note: string; render: (accent: string) => React.ReactNode }

const W = 1200, H = 630

const CARDS: Card[] = [
  {
    id: 'current', name: 'Current', note: 'What ships today: the dithered D centred on black with the name beneath.',
    render: () => (
      <div style={{ position: 'absolute', inset: 0, background: '#0A0A0A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
        <svg width={260} height={260} viewBox="0 0 56 56" shapeRendering="crispEdges">
          {ditherD(56).map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#E8E6E0" />)}
        </svg>
        <div style={{ color: '#E8E6E0', fontSize: 52, fontWeight: 600, letterSpacing: '-0.02em' }}>Defne Genç</div>
      </div>
    ),
  },
  {
    id: 'field', name: 'Field', note: 'The canvas itself, at rest, with the name sitting on it. What the site actually looks like.',
    render: accent => (
      <div style={{ position: 'absolute', inset: 0, background: '#0A0A0A', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 60 32" preserveAspectRatio="none">
          {field(60, 32).map(({ x, y, a }) => (
            <rect key={`${x}-${y}`} x={x + 0.12} y={y + 0.12} width={0.76} height={0.76} fill={accent} opacity={a * 0.9} />
          ))}
        </svg>
        <div style={{ position: 'absolute', left: 72, bottom: 64, color: '#0A0A0A', background: '#E8E6E0', padding: '10px 22px', borderRadius: 999, fontSize: 46, fontWeight: 600, letterSpacing: '-0.02em' }}>
          Defne Genç
        </div>
      </div>
    ),
  },
  {
    id: 'statement', name: 'Statement', note: 'The first line of the bio at size, with the key phrase blocked the way it is on the page. Says what you do before it says who you are.',
    render: accent => (
      <div style={{ position: 'absolute', inset: 0, background: '#0A0A0A', padding: 76, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ color: '#E8E6E0', fontSize: 62, lineHeight: 1.25, fontWeight: 500, letterSpacing: '-0.02em' }}>
          I think about how{' '}
          <span style={{ background: accent, color: '#0A0A0A', padding: '2px 12px', borderRadius: 8 }}>modern interfaces</span>{' '}
          should (and fail to) meet our needs.
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 22, color: '#8C8A85', fontSize: 34 }}>
          <span style={{ color: '#E8E6E0', fontWeight: 600 }}>Defne Genç</span>
          <span>defne.io</span>
        </div>
      </div>
    ),
  },
  {
    id: 'split', name: 'Split', note: 'Field on the left, type on the right. The mark and the words both get room, and it survives being cropped square.',
    render: accent => (
      <div style={{ position: 'absolute', inset: 0, background: '#0A0A0A', display: 'flex' }}>
        <div style={{ width: '42%', position: 'relative', overflow: 'hidden' }}>
          <svg width="100%" height="100%" viewBox="0 0 26 32" preserveAspectRatio="none">
            {field(26, 32, 0.06).map(({ x, y, a }) => (
              <rect key={`${x}-${y}`} x={x + 0.12} y={y + 0.12} width={0.76} height={0.76} fill={accent} opacity={a * 0.95} />
            ))}
          </svg>
        </div>
        <div style={{ flex: 1, padding: '76px 68px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
          <div style={{ color: '#E8E6E0', fontSize: 66, fontWeight: 600, letterSpacing: '-0.03em' }}>Defne Genç</div>
          <div style={{ color: '#B9B7B1', fontSize: 33, lineHeight: 1.4 }}>
            Interfaces for exponentially growing agentic capabilities.
          </div>
          <div style={{ color: accent, fontSize: 30, marginTop: 8 }}>defne.io</div>
        </div>
      </div>
    ),
  },
  {
    id: 'weather', name: 'Weather', note: 'Leans on the thing that makes the site unusual: the card shows a condition, as though the preview itself were reading the sky.',
    render: accent => (
      <div style={{ position: 'absolute', inset: 0, background: '#0A0A0A', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 60 32" preserveAspectRatio="none" style={{ opacity: 0.85 }}>
          {field(60, 32).map(({ x, y, a }) => (
            <rect key={`${x}-${y}`} x={x + 0.12} y={y + 0.12} width={0.76} height={0.76} fill={accent} opacity={a} />
          ))}
        </svg>
        <div style={{ position: 'absolute', inset: 0, padding: 76, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ alignSelf: 'flex-start', background: '#0A0A0A', color: '#E8E6E0', fontSize: 30, padding: '10px 20px', borderRadius: 999 }}>
            Overcast, night
          </div>
          <div>
            <div style={{ color: '#0A0A0A', background: '#E8E6E0', display: 'inline-block', fontSize: 62, fontWeight: 600, letterSpacing: '-0.02em', padding: '8px 22px', borderRadius: 10 }}>
              Defne Genç
            </div>
            <div style={{ color: '#E8E6E0', fontSize: 30, marginTop: 18 }}>A portfolio that reads the weather where you are</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'mark', name: 'Mark', note: 'The D at full bleed, cropped. Confident and abstract, but it says nothing to anyone who does not already know the site.',
    render: accent => (
      <div style={{ position: 'absolute', inset: 0, background: '#0A0A0A', overflow: 'hidden' }}>
        <svg width={H * 1.5} height={H * 1.5} viewBox="0 0 56 56" shapeRendering="crispEdges"
          style={{ position: 'absolute', left: -120, top: -170 }}>
          {ditherD(56).map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={accent} />)}
        </svg>
        <div style={{ position: 'absolute', right: 76, bottom: 72, textAlign: 'right' }}>
          <div style={{ color: '#E8E6E0', fontSize: 64, fontWeight: 600, letterSpacing: '-0.03em' }}>Defne Genç</div>
          <div style={{ color: '#B9B7B1', fontSize: 30, marginTop: 10 }}>defne.io</div>
        </div>
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
        .og-note { font-size: 0.88rem; line-height: 1.5; color: #B9B7B1; max-width: 760px; margin-top: 0.3rem; }
        .og-chip { width: 22px; height: 22px; border-radius: 999px; border: 2px solid transparent; cursor: pointer; padding: 0; }
        .og-chip[data-on="1"] { border-color: #E8E6E0; }
        .og-bubble { background: #1C1C1E; border-radius: 18px; padding: 10px; width: 232px; }
        .og-row { display: flex; gap: 2rem; align-items: flex-start; flex-wrap: wrap; }
      `}</style>

      <div style={{ padding: 'clamp(1.25rem,3vw,2rem)', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 1180, margin: '0 auto' }}>
        <header>
          <Link href="/" style={{ fontSize: '0.9rem', color: '#B9B7B1', textDecoration: 'none' }}>← Work</Link>
          <h1 style={{ fontSize: 'clamp(1.5rem,2.6vw,2.1rem)', fontWeight: 600, letterSpacing: '-0.02em', marginTop: '0.5rem' }}>Link preview studies</h1>
          <p style={{ fontSize: '0.98rem', lineHeight: 1.6, marginTop: '0.7rem', maxWidth: 800 }}>
            Six cards at 1200×630. The small one beside each is the size iMessage actually renders it, which is
            the view that decides whether a card works. Change the accent to check it across the palette.
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
