'use client'

/* The desktop view: the site as a Xerox Star. One-bit black and white, a
   grey desk, windows with a striped header and rounded command
   buttons, pictorial tiles with the name inside, a property sheet with
   inverted choices. One window is the live field in full colour. */

import { useEffect, useRef, useState } from 'react'
import AsciiCanvas from '@/components/AsciiCanvas'
import { useAmbient, LOOKS, periodOf, type Period, type Sky } from '@/components/ambient'
import { CARDS } from '@/components/cards'
import { ITEMS, FOLDERS, PICTURES, dirName, type Kind, type Entry } from '@/components/fs'
import { ABOUT_PARAS } from '@/components/aboutContent'
import AboutPara from '@/components/AboutPara'
import { useTheme } from '@/components/useTheme'

const SPIEL = 'I think about how modern interfaces should (and fail to) meet our needs with exponentially growing agentic capabilities. BS, MS, and a deferred PhD admission from Stanford University, where I specialized in human-AI interaction. Now AI @ Coinbase, where I own the agent creation experience.'
// what the Projects folder holds, listed like a Star folder window
// the line under each project's title, like the subtitle on a ViewPoint document
const SUBTITLE: Record<string, string> = {
  bloom: 'Designing for LLM-Augmented Behavior Change Interactions. CHI 2026, Best Paper',
  mydrift: 'A tool to think with. 2026',
  learningetal: 'A daily research digest. 2026',
  dishcovery: 'Stanford CS 147 and CS 194H. 2024',
}

/* An icon for each project, line drawings in the ink like the Star's
   pictorial icons. */
const PI = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
const PROJECT_ICON: Record<string, React.ReactNode> = {
  // a flower on a stem: Bloom
  bloom: <svg width="22" height="22" viewBox="0 0 22 22" {...PI}><circle cx="11" cy="7" r="2" /><path d="M11 3.2a2.2 2.2 0 0 1 0 0M11 5c-1.6-2.6-4.2-1.6-3.4.6M11 5c1.6-2.6 4.2-1.6 3.4.6M9 7.6c-2.8.4-2.6 3.2-.2 2.8M13 7.6c2.8.4 2.6 3.2.2 2.8" /><path d="M11 9v11M11 16c-2-2.6-4.6-2-5-.6 1.6 1.4 3.6 1.4 5 .6M11 14c2-2 4.4-1.6 4.8-.2-1.6 1.2-3.4 1.2-4.8.2" /></svg>,
  // a word dump branching into a map: Catching My Drift
  mydrift: <svg width="22" height="22" viewBox="0 0 22 22" {...PI}><path d="M2 11c1.4-2 2.6 2 4 0s2.6 2 4 0" /><path d="M10 11l5-6M10 11h6M10 11l5 6" /><rect x="15" y="3" width="5" height="3.4" /><rect x="16" y="9.3" width="5" height="3.4" /><rect x="15" y="15.6" width="5" height="3.4" /></svg>,
  // a stack of papers with lines: Learning Et Al.
  learningetal: <svg width="22" height="22" viewBox="0 0 22 22" {...PI}><path d="M6 4h12v15H6z" /><path d="M4 6v15h12" /><path d="M9 8h6M9 11h6M9 14h4" /></svg>,
  // a bowl with steam: Dishcovery
  dishcovery: <svg width="22" height="22" viewBox="0 0 22 22" {...PI}><path d="M3 11h16a8 8 0 0 1-16 0z" /><path d="M8 18.5h6" /><path d="M8 8c-1-1.4 1-2 0-3.6M11 8c-1-1.4 1-2 0-3.6M14 8c-1-1.4 1-2 0-3.6" /></svg>,
  // a sponge with holes: Sponge OS
  sponge: <svg width="22" height="22" viewBox="0 0 22 22" {...PI}><path d="M4 5h14v13H4z" /><circle cx="8" cy="9" r="1.2" /><circle cx="14" cy="8" r="0.9" /><circle cx="12" cy="13" r="1.4" /><circle cx="7.5" cy="14.5" r="0.8" /><circle cx="15.5" cy="15" r="0.9" /></svg>,
  // a kilim diamond motif: Kilim
  kilim: <svg width="22" height="22" viewBox="0 0 22 22" {...PI}><path d="M3 3h16v16H3z" /><path d="M11 5l5 6-5 6-5-6z" /><path d="M11 8.5l2 2.5-2 2.5-2-2.5z" /><path d="M3 3v-0M3 19" /></svg>,
}
const KIND_WORD: Record<Kind, string> = { folder: 'Folder', doc: 'Text', link: 'Link', image: 'Image', pdf: 'PDF' }
const SMALL: Record<Kind, React.ReactNode> = {
  doc: <svg width="14" height="17" viewBox="0 0 14 17" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M1 1h8l4 4v11H1z" /><path d="M9 1v4h4M3.5 8h7M3.5 10.5h7M3.5 13h4.5" /></svg>,
  folder: <svg width="17" height="13" viewBox="0 0 17 13" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M1 2h6l1.5 1.5H16V12H1z" /></svg>,
  link: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="8" cy="8" r="6.5" /><path d="M1.5 8h13M8 1.5c2.2 2 2.2 11 0 13M8 1.5c-2.2 2-2.2 11 0 13" /></svg>,
  image: <svg width="16" height="14" viewBox="0 0 16 14" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M1 1h14v12H1z" /><path d="M1 10l4-4 3 3 2-2 5 5" /><circle cx="11" cy="4.5" r="1.3" /></svg>,
  pdf: <svg width="14" height="17" viewBox="0 0 14 17" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M1 1h8l4 4v11H1z" /><path d="M9 1v4h4" /><path d="M3.5 12.5h7" strokeWidth="2.4" /></svg>,
}
const SKIES: [Sky, string][] = [['clear', 'Clear'], ['cloud', 'Overcast'], ['rain', 'Rain'], ['snow', 'Snow'], ['fog', 'Fog'], ['storm', 'Storm'], ['wind', 'Wind']]
const HOURS: [Period, string][] = [['dawn', 'Early'], ['day', 'Daytime'], ['dusk', 'Evening'], ['night', 'Night'], ['late', 'Late night']]


