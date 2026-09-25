'use client'

import { useState, useEffect, useLayoutEffect, useRef, useCallback, createContext, useContext } from 'react'
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
  { name: 'Learning Et Al.', kind: 'Website',       year: '2026', href: '/project/learningetal', sub: 'A daily research digest around a provocative question' },
  { name: 'Menuto',          kind: 'iOS app',       year: '2026', href: '/project/menuto',       sub: 'Dish recommendations that learn your taste' },
  { name: 'Dishcovery',      kind: 'iOS app',       year: '2024', href: '/project/dishcovery',   sub: 'Recognise and cook with ingredients from anywhere' },
]

const BIO = 'I think about how modern interfaces should (and fail to) meet our needs with exponentially growing agentic capabilities. BS, MS, and a deferred PhD admission from Stanford University, where I specialized in human-AI interaction. Now AI @ Coinbase, where I own the agent creation experience.'


const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' }

/* Phones, and tablets with no cursor, get the stacked layout. The windows and
   the scroll-open gesture only make sense with a mouse and a wheel. Kept in
   step with the media query in the page styles. */
/* How the scroll gesture is advertised, picked with ?s= while we compare.
   pill   the old one: a pill at the top of the canvas
   cross  the same pill where the four windows meet, which is where the
          walls part when you scroll
   part   the walls themselves breathe apart a little, a preview of opening
   peek   the canvas opens a crack once and settles back
   mouse  a mouse with its wheel turning, at the crossing */
type CueMode = 'pill' | 'cross' | 'part' | 'peek' | 'mouse'
const CUE_MODES: { key: CueMode; label: string }[] = [
  { key: 'pill', label: 'Top pill' },
  { key: 'cross', label: 'Cross' },
  { key: 'part', label: 'Walls part' },
  { key: 'peek', label: 'Peek' },
  { key: 'mouse', label: 'Mouse' },
]

const WX_VARIANTS = ['live', 'a', 'b', 'c'] as const
type WxVariant = typeof WX_VARIANTS[number]

const STACKED = '(max-width: 860px), (hover: none) and (pointer: coarse)'
const isStacked = () => window.matchMedia(STACKED).matches

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

/* How the bio arrives. Prototypes, picked with ?t= while we compare.
   walk     the live one: the accent block steps through each phrase once
   type      typed out fast behind an accent block cursor, the last few
             characters still hot in the accent
   develop   each phrase starts as a dithered bar and resolves, like an image
             coming in over a modem
   decode    the dotted bars resolve through a band of scrambling glyphs
   scan      a scanline wipes down the paragraph, developing it as it passes
   terminal  a prompt, some thinking dots, then typed like a person would:
             in bursts, with a typo or two taken back. Click or press a key
             to skip; Enter replays. The projects then print as an ls. */
type BioMode = 'walk' | 'type' | 'develop' | 'decode' | 'scan' | 'terminal'
const BIO_MODES: { key: BioMode; label: string }[] = [
  { key: 'walk', label: 'Walk' },
  { key: 'type', label: 'Type' },
  { key: 'develop', label: 'Develop' },
  { key: 'decode', label: 'Decode' },
  { key: 'scan', label: 'Scan' },
  { key: 'terminal', label: 'Terminal' },
]

// word range of a run of the bio, by its text
function wordsOf(run: string): [number, number] {
  const target = run.split(' ')
  for (let i = 0; i + target.length <= BIO_WORDS.length; i++)
    if (target.every((w, k) => BIO_WORDS[i + k] === w)) return [i, i + target.length - 1]
  return [-1, -1]
}
const phraseOf = (i: number) => PHRASES.findIndex(([a, b]) => i >= a && i <= b)

type BioProps = { style: React.CSSProperties; onDone?: () => void }

// Keeps the paragraph's final size from the first frame, so whatever sits
// below never jumps while the text arrives.
function Reserve({ style, children }: { style: React.CSSProperties; children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative' }}>
      <p style={{ ...style, visibility: 'hidden' }} aria-hidden>{BIO}_</p>
      <p style={{ ...style, position: 'absolute', inset: 0, margin: 0 }}>{children}</p>
    </div>
  )
}

/* Typing runs off a precomputed timeline sampled once a frame, not a timer
   per character: a busy main thread (the canvas, a slow phone) then drops
   frames but never falls behind, it just prints a few characters at once. */
