'use client'

/* The project page, drawn like the homepage.

   One field runs behind the whole page, pinned to the viewport. Everything
   readable sits on solid panels; wherever there is no panel there is a window
   onto the field, framed by walls the width of the homepage's. The header is
   the homepage's 2×2: two windows across the top, the title and the facts
   below. The path bar under the header is the page's one terminal line.
   Down the page the copy keeps to the left half and the right half is
   a window, so the field scrolls past beside the text; wide figures run the
   full width and close the window while they pass. */

import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import AsciiCanvas from '@/components/AsciiCanvas'
import { ShellCtx } from '@/components/PageShell'
import { LOOKS, periodOf, type Period, type Sky } from '@/components/ambient'
import { forTheme } from '@/components/color'
import CopyBlock from './CopyBlock'
import { DIAGRAMS, type Project, type Section } from '../data'

type Listing = { slug: string; name: string; kind: string; year: string; award?: string }

// ─── the field ────────────────────────────────────────────────────────────────

/* The homepage remembers which weather cell it painted ('look') and the accent
   it resolved to ('accent'). Reading both here means the field behind this page
   is the one the visitor just left. A cold landing gets this hour's clear sky
   in the project's own colour. */
function useField(fallbackAccent: string) {
  const [look, setLook] = useState<{ color: string | null; render: 'glyphs' | 'tiles' | 'cipher' | 'letters'; motion: 'breathe' | 'trickle' | 'geometric' | 'lightning' | 'brush'; hover: 'mono' | 'rainbow' } | null>(null)
  useEffect(() => {
    let cell = LOOKS[periodOf()].clear
    let color: string | null = null
    try {
      const v = window.localStorage.getItem('look')
      if (v) { const o = JSON.parse(v) as { p: Period; s: Sky }; if (LOOKS[o.p]?.[o.s]) cell = LOOKS[o.p][o.s] }
      color = window.localStorage.getItem('accent')
    } catch {}
    // a near-grey project colour (Learning Et Al.) would paint a dead field, so
    // that one falls back to the hour's own colour
    const n = parseInt(fallbackAccent.replace('#', ''), 16)
    const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    const chromatic = Math.max(...ch) - Math.min(...ch) > 24
    setLook({ ...cell, color: cell.color === null ? null : (color ?? (chromatic ? forTheme(fallbackAccent, false) : cell.color)) })
  }, [fallbackAccent])
  return look
}

// ─── decode: dots, then scrambling glyphs in the accent, then the text ────────

const GLYPHS = '░▒▓#%&*+=/<>'
const scramble = (n: number) => Array.from({ length: n }, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join('')

function Decode({ text, by = 'word', step, onView = false }: { text: string; by?: 'word' | 'char'; step?: number; onView?: boolean }) {
  const units = useMemo(() => (by === 'char' ? Array.from(text) : text.split(' ')), [text, by])
  const BAND = by === 'char' ? 3 : 4
  const [r, setR] = useState(-BAND)
  const [go, setGo] = useState(!onView)
  const ref = useRef<HTMLSpanElement>(null)
  const [, tick] = useState(0)
  const done = r >= units.length

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setR(units.length); return }
    if (!onView || !ref.current) return
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { setGo(true); io.disconnect() } }, { threshold: 0.35 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [onView, units.length])

  useEffect(() => {
    if (!go || done) return
    const id = setTimeout(() => setR(v => v + 1), step ?? (by === 'char' ? 55 : 70))
    return () => clearTimeout(id)
  }, [go, r, done, by, step])

  useEffect(() => {
    if (!go || done) return
    const id = setInterval(() => tick(t => t + 1), 45)
    return () => clearInterval(id)
  }, [go, done])

  if (done) return <span ref={ref}>{text}</span>
  const sep = by === 'char' ? '' : ' '
  return (
    <span ref={ref} aria-label={text}>
      {units.map((u, i) => {
        const tail = i < units.length - 1 ? sep : ''
        if (u === ' ') return <span key={i}> </span>
        if (i < r) return <span key={i}>{u}{tail}</span>
        if (i < r + BAND) return <span key={i}><span className="lb-scr"><span style={{ color: 'transparent' }}>{u}</span><span className="lb-scr-g" aria-hidden>{scramble(u.length + (by === 'word' ? 1 : 0))}</span></span>{tail}</span>
        return <span key={i}><span className="lb-dot">{u}</span>{tail}</span>
      })}
    </span>
  )
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