// the desktop tiles, line drawings in the ink
const LS = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 }
/* "About the Star": a short history of the machine this view borrows from.
   The first paragraph is Defne's; the rest is checked history. */
const STAR_HISTORY = [
  'This interface is inspired by the Xerox Star.',
  'The Xerox Star exudes a rough charm through its primitive interface. Yet behind this powerful toy sit big ideas.',
  'Released in 1981, the Star was the first computer you could buy that put a mouse, icons you point at and click, folders and a desktop on one screen. Its designers made a deliberate bet. Office workers didn\u2019t care to see the command line or the code underneath. They wanted a picture of their work: documents, folders and in-trays on a desk.',
  'The ideas came from the Alto, a research computer built at [Xerox PARC] in 1973. The mouse itself was an older idea, shown by Doug Engelbart in 1968. PARC opened in 1970 and hired researchers from Engelbart\u2019s lab at SRI. They were HCI researchers setting out to build the office of the future.',
  'In 1979, Steve Jobs struck a deal with Xerox. Xerox received 100,000 pre-IPO shares of Apple\u2019s stock, and in exchange, Apple\u2019s team got a tour of the lab. Few visitors ever got to look under the hood. Jobs\u2019s team was one of them.',
  'Apple put those ideas into the Lisa in 1983 and the Macintosh in 1984. The Star cost about $16,000 per workstation and sold poorly. The Mac brought the same ideas to everyone.',
]
// where [Xerox PARC] and the source line point
const PARC_SOURCE = 'https://web.stanford.edu/dept/SUL/sites/mac/parc.html'
// the sources, each opens in a browser window on the desk
const SOURCES: { title: string; by: string; url: string }[] = [
  { title: 'The Xerox PARC Visit', by: 'Stanford Libraries', url: PARC_SOURCE },
  { title: 'The Xerox Star: A Retrospective', by: 'Johnson, Roberts, Verplank et al., IEEE Computer, 1989. Written by the Star\u2019s designers', url: 'https://perso.lisn.upsaclay.fr/mbl/FundHCI/papers/XeroxStar-Computer89.pdf' },
]

/* The desktop: object icons in a grid down the right, each with its name
   under it. Projects open as folders, tidbits as documents. */
type Shape = 'doc' | 'folder' | 'tool'
const PG = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.4 }
const PICTS: Record<string, React.ReactNode> = {
  field: <svg width="22" height="18" viewBox="0 0 22 18" {...PG}><path d="M1 1h20v16H1z" /><path d="M5 5h2v2H5zM10 5h2v2h-2zM15 9h2v2h-2zM5 11h2v2H5zM10 9h2v2h-2zM15 13h2v2h-2z" fill="currentColor" stroke="none" /></svg>,
  main: <svg width="20" height="16" viewBox="0 0 20 16" {...PG}><path d="M2 3h16M2 7h16M2 11h16M2 15h10" /></svg>,
  about: <svg width="18" height="18" viewBox="0 0 18 18" {...PG}><circle cx="9" cy="6" r="3.6" /><path d="M2 17c.8-4 3.6-6 7-6s6.2 2 7 6z" /></svg>,
  history: <svg width="22" height="18" viewBox="0 0 22 18" {...PG}><path d="M3 2h16v11H3z" /><path d="M8 17h6M11 13v4" /><path d="M6 5h5v3H6z" /></svg>,
  site: <svg width="22" height="16" viewBox="0 0 22 16" {...PG}><path d="M9 2L2 8l7 6" /><path d="M2 8h18" /></svg>,
}

/* Desk icons are little objects, like the Star's computer or calculator:
   a solid white shape with its detail, sometimes text, drawn inside. */
