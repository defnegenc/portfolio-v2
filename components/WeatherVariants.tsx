'use client'

/* The weather picker (the matrix Defne chose) and its trigger.

   The swatch is the label: every cell of the LOOKS matrix is drawn as a tiny
   live field in its own colour, render and motion, so choosing a combination
   means choosing what you can already see. */

import { useContext, useEffect, useRef, useState, type CSSProperties } from 'react'
import { LOOKS, type Period, type Sky } from '@/components/ambient'
import { SKY_ICON, IconStyleCtx, CLASSIC_ICON } from '@/components/weatherIcons'
import type { Override } from '@/components/WeatherControl'

type Look = (typeof LOOKS)['day']['clear']
type Cell = { p: Period; s: Sky }

export const ALL_PERIODS: Period[] = ['dawn', 'day', 'dusk', 'night', 'late']
export const SKIES: Sky[] = ['clear', 'cloud', 'rain', 'snow', 'fog', 'storm', 'wind']

// ── words ──────────────────────────────────────────────────────────────────

export const ROW_LABEL: Record<Period, string> = {
  dawn: 'Early', day: 'Daytime', dusk: 'Evening', night: 'Night', late: 'Late night',
}
export const SKY_NAME: Record<Sky, string> = {
  clear: 'Clear', cloud: 'Overcast', rain: 'Rain', snow: 'Snow', fog: 'Fog', storm: 'Storms', wind: 'Wind',
}
const same = (a: Cell | null, b: Cell | null) => !!a && !!b && a.p === b.p && a.s === b.s

// ── colour: the same light-mode push the main canvas uses ──────────────────

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2
  if (mx === mn) return [0, 0, l]
  const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn)
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h / 6, s, l]
}
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 1) + 1) % 1
  const f = (n: number) => {
    const k = (n + h * 12) % 12, a = s * Math.min(l, 1 - l)
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))))
  }
  return [f(0), f(8), f(4)]
}
function tintOf(color: string | null, light: boolean): [number, number, number] {
  if (!color) return light ? [26, 25, 24] : [232, 230, 224]
  const raw = hexToRgb(color)
  if (!light) return raw
  const [h, s, l] = rgbToHsl(...raw)
  return hslToRgb(h, Math.min(1, s * 1.5), Math.max(0.42, Math.min(l, 0.56)))
}
/** a cell's colour as CSS, adjusted for the theme, for rings and fills */
export function cssColor(l: Look, light: boolean) {
  const [r, g, b] = tintOf(l.color ?? null, light)
  return `rgb(${r},${g},${b})`
}

