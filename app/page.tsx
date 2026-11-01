'use client'

import { useState, useEffect, useLayoutEffect, useRef, useCallback, createContext, useContext } from 'react'
import AsciiCanvas from '@/components/AsciiCanvas'
import ThemeToggle from '@/components/ThemeToggle'
import NavMenu from '@/components/NavMenu'
import { useTheme } from '@/components/useTheme'
import { useAmbient, LOOKS, periodOf, type Period, type Sky } from '@/components/ambient'
import WeatherControl, { type Override } from '@/components/WeatherControl'
import { IconStyleCtx } from '@/components/weatherIcons'
import { ABOUT_PARAS } from '@/components/aboutContent'
import AboutPara from '@/components/AboutPara'
import { CARDS, type Card } from '@/components/cards'
import { ITEMS, FOLDERS, PICTURES, picFile, dirName } from '@/components/fs'
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
  { name: 'Catching My Drift', kind: 'Web app',     year: '2026', href: '/project/mydrift',      sub: 'Speak a word dump and watch your thoughts fall into place' },
  { name: 'Learning Et Al.', kind: 'Website',       year: '2026', href: '/project/learningetal', sub: 'A daily research digest around a provocative question' },
  { name: 'Dishcovery',      kind: 'iOS app',       year: '2024', href: '/project/dishcovery',   sub: 'Recognise and cook with ingredients from anywhere' },
]

/* Tidbits: things I make for fun, mostly to be pretty. They sit under the
   projects as their own short list. */
const TIDBITS = [
  { name: 'Sponge OS', kind: 'Desktop kit', year: '2026', href: '/sponge/' },
  { name: 'Kilim',     kind: 'Web toy',     year: '2026', href: '/kilim/' },
]
// everything the list prints, in order; terminal mode types through it
const LIST: { name: string }[] = [...PROJECTS, ...TIDBITS]

const BIO = 'I think about how modern interfaces should (and fail to) meet our needs with exponentially growing agentic capabilities. BS, MS, and a deferred PhD admission from Stanford University, where I specialized in human-AI interaction. Now AI @ Coinbase, where I own the agent creation experience.'


const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' }


/* Phones, and tablets with no cursor, get the stacked layout. The windows and
   the scroll-open gesture only make sense with a mouse and a wheel. Kept in
   step with the media query in the page styles. */
const STACKED = '(max-width: 860px), (hover: none) and (pointer: coarse)'
const isStacked = () => window.matchMedia(STACKED).matches

const BIO_WORDS = BIO.split(' ')

/* The page reads as one terminal session inside Defne-Portfolio: the bio is
   a file you cat, the work is what ls prints. The folder's name sits once, in
   the bar; every prompt after it is just %. */
const HOME_DIR = 'Defne-Portfolio'
function Prompt({ cmd, className = '', typing = false }: { cmd: string; className?: string; typing?: boolean }) {
  return <div className={`bio-prompt ${className}`}><span>%</span> {cmd}{typing && <span className="bio-block" />}</div>
}

/* The retro cursor: the classic black arrow with a white edge, two screen
   pixels a cell, over anything you can click. */
const ARROW = [
  '#..........',
  '##.........',
  '#o#........',
  '#oo#.......',
  '#ooo#......',
  '#oooo#.....',
  '#ooooo#....',
  '#oooooo#...',
  '#ooooooo#..',
  '#oooooooo#.',
  '#ooooo#####',
  '#oo#oo#....',
  '#o#.#oo#...',
  '##..#oo#...',
  '#....#oo#..',
  '.....#oo#..',
  '......##...',
]
const ARROW_CURSOR = (() => {
  let d = ''
  ARROW.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch !== '.') d += `<rect x='${x * 2}' y='${y * 2}' width='2' height='2' fill='${ch === '#' ? '%23000' : '%23fff'}'/>`
  }))
  return `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='22' height='34' shape-rendering='crispEdges'>${d}</svg>") 1 1, pointer`
})()

/* Projects open a window on this page, so they carry a small window glyph.
   ↗ is kept for links that leave. */
function WinGlyph() {
  return (
    <svg className="win-glyph" width="13" height="11" viewBox="0 0 13 11" aria-hidden>
      <rect x="0.75" y="0.75" width="11.5" height="9.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect className="win-glyph-bar" x="0.75" y="0.75" width="11.5" height="3" fill="currentColor" />
    </svg>
  )
}

/* The bio decodes itself: dotted bars resolve word by word through a band of
   scrambling glyphs. */