const OB = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
const TX = { fill: 'currentColor', stroke: 'none', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }
const DESK_ICON: Record<string, React.ReactNode> = {
  // an ID card
  about: <svg viewBox="0 0 44 44" {...OB}><rect x="3" y="9" width="38" height="27" rx="2" className="ob" /><circle cx="13" cy="19" r="4" /><path d="M7 31c1-4 3.4-5.6 6-5.6s5 1.6 6 5.6" /><path d="M23 17h13M23 22h13M23 27h9" /></svg>,
  // a phone with the coach's flower on its screen
  bloom: <svg viewBox="0 0 44 44" {...OB}><rect x="12" y="3" width="20" height="38" rx="3" className="ob" /><path d="M12 8h20M12 35h20" /><circle cx="22" cy="17" r="2.3" /><path d="M22 19.3v9M22 25c-2.4-2.6-4.8-1.6-5-.2 1.6 1.2 3.6 1.2 5 .2M22 23c2.4-2.4 4.6-1.4 4.8 0-1.6 1.2-3.4 1.2-4.8 0" /></svg>,
  // a sheet with a map of ideas on it
  mydrift: <svg viewBox="0 0 44 44" {...OB}><rect x="3" y="6" width="38" height="32" rx="1" className="ob" /><path d="M8 22c1.4-2 2.6 2 4 0s2.6 2 4 0" /><path d="M17 22l7-8M17 22h8M17 22l7 8" /><rect x="25" y="11" width="10" height="5" /><rect x="26" y="19.5" width="10" height="5" /><rect x="25" y="28" width="10" height="5" /></svg>,
  // a journal with its title and two columns
  learningetal: <svg viewBox="0 0 44 44" {...OB}><rect x="6" y="3" width="32" height="38" rx="1" className="ob" /><text x="22" y="13" textAnchor="middle" fontSize="7.5" fontStyle="italic" {...TX}>et al.</text><path d="M10 16h24M10 20h10M10 24h10M10 28h10M10 32h7M24 20h10M24 24h10M24 28h10M24 32h7" /></svg>,
  // a recipe card with a bowl
  dishcovery: <svg viewBox="0 0 44 44" {...OB}><rect x="3" y="8" width="38" height="28" rx="1" className="ob" /><path d="M7 21h14a7 7 0 0 1-14 0z" /><path d="M11 17c-.8-1.2.8-1.8 0-3.2M14 17c-.8-1.2.8-1.8 0-3.2M17 17c-.8-1.2.8-1.8 0-3.2" /><path d="M25 15h12M25 20h12M25 25h12M25 30h8" /></svg>,
  // a screen with a sponge on its desktop
  sponge: <svg viewBox="0 0 44 44" {...OB}><rect x="3" y="5" width="38" height="26" rx="1" className="ob" /><path d="M16 39h12M22 31v8" /><rect x="15" y="11" width="14" height="13" /><circle cx="19" cy="15" r="1.2" /><circle cx="25" cy="16" r="1" /><circle cx="22" cy="20" r="1.4" /></svg>,
  // a rug with fringe and a motif
  kilim: <svg viewBox="0 0 44 44" {...OB}><rect x="6" y="7" width="32" height="30" className="ob" /><path d="M22 11l8 11-8 11-8-11z" /><path d="M22 17l3.5 5-3.5 5-3.5-5z" /><path d="M9 3v4M14 3v4M19 3v4M24 3v4M29 3v4M34 3v4M9 37v4M14 37v4M19 37v4M24 37v4M29 37v4M34 37v4" /></svg>,
  // the Star itself: a workstation with text on its screen
  history: <svg viewBox="0 0 44 44" {...OB}><rect x="5" y="3" width="34" height="25" rx="1" className="ob" /><text x="22" y="14" textAnchor="middle" fontSize="6.5" fontWeight="700" {...TX}>XEROX</text><path d="M10 19h24M10 23h16" /><path d="M16 28v4h12v-4" /><rect x="3" y="34" width="38" height="7" rx="1" className="ob" /><path d="M7 37.5h30" /></svg>,
  // a terminal window: back to the command line
  site: <svg viewBox="0 0 44 44" {...OB}><rect x="3" y="7" width="38" height="30" rx="1" className="ob" /><path d="M3 13h38" /><text x="8" y="25" fontSize="9" {...TX} fontFamily="Menlo, monospace">%</text><path d="M15 25.5h6" /></svg>,
  // the field: a screen of squares
  field: <svg viewBox="0 0 44 44" {...OB}><rect x="3" y="5" width="38" height="28" rx="1" className="ob" /><path d="M16 39h12M22 33v6" /><path d="M8 10h4v4H8zM16 10h4v4h-4zM24 14h4v4h-4zM32 10h4v4h-4zM8 20h4v4H8zM20 22h4v4h-4zM28 22h4v4h-4z" fill="currentColor" stroke="none" /></svg>,
}

function StarIcon({ pict, label, pressed, title, onClick }: {
  shape: Shape; pict: React.ReactNode; label: string; pressed: boolean; title: string; onClick: () => void
}) {
  // the object, then its name under it; the name inverts while open
  return (
    <button className="sicon" aria-pressed={pressed} title={title} onClick={onClick}>
      <span className="sicon-pict">{pict}</span>
      <span className="sicon-label">{label}</span>
    </button>
  )
}


/* A project's Description, set like a Star ViewPoint document: a big
   title with its subtitle under it, then serif text in columns with bold
   headings, run-in italic subheads and numbered figures. */
function ViewPointDoc({ id }: { id: string }) {
  const c = CARDS[id]
  const pics = PICTURES[id] ?? []
  // a bullet like "What I did: ..." becomes an italic run-in subhead
  const runIn = (t: string) => {
    const k = t.indexOf(': ')
    return k > 0 && k < 24 ? <p key={t}><em>{t.slice(0, k)}</em> - {t.slice(k + 2)}</p> : <p key={t}>{t}</p>
  }
  const fig = ([src, cap]: [string, string], n: number) => (
    <figure key={src}><img src={src} alt={cap} /><figcaption><em>Figure {n}:</em> {cap}</figcaption></figure>
  )
  return (
    <div className="vp">
      <header>
        <h1>{c.title}</h1>
        {SUBTITLE[id] && <p className="vp-sub">{SUBTITLE[id]}</p>}
      </header>
      <div className="vp-cols">
        <h2>Overview</h2>
        <p>{c.text}</p>
        {pics[0] && fig(pics[0], 1)}
        {c.points && <><h2>Highlights</h2>{c.points.map(runIn)}</>}
        {pics.slice(1).map((pc, i) => fig(pc, i + 2))}
        <h2>Visit</h2>
        <p><a href={c.link.href} target="_blank" rel="noreferrer">{c.link.label} \u2197</a></p>
      </div>
    </div>
  )
}

type Win = { id: string; x: number; y: number; w: number; h: number; z: number }

