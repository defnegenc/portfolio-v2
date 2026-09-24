'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import AsciiCanvas from '@/components/AsciiCanvas'
import ThemeToggle from '@/components/ThemeToggle'
import NavMenu from '@/components/NavMenu'
import { useTheme } from '@/components/useTheme'
import { useAmbient, LOOKS, periodOf } from '@/components/ambient'
import WeatherControl, { type Override } from '@/components/WeatherControl'
import { forLight } from '@/components/color'

// ─── Glitch Name ──────────────────────────────────────────────────────────────

function TypewriterName({ text }: { text: string }) {
  const elRef = useRef<HTMLSpanElement | null>(null)
  const cursorRef = useRef<HTMLSpanElement | null>(null)
  const animating = useRef(false)

  const animate = async () => {
    if (animating.current) return
    animating.current = true
    const el = elRef.current
    const cur = cursorRef.current
    if (!el || !cur) { animating.current = false; return }

    cur.style.opacity = '1'

    // Delete
    for (let i = text.length; i >= 0; i--) {
      el.textContent = text.substring(0, i)
      await new Promise(r => setTimeout(r, 25))
    }

    await new Promise(r => setTimeout(r, 160))

    // Retype
    for (let i = 0; i <= text.length; i++) {
      el.textContent = text.substring(0, i)
      await new Promise(r => setTimeout(r, 40))
    }

    cur.style.opacity = '0'
    animating.current = false
  }

  return (
    <span style={{ display: 'inline-block', cursor: 'crosshair', whiteSpace: 'nowrap' }} onMouseEnter={animate}>
      <span ref={elRef}>{text}</span>
      <span ref={cursorRef} style={{ opacity: 0, transition: 'opacity 0.1s', marginLeft: 2 }}>_</span>
    </span>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PROJECTS = [
  { name: 'Bloom',           kind: 'Research',      year: '2025', href: '/project/bloom',        sub: 'LLM-augmented physical activity coaching', award: 'CHI 2026 Best Paper', awardNote: '(Top 1%)' },
  { name: 'Learning Et Al.', kind: 'Website',       year: '2026', href: '/project/learningetal', sub: 'A daily research digest that argues with itself' },
  { name: 'Menuto',          kind: 'iOS app',       year: '2026', href: '/project/menuto',       sub: 'Dish recommendations that learn your taste' },
  { name: 'Dishcovery',      kind: 'iOS app',       year: '2024', href: '/project/dishcovery',   sub: 'Recognise and cook with ingredients from anywhere' },
]

const BIO = 'I think about how modern interfaces should (and fail to) meet our needs with exponentially growing agentic capabilities. BS, MS, and a deferred PhD admission from Stanford University, where I specialized in human-AI interaction. Now AI @ Coinbase, where I own the agent creation experience.'


const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' }

/* The bio reads itself, one phrase at a time, in the breaks Defne set by hand.
   Lengths rather than text matching, so the groups stay exact; the last group
   absorbs any drift if the copy is edited without updating this. */
const BIO_WORDS = BIO.split(' ')
const PHRASE_LENGTHS = [3, 3, 4, 3, 5, 7, 3, 6, 4, 4, 3]
const PHRASES: [number, number][] = (() => {
  const out: [number, number][] = []
  let i = 0
  PHRASE_LENGTHS.forEach((len, k) => {
    if (i >= BIO_WORDS.length) return
    const last = k === PHRASE_LENGTHS.length - 1
    const end = last ? BIO_WORDS.length - 1 : Math.min(BIO_WORDS.length - 1, i + len - 1)
    out.push([i, end])
    i = end + 1
  })
  if (i < BIO_WORDS.length) out.push([i, BIO_WORDS.length - 1])
  return out
})()

function Bio({ style, onDone }: { style: React.CSSProperties; onDone?: () => void }) {
  // one pass, then the highlight lifts for good rather than looping
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (step >= PHRASES.length) { onDone?.(); return }
    const id = setTimeout(() => setStep(v => v + 1), 1100)
    return () => clearTimeout(id)
  }, [step, onDone])
  const [from, to] = PHRASES[step] ?? [-1, -1]
  return (
    <p style={style}>
      {BIO_WORDS.map((w, i) => (
        <span key={i} className={i >= from && i <= to ? 'bio-w bio-on' : 'bio-w'}>{w}</span>
      ))}
    </p>
  )
}