const GLYPHS = '░▒▓#%&*+=/<>'
const scramble = (len: number) => Array.from({ length: len }, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join('')

function DecodeBio({ style, onDone, text = BIO, step = 60 }: { style: React.CSSProperties; onDone?: () => void; text?: string; step?: number }) {
  const BAND = 4
  const words = text.split(' ')
  // starts a full band before the first word, so the server render (and the
  // first client render) has no random glyphs in it to disagree about
  const [r, setR] = useState(-BAND)   // words fully resolved
  useEffect(() => {
    if (r >= words.length) { onDone?.(); return }
    const id = setTimeout(() => setR(v => v + 1), r < 0 ? 90 : step)
    return () => clearTimeout(id)
  }, [r, onDone, words.length, step])
  // re-roll the glyphs between steps too, so the band shimmers
  const [, setTick] = useState(0)
  useEffect(() => {
    if (r >= words.length) return
    const id = setInterval(() => setTick(t => t + 1), 40)
    return () => clearInterval(id)
  }, [r])
  return (
    <p style={style}>
      {words.map((w, i) => i < r
        ? <span key={i} className="bio-w">{w}</span>
        : i < r + BAND
          ? <span key={i} className="bio-w bio-scr"><span style={{ color: 'transparent' }}>{w}</span><span className="bio-scr-g">{scramble(w.length + 1)}</span></span>
          : <span key={i} className="bio-w bio-dev">{w}</span>)}
    </p>
  )
}

const slugOf = (href: string) => href.replace(/^\/project\//, '').replace(/\//g, '')

function CardBody({ card, meta }: { card: Card; meta?: string }) {
  return (
    <div className="card">
      {meta && <div className="card-meta">{meta}</div>}
      {card.image && <img className="card-img" src={card.image} alt="" />}
      <p className="card-text">{card.text}</p>
      {card.points && <ul className="card-points">{card.points.map(t => <li key={t}>{t}</li>)}</ul>}
      <a className="card-link" href={card.link.href} target={card.link.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" style={{ ['--accent' as string]: card.accent }}>{card.link.label} ↗</a>
    </div>
  )
}

// the year and kind of a project, for the top of its window
const metaOf = (slug: string) => {
  const p = [...PROJECTS, ...TIDBITS].find(x => slugOf(x.href) === slug) as { year: string; kind: string; award?: string } | undefined
  return p ? [p.year, p.kind, p.award].filter(Boolean).join(' · ') : undefined
}

// clicking a project opens it in place when a handler is set
const OpenCtx = createContext<((slug: string, el: Element) => void) | null>(null)

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

// the work as ls output: projects, then tidbits, or one of the two
type Part = 'both' | 'projects' | 'tidbits'
const nameStyle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 500, letterSpacing: '-0.01em' }
/* How the project names are set, picked with ?n= while we compare.
   display  the display face at list size (the current one)
   mono     the same list in mono, like the prompts above it
   ls       a dated listing: the year, then the name as a folder
   buttons  Xerox Star command buttons: small rounded boxes that invert
   (desktop icons live in the Star view, not here: no GUI in the terminal) */
type NameStyle = 'display' | 'mono' | 'ls' | 'buttons'
const NAME_STYLES: { key: NameStyle; label: string }[] = [
  { key: 'display', label: 'Display' }, { key: 'mono', label: 'Mono' }, { key: 'ls', label: 'Dated' },
  { key: 'buttons', label: 'Star buttons' },
]
const NameCtx = createContext<NameStyle>('display')


type Item = { name: string; href: string; year: string; award?: string; awardNote?: string }
function Names({ items, click }: { items: Item[]; click: (href: string) => (e: React.MouseEvent) => void }) {
  const style = useContext(NameCtx)
  const open = useContext(OpenCtx)
  const award = (p: Item) => p.award && <span className="award nm-award">{p.award} {p.awardNote}</span>
  if (style === 'ls') return (
    <div className="nm-ls">
      {items.map(p => (
        <a key={p.name} href={p.href} onClick={click(p.href)} className="nm-ls-row">
          <span className="nm-ls-year">{p.year}</span>
          <span><span className="nm-ls-name">{p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}/</span>{p.award && <span className="nm-star" title={`${p.award} ${p.awardNote}`}> ★</span>}</span>
        </a>
      ))}
    </div>
  )
  if (style === 'buttons') return (
    <div className="nm-buttons">
      {items.map(p => <a key={p.name} href={p.href} onClick={click(p.href)} className="nm-button">{p.name}{p.award && <span className="nm-star" title={`${p.award} ${p.awardNote}`}>★</span>}</a>)}
    </div>
  )
  return (
    <div className="pl-list">
      {items.map(p => (
        <a key={p.name} href={p.href} onClick={click(p.href)} className={style === 'mono' ? 'pl nm-mono' : 'pl'} style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={style === 'mono' ? undefined : nameStyle}>{p.name}</span>
          {p.award && <span className="award" style={{ fontSize: '0.88rem', whiteSpace: 'nowrap' }}>{p.award} <span>{p.awardNote}</span></span>}
        </a>
      ))}
    </div>
  )
}

function NamePrompt({ cmd, className = '' }: { cmd: string; className?: string }) {
  const style = useContext(NameCtx)
  return <Prompt cmd={cmd} className={className} />
}

function Work({ part = 'both' }: { part?: Part }) {
  const open = useContext(OpenCtx)
  const click = (href: string) => (e: React.MouseEvent) => { if (open) { e.preventDefault(); open(slugOf(href), e.currentTarget) } }
  return (
    <div>
      {part !== 'tidbits' && <>
        <NamePrompt cmd="ls projects" />
        <Names items={PROJECTS} click={click} />
      </>}
      {part !== 'projects' && <>
        <NamePrompt cmd="ls tidbits" className={part === 'tidbits' ? '' : 'ls-second'} />
        <Names items={TIDBITS} click={click} />
      </>}
    </div>
  )
}

const BIO_SIZE = 'clamp(1.08rem, 1.35vw, 1.26rem)'
/* How much of a block's text is left while it's being deleted (1 = all of
   it). Leaving a view deletes its text fast from the end, like holding
   backspace, before the next command runs. */
const kept = (text: string, left: number) => text.slice(0, Math.round(text.length * left))
const TEXT_STYLE: React.CSSProperties = { fontSize: BIO_SIZE, lineHeight: 1.65, color: 'var(--ink)' }

function About({ onDone, typed, left = 1 }: { onDone?: () => void; typed?: string | null; left?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <Prompt cmd={typed ?? 'cat my-spiel'} typing={typed != null} className="bio-head" />
      {left < 1
        ? <p style={TEXT_STYLE}>{kept(BIO, left)}<span className="bio-block" /></p>
        : <DecodeBio onDone={onDone} style={TEXT_STYLE} />}
    </div>
  )
}

/* About me, opened in place: the same session, one more cat. */
const ABOUT_PLAIN = ABOUT_PARAS.map(t => t.replace(/[[\]]/g, ''))
const ABOUT_TOTAL = ABOUT_PLAIN.reduce((a, t) => a + t.length, 0)

function AboutText({ onBack, typed, left = 1 }: { onBack: () => void; cols?: boolean; typed?: string | null; left?: number }) {
  // the same as the spiel: one column, the same size, decoding in
  let budget = Math.round(ABOUT_TOTAL * left)
  return (
    <div className="about-tile">
      <div className="about-top">
        <Prompt cmd={typed ?? 'cat about-me'} typing={typed != null} className="bio-head" />
        <a className="back-link" href="/" onClick={e => { e.preventDefault(); onBack() }}>Back</a>
      </div>
      <div className="about-paras">
        {left < 1
          ? ABOUT_PLAIN.map((t, i) => {
              const n = Math.max(0, Math.min(t.length, budget)); budget -= t.length
              return n > 0 ? <p key={i} style={TEXT_STYLE}>{t.slice(0, n)}{budget <= 0 && <span className="bio-block" />}</p> : null
            })
          : ABOUT_PLAIN.map((t, i) => <DecodeBio key={i} text={t} step={14} style={TEXT_STYLE} />)}
      </div>
    </div>
  )
}

/* Layouts. Live is the 2×2 of windows with the copy in the bottom-left;
   Centre and Stack are one group in the middle of the screen, a row of links
   over the field and the text under it. Picked with ?v=. */
type Variant = 'live' | 'centre' | 'stack'
const VARIANTS: { key: Variant; label: string }[] = [
  { key: 'live', label: 'Live' },
  { key: 'centre', label: 'Centre' },
  { key: 'stack', label: 'Stack' },
]
const CENTRED = (v: Variant) => v !== 'live'

/* Each layout places cells on a grid; 'text' marks a cell with a solid
   background holding that block, every other cell is a window onto the field.
   The one window in the centred layouts is 'main', so the scroll can grow it. */
type CellText = 'copy' | 'about' | 'blank' | 'bar' | 'shell' | 'clists' | 'cbio' | 'cproj' | 'ctid' | 'cwork' | 'cabout'
type Cell = { c: number; r: number; cs?: number; rs?: number; text?: CellText; main?: boolean }
type Layout = { cols: number; colSizes?: string; rows: string; cells: Cell[] }
type View = 'home' | 'about'

// the centred group never grows past this, so wide screens keep it together
const GROUP = '1fr minmax(0, 540px) minmax(0, 540px) 1fr'
const frame = (rows: string, body: Cell[], last: number): Layout => ({ cols: 4, colSizes: GROUP, rows, cells: [
  { c: 0, r: 0, cs: 4, text: 'blank' },
  { c: 0, r: 1, rs: last - 1, text: 'blank' }, { c: 1, r: 1, cs: 2, text: 'bar' }, { c: 3, r: 1, rs: last - 1, text: 'blank' },
  { c: 1, r: 2, cs: 2, main: true },
  ...body,
  { c: 1, r: last - 1, cs: 2, text: 'shell' },
  { c: 0, r: last, cs: 4, text: 'blank' },
] })

/* The window is a fixed height and the group hangs from the top, so swapping
   the spiel for About never moves the field or the first line of text. */
const TOP = 'clamp(0.5rem,4vh,3rem)'
const MAIN = 'clamp(140px,26vh,320px)'

const LAYOUTS: Record<Variant, Record<View, Layout>> = {
  live: {
    home:  { cols: 2, rows: '1fr 1fr', cells: [{ c: 0, r: 0 }, { c: 1, r: 0 }, { c: 0, r: 1, text: 'copy' }, { c: 1, r: 1 }] },
    // About takes the whole right column, so it reads at full size
    about: { cols: 2, rows: '1fr 1fr', cells: [{ c: 0, r: 0 }, { c: 1, r: 0, rs: 2, text: 'about' }, { c: 0, r: 1 }] },
  },
  // the bio and the work side by side under the field
  centre: {
    home:  frame(`${TOP} auto ${MAIN} auto auto 1fr`, [{ c: 1, r: 3, text: 'cbio' }, { c: 2, r: 3, text: 'cwork' }], 5),
    about: frame(`${TOP} auto ${MAIN} auto auto 1fr`, [{ c: 1, r: 3, cs: 2, text: 'cabout' }], 5),
  },
  // the bio across the full width, then the two lists side by side
  stack: {
    // the two lists share one cell, so they always sit at the same size
    home:  frame(`${TOP} auto ${MAIN} auto auto auto 1fr`, [{ c: 1, r: 3, cs: 2, text: 'cbio' }, { c: 1, r: 4, cs: 2, text: 'clists' }], 6),
    about: frame(`${TOP} auto ${MAIN} auto auto auto 1fr`, [{ c: 1, r: 3, cs: 2, rs: 2, text: 'cabout' }], 6),
  },
}



/* Fit: the copy never scrolls inside its window. If the block is taller than
   the cell it is zoomed down until it fits, never below 80%, which keeps the
   bio at a comfortable reading size. The bio reserves its final size from the
   first frame, so this only has to measure on layout changes. */
function Fit({ children, deps }: { children: React.ReactNode; deps: unknown[] }) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    const cell = el?.parentElement
    if (!el || !cell) return
    const fit = () => {
      const s = el.style as CSSStyleDeclaration & { zoom: string }
      s.zoom = '1'
      if (isStacked()) return
      const room = cell.clientHeight
      if (el.getBoundingClientRect().height <= room) return
      let lo = 0.8, hi = 1
      for (let i = 0; i < 7; i++) {
        const k = (lo + hi) / 2
        s.zoom = String(k)
        if (el.getBoundingClientRect().height <= room) lo = k; else hi = k
      }
      s.zoom = String(lo)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(cell)
    document.fonts?.ready.then(fit)
    return () => ro.disconnect()
  }, deps)   // eslint-disable-line react-hooks/exhaustive-deps
  return <div ref={ref}>{children}</div>
}

/* GridWindows: a grid of see-through cells over one continuous canvas. Walls
   are drawn with box-shadow so the gaps and outer margin read as solid
   background; a text cell is solid, every other cell is a window. */
function GridWindows({ layout, content, mainChild }: { layout: Layout; content: Partial<Record<CellText, React.ReactNode>>; mainChild?: React.ReactNode }) {
  const wall = '0 0 0 var(--wall) var(--bg)'
  return (
    <div className="windows" style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: layout.colSizes ?? `repeat(${layout.cols}, 1fr)`, gridTemplateRows: layout.rows.split(' ').map(r => (r.endsWith('fr') ? `minmax(0, ${r})` : r)).join(' '), gap: 'var(--wall)', padding: 'var(--wall)', pointerEvents: 'none' }}>
      {layout.cells.map(c => {
        const place: React.CSSProperties = { gridColumn: `${c.c + 1} / span ${c.cs ?? 1}`, gridRow: `${c.r + 1} / span ${c.rs ?? 1}`, boxShadow: wall }
        const key = `${c.text ?? 'win'}-${c.c}-${c.r}`
        if (!c.text) return <div key={key} data-main={c.main ? 1 : undefined} style={{ ...place, position: 'relative' }}>{c.main && mainChild}</div>
        const cls = c.text === 'blank' ? 'panel blank scrollbar-none' : c.text === 'bar' ? 'panel bar' : 'panel scrollbar-none'
        return (
          <div key={key} className={cls} style={{ ...place, position: 'relative', background: 'var(--bg)', overflowY: 'auto', minWidth: 0, minHeight: 0 }}>
            {c.text === 'bar' || c.text === 'shell' || c.text === 'cabout' ? content[c.text] : <Fit deps={[layout]}>{content[c.text]}</Fit>}
          </div>
        )
      })}
    </div>
  )
}

