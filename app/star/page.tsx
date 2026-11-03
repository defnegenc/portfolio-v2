'use client'

/* The desktop view: the site as a Xerox Star. One-bit black and white, a
   grey desk, windows with a striped header and rounded command
   buttons, pictorial tiles with the name inside, a property sheet with
   inverted choices. One window is the live field in full colour. */

import { Fragment, useEffect, useRef, useState } from 'react'
import AsciiCanvas from '@/components/AsciiCanvas'
import { useAmbient, LOOKS, periodOf, type Period, type Sky } from '@/components/ambient'
import { CARDS } from '@/components/cards'
import { ITEMS, FOLDERS, PICTURES, dirName, type Kind, type Entry } from '@/components/fs'
import { ABOUT_PARAS } from '@/components/aboutContent'
import AboutPara from '@/components/AboutPara'
import { useTheme } from '@/components/useTheme'
import { CLASSIC_ICON } from '@/components/weatherIcons'
import { readToggle, type ToggleStyle } from '@/components/siteToggle'
import { Timeline, CliGui, FIGURE_CSS } from '@/components/aboutFigures'

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
/* "About the Star": the first two lines are Defne's. The rest is told by
   the two sources, quoted where possible: {1} and {2} mark which one, and
   open it in a browser window on the desk. */
const STAR_INTRO = [
  'This interface is inspired by the Xerox Star.',
  'The Xerox Star exudes a rough charm through its primitive interface. Yet behind this powerful toy sit big ideas.',
]
const STAR_HISTORY: { h: string; paras: string[] }[] = [
  { h: 'The machine', paras: [
    '\u201cIn April of 1981, Xerox introduced the 8010 \u201cStar\u201d Information System.\u201d It was meant for offices, where \u201cprofessionals in a business or organization would have workstations on their desks\u201d to produce \u201cdocumentation, presentations, memos, and reports.\u201d {1}',
    'Its designers \u201cassumed that the target users are interested in getting their work done and not at all interested in computers.\u201d So the goal was \u201cto make the \u2018computer\u2019 as invisible to users as possible.\u201d {1}',
    'Documents were \u201cWYSIWYG\u201d: \u201cWithin the limits of screen resolution, Star documents are displayed as they will be printed, including typographic features such as boldface, italics, proportional spacing, variable font families, superscripts.\u201d Even math: \u201cA square root sign has a slot for an expression, and grows when the expression becomes large.\u201d {1}',
    'Every user began at the Desktop, \u201cwhich resembles the top of an office desk,\u201d with \u201cpictures of familiar office objects, such as documents, folders, file drawers, in-baskets, and out-baskets.\u201d The designers favoured \u201crecognition over recall, seeing and pointing over remembering and typing.\u201d As one of them wrote, \u201cthe display becomes reality.\u201d {1}',
  ] },
  { h: 'Where it came from', paras: [
    '\u201cIn 1970, Xerox established a research center in Palo Alto.\u201d Its researchers \u201cwere fond of the slogan: \u2018The best way to predict the future is to invent it.\u2019\u201d {1}',
    'Their answer was the Alto, first working in 1972, with a \u201cfull-page\u201d bitmapped display and a mouse. The mouse came from Douglas Engelbart\u2019s lab at SRI, which licensed it to Xerox in 1971. {1}',
    'Star itself \u201cwas not developed at PARC, but rather in a separate product development organization.\u201d Its designers called the Alto \u201cperhaps the largest prototyping effort in history.\u201d {1}',
  ] },
  { h: 'Steve Jobs at PARC', paras: [
    '\u201cXerox\u2019s venture capital arm had recently made an investment in Apple, and had agreed to show Apple what was going on in its lab.\u201d {2}',
    '\u201cThere were actually two visits by groups from Apple to Xerox PARC in 1979. Steve Jobs was on the second of the two.\u201d \u201cOnly a very few visitors got to look under the hood at the actual technology that made the system run. The Apple delegation led by Jobs in December 1979 was one.\u201d {2}',
  ] },
  { h: 'What happened next', paras: [
    'Star sold for \u201c$16,500 with software,\u201d a price \u201cnear that of time-shared mini-computers,\u201d while it \u201cwas, however, competing for desktop space with micro-computer-based PCs.\u201d {1}',
    'Its designers admit they \u201cdidn\u2019t pay enough attention to the \u2018other\u2019 personal computer revolution.\u201d And \u201cApple Computer learned the same lesson with its Lisa computer, and similarly replaced it with a cheaper one having a more open software architecture: Macintosh.\u201d {1}',
  ] },
]
// the Stanford Libraries page on the Apple visits
const PARC_SOURCE = 'https://web.stanford.edu/dept/SUL/sites/mac/parc.html'
/* Links open in a browser window on the desk. Sites that refuse to be shown
   inside another site (LinkedIn) open in a new tab. arXiv's
   abstract page refuses frames, its PDF doesn't. */