function useTimeline(times: number[], run: unknown = 0, skip?: React.MutableRefObject<boolean>) {
  const [n, setN] = useState(0)
  useEffect(() => {
    setN(0)
    const t0 = performance.now()
    let id = 0
    const tick = () => {
      const t = skip?.current ? Infinity : performance.now() - t0
      let k = 0
      while (k < times.length && times[k] <= t) k++
      setN(k)
      if (k < times.length) id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [times, run, skip])
  return n
}

// when each character of the bio lands: fast, with a breath at punctuation
const TYPE_TIMES = (() => {
  const out: number[] = []
  let t = 350
  for (let i = 0; i < BIO.length; i++) { t += /[.,)]/.test(BIO[i - 1] ?? '') ? 70 : 2.2; out.push(t) }
  return out
})()

function TypeBio({ style, onDone }: BioProps) {
  const n = useTimeline(TYPE_TIMES)
  useEffect(() => { if (n >= BIO.length) onDone?.() }, [n, onDone])
  const hot = Math.max(0, n - 14)
  return (
    <Reserve style={style}>
      {BIO.slice(0, hot)}<span className="bio-hot">{BIO.slice(hot, n)}</span>
      <span className="bio-block" data-done={n >= BIO.length ? 1 : 0} />
    </Reserve>
  )
}

const GLYPHS = '░▒▓#%&*+=/<>'
const scramble = (len: number) => Array.from({ length: len }, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join('')

function DecodeBio({ style, onDone }: BioProps) {
  const BAND = 4
  // starts a full band before the first word, so the server render (and the
  // first client render) has no random glyphs in it to disagree about
  const [r, setR] = useState(-BAND)   // words fully resolved
  useEffect(() => {
    if (r >= BIO_WORDS.length) { onDone?.(); return }
    const id = setTimeout(() => setR(v => v + 1), r < 0 ? 90 : 60)
    return () => clearTimeout(id)
  }, [r, onDone])
  // re-roll the glyphs between steps too, so the band shimmers
  const [, setTick] = useState(0)
  useEffect(() => {
    if (r >= BIO_WORDS.length) return
    const id = setInterval(() => setTick(t => t + 1), 40)
    return () => clearInterval(id)
  }, [r])
  return (
    <p style={style}>
      {BIO_WORDS.map((w, i) => i < r
        ? <span key={i} className="bio-w">{w}</span>
        : i < r + BAND
          ? <span key={i} className="bio-w bio-scr"><span style={{ color: 'transparent' }}>{w}</span><span className="bio-scr-g">{scramble(w.length + 1)}</span></span>
          : <span key={i} className="bio-w bio-dev">{w}</span>)}
    </p>
  )
}

function ScanBio({ style, onDone }: BioProps) {
  useEffect(() => { const t = setTimeout(() => onDone?.(), 2300); return () => clearTimeout(t) }, [onDone])
  return (
    <div className="bio-scan" style={{ position: 'relative' }}>
      <p className="bio-scan-top" style={style}>
        {BIO_WORDS.map((w, i) => <span key={i} className="bio-w">{w}</span>)}
      </p>
    </div>
  )
}

/* A script for the terminal: text to type, pauses, and backspaces. Written
   to read like someone composing, not a machine printing: it hesitates over
   "(and fail to)", fumbles one word, and says "at Coinbase" before settling
   on "AI @ Coinbase". The same little performance every time. */
type Op = { t: string; ms?: number } | { wait: number } | { del: number } | { dots: number } | { clear: true }
function terminalScript(): Op[] {
  const ops: Op[] = []
  ops.push({ dots: 2 }, { wait: 260 }, { dots: 5 }, { wait: 220 }, { clear: true })
  ops.push({ t: 'I think about how modern interfaces should' }, { wait: 520 })
  ops.push({ t: ' (and' }, { wait: 680 }, { t: ' fail to)' }, { wait: 260 })
  ops.push({ t: ' meet our needs with ' }, { t: 'exponentai', ms: 30 }, { wait: 300 }, { del: 3 }, { wait: 140 })
  ops.push({ t: 'tially growing agentic capabilities.' }, { wait: 480 })
  ops.push({ t: ' BS, MS, and a deferred PhD admission from Stanford University, where I specialized in human-AI interaction.' }, { wait: 520 })
  ops.push({ t: ' Now at Coinbase' }, { wait: 560 }, { del: 11 }, { wait: 240 })
  ops.push({ t: 'AI @ Coinbase, where I own the agent creation experience.' })
  return ops
}

// step into the folder, and the bio is what you find there
const BIO_CMD = 'cd Defne-Portfolio'
const HOME_DIR = 'Defne-Portfolio'
// a person's rhythm: uneven keys, a beat at spaces, a breath at punctuation
function keyDelay(ch: string, prev: string) {
  let d = 26 + Math.random() * 32
  if (ch === ' ') d += 18
  if (prev === ',') d += 200
  if (prev === '.' || prev === ')') d += 320
  if (Math.random() < 0.035) d += 160 + Math.random() * 140
  return d
}
type Frame = { cmd: string; out: string; dots: string }
// the whole performance as frames on a clock
const TERMINAL = (() => {
  const frames: Frame[] = [], times: number[] = []
  let t = 300, cmd = '', out = '', dots = ''
  const push = () => { frames.push({ cmd, out, dots }); times.push(t) }
  for (const ch of BIO_CMD) { t += 70 + Math.random() * 60; cmd += ch; push() }
  t += 380
  for (const op of terminalScript()) {
    if ('dots' in op) for (let i = 0; i < op.dots; i++) { t += i < 2 ? 200 : 35; dots += '.'; push() }
    else if ('clear' in op) { dots = ''; push() }
    else if ('wait' in op) t += op.wait
    else if ('del' in op) for (let i = 0; i < op.del; i++) { t += 55 + Math.random() * 25; out = out.slice(0, -1); push() }
    else for (const ch of op.t) {
      t += op.ms ?? keyDelay(ch, out[out.length - 1] ?? '')
      out += ch; push()
    }
  }
  frames.push({ cmd: BIO_CMD, out: BIO, dots: '' }); times.push(t)
  return { frames, times }
})()

function TerminalBio({ style, onDone }: BioProps) {
  const [run, setRun] = useState(0)
  const skip = useRef(false)
  const n = useTimeline(TERMINAL.times, run, skip)
  const done = n >= TERMINAL.times.length
  const f = n === 0 ? { cmd: '', out: '', dots: '' } : TERMINAL.frames[n - 1]
  const { cmd, out, dots } = f
  useEffect(() => { if (done) onDone?.() }, [done, onDone])
  const replay = () => { skip.current = false; setRun(r => r + 1) }

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) return
      if (done && e.key === 'Enter') replay()
      else if (!done) skip.current = true
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [done])

  return (
    <div onClick={() => { if (!done) skip.current = true }}>
      <div className="bio-prompt" onClick={() => { if (done) replay() }} title={done ? 'Run it again' : undefined}>
        <span>~ %</span> {cmd}{cmd.length < BIO_CMD.length && <span className="bio-block" />}
      </div>
      <Reserve style={style}>
        {dots ? <span className="bio-hot">{dots}</span> : out}
        {cmd.length >= BIO_CMD.length && <span className="bio-block" data-done={0} />}
      </Reserve>
    </div>
  )
}