// ─── Content blocks ───────────────────────────────────────────────────────────

type ContactFn = (v: boolean) => void

function Links({ setContact, size = '0.97rem' }: { setContact: ContactFn; size?: string }) {
  const st: React.CSSProperties = { fontSize: size, color: 'var(--ink-dim)', textDecoration: 'none', background: 'none', border: 'none', padding: 0, fontFamily: 'inherit' }
  const arrow = <span style={{ fontSize: '0.8em', marginLeft: '0.2em' }}>↗</span>
  return (
    <div style={{ display: 'flex', gap: '1.25rem' }}>
      <button className="ul" onClick={() => setContact(true)} style={st}>Email{arrow}</button>
      <a className="ul" href="https://linkedin.com/in/-defne" target="_blank" rel="noreferrer" style={st}>LinkedIn{arrow}</a>
      <a className="ul" href="https://github.com/defnegenc" target="_blank" rel="noreferrer" style={st}>GitHub{arrow}</a>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.9rem' }}>{children}</div>
}

function Work({ setContact, big = false }: { setContact: ContactFn; big?: boolean }) {
  return (
    <div>
      <Label>Projects</Label>
      <div className="pl-list" style={{ display: 'flex', flexDirection: 'column', gap: big ? '0.7rem' : '0.5rem' }}>
        {PROJECTS.map(p => (
          <a key={p.name} href={p.href} className="pl" style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', fontSize: big ? 'clamp(1.55rem, 2.2vw, 2rem)' : '1.3rem', fontWeight: 500, letterSpacing: '-0.01em', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-display)' }}>{p.name}</span>
            {p.award && (
              <span className="award" style={{ fontSize: big ? '1rem' : '0.88rem', whiteSpace: 'nowrap' }}>
                {p.award} <span>{p.awardNote}</span>
              </span>
            )}
          </a>
        ))}
      </div>
      <div style={{ marginTop: '1.4rem' }}><Links setContact={setContact} /></div>
    </div>
  )
}

function About({ big = false, xl = false, onDone }: { big?: boolean; xl?: boolean; onDone?: () => void }) {
  const size = xl ? 'clamp(1.45rem, 2.1vw, 1.9rem)' : big ? 'clamp(1.25rem, 1.7vw, 1.55rem)' : 'clamp(1.15rem, 1.5vw, 1.35rem)'
  const strong = big || xl
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <Bio onDone={onDone} style={{ fontSize: size, lineHeight: 1.75, color: 'var(--ink)', fontWeight: strong ? 300 : 400, letterSpacing: xl ? '-0.01em' : 0 }} />
    </div>
  )
}



// ─── Layout primitives (temporary: comparing options) ─────────────────────────

// Windows: a grid of see-through cells over one continuous canvas. Walls are
// drawn with box-shadow so the gaps and outer margin read as solid background.
// `content` fills a cell with a solid background; every other cell is a window.
function Windows({ cols, rows, content = {} }: { cols: number; rows: number; content?: Record<string, React.ReactNode> }) {
  const wall = '0 0 0 var(--wall) var(--bg)'
  const cells = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const key = `${c},${r}`
    if (key in content) {
      // pointer-events comes from CSS so the open state can hand the cursor to the canvas
      cells.push(<div key={key} className="panel scrollbar-none" style={{ background: 'var(--bg)', boxShadow: wall, overflowY: 'auto', minWidth: 0, minHeight: 0 }}>{content[key]}</div>)
    } else {
      cells.push(<div key={key} style={{ boxShadow: wall }} />)
    }
  }
  return (
    <div className="windows" style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, gap: 'var(--wall)', padding: 'var(--wall)', pointerEvents: 'none' }}>
      {cells}
    </div>
  )
}