function renderBody(text: string): React.ReactNode {
  const parts = text.split('**')
  if (parts.length === 1) return text
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="lb-strong">{part}</strong> : part))
}

// "Key: description" becomes a two-column row
function splitKey(text: string): [string, string] | null {
  const m = text.match(/^([^:"“]{2,48}):\s+(.+)$/)
  return m ? [m[1], m[2]] : null
}

const isWide = (s: Section) =>
  s.type === 'images' || s.type === 'phones' || s.type === 'diagram' || s.type === 'stats' ||
  (s.type === 'tiles' && s.items.length > 1)

type Chunk = { wide: boolean; items: { s: Section; i: number }[] }

function chunk(sections: Section[]): Chunk[] {
  const out: Chunk[] = []
  sections.forEach((s, i) => {
    const wide = isWide(s)
    const last = out[out.length - 1]
    // a heading that opens straight onto a figure travels with the figure
    if (wide && last && !last.wide && last.items.every(x => x.s.type === 'subheader')) { last.wide = true; last.items.push({ s, i }); return }
    // a new chapter opens a new run, so each chapter gets its own window
    if (!wide && last && !last.wide && s.type !== 'subheader') last.items.push({ s, i })
    else if (wide && last?.wide) last.items.push({ s, i })
    else out.push({ wide, items: [{ s, i }] })
  })
  return out
}

// a run earns a window beside it only when it has some length to it
const windowed = (c: Chunk) => {
  const words = c.items.reduce((a, { s }) => a + (s.type === 'text' ? s.body.split(' ').length : s.type === 'list' ? s.items.join(' ').split(' ').length : s.type === 'tiles' ? 80 : s.type === 'image' ? 60 : 12), 0)
  return words > 70
}

// ─── the page ─────────────────────────────────────────────────────────────────

export default function LabView({ project, listing }: { project: Project; listing: Listing[] }) {
  const { isLight } = useContext(ShellCtx)
  const look = useField(project.accentColor)

  // chapters for the path bar: every subheader, plus an opening if there is one
  const chapters = useMemo(() => {
    const out: { id: string; label: string; at: number }[] = []
    const first = project.sections.findIndex(s => s.type === 'subheader')
    if (first > 1 || first === -1) out.push({ id: 'intro', label: 'Overview', at: 0 })
    project.sections.forEach((s, i) => { if (s.type === 'subheader') out.push({ id: s.id ?? slugify(s.text), label: s.text, at: i }) })
    return out
  }, [project])

  // which chapter is under the path bar
  const [active, setActive] = useState(chapters[0]?.id)
  useEffect(() => {
    const root = document.querySelector('.shell')
    if (!root) return
    const onScroll = () => {
      const y = (document.querySelector('.lb-path') as HTMLElement | null)?.getBoundingClientRect().bottom ?? 120
      let cur = chapters[0]?.id
      for (const c of chapters) {
        const el = document.getElementById(c.id)
        if (el && el.getBoundingClientRect().top <= y + 40) cur = c.id
      }
      setActive(cur)
    }
    onScroll()
    root.addEventListener('scroll', onScroll, { passive: true })
    return () => root.removeEventListener('scroll', onScroll)
  }, [chapters])

  // keep the active tab in view when the bar scrolls sideways on a phone
  useEffect(() => {
    const el = document.querySelector(`.lb-tab[data-on="1"]`) as HTMLElement | null
    const bar = el?.parentElement
    if (el && bar && bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: el.offsetLeft - bar.offsetLeft, behavior: 'smooth' })
  }, [active])

  // the name strip's height, so the path bar can stick right under it
  useEffect(() => {
    const set = () => {
      const h = (document.querySelector('.name-strip') as HTMLElement | null)?.offsetHeight ?? 46
      document.documentElement.style.setProperty('--strip-h', `${h}px`)
    }
    set()
    window.addEventListener('resize', set)
    return () => window.removeEventListener('resize', set)
  }, [])

  const chunks = useMemo(() => chunk(project.sections), [project])
  const chapterAt = new Map(chapters.map(c => [c.at, c]))
  const numOf = (id: string) => String(chapters.findIndex(c => c.id === id) + 1).padStart(2, '0')

  const meta = [
    { k: 'Year', v: project.year },
    { k: 'Role', v: project.role },
    project.duration ? { k: 'Context', v: project.duration } : null,
    project.team ? { k: 'Team', v: project.team } : null,
    project.tools ? { k: 'Tools', v: project.tools } : null,
    project.awards ? { k: 'Awards', v: project.awards } : null,
  ].filter(Boolean) as { k: string; v: string }[]

  const hero = project.heroWide
  const heroNarrow = hero && hero.ratio < 1.6

  const block = ({ s, i }: { s: Section; i: number }) => {
    const ch = chapterAt.get(i)
    return (
      <div key={i} className={`lb-b lb-b-${s.type}`} id={ch && s.type !== 'subheader' ? ch.id : undefined}>
        {s.type === 'subheader'
          ? <h2 className="lb-h2" id={ch?.id}><span className="lb-num">{ch ? numOf(ch.id) : ''}</span>{s.text}</h2>
          : <SectionBlock s={s} />}
      </div>
    )
  }

  return (
    <div className="lb">
      <style>{CSS}</style>

      {/* the field, pinned to the viewport behind everything */}
      <div className="lb-field" aria-hidden>
        {look && (
          <AsciiCanvas render={look.render} motion={look.motion} hover={look.hover} breathe={look.motion === 'breathe'}
            lightMode={isLight} chars="▓▒░" color={look.color ?? undefined}
            rest={look.motion === 'breathe' ? undefined : 0.34} />
        )}
      </div>

      <div className="lb-content">

        {/* ── header: the homepage's 2×2 ── */}
        <header className="lb-head">
          <div className="lb-win lb-hw1" />
          <div className="lb-win lb-hw2" />
          <div className="lb-panel lb-title">
            <h1 className="lb-h1"><Decode text={project.name} by="char" /></h1>
            <div className="lb-tags">{project.tags.join(' · ')}</div>
            <p className="lb-tagline">{project.tagline}</p>
            <div className="lb-links">
              {project.externalLink && <a className="lb-btn lb-btn-on" href={project.externalLink.href} target="_blank" rel="noreferrer">{project.externalLink.label}</a>}
              {project.secondaryLink && <a className="lb-btn" href={project.secondaryLink.href} target="_blank" rel="noreferrer">{project.secondaryLink.label}</a>}
            </div>
          </div>
          <div className="lb-panel lb-meta">
            <div className="lb-table">
              {meta.map(m => (
                <div key={m.k} className="lb-row">
                  <span className="lb-k">{m.k}</span>
                  <span>{m.v}</span>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* ── the lead figure, full width under the header ── */}
        {hero && !heroNarrow && (
          <div className="lb-wide">
            <figure className="lb-fig">
              <img src={hero.src} alt={hero.alt} className={hero.plate ? 'lb-plate' : undefined} />
            </figure>
          </div>
        )}

        <div className="lb-body">
          {/* ── chapter tabs: where you are, and the way to the rest ── */}
          {chapters.length > 1 && (
            <nav className="lb-path" aria-label="Sections">
              <div className="lb-tabs scrollbar-none">
                {chapters.map(c => (
                  <a key={c.id} href={`#${c.id}`} className="lb-tab" data-on={active === c.id ? 1 : 0}>
                    <span className="lb-num">{numOf(c.id)}</span>{c.label}
                  </a>
                ))}
              </div>
            </nav>
          )}

          {hero && heroNarrow && (
            <div className="lb-run">
              <div className="lb-panel lb-text"><figure className="lb-fig"><img src={hero.src} alt={hero.alt} /></figure></div>
              <div className="lb-win" />
            </div>
          )}

          {chunks.map((c, k) => c.wide ? (
            <div key={k} className="lb-wide">{c.items.map(block)}</div>
          ) : windowed(c) ? (
            <div key={k} className="lb-run">
              <div className="lb-panel lb-text">{c.items.map(block)}</div>
              <div className="lb-win" />
            </div>
          ) : (
            <div key={k} className="lb-wide lb-wide-text"><div className="lb-half">{c.items.map(block)}</div></div>
          ))}
        </div>

        {/* ── the way out: the homepage table, run as a command ── */}
        <footer className="lb-panel lb-end">
          {project.citation && (
            <div className="lb-cite">
              <h3 className="lb-h3">Citation</h3>
              <CopyBlock text={project.citation} />
            </div>
          )}
          <div className="lb-label">Projects</div>
          <div className="lb-ptab">
            {listing.map((p, i) => {
              const here = p.slug === project.slug
              const inner = (
                <>
                  <span className="lb-ptab-name"><span className="lb-num">{String(i + 1).padStart(2, '0')}</span>{p.name}{p.award && <span className="lb-award">{p.award}</span>}</span>
                  <span>{p.kind}</span>
                  <span>{p.year}</span>
                </>
              )
              return here
                ? <div key={p.slug} className="lb-ptab-row" data-here="1">{inner}</div>
                : <Link key={p.slug} href={`/project/${p.slug}`} className="lb-ptab-row">{inner}</Link>
            })}
          </div>
        </footer>
      </div>
    </div>
  )
}

// ─── sections ─────────────────────────────────────────────────────────────────

function SectionBlock({ s }: { s: Section }) {
  switch (s.type) {
    case 'text':
      return (
        <>
          {s.label && <h3 className="lb-h3">{s.label}</h3>}
          <p className="lb-p">{renderBody(s.body)}</p>
        </>
      )

    case 'pullquote':
      return <blockquote className="lb-quote"><Decode text={s.text} onView /></blockquote>

    case 'list':
      return (
        <>
          <h3 className="lb-h3">{s.label}</h3>
          <div className="lb-list">
            {s.items.map((it, i) => {
              // keyed rows only when every item has a key, so a list never mixes the two
              const kv = s.items.every(x => splitKey(x)) ? splitKey(it) : null
              return (
                <div key={i} className={`lb-li${kv ? '' : ' lb-li-plain'}`}>
                  <span className="lb-num">{String(i + 1).padStart(2, '0')}</span>
                  {kv ? <><span className="lb-li-k">{kv[0]}</span><span>{kv[1]}</span></> : <span>{it}</span>}
                </div>
              )
            })}
          </div>
        </>
      )

    case 'stats':
      return (
        <div className="lb-stats">
          {s.items.map(it => (
            <div key={it.label}><div className="lb-stat-v">{it.value}</div><div>{it.label}</div></div>
          ))}
        </div>
      )

    case 'image':
      return (
        <figure className="lb-fig">
          <img src={s.src} alt={s.alt} />
          {s.caption && <figcaption>{s.caption}</figcaption>}
        </figure>
      )

    case 'images': {
      const tall = s.aspect === '9/16'
      return (
        <div className="lb-grid" style={{ ['--cols' as string]: tall ? Math.min(s.items.length, 4) : Math.min(s.items.length, 2) }}>
          {s.items.map((it, i) => (
            <figure key={i} className="lb-fig">
              <img src={it.src} alt={it.alt} />
              {it.caption && <figcaption>{it.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )
    }

    case 'phones':
      return (
        <div className="lb-phones">
          {s.label && <p className="lb-p lb-half">{s.label}</p>}
          <div className="lb-grid lb-grid-phones" style={{ ['--cols' as string]: s.items.length }}>
            {s.items.map((it, i) => (
              <figure key={i} className="lb-fig">
                <img src={it.src} alt={it.alt} className="lb-screen" />
                {it.caption && <figcaption>{it.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </div>
      )

    case 'tiles':
      return (
        <div className="lb-tiles" data-n={s.items.length}>
          {s.items.map((t, k) => (
            <div key={k} className="lb-tile">
              <h3 className="lb-h3">{t.title}</h3>
              {t.rows.length === 1 && !t.rows[0].label
                ? <p className="lb-p">{renderBody(t.rows[0].body)}</p>
                : (
                  <div className="lb-list">
                    {t.rows.map((r, i) => (
                      <div key={i} className="lb-li lb-li-stack">
                        <span className="lb-num">{String(i + 1).padStart(2, '0')}</span>
                        <span className="lb-li-k">{r.label}</span>
                        <span>{renderBody(r.body)}</span>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>
      )

    case 'diagram': {
      const d = DIAGRAMS[s.id]
      if (!d) return null
      let n = 0
      return (
        <div className="lb-diagram">
          {d.groups.map((g, gi) => (
            <div key={gi} className="lb-dgroup">
              {g.title && <h3 className="lb-h3">{g.title}</h3>}
              <div className="lb-stages" style={{ ['--cols' as string]: g.stages.length }}>
                {g.stages.map(st => {
                  n += 1
                  return (
                    <div key={st.label} className="lb-stage">
                      <span className="lb-num">{String(n).padStart(2, '0')}</span>
                      <span className="lb-stage-l">{st.label}</span>
                      <span className="lb-award">{st.sub}</span>
                      <span>{st.detail}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          {d.loop && <div className="lb-loop"><span className="lb-award">↺</span> {d.loop}</div>}
        </div>
      )
    }

    default:
      return null
  }
}

// ─── styles ───────────────────────────────────────────────────────────────────

const CSS = `
  .lb { position: relative; --gut: clamp(1.25rem, 2.2vw, 2rem); }
  .lb-field { position: sticky; top: 0; height: 100vh; height: 100dvh; margin-bottom: -100vh; margin-bottom: -100dvh; z-index: 0; }
  /* the content layer lets the cursor through, so the field can be drawn on
     through the windows; panels take it back */
  .lb-content { position: relative; z-index: 1; pointer-events: none; }
  .lb-panel, .lb-wide, .lb-path { pointer-events: auto; }

  .lb-win { box-shadow: 0 0 0 calc(var(--wall) + 1px) var(--bg); }
  .lb-panel { background: var(--bg); box-shadow: 0 0 0 calc(var(--wall) + 1px) var(--bg); min-width: 0; }
  .lb-wide { background: var(--bg); box-shadow: 0 0 0 calc(var(--wall) + 1px) var(--bg); padding: 2.25rem 0 1.25rem; }

  /* header */
  .lb-head { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); grid-template-rows: clamp(200px, 34vh, 380px) auto; gap: var(--wall); }
  .lb-title { padding: 1.4rem var(--gut) 1.75rem 0; }
  .lb-meta { padding: 1.4rem 0 1.75rem; }
  .lb-h1 { font-family: var(--font-display); font-size: clamp(2.6rem, 5.2vw, 4.4rem); font-weight: 500; letter-spacing: -0.035em; line-height: 0.98; margin: 0 0 0.9rem; }
  .lb-tags { color: var(--award); font-size: 1rem; margin-bottom: 1.1rem; }
  .lb-tagline { font-size: 1.12rem; line-height: 1.55; max-width: 36rem; margin-bottom: 1.5rem; }
  .lb-links { display: flex; gap: 0.6rem; flex-wrap: wrap; }
  .lb-btn { display: inline-block; font-size: 0.98rem; font-weight: 500; padding: 0.6rem 1rem; color: var(--ink); text-decoration: none; border: 1px solid var(--ink); transition: background .15s, color .15s, border-color .15s; }
  .lb-btn:hover, .lb-btn-on { background: var(--award); border-color: var(--award); color: var(--bg); }
  .lb-btn-on:hover { background: var(--ink); border-color: var(--ink); }

  /* ruled table, the homepage's */
  .lb-table { border-top: 1px solid var(--hairline); }
  .lb-row { display: grid; grid-template-columns: 6.5rem minmax(0,1fr); gap: 1rem; padding: 0.62rem 0.1rem; border-bottom: 1px solid var(--hairline); font-size: 0.98rem; line-height: 1.45; align-items: baseline; }
  .lb-k { font-weight: 500; }

  /* the path bar */
  .lb-path { position: sticky; top: var(--strip-h, 46px); z-index: 5; display: flex; align-items: center; gap: 1rem;
    background: var(--bg); border-bottom: 1px solid var(--hairline); padding: 0.5rem 0; margin-top: var(--wall); }
  .lb-tabs { display: flex; gap: 0.25rem; overflow-x: auto; min-width: 0; }
  .lb-tab { white-space: nowrap; text-decoration: none; color: var(--ink); font-size: 0.98rem; padding: 0.3rem 0.6rem; transition: background .15s, color .15s; }
  .lb-tab:hover { color: var(--award); }
  .lb-tab[data-on="1"] { background: var(--award); color: var(--bg); }
  .lb-tab[data-on="1"] .lb-num { color: var(--bg); }

  .lb-num { font-variant-numeric: tabular-nums; color: var(--award); margin-right: 0.55em; font-weight: 400; }

  /* body runs: copy on the left half, a window on the right */
  .lb-run { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); column-gap: var(--wall); }
  .lb-run > .lb-win { margin: var(--wall) 0; }
  .lb-text { padding: 2.25rem var(--gut) 1.5rem 0; }
  .lb-half { max-width: calc(50% - var(--wall) / 2 - var(--gut)); }
  .lb-wide-text { padding-bottom: 1.5rem; }
  .lb-wide > .lb-b-subheader { max-width: calc(50% - var(--wall) / 2 - var(--gut)); }

  .lb-b + .lb-b { margin-top: 1.9rem; }
  .lb-b-subheader + .lb-b { margin-top: 1.4rem; }
  .lb-b + .lb-b-subheader { margin-top: 3.5rem; }
  .lb-wide > .lb-b:first-child, .lb-text > .lb-b:first-child { margin-top: 0; }
  [id] { scroll-margin-top: calc(var(--strip-h, 46px) + 4rem); }

  .lb-h2 { font-family: var(--font-display); font-size: clamp(1.55rem, 2.2vw, 1.95rem); font-weight: 500; letter-spacing: -0.02em; line-height: 1.1;
    padding-bottom: 0.7rem; border-bottom: 1px solid var(--hairline); }
  .lb-h2 .lb-num { font-size: 0.8em; }
  .lb-h3 { font-family: var(--font-display); font-size: 1.18rem; font-weight: 500; letter-spacing: -0.01em; margin-bottom: 0.55rem; }
  .lb-p { font-size: 1.02rem; line-height: 1.72; color: var(--ink-dim); max-width: 42rem; }
  .lb-strong { color: var(--ink); font-weight: 600; }

  .lb-quote { font-family: var(--font-display); font-size: clamp(1.35rem, 2vw, 1.7rem); line-height: 1.38; letter-spacing: -0.015em;
    border-left: 3px solid var(--award); padding: 0.1rem 0 0.1rem 1.1rem; margin: 0; }
  .lb-scr { position: relative; }
  .lb-scr-g { position: absolute; inset: 0; overflow: hidden; white-space: nowrap; font-family: var(--font-mono); color: var(--award); letter-spacing: -0.02em; }
  .lb-dot { color: transparent; background-image: radial-gradient(var(--ink) 0.6px, transparent 0.9px); background-size: 4px 4px; }

  .lb-list { border-top: 1px solid var(--hairline); }
  .lb-li { display: grid; grid-template-columns: 2rem minmax(0, 11rem) minmax(0,1fr); gap: 0.9rem; padding: 0.7rem 0.1rem; border-bottom: 1px solid var(--hairline);
    font-size: 0.98rem; line-height: 1.55; color: var(--ink-dim); align-items: baseline; }
  .lb-li-plain { grid-template-columns: 2rem minmax(0,1fr); }
  .lb-li-k { color: var(--ink); font-weight: 500; }
  .lb-li-stack { grid-template-columns: 2rem minmax(0,1fr); }
  .lb-li-stack { row-gap: 0.2rem; }
  .lb-li-stack > span:nth-child(3) { grid-column: 2; }

  .lb-fig { margin: 0; }
  .lb-fig img { display: block; width: 100%; height: auto; }
  .lb-fig figcaption { font-size: 0.95rem; line-height: 1.45; padding: 0.55rem 0.1rem; border-bottom: 1px solid var(--hairline); }
  .lb-plate { background: #FFFFFF; padding: clamp(0.75rem, 1.5vw, 1.5rem); }
  .lb-grid { display: grid; grid-template-columns: repeat(var(--cols), minmax(0,1fr)); gap: var(--wall); }
  .lb-grid-phones { max-width: 1120px; }
  .lb-phones > .lb-p { margin-bottom: 1.25rem; }
  .lb-screen { border: 1px solid var(--hairline); }

  .lb-tiles { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: var(--wall); }
  .lb-tiles[data-n="1"] { grid-template-columns: 1fr; }
  .lb-tile { padding-right: var(--gut); }

  .lb-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); border-top: 1px solid var(--hairline); border-bottom: 1px solid var(--hairline); }
  .lb-stats > div { padding: 1.1rem 0.1rem; font-size: 0.98rem; }
  .lb-stat-v { font-size: clamp(2rem, 3.4vw, 2.8rem); color: var(--award); letter-spacing: -0.04em; line-height: 1; margin-bottom: 0.4rem; }

  .lb-dgroup + .lb-dgroup { margin-top: 1.5rem; }
  .lb-stages { display: grid; grid-template-columns: repeat(var(--cols), minmax(0,1fr)); border-top: 1px solid var(--hairline); border-bottom: 1px solid var(--hairline); }
  .lb-stage { display: flex; flex-direction: column; gap: 0.2rem; padding: 0.85rem 0.9rem 0.95rem; font-size: 0.95rem; line-height: 1.4; }
  .lb-stage + .lb-stage { border-left: 1px solid var(--hairline); }
  .lb-stage:first-child { padding-left: 0.1rem; }
  .lb-stage-l { font-family: var(--font-display); font-size: 1.1rem; font-weight: 500; margin: 0.3rem 0 0.1rem; }
  .lb-stage-l::after { content: ' →'; color: var(--award); }
  .lb-stage:last-child .lb-stage-l::after { content: ''; }
  .lb-loop { margin-top: 0.8rem; font-size: 0.98rem; }
  .lb-award { color: var(--award); }

  /* footer */
  .lb-end { padding: 2.5rem 0 1rem; }
  .lb-cite { max-width: calc(50% - var(--wall) / 2); margin-bottom: 3rem; }
  .lb-ptab { border-top: 1px solid var(--hairline); }
  .lb-ptab-row { display: grid; grid-template-columns: minmax(0,1fr) 8rem 3.2rem; gap: 1rem; align-items: baseline; padding: 0.55rem 0.1rem;
    border-bottom: 1px solid var(--hairline); color: var(--ink); text-decoration: none; font-size: 0.98rem; transition: background .15s, color .15s; }
  .lb-ptab-row > span:last-child { text-align: right; }
  .lb-ptab-name { font-family: var(--font-display); font-size: 1.25rem; font-weight: 500; letter-spacing: -0.01em; display: flex; align-items: baseline; flex-wrap: wrap; gap: 0 0.1rem; }
  .lb-ptab-name .lb-award { font-family: var(--font-main); font-size: 0.92rem; font-weight: 400; letter-spacing: 0; margin-left: 0.6rem; }
  a.lb-ptab-row:hover { background: var(--award); color: var(--bg); }
  a.lb-ptab-row:hover .lb-num, a.lb-ptab-row:hover .lb-award { color: var(--bg); }
  .lb-ptab-row[data-here="1"] { cursor: default; color: var(--award); }
  .lb-label { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.85rem; font-family: var(--font-display); font-size: 1rem; color: var(--award); }
  .lb-label::after { content: ''; flex: 1; height: 1px; background: var(--award); opacity: 0.45; }

  /* phone: one column. The header keeps one window; each run's window drops
     to a short band under its copy, the way the About page does it. */
  @media (max-width: 860px) {
    .lb-head { grid-template-columns: 1fr; grid-template-rows: clamp(150px, 24vh, 240px) auto auto; }
    .lb-hw2 { display: none; }
    .lb-title { padding: 1.1rem 0 0.25rem; }
    .lb-meta { padding: 0.5rem 0 1.25rem; }
    .lb-run { grid-template-columns: 1fr; }
    .lb-run > .lb-win { height: 64px; margin: var(--wall) 0; }
    .lb-text { padding: 1.75rem 0 0.25rem; }
    .lb-half, .lb-cite, .lb-wide > .lb-b-subheader { max-width: none; }
    .lb-wide { padding: 1.75rem 0 1rem; }
      .lb-path { gap: 0.6rem; }
    .lb-tiles { grid-template-columns: 1fr; }
    .lb-tile { padding-right: 0; }
    .lb-grid { grid-template-columns: repeat(min(var(--cols), 2), minmax(0,1fr)); gap: 0.9rem; }
    .lb-li { grid-template-columns: 2rem minmax(0,1fr); }
    .lb-li { row-gap: 0.2rem; }
    .lb-li > span:nth-child(3) { grid-column: 2; }
    .lb-stages { grid-template-columns: 1fr; }
    .lb-stage + .lb-stage { border-left: none; border-top: 1px solid var(--hairline); }
    .lb-stage { padding-left: 0.1rem; }
    .lb-stage-l::after { content: ' ↓'; }
    .lb-ptab-row { grid-template-columns: minmax(0,1fr) auto 3rem; }
    .lb-h1 { font-size: clamp(2.4rem, 12vw, 3.2rem); }
  }
`