function Bio({ style, onDone, mode = 'walk' }: { style: React.CSSProperties; onDone?: () => void; mode?: BioMode }) {
  if (mode === 'type') return <TypeBio style={style} onDone={onDone} />
  if (mode === 'decode') return <DecodeBio style={style} onDone={onDone} />
  if (mode === 'scan') return <ScanBio style={style} onDone={onDone} />
  if (mode === 'terminal') return <TerminalBio style={style} onDone={onDone} />
  return <PhraseBio style={style} onDone={onDone} mode={mode} />
}

function PhraseBio({ style, onDone, mode }: { style: React.CSSProperties; onDone?: () => void; mode: BioMode }) {
  const [step, setStep] = useState(0)

  // walk and develop are the same phrase clock at different tempos
  useEffect(() => {
    const total = PHRASES.length
    if (step >= total) { onDone?.(); return }
    const wait = mode === 'walk' ? 1100 : step === 0 ? 400 : 420
    const id = setTimeout(() => setStep(v => v + 1), wait)
    return () => clearTimeout(id)
  }, [step, onDone, mode])

  const cls = (i: number) => {
    const ph = phraseOf(i)
    if (mode === 'walk') {
      const [from, to] = PHRASES[step] ?? [-1, -1]
      return i >= from && i <= to ? 'bio-w bio-on' : 'bio-w'
    }
    if (mode === 'develop') return ph < step ? 'bio-w bio-dev bio-dev-in' : 'bio-w bio-dev'
    return 'bio-w'
  }

  return (
    <p style={style}>
      {BIO_WORDS.map((w, i) => <span key={i} className={cls(i)}>{w}</span>)}
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

/* Section heading options, picked with ?h= while we compare. The old heading
   was the same face, weight and colour as the names under it, only smaller,
   so it read as a fifth project.
   accent   "Projects" in the accent, lighter weight, a rule out to the edge
   work     the same treatment, worded "Selected work"
   rule     no word, just a hairline above the list
   numbers  no heading; each name carries its number in the accent
   none     nothing: the names are obviously the work
   terminal the list is what "ls projects" prints inside Defne-Portfolio */
type HeadMode = 'accent' | 'work' | 'rule' | 'numbers' | 'none' | 'terminal'
const HEAD_MODES: { key: HeadMode; label: string }[] = [
  { key: 'accent', label: 'Accent' },
  { key: 'work', label: 'Selected work' },
  { key: 'rule', label: 'Rule' },
  { key: 'numbers', label: 'Numbers' },
  { key: 'none', label: 'None' },
  { key: 'terminal', label: 'Terminal' },
]
const HeadCtx = createContext<HeadMode>('accent')

function Label({ children }: { children: React.ReactNode }) {
  const mode = useContext(HeadCtx)
  const term = useContext(TermCtx)
  // a terminal bio always hands over to a typed ls, whatever the heading
  if (term) return <TermPrompt term={term} />
  if (mode === 'terminal') return <div className="bio-prompt"><span>{HOME_DIR} %</span> ls projects</div>
  if (mode === 'none' || mode === 'numbers') return <div style={{ height: '0.2rem' }} />
  if (mode === 'rule') return <div className="sec-rule" />
  return (
    <div className="sec-label">
      <span>{mode === 'work' ? 'Selected work' : children}</span>
    </div>
  )
}

// the number before a name, only in numbers mode
function Num({ i }: { i: number }) {
  const mode = useContext(HeadCtx)
  if (mode !== 'numbers') return null
  return <span className="sec-num">{String(i + 1).padStart(2, '0')}</span>
}

/* In terminal mode the project list is the second command: once the bio has
   printed, "ls projects" is typed inside the defne-portfolio session and each name types out in turn. Everything
   is laid out from the start and only painted in, so nothing moves. */
const TERM_CMD = 'ls projects'
const TERM_TIMES = (() => {
  const out: number[] = []
  let t = 450
  for (let i = 0; i < TERM_CMD.length; i++) { t += 50 + Math.random() * 35; out.push(t) }
  t += 260
  for (const p of PROJECTS) { for (let i = 0; i < p.name.length; i++) { t += 14; out.push(t) } t += 110 }
  return out
})()
const NO_TIMES: number[] = []
function useTermList(on: boolean, start: boolean) {
  const total = PROJECTS.reduce((a, p) => a + p.name.length, 0)
  const k = useTimeline(on && start ? TERM_TIMES : NO_TIMES)
  const cmd = Math.min(k, TERM_CMD.length)
  const n = Math.max(0, k - TERM_CMD.length)
  if (!on) return null
  let off = 0
  const rows = PROJECTS.map(p => { const shown = Math.max(0, Math.min(p.name.length, n - off)); off += p.name.length; return shown })
  return { cmd: TERM_CMD.slice(0, cmd), typing: cmd < TERM_CMD.length, rows, done: n >= total, started: start }
}

// a name typed so far, the rest laid out but unpainted
function Typed({ text, shown, cursor }: { text: string; shown: number; cursor?: boolean }) {
  return <>{text.slice(0, shown)}{cursor && <span className="bio-block" />}<span style={{ color: 'transparent' }}>{text.slice(shown)}</span></>
}

type Term = NonNullable<ReturnType<typeof useTermList>>
const TermCtx = createContext<Term | null>(null)

function TermPrompt({ term }: { term: Term }) {
  return (
    <div className="bio-prompt" style={{ visibility: term.started ? 'visible' : 'hidden' }}>
      <span>{HOME_DIR} %</span> {term.cmd}{term.typing && <span className="bio-block" />}
    </div>
  )
}

// in terminal mode a row is painted once ls has printed it
function useRowShown() {
  const term = useContext(TermCtx)
  return (i: number) => !term || term.rows[i] === PROJECTS[i].name.length
}

// which row is mid-type, for the cursor
const activeRow = (rows: number[]) => rows.findIndex((r, i) => r < PROJECTS[i].name.length)

function Work({ big = false }: { big?: boolean }) {
  const term = useContext(TermCtx)
  const typingRow = term && !term.typing && term.cmd ? activeRow(term.rows) : -1
  return (
    <div>
      <Label>Projects</Label>
      <div className="pl-list" style={{ display: 'flex', flexDirection: 'column', gap: big ? '0.7rem' : '0.5rem' }}>
        {PROJECTS.map((p, i) => (
          <a key={p.name} href={p.href} className="pl" style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', fontSize: big ? 'clamp(1.55rem, 2.2vw, 2rem)' : '1.3rem', fontWeight: 500, letterSpacing: '-0.01em', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-display)' }}>
              <Num i={i} />{term ? <Typed text={p.name} shown={term.rows[i]} cursor={typingRow === i} /> : p.name}
            </span>
            {p.award && (
              <span className="award" style={{ fontSize: big ? '1rem' : '0.88rem', whiteSpace: 'nowrap', visibility: !term || term.rows[i] === p.name.length ? 'visible' : 'hidden' }}>
                {p.award} <span>{p.awardNote}</span>
              </span>
            )}
          </a>
        ))}
      </div>
    </div>
  )
}