function StarWindow({ win, title, buttons = [], onClose, onFocus, onMove, onSize, flush = false, children }: {
  win: Win; title: string; buttons?: [string, () => void][]; onClose?: () => void; onFocus: () => void
  onMove: (x: number, y: number) => void; onSize: (w: number, h: number) => void; flush?: boolean; children: React.ReactNode
}) {
  const scroll = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState<{ top: number; h: number } | null>(null)
  useEffect(() => {
    const el = scroll.current
    if (!el || flush) return
    const sync = () => { const r = el.clientHeight / el.scrollHeight; setThumb(r >= 1 ? null : { top: (el.scrollTop / el.scrollHeight) * 100, h: Math.max(14, r * 100) }) }
    sync(); el.addEventListener('scroll', sync)
    const ro = new ResizeObserver(sync); ro.observe(el)
    return () => { el.removeEventListener('scroll', sync); ro.disconnect() }
  }, [flush])
  /* A window opens tall enough to show everything in it, up to the screen.
     It keeps fitting while its pictures load, until you resize it yourself. */
  const userSized = useRef(false)
  const winRef = useRef(win)
  winRef.current = win
  useEffect(() => {
    const el = scroll.current
    if (!el || flush) return
    const fit = () => {
      if (userSized.current) return
      const w = winRef.current
      const extra = el.scrollHeight - el.clientHeight
      if (extra <= 1) return
      const maxH = window.innerHeight - 24
      const h = Math.min(maxH, w.h + extra)
      // move it up if the taller window would run off the bottom
      const y = Math.max(12, Math.min(w.y, window.innerHeight - h - 12))
      if (y !== w.y) onMove(w.x, y)
      onSize(w.w, h)
    }
    fit()
    const inner = el.firstElementChild
    const ro = new ResizeObserver(fit)
    if (inner) ro.observe(inner)
    const stop = setTimeout(() => ro.disconnect(), 3000)
    return () => { ro.disconnect(); clearTimeout(stop) }
  }, [flush])   // eslint-disable-line react-hooks/exhaustive-deps
  const drag = (e: React.PointerEvent) => {
    onFocus()
    const sx = e.clientX - win.x, sy = e.clientY - win.y
    const move = (ev: PointerEvent) => onMove(ev.clientX - sx, Math.max(0, ev.clientY - sy))
    const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up) }
    addEventListener('pointermove', move); addEventListener('pointerup', up)
  }
  const grow = (e: React.PointerEvent) => {
    e.stopPropagation(); onFocus(); userSized.current = true
    const sx = e.clientX, sy = e.clientY, w0 = win.w, h0 = win.h
    const move = (ev: PointerEvent) => onSize(Math.max(260, w0 + ev.clientX - sx), Math.max(160, h0 + ev.clientY - sy))
    const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up) }
    addEventListener('pointermove', move); addEventListener('pointerup', up)
  }
  const cmds: [string, () => void][] = [...(onClose ? [['Close', onClose] as [string, () => void]] : []), ...buttons]
  return (
    <div className="win" style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }} onPointerDown={onFocus}>
      <div className="head" onPointerDown={drag}>
        {cmds.map(([label, fn]) => <button key={label} className="cmd" onPointerDown={e => e.stopPropagation()} onClick={fn}>{label}</button>)}
        <span className="title">{title}</span>
      </div>
      <div className="body">
        {flush ? children : <>
          <div ref={scroll} className="scroll">{children}</div>
          <div className="bar">
            <button aria-label="Scroll up" onClick={() => scroll.current?.scrollBy({ top: -80 })}>▲</button>
            <div className="track">{thumb && <div className="thumb" style={{ top: `${thumb.top}%`, height: `${thumb.h}%` }} />}</div>
            <button aria-label="Scroll down" onClick={() => scroll.current?.scrollBy({ top: 80 })}>▼</button>
          </div>
        </>}
      </div>
      <div className="grow" onPointerDown={grow} />
    </div>
  )
}