/* The shell: a live prompt under the text. Type, or just start typing
   anywhere on the page, and press Enter. */
type ShellApi = {
  view: View; goTo: (to: View) => void; setTheme: (t: 'light' | 'dark') => void
  openContact: () => void; openProject: (slug: string) => void
  weather: { place: string | null; period: Period; sky: Sky } | null
}

/* curl wttr.in, the real way people check the weather in a terminal: a
   little report of the sky the field is drawing. */
const WTTR: Record<Sky, string[]> = {
  clear: ['    \\   /    ', '     .-.     ', '  ― (   ) ―  ', '     `-’     ', '    /   \\    '],
  cloud: ['             ', '     .--.    ', '  .-(    ).  ', ' (___.__)__) ', '             '],
  rain:  ['     .-.     ', '    (   ).   ', '   (___(__)  ', '    ‘ ‘ ‘ ‘  ', '   ‘ ‘ ‘ ‘   '],
  snow:  ['     .-.     ', '    (   ).   ', '   (___(__)  ', '    *  *  *  ', '   *  *  *   '],
  fog:   ['             ', ' _ - _ - _ - ', '  _ - _ - _  ', ' _ - _ - _ - ', '             '],
  storm: ['     .-.     ', '    (   ).   ', '   (___(__)  ', '    ⚡‘ ‘⚡‘  ', '    ‘ ‘ ‘ ‘  '],
  wind:  ['             ', '  ~~~~~~~>   ', '    ~~~~~~>  ', '  ~~~~~>     ', '             '],
}
const SKY_WORD: Record<Sky, string> = { clear: 'Clear', cloud: 'Overcast', rain: 'Rain', snow: 'Snow', fog: 'Fog', storm: 'Thunderstorm', wind: 'Windy' }
function wttr(w: ShellApi['weather']) {
  if (!w) return 'curl: (7) Failed to connect to wttr.in: still looking up your weather'
  const art = WTTR[w.sky]
  const info = [SKY_WORD[w.sky], w.period === 'late' ? 'late night' : w.period, '', 'the field above is drawing this']
  return <pre className="wttr">{`Weather report: ${w.place ?? 'your area'}\n\n`}{art.map((l, i) => `${l}  ${info[i] ?? ''}`).join('\n')}</pre>
}

// what Tab can complete, by command
const COMMANDS = ['cat', 'cd', 'ls', 'open', 'imgcat', 'startx', 'caffeinate', 'pmset', 'curl', 'mail', 'clear', 'help', 'whoami', 'date', 'echo', 'pwd']
const ITEM_NAMES = [...PROJECTS, ...TIDBITS].map(p => p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, ''))
const ARGS: Record<string, string[]> = {
  cat: ['about-me', 'my-spiel'], cd: ['..'], ls: ['projects', 'tidbits', '-a'], open: ITEM_NAMES,
  caffeinate: ['-d'], pmset: ['displaysleepnow'], curl: ['wttr.in'],
}
function complete(text: string, cwd: Path = []): { text: string; options?: string[] } {
  const parts = text.split(' ')
  const word = parts[parts.length - 1]
  // file arguments complete from the folder you're in
  const here = listing(cwd) ?? []
  const fileArgs: Record<string, string[]> = {
    cd: ['..', ...here.filter(x => x.endsWith('/'))],
    ls: here, cat: here.filter(x => !x.endsWith('/')), imgcat: here.filter(x => x.endsWith('.png')), open: ['.', ...here, ...(ARGS.open ?? [])],
  }
  const pool = parts.length === 1 ? COMMANDS : fileArgs[parts[0]] ?? ARGS[parts[0]] ?? []
  const hits = pool.filter(x => x.startsWith(word))
  if (!hits.length) return { text }
  let common = hits[0]
  for (const h of hits) while (!h.startsWith(common)) common = common.slice(0, -1)
  const done = hits.length === 1
  parts[parts.length - 1] = done ? hits[0] + ' ' : common
  return { text: parts.join(' '), options: done ? undefined : hits }
}
const HELP: [string, string][] = [
  ['cat about-me', 'read about me'],
  ['cat my-spiel', 'back to the start'],
  ['ls', 'what\u2019s in this folder'],
  ['cd projects', 'go into a folder (cd .. to go back up)'],
  ['cat description.txt', 'read a project, inside its folder'],
  ['imgcat overview.png', 'show a picture, inside a project\u2019s folder'],
  ['open .', 'see this folder on the desktop, the GUI'],
  ['open bloom', 'open a project (any name)'],
  ['caffeinate -d', 'light mode'],
  ['pmset displaysleepnow', 'dark mode'],
  ['curl wttr.in', 'the weather the field is drawing'],
  ['tab', 'finish a command for you'],
  ['mail', 'write to me'],
  ['clear', 'clear this'],
]
/* The same files the desktop (/star) shows, walked as a terminal:
   ~               projects/  tidbits/  my-spiel  about-me
   ~/projects      one folder per project
   ~/projects/x    description.txt, site.url, papers
   ~/tidbits       one file per tidbit */
