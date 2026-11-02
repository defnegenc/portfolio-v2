'use client'

/* The weather button, in the bar over the field.

   A fine pixel icon of the sky the field is drawing right now.
   Open, it explains what the field is and hands over the matrix of every
   hour and sky, plus the light / dark switch. Picking a cell overrides the
   live reading; "Back to your weather" returns it. */

import { useEffect, useRef } from 'react'
import { type Period, type Sky } from '@/components/ambient'
import { PanelA, PanelTerm, Trigger, SHARED_CSS, TRIGGER_CSS, useIsLight } from '@/components/WeatherVariants'

export type Override = { p: Period; s: Sky } | null

export default function WeatherControl({
  override, setOverride, live, place, open, setOpen, theme, setTheme, term = false,
}: {
  override: Override
  setOverride: (v: Override) => void
  live: { p: Period; s: Sky } | null
  /** resolved from the visitor's IP, e.g. "Brooklyn, New York" */
  place?: string | null
  /** controlled, so clicking the canvas can open it too */
  open: boolean
  setOpen: (v: boolean) => void
  /** when given, the panel carries the light / dark switch */
  theme?: 'light' | 'dark'
  setTheme?: (t: 'light' | 'dark') => void
  /** the terminal dress: the panel opens as shell output */
  term?: boolean
}) {
  const box = useRef<HTMLDivElement>(null)
  const light = useIsLight(box)
  useEffect(() => {
    if (!open) return
    const away = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', away)
    window.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', away); window.removeEventListener('keydown', esc) }
  }, [open, setOpen])

  const curS: Sky = (override ?? live)?.s ?? 'clear'

  return (
    <div ref={box} className="no-open wx" data-open={open ? 1 : 0}
      style={{ position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
      <style>{`
        .wx-tip {
          position: absolute; top: calc(100% + 0.35rem); right: 0; z-index: 401;
          white-space: nowrap; background: var(--bg); color: var(--ink);
          border: 1px solid var(--hairline); border-radius: 0;
          padding: 0.3rem 0.55rem; font-size: 0.82rem; line-height: 1.3;
          opacity: 0; pointer-events: none; transition: opacity .16s ease;
        }
        .wx:hover .wx-tip, .wx-trig:focus-visible ~ .wx-tip { opacity: 1; }
        .wx[data-open="1"] .wx-tip { opacity: 0; }

        .wx-trig.wx-trig-term { width: auto; gap: 0.4rem; padding: 0 2px; }
        .wx-word { font-family: var(--font-mono); font-size: 0.97rem; line-height: 1; }
        .wx-intro { font-size: 0.92rem; line-height: 1.55; color: var(--ink); }
        /* the resolved place: underlines in the accent on hover so it reads as
           a real value rather than filler copy */
        .wx-place { color: var(--award); position: relative; display: inline-block; white-space: nowrap; }
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
      `}</style>
      <style>{SHARED_CSS + TRIGGER_CSS}</style>

      <button className={term ? 'wx-trig wx-trig-term' : 'wx-trig'} onClick={() => setOpen(!open)} aria-expanded={open} aria-label="About this canvas">
        <Trigger sky={curS} />
        {/* the terminal side names the control, so it reads as one */}
        {term && <span className="wx-word">weather</span>}
      </button>
      {!term && <span className="wx-tip" role="tooltip">What is this?</span>}

      {open && (term
        ? <PanelTerm override={override} setOverride={setOverride} live={live} place={place} light={light} theme={theme} setTheme={setTheme} onClose={() => setOpen(false)} />
        : <PanelA override={override} setOverride={setOverride} live={live} place={place} light={light} theme={theme} setTheme={setTheme} onClose={() => setOpen(false)} />)}
    </div>
  )
}