function About({ big = false, xl = false, onDone, mode }: { big?: boolean; xl?: boolean; onDone?: () => void; mode?: BioMode }) {
  // the live cell is a quarter of the screen, so its bio is set a size down
  const size = xl ? 'clamp(1.45rem, 2.1vw, 1.9rem)' : big ? 'clamp(1.25rem, 1.7vw, 1.55rem)' : 'clamp(1.08rem, 1.35vw, 1.26rem)'
  const strong = big || xl
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <Bio key={mode} mode={mode} onDone={onDone} style={{ fontSize: size, lineHeight: strong ? 1.75 : 1.65, color: 'var(--ink)', fontWeight: strong ? 300 : 400, letterSpacing: xl ? '-0.01em' : 0 }} />
    </div>
  )
}


/* Hierarchy experiments: the work gets its own window beside the bio instead
   of sitting under it as a footnote. Each variant sets the list differently.
   Picked with ?v= while we compare; no param keeps the live layout. */
type Variant = 'live' | 'side' | 'index'
const VARIANTS: { key: Variant; label: string }[] = [
  { key: 'live', label: 'Live' },
  { key: 'side', label: 'Live, side by side' },
  { key: 'index', label: 'Three up top' },
]

/* Three-window layouts around the live copy block. Each cell is placed on a
   grid; 'text' marks the one that holds the copy, the rest are windows. */
type Cell = { c: number; r: number; cs?: number; rs?: number; text?: 'copy' | 'bio' | 'work' }
type Layout = { cols: number; rows: string; cells: Cell[] }
const LAYOUTS: Record<Variant, Layout> = {
  // the live layout: 2×2, the copy in the bottom-left window
  live: { cols: 2, rows: '1fr 1fr', cells: [
    { c: 0, r: 0 }, { c: 1, r: 0 }, { c: 0, r: 1, text: 'copy' }, { c: 1, r: 1 },
  ] },
  // the same 2×2, but the bio and the work sit side by side in their window
  side: { cols: 2, rows: '1fr 1fr', cells: [
    { c: 0, r: 0 }, { c: 1, r: 0 }, { c: 0, r: 1, text: 'copy' }, { c: 1, r: 1 },
  ] },
  // three windows over the top, bio and index share the floor
  index: { cols: 6, rows: '1fr 1fr', cells: [
    { c: 0, r: 0, cs: 2 }, { c: 2, r: 0, cs: 2 }, { c: 4, r: 0, cs: 2 },
    { c: 0, r: 1, cs: 3, text: 'bio' }, { c: 3, r: 1, cs: 3, text: 'work' },
  ] },
}

function AwardLine({ p }: { p: typeof PROJECTS[number] }) {
  if (!p.award) return null
  return <span className="award" style={{ whiteSpace: 'nowrap' }}>{p.award} {p.awardNote}</span>
}

/* Ways to show the work inside the live cell. Picked with ?p= while we compare.
   list   the live one: names stacked, the award beside Bloom
   index  each name with its one-line pitch under it
   table  name, kind and year in ruled columns */
type ProjMode = 'list' | 'index' | 'table'
const PROJ_MODES: { key: ProjMode; label: string }[] = [
  { key: 'list', label: 'List' },
  { key: 'index', label: 'Index' },
  { key: 'table', label: 'Table' },
]

function Projects({ mode, terminal, start }: { mode: ProjMode; terminal: boolean; start: boolean }) {
  const term = useTermList(terminal, start)
  return (
    <TermCtx.Provider value={term}>
      {mode === 'index' ? <CellIndex /> : mode === 'table' ? <ProjectTable /> : <Work />}
    </TermCtx.Provider>
  )
}