type Path = string[]
const DIRS = ITEMS.filter(i => i.kind === 'folder').map(i => ({ id: i.id, dir: dirName(i.id, CARDS[i.id].title) }))
const TIDS = ITEMS.filter(i => i.kind !== 'folder').map(i => ({ id: i.id, file: dirName(i.id, CARDS[i.id].title) }))
const idOfDir = (d: string) => DIRS.find(x => x.dir === d)?.id
function listing(p: Path): string[] | null {
  if (p.length === 0) return ['projects/', 'tidbits/', 'my-spiel', 'about-me']
  if (p.length === 1 && p[0] === 'projects') return DIRS.map(x => x.dir + '/')
  if (p.length === 1 && p[0] === 'tidbits') return TIDS.map(x => x.file)
  if (p.length === 2 && p[0] === 'projects') { const id = idOfDir(p[1]); return id ? [...FOLDERS[id].map(e => e.file), ...(PICTURES[id] ?? []).map(([src]) => picFile(src))] : null }
  return null
}
// where a path points from here, or null if it isn't a folder
function resolve(cwd: Path, arg: string): Path | null {
  let p: Path = arg.startsWith('/') || arg.startsWith('~') ? [] : [...cwd]
  for (const part of arg.replace(/^~\/?|^\//, '').split('/').filter(Boolean)) {
    if (part === '.') continue
    if (part === '..') { p = p.slice(0, -1); continue }
    p = [...p, part]
    if (!listing(p)) return null
  }
  return p
}
// a project's description, printed the way cat prints a file
const catDesc = (id: string) => {
  const c = CARDS[id]
  const pic = PICTURES[id]?.[0]
  return <div className="cat-doc">{pic && <img className="cat-img" src={pic[0]} alt={pic[1]} />}<p>{c.text}</p>{c.points?.map(t => <p key={t}>- {t}</p>)}<p>{c.link.href}</p></div>
}
// imgcat, the way iTerm prints a picture into the terminal
const imgcat = (src: string, cap: string) => <div className="cat-doc"><img className="cat-img" src={src} alt={cap} /><p>{cap}</p></div>
const findPic = (dir: Path, file: string) => {
  const id = dir[0] === 'projects' && dir[1] ? idOfDir(dir[1]) : undefined
  return id ? PICTURES[id]?.find(([src]) => picFile(src) === file) : undefined
}
const showPath = (p: Path) => (p.length ? `~/${p.join('/')}` : '~')
const toGui = (p: Path) => { location.href = `/star${p.length ? `?open=${p.join('/')}` : ''}` }

function runCommand(raw: string, api: ShellApi, cwd: Path = [], cd: (p: Path) => void = () => {}): React.ReactNode {
  const cmd = raw.trim().replace(/\s+/g, ' ')
  const [name, ...args] = cmd.split(' ')
  const arg = args.join(' ').toLowerCase()
  const find = (q: string) => [...PROJECTS, ...TIDBITS].find(p => p.name.toLowerCase().replace(/[^a-z]/g, '').startsWith(q.replace(/[^a-z]/g, '')))
  switch (name) {
    case '': return ''
    case 'help': case 'man':
      return <div className="help">{HELP.map(([c, d]) => <div key={c}><span className="help-cmd">{c}</span><span>{d}</span></div>)}</div>
    case 'cat': {
      const slash = arg.lastIndexOf('/')
      const dir = slash >= 0 ? resolve(cwd, arg.slice(0, slash) || '/') : cwd
      const file = arg.slice(slash + 1)
      if (!dir) return `cat: ${arg}: No such file or directory`
      const at = dir.length === 0
      if (at && (file === 'about-me' || file === 'about')) { api.goTo('about'); return '' }
      if (at && (file === 'my-spiel' || file === 'spiel')) { api.goTo('home'); return '' }
      const id = dir[0] === 'projects' && dir[1] ? idOfDir(dir[1]) : undefined
      const e = id && FOLDERS[id].find(x => x.file === file)
      if (e && id && e.kind === 'doc') return catDesc(id)
      const pc = findPic(dir, file)
      if (pc) return 'cat: binary file. Try imgcat ' + file
      if (e && e.href) return e.href
      return `cat: ${arg || '?'}: No such file or directory`
    }
    case 'cd': case 'cd..': {
      const target = name === 'cd..' ? '..' : arg
      // cd .. from About goes back up to the spiel
      if ((!target || target === '..' || target === '~') && cwd.length === 0) { if (api.view === 'about') api.goTo('home'); return '' }
      if (!target || target === '~' || target === '/') { cd([]); return '' }
      const p = resolve(cwd, target)
      if (!p) return `cd: no such file or directory: ${target}`
      cd(p); return ''
    }
    case 'ls': {
      if (arg === '-a') return ['.', '..', ...(cwd.length ? [] : ['.secret']), ...(listing(cwd) ?? [])].join('  ')
      const p = arg ? resolve(cwd, arg) : cwd
      const l = p && listing(p)
      return l ? l.join('  ') : `ls: ${arg}: No such file or directory`
    }
    case 'imgcat': {
      const slash = arg.lastIndexOf('/')
      const dir = slash >= 0 ? resolve(cwd, arg.slice(0, slash) || '/') : cwd
      const pc = dir && findPic(dir, arg.slice(slash + 1))
      return pc ? imgcat(pc[0], pc[1]) : `imgcat: ${arg || '?'}: No such file`
    }
    case 'startx': case 'gui': toGui(cwd); return ''
    case 'open': {
      // open . opens this folder on the desktop, the GUI
      if (arg === '.') { toGui(cwd); return '' }
      const here = cwd[0] === 'projects' && cwd[1] ? idOfDir(cwd[1]) : undefined
      const e = here && FOLDERS[here].find(x => x.file === arg)
      const hp = findPic(cwd, arg)
      if (hp) return imgcat(hp[0], hp[1])
      if (e && here) { if (e.kind === 'doc') return catDesc(here); if (e.href) window.open(e.href, '_blank'); return '' }
      const tid = arg.startsWith('~/tidbits/') && TIDS.find(x => x.file === arg.slice(10))
      if (tid) { window.open(CARDS[tid.id].link.href, '_blank'); return '' }
      const p = arg && find(arg)
      if (p) {
        const id = slugOf(p.href)
        // a tidbit is an app: open runs it. A project prints its description.
        if (FOLDERS[id]) return catDesc(id)
        window.open(p.href, '_blank'); return ''
      }
      return `The file ${arg || '?'} does not exist.`
    }
    case 'caffeinate': api.setTheme('light'); return 'display awake'
    case 'pmset': case 'sleep': api.setTheme('dark'); return 'display asleep'
    case 'weather': return wttr(api.weather)
    case 'curl':
      if (arg.startsWith('wttr.in')) return wttr(api.weather)
      return arg ? `curl: (6) Could not resolve host: ${arg}` : 'curl: try \u2018curl wttr.in\u2019'
    case 'mail': case 'email': api.openContact(); return ''
    case 'whoami': return 'defne'
    case 'pwd': return `/Users/defne/${HOME_DIR}${cwd.length ? '/' + cwd.join('/') : ''}`
    case 'date': return new Date().toString().slice(0, 24)
    case 'sudo': return 'defne is not in the sudoers file. This incident will be reported.'
    case 'echo': return args.join(' ')
    default: return `zsh: command not found: ${name}`
  }
}

function Shell({ api, runRef }: { api: ShellApi; runRef?: React.MutableRefObject<((cmd: string) => void) | null> }) {
  const [text, setText] = useState('')
  const [out, setOut] = useState<React.ReactNode>('type help · tab finishes a command')
  const [cwd, setCwd] = useState<Path>([])
  const hist = useRef<string[]>([])
  const at = useRef(0)
  const input = useRef<HTMLInputElement>(null)
  // typing anywhere on the page lands here, unless another field has focus
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('input, textarea') || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key.length === 1) { input.current?.focus() }
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])
  const submit = (cmd = text) => {
    const r = runCommand(cmd, api, cwd, setCwd)
    if (cmd.trim()) { hist.current.push(cmd); at.current = hist.current.length }
    setOut(cmd.trim() === 'clear' ? '' : r)
    setText('')
  }
  // lets a click type a command here, a key at a time, then run it
  const apiRef = useRef(api)
  apiRef.current = api
  const cwdRef = useRef(cwd)
  cwdRef.current = cwd
  useEffect(() => {
    if (!runRef) return
    let t = 0
    runRef.current = (cmd: string) => {
      let i = 0
      const step = () => {
        i += 1
        setText(cmd.slice(0, i))
        if (i < cmd.length) { t = window.setTimeout(step, 38); return }
        t = window.setTimeout(() => {
          setOut(runCommand(cmd, apiRef.current, cwdRef.current, setCwd)); hist.current.push(cmd); at.current = hist.current.length; setText('')
        }, 180)
      }
      window.clearTimeout(t); step()
    }
    return () => { window.clearTimeout(t); if (runRef.current) runRef.current = null }
  }, [runRef])
  return (
    <div className="shell" onClick={() => input.current?.focus()}>
      {/* one line of output sits above the prompt; anything longer opens in a
          box over the page, so the layout never moves. Esc closes it. */}
      {out && (typeof out === 'string' && out.length < 110
        ? <div className="shell-out">{out}</div>
        : <div className="shell-out shell-pop" onClick={e => e.stopPropagation()}>
            <button className="shell-pop-x" aria-label="Close" onClick={() => setOut('')}>
              <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden><path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" /></svg>
            </button>
            {out}
          </div>)}
      {(!out || typeof out !== 'string' || out.length >= 110) && <div className="shell-out" aria-hidden>&nbsp;</div>}
      <label className="bio-prompt shell-line">
        <span>{cwd.length ? `${showPath(cwd)} %` : '%'}</span> {text}<span className="bio-block shell-caret" />
        <input ref={input} className="shell-input" value={text} aria-label="Type a command" spellCheck={false} autoCapitalize="off" autoComplete="off"
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') submit()
            else if (e.key === 'Tab') {
              e.preventDefault()
              const r = complete(text, cwd)
              setText(r.text)
              if (r.options) setOut(r.options.join('  '))
            }
            else if (e.key === 'ArrowUp') { at.current = Math.max(0, at.current - 1); setText(hist.current[at.current] ?? '') ; e.preventDefault() }
            else if (e.key === 'ArrowDown') { at.current = Math.min(hist.current.length, at.current + 1); setText(hist.current[at.current] ?? ''); e.preventDefault() }
            else if (e.key === 'Escape') { setOut(''); input.current?.blur() }
          }} />
      </label>
    </div>
  )
}

/* A window over the field, like an early Mac: a plain title bar, a close box
   with an X, a hard shadow. It drags by its title bar. */