// ArchWindows: the same idea as Windows, but each opening is a pointed arch with
// tracery — two lancets below, a rosette in the top third. Drawn as one SVG of
// solid background with the openings punched out, measured in pixels so the
// curves never stretch.
function ArchWindows({ count = 5 }: { count?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { w, h } = box
  const holes: string[] = []

  if (w > 0 && h > 0) {
    const wall = Math.max(10, Math.min(w, h) * 0.05)
    const slotW = (w - wall * (count + 1)) / count
    const winH = h - wall * 2
    const spring = winH * 0.45            // where the arch leaves the jamb

    // one pointed arch as a path, opening upward from (x, y) with size (aw, ah)
    const arch = (x: number, y: number, aw: number, ah: number, springRatio: number) => {
      const sy = y + ah * (1 - springRatio)
      const apex = y
      const cx = x + aw / 2
      return `M ${x} ${y + ah} L ${x} ${sy} Q ${x} ${apex} ${cx} ${apex} Q ${x + aw} ${apex} ${x + aw} ${sy} L ${x + aw} ${y + ah} Z`
    }

    for (let i = 0; i < count; i++) {
      const x = wall + i * (slotW + wall)
      const y = wall
      holes.push(arch(x, y, slotW, winH, spring / winH))

      // tracery: inset frame, two lancets, a rosette in the top third
      const m = Math.max(4, slotW * 0.09)
      const ix = x + m, iw = slotW - m * 2
      const inner = winH - m * 2
      const rosR = Math.min(iw * 0.3, inner * 0.16)
      const rosCy = y + m + inner * 0.2
      const lancetTop = rosCy + rosR + m * 0.9
      const lancetH = y + winH - m - lancetTop
      const lw = (iw - m * 0.9) / 2

      if (lancetH > rosR && lw > 6) {
        holes.push(arch(ix, lancetTop, lw, lancetH, 0.4))
        holes.push(arch(ix + lw + m * 0.9, lancetTop, lw, lancetH, 0.4))
        // rosette: six petals around a small centre
        const petal = rosR * 0.42
        for (let p = 0; p < 6; p++) {
          const a = (p / 6) * Math.PI * 2 - Math.PI / 2
          const px = x + slotW / 2 + Math.cos(a) * (rosR - petal * 0.9)
          const py = rosCy + Math.sin(a) * (rosR - petal * 0.9)
          holes.push(`M ${px - petal} ${py} a ${petal} ${petal} 0 1 0 ${petal * 2} 0 a ${petal} ${petal} 0 1 0 ${-petal * 2} 0 Z`)
        }
        const cr = rosR * 0.3
        holes.push(`M ${x + slotW / 2 - cr} ${rosCy} a ${cr} ${cr} 0 1 0 ${cr * 2} 0 a ${cr} ${cr} 0 1 0 ${-cr * 2} 0 Z`)
      }
    }
  }

  return (
    <div ref={ref} className="windows" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {w > 0 && (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
          <defs>
            <mask id="arch-mask">
              <rect x={0} y={0} width={w} height={h} fill="#fff" />
              {holes.map((d, i) => <path key={i} d={d} fill="#000" />)}
            </mask>
          </defs>
          <rect x={0} y={0} width={w} height={h} fill="var(--bg)" mask="url(#arch-mask)" />
        </svg>
      )}
    </div>
  )
}

// SashWindows: round-arched Georgian windows. A semicircular fanlight with
// radiating spokes and an inner ring sits over a gridded sash. Same trick as
// ArchWindows: one SVG of solid background, openings punched out, then the
// muntins painted back in so they read as glazing bars.
function SashWindows({ count = 2 }: { count?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { w, h } = box
  const holes: string[] = []
  const bars: string[] = []

  if (w > 0 && h > 0) {
    const wall = Math.max(12, Math.min(w, h) * 0.06)
    const slotW = (w - wall * (count + 1)) / count
    const winH = h - wall * 2
    const r = slotW / 2

    for (let i = 0; i < count; i++) {
      const x = wall + i * (slotW + wall)
      const y = wall
      const cx = x + r, sy = y + r          // arc centre, springline
      const bottom = y + winH

      // opening: semicircular head over a rectangular sash
      holes.push(`M ${x} ${bottom} L ${x} ${sy} A ${r} ${r} 0 0 1 ${x + slotW} ${sy} L ${x + slotW} ${bottom} Z`)

      // fanlight: radiating spokes plus an inner ring
      const ir = r * 0.52
      for (let k = 1; k < 8; k++) {
        const a = Math.PI + (k / 8) * Math.PI
        bars.push(`M ${cx + Math.cos(a) * ir} ${sy + Math.sin(a) * ir} L ${cx + Math.cos(a) * r} ${sy + Math.sin(a) * r}`)
      }
      bars.push(`M ${cx - ir} ${sy} A ${ir} ${ir} 0 0 1 ${cx + ir} ${sy}`)
      bars.push(`M ${cx - ir} ${sy} L ${cx - ir} ${sy - r * 0.02}`)
      bars.push(`M ${x} ${sy} L ${x + slotW} ${sy}`)   // transom under the fanlight

      // sash: a grid of panes, plus a meeting rail two thirds down
      const sashH = bottom - sy
      const cols = 4, rows = Math.max(3, Math.round(sashH / (slotW / cols)))
      for (let c = 1; c < cols; c++) {
        const bx = x + (slotW / cols) * c
        bars.push(`M ${bx} ${sy} L ${bx} ${bottom}`)
      }
      for (let rr = 1; rr < rows; rr++) {
        const by = sy + (sashH / rows) * rr
        bars.push(`M ${x} ${by} L ${x + slotW} ${by}`)
      }
    }
  }

  const barW = Math.max(2, Math.min(w, h) * 0.006)

  return (
    <div ref={ref} className="windows" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {w > 0 && (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
          <defs>
            <mask id="sash-mask">
              <rect x={0} y={0} width={w} height={h} fill="#fff" />
              {holes.map((d, i) => <path key={i} d={d} fill="#000" />)}
              {bars.map((d, i) => <path key={`b${i}`} d={d} stroke="#fff" strokeWidth={barW} fill="none" />)}
            </mask>
          </defs>
          <rect x={0} y={0} width={w} height={h} fill="var(--bg)" mask="url(#sash-mask)" />
        </svg>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [navOpen, setNavOpen]     = useState(false)
  const [contactOpen, setContact] = useState(false)
  const [formSent, setFormSent]   = useState(false)
  const [theme, setTheme]         = useTheme('dark')
  // 0 = windows at rest, 1 = walls gone and the animation fills the frame
  const [open, setOpen]           = useState(0)

  // When an ambient mode is on it drives the field; the picker still shows the
  // hand-set values so switching back is where you left off.
  const { ambient, sky } = useAmbient('weather')

  // The ⓘ control can pin a cell of the matrix; otherwise the live reading wins,
  // and the hand picker is the fallback when ambient mode is off.
  const [wx, setWx] = useState<Override>(null)
  const [wxOpen, setWxOpen] = useState(false)
  // the scroll cue retires after ten seconds, or on first scroll, and never returns
  const [cueGone, setCueGone] = useState(false)
  // the canvas controls stay out of the way until the bio has finished reading
  const [bioDone, setBioDone] = useState(false)   // gates the scroll cue
  const onBioDone = useCallback(() => setBioDone(true), [])
  const live = sky ? { p: periodOf(), s: sky.sky } : null
  const pinned = wx ? LOOKS[wx.p][wx.s] : null

  /* The weather round-trip takes a moment, so a cold load used to paint the
     default field and then swap. Remember the last resolved cell and start
     from it: on a reload the colours only change if the sky actually did. */
  const [remembered, setRemembered] = useState<Override>(null)
  useEffect(() => {
    const v = window.localStorage.getItem('look')
    if (v) { try { setRemembered(JSON.parse(v)) } catch {} }
  }, [])
  useEffect(() => {
    if (live) window.localStorage.setItem('look', JSON.stringify(live))
  }, [live?.p, live?.s])   // eslint-disable-line react-hooks/exhaustive-deps

  const look = pinned ?? ambient ?? (remembered ? LOOKS[remembered.p][remembered.s] : null)

  const color  = look?.color  ?? null
  const render = look?.render ?? 'tiles'
  const motion = look?.motion ?? 'breathe'
  const hover  = look?.hover  ?? 'rainbow'
  // snow paints in theme ink but still wants a colour for the UI accent
  const award  = look ? (look.accent ?? look.color) : null

  // Scrolling over the canvas opens the windows: walls thin out, text recedes,
  // and the animation grows into the whole frame. Scrolling back closes them.
  useEffect(() => {
    const fn = (e: WheelEvent) => {
      if (window.innerWidth <= 860) return
      if ((e.target as HTMLElement)?.closest('.no-open')) return
      setCueGone(true)
      setOpen(v => Math.min(1, Math.max(0, v + e.deltaY / 900)))
    }
    const onResize = () => { if (window.innerWidth <= 860) setOpen(0) }
    window.addEventListener('resize', onResize)
    window.addEventListener('wheel', fn, { passive: true })
    return () => { window.removeEventListener('wheel', fn); window.removeEventListener('resize', onResize) }
  }, [])

  useEffect(() => {
    if (!bioDone) return
    const t = setTimeout(() => setCueGone(true), 10000)
    return () => clearTimeout(t)
  }, [bioDone])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setNavOpen(false); setContact(false) }
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = fd.get('name') as string
    const email = fd.get('email') as string
    const msg = fd.get('message') as string
    window.open(`mailto:defneg@stanford.edu?subject=${encodeURIComponent(`Portfolio — ${name}`)}&body=${encodeURIComponent(`${msg}\n\nFrom: ${name} <${email}>`)}`)
    setFormSent(true)
    setTimeout(() => { setFormSent(false); setContact(false) }, 2000)
  }

  const isLight = theme === 'light'

  /* Remember the accent the field landed on, so content pages can carry the
     same colour instead of each project asserting its own. */
  useEffect(() => {
    if (award) window.localStorage.setItem('accent', award)
  }, [award])

  return (
    <div
      data-theme={theme}
      data-open={open > 0.15 ? 1 : 0}
      className="root-frame"
      style={{ display: 'flex', flexDirection: 'column', width: '100vw', overflow: 'hidden', background: 'var(--bg)', color: 'var(--ink)',
        ...({ '--wall': `${1.75 * (1 - open)}rem`, '--open': open } as React.CSSProperties),
        ...(award ? ({ '--award': isLight ? forLight(award) : award } as React.CSSProperties) : {}) }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }

        /* Light theme */
        [data-theme="light"] {
          --bg: #F4F2EC;
          --ink: #1A1918;
          --ink-dim: #2E2D2A;
          --hairline: rgba(26, 25, 24, 0.15);
        }


        /* Scroll cue: page ink on the page background, so it is a black disc in
           dark mode and a white one in light. */
        .scroll-cue {
          position: absolute; left: 50%; transform: translateX(-50%);
          top: calc(var(--wall) + 0.7rem); z-index: 70;
          height: 30px; padding: 0 0.8rem; border-radius: 999px;
          display: flex; align-items: center; gap: 0.4rem;
          background: var(--bg); color: var(--ink);
          border: 1px solid var(--hairline); cursor: pointer;
          font-family: inherit; font-size: 0.88rem; font-weight: 600; line-height: 1;
          transition: opacity .35s ease, color .2s, border-color .2s;
        }
        .scroll-cue:hover { color: var(--award); border-color: var(--award); }
        @media (max-width: 860px) { .scroll-cue { display: none; } }

        /* The bio's phrase walk: block in the accent, words inverted to the page */
        .bio-w { display: inline-block; padding: 0.06em 0.16em; margin-right: 0.1em; border-radius: 3px; transition: background .18s ease, color .18s ease; }
        .bio-on { background: var(--award); color: var(--bg); }
        @media (prefers-reduced-motion: reduce) { .bio-on { background: none; color: var(--ink); } }

        /* Project links */
        .pl { text-decoration: none; color: var(--ink); transition: opacity .2s; }
        .pl-list:hover .pl { opacity: 0.35; }
        .pl-list .pl:hover { opacity: 1; }
        .award { color: var(--award); }
        /* default accent when the field itself is ink and offers no colour */
        [data-theme="dark"]  { --award: #7FA8F5; }
        [data-theme="light"] { --award: #013698; }

        /* Nav overlay links */
        .ni { transition: color .2s, transform .25s; }
        .ni:hover { color: var(--ink) !important; transform: translateX(8px); }

        /* Underline links */
        .ul { position: relative; transition: color .2s; }
        .ul::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 1px; background: currentColor; transform: scaleX(0); transform-origin: right; transition: transform .3s cubic-bezier(.19,1,.22,1); }
        .ul:hover::after { transform: scaleX(1); transform-origin: left; }
        .ul:hover { color: var(--award) !important; }

        /* The open nav row unfolds leftward over this spot, so the toggle
           steps aside while the menu is out. */
        .ns-seg .theme-toggle { transition: opacity .25s ease; }
        .ns-seg[data-navopen="1"] .theme-toggle { opacity: 0; pointer-events: none; }

        /* Nav tabs */

        /* Invert button */
        .btn-inv { transition: background .2s, color .2s; }
        .btn-inv:hover { background: var(--ink) !important; color: var(--bg) !important; }

        /* dvh fallback for iOS Safari address bar */
        .root-frame { height: 100vh; height: 100dvh; }

        .root-frame { --wall: 1.75rem; --strip: 2.6rem; }
        /* Scroll-open: text steps back as the windows grow into the frame */
        .panel { opacity: calc(1 - var(--open, 0)); pointer-events: auto; }
        .d-panel { opacity: 1; }
        /* Once the windows start opening, the whole frame is drawable: the text
           stops catching the cursor even before it has finished fading out. */
        .root-frame[data-open="1"] .panel { pointer-events: none !important; }
        .weather-tip { animation: fadeIn .18s ease both; }

        /* Small screens: canvas on top, panel flows below */
        /* Mobile: the animation is a tall sticky panel the copy scrolls over.
           No scroll-open gesture here, the page scrolls the way it should. */
        @media (max-width: 860px) {
          .root-frame  { overflow-y: auto !important; }
          .canvas-zone { flex: none !important; display: flex; flex-direction: column; }
          .canvas-zone > div:first-child {
            height: 38vh !important; height: 38dvh !important; max-height: 340px; flex: none;
            position: sticky; top: 0; z-index: 0;
          }
          .panel { position: relative !important; z-index: 1; }
          .pl-list a { font-size: 1.15rem !important; }
          .panel p   { font-size: 1.05rem !important; }
          .panel .ul { font-size: 0.9rem !important; }
          .windows { display: contents !important; }
          .windows > div:not(.panel) { display: none; }
          .panel { position: static !important; width: auto !important; flex: none !important; flex-direction: column !important; gap: 2rem !important; padding: 1.5rem 1.25rem 2rem !important; border: none !important; border-top: 1px solid var(--hairline) !important; box-shadow: none !important; }
          .panel > div { padding: 0 !important; height: auto !important; }
          .d-wrap { position: static !important; display: block !important; padding: 0 !important; }
          .d-top  { display: none; }
          .d-panel { flex: none !important; }
          .d-copy { flex-direction: column !important; align-items: flex-start !important; opacity: 1 !important; }
          .windows > div:not(.panel):has(.panel) { display: block; padding: 0 !important; box-shadow: none !important; }
          .panel .two-col { gap: 2rem !important; }
        }

        @media (max-width: 600px) {
          .canvas-zone > div:first-child { height: 32vh !important; height: 32dvh !important; max-height: 260px; }
          .nav-links   { display: none !important; }
        }

        @media (max-height: 560px) and (max-width: 860px) {
          .canvas-zone > div:first-child { height: 30vh !important; height: 30dvh !important; }
        }

        @media (max-width: 420px) {
          .name-strip  { padding: 0.4rem 1rem !important; gap: 0.5rem !important; }
          .ns-sub      { display: none !important; }
        }
      `}</style>

      {/* ── NAME STRIP ── */}
      <div className="name-strip" style={{ position: 'relative', zIndex: 310, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 1.75rem', borderBottom: '1px solid var(--hairline)', background: 'var(--bg)', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.85rem', minWidth: 0 }}>
          <h1 style={{ fontSize: 'clamp(0.95rem,1.5vw,1.15rem)', fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
            <TypewriterName text="DEFNE GENÇ" />
          </h1>
          <div className="ns-sub" style={{ fontSize: '0.86rem', lineHeight: 1.2, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Stanford CS / AI @ Coinbase / NYC
          </div>
        </div>
        {/* mark sits left of the toggle so the open row unfolds into empty strip
            rather than over the controls */}
        <div className="ns-seg" data-navopen={navOpen ? 1 : 0} style={{ display: 'flex', gap: '0.7rem', alignItems: 'center', flexShrink: 0 }}>
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <NavMenu open={navOpen} setOpen={setNavOpen} items={[
            { label: 'Home', href: '/' },
            { label: 'About', href: '/about' },
            { label: 'Résumé', href: '/resume' },
            { label: 'Research', href: 'https://arxiv.org/abs/2510.05449' },
          ]} />
        </div>
      </div>

      {/* One continuous canvas; each option arranges windows and text over it */}
      <div className="canvas-zone" style={{ position: 'relative', flex: 1, minHeight: 0, background: 'var(--bg)' }}
        onMouseDown={e => {
          const t = e.target as HTMLElement
          if (t.closest('.no-open') || t.closest('.panel')) return
          e.stopPropagation()
          setWxOpen(!wxOpen)
        }}
        onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`) }}
        onTouchMove={e => { const r = e.currentTarget.getBoundingClientRect(); const t = e.touches[0]; e.currentTarget.style.setProperty('--mx', `${t.clientX - r.left}px`); e.currentTarget.style.setProperty('--my', `${t.clientY - r.top}px`) }}
        onMouseLeave={e => { e.currentTarget.style.setProperty('--mx', '-999px'); e.currentTarget.style.setProperty('--my', '-999px') }}>
        <AsciiCanvas breathe={motion === 'breathe'} motion={motion} render={render} hover={hover} lightMode={isLight} chars='▓▒░' color={color ?? undefined}
          message={`Defne Genç. ${BIO} Work: ${PROJECTS.map(p => p.name + (p.award ? ` (${p.award}, ${p.awardNote.replace(/[()]/g, '')})` : '')).join(', ')}.`} />

        {/* field controls belong to the animation, not the nav */}
        <div className="no-open" style={{
          position: 'absolute', top: 'calc(var(--wall) + 0.7rem)', right: 'calc(var(--wall) + 0.7rem)',
          zIndex: 70, display: 'flex', alignItems: 'center', gap: '0.6rem',
          // waits its turn: the scroll cue leads, this follows once it retires
          opacity: cueGone ? 1 : 0, pointerEvents: cueGone ? 'auto' : 'none',
          transition: 'opacity .5s ease',
        }}>
          <WeatherControl override={wx} setOverride={setWx} live={live} place={sky?.place} open={wxOpen} setOpen={setWxOpen} />
        </div>

        {/* scroll cue: a small disc in the page ink, gone once the canvas opens */}
        <button className="scroll-cue no-open" aria-label="Scroll down"
          onClick={() => { setCueGone(true); setOpen(1) }}
          style={{ opacity: bioDone && !cueGone ? 1 : 0, pointerEvents: bioDone && !cueGone ? 'auto' : 'none' }}>
          Scroll
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="12" y1="4" x2="12" y2="19" /><polyline points="6 13 12 19 18 13" />
          </svg>
        </button>

        {/* the layout: 2×2 windows with the copy in the bottom-left cell */}
          <Windows cols={2} rows={2} content={{ '0,1': (
            /* same type scale as D: the cell is wider here, not the copy */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1.25rem 1.25rem 1.25rem 0', maxWidth: 640 }}>
              <About onDone={onBioDone} />
              <Work setContact={setContact} />
            </div>
          ) }} />

      </div>

      {/* ── CONTACT MODAL ── */}
      {contactOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setContact(false) }}
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: isLight ? 'rgba(244,242,236,0.92)' : 'rgba(10,10,10,0.92)', backdropFilter: 'blur(24px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ width: 'min(480px,90vw)', padding: '2.5rem', background: 'var(--bg)', border: '1px solid var(--hairline)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--ink)' }}>Get in touch</div>
              <button onClick={() => setContact(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--ink)' }}>
                Close
              </button>
            </div>
            {formSent ? (
              <div style={{ ...mono, fontSize: '0.85rem', color: 'var(--ink-dim)', padding: '2rem 0', textAlign: 'center' }}>Message sent. Talk soon.</div>
            ) : (
              <form onSubmit={handleSubmit}>
                {([{ label: 'Name', name: 'name', type: 'text', placeholder: 'Full name' }, { label: 'Email', name: 'email', type: 'email', placeholder: 'Your email' }]).map(f => (
                  <div key={f.name} style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.92rem', color: 'var(--ink)', marginBottom: '0.5rem' }}>{f.label}</label>
                    <input name={f.name} type={f.type} placeholder={f.placeholder} required
                      style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--hairline)', padding: '0.7rem 0', color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }} />
                  </div>
                ))}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.92rem', color: 'var(--ink)', marginBottom: '0.5rem' }}>Message</label>
                  <textarea name="message" placeholder="What's on your mind?" required rows={4}
                    style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--hairline)', padding: '0.7rem 0', color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', resize: 'none' }} />
                </div>
                <button type="submit"
                  style={{ width: '100%', background: 'var(--ink)', color: 'var(--bg)', border: 'none', borderRadius: 999, padding: '0.85rem 1rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
                  Send
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