function CellIndex() {
  const shown = useRowShown()
  return (
    <div>
      <Label>Projects</Label>
      <div className="px-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
        {PROJECTS.map((p, i) => (
          <a key={p.name} href={p.href} className="px" style={{ visibility: shown(i) ? 'visible' : 'hidden' }}>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: '0.7rem', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.15 }}><Num i={i} />{p.name}</span>
              <span style={{ fontSize: '0.92rem' }}><AwardLine p={p} /></span>
            </span>
            <span style={{ fontSize: '0.95rem', lineHeight: 1.35 }}>{p.sub}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

function ProjectTable() {
  const shown = useRowShown()
  return (
    <div>
      <Label>Projects</Label>
      <div className="ptab">
        {PROJECTS.map((p, i) => (
          <a key={p.name} href={p.href} className="ptab-row" style={{ visibility: shown(i) ? 'visible' : 'hidden' }}>
            <span className="ptab-name"><span><Num i={i} />{p.name}</span>{p.award && <span className="award ptab-award">{p.award}</span>}</span>
            <span>{p.kind}</span>
            <span>{p.year}</span>
          </a>
        ))}
      </div>
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
// tracery: two lancets below, a rosette in the top third. Drawn as one SVG of
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

/* Fit: the copy never scrolls inside its window. If the block is taller than
   the cell it is zoomed down until it fits, never below 80%, which keeps the
   bio at a comfortable reading size. Every bio animation reserves its final
   size from the first frame, so this only has to measure on layout changes. */
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

// GridWindows: any arrangement from LAYOUTS. Same wall trick as Windows.
function GridWindows({ layout, content, fitKey }: { layout: Layout; content: Record<string, React.ReactNode>; fitKey: unknown[] }) {
  const wall = '0 0 0 var(--wall) var(--bg)'
  return (
    <div className="windows" style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: `repeat(${layout.cols}, 1fr)`, gridTemplateRows: layout.rows.split(' ').map(r => `minmax(0, ${r})`).join(' '), gap: 'var(--wall)', padding: 'var(--wall)', pointerEvents: 'none' }}>
      {layout.cells.map((c, i) => {
        const place: React.CSSProperties = { gridColumn: `${c.c + 1} / span ${c.cs ?? 1}`, gridRow: `${c.r + 1} / span ${c.rs ?? 1}`, boxShadow: wall }
        return c.text
          ? <div key={i} className="panel scrollbar-none" style={{ ...place, background: 'var(--bg)', overflowY: 'auto', minWidth: 0, minHeight: 0 }}><Fit deps={[layout, ...fitKey]}>{content[c.text]}</Fit></div>
          : <div key={i} style={place} />
      })}
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
  const [touched, setTouched] = useState(false)
  const [full, setFull] = useState(false)
  // defaults are the picks: live, decode, table, no heading, C, top pill
  const [variant, setVariant] = useState<Variant>('live')
  const [bioMode, setBioMode] = useState<BioMode>('decode')
  const [projMode, setProjMode] = useState<ProjMode>('table')
  const [headMode, setHeadMode] = useState<HeadMode>('none')
  const [wxVariant, setWxVariant] = useState<WxVariant>('c')
  const [cueMode, setCueMode] = useState<CueMode>('pill')
  const [isLocal, setIsLocal] = useState(false)
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get('v') as Variant | null
    if (v && VARIANTS.some(x => x.key === v)) setVariant(v)
    const t = new URLSearchParams(window.location.search).get('t') as BioMode | null
    if (t && BIO_MODES.some(x => x.key === t)) setBioMode(t)
    const pm = new URLSearchParams(window.location.search).get('p') as ProjMode | null
    if (pm && PROJ_MODES.some(x => x.key === pm)) setProjMode(pm)
    const sc = new URLSearchParams(window.location.search).get('s') as CueMode | null
    if (sc && CUE_MODES.some(x => x.key === sc)) setCueMode(sc)
    const hm = new URLSearchParams(window.location.search).get('h') as HeadMode | null
    if (hm && HEAD_MODES.some(x => x.key === hm)) setHeadMode(hm)
    const w = new URLSearchParams(window.location.search).get('w') as WxVariant | null
    if (w && WX_VARIANTS.includes(w)) setWxVariant(w)
    setIsLocal(['localhost', '127.0.0.1'].includes(window.location.hostname))
  }, [])
  const setParam = (k: string, v: string, dflt: string) => {
    const u = new URL(window.location.href)
    if (v === dflt) u.searchParams.delete(k); else u.searchParams.set(k, v)
    window.history.replaceState(null, '', u)
  }
  const pickVariant = (v: Variant) => { setVariant(v); setParam('v', v, 'live') }
  // replaying the bio re-gates the controls, like a fresh load
  const pickBio = (t: BioMode) => { setBioDone(false); setBioMode(t); setParam('t', t, 'decode') }
  const pickWx = (w: WxVariant) => { setWxVariant(w); setParam('w', w, 'c') }
  const pickProj = (m: ProjMode) => { setProjMode(m); setParam('p', m, 'table') }
  const pickCue = (m: CueMode) => { setCueMode(m); setCueGone(false); setParam('s', m, 'pill') }
  const pickHead = (m: HeadMode) => { setHeadMode(m); setParam('h', m, 'none') }
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
      setCueGone(true)
      setOpen(v => Math.min(1, Math.max(0, v + e.deltaY / 900)))
    }
    const onResize = () => { if (isStacked()) setOpen(0) }
    window.addEventListener('resize', onResize)
    window.addEventListener('wheel', fn, { passive: true })
    return () => { window.removeEventListener('wheel', fn); window.removeEventListener('resize', onResize) }
  }, [])

  useEffect(() => {
    if (!bioDone) return
    const t = setTimeout(() => setCueGone(true), 10000)
    return () => clearTimeout(t)
  }, [bioDone])

  // peek: once the cue is up, the canvas opens a crack and settles back
  useEffect(() => {
    if (cueMode !== 'peek' || !bioDone || cueGone || isStacked()) return
    let id = 0, t0 = 0
    const start = setTimeout(() => {
      const tick = (now: number) => {
        if (!t0) t0 = now
        const k = Math.min(1, (now - t0) / 1600)
        setOpen(0.14 * Math.sin(k * Math.PI))   // below the 0.15 that hands the cursor over
        if (k < 1) id = requestAnimationFrame(tick)
      }
      id = requestAnimationFrame(tick)
    }, 700)
    return () => { clearTimeout(start); cancelAnimationFrame(id) }
  }, [cueMode, bioDone, cueGone])

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
      data-touched={touched ? 1 : 0}
      data-full={full ? 1 : 0}
      data-cue={cueMode}
      data-cueon={bioDone && !cueGone ? 1 : 0}
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
        .scroll-cue[data-at="cross"] { top: 50%; transform: translate(-50%, -50%); }
        .cue-mouse { display: block; }
        .cue-mouse .wheel { animation: wheel 1.4s cubic-bezier(.5,0,.3,1) infinite; }
        @keyframes wheel { 0% { transform: translateY(-2px); opacity: 1 } 70% { transform: translateY(4px); opacity: 0 } 100% { transform: translateY(4px); opacity: 0 } }

        /* part: the walls thin and come back, twice, like the frame taking a breath */
        @property --wall { syntax: '<length>'; inherits: true; initial-value: 1.75rem; }
        @keyframes wall-part { 0%, 100% { --wall: 1.75rem } 45%, 55% { --wall: 0.7rem } }
        .root-frame[data-cue="part"][data-cueon="1"][data-open="0"] { animation: wall-part 2.4s cubic-bezier(.6,0,.3,1) .6s 2; }
        @media (max-width: 860px), (hover: none) and (pointer: coarse) { .scroll-cue { display: none; } }

        /* The bio's phrase walk: block in the accent, words inverted to the page */
        .bio-w { display: inline-block; padding: 0.06em 0.16em; margin-right: 0.1em; border-radius: 3px; transition: background .18s ease, color .18s ease; }
        .bio-on { background: var(--award); color: var(--bg); }
        @media (prefers-reduced-motion: reduce) { .bio-on { background: none; color: var(--ink); } }

        .bio-hot { color: var(--award); }
        .bio-block { display: inline-block; width: 0.5em; height: 1.05em; margin-left: 0.08em; vertical-align: -0.17em;
          background: var(--award); animation: blink 1s steps(1) infinite; }
        .bio-block[data-done="1"] { animation: blink 1s steps(1) 3 forwards; }

        /* terminal: the prompt is real terminal output, set at reading size */
        .bio-prompt { font-family: var(--font-mono); font-size: 1rem; color: var(--award); margin-bottom: 0.6rem; cursor: default; }
        .bio-prompt > span:first-child { color: var(--ink); }

        /* decode: glyphs scramble inside the word's own box, so nothing reflows */
        .bio-scr { position: relative; }
        .bio-scr-g { position: absolute; inset: 0.06em 0.16em; overflow: hidden; white-space: nowrap;
          font-family: var(--font-mono); color: var(--award); letter-spacing: -0.02em; }

        /* scan: the developed text is masked in from the top behind a lit line */
        @property --scan { syntax: '<percentage>'; inherits: true; initial-value: 0%; }
        .bio-scan { animation: scan 2.1s cubic-bezier(.45,0,.25,1) forwards; }
        @keyframes scan { from { --scan: 0% } to { --scan: 104% } }
        /* nothing below the line; the freshly scanned band glows in the accent
           and cools to ink as the line moves on */
        .bio-scan-top { color: transparent;
          background: linear-gradient(to bottom, var(--ink) calc(var(--scan) - 18%), var(--award) calc(var(--scan) - 3%), var(--award) var(--scan), transparent var(--scan));
          -webkit-background-clip: text; background-clip: text; }
        .bio-scan-top .bio-w { color: transparent; }
        .bio-scan::after { content: ''; position: absolute; left: 0; right: 0; top: var(--scan); height: 2px;
          background: var(--award); box-shadow: 0 0 12px 2px var(--award); pointer-events: none; }
        @keyframes scan-line-out { to { opacity: 0 } }
        .bio-scan::after { animation: scan-line-out .3s ease 2.05s forwards; }

        /* develop: a sparse dot screen the width of each word, which thickens
           to a 50% checker, then the letters come through in the accent and
           settle to ink */
        .bio-dev { color: transparent;
          background-image: radial-gradient(var(--ink) 0.55px, transparent 0.8px);
          background-size: 4px 4px; }
        .bio-dev-in { animation: develop 1.2s steps(1) forwards; }
        @keyframes develop {
          0%   { color: transparent; background-image: conic-gradient(var(--ink) 25%, transparent 0 50%, var(--ink) 0 75%, transparent 0); background-size: 3px 3px; }
          25%  { color: transparent; background-image: radial-gradient(var(--ink) 0.8px, transparent 1px); background-size: 3px 3px; }
          50%  { color: var(--award); background-image: radial-gradient(var(--award) 0.7px, transparent 0.9px); background-size: 4px 4px; }
          75%  { color: var(--award); background-image: none; }
          100% { color: var(--ink); background-image: none; }
        }


        /* Project links */
        .pl { text-decoration: none; color: var(--ink); transition: opacity .2s; }
        .pl-list:hover .pl { opacity: 0.35; }
        .pl-list .pl:hover { opacity: 1; }
        .award { color: var(--award); }

        /* Index */
        .px { display: flex; flex-direction: column; gap: 0.15rem; text-decoration: none; color: var(--ink); transition: opacity .2s; }
        .px-list:hover .px { opacity: 0.35; }
        .px-list .px:hover { opacity: 1; }
        .px-name { font-family: var(--font-display); font-size: clamp(1.8rem, 2.6vw, 2.35rem); font-weight: 500; letter-spacing: -0.025em; line-height: 1.05; }
        .px-sub { font-size: 1.02rem; line-height: 1.4; }


        .sec-label { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.85rem;
          font-family: var(--font-display); font-size: 1rem; font-weight: 400; color: var(--award); }
        /* laptop-height screens: tighter spacing so the copy fits its window */
        @media (max-height: 880px) and (min-width: 861px) {
          .copy-cell { padding-top: 0.6rem !important; padding-bottom: 0.4rem !important; gap: 1.05rem !important; }
          .ptab-row { padding-top: 0.22rem; padding-bottom: 0.22rem; }
        }
        @media (max-height: 760px) and (min-width: 861px) {
          .copy-cell { gap: 0.8rem !important; }
          .copy-cell p { line-height: 1.5 !important; }
          .ptab-row { padding-top: 0.12rem; padding-bottom: 0.12rem; }
          .ptab-name { font-size: 1.1rem; }
        }
        .v-switch { max-width: calc(100vw - 1.2rem); }
        .v-row { flex-wrap: wrap; }
        .copy-side { display: grid !important; grid-template-columns: 1.3fr 1fr; gap: 2.2rem !important; align-items: start; }
        @media (max-width: 860px), (hover: none) and (pointer: coarse) { .copy-side { display: flex !important; } }
        .foot { position: relative; z-index: 310; flex-shrink: 0; display: flex; align-items: center;
          padding: 0.4rem 1.75rem; border-top: 1px solid var(--hairline); background: var(--bg); }
        .foot .ul { font-size: 0.9rem !important; color: var(--ink) !important; }
        .foot .ul:hover { color: var(--award) !important; }
        .root-frame[data-full="1"] .foot { opacity: 0; pointer-events: none; }
        .sec-rule { height: 1px; background: var(--award); opacity: 0.6; margin-bottom: 0.9rem; }
        .sec-num { font-family: var(--font-display); color: var(--award); font-weight: 400; font-size: 0.85em; margin-right: 0.55em; font-variant-numeric: tabular-nums; }
        .sec-label::after { content: ''; flex: 1; height: 1px; background: var(--award); opacity: 0.45; }

        /* Table */
        .ptab { border-top: 1px solid var(--hairline); }
        .ptab-row { display: grid; grid-template-columns: 1fr auto 3.2rem; gap: 1rem; align-items: baseline;
          padding: 0.35rem 0.1rem; border-bottom: 1px solid var(--hairline); color: var(--ink); text-decoration: none; font-size: 0.98rem;
          transition: background .15s, color .15s; }
        .ptab-row:hover { background: var(--award); color: var(--bg); }
        .ptab-row:hover .award { color: var(--bg); }
        .ptab-row > span:last-child { text-align: right; }
        .ptab-name { font-family: var(--font-display); font-size: 1.2rem; font-weight: 500; letter-spacing: -0.01em; display: flex; align-items: baseline; gap: 0.6rem; flex-wrap: wrap; }
        .ptab-award { font-family: inherit; font-size: 0.88rem; font-weight: 400; letter-spacing: 0; }

        .v-switch { position: fixed; right: 1rem; bottom: 1rem; z-index: 400;
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

        /* There is no cursor on a phone, so the field needs telling. Sits in
           the middle of the top band and fades once it has been touched. */
        .drag-hint { display: none; }
        @keyframes drag-breathe { 0%, 100% { opacity: .55 } 50% { opacity: 1 } }

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
          .no-open.wx-anchor { top: 0.6rem !important; right: 0.6rem !important; }
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
          .root-frame[data-full="1"] .panel,
          .root-frame[data-full="1"] .drag-hint { opacity: 0; pointer-events: none; }

          .drag-hint {
            display: block; position: absolute; left: 50%; top: 50%;
            transform: translate(-50%, -50%); z-index: 2; pointer-events: none;
            font-size: 0.85rem; color: var(--ink);
            text-shadow: 0 1px 6px var(--bg), 0 0 10px var(--bg);
            animation: drag-breathe 2.6s ease-in-out infinite;
          }
          .root-frame[data-touched="1"] .drag-hint { opacity: 0; animation: none; transition: opacity .4s; }

          .pl-list a { font-size: 1.15rem !important; }
          .px-name { font-size: 1.75rem; }
          .v-switch { bottom: 0.6rem; right: 50%; transform: translateX(50%); }
          .panel p   { font-size: 1.05rem !important; line-height: 1.6 !important; }
          .panel .ul { font-size: 0.9rem !important; }
          .windows { display: contents !important; }
          .windows > div:not(.panel) { display: none; }
          .panel { position: static !important; width: auto !important; flex: none !important; flex-direction: column !important; gap: 2rem !important; padding: 1.25rem 1.25rem 1.5rem !important; border: none !important; border-top: 1px solid var(--hairline) !important; box-shadow: none !important; }
          .panel > div { padding: 0 !important; height: auto !important; gap: 1.5rem !important; }
          .d-wrap { position: static !important; display: block !important; padding: 0 !important; }
          .d-top  { display: none; }
          .d-panel { flex: none !important; }
          .d-copy { flex-direction: column !important; align-items: flex-start !important; opacity: 1 !important; }
          .windows > div:not(.panel):has(.panel) { display: block; padding: 0 !important; box-shadow: none !important; }
          .panel .two-col { gap: 2rem !important; }
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
        onTouchStart={() => setTouched(true)}
        onTouchMove={e => { const r = e.currentTarget.getBoundingClientRect(); const t = e.touches[0]; e.currentTarget.style.setProperty('--mx', `${t.clientX - r.left}px`); e.currentTarget.style.setProperty('--my', `${t.clientY - r.top}px`) }}
        onMouseLeave={e => { e.currentTarget.style.setProperty('--mx', '-999px'); e.currentTarget.style.setProperty('--my', '-999px') }}>
        <div className="field-main" style={{ width: '100%', height: '100%', opacity: look ? 1 : 0, transition: 'opacity .6s ease' }}>
        <AsciiCanvas breathe={motion === 'breathe'} motion={motion} render={render} hover={hover} lightMode={isLight} chars='▓▒░' color={color ?? undefined}
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
          <div className="drag-hint" aria-hidden>drag here</div>
        </div>

        {/* field controls belong to the animation, not the nav */}
        <div className="no-open wx-anchor" style={{
          position: 'absolute', top: 'calc(var(--wall) + 0.5rem)', right: 'calc(var(--wall) + 0.5rem)',
          zIndex: 70, display: 'flex', alignItems: 'center', gap: '0.6rem',
          // appears once the bio has finished reading itself
          opacity: bioDone ? 1 : 0, pointerEvents: bioDone ? 'auto' : 'none',
          transition: 'opacity .5s ease',
        }}>
          <WeatherControl override={wx} setOverride={setWx} live={live} place={sky?.place} open={wxOpen} setOpen={setWxOpen} variant={wxVariant} />
        </div>

        {/* scroll cue: a small disc in the page ink, gone once the canvas opens */}
        <button className="scroll-cue no-open" aria-label="Scroll down" data-at={cueMode === 'pill' ? 'top' : 'cross'}
          onClick={() => { setCueGone(true); setOpen(1) }}
          style={{ opacity: bioDone && !cueGone ? 1 : 0, pointerEvents: bioDone && !cueGone ? 'auto' : 'none' }}>
          {cueMode === 'mouse' ? (
            <svg className="cue-mouse" width="14" height="20" viewBox="0 0 14 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <rect x="1" y="1" width="12" height="18" rx="6" />
              <line className="wheel" x1="7" y1="5" x2="7" y2="8" strokeLinecap="round" strokeWidth="1.8" />
            </svg>
          ) : null}
          Scroll
          {cueMode !== 'mouse' && (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="12" y1="4" x2="12" y2="19" /><polyline points="6 13 12 19 18 13" />
            </svg>
          )}
        </button>

        {/* the layout: 2×2 windows with the copy in the bottom-left cell */}
          {(
            <HeadCtx.Provider value={headMode}>
            <GridWindows layout={LAYOUTS[variant]} fitKey={[bioMode, projMode, headMode]} content={{
              bio: (
                <div style={{ padding: '1.25rem 1.25rem 1.25rem 0', maxWidth: 640 }}>
                  <About onDone={onBioDone} big mode={bioMode} />
                </div>
              ),
              work: (
                <div style={{ padding: '1.25rem 0 0.5rem 1.25rem', maxWidth: 640 }}>
                  <Projects mode={projMode} terminal={bioMode === 'terminal'} start={bioDone} />
                </div>
              ),
              // the live copy block, in whichever cell holds it
              copy: (
                <div className={variant === 'side' ? 'copy-cell copy-side' : 'copy-cell'} style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem', padding: '1.25rem 1.25rem 1.25rem 0', maxWidth: variant === 'side' ? 'none' : 640 }}>
                  <About onDone={onBioDone} mode={bioMode} />
                  <Projects mode={projMode} terminal={bioMode === 'terminal'} start={bioDone} />
                </div>
              ),
            }} />
            </HeadCtx.Provider>
          )}

      </div>

      {/* a thin footer for the ways to reach me, mirroring the name strip */}
      <footer className="foot">
        <Links setContact={setContact} />
      </footer>

      {isLocal && (
        <div className="v-switch no-open">
          <div className="v-row"><span>Layout</span>
            {VARIANTS.map(v => (
              <button key={v.key} data-on={variant === v.key ? 1 : 0} onClick={() => pickVariant(v.key)}>{v.label}</button>
            ))}
          </div>
          <div className="v-row"><span>Projects</span>
            {PROJ_MODES.map(v => (
              <button key={v.key} data-on={projMode === v.key ? 1 : 0} onClick={() => pickProj(v.key)}>{v.label}</button>
            ))}
          </div>
          <div className="v-row"><span>Heading</span>
            {HEAD_MODES.map(v => (
              <button key={v.key} data-on={headMode === v.key ? 1 : 0} onClick={() => pickHead(v.key)}>{v.label}</button>
            ))}
          </div>
          <div className="v-row"><span>Scroll</span>
            {CUE_MODES.map(v => (
              <button key={v.key} data-on={cueMode === v.key ? 1 : 0} onClick={() => pickCue(v.key)}>{v.label}</button>
            ))}
          </div>
          <div className="v-row"><span>Bio</span>
            {BIO_MODES.map(v => (
              <button key={v.key} data-on={bioMode === v.key ? 1 : 0} onClick={() => pickBio(v.key)}>{v.label}</button>
            ))}
          </div>
          <div className="v-row"><span>ⓘ</span>
            {WX_VARIANTS.map(v => (
              <button key={v} data-on={wxVariant === v ? 1 : 0} onClick={() => pickWx(v)}>{v === 'live' ? 'Live' : v.toUpperCase()}</button>
            ))}
          </div>
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