function RetroWindow({ title, accent, n, z, onClose, onFocus, initSize, flush = false, children }: {
  title: string; accent: string; n: number; z: number
  onClose: () => void; onFocus: () => void; initSize?: { w: number; h: number }; flush?: boolean; children: React.ReactNode
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState<{ w: number; h: number } | null>(initSize ?? null)
  const ref = useRef<HTMLDivElement>(null)
  /* the grow box, bottom right, like an early Mac. The window is centred on
     its left edge, so half the extra width goes into the position to keep the
     top-left corner still while you drag. */
  const grow = (e: React.PointerEvent) => {
    e.stopPropagation(); e.preventDefault(); onFocus()
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const sx = e.clientX, sy = e.clientY, p0 = pos
    const move = (ev: PointerEvent) => {
      const w = Math.max(300, r.width + ev.clientX - sx), h = Math.max(200, r.height + ev.clientY - sy)
      setSize({ w, h }); setPos({ x: p0.x + (w - r.width) / 2, y: p0.y })
    }
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
  }
  const drag = (e: React.PointerEvent) => {
    onFocus()
    const sx = e.clientX - pos.x, sy = e.clientY - pos.y
    const move = (ev: PointerEvent) => setPos({ x: ev.clientX - sx, y: ev.clientY - sy })
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
  }
  return (
    <div ref={ref} className="retro-win no-open" onPointerDown={onFocus}
      style={{ ...(size ? { width: size.w, height: size.h, maxHeight: 'none' } : {}), zIndex: 80 + z, top: `calc(12% + ${n * 28}px)`, left: `calc(50% + ${n * 28}px)`, transform: `translate(calc(-50% + ${pos.x}px), ${pos.y}px)`, ['--accent' as string]: accent }}>
      <div className="retro-title" onPointerDown={drag}>
        <button className="retro-close" aria-label={`Close ${title}`} onClick={onClose} onPointerDown={e => e.stopPropagation()}>
          <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden><path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" /></svg>
        </button>
        <span>{title}</span>
      </div>
      <div className={flush ? 'retro-body retro-flush' : 'retro-body'}>{children}</div>
      <div className="retro-grow" onPointerDown={grow} aria-hidden>
        <svg width="11" height="11" viewBox="0 0 11 11"><path d="M10 1L1 10M10 5L5 10M10 9L9 10" stroke="currentColor" strokeWidth="1.2" /></svg>
      </div>
    </div>
  )
}

// the way into the desktop view, a nod to the Xerox Star
function StarCredit() {
  return (
    <p className="star-credit">
      <a href="/star">An ode to early interfaces →</a>
    </p>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [navOpen, setNavOpen]     = useState(false)
  const [contactOpen, setContact] = useState(false)
  const [formSent, setFormSent]   = useState(false)
  const [theme, setTheme]         = useTheme('light')
  // 0 = windows at rest, 1 = walls gone and the animation fills the frame
  const [open, setOpen]           = useState(0)

  // When an ambient mode is on it drives the field; the picker still shows the
  // hand-set values so switching back is where you left off.
  const { ambient, sky } = useAmbient('weather')

  // The ⓘ control can pin a cell of the matrix; otherwise the live reading wins,
  // and the hand picker is the fallback when ambient mode is off.
  const [wx, setWx] = useState<Override>(null)
  const [wxOpen, setWxOpen] = useState(false)
  const [full, setFull] = useState(false)
  const [variant, setVariant] = useState<Variant>('stack')
  const [isLocal, setIsLocal] = useState(false)
  // the local switcher folds to one button so it doesn't sit on the copy
  const [switchOpen, setSwitchOpen] = useState(false)
  // About opens in place, or as a window over the field in the window style
  const [view, setView] = useState<View>('home')
  const [icons, setIcons] = useState<'line' | 'classic'>('line')
  const [names, setNames] = useState<NameStyle>('mono')
  /* Windows over the field: About and the projects. Each keeps its own
     stacking order; a new one opens a step down and right of the last. */
  const [wins, setWins] = useState<{ id: string; from: DOMRect | null; z: number; n: number }[]>([])
  const zTop = useRef(0)
  const openWin = useCallback((id: string, el?: Element | null) => {
    zTop.current += 1
    const z = zTop.current
    setWins(ws => ws.some(w => w.id === id)
      ? ws.map(w => (w.id === id ? { ...w, z } : w))
      : [...ws, { id, from: el ? el.getBoundingClientRect() : null, z, n: ws.length % 6 }])
  }, [])
  const closeWin = useCallback((id: string) => setWins(ws => ws.filter(w => w.id !== id)), [])
  const focusWin = (id: string) => { zTop.current += 1; const z = zTop.current; setWins(ws => ws.map(w => (w.id === id ? { ...w, z } : w))) }
  const winsRef = useRef(wins)
  winsRef.current = wins
  // the shell types a command when a project is clicked in terminal mode
  const shellRun = useRef<((cmd: string) => void) | null>(null)
  const pendingFrom = useRef<Element | null>(null)
  /* Clicking About: the prompt over the spiel backspaces "cat my-spiel",
     types "cat about-me", and on Enter About is shown where the spiel was.
     Back does the reverse. Typed in the shell, it just switches. */
  const [typed, setTyped] = useState<{ text: string; on: View } | null>(null)
  const [left, setLeft] = useState<{ on: View; v: number } | null>(null)
  const typing = useRef(false)
  const typeTimer = useRef(0)
  const goTo = useCallback((to: View, viaShell = false) => {
    const cur = viewRef.current
    if (to === cur || typing.current) return
    if (viaShell || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setView(to); return }
    typing.current = true
    // 1. delete the text on screen, fast, from the end
    const t0 = performance.now(), ERASE = 320
    const erase = () => {
      const p = Math.min(1, (performance.now() - t0) / ERASE)
      setLeft({ on: cur, v: 1 - p })
      if (p < 1) { typeTimer.current = window.setTimeout(erase, 16); return }
      retype()
    }
    // 2. then the prompt: backspace the command, type the new one, Enter
    const from = cur === 'home' ? 'cat my-spiel' : 'cat about-me'
    const target = to === 'about' ? 'cat about-me' : 'cat my-spiel'
    const frames: string[] = []
    for (let i = from.length - 1; i >= 0; i--) frames.push(from.slice(0, i))
    for (let i = 1; i <= target.length; i++) frames.push(target.slice(0, i))
    let k = 0
    const retype = () => {
      if (k < frames.length) {
        setTyped({ text: frames[k], on: cur })
        typeTimer.current = window.setTimeout(retype, k < from.length ? 14 : 32)
        k += 1
        return
      }
      // a beat on the finished command, as if Enter was pressed
      typeTimer.current = window.setTimeout(() => { setView(to); setTyped(null); setLeft(null); typing.current = false }, 160)
    }
    erase()
  }, [])
  const leftFor = (block: View) => (left?.on === block ? left.v : 1)
  // the lists go with the spiel, a line at a time from the bottom
  const listClip = left?.on === 'home' ? `inset(0 0 ${Math.round((1 - left.v) * 100)}% 0)` : undefined
  const typedFor = (block: View) => (typed?.on === block ? typed.text : null)
  const centred = CENTRED(variant)
  const viewRef = useRef(view)
  viewRef.current = view
  /* The canvas window resizes from its bottom-right corner. The group stays
     centred, so the width grows on both sides and follows the cursor. */
  const [fieldBox, setFieldBox] = useState<{ w: number; h: number } | null>(null)
  const growField = (e: React.PointerEvent) => {
    e.preventDefault(); e.stopPropagation()
    const main = (e.currentTarget as HTMLElement).parentElement
    if (!main) return
    const r = main.getBoundingClientRect(), sx = e.clientX, sy = e.clientY
    // as big as the frame allows; the text below moves down to make room
    const zone = main.closest('.canvas-zone')?.getBoundingClientRect()
    const maxH = zone ? zone.bottom - r.top - 24 : window.innerHeight * 0.8
    const move = (ev: PointerEvent) => setFieldBox({
      w: Math.round(Math.min(window.innerWidth - 40, Math.max(360, r.width + (ev.clientX - sx) * 2))),
      h: Math.round(Math.min(maxH, Math.max(100, r.height + ev.clientY - sy))),
    })
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
  }
  const sized = (l: Layout): Layout => (!fieldBox || !centred ? l : {
    ...l, rows: l.rows.replace(MAIN, `${fieldBox.h}px`),
    colSizes: `1fr minmax(0,${fieldBox.w / 2}px) minmax(0,${fieldBox.w / 2}px) 1fr`,
  })
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get('v') as Variant | null
    if (v && VARIANTS.some(x => x.key === v)) setVariant(v)
    if (new URLSearchParams(window.location.search).get('i') === 'classic') setIcons('classic')
    const nq = new URLSearchParams(window.location.search).get('n') as NameStyle | null
    if (nq && NAME_STYLES.some(x => x.key === nq)) setNames(nq)
    setIsLocal(['localhost', '127.0.0.1'].includes(window.location.hostname))
  }, [])
  const pickVariant = (v: Variant) => {
    setVariant(v); setView('home')
    const u = new URL(window.location.href)
    if (v === 'stack') u.searchParams.delete('v'); else u.searchParams.set('v', v)
    window.history.replaceState(null, '', u)
  }
  const pickNames = (v: NameStyle) => {
    setNames(v)
    const u = new URL(window.location.href)
    if (v === 'mono') u.searchParams.delete('n'); else u.searchParams.set('n', v)
    window.history.replaceState(null, '', u)
  }
  const pickIcons = (v: 'line' | 'classic') => {
    setIcons(v)
    const u = new URL(window.location.href)
    if (v === 'line') u.searchParams.delete('i'); else u.searchParams.set('i', v)
    window.history.replaceState(null, '', u)
  }
  const shellApi: ShellApi = {
    view, goTo: to => goTo(to, true), setTheme, openContact: () => setContact(true),
    weather: sky ? { place: sky.place ?? null, period: periodOf(), sky: wx?.s ?? sky.sky } : null,
    openProject: slug => { openWin(slug, pendingFrom.current); pendingFrom.current = null },
  }
  /* Clicking a project opens its window. In terminal mode it types the
     command first, so you can see what it does. */
  const openProject = (slug: string, el: Element) => {
    if (!shellRun.current) { openWin(slug, el); return }
    pendingFrom.current = el
    const dir = dirName(slug, CARDS[slug]?.title ?? slug)
    shellRun.current(FOLDERS[slug] ? `cat ~/projects/${dir}/description.txt` : `open ~/tidbits/${dir}`)
  }

  /* Scrolling opens the field. In the centred layouts the window itself grows:
     a frame of page colour with a hole cut where the window is, and the hole
     widens to the whole screen while the text steps back. */
  const zoneRef = useRef<HTMLDivElement>(null)
  // the part of the field on screen, so the canvas only draws there
  const fieldRegion = useRef<{ x: number; y: number; w: number; h: number } | null>(null)
  const [hole, setHole] = useState<{ l: number; t: number; w: number; h: number; W: number; H: number } | null>(null)
  fieldRegion.current = centred && hole
    ? { x: hole.l * (1 - open), y: hole.t * (1 - open), w: hole.w + (hole.W - hole.w) * open, h: hole.h + (hole.H - hole.h) * open }
    : null
  useLayoutEffect(() => {
    const zone = zoneRef.current
    if (!centred || !zone) { setHole(null); return }
    const measure = () => {
      const main = zone.querySelector('[data-main]') as HTMLElement | null
      if (!main || isStacked()) { setHole(null); return }
      const z = zone.getBoundingClientRect(), r = main.getBoundingClientRect()
      setHole({ l: r.left - z.left, t: r.top - z.top, w: r.width, h: r.height, W: z.width, H: z.height })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(zone)
    const main = zone.querySelector('[data-main]')
    if (main) ro.observe(main)
    return () => ro.disconnect()
  }, [centred, variant, view])
  // the canvas controls stay out of the way until the bio has finished reading
  const [bioDone, setBioDone] = useState(false)
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

  /* A first visit has nothing remembered, and on a slow connection the two
     lookups (where, then what weather) can take seconds or never land. Give
     them a moment, then paint the clear sky for this hour rather than leave
     the field blank while the bio is already reading itself. */
  const [waited, setWaited] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setWaited(true), 900)
    return () => clearTimeout(t)
  }, [])

  const look = pinned ?? ambient ?? (remembered ? LOOKS[remembered.p][remembered.s] : null)
    ?? (waited ? LOOKS[periodOf()].clear : null)

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
      if (isStacked()) return
      const t = e.target as HTMLElement
      if (t?.closest('.no-open')) return
      /* On a short screen the copy scrolls inside its window. Let it finish
         scrolling before the wheel starts opening the field, or the text fades
         out from under the reader mid-sentence. */
      const panel = t?.closest('.panel') as HTMLElement | null
      if (panel) {
        const more = panel.scrollTop + panel.clientHeight < panel.scrollHeight - 1
        if ((e.deltaY > 0 && more) || (e.deltaY < 0 && panel.scrollTop > 0)) return
      }
      setOpen(v => Math.min(1, Math.max(0, v + e.deltaY / 900)))
    }
    const onResize = () => { if (isStacked()) setOpen(0) }
    window.addEventListener('resize', onResize)
    window.addEventListener('wheel', fn, { passive: true })
    return () => { window.removeEventListener('wheel', fn); window.removeEventListener('resize', onResize) }
  }, [])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNavOpen(false); setContact(false)
        const ws = winsRef.current
        if (ws.length) { const top = ws.reduce((a, b) => (a.z > b.z ? a : b)); closeWin(top.id); return }
        if (viewRef.current === 'about') goTo('home')
      }
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
    window.open(`mailto:defneg@stanford.edu?subject=${encodeURIComponent(`Portfolio: ${name}`)}&body=${encodeURIComponent(`${msg}\n\nFrom: ${name} <${email}>`)}`)
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
      data-full={full ? 1 : 0}
      data-centred={centred ? 1 : 0}
      className="root-frame"
      style={{ display: 'flex', flexDirection: 'column', width: '100vw', overflow: 'hidden', background: 'var(--bg)', color: 'var(--ink)',
        ...({ '--wall': `${centred ? 1.75 : 1.75 * (1 - open)}rem`, '--open': open } as React.CSSProperties),
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



        /* each bio word is its own box, so the decode band scrambles in place */
        .bio-w { display: inline-block; padding: 0.06em 0.16em; margin-right: 0.1em; border-radius: 3px; }
        .bio-hot { color: var(--award); }
        .bio-block { display: inline-block; width: 0.5em; height: 1.05em; margin-left: 0.08em; vertical-align: -0.17em;
          background: var(--award); animation: blink 1s steps(1) infinite; }
        .bio-block[data-done="1"] { animation: blink 1s steps(1) 3 forwards; }

        /* terminal: the prompt is real terminal output, set at reading size */
        .bio-prompt { white-space: nowrap; font-family: var(--font-mono); font-size: 1rem; color: var(--award); margin-bottom: 0.6rem; cursor: default; }
        .bio-prompt > span:first-child { color: var(--ink); }

        /* decode: glyphs scramble inside the word's own box, so nothing reflows */
        .bio-scr { position: relative; }
        .bio-scr-g { position: absolute; inset: 0.06em 0.16em; overflow: hidden; white-space: nowrap;
          font-family: var(--font-mono); color: var(--award); letter-spacing: -0.02em; }


        /* develop: a sparse dot screen the width of each word, which thickens
           to a 50% checker, then the letters come through in the accent and
           settle to ink */
        .bio-dev { color: transparent;
          background-image: radial-gradient(var(--ink) 0.55px, transparent 0.8px);
          background-size: 4px 4px; }


        /* Project links */
        .pl { text-decoration: none; color: var(--ink); transition: opacity .2s; }
        .pl-list:hover .pl { opacity: 0.35; }
        .pl-list .pl:hover { opacity: 1; }
        .award { color: var(--award); }



        /* laptop-height screens: tighter spacing so the copy fits its window */
        @media (max-height: 880px) and (min-width: 861px) {
          .copy-cell { padding-top: 0.6rem !important; padding-bottom: 0.4rem !important; gap: 1.05rem !important; }
        }
        @media (max-height: 760px) and (min-width: 861px) {
          .copy-cell { gap: 0.8rem !important; }
          .copy-cell p { line-height: 1.5 !important; }
        }
        .v-switch { max-width: calc(100vw - 1.2rem); }
        .v-row { flex-wrap: wrap; }
        .copy-side { display: grid !important; grid-template-columns: 1fr 1fr; gap: 2.2rem !important; align-items: start; }
        @media (max-width: 860px), (hover: none) and (pointer: coarse) { .copy-side { display: flex !important; } }
        .foot { position: relative; z-index: 310; flex-shrink: 0; display: flex; align-items: center;
          padding: 0.4rem 1.75rem; border-top: 1px solid var(--hairline); background: var(--bg); }
        .foot .ul { font-size: 0.9rem !important; color: var(--ink) !important; }
        .foot .ul:hover { color: var(--award) !important; }
        .root-frame[data-full="1"] .foot { opacity: 0; pointer-events: none; }


        .v-switch { position: fixed; left: 4.5rem; bottom: 1rem; z-index: 400;
          display: flex; flex-direction: column; gap: 0.2rem; padding: 0.35rem; border-radius: 14px; background: var(--bg); border: 1px solid var(--hairline); }
        .v-row { display: flex; align-items: center; gap: 0.2rem; }
        .v-row > span { font-size: 0.92rem; font-weight: 600; width: 4.8rem; padding-left: 0.5rem; }
        .v-switch button { font: inherit; font-size: 0.92rem; font-weight: 500; padding: 0.35rem 0.8rem; border-radius: 999px; border: none; cursor: pointer; background: none; color: var(--ink); }
        .v-switch button[data-on="1"] { background: var(--award); color: var(--bg); }
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

        /* the work as ls output */
        .pl-list { display: flex; flex-direction: column; gap: 0.5rem; }

        /* project name styles */
        .nm-mono { font-family: var(--font-mono); font-size: 1.05rem; }
        .nm-award { font-size: 0.85rem; white-space: nowrap; }
        .nm-ls { display: grid; grid-template-columns: max-content 1fr; gap: 0.35rem 1.4rem; align-items: baseline; }
        .nm-ls-row { display: contents; font-family: var(--font-mono); font-size: 1rem; color: var(--ink); text-decoration: none; }
        .nm-ls-year { color: var(--award); }
        .nm-ls-row:hover .nm-ls-name { background: var(--ink); color: var(--bg); }
        .nm-buttons { display: flex; flex-wrap: wrap; gap: 0.7rem 0.6rem; }
        /* Xerox Star command buttons: a small rounded box, no shadow; pointed at or pressed, it inverts */
        .nm-button { display: inline-flex; align-items: center; gap: 0.4rem; height: 1.9rem; padding: 0 0.75rem; border: 1.5px solid var(--ink); border-radius: 5px;
          background: var(--bg); color: var(--ink); text-decoration: none; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 0.98rem; }
        .nm-button:hover, .nm-button:active { background: var(--ink); color: var(--bg); }
        .nm-button:active { transform: translate(1px, 1px); }
        .nm-star { color: var(--award); }
        .nm-button:hover .nm-star { color: var(--bg); }
        
        .ls-second { margin-top: 1.3rem; }
        .bio-head { margin-bottom: -0.5rem; }

        /* Centre and Stack: no strip and no footer. A bar over the field holds
           the folder name, the links and the weather button. */
        .home-bar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
        /* top left: the folder name, set like the prompt; links and the weather button sit right */
        .home-title { font-family: var(--font-mono); font-size: 1rem; color: var(--ink); }
        .home-right { display: flex; align-items: center; gap: 1.25rem; }
        .home-links { display: flex; flex-wrap: wrap; gap: 0.5rem 1.25rem; }
        .home-links a, .home-links button { font-family: var(--font-mono); font-size: 0.95rem; color: var(--ink); text-decoration: none; background: none; border: none; padding: 0; }
        .windows { box-shadow: inset 0 0 0 calc(var(--wall) * 1.2) var(--bg); }
        /* About, opened in place: a cat prompt and Back on one line, then the prose */
                .about-tile { display: flex; flex-direction: column; gap: 1.1rem; }
        .about-paras { display: flex; flex-direction: column; gap: 0.6rem; }
        /* Centre and Stack: About runs in two columns so it stays about as tall as the spiel */
        .about-cols { display: block; column-count: 2; column-gap: 2.5rem; }
        .about-cols p { margin-bottom: 0.6rem; }
        .about-top { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; }
        /* Live: the weather icon sits in this tile's corner */
        .root-frame[data-centred="0"] .about-tile .bio-prompt { padding-right: 2.75rem; }

        /* opens-a-window links: mono, with the window glyph */
        .open-link, .home-links .open-link { display: inline-flex; align-items: center; gap: 0.4em; font-family: var(--font-mono); font-size: 0.95rem; color: var(--ink); text-decoration: none; }
        .open-link:hover { color: var(--award); }
        .win-glyph { flex-shrink: 0; position: relative; top: -0.05em; }
        .pl .win-glyph { align-self: center; color: var(--ink); }
        .pl:hover .win-glyph, .open-link:hover .win-glyph { color: var(--award); }
        .back-link { font-family: var(--font-mono); font-size: 0.95rem; color: var(--ink); text-decoration: none; }
        .back-link:hover { color: var(--award); }
        .help { display: grid; grid-template-columns: max-content 1fr; gap: 0.15rem 1.5rem; }
        .help > div { display: contents; }
        .help-cmd { color: var(--award); }
        /* the bar holds the weather panel, which opens down over the field */
        .windows > .panel.bar { overflow: visible !important; position: relative; z-index: 5; }
        /* Centre and Stack: the page colour around the window is one frame with
           a hole in it (.hole), so the cells themselves are see-through and
           the scroll can grow the hole to the whole screen. */
        .root-frame[data-centred="1"] .windows,
        .root-frame[data-centred="1"] .windows > * { box-shadow: none !important; background: transparent !important; }
        .hole { position: absolute; pointer-events: none; box-shadow: 0 0 0 200vmax var(--bg); }

        /* anything you can click shows the old black arrow */
        .root-frame a, .root-frame button, .shell-line, .retro-title { cursor: ${ARROW_CURSOR} !important; }
        .shell-line { cursor: ${ARROW_CURSOR} !important; }

        /* the shell: last output, then a live prompt with a blinking block */
        .col-gap { display: flex; flex-direction: column; gap: 1.6rem; }
        .shell-row { padding-top: 0.6rem; }
        /* the corner of the canvas window: drag to resize it */
        .field-grip { position: absolute; right: -6px; bottom: -6px; width: 18px; height: 18px; pointer-events: auto; cursor: nwse-resize !important; z-index: 8;
          background: linear-gradient(135deg, transparent 0 45%, var(--ink) 45% 55%, transparent 55% 65%, var(--ink) 65% 75%, transparent 75%); opacity: .7; }
        .field-grip:hover { opacity: 1; }
        .root-frame[data-open="1"] .field-grip { display: none; }
        .lists-2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--wall); }
        /* bottom right: the Star credit and the link to the desktop view */
        .star-credit { margin: 0 0 0 auto; font-family: var(--font-mono); font-size: 0.85rem; color: var(--ink); }
        .star-credit a { color: var(--ink); text-decoration: underline; text-underline-offset: 0.2em; }
        .star-credit a:hover { color: var(--award); }
        .star-credit-float { position: absolute; right: 1.75rem; bottom: 1rem; z-index: 20; }
        @media (max-width: 860px), (hover: none) and (pointer: coarse) { .star-credit-float { position: static; padding: 1rem 1.25rem 1.5rem; } }
        .shell { position: relative; }
        /* the box of long output rises out of the shell's cell, over the page */
        .windows > .panel:has(.shell) { overflow: visible !important; z-index: 6; }
        .shell-pop { position: absolute; left: 0; bottom: calc(100% + 0.4rem); z-index: 40; max-width: min(640px, 100%); max-height: 60vh; overflow: auto;
          margin: 0; padding: 0.8rem 2.4rem 0.9rem 0.9rem; background: var(--bg); border: 1.5px solid var(--ink); box-shadow: 4px 4px 0 var(--ink); }
        .shell-pop-x { position: absolute; top: 0.5rem; right: 0.5rem; width: 15px; height: 15px; padding: 0; display: flex; align-items: center; justify-content: center;
          color: var(--ink); background: var(--bg); border: 1.5px solid var(--ink); }
        .shell-pop-x:hover { background: var(--ink); color: var(--bg); }
        .cat-doc p { margin: 0 0 0.5rem; max-width: 70ch; }
        .cat-img { display: block; width: 100%; max-width: 560px; height: auto; margin: 0.2rem 0 0.7rem; border: 1px solid var(--ink); }
        .wttr { margin: 0; font-family: var(--font-mono); font-size: 0.9rem; line-height: 1.35; }
        .shell-out { font-family: var(--font-mono); font-size: 0.92rem; line-height: 1.5; color: var(--ink); margin-bottom: 0.35rem; white-space: pre-wrap; }
        .shell-line { position: relative; display: block; margin-bottom: 0; }
        .shell-input { position: absolute; inset: 0; width: 100%; opacity: 0; border: 0; padding: 0; background: none; font: inherit; }
        .shell-caret { animation: blink 1s steps(1) infinite; }


        /* window theme: each block in a frame with a title bar */
        .gui-frame { border: 1.5px solid var(--ink); box-shadow: 3px 3px 0 var(--ink); background: var(--bg); margin: 0 4px 4px 0; }
        .gui-title { height: 24px; display: flex; align-items: center; justify-content: center; border-bottom: 1.5px solid var(--ink);
          font-family: var(--font-mono); font-size: 0.82rem; color: var(--ink); }
        .gui-body { padding: 0.9rem 1rem 1rem; }

        /* windows: they appear, no motion */
        .retro-win { position: absolute; z-index: 80; width: min(560px, 90%); max-height: 76%;
          display: flex; flex-direction: column; background: var(--bg); color: var(--ink);
          border: 1.5px solid var(--ink); box-shadow: 4px 4px 0 var(--ink);
          /* the project's colour runs along the top edge, the one bit of colour on the window */
          border-top: 5px solid color-mix(in srgb, var(--accent) 80%, var(--ink)); }
        .retro-title { position: relative; flex-shrink: 0; height: 26px; display: flex; align-items: center; justify-content: center;
          border-bottom: 1.5px solid var(--ink); touch-action: none; }
        .retro-title span { font-family: var(--font-mono); font-size: 0.85rem; line-height: 1; color: inherit; }
        .retro-close { position: absolute; left: 7px; top: 50%; transform: translateY(-50%); width: 15px; height: 15px; padding: 0;
          display: flex; align-items: center; justify-content: center; color: var(--ink); background: var(--bg); border: 1.5px solid var(--ink); }
        .retro-close:hover { background: var(--ink); color: var(--bg); }
        .retro-grow { position: absolute; right: 0; bottom: 0; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;
          color: var(--ink); cursor: nwse-resize !important; touch-action: none; background: var(--bg); }
        .retro-body { flex: 1; min-height: 0; }
        .retro-body { padding: 1rem 1.15rem 1.15rem; overflow-y: auto; font-family: var(--font-mono); }

        /* About in a window reads plain */
        .about-plain p { font-size: 0.95rem; line-height: 1.65; color: inherit; }
        .about-plain p + p { margin-top: 0.8rem; }
        /* a project window: image, a sentence or two, a few points, the link bottom right */
        .card { display: flex; flex-direction: column; gap: 0.9rem; }
        /* the whole image, never cropped */
        .card-img { display: block; width: 100%; height: auto; max-height: 300px; object-fit: contain; border: 1px solid var(--hairline); }
        .card-meta { font-size: 0.9rem; color: color-mix(in srgb, var(--accent) 75%, var(--ink)); }
        .card-text { font-size: 0.95rem; line-height: 1.65; color: inherit; }
        .card-points { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 0.45rem; }
        .card-points li { position: relative; padding-left: 1.2rem; font-size: 0.92rem; line-height: 1.55; color: inherit; }
        .card-points li::before { content: '-'; position: absolute; left: 0; color: color-mix(in srgb, var(--accent) 75%, var(--ink)); }
        /* project colours mixed toward the ink so they hold up in dark mode too */
        .card-link { margin-top: 0.4rem; align-self: flex-end; font-family: var(--font-mono); font-size: 0.92rem; text-decoration: none; color: color-mix(in srgb, var(--accent) 75%, var(--ink)); }
        .card-link:hover { text-decoration: underline; text-underline-offset: 0.2em; }

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

        /* the wrapper anchors the corner controls inside the field */
        .field-main { position: relative; }
        .full-btn { display: none; }

        /* Stacked (phones, touch tablets): field on top, copy below. The field
           takes whatever height the copy leaves, so on most phones the page
           fits without scrolling. When it can't, field and copy scroll away
           together: the copy never slides across the animation. */
        @media (max-width: 860px), (hover: none) and (pointer: coarse) {
          .root-frame  { overflow-y: auto !important; }
          .canvas-zone { flex: 1 0 auto !important; display: flex; flex-direction: column; }
          .canvas-zone > .field-main {
            flex: 1 0 0; height: auto !important; min-height: 190px;
            display: flex; flex-direction: column;
          }
          .canvas-zone > .field-main > :first-child { flex: 1; min-height: 0; }
          .panel { background: var(--bg) !important; }
          /* --wall collapses as the canvas opens, and the windows are display:
             contents here, so the control pins to the field's own corner */
          .full-btn {
            display: flex; align-items: center; justify-content: center;
            position: absolute; right: 0.6rem; bottom: 0.6rem; z-index: 3;
            width: 26px; height: 26px; padding: 0; line-height: 0;
            border: 1px solid var(--hairline); border-radius: 999px;
            background: var(--bg); color: var(--ink); cursor: pointer;
          }
          /* full screen: the field leaves the flow and covers everything */
          /* Full screen has to clear the name strip, which sits at 310, and
             the page has to stop scrolling underneath or the copy streaks
             past behind it. */
          .root-frame[data-full="1"] { overflow: hidden !important; }
          .root-frame[data-full="1"] .field-main {
            position: fixed !important; inset: 0 !important;
            height: 100dvh !important; max-height: none !important; z-index: 500;
          }
          .root-frame[data-full="1"] .name-strip,
          .root-frame[data-full="1"] .panel { opacity: 0; pointer-events: none; }


          .pl-list a { font-size: 1.15rem !important; }
          .v-switch { bottom: 0.6rem; right: 50%; transform: translateX(50%); }
          .panel p   { font-size: 1.05rem !important; line-height: 1.6 !important; }
          .panel .ul { font-size: 0.9rem !important; }
          .windows { display: contents !important; }
          .windows > div:not(.panel):not(.win-slot) { display: none; }
          .windows > .win-slot { position: absolute !important; top: 0; right: 0; width: 0; height: 0; z-index: 70; }
          .windows > .panel.blank { display: none !important; }
          .panel { position: static !important; width: auto !important; flex: none !important; flex-direction: column !important; gap: 2rem !important; padding: 1.25rem 1.25rem 1.5rem !important; border: none !important; border-top: 1px solid var(--hairline) !important; box-shadow: none !important; }
          .panel > div { padding: 0 !important; height: auto !important; gap: 1.5rem !important; }
          .d-wrap { position: static !important; display: block !important; padding: 0 !important; }
          .d-top  { display: none; }
          .d-panel { flex: none !important; }
          .d-copy { flex-direction: column !important; align-items: flex-start !important; opacity: 1 !important; }
          .windows > div:not(.panel):has(.panel) { display: block; padding: 0 !important; box-shadow: none !important; }
          .panel .two-col { gap: 2rem !important; }
          /* phones: the name and links first, then the field, then the text */
          .canvas-zone > .field-main { order: 1; }
          .windows > .panel.bar { order: 0; border-top: none !important; padding: 0.9rem 1.25rem !important; overflow: visible !important; }
          .windows > .panel:not(.bar) { order: 2; }
          .home-bar { flex-wrap: wrap; row-gap: 0.4rem; }
          .home-title { white-space: nowrap; }
          .home-right { gap: 0.9rem; }
          .home-links { flex-wrap: nowrap; gap: 0.9rem; }
          .lists-2 { grid-template-columns: 1fr; gap: 1.6rem; }
          .about-top { flex-wrap: wrap; }
          .shell-pop { max-width: calc(100vw - 2.5rem); }
          .star-credit-float { order: 3; }
        }


        @media (max-width: 600px) {
          .nav-links   { display: none !important; }
        }



        @media (max-width: 420px) {
          .name-strip  { padding: 0.4rem 1rem !important; gap: 0.5rem !important; }
          .ns-sub      { display: none !important; }
        }
      `}</style>

      {/* ── NAME STRIP ── */}
      {!centred && (
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
      )}

      {/* One continuous canvas; each option arranges windows and text over it */}
      <div ref={zoneRef} className="canvas-zone" style={{ position: 'relative', flex: 1, minHeight: 0, background: 'var(--bg)', overflow: 'hidden' }}
        onMouseDown={e => {
          const t = e.target as HTMLElement
          if (t.closest('.no-open') || t.closest('.panel')) return
          e.stopPropagation()
          setWxOpen(!wxOpen)
        }}
        onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`) }}
        onTouchMove={e => { const r = e.currentTarget.getBoundingClientRect(); const t = e.touches[0]; e.currentTarget.style.setProperty('--mx', `${t.clientX - r.left}px`); e.currentTarget.style.setProperty('--my', `${t.clientY - r.top}px`) }}
        onMouseLeave={e => { e.currentTarget.style.setProperty('--mx', '-999px'); e.currentTarget.style.setProperty('--my', '-999px') }}>
        <div className="field-main" style={{ width: '100%', height: '100%', opacity: look ? 1 : 0, transition: 'opacity .6s ease' }}>
        <AsciiCanvas breathe={motion === 'breathe'} motion={motion} render={render} hover={hover} region={fieldRegion} lightMode={isLight} chars='▓▒░' color={color ?? undefined}
          message={`Defne Genç. ${BIO} Work: ${PROJECTS.map(p => p.name + (p.award ? ` (${p.award}, ${p.awardNote.replace(/[()]/g, '')})` : '')).join(', ')}.`} />

          <button className="full-btn no-open" onClick={() => setFull(v => !v)}
            aria-label={full ? 'Exit full screen' : 'Full screen'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {full
                ? <><polyline points="9 3 9 9 3 9" /><polyline points="15 21 15 15 21 15" /></>
                : <><polyline points="3 9 3 3 9 3" /><polyline points="21 15 21 21 15 21" /></>}
            </svg>
          </button>
        </div>

        {/* field controls belong to the animation, not the nav; in the centre
            layout the square sits in the field's own corner instead */}
        {!centred && (
        <div className="no-open wx-anchor" style={{
          position: 'absolute', top: 'calc(var(--wall) + 0.5rem)', right: 'calc(var(--wall) + 0.5rem)',
          zIndex: 70, display: 'flex', alignItems: 'center', gap: '0.6rem',
          // appears once the bio has finished reading itself
          opacity: bioDone ? 1 : 0, pointerEvents: bioDone ? 'auto' : 'none',
          transition: 'opacity .5s ease',
        }}>
          <WeatherControl override={wx} setOverride={setWx} live={live} place={sky?.place} open={wxOpen} setOpen={setWxOpen} theme={theme} setTheme={setTheme} />
        </div>
        )}

        {/* centred layouts: the page-coloured frame around the growing window */}
        {centred && hole && (
          <div className="hole" aria-hidden style={{
            left: hole.l * (1 - open), top: hole.t * (1 - open),
            width: hole.w + (hole.W - hole.w) * open, height: hole.h + (hole.H - hole.h) * open,
          }} />
        )}

        {/* the layout, at home or with About open */}
        <IconStyleCtx.Provider value={icons}>
        <NameCtx.Provider value={names}>
        <OpenCtx.Provider value={openProject}>
        <GridWindows layout={sized(LAYOUTS[variant][view])}
          mainChild={<div className="field-grip no-open" onPointerDown={growField} onDoubleClick={() => setFieldBox(null)} title="Drag to resize · double-click to reset" />}
          content={{
            blank: null,
            bar: (
              <div className="home-bar">
                <span className="home-title">{HOME_DIR}</span>
                <div className="home-right">
                  <div className="home-links">
                    <a className="back-link" href="/about" onClick={e => { e.preventDefault(); goTo(view === 'about' ? 'home' : 'about') }}>{view === 'about' ? 'My spiel' : 'About'}</a>
                    <a className="back-link" href="https://linkedin.com/in/-defne" target="_blank" rel="noreferrer">LinkedIn ↗</a>
                  </div>
                  <div className="no-open" style={{ opacity: bioDone ? 1 : 0, pointerEvents: bioDone ? 'auto' : 'none', transition: 'opacity .5s ease' }}>
                    <WeatherControl override={wx} setOverride={setWx} live={live} place={sky?.place} open={wxOpen} setOpen={setWxOpen} theme={theme} setTheme={setTheme} />
                  </div>
                </div>
              </div>
            ),
            cbio: <div style={{ paddingTop: '0.4rem' }}><About onDone={onBioDone} typed={typedFor('home')} left={leftFor('home')} /></div>,
            shell: <div className="shell-row"><Shell api={shellApi} runRef={shellRun} /></div>,
            cwork: <div style={{ paddingTop: '0.4rem', clipPath: listClip }}><Work /></div>,
            cproj: <Work part="projects" />,
            clists: <div className="lists-2" style={{ clipPath: listClip }}><Work part="projects" /><Work part="tidbits" /></div>,
            ctid: <Work part="tidbits" />,
            cabout: <div style={{ paddingTop: '0.4rem' }}><AboutText onBack={() => goTo('home')} typed={typedFor('about')} left={leftFor('about')} cols /></div>,
            about: <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}><AboutText onBack={() => goTo('home')} typed={typedFor('about')} left={leftFor('about')} /><Shell api={shellApi} runRef={shellRun} /></div>,
            // Live: the bio and the lists side by side in the bottom-left window
            copy: (
              <div className="copy-cell copy-side" style={{ padding: '1.25rem 1.25rem 1.25rem 0' }}>
                <About onDone={onBioDone} typed={typedFor('home')} left={leftFor('home')} />
                <Work />
                <div style={{ gridColumn: '1 / -1' }}><Shell api={shellApi} runRef={shellRun} /></div>
              </div>
            ),
          }} />
        </OpenCtx.Provider>
        </NameCtx.Provider>
        </IconStyleCtx.Provider>

        {/* the window style: About over the field */}
        {wins.map(w => {
          const card = CARDS[w.id]
          return (
            <RetroWindow key={w.id}
              title={card ? card.title : 'About me'}
              accent={card ? card.accent : 'var(--award)'}
              n={w.n} z={w.z} onClose={() => closeWin(w.id)} onFocus={() => focusWin(w.id)}>
              {card ? <CardBody card={card} meta={metaOf(w.id)} /> : <div className="about-plain">{ABOUT_PARAS.map((t, i) => <AboutPara key={i} text={t} />)}</div>}
            </RetroWindow>
          )
        })}

      </div>

      {/* a thin footer for the ways to reach me, mirroring the name strip */}
      {!centred && (
      <footer className="foot">
        <Links setContact={setContact} />
        <StarCredit />
      </footer>
      )}
      {centred && <div className="star-credit-float"><StarCredit /></div>}

      {isLocal && (
        <div className="v-switch no-open">
          <button onClick={() => setSwitchOpen(v => !v)} style={{ alignSelf: 'flex-start' }}>{switchOpen ? 'Hide' : 'Options'}</button>
          {switchOpen && <>
          <div className="v-row"><span>Layout</span>
            {VARIANTS.map(v => (
              <button key={v.key} data-on={variant === v.key ? 1 : 0} onClick={() => pickVariant(v.key)}>{v.label}</button>
            ))}
          </div>
          <div className="v-row"><span>Names</span>
            {NAME_STYLES.map(v => (
              <button key={v.key} data-on={names === v.key ? 1 : 0} onClick={() => pickNames(v.key)}>{v.label}</button>
            ))}
          </div>
          <div className="v-row"><span>Icons</span>
            {(['line', 'classic'] as const).map(v => (
              <button key={v} data-on={icons === v ? 1 : 0} onClick={() => pickIcons(v)}>{v === 'line' ? 'Line' : 'Classic'}</button>
            ))}
          </div>
          </>}
        </div>
      )}

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
