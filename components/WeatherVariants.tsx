'use client'

/* The weather picker (the matrix Defne chose) and three triggers to compare,
   picked with the WeatherControl `variant` prop or ?w=a|b|c.

   The swatch is the label: every cell of the LOOKS matrix is drawn as a tiny
   live field in its own colour, render and motion, so choosing a combination
   means choosing what you can already see.

   a  a "?" pill
   b  an information "i" pill
   c  a pill that reads "What is this?" */

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { LOOKS, type Period, type Sky } from '@/components/ambient'
import { SKY_ICON } from '@/components/weatherIcons'
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
}

const SHARED_CSS = `
  .wv-pop {
    position: absolute; top: calc(100% + 0.5rem); right: 0; z-index: 400;
    width: min(var(--wv-w, 380px), calc(100vw - 1.2rem));
    max-height: calc(100dvh - 7.5rem); overflow-y: auto; overscroll-behavior: contain;
    background: var(--bg); color: var(--ink);
    border: 1px solid var(--hairline); border-radius: 0;
    padding: 1.15rem 1.15rem 1.05rem; box-shadow: 0 14px 40px rgba(0,0,0,0.32);
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
  .wv-dot { display: inline-block; width: 7px; height: 7px; border-radius: 99px; background: var(--ink); box-shadow: 0 0 0 2px var(--bg); }
`

/* Defne's own story about the canvas, word for word from the original panel.
   The .wx-intro / .wx-place classes live in WeatherControl's style block. */
function Story({ place }: { place?: string | null }) {
  return (
    <>
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
    </>
  )
}

// ── the picker: every hour × sky as a 5×7 grid ─────────────────────────────

export function PanelA({ override, setOverride, live, place, light }: PanelProps) {
  const cur: Cell | null = override ?? live
  const [hover, setHover] = useState<Cell | null>(null)
  return (
    <div className="wv-pop" style={{ ['--wv-w' as string]: '430px' }}>
      <style>{`
        .wa-grid { display: grid; grid-template-columns: auto repeat(7, minmax(0, 1fr)); gap: 5px; align-items: center; margin-top: 1.1rem; }
        .wa-row { font-size: 0.9rem; font-weight: 400; padding-right: 0.45rem; white-space: nowrap; line-height: 1.1; transition: font-weight .1s; }
        .wa-col { display: flex; justify-content: center; padding-bottom: 2px; transition: transform .18s cubic-bezier(.19,1,.22,1); }
        /* hovering a swatch picks out its row and column, so the grid reads
           without a caption underneath */
        .wa-row[data-hot="1"] { font-weight: 700; }
        .wa-col[data-hot="1"] { transform: scale(1.18); }
        .wa-col[data-hot="1"] svg { stroke-width: 2.2; }
        .wa-cell {
          position: relative; aspect-ratio: 1 / 0.82; padding: 0; border: none; cursor: pointer;
          border-radius: 5px; background: color-mix(in srgb, var(--c) 9%, transparent);
          outline: 1.5px solid transparent; outline-offset: 2px;
          transition: transform .18s cubic-bezier(.19,1,.22,1), outline-color .15s;
        }
        .wa-cell canvas { border-radius: 5px; }
        .wa-cell:hover { transform: scale(1.08); z-index: 1; }
        .wa-cell[data-on="1"] { outline: 2px solid var(--c); }
        .wa-cell .wv-dot { position: absolute; top: -3px; right: -3px; }
        .wa-foot { display: flex; justify-content: flex-end; margin-top: 0.8rem; min-height: 1.7rem; }
        @media (max-width: 420px) { .wa-grid { gap: 4px; } .wa-row { font-size: 0.86rem; padding-right: 0.25rem; } }
      `}</style>

      <Story place={place} />

      <div className="wa-grid" onMouseLeave={() => setHover(null)}>
        <span />
        {SKIES.map(s => {
          const Icon = SKY_ICON[s]
          return <span key={s} className="wa-col" title={SKY_NAME[s]} data-hot={hover?.s === s ? 1 : 0}><Icon /></span>
        })}
        {ALL_PERIODS.map(p => (
          <Row key={p} p={p} cur={cur} live={live} light={light} hot={hover?.p === p}
            onPick={c => setOverride(same(c, live) ? null : c)} onHover={setHover} />
        ))}
      </div>

      <div className="wa-foot">
        {override && <button className="wv-reset" onClick={() => setOverride(null)}>Reset</button>}
      </div>
    </div>
  )
}

function Row({ p, cur, live, light, hot, onPick, onHover }: {
  p: Period; cur: Cell | null; live: Cell | null; light: boolean; hot: boolean
  onPick: (c: Cell) => void; onHover: (c: Cell | null) => void
}) {
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
            <MiniField look={l} light={light} cell={4} seed={ALL_PERIODS.indexOf(p) * 7 + SKIES.indexOf(s)} />
            {same(c, live) && <span className="wv-dot" />}
          </button>
        )
      })}
    </>
  )
}

// ── triggers: the closed control ──────────────────────────────────────────
/* Three plain pills to compare, each opening the same picker:
   a  "?"   b  an information "i"   c  the words "What is this?" */

export type TriggerKind = 'a' | 'b' | 'c'

// SVG text centres on the real glyph, which a flex box cannot do
const Glyph = ({ ch, serif }: { ch: string; serif?: boolean }) => (
  <svg width="16" height="20" viewBox="0 0 16 20" aria-hidden>
    <text x="8" y="10.5" textAnchor="middle" dominantBaseline="central"
      fontFamily={serif ? 'Georgia, serif' : 'var(--font-main)'} fontSize="16"
      fontWeight={serif ? 700 : 500} fontStyle={serif ? 'italic' : 'normal'} fill="currentColor">{ch}</text>
  </svg>
)

export function Trigger({ kind }: { kind: TriggerKind }) {
  if (kind === 'a') return <Glyph ch="?" />
  if (kind === 'b') return <Glyph ch="i" serif />
  return <>What is this?</>
}

export const TRIGGER_CSS = `
  .wx-trig {
    display: inline-flex; align-items: center; justify-content: center; height: 30px;
    padding: 0 0.85rem; border: 1px solid var(--hairline); border-radius: 999px;
    background: var(--bg); color: var(--ink); cursor: pointer; white-space: nowrap;
    font-family: inherit; font-size: 0.92rem; font-weight: 500; line-height: 1;
    transition: border-color .2s, color .2s;
  }
  .wx-trig[data-v="a"], .wx-trig[data-v="b"] { width: 44px; padding: 0; }
  .wx-trig:hover, .wx[data-open="1"] .wx-trig { border-color: var(--award); color: var(--award); }
`

export { SHARED_CSS }