// the page theme, watched so swatches repaint when it flips
export function useIsLight(ref: React.RefObject<HTMLElement | null>) {
  const [light, setLight] = useState(false)
  useEffect(() => {
    const host = ref.current?.closest('[data-theme]')
    if (!host) return
    const read = () => setLight(host.getAttribute('data-theme') === 'light')
    read()
    const mo = new MutationObserver(read)
    mo.observe(host, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
  }, [ref])
  return light
}

// ── MiniField: a tiny live rendering of one cell ──────────────────────────

const subs = new Set<(t: number) => void>()
let raf = 0
function loop(now: number) {
  subs.forEach(f => f(now / 1000))
  raf = subs.size ? requestAnimationFrame(loop) : 0
}
function subscribe(f: (t: number) => void) {
  subs.add(f)
  if (!raf) raf = requestAnimationFrame(loop)
  return () => { subs.delete(f) }
}
const hash = (a: number, b: number) => {
  let h = (a * 374761393 + b * 668265263) | 0
  h = (h ^ (h >>> 13)) * 1274126177
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}
const CIPHER = '0123456789/&*.#$%+=<>'
const GLYPH = '·:|¦I'

function intensity(m: Look['motion'], c: number, r: number, t: number, cols: number, rows: number) {
  switch (m) {
    case 'breathe': {
      const v = 0.5 + 0.5 * Math.sin(t * 1.3 + c * 0.42 + r * 0.33) * Math.cos(t * 0.6 - r * 0.45 + c * 0.12)
      return v
    }
    case 'trickle': {
      const s = hash(c, 7)
      const span = rows + 6
      const head = (t * (3 + s * 4) + s * 40) % span
      const d = head - r
      return d >= 0 && d < 5 ? 1 - d / 5 : 0.06
    }
    case 'brush': {
      const y = rows / 2 + Math.sin(c * 0.32 + t * 1.5) * rows * 0.32
      const v = Math.exp(-((r - y) ** 2) / 1.8)
      return 0.08 + 0.92 * v
    }
    case 'lightning': {
      const period = 1.9, ph = t % period, k = Math.floor(t / period)
      const base = 0.3 + 0.12 * Math.sin(t * 1.4 + c * 0.5 + r * 0.3)
      if (ph > 0.6) return base
      const x0 = 1 + Math.floor(hash(k, 3) * Math.max(1, cols - 2))
      const x = x0 + Math.round(Math.sin(r * 1.7 + k) * 1.4)
      const fade = 1 - ph / 0.6
      return Math.max(base + 0.25 * fade, c === x ? fade : Math.abs(c - x) === 1 ? fade * 0.45 : 0)
    }
    case 'geometric': {
      const a = 1 - Math.min(1, Math.abs(Math.sin((c + r) * 0.45 - t * 0.9)) * 3)
      const b = 1 - Math.min(1, Math.abs(Math.sin((c - r) * 0.45 + t * 0.6)) * 3)
      return Math.max(0.07, Math.min(1, Math.max(a, 0) + Math.max(b, 0)))
    }
  }
}

export function MiniField({ look, light, cell = 5, seed = 0, still: stillProp = false, style, className }: {
  look: Look; light: boolean; cell?: number; seed?: number; still?: boolean; style?: CSSProperties; className?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const glyphs = look.render !== 'tiles'
    const cw = glyphs ? cell * 1.4 : cell
    const ch = glyphs ? cell * 2.1 : cell
    let w = 0, h = 0, cols = 0, rows = 0
    const size = () => {
      const b = cv.getBoundingClientRect()
      w = b.width; h = b.height
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr)
      cols = Math.max(1, Math.floor(w / cw)); rows = Math.max(1, Math.floor(h / ch))
    }
    const still = stillProp || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    size()
    const ro = new ResizeObserver(() => { size(); if (still) { lastDraw = -1; draw(1.7) } })
    ro.observe(cv)

    const [tr, tg, tb] = tintOf(look.color ?? null, light)
    const [hue, sat, lit] = rgbToHsl(tr, tg, tb)
    const rainbow = look.hover === 'rainbow' && look.color
    const tones: string[] = []
    for (let i = 0; i < 12; i++) {
      const [r, g, b] = rainbow
        ? hslToRgb(hue + Math.sin((i / 12) * Math.PI * 2) * 0.06, sat, lit)
        : [tr, tg, tb]
      tones.push(`${r},${g},${b}`)
    }

    // cream swallows faint tiles, so light mode keeps a higher floor
    const floor = light ? 0.42 : 0.3
    let lastDraw = -1
    const draw = (now: number) => {
      if (now - lastDraw < 1 / 30) return
      lastDraw = now
      // each swatch runs on its own phase, so the grid never pulses in unison
      const t = now + seed * 1.37
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const ox = (w - cols * cw) / 2, oy = (h - rows * ch) / 2
      if (glyphs) {
        ctx.font = `${Math.round(ch * 0.95)}px ui-monospace, Menlo, monospace`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      }
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const v = Math.max(0, Math.min(1, intensity(look.motion, c, r, t, cols, rows)))
        const tone = tones[rainbow ? Math.floor(((c * 0.6 + r * 0.4 + t * 1.5) % 12 + 12) % 12) : 0]
        const x = ox + c * cw, y = oy + r * ch
        if (!glyphs) {
          const s = cw * (0.28 + 0.62 * v)
          ctx.fillStyle = `rgba(${tone},${floor + (1 - floor) * v})`
          ctx.fillRect(x + (cw - s) / 2, y + (ch - s) / 2, s, s)
        } else {
          const glyph = look.render === 'cipher'
            ? CIPHER[Math.floor(hash(c + seed * 31, r) * CIPHER.length + t * (0.6 + hash(r, c) * 1.5)) % CIPHER.length]
            : GLYPH[Math.min(GLYPH.length - 1, Math.floor(v * GLYPH.length))]
          ctx.fillStyle = `rgba(${tone},${0.22 + 0.78 * v})`
          ctx.fillText(glyph, x + cw / 2, y + ch / 2)
        }
      }
    }
    let off = () => {}
    if (still) draw(1.7); else off = subscribe(draw)
    return () => { off(); ro.disconnect() }
  }, [look, light, cell, seed, stillProp])
  return <canvas ref={ref} aria-hidden className={className} style={{ display: 'block', width: '100%', height: '100%', ...style }} />
}