export default function Star() {
  const [theme, setTheme] = useTheme('light')
  const { ambient, sky } = useAmbient('weather')
  const [pick, setPick] = useState<{ p: Period; s: Sky } | null>(null)
  const look = pick ? LOOKS[pick.p][pick.s] : ambient ?? LOOKS[periodOf()].clear
  const curP: Period = pick?.p ?? periodOf()
  const curS: Sky = pick?.s ?? sky?.sky ?? 'clear'

  /* More fields: each "New field" opens another window of the canvas with its
     own hour and sky, picked from the strip along its bottom. */
  const [fields, setFields] = useState<Record<string, { p: Period; s: Sky; props?: boolean }>>({})
  const fieldN = useRef(0)
  const [mainProps, setMainProps] = useState(false)
  const newField = () => {
    fieldN.current += 1
    const id = `field-${fieldN.current}`
    setFields(f => ({ ...f, [id]: { p: HOURS[Math.floor(Math.random() * HOURS.length)][0], s: SKIES[Math.floor(Math.random() * SKIES.length)][0] } }))
    open(id, 460, 380)
  }
  const z = useRef(10)
  const [wins, setWins] = useState<Win[]>([])
  const [sel, setSel] = useState<string | null>(null)
  /* first layout: only the field is open. My spiel, About me, Projects and
     Properties wait on the desk as icons. */
  useEffect(() => {
    if (innerWidth < 700) {
      // phones: the icons take the top, the field the rest
      const top = Math.min(300, Math.round(innerHeight * 0.38))
      setWins([{ id: 'field', x: 8, y: top, w: innerWidth - 16, h: innerHeight - top - 8, z: 2 }])
      z.current = 3
      return
    }
    // the desktop icons take a column on the right
    const W = innerWidth - 150, H = innerHeight, m = 32
    const w = Math.min(980, W - m * 2), h = Math.min(Math.round(w * 0.62), H - m * 2)
    const first: Win[] = [{ id: 'field', x: Math.round((W - w) / 2), y: Math.max(m, Math.round((H - h) / 2) - 10), w, h, z: 2 }]
    /* ?open=projects/bloom: arriving from the terminal with `open .`, the
       desktop opens on the folder you were in */
    const at = (new URLSearchParams(location.search).get('open') ?? '').split('/').filter(Boolean)
    if (at[0] === 'projects' && at[1]) {
      const it = ITEMS.find(i => i.kind === 'folder' && dirName(i.id, CARDS[i.id].title) === at[1])
      if (it) first.push({ id: `folder:${it.id}`, x: 120, y: 140, w: 520, h: 260, z: 4 })
    }
    setWins(first)
    z.current = first.length + 2
  }, [])
  useEffect(() => { wins.forEach(w => { if (w.id === 'field') home.current[w.id] = w }) }, [wins])
  // where each of the four first windows lives, so reopening puts it back
  const home = useRef<Record<string, Win>>({})
  const open = (id: string, w = 520, h = 520) => {
    z.current += 1
    const k = wins.length % 5
    const zz = z.current
    // on a phone every window opens as a full sheet
    if (innerWidth < 700) {
      setWins(ws => ws.some(x => x.id === id) ? ws.map(x => (x.id === id ? { ...x, z: zz } : x))
        : [...ws, { id, x: 8, y: 8, w: innerWidth - 16, h: innerHeight - 16, z: zz }])
      return
    }
    setWins(ws => ws.some(x => x.id === id)
      ? ws.map(x => (x.id === id ? { ...x, z: zz } : x))
      : [...ws, home.current[id] ? { ...home.current[id], z: zz } : { id, x: Math.max(20, innerWidth / 2 - w / 2 - 120 + k * 26), y: 60 + k * 26, w, h, z: zz }])
  }
  const close = (id: string) => setWins(ws => ws.filter(x => x.id !== id))
  const focus = (id: string) => { z.current += 1; const zz = z.current; setWins(ws => ws.map(x => (x.id === id ? { ...x, z: zz } : x))) }
  const move = (id: string) => (x: number, y: number) => setWins(ws => ws.map(w => (w.id === id ? { ...w, x, y } : w)))
  const size = (id: string) => (w: number, h: number) => setWins(ws => ws.map(x => (x.id === id ? { ...x, w, h } : x)))
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setWins(ws => { if (!ws.length) return ws; const t = ws.reduce((a, b) => (a.z > b.z ? a : b)); return ws.filter(w => w.id !== t.id) })
    }
    addEventListener('keydown', esc); return () => removeEventListener('keydown', esc)
  }, [])


  const [webUrl, setWebUrl] = useState(PARC_SOURCE)
  const browse = (url: string) => (e: React.MouseEvent) => { e.preventDefault(); setWebUrl(url); open('web', 820, Math.min(700, innerHeight - 60)) }
  const content = (w: Win) => {
    const common = { win: w, onFocus: () => focus(w.id), onMove: move(w.id), onSize: size(w.id) }
    /* Every field window works the same way: Close, Properties (its hour,
       sky and the theme, shown along the bottom until you press Done) and
       New field. The first one follows your weather until you pick. */
    const fl = fields[w.id]
    if (w.id === 'field' || fl) {
      const main = w.id === 'field'
      const p: Period = main ? curP : fl.p
      const sk: Sky = main ? curS : fl.s
      const lk = LOOKS[p][sk]
      const set = (np: Period, ns: Sky) => (main ? setPick({ p: np, s: ns }) : setFields(f => ({ ...f, [w.id]: { ...f[w.id], p: np, s: ns } })))
      const showing = main ? mainProps : !!fl.props
      const flip = () => (main ? setMainProps(v => !v) : setFields(f => ({ ...f, [w.id]: { ...f[w.id], props: !f[w.id].props } })))
      return (
        <StarWindow key={w.id} {...common} flush
          title={`Field: ${SKIES.find(x => x[0] === sk)?.[1]}, ${HOURS.find(h => h[0] === p)?.[1].toLowerCase()}${main && !pick && sky?.place ? ` in ${sky.place}` : ''}`}
          onClose={() => { close(w.id); if (!main) setFields(f => { const n = { ...f }; delete n[w.id]; return n }) }}
          buttons={[['Properties', flip], ['New field', newField]]}>
          <div className="fw">
            <div className="field">
              <AsciiCanvas breathe={lk.motion === 'breathe'} motion={lk.motion} render={lk.render} hover={lk.hover}
                lightMode={theme === 'light'} chars="▓▒░" color={lk.color ?? undefined} message={SPIEL} />
            </div>
            {/* a Star property sheet: a titled bar with Done and Reset, labels set
                right, choices joined into one row with the picked one inverted */}
            {showing && <div className="sheet">
              <div className="sheet-head">
                <span>FIELD PROPERTY SHEET</span>
                <div>
                  {main && <button className="cmd" onClick={() => setPick(null)} disabled={!pick}>Reset</button>}
                  <button className="cmd" onClick={flip}>Done</button>
                </div>
              </div>
              <div className="sheet-body">
                <span className="sheet-k">Hour</span>
                <div className="seg">{HOURS.map(([hp, l]) => <button key={hp} aria-pressed={p === hp} onClick={() => set(hp, sk)}>{l}</button>)}</div>
                <span className="sheet-k">Sky</span>
                <div className="seg">{SKIES.map(([ks, l]) => <button key={ks} aria-pressed={sk === ks} onClick={() => set(p, ks)}>{l}</button>)}</div>
                <span className="sheet-k">Display</span>
                <div className="seg">{(['light', 'dark'] as const).map(t => <button key={t} aria-pressed={theme === t} onClick={() => setTheme(t)}>{t === 'light' ? 'Light' : 'Dark'}</button>)}</div>
              </div>
            </div>}
          </div>
        </StarWindow>
      )
    }
    if (w.id === 'projects') return (
      <StarWindow key={w.id} {...common} title="Projects" onClose={() => close('projects')}>
        <div className="folder">
          <div className="folder-row folder-head"><span /><span>Name</span><span>Kind</span><span>Year</span></div>
          {ITEMS.map(it => (
            <button key={it.id} className="folder-row" aria-pressed={sel === it.id} onClick={() => { setSel(it.id); open(it.kind === 'folder' ? `folder:${it.id}` : it.id, 520, 260) }}>
              <span className="folder-ic">{PROJECT_ICON[it.id] ?? SMALL[it.kind]}</span><span>{CARDS[it.id].title}</span><span>{it.type}</span><span>{it.year}</span>
            </button>
          ))}
        </div>
      </StarWindow>
    )
    if (w.id.startsWith('folder:')) {
      const id = w.id.slice(7)
      const go = (e: Entry) => {
        if (e.kind === 'doc') open(`desc:${id}`, 780, 420)
        else if (e.href) (e.href.startsWith('http') || e.href.endsWith('.pdf') ? window.open(e.href, '_blank') : (location.href = e.href))
      }
      return (
        <StarWindow key={w.id} {...common} title={CARDS[id].title} onClose={() => close(w.id)}>
          <div className="folder">
            <div className="folder-row folder-head two"><span /><span>Name</span><span>Kind</span></div>
            {FOLDERS[id].map(e => (
              <button key={e.name} className="folder-row two" aria-pressed={sel === `${id}/${e.name}`} onClick={() => { setSel(`${id}/${e.name}`); go(e) }}>
                <span className="folder-ic">{SMALL[e.kind]}</span><span>{e.name}{e.kind === 'link' || e.kind === 'pdf' ? ' ↗' : ''}</span><span>{KIND_WORD[e.kind]}</span>
              </button>
            ))}
          </div>
        </StarWindow>
      )
    }
    if (w.id.startsWith('desc:')) {
      const c = CARDS[w.id.slice(5)]
      return (
        <StarWindow key={w.id} {...common} title={`${c.title}: Description`} onClose={() => close(w.id)}>
          <ViewPointDoc id={w.id.slice(5)} />
        </StarWindow>
      )
    }

    // a browser window: the page itself, inside the desktop
    if (w.id === 'web') return (
      <StarWindow key={w.id} {...common} flush title={SOURCES.find(x => x.url === webUrl)?.title ?? 'Browser'} onClose={() => close('web')}
        buttons={[['Open in new tab', () => window.open(webUrl, '_blank')]]}>
        <div className="web">
          <div className="web-url">{webUrl}</div>
          <iframe key={webUrl} src={webUrl} title={SOURCES.find(x => x.url === webUrl)?.title ?? 'Browser'} />
        </div>
      </StarWindow>
    )
    // the three documents, set like ViewPoint pages
    if (w.id === 'main') return (
      <StarWindow key={w.id} {...common} title="My spiel" onClose={() => close('main')}
        buttons={[['Mail', () => { location.href = 'mailto:defneg@stanford.edu' }], ['LinkedIn', () => window.open('https://linkedin.com/in/-defne', '_blank')]]}>
        <div className="vp">
          <header><h1>Defne Gen\u00e7</h1><p className="vp-sub">My spiel</p></header>
          <div className="vp-cols vp-one"><p>{SPIEL}</p></div>
        </div>
      </StarWindow>
    )
    if (w.id === 'history') return (
      <StarWindow key={w.id} {...common} title="About the Star" onClose={() => close('history')}>
        <div className="vp">
          <header><h1>Xerox</h1><p className="vp-sub">8010 Star Information System</p></header>
          <div className="vp-cols">
            <p><em>{STAR_HISTORY[0]}</em></p>
            <h2>The machine</h2>
            {STAR_HISTORY.slice(1, 3).map((t, i) => <p key={i}>{t}</p>)}
            <h2>Where it came from</h2>
            {STAR_HISTORY.slice(3, 4).map((t, i) => (
              <p key={i}>{t.split(/\[([^\]]+)\]/).map((part, k) => (k % 2 ? <a key={k} href={PARC_SOURCE} onClick={browse(PARC_SOURCE)}>{part}</a> : part))}</p>
            ))}
            <h2>Steve Jobs at PARC</h2>
            {STAR_HISTORY.slice(4).map((t, i) => <p key={i}>{t}</p>)}
            <h2>Sources</h2>
            {SOURCES.map(x => <p key={x.url} className="vp-src"><a href={x.url} onClick={browse(x.url)}>{x.title}</a>. {x.by}.</p>)}
          </div>
        </div>
      </StarWindow>
    )
    if (w.id === 'about') return (
      <StarWindow key={w.id} {...common} title="About me" onClose={() => close('about')}>
        <div className="vp">
          <header><h1>About me</h1><p className="vp-sub">Defne Gen\u00e7. Istanbul, Stanford, New York</p></header>
          <div className="vp-cols">{ABOUT_PARAS.map((t, i) => <AboutPara key={i} text={t} />)}</div>
        </div>
      </StarWindow>
    )
    const c = CARDS[w.id]
    if (!c) return null
    const ext = c.link.href.startsWith('http')
    return (
      <StarWindow key={w.id} {...common} title={c.title} onClose={() => close(w.id)}
        buttons={[['Visit', () => (ext ? window.open(c.link.href, '_blank') : (location.href = c.link.href))]]}>
        <div className="doc">
          {c.image && <img src={c.image} alt="" />}
          <p>{c.text}</p>
          {c.points && <ul>{c.points.map(t => <li key={t}>{t}</li>)}</ul>}
          <div className="link"><a href={c.link.href} target={ext ? '_blank' : undefined} rel="noreferrer">{c.link.label} ↗</a></div>
        </div>
      </StarWindow>
    )
  }

  return (
    <div className="desk-root" data-theme={theme}>
      <style>{CSS}</style>
      {wins.map(content)}
      {/* the switch back: this one is the GUI */}
      <a className="cg" href="/" title="Back to the command line">CLI <span className="cg-sep">&lt;&gt;</span> <b>GUI</b></a>
      {/* the desktop: an icon for everything, so whatever you close can come back */}
      <div className="desk">
        {[
          ...(wins.some(w => w.id === 'field' || w.id.startsWith('field-')) ? [] : [{ id: 'field', shape: 'tool' as Shape, label: 'Field', pict: DESK_ICON.field, go: () => open('field') }]),
          { id: 'about', shape: 'doc' as Shape, label: 'About me', pict: DESK_ICON.about, go: () => open('about', 680, 400) },
          ...ITEMS.map(it => ({
            id: it.kind === 'folder' ? `folder:${it.id}` : it.id, shape: (it.kind === 'folder' ? 'folder' : 'doc') as Shape,
            label: CARDS[it.id].title, pict: DESK_ICON[it.id],
            go: () => open(it.kind === 'folder' ? `folder:${it.id}` : it.id, it.kind === 'folder' ? 520 : 560, 260),
          })),
          { id: 'history', shape: 'doc' as Shape, label: 'About the Star', pict: DESK_ICON.history, go: () => open('history', 680, 400) },
          { id: 'site', shape: 'tool' as Shape, label: 'Back to site', pict: DESK_ICON.site, go: () => { location.href = '/' } },
        ].map(ic => (
          <StarIcon key={ic.id} shape={ic.shape} pict={ic.pict} label={ic.label} pressed={wins.some(w => w.id === ic.id)}
            title={ic.id === 'site' ? 'Back to the main site' : `Open ${ic.label}`} onClick={ic.go} />
        ))}
      </div>
    </div>
  )
}

