'use client'

/* The live readout, top-right of the field.

   It states what the canvas is doing right now, then offers the question. The
   content is the invitation: you click because it told you something and you
   want the rest. Neutral plate so it never competes with the field, with the
   accent reserved for the half that is actually the link.

   Closed, it is a ringed circle like the light/dark switch. Open, it explains
   what the field is and hands over the two dials behind it: hour and sky, each
   picked from a row of labelled icons rather than a dropdown. Picking either
   overrides the live reading; Reset returns it. */

import { useEffect, useRef } from 'react'
import { PERIOD_LABEL, SKY_LABEL, type Period, type Sky } from '@/components/ambient'
import { HOUR_ICON, SKY_ICON } from '@/components/weatherIcons'

/* 'late' (midnight–5am) is deliberately absent: the label read as nonsense in a
   picker. The live field can still land there; the picker just shows night. */
const PERIODS: Period[] = ['dawn', 'day', 'dusk', 'night']
const SKIES: Sky[] = ['clear', 'cloud', 'rain', 'snow', 'fog', 'storm', 'wind']

export type Override = { p: Period; s: Sky } | null

export default function WeatherControl({
  override, setOverride, live, place, open, setOpen,
}: {
  override: Override
  setOverride: (v: Override) => void
  live: { p: Period; s: Sky } | null
  /** resolved from the visitor's IP, e.g. "Brooklyn, New York" */
  place?: string | null
  /** controlled, so clicking the canvas can open it too */
  open: boolean
  setOpen: (v: boolean) => void
}) {
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const away = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', away)
    window.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', away); window.removeEventListener('keydown', esc) }
  }, [open, setOpen])

  const cur = override ?? live
  // the picker has no 'late', so it shows as night
  const curP: Period = cur?.p === 'late' ? 'night' : (cur?.p ?? 'day')
  const curS: Sky = cur?.s ?? 'clear'

  return (
    <div ref={box} className="no-open wx" data-open={open ? 1 : 0}
      style={{ position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
      <style>{`
        /* Pure white in dark mode, pure black in light. No accent anywhere: it
           has to survive whatever colour the field happens to be. */
        .wx-btn {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 0.55rem 1rem; border-radius: 999px;
          background: #FFFFFF; color: #0A0A0A; border: none;
          font-family: var(--font-main); font-size: 0.9rem; font-weight: 600; line-height: 1.1;
          cursor: pointer; white-space: nowrap;
          box-shadow: 0 2px 14px rgba(0,0,0,0.3);
          transition: opacity .2s;
        }
        .wx-btn:hover, .wx[data-open="1"] .wx-btn { opacity: 0.85; }
        [data-theme="light"] .wx-btn { background: #0A0A0A; color: #FFFFFF; }


        .wx-pop {
          position: absolute; top: calc(100% + 0.5rem); right: 0; z-index: 400; width: 344px;
          background: var(--bg); border: 1px solid var(--hairline); border-radius: 12px;
          padding: 1.2rem; box-shadow: 0 10px 34px rgba(0,0,0,0.3);
          line-height: 1.5; text-align: left;
        }
        .wx-intro { font-size: 0.92rem; line-height: 1.55; color: var(--ink); }
        /* the resolved place: underlines in the accent on hover so it reads as
           a real value rather than filler copy */
        .wx-place { color: var(--award); position: relative; }
        .wx-place::after {
          content: ''; position: absolute; left: 0; bottom: -2px; width: 100%; height: 1px;
          background: var(--award); transform: scaleX(0); transform-origin: right;
          transition: transform .3s cubic-bezier(.19,1,.22,1);
        }
        .wx-place:hover::after { transform: scaleX(1); transform-origin: left; }
        /* hovering swaps the phrase for the place the IP actually resolved to */
        .wx-real { display: none; }
        .wx-place:hover .wx-generic { display: none; }
        .wx-place:hover .wx-real { display: inline; }
        .wx-label { font-size: 0.88rem; line-height: 1.4; color: var(--ink); }
        .wx-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.35rem; }
        .wx-opt {
          display: flex; flex-direction: column; align-items: center; gap: 0.35rem;
          padding: 0.55rem 0.2rem; border-radius: 8px;
          border: 1px solid transparent; background: none; cursor: pointer;
          font-family: inherit; font-size: 0.82rem; line-height: 1.3; color: var(--ink);
          transition: border-color .15s, color .15s;
        }
        .wx-opt:hover { border-color: var(--hairline); }
        .wx-opt[data-on="1"] { border-color: var(--award); color: var(--award); }
        .wx-foot {
          font-size: 0.9rem; line-height: 1.4; color: var(--ink);
          background: none; border: none; padding: 0; text-decoration: none; font-family: inherit;
        }
        .wx-foot:hover { color: var(--award); }
      `}</style>

      <button className="wx-btn" data-on={open ? 1 : 0} onClick={() => setOpen(!open)}
        aria-expanded={open} aria-label="About this canvas">
        What is this?
      </button>

      {open && (
        <div className="wx-pop">
          <p className="wx-intro">
            As a chronic weather checker and lover of ambient technology, I wanted this interactive canvas
            to{' '}
            <span style={{ color: 'var(--award)' }}>synchronize with the outside world</span>.
          </p>
          <p className="wx-intro" style={{ marginTop: '0.8rem' }}>
            This is my visual interpretation of the weather in{' '}
            <span className="wx-place">
              <span className="wx-generic">your area</span>
              <span className="wx-real">{place || 'your area'}</span>
            </span>.
            With that being said, you{'’'}re more than welcome to play with every configuration.
          </p>

          <div style={{ marginTop: '1.5rem' }}>
            <div className="wx-label">Hour</div>
            <div className="wx-grid" style={{ marginTop: '0.7rem' }}>
              {PERIODS.map(p => {
                const Icon = HOUR_ICON[p]
                return (
                  <button key={p} className="wx-opt" data-on={curP === p ? 1 : 0}
                    onClick={() => setOverride({ p, s: curS })}>
                    <Icon />{PERIOD_LABEL[p]}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <div className="wx-label">Sky</div>
            <div className="wx-grid" style={{ marginTop: '0.7rem' }}>
              {SKIES.map(s => {
                const Icon = SKY_ICON[s]
                return (
                  <button key={s} className="wx-opt" data-on={curS === s ? 1 : 0}
                    onClick={() => setOverride({ p: curP, s })}>
                    <Icon />{SKY_LABEL[s]}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '1.7rem' }}>
            <button className="wx-foot" onClick={() => setOverride(null)} disabled={!override}
              style={{ cursor: override ? 'pointer' : 'default', color: override ? 'var(--award)' : 'var(--ink)', opacity: override ? 1 : 0.45 }}>
              Reset
            </button>
          </div>

          <div style={{ marginTop: '1.4rem', paddingTop: '1.1rem', borderTop: '1px solid var(--hairline)', fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--ink)' }}>
            Scroll down to make the entire canvas yours.
          </div>
        </div>
      )}
    </div>
  )
}