// ── shared bits ───────────────────────────────────────────────────────────

type PanelProps = {
  override: Override
  setOverride: (v: Override) => void
  live: Cell | null
  place?: string | null
  light: boolean
  theme?: 'light' | 'dark'
  setTheme?: (t: 'light' | 'dark') => void
  onClose?: () => void
}

const SHARED_CSS = `
  .wv-pop {
    position: absolute; top: calc(100% + 0.5rem); right: 0; z-index: 400;
    width: min(var(--wv-w, 380px), calc(100vw - 1.2rem));
    max-height: calc(100dvh - 7.5rem); overflow-y: auto; overscroll-behavior: contain;
    background: var(--bg); color: var(--ink);
    border: 1px solid var(--hairline); border-radius: 0;
    padding: 1.15rem 1.15rem 1.05rem;
    line-height: 1.5; text-align: left; font-size: 0.95rem;
    animation: wv-in .22s cubic-bezier(.19,1,.22,1);
  }
  @keyframes wv-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
  .wv-pop button { font-family: inherit; color: var(--ink); }
  /* the least important action: regular weight, no underline, a grey mixed
     from the page ink (about 7.6:1 on dark, 5.8:1 on light, so still AA) */
  .wv-pop .wv-reset {
    background: none; border: none; padding: 0.2rem 0; cursor: pointer;
    font-size: 0.92rem; font-weight: 400; line-height: 1.4;
    color: color-mix(in srgb, var(--ink) 68%, var(--bg));
    transition: color .15s;
  }
  .wv-pop .wv-reset:hover { color: var(--ink); }
`

/* Defne's own story about the canvas, word for word from the original panel.
   The .wx-intro / .wx-place classes live in WeatherControl's style block. */
function Story({ place }: { place?: string | null }) {
  return (
    <>
      <p className="wx-intro">
        As a chronic weather checker and lover of ambient technology, I wanted this interactive canvas
        to{' '}
        <span className="wx-hot" style={{ color: 'var(--award)' }}>synchronize with the outside world</span>.
      </p>
      <p className="wx-intro" style={{ marginTop: '0.8rem' }}>
        This is my visual interpretation of the weather in{' '}
        <span className="wx-place">
          <span className="wx-generic">your area</span>
          <span className="wx-real">{place || 'your area'}</span>
        </span>.
        With that being said, you{'’'}re more than welcome to play with every configuration.
      </p>
    </>
  )
}

// ── the picker: every hour × sky as a 5×7 grid ─────────────────────────────

// the grid's own styles, shared by the Star panel and the shell panel
const GRID_CSS = `
        .wa-grid { display: grid; grid-template-columns: auto repeat(7, minmax(0, 1fr)); gap: 5px; align-items: center; margin-top: 1.1rem; }
        .wa-row { font-size: 0.9rem; font-weight: 400; padding-right: 0.45rem; white-space: nowrap; line-height: 1.1; transition: color .12s; }
        .wa-col { display: flex; justify-content: center; padding-bottom: 4px; transition: color .12s; }
        /* hovering a swatch picks out its row and column in the accent, so the
           grid reads without a caption underneath (colour, not weight, so
           nothing reflows) */
        .wa-row[data-hot="1"], .wa-col[data-hot="1"] { color: var(--award); }
        .wa-cell {
          position: relative; aspect-ratio: 1 / 0.82; padding: 0; border: none; cursor: pointer;
          border-radius: 0; background: color-mix(in srgb, var(--c) 9%, transparent);
          outline: 2px solid transparent; outline-offset: 2px;
          transition: outline-color .12s;
        }
        .wa-cell:hover { outline-color: var(--hairline); }
        .wa-cell[data-on="1"] { outline-color: var(--c); }
        /* classic swatch: dithered colour, the sky icon, outline and hard shadow */
        .wa-classic { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          border: 1.5px solid var(--ink); box-shadow: 2px 2px 0 var(--ink); color: var(--ink);
          background-color: color-mix(in srgb, var(--c) 45%, #fff);
          background-image: conic-gradient(var(--c) 25%, transparent 0 50%, var(--c) 0 75%, transparent 0);
          background-size: 4px 4px; image-rendering: pixelated; }
        .wa-classic svg { filter: drop-shadow(1px 1px 0 rgba(0,0,0,.25)); }
        /* playing: the dither gives way to the field on the page colour */
        .wa-classic[data-live="1"] { background: var(--bg); overflow: hidden; }
        .wa-cell:hover .wa-classic { transform: translate(1px, 1px); box-shadow: 1px 1px 0 var(--ink); }
        .wa-cell[data-on="1"] .wa-classic { outline: 2px solid var(--ink); outline-offset: 2px; }
`


