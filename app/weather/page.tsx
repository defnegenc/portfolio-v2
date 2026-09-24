'use client'

/* ── /weather: the ambient interactive canvas ────────────────────────────
   Every time of day × sky condition that the ambient field can land on, laid
   out as a grid so the whole palette can be judged at once. Rows are times of
   day, columns are conditions.

   The swatches are static so all 35 can be on screen without 35 animation
   loops. Pick one and it plays live underneath, in whichever theme is set. */

import { useState } from 'react'
import Link from 'next/link'
import AsciiCanvas from '@/components/AsciiCanvas'
import ThemeToggle from '@/components/ThemeToggle'
import { useTheme } from '@/components/useTheme'
import { LOOKS, PERIOD_LABEL, SKY_LABEL, type Period, type Sky } from '@/components/ambient'
import { HOUR_ICON, SKY_ICON } from '@/components/weatherIcons'

const PERIODS: Period[] = ['dawn', 'day', 'dusk', 'night', 'late']
const SKIES: Sky[] = ['clear', 'cloud', 'rain', 'snow', 'fog', 'storm', 'wind']

// the hours each period covers, straight from periodOf()
const HOURS: Record<Period, string> = {
  dawn: '5am – 9am', day: '9am – 5pm', dusk: '5pm – 8pm', night: '8pm – midnight', late: 'midnight – 5am',
}

const HourIcon = ({ p }: { p: Period }) => { const I = HOUR_ICON[p]; return <I /> }

export default function FieldMatrix() {
  const [theme, setTheme] = useTheme('dark')
  const isLight = theme === 'light'
  const [sel, setSel] = useState<{ p: Period; s: Sky }>({ p: 'day', s: 'clear' })

  const look = LOOKS[sel.p][sel.s]
  const inkFallback = isLight ? '#1A1918' : '#E8E6E0'
  // the canvas paints the swatch as-is in both themes, so the chip shows it raw
  const shown = (hex: string | null) => hex ?? inkFallback

  return (
    <div data-theme={theme} style={{ position: 'fixed', inset: 0, overflowY: 'auto', background: 'var(--bg)', color: 'var(--ink)' }}>
      <style>{`
        [data-theme="light"] { --bg: #F4F2EC; --ink: #1A1918; --ink-dim: #2E2D2A; --hairline: rgba(26,25,24,0.15); }
        [data-theme="dark"]  { --bg: #0A0A0A; --ink: #E8E6E0; --ink-dim: #D2D0CA; --hairline: rgba(232,230,224,0.12); }
        .fm-back { display: inline-block; transition: color .2s; }
        .fm-back:hover { color: var(--award); }
        .fm-grid { display: grid; grid-template-columns: 10rem repeat(7, minmax(0, 1fr)); gap: 0.25rem; align-items: stretch; }
        .fm-cell { display: flex; flex-direction: column; gap: 0.25rem; padding: 0.35rem; border: 1px solid transparent; border-radius: 6px; background: none; cursor: pointer; text-align: left; font-family: inherit; color: inherit; transition: border-color .15s, background .15s; }
        .fm-cell:hover { border-color: var(--hairline); }
        .fm-cell[data-on="1"] { border-color: var(--ink); background: var(--hairline); }
        .fm-chip { height: 30px; border-radius: 4px; }
        .fm-meta { font-size: 0.85rem; line-height: 1.45; color: var(--ink-dim); }
        @media (max-width: 1100px) {
          .fm-grid { grid-template-columns: 8rem repeat(7, minmax(0, 1fr)); }
          .fm-meta { font-size: 0.85rem; }
        }
        @media (max-width: 760px) {
          .fm-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .fm-rowlabel { grid-column: 1 / -1; margin-top: 1rem; }
        }
      `}</style>

      <div style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

        <header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '2rem' }}>
            <div>
              {/* the back link sits above the title rather than beside it: on the
                  same baseline it read as part of the heading */}
              <Link href="/" className="fm-back" style={{ fontSize: '0.9rem', color: 'var(--ink-dim)', textDecoration: 'none' }}>
                ← Work
              </Link>
              <h1 style={{ fontSize: 'clamp(1.5rem, 2.6vw, 2.1rem)', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: '0.5rem' }}>
                An ambient interactive canvas
              </h1>
            </div>
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
          <p style={{ fontSize: '0.98rem', lineHeight: 1.6, color: 'var(--ink)', marginTop: '0.7rem' }}>
              I have an obsession with checking the weather, and as a chronic weather checker and lover of
              ambient technology, I wanted this interactive canvas to synchronize with the outside world.
            With that being said, you{'’'}re more than welcome to play with every configuration.
          </p>
        </header>

        {/* live preview of the selection */}
        <div>
          <div style={{ height: 'clamp(240px, 40vh, 420px)', position: 'relative', border: '1px solid var(--hairline)', borderRadius: 6, overflow: 'hidden' }}>
            <AsciiCanvas
              key={`${sel.p}-${sel.s}-${theme}`}
              render={look.render}
              motion={look.motion}
              hover={look.hover}
              breathe={look.motion === 'breathe'}
              lightMode={isLight}
              chars="▓▒░"
              color={look.color ?? undefined}
              rest={0.3}
            />
          </div>
          <div style={{ fontSize: '1rem', color: 'var(--ink)', marginTop: '0.6rem' }}>
            {SKY_LABEL[sel.s]}, {PERIOD_LABEL[sel.p].toLowerCase()}
          </div>
        </div>

        {/* the full matrix */}
        <div className="fm-grid">
          <div />
          {SKIES.map(s => {
            const Icon = SKY_ICON[s]
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', color: 'var(--ink)', paddingLeft: '0.4rem', paddingBottom: '0.3rem' }}>
                <Icon />{SKY_LABEL[s]}
              </div>
            )
          })}

          {PERIODS.map(p => (
            <FieldRow key={p} p={p} sel={sel} setSel={setSel} shown={shown} />
          ))}
        </div>

      </div>
    </div>
  )
}

function FieldRow({
  p, sel, setSel, shown,
}: {
  p: Period
  sel: { p: Period; s: Sky }
  setSel: (v: { p: Period; s: Sky }) => void
  shown: (hex: string | null) => string
}) {
  return (
    <>
      <div className="fm-rowlabel" style={{ paddingTop: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink)' }}>
          <HourIcon p={p} />{PERIOD_LABEL[p]}
        </div>
        <div style={{ fontSize: '0.88rem', color: 'var(--ink-dim)', marginTop: '0.2rem' }}>{HOURS[p]}</div>
      </div>
      {SKIES.map(s => {
        const look = LOOKS[p][s]
        const on = sel.p === p && sel.s === s
        return (
          <button key={s} className="fm-cell" data-on={on ? 1 : 0} onClick={() => setSel({ p, s })}
            title={`${PERIOD_LABEL[p]} · ${SKY_LABEL[s]}`}>
            <div className="fm-chip" style={{ background: shown(look.color) }} />
            <div className="fm-meta">{look.render}<br />{look.motion}<br />{look.hover}</div>
          </button>
        )
      })}
    </>
  )
}