const NO_FRAME = ['linkedin.com']
const framable = (url: string) => !NO_FRAME.some(d => url.includes(d))
// PDFs open without the viewer's thumbnail sidebar, fitted to the window's width
const embedOf = (url: string) => {
  const u = url.replace('arxiv.org/abs/', 'arxiv.org/pdf/')
  return /\.pdf$|arxiv\.org\/pdf\//.test(u) ? `${u}#navpanes=0&view=FitH` : u
}
// the sources, each opens in a browser window on the desk
// numbered in the order the text cites them
const SOURCES: { title: string; by: string; url: string }[] = [
  { title: 'The Xerox Star: A Retrospective', by: 'Johnson, Roberts, Verplank et al., IEEE Computer, 1989. Written by the Star\u2019s designers', url: 'https://perso.lisn.upsaclay.fr/mbl/FundHCI/papers/XeroxStar-Computer89.pdf' },
  { title: 'The Xerox PARC Visit', by: 'Stanford Libraries', url: PARC_SOURCE },
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
  // defne.io itself: a screen showing this desk
  self: <svg viewBox="0 0 44 44" {...OB}><rect x="3" y="5" width="38" height="26" rx="1" className="ob" /><path d="M16 39h12M22 31v8" /><rect x="7" y="9" width="18" height="14" /><path d="M7 11.5h18" /><rect x="29" y="9" width="5" height="5" /><rect x="29" y="17" width="5" height="5" /></svg>,
  site: <svg viewBox="0 0 44 44" {...OB}><rect x="3" y="7" width="38" height="30" rx="1" className="ob" /><path d="M3 13h38" /><text x="8" y="25" fontSize="9" {...TX} fontFamily="Menlo, monospace">%</text><path d="M15 25.5h6" /></svg>,
  // the field: a screen of squares
  field: <svg viewBox="0 0 44 44" {...OB}><rect x="3" y="5" width="38" height="28" rx="1" className="ob" /><path d="M16 39h12M22 33v6" /><path d="M8 10h4v4H8zM16 10h4v4h-4zM24 14h4v4h-4zM32 10h4v4h-4zM8 20h4v4H8zM20 22h4v4h-4zM28 22h4v4h-4z" fill="currentColor" stroke="none" /></svg>,
}

/* Icons can be dragged anywhere on the desk and dropped; a click without a
   drag opens them. Where you left each one is remembered. */
type Offsets = Record<string, { x: number; y: number }>
function StarIcon({ pict, label, pressed, title, onClick, at, onMove }: {
  shape: Shape; pict: React.ReactNode; label: string; pressed: boolean; title: string; onClick: () => void
  at?: { x: number; y: number }; onMove: (x: number, y: number) => void
}) {
  const [dragging, setDragging] = useState(false)
  const down = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    const sx = e.clientX, sy = e.clientY, ox = at?.x ?? 0, oy = at?.y ?? 0
    let moved = false
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy
      if (!moved && Math.hypot(dx, dy) < 5) return
      moved = true; setDragging(true)
      onMove(ox + dx, oy + dy)
    }
    const up = () => {
      removeEventListener('pointermove', move); removeEventListener('pointerup', up)
      setDragging(false)
      if (!moved) onClick()
    }
    addEventListener('pointermove', move); addEventListener('pointerup', up)
  }
  // the object, then its name under it; the name inverts while open
  return (
    <button className={dragging ? 'sicon dragging' : 'sicon'} aria-pressed={pressed} title={title}
      onPointerDown={down} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      style={at ? { transform: `translate(${at.x}px, ${at.y}px)` } : undefined}>
      <span className="sicon-pict">{pict}</span>
      <span className="sicon-label">{label}</span>
    </button>
  )
}


/* A project's Description, set like a page made on the Star: a bold title,
   the overview beside its first figure, the subtitle in italics, then the
   highlights in narrow columns and the other figures in a row. */
function ViewPointDoc({ id, onOpen }: { id: string; onOpen: (url: string, title: string) => void }) {
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
    <div className="vp vp2">
      <h1 className="vp2-title">{c.title}</h1>
      <div className={pics[0] ? 'vp2-top' : 'vp2-top vp2-solo'}>
        <div>
          <p className="vp2-lede">{c.text}</p>
          {SUBTITLE[id] && <p className="vp2-sub"><em>{SUBTITLE[id]}</em></p>}
        </div>
        {pics[0] && fig(pics[0], 1)}
      </div>
      {c.points && <div className="vp2-cols">{c.points.map(runIn)}</div>}
      {pics.length > 1 && <div className="vp2-figs">{pics.slice(1).map((pc, i) => fig(pc, i + 2))}</div>}
      <p className="vp2-visit"><a href={c.link.href} target="_blank" rel="noreferrer" onClick={e => { e.preventDefault(); onOpen(c.link.href, c.link.label) }}>{c.link.label} ↗</a></p>
    </div>
  )
}

type Win = { id: string; x: number; y: number; w: number; h: number; z: number }