/* The weather panel is a Xerox Star window: a striped title bar with
   rounded command buttons (Close, Reset), then the story and the grid, with
   the display theme as a property row of joined choices. */
export function PanelA({ override, setOverride, live, place, light, theme, setTheme, onClose }: PanelProps) {
  const cur: Cell | null = override ?? live
  const [hover, setHover] = useState<Cell | null>(null)
  return (
    <div className="wv-pop wv-star" style={{ ['--wv-w' as string]: '460px' }}>
      <div className="st-head">
        {onClose && <button className="st-cmd" onClick={onClose}>Close</button>}
        <button className="st-cmd" onClick={() => setOverride(null)} disabled={!override}>Reset</button>
        <span className="st-title">Field Properties</span>
      </div>
      <div className="st-body">
      <style>{`
        ${GRID_CSS}
        /* the Star window */
        .wv-pop.wv-star { padding: 0; border: 2px solid var(--ink); box-shadow: 4px 4px 0 var(--ink); animation: none;
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; }
        .st-head { position: sticky; top: 0; z-index: 2; height: 26px; display: flex; align-items: center; gap: 6px; padding: 0 6px;
          border-bottom: 2px solid var(--ink); background: repeating-linear-gradient(to bottom, var(--ink) 0 1px, var(--bg) 1px 3px); }
        .st-title { margin: 0 auto; padding: 0 10px; background: var(--bg); font-size: 13px; line-height: 20px; white-space: nowrap; }
        .st-cmd { height: 20px; padding: 0 8px; border: 1.5px solid var(--ink); border-radius: 4px; background: var(--bg); font-size: 12.5px !important; line-height: 1; cursor: pointer; }
        .st-cmd:hover:not(:disabled) { background: var(--ink); color: var(--bg) !important; }
        .st-cmd:disabled { opacity: 0.4; cursor: default; }
        .st-cmd + .st-title { margin-left: auto; }
        .st-body { padding: 1rem 1.1rem 1.1rem; }
        .wv-star .wx-intro { font-family: "Times New Roman", Times, serif; font-size: 1.02rem; line-height: 1.5; }
        .wv-star .wa-row { font-size: 0.86rem; }
        .st-prop { display: flex; align-items: center; gap: 10px; margin-top: 1rem; padding-top: 0.8rem; border-top: 1.5px solid var(--ink); font-size: 13px; }
        .st-seg { display: flex; border: 1.5px solid var(--ink); }
        .st-seg button { height: 22px; padding: 0 10px; border: 0; border-right: 1.5px solid var(--ink); background: var(--bg); font-size: 12.5px !important; cursor: pointer; }
        .st-seg button:last-child { border-right: 0; }
        .st-seg button[aria-pressed="true"] { background: var(--ink); color: var(--bg) !important; }
        /* the highlighted phrases read as terminal output, like the bio's prompt */
        .wv-pop .wx-hot, .wv-pop .wx-place { font-family: var(--font-mono); font-size: 0.92em; }
        /* theme: the current one as a pixel sun or moon, top right */
        .wa-theme { position: absolute; top: 0.6rem; right: 0.6rem; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
          background: none; border: none; padding: 0; cursor: pointer; color: var(--ink); transition: color .15s; }
        .wa-theme:hover { color: var(--award); }
        .wv-pop.wa-has-theme .wx-intro:first-of-type { padding-right: 2.4rem; }
        @media (max-width: 420px) { .wa-grid { gap: 4px; } .wa-row { font-size: 0.86rem; padding-right: 0.25rem; } }
      `}</style>

      <Story place={place} />

      <div className="wa-grid" onMouseLeave={() => setHover(null)}>
        <span />
        {SKIES.map(s => {
          const Icon = SKY_ICON[s]
          return <span key={s} className="wa-col" title={SKY_NAME[s]} data-hot={hover?.s === s ? 1 : 0}><Icon size={15} /></span>
        })}
        {ALL_PERIODS.map(p => (
          <Row key={p} p={p} cur={cur} live={live} light={light} hot={hover?.p === p} hover={hover}
            onPick={c => setOverride(same(c, live) ? null : c)} onHover={setHover} />
        ))}
      </div>

      {setTheme && (
        <div className="st-prop">
          <span>Display</span>
          <div className="st-seg">
            {(['light', 'dark'] as const).map(t => (
              <button key={t} aria-pressed={theme === t} onClick={() => setTheme(t)}>{t === 'light' ? 'Light' : 'Dark'}</button>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

/* The CLI side's weather panel: the same story and grid, as output in a
   shell box (the same box long shell output opens in), so the little fields
   still play. Each part is the command that printed it. */
export function PanelTerm({ override, setOverride, live, place, light, theme, setTheme, onClose }: PanelProps) {
  const cur: Cell | null = override ?? live
  const [hover, setHover] = useState<Cell | null>(null)
  // a terminal window: drag it by its title bar, anywhere on the page
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const drag = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    const sx = e.clientX - pos.x, sy = e.clientY - pos.y
    const move = (ev: PointerEvent) => setPos({ x: ev.clientX - sx, y: ev.clientY - sy })
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
  }
  return (
    <div className="wv-pop wv-term" style={{ ['--wv-w' as string]: '480px', transform: `translate(${pos.x}px, ${pos.y}px)` }}>
      <style>{GRID_CSS + `
        /* opens clear of the field's resize corner, which sits on the right edge */
        .wv-pop.wv-term { right: 2.75rem; }
        @media (max-width: 860px) { .wv-pop.wv-term { right: 0; } }
        .wv-pop.wv-term { padding: 0; border: 1.5px solid var(--ink); box-shadow: 4px 4px 0 var(--ink); border-radius: 0; animation: none; font-family: var(--font-mono); }
        .wt-bar { position: sticky; top: 0; z-index: 2; height: 26px; display: flex; align-items: center; justify-content: center; background: var(--bg);
          border-bottom: 1.5px solid var(--ink); font-size: 0.85rem; cursor: move; touch-action: none; user-select: none; }
        .wt-body { padding: 0.8rem 1rem 1rem; }
        .wt-x { position: absolute; top: 50%; left: 7px; transform: translateY(-50%); width: 15px; height: 15px; padding: 0; display: flex; align-items: center; justify-content: center;
          color: var(--ink); background: var(--bg); border: 1.5px solid var(--ink); cursor: pointer; }
        .wt-x:hover { background: var(--ink); color: var(--bg); }
        .wt-cmd { font-size: 0.92rem; color: var(--award); margin: 0 0 0.45rem; }
        .wt-cmd > span { color: var(--ink); }
        .wt-cmd + .wt-cmd, * + .wt-cmd { margin-top: 1rem; }
        .wt-body > .wt-cmd:first-child { margin-top: 0; }
        .wv-term .wx-intro { font-family: var(--font-mono); font-size: 0.88rem; line-height: 1.6; padding-right: 1.2rem; }
        .wv-term .wa-grid { margin-top: 0.2rem; }
        .wv-term .wa-row { font-size: 0.86rem; text-transform: lowercase; }
        .wt-line { display: flex; align-items: center; gap: 0.7rem; font-size: 0.9rem; }
        .wt-seg { display: inline-flex; border: 1.5px solid var(--ink); }
        .wt-seg button { height: 26px; padding: 0 10px; border: 0; background: var(--bg); font: inherit; font-size: 0.88rem; cursor: pointer; color: var(--ink); }
        .wt-seg button + button { border-left: 1.5px solid var(--ink); }
        .wt-seg button[aria-pressed="true"] { background: var(--ink); color: var(--bg); }
        .wt-reset { background: none; border: 0; padding: 0; font: inherit; font-size: 0.9rem; color: var(--award); cursor: pointer; text-align: left; }
        .wt-reset:hover { text-decoration: underline; }
      `}</style>
      <div className="wt-bar" onPointerDown={drag}>
        {onClose && (
          <button className="wt-x" aria-label="Close" onClick={onClose}>
            <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden><path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" /></svg>
          </button>
        )}
        <span>weather</span>
      </div>
      <div className="wt-body">
      <div className="wt-cmd"><span>%</span> cat weather.txt</div>
      <Story place={place} />
      <div className="wt-cmd"><span>%</span> weather --pick</div>
      <div className="wa-grid" onMouseLeave={() => setHover(null)}>
        <span />
        {SKIES.map(s => {
          const Icon = SKY_ICON[s]
          return <span key={s} className="wa-col" title={SKY_NAME[s]} data-hot={hover?.s === s ? 1 : 0}><Icon size={15} /></span>
        })}
        {ALL_PERIODS.map(p => (
          <Row key={p} p={p} cur={cur} live={live} light={light} hot={hover?.p === p} hover={hover}
            onPick={c => setOverride(same(c, live) ? null : c)} onHover={setHover} />
        ))}
      </div>
      {override && <button className="wt-reset" style={{ marginTop: '0.8rem' }} onClick={() => setOverride(null)}>% weather --reset</button>}
      {setTheme && (
        <div className="wt-line" style={{ marginTop: '1rem' }}>
          <span className="wt-cmd" style={{ margin: 0 }}><span>%</span> theme</span>
          <div className="wt-seg">
            {(['light', 'dark'] as const).map(t => <button key={t} aria-pressed={theme === t} onClick={() => setTheme(t)}>{t}</button>)}
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

/* With the classic icons, a swatch at rest is a still pixel tile: the cell's
   colour as a two-tone dither, its sky icon on top, an outline and a hard
   shadow like the icons around it. Point at it (or pick it) and the tile
   plays the field it stands for, inside the same frame, so you can see
   what you'd get. */
function ClassicSwatch({ color, sky, live, children }: { color: string; sky: Sky; live: boolean; children: React.ReactNode }) {
  const Icon = CLASSIC_ICON[sky]
  return (
    <span className="wa-classic" data-live={live ? 1 : 0} style={{ ['--c' as string]: color }}>
      {live ? children : <Icon />}
    </span>
  )
}

function Row({ p, cur, live, light, hot, hover, onPick, onHover }: {
  p: Period; cur: Cell | null; live: Cell | null; light: boolean; hot: boolean; hover: Cell | null
  onPick: (c: Cell) => void; onHover: (c: Cell | null) => void
}) {
  const classic = useContext(IconStyleCtx) === 'classic'
  return (
    <>
      <span className="wa-row" data-hot={hot ? 1 : 0}>{ROW_LABEL[p]}</span>
      {SKIES.map(s => {
        const l = LOOKS[p][s]
        const c = { p, s }
        return (
          <button key={s} className="wa-cell" data-on={same(c, cur) ? 1 : 0}
            style={{ ['--c' as string]: cssColor(l, light) }}
            aria-label={`${ROW_LABEL[p]}, ${SKY_NAME[s]}${same(c, live) ? ' (now)' : ''}`} aria-pressed={same(c, cur)}
            title={`${ROW_LABEL[p]}, ${SKY_NAME[s].toLowerCase()}`}
            onMouseEnter={() => onHover(c)} onFocus={() => onHover(c)}
            onClick={() => onPick(c)}>
            {/* only the swatch you're pointing at, and the one in use, move */}
            {classic
              ? <ClassicSwatch color={cssColor(l, light)} sky={s} live={same(c, hover) || same(c, cur)}>
                  <MiniField look={l} light={light} cell={4} seed={ALL_PERIODS.indexOf(p) * 7 + SKIES.indexOf(s)} />
                </ClassicSwatch>
              : <MiniField look={l} light={light} cell={4} seed={ALL_PERIODS.indexOf(p) * 7 + SKIES.indexOf(s)} still={!same(c, hover) && !same(c, cur)} />}
          </button>
        )
      })}
    </>
  )
}

// ── trigger: the closed control ───────────────────────────────────────────
/* The sky the field is drawing right now, as a fine pixel icon. */

export function Trigger({ sky = 'clear' }: { sky?: Sky }) {
  const Icon = SKY_ICON[sky]
  return <Icon size={15} />
}

export const TRIGGER_CSS = `
  /* no box: a fine line icon in ink, with a 34px target around it */
  .wx-trig {
    display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px;
    padding: 0; border: none; border-radius: 0; line-height: 0;
    background: none; color: var(--ink); cursor: pointer;
    transition: color .2s;
  }
  .wx-trig:hover, .wx[data-open="1"] .wx-trig { color: var(--award); }
`

export { SHARED_CSS }