const CSS = `
  .desk-root { --ink: #000; --paper: #fff; position: fixed; inset: 0; overflow: hidden; color: var(--ink); user-select: none;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    /* the Star's dotted grey desk: soft round dots on a staggered grid, which
       hold up at any zoom (a one-pixel checker beats into stripes and colour) */
    background-color: var(--desk);
    background-image: radial-gradient(var(--dot) 0.9px, transparent 1.3px), radial-gradient(var(--dot) 0.9px, transparent 1.3px);
    background-size: 6px 6px; background-position: 0 0, 3px 3px; }
  .desk-root { --desk: #b9b9b9; --dot: #6f6f6f; }
  .desk-root[data-theme="dark"] { --ink: #fff; --paper: #000; --desk: #3d3d3d; --dot: #8a8a8a; }
  .desk-root * { cursor: default; }
  .desk-root button, .desk-root a { cursor: pointer; font: inherit; color: inherit; }
  .win { position: absolute; display: flex; flex-direction: column; background: var(--paper); border: 2px solid var(--ink); }
  .head { flex-shrink: 0; height: 26px; display: flex; align-items: center; gap: 6px; padding: 0 6px; border-bottom: 2px solid var(--ink); touch-action: none;
    background: repeating-linear-gradient(to bottom, var(--ink) 0 1px, var(--paper) 1px 3px); }
  .title { margin: 0 auto; padding: 0 10px; background: var(--paper); font-size: 14px; line-height: 20px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cmd { height: 20px; padding: 0 8px; border: 1.5px solid var(--ink); border-radius: 4px; background: var(--paper); font-size: 13px !important; line-height: 1; white-space: nowrap; }
  .cmd:hover { background: var(--ink); color: var(--paper) !important; }
  .cmd:active { transform: translate(1px, 1px); }
  .body { position: relative; flex: 1; min-height: 0; display: flex; }
  .scroll { flex: 1; min-width: 0; overflow-y: auto; scrollbar-width: none; padding: 18px 22px 22px; }
  .scroll::-webkit-scrollbar { display: none; }
  .bar { flex-shrink: 0; width: 18px; border-left: 2px solid var(--ink); display: flex; flex-direction: column; }
  .bar button { height: 18px; border: 0; border-bottom: 1.5px solid var(--ink); background: var(--paper); padding: 0; font-size: 10px !important; line-height: 1; }
  .bar button:last-child { border-bottom: 0; border-top: 1.5px solid var(--ink); }
  .bar button:hover { background: var(--ink); color: var(--paper) !important; }
  .track { flex: 1; position: relative; }
  .thumb { position: absolute; left: 2px; right: 2px; background: var(--ink); }
  .grow { position: absolute; right: 0; bottom: 0; width: 18px; height: 18px; border-left: 2px solid var(--ink); border-top: 2px solid var(--ink); background: var(--paper); cursor: nwse-resize !important; touch-action: none; }
  /* the field fills its window edge to edge, in colour: the one thing on the desk that isn't one-bit */
  .field { flex: 1; min-width: 0; background: var(--paper); }
  .doc { font-family: "Times New Roman", Times, serif; font-variant-numeric: lining-nums; font-size: 17px; line-height: 1.55; }
  .doc p { margin: 0 0 0.8em; }
  .doc ul { margin: 0.4em 0 0.8em; padding-left: 1.2em; }
  .doc li { margin-bottom: 0.35em; }
  .doc img { display: block; width: 100%; height: auto; max-height: 280px; object-fit: contain; border: 1.5px solid var(--ink); margin-bottom: 14px; filter: grayscale(1) contrast(1.05); }
  .web { flex: 1; min-width: 0; display: flex; flex-direction: column; background: var(--paper); }
  .web-url { flex-shrink: 0; padding: 4px 8px; border-bottom: 1.5px solid var(--ink); font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .web iframe { flex: 1; width: 100%; border: 0; background: #fff; }
  /* while a window is dragged or resized, the page inside mustn't catch the pointer */
  .desk-root:has(.head:active, .grow:active) iframe { pointer-events: none; }
  /* ViewPoint document */
  .vp header { border-bottom: 1.5px solid var(--ink); padding-bottom: 10px; margin-bottom: 14px; }
  .vp h1 { margin: 0; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-weight: 800; font-size: 34px; line-height: 1; letter-spacing: 0.01em; text-transform: uppercase; }
  .vp-sub { margin: 6px 0 0; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 600; }
  .vp-cols { column-width: 300px; column-gap: 26px; column-rule: 1px solid var(--ink); font-family: "Times New Roman", Times, serif; font-variant-numeric: lining-nums; font-size: 15.5px; line-height: 1.5; text-align: justify; hyphens: auto; }
  .vp-cols.vp-one { column-width: auto; column-count: 1; font-size: 18px; text-align: left; }
  .vp-src { font-size: 13.5px; text-align: left; }
  .vp-cols h2 { margin: 0 0 6px; font-size: 16px; font-weight: 700; break-after: avoid; }
  .vp-cols p { margin: 0 0 12px; }
  .vp-cols p + h2, .vp-cols figure + h2 { margin-top: 16px; }
  .vp-cols em { font-style: italic; }
  .vp-cols figure { margin: 4px 0 14px; break-inside: avoid; }
  .vp-cols figure img { display: block; width: 100%; height: auto; border: 1.5px solid var(--ink); filter: grayscale(1) contrast(1.05); }
  .vp-cols figcaption { margin-top: 5px; font-size: 13px; line-height: 1.35; text-align: left; }
  .vp-cols a { color: inherit; }
  .doc .source { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 14px; margin-top: 1.2em; border-top: 1.5px solid var(--ink); padding-top: 0.8em; }
  .doc .source ul { margin: 0.4em 0 0; padding-left: 1.1em; }
  .doc .link { display: flex; justify-content: flex-end; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 14px; }
  /* a Star folder window: a list with a small icon, the name and columns */
  .folder { font-size: 14px; }
  .folder-row { display: grid; grid-template-columns: 22px 1fr 96px 44px; align-items: center; gap: 8px; width: 100%; padding: 5px 6px;
    border: 0; background: none; text-align: left; font-size: 14px !important; }
  .folder-head { border-bottom: 1.5px solid var(--ink); padding-bottom: 6px; margin-bottom: 4px; }
  button.folder-row:hover, .folder-row[aria-pressed="true"] { background: var(--ink); color: var(--paper) !important; }
  .folder-ic { display: flex; justify-content: center; }
  .folder-row.two { grid-template-columns: 22px 1fr 70px; }
  .folder-row { min-height: 30px; }
  .viewer { display: block; width: 100%; height: auto; border: 1.5px solid var(--ink); }
  .fw { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .fw .field { flex: 1; min-height: 0; }
  .fw-picks { flex-shrink: 0; display: flex; flex-direction: column; gap: 5px; padding: 7px 24px 7px 8px; border-top: 2px solid var(--ink); background: var(--paper); }
  .choice.sm { height: 21px; padding: 0 7px; font-size: 12px !important; }
  /* the desktop: Star icons in a grid down the right */
  .desk { position: absolute; right: 20px; top: 20px; z-index: 1; display: grid; grid-template-columns: repeat(2, 92px); gap: 14px 6px; }
  /* desk icons: the object on its own, its name under it */
  .sicon { width: 92px; padding: 2px; border: 0; background: none; color: var(--ink); display: flex; flex-direction: column; align-items: center; gap: 5px; }
  .sicon-pict { width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; }
  .sicon-pict svg { width: 56px; height: 56px; overflow: visible; }
  .sicon-pict svg .ob { fill: var(--paper); }
  .sicon-label { font-size: 12px; line-height: 1.15; text-align: center; padding: 1px 4px; background: var(--paper); }
  .sicon:hover .sicon-label { outline: 1.5px solid var(--ink); }
  .sicon[aria-pressed="true"] .sicon-label { background: var(--ink); color: var(--paper); }
  /* phones */
  @media (max-width: 699px) {
    .desk { left: 8px; right: 8px; top: 10px; grid-template-columns: repeat(4, 1fr); gap: 8px 4px; }
    .sicon { width: auto; }
    .sicon-pict, .sicon-pict svg { width: 42px; height: 42px; }
    .sicon-label { font-size: 11px; }
    .grow { display: none; }
    .vp h1 { font-size: 26px; }
    .head { gap: 4px; padding: 0 4px; }
    .cmd { padding: 0 6px; }
  }
  .cg { position: absolute; right: 20px; bottom: 16px; z-index: 1; padding: 4px 10px; background: var(--paper); border: 1.5px solid var(--ink);
    font-size: 13px; text-decoration: none; color: var(--ink) !important; }
  .cg b { background: var(--ink); color: var(--paper); padding: 0 4px; font-weight: 400; }
  .cg:hover { outline: 1.5px solid var(--ink); outline-offset: 1px; }
  /* property sheet */
  .sheet { flex-shrink: 0; border-top: 2px solid var(--ink); background: var(--paper); padding-right: 18px; }
  .sheet-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 5px 8px; border-bottom: 1.5px solid var(--ink); }
  .sheet-head span { font-size: 12.5px; font-weight: 700; letter-spacing: 0.04em; }
  .sheet-head div { display: flex; gap: 5px; }
  .sheet-head .cmd:disabled { opacity: 0.4; }
  .sheet-body { display: grid; grid-template-columns: max-content 1fr; gap: 7px 10px; align-items: center; padding: 9px 10px 10px; }
  .sheet-k { text-align: right; font-size: 13px; }
  .seg { display: flex; flex-wrap: wrap; justify-self: start; border: 1.5px solid var(--ink); }
  .seg button { height: 22px; padding: 0 8px; border: 0; border-right: 1.5px solid var(--ink); background: var(--paper); font-size: 12.5px !important; }
  .seg button:last-child { border-right: 0; }
  .seg button[aria-pressed="true"] { background: var(--ink); color: var(--paper) !important; }
  .seg button:hover:not([aria-pressed="true"]) { text-decoration: underline; }
  .props { font-size: 14px; display: grid; grid-template-columns: max-content 1fr; gap: 12px 16px; align-items: start; }
  .props .k { padding-top: 4px; }
  .choices { display: flex; flex-wrap: wrap; gap: 6px; }
  .choice { height: 24px; padding: 0 10px; border: 1.5px solid var(--ink); border-radius: 4px; background: var(--paper); font-size: 13px !important; }
  .choice[aria-pressed="true"] { background: var(--ink); color: var(--paper) !important; }
  .choice:hover { outline: 1.5px solid var(--ink); outline-offset: 1px; }
  .note { position: fixed; right: 12px; bottom: 10px; z-index: 5; background: var(--paper); border: 1.5px solid var(--ink); padding: 5px 10px; font-size: 14px; text-decoration: none; }
  .note:hover { background: var(--ink); color: var(--paper) !important; }
`