function StarWindow({ win, title, buttons = [], end, onClose, onFocus, onMove, onSize, flush = false, children }: {
  win: Win; title: string; buttons?: [string, () => void][]; end?: React.ReactNode; onClose?: () => void; onFocus: () => void
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
        {end && <span className="head-end" onPointerDown={e => e.stopPropagation()}>{end}</span>}
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

/* The Star's user interface as one diagram, redrawn after the one in
   Xerox's own materials: the display, keyboard and mouse in the middle, the
   document objects, desk icons and universal commands around them. Each part
   is clickable and opens its properties underneath, like a Star property sheet.
   The facts are from the designers' retrospective (Johnson et al., 1989). */
type Part = 'display' | 'objects' | 'icons' | 'commands' | 'mouse'
const PARTS: Record<Part, { name: string; text: string }> = {
  display: { name: 'Display', text: 'A 17-inch bitmapped screen at 72 pixels per inch, the same as a printer’s points, so documents look on screen as they will print.' },
  objects: { name: 'Document objects', text: 'Everything inside a document is an object you can select: a page, text down to a character or paragraph, a frame holding graphics, a table, an equation or text, a field, a footnote. Each one has its own property sheet.' },
  icons: { name: 'Icons', text: 'Pictures of the things in an office: documents, folders, file drawers, in- and out-baskets, printers, a calculator. You open one to see what’s inside. Printing is a Copy to the printer icon, and mail is a Move to the out-basket.' },
  commands: { name: 'Universal commands', text: 'The same few commands work on every kind of object, each on its own key at the sides of the keyboard. You select a thing first, then press what to do with it.' },
  mouse: { name: 'Mouse', text: 'Two buttons, between Apple’s one and most others’ three. The designers’ studies found one button traded fewer button mix-ups for more selection errors.' },
}
// the labels, as they appear on Xerox's own diagram of the Star
const DG_OBJECTS: [string, number][] = [['Page', 0], ['Text', 0], ['character', 1], ['paragraph', 1], ['Frame', 0], ['Graphics', 1], ['line', 2], ['symbol', 2], ['chart', 2], ['Table', 1], ['Equation', 1], ['Text', 1], ['Field', 0], ['Footnote', 0]]
const DG_ICONS = ['Document', 'Record File', 'Folder', '', 'File Drawer', 'In- and Out-Baskets', 'Printer', 'Floppy Disk Drive', 'User and User Group', 'Calculator', 'Terminal Emulators', 'Checker', 'Directory']
const DG_COMMANDS = ['Delete', 'Copy', 'Move', 'Show Properties', 'Copy Properties', 'Again', 'Undo', 'Help']

function StarDiagram() {
  const [part, setPart] = useState<Part>('display')
  const on = (p: Part) => part === p
  const pick = (p: Part) => ({ onClick: () => setPart(p), className: `dg-hit${on(p) ? ' dg-on' : ''}`, role: 'button' as const, tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPart(p) } } })
  const ink = { stroke: 'currentColor', fill: 'none' }
  const dash = { stroke: 'currentColor', strokeWidth: 1, strokeDasharray: '3 3', fill: 'none' }
  const head = (t: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' = 'start') => <text x={x} y={y} textAnchor={anchor} className="dg-head">{t}</text>
  // the object list: bold top level, lighter and indented below it
  let oy = 180
  const objects = DG_OBJECTS.map(([t, lvl], i) => {
    if (i && lvl === 0) oy += 14
    const y = oy; oy += lvl === 0 ? 22 : 20
    return <text key={i} x={46 + lvl * 26} y={y} className={lvl === 0 ? 'dg-item' : 'dg-sub'}>{t}</text>
  })
  return (
    <div className="dg">
      <svg viewBox="0 0 800 820" className="dg-svg" aria-label="The Xerox Star user interface">
        <defs>
          <pattern id="dg-dots" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="1.4" height="1.4" fill="currentColor" /></pattern>
        </defs>
        <text x="400" y="70" textAnchor="middle" className="dg-title"><tspan className="dg-xerox">XEROX</tspan> STAR User-Interface</text>

        {/* document objects */}
        <g {...pick('objects')}>
          {head('DOCUMENT OBJECTS', 40, 140)}
          {objects}
          <path d="M150 250 L300 290" {...dash} />
          <path d="M140 332 L302 372" {...dash} />
          <rect x="292" y="258" width="112" height="152" fill="var(--paper)" stroke="currentColor" strokeWidth={on('objects') ? 3 : 1.5} />
          {[0, 1, 2, 3, 4, 5].map(i => <line key={i} x1="300" x2="340" y1={272 + i * 7} y2={272 + i * 7} stroke="currentColor" strokeWidth="1" />)}
          <rect x="348" y="268" width="46" height="62" {...ink} strokeWidth="1.5" />
          {[[358, 304, 18], [368, 296, 26], [378, 308, 14]].map(([x, y, h]) => <rect key={x} x={x} y={y} width="6" height={h} fill="currentColor" />)}
          <rect x="300" y="346" width="42" height="52" {...ink} strokeWidth="1" strokeDasharray="2 2" />
          <path d="M309 356 h10 v10 h-10z M313 366 v18 h8 M321 372 h10 v8 h-10z M321 380 h10 v8 h-10z" {...ink} strokeWidth="1.2" />
          {[0, 1, 2, 3, 4, 5].map(i => <line key={i} x1="350" x2="394" y1={348 + i * 8} y2={348 + i * 8} stroke="currentColor" strokeWidth="1" />)}
        </g>

        {/* the display: a monitor with a dotted screen */}
        <g {...pick('display')}>
          {head('DISPLAY', 400, 222, 'middle')}
          <rect x="268" y="234" width="264" height="200" rx="3" {...ink} strokeWidth={on('display') ? 4.5 : 3} />
          <rect x="284" y="248" width="232" height="170" fill="url(#dg-dots)" stroke="currentColor" strokeWidth="1.2" opacity="0.9" />
          <path d="M400 434 V462" {...ink} strokeWidth="3" />
        </g>

        {/* icons down the right of the screen */}
        <g {...pick('icons')}>
          {head('ICONS', 712, 140, 'middle')}
          {DG_ICONS.map((t, i) => t && <text key={t} x="618" y={180 + i * 19.5} className="dg-sub">{t}</text>)}
          {[[452, 262], [452, 286], [452, 310], [476, 310], [476, 334]].map(([x, y]) => <rect key={`${x}${y}`} x={x} y={y} width="18" height="18" fill="var(--paper)" stroke="currentColor" strokeWidth={on('icons') ? 3 : 2} />)}
          <path d="M496 292 L612 292" {...dash} />
        </g>

        {/* keyboard: function keys along the top, command keys at both sides */}
        <g {...pick('commands')}>
          <rect x="256" y="464" width="276" height="98" {...ink} strokeWidth="2.5" />
          {Array.from({ length: 7 }, (_, i) => <rect key={i} x={326 + i * 21} y="476" width="19" height="13" {...ink} strokeWidth="1.2" />)}
          <rect x="316" y="498" width="172" height="40" {...ink} strokeWidth="1.5" />
          <rect x="330" y="545" width="146" height="9" {...ink} strokeWidth="1.2" />
          {[264, 498].map(x => <g key={x}>
            <rect x={x} y="496" width="28" height="44" fill={on('commands') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2" />
            {[1, 2, 3].map(r => <line key={r} x1={x} x2={x + 28} y1={496 + r * 11} y2={496 + r * 11} stroke={on('commands') ? 'var(--paper)' : 'currentColor'} strokeWidth="1" />)}
            <line x1={x + 14} x2={x + 14} y1="496" y2="540" stroke={on('commands') ? 'var(--paper)' : 'currentColor'} strokeWidth="1" />
          </g>)}
          {head('KEYBOARD', 400, 590, 'middle')}
          <path d="M268 562 L236 612" {...dash} />
          {head('UNIVERSAL COMMANDS', 90, 632)}
          {DG_COMMANDS.map((t, i) => <text key={t} x="112" y={666 + i * 19} className="dg-sub">{t}</text>)}
        </g>

        {/* mouse, on its cable: Select and Adjust */}
        <g {...pick('mouse')}>
          <path d="M432 464 V452 H574 V478" {...ink} strokeWidth="2" />
          <rect x="554" y="478" width="40" height="52" {...ink} strokeWidth={on('mouse') ? 3.5 : 2} />
          <rect x="565" y="488" width="6" height="20" fill="currentColor" />
          <rect x="577" y="488" width="6" height="20" fill="currentColor" />
          {head('MOUSE', 606, 500)}
          <path d="M568 530 L604 584" {...dash} />
          <path d="M580 530 L676 584" {...dash} />
          <text x="604" y="604" textAnchor="middle" className="dg-item">Select</text>
          <text x="680" y="604" textAnchor="middle" className="dg-item">Adjust</text>
        </g>
      </svg>
      {/* the clicked part's properties, as a Star property sheet */}
      <div className="dg-sheet">
        <div className="dg-sheet-head">{PARTS[part].name.toUpperCase()} PROPERTIES</div>
        <p>{PARTS[part].text}</p>
      </div>
    </div>
  )
}

/* The Star versions of the CLI <> GUI switch; the terminal ones live on the
   CLI side, and both follow the same pick (components/siteToggle). */
function GuiToggle() {
  const [style, setStyle] = useState<ToggleStyle>('sheet')
  useEffect(() => { setStyle(readToggle()) }, [])
  const cli = { href: '/cli', title: 'Back to the command line' }
  if (style === 'radio') return (
    <span className="cg cg-radio">
      <span className="cg-k">Interface</span>
      <a {...cli}><i />CLI</a><span><i data-on="1" />GUI</span>
    </span>
  )
  if (style === 'keys') return (
    <span className="cg cg-keys"><a {...cli} className="cmd">CLI</a><b className="cmd">GUI</b></span>
  )
  if (style === 'icons') return (
    <span className="cg cg-icons">
      <a {...cli}><span className="cg-pict">{DESK_ICON.site}</span><span>CLI</span></a>
      <b><span className="cg-pict">{DESK_ICON.history}</span><span>GUI</span></b>
    </span>
  )
  return <span className="cg"><span className="cg-k">Interface</span><span className="cg-seg"><a {...cli}>CLI</a><b>GUI</b></span></span>
}

// projects that open as themselves instead of a folder or description
const DIRECT: Record<string, string> = { sponge: '/sponge/index.html?embed=1', kilim: '/kilim/index.html', bloom: 'https://stanfordhci.github.io/Bloom/' }

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
  // where each desk icon has been dragged to, kept between visits
  const [iconAt, setIconAt] = useState<Offsets>({})
  const iconsLoaded = useRef(false)
  useEffect(() => { try { setIconAt(JSON.parse(localStorage.getItem('star-icons') ?? '{}')) } catch {} iconsLoaded.current = true }, [])
  useEffect(() => { if (iconsLoaded.current) localStorage.setItem('star-icons', JSON.stringify(iconAt)) }, [iconAt])
  // About the Star: the history, or the clickable diagram
  const [histTab, setHistTab] = useState<'history' | 'diagram'>('history')
  /* Going to the terminal and back keeps the desk as you left it: the open
     windows, extra fields, the browser page and the About the Star tab live
     in this tab's session. */
  const restored = useRef(false)
  /* A copy of the desk inside a window (reached from the terminal inside it)
     never restores or saves the session: they share it with this tab, and
     restoring the window that holds it would nest on its own. */
  const nested = useRef(false)
  useEffect(() => { nested.current = window.self !== window.top }, [])
  /* first layout: the field top left, defne.io's command line under it as
     the hero, About me on the right. The projects wait on the desk as icons. */
  useEffect(() => {
    try {
      if (window.self !== window.top) throw 0
      const saved = JSON.parse(sessionStorage.getItem('star-session-2') ?? 'null')
      if (saved?.wins?.length && !new URLSearchParams(location.search).get('open')) {
        setWins(saved.wins.filter((w: Win) => w.id !== 'web')); setFields(saved.fields ?? {}); fieldN.current = saved.fieldN ?? 0
        setWebTitles(saved.webTitles ?? {})
        if (saved.histTab) setHistTab(saved.histTab)
        z.current = Math.max(3, ...saved.wins.map((w: Win) => w.z)) + 1
        restored.current = true
        return
      }
    } catch {}
    restored.current = true
    if (innerWidth < 700) {
      // phones: the icons take the top, the field the rest
      const top = Math.min(300, Math.round(innerHeight * 0.38))
      setWins([{ id: 'field', x: 8, y: top, w: innerWidth - 16, h: innerHeight - top - 8, z: 2 }])
      z.current = 3
      return
    }
    // the desktop icons take a column on the right
    // the icons take 20 + 2 × 92 + 6 px on the right; the windows stop short of them
    const W = innerWidth - 222, H = innerHeight, m = 28, g = 16
    const leftW = Math.round((W - m * 2 - g) * 0.6), rightW = W - m * 2 - g - leftW
    const fieldH = Math.round((H - m * 2 - g) * 0.6), siteH = H - m * 2 - g - fieldH
    const first: Win[] = [
      { id: 'field', x: m, y: m, w: leftW, h: fieldH, z: 2 },
      { id: 'cli-site', x: m, y: m + fieldH + g, w: leftW, h: siteH, z: 3 },
      { id: 'about', x: m + leftW + g, y: m, w: rightW, h: H - m * 2, z: 4 },
    ]
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


  // every page opens in its own browser window, keyed by its address
  const [webTitles, setWebTitles] = useState<Record<string, string>>({})
  const openWeb = (url: string, title?: string) => {
    if (!framable(url)) { window.open(url, '_blank'); return }
    if (title) setWebTitles(t => ({ ...t, [url]: title }))
    open('web:' + url, 820, Math.min(700, innerHeight - 60))
  }
  const browse = (url: string) => (e: React.MouseEvent) => { e.preventDefault(); openWeb(url) }
  useEffect(() => {
    if (!restored.current || nested.current) return
    try { sessionStorage.setItem('star-session-2', JSON.stringify({ wins, fields, fieldN: fieldN.current, webTitles, histTab })) } catch {}
  }, [wins, fields, webTitles, histTab])   // eslint-disable-line react-hooks/exhaustive-deps
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
          buttons={[['Properties', flip]]}
          end={<button className="cmd cmd-black" onClick={newField} title="New field" >New field <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden><path d="M5 0v10M0 5h10" stroke="currentColor" strokeWidth="2" /></svg></button>}>
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
                {/* the classic pixel weather icons belong here, in the GUI */}
                <div className="seg seg-ic">{SKIES.map(([ks, l]) => { const I = CLASSIC_ICON[ks]; return <button key={ks} aria-pressed={sk === ks} onClick={() => set(p, ks)} aria-label={l} title={l}><I /></button> })}</div>
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
        else if (e.href) openWeb(e.href, `${CARDS[id].title}: ${e.name}`)
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
          <ViewPointDoc id={w.id.slice(5)} onOpen={openWeb} />
        </StarWindow>
      )
    }

    // the terminal: defne.io's command line, in a window on its own desk
    // the terminal: just a shell, working, on its own
    if (w.id === 'term') return (
      <StarWindow key={w.id} {...common} flush title="Terminal" onClose={() => close('term')}>
        <div className="web"><iframe src="/cli?only=shell" title="Terminal" /></div>
      </StarWindow>
    )
    // defne.io's command line, in a window on its own desk
    if (w.id === 'cli-site') return (
      <StarWindow key={w.id} {...common} flush title="defne.io" onClose={() => close('cli-site')}
        buttons={[['Full screen', () => { location.href = '/cli' }]]}>
        <div className="web"><iframe src="/cli" title="defne.io, the command line" /></div>
      </StarWindow>
    )
    // a browser window: the page itself, inside the desktop
    if (w.id.startsWith('web:')) {
      const url = w.id.slice(4)
      const title = webTitles[url] ?? SOURCES.find(x => x.url === url)?.title ?? 'Browser'
      return (
        <StarWindow key={w.id} {...common} flush title={title} onClose={() => close(w.id)}
          buttons={[['Open in new tab', () => window.open(url, '_blank')]]}>
          <div className="web">
            <div className="web-url">{url}</div>
            <iframe src={embedOf(url)} title={title} />
          </div>
        </StarWindow>
      )
    }
    // the three documents, set like ViewPoint pages
    if (w.id === 'main') return (
      <StarWindow key={w.id} {...common} title="My spiel" onClose={() => close('main')}
        buttons={[['Mail', () => { location.href = 'mailto:defneg@stanford.edu' }], ['LinkedIn', () => window.open('https://linkedin.com/in/-defne', '_blank')]]}>
        <div className="vp">
          <header><h1>Defne Genç</h1><p className="vp-sub">My spiel</p></header>
          <div className="vp-cols vp-one"><p>{SPIEL}</p></div>
        </div>
      </StarWindow>
    )
    if (w.id === 'history') return (
      <StarWindow key={w.id} {...common} title="About the Star" onClose={() => close('history')}>
        {/* a property sheet's Display row picks what the window shows */}
        <div className="hist-tabs">
          <span className="sheet-k">Display</span>
          <div className="seg">{(['history', 'diagram'] as const).map(t => <button key={t} aria-pressed={histTab === t} onClick={() => setHistTab(t)}>{t.toUpperCase()}</button>)}</div>
        </div>
        {histTab === 'diagram' ? <div className="vp"><StarDiagram /></div> : <div className="vp">
          <header><h1>Xerox</h1><p className="vp-sub">8010 Star Information System</p></header>
          <div className="vp-cols">
            <p><em>{STAR_INTRO[0]}</em></p>
            <p>{STAR_INTRO[1]}</p>
            {STAR_HISTORY.map(sec => <Fragment key={sec.h}>
              <h2>{sec.h}</h2>
              {sec.paras.map(t => <p key={t}>{t.split(/\{(\d)\}/).map((part, k) => (k % 2
                ? <sup key={k}><a href={SOURCES[+part - 1].url} onClick={browse(SOURCES[+part - 1].url)} title={SOURCES[+part - 1].title}>[{part}]</a></sup>
                : part))}</p>)}
            </Fragment>)}
            <h2>Sources</h2>
            {SOURCES.map((x, i) => <p key={x.url} className="vp-src">[{i + 1}] <a href={x.url} onClick={browse(x.url)}>{x.title}</a>. {x.by}.</p>)}
          </div>
        </div>}
      </StarWindow>
    )
    if (w.id === 'about') return (
      <StarWindow key={w.id} {...common} title="About me" onClose={() => close('about')}>
        <div className="vp">
          <header><h1>About me</h1><p className="vp-sub">Defne Genç. Istanbul, Stanford, New York</p></header>
          {/* each figure sits right after the paragraph it illustrates */}
          <div className="vp-cols vp-flow">
            {/* how to get around, in plain words, before anything else */}
            <p className="vp-guide"><em>You can browse my projects on the right. At the bottom right of the screen you can switch to the CLI.</em></p>
            <AboutPara text={ABOUT_PARAS[0]} side="gui" />
            <AboutPara text={ABOUT_PARAS[1]} side="gui" />
            <figure className="g-star g-fig">
              <CliGui here="gui" />
              <figcaption><em>Figure 1:</em> This site, as a CLI and as a GUI. Click the CLI to switch.</figcaption>
            </figure>
            <AboutPara text={ABOUT_PARAS[2]} side="gui" />
            <figure className="g-star g-fig">
              <Timeline />
              <figcaption><em>Figure 2:</em> Where I lived, school and work.</figcaption>
            </figure>
          </div>
        </div>
      </StarWindow>
    )
    const c = CARDS[w.id]
    if (!c) return null
    const ext = c.link.href.startsWith('http')
    return (
      <StarWindow key={w.id} {...common} title={c.title} onClose={() => close(w.id)}
        buttons={[['Visit', () => openWeb(c.link.href, c.title)]]}>
        <div className="doc">
          {c.image && <img src={c.image} alt="" />}
          <p>{c.text}</p>
          {c.points && <ul>{c.points.map(t => <li key={t}>{t}</li>)}</ul>}
          <div className="link"><a href={c.link.href} target={ext ? '_blank' : undefined} rel="noreferrer" onClick={e => { e.preventDefault(); openWeb(c.link.href, c.title) }}>{c.link.label} ↗</a></div>
        </div>
      </StarWindow>
    )
  }

  return (
    <div className="desk-root" data-theme={theme}>
      <style>{CSS + FIGURE_CSS}</style>
      {wins.map(content)}
      {/* the switch back: this one is the GUI */}
      {/* the same switch as the CLI side: a Star property sheet choice */}
      <GuiToggle />
      {/* the desktop: an icon for everything, so whatever you close can come back */}
      <div className="desk">
        {[
          { id: 'about', shape: 'doc' as Shape, label: 'About me', pict: DESK_ICON.about, go: () => open('about', 680, 400) },
          ...ITEMS.map(it => ({
            id: it.kind === 'folder' ? `folder:${it.id}` : it.id, shape: (it.kind === 'folder' ? 'folder' : 'doc') as Shape,
            label: CARDS[it.id].title, pict: DESK_ICON[it.id],
            // the tidbits open themselves, in a browser window on the desk
            go: () => (DIRECT[it.id] ? openWeb(DIRECT[it.id], CARDS[it.id].title) : open(it.kind === 'folder' ? `folder:${it.id}` : it.id, it.kind === 'folder' ? 520 : 560, 260)),
          })),
          { id: 'history', shape: 'doc' as Shape, label: 'About the Star', pict: DESK_ICON.history, go: () => open('history', 680, 400) },
          // the terminal opens as a window on the desk: the CLI site, running inside the GUI
          { id: 'site', shape: 'tool' as Shape, label: 'Terminal', pict: DESK_ICON.site, go: () => open('term', 900, Math.min(640, innerHeight - 60)) },
          { id: 'self', shape: 'tool' as Shape, label: 'defne.io', pict: DESK_ICON.self, go: () => open('cli-site', 900, Math.min(560, innerHeight - 60)) },
          ...(wins.some(w => w.id === 'field' || w.id.startsWith('field-')) ? [] : [{ id: 'field', shape: 'tool' as Shape, label: 'Field', pict: DESK_ICON.field, go: () => open('field') }]),
        ].map(ic => (
          <StarIcon key={ic.id} shape={ic.shape} pict={ic.pict} label={ic.label} pressed={wins.some(w => w.id === ic.id)}
            title={ic.id === 'site' ? 'Back to the main site' : `Open ${ic.label}`} onClick={ic.go}
            at={iconAt[ic.id]} onMove={(x, y) => setIconAt(a => ({ ...a, [ic.id]: { x, y } }))} />
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
  /* the Star page layout */
  .vp2 { font-family: "Times New Roman", Times, serif; font-variant-numeric: lining-nums; font-size: 15.5px; line-height: 1.5; }
  .vp2 .vp2-title { text-transform: none; letter-spacing: 0; margin: 0 0 10px; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-weight: 700; font-size: 24px; line-height: 1.15; }
  .vp2-top { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 22px; align-items: start; padding-bottom: 14px; border-bottom: 1.5px solid var(--ink); }
  .vp2-top.vp2-solo { grid-template-columns: 1fr; }
  .vp2-lede { margin: 0 0 10px; font-size: 17px; line-height: 1.45; }
  .vp2-sub { margin: 0; }
  .vp2 figure { margin: 0; }
  .vp2 figure img { display: block; width: 100%; height: auto; border: 1.5px solid var(--ink); filter: grayscale(1) contrast(1.05); }
  .vp2 figcaption { margin-top: 5px; font-size: 13px; line-height: 1.35; }
  .vp2-cols { margin-top: 14px; max-width: 62ch; }
  .vp2-cols p { margin: 0 0 10px; break-inside: avoid; }
  .vp2-figs { margin-top: 14px; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
  .vp2-visit { margin: 14px 0 0; }
  .vp2 a { color: inherit; }
  @media (max-width: 640px) { .vp2-top { grid-template-columns: 1fr; } }
  .vp header { border-bottom: 1.5px solid var(--ink); padding-bottom: 10px; margin-bottom: 14px; }
  .vp h1 { margin: 0; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-weight: 800; font-size: 34px; line-height: 1; letter-spacing: 0.01em; text-transform: uppercase; }
  .vp-sub { margin: 6px 0 0; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 600; }
  .vp-cols { column-width: 300px; column-gap: 26px; column-rule: 1px solid var(--ink); font-family: "Times New Roman", Times, serif; font-variant-numeric: lining-nums; font-size: 15.5px; line-height: 1.5; text-align: justify; hyphens: auto; }
  /* one column, so figures can sit between paragraphs */
  .vp-cols.vp-flow { column-width: auto; column-count: 1; }
  .vp-guide { padding: 8px 10px; border: 1.5px solid var(--ink); text-align: left !important; }
  .vp-flow .g-fig { margin: 6px 0 16px; padding-top: 0; border-top: 0; text-align: left; }
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
  .fw .field { flex: 1; min-height: 0; position: relative; }
  .fw-picks { flex-shrink: 0; display: flex; flex-direction: column; gap: 5px; padding: 7px 24px 7px 8px; border-top: 2px solid var(--ink); background: var(--paper); }
  .choice.sm { height: 21px; padding: 0 7px; font-size: 12px !important; }
  /* the desktop: Star icons in a grid down the right */
  .desk { position: absolute; right: 20px; top: 20px; display: grid; grid-template-columns: repeat(2, 92px); gap: 14px 6px; }
  /* desk icons: the object on its own, its name under it */
  .sicon { width: 92px; padding: 2px; border: 0; background: none; color: var(--ink); display: flex; flex-direction: column; align-items: center; gap: 5px; }
  .sicon-pict { width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; }
  .sicon-pict svg { width: 56px; height: 56px; overflow: visible; }
  .sicon-pict svg .ob { fill: var(--paper); }
  .sicon-label { font-size: 12px; line-height: 1.15; text-align: center; padding: 1px 4px; background: var(--paper); }
  .sicon:hover .sicon-label { outline: 1.5px solid var(--ink); }
  /* icons sit under windows, but one being dragged rides above everything */
  .desk-root .sicon { position: relative; z-index: 1; touch-action: none; cursor: grab; }
  .desk-root .sicon.dragging { cursor: grabbing; z-index: 1000; }
  .sicon.dragging .sicon-label { background: var(--ink); color: var(--paper); }
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
  /* the CLI <> GUI switch, styled the same as on the homepage */
  .cg { position: absolute; right: 20px; bottom: 16px; z-index: 1; display: inline-flex; align-items: center; gap: 0.6rem; color: var(--ink); font-size: 14px; }
  .cg-k { font-weight: 600; background: var(--paper); padding: 0 4px; }
  .cg-seg { display: inline-flex; border: 1.5px solid var(--ink); background: var(--paper); }
  .cg-seg > * { height: 28px; display: flex; align-items: center; padding: 0 12px; font-weight: 400; color: var(--ink); text-decoration: none; font-family: inherit; }
  .cg-seg > * + * { border-left: 1.5px solid var(--ink); }
  .cg-seg b { background: var(--ink); color: var(--paper); }
  .cg-seg a:hover { text-decoration: underline; }
  .cg-radio { gap: 0.9rem; }
  .cg-radio > a, .cg-radio > span:not(.cg-k) { display: inline-flex; align-items: center; gap: 6px; color: var(--ink); text-decoration: none; background: var(--paper); padding: 0 4px; }
  .cg-radio i { width: 13px; height: 13px; border: 1.5px solid var(--ink); border-radius: 50%; background: var(--paper); position: relative; }
  .cg-radio i[data-on="1"]::after { content: ''; position: absolute; inset: 2px; border-radius: 50%; background: var(--ink); }
  .cg-radio > a:hover { text-decoration: underline; }
  .cg-keys { gap: 6px; }
  .cg-keys .cmd { height: 26px; display: inline-flex; align-items: center; padding: 0 12px; text-decoration: none; color: var(--ink); font-weight: 400; }
  .cg-keys b.cmd { background: var(--ink); color: var(--paper) !important; }
  .cg-keys a.cmd:hover { background: var(--ink); color: var(--paper) !important; }
  .cg-icons { gap: 10px; align-items: flex-end; }
  .cg-icons > * { display: flex; flex-direction: column; align-items: center; gap: 3px; color: var(--ink); text-decoration: none; font-weight: 400; }
  .cg-pict { width: 40px; height: 34px; display: flex; align-items: center; justify-content: center; }
  .cg-pict svg { width: 40px; height: 34px; }
  .cg-icons > * > span:last-child { background: var(--paper); padding: 0 4px; }
  .cg-icons > b > span:last-child { background: var(--ink); color: var(--paper); }
  /* property sheet */
  /* a black command button at the right end of a title bar */
  .head-end { margin-left: auto; display: flex; }
  .cmd.cmd-black { display: flex; align-items: center; justify-content: center; gap: 5px; background: var(--ink); color: var(--paper) !important; border-color: var(--ink); min-width: 28px; }
  .cmd.cmd-black:hover { background: var(--paper); color: var(--ink) !important; }
  .g-star { --g-bg: var(--paper); --g-ink: var(--ink); --g-accent: var(--ink); }
  .g-fig { margin: 18px 0 4px; padding-top: 14px; border-top: 1.5px solid var(--ink); }
  .g-fig figcaption { margin-top: 6px; font-family: "Times New Roman", Times, serif; font-size: 13px; }
  .hist-tabs { display: flex; align-items: center; gap: 10px; padding: 7px 10px; border-bottom: 1.5px solid var(--ink); background: var(--paper); flex-shrink: 0; }
  .dg { max-width: 760px; }
  .dg-svg { width: 100%; height: auto; display: block; color: var(--ink); }
  .dg-hit { cursor: pointer; outline: none; }
  .dg-title { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 22px; font-weight: 700; fill: currentColor; }
  .dg-xerox { font-size: 30px; font-weight: 400; letter-spacing: 0.02em; }
  .dg-head { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; fill: currentColor; }
  .dg-item { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 700; fill: currentColor; }
  .dg-sub { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 14px; fill: currentColor; }
  .dg-hit:hover .dg-head { text-decoration: underline; }
  .dg-on .dg-head { paint-order: stroke; stroke: var(--ink); stroke-width: 10px; stroke-linejoin: round; fill: var(--paper); }
  .dg-sheet { margin-top: 12px; border: 1.5px solid var(--ink); }
  .dg-sheet-head { padding: 5px 8px; border-bottom: 1.5px solid var(--ink); font-size: 12.5px; font-weight: 700; letter-spacing: 0.04em; }
  .dg-sheet p { padding: 10px 10px 12px; margin: 0; }
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
  .seg-ic button { height: 34px; width: 42px; padding: 0; display: flex; align-items: center; justify-content: center; }
  .seg.seg-ic button[aria-pressed="true"] { background: var(--paper); box-shadow: inset 0 0 0 2px var(--ink); color: var(--ink) !important; }
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
