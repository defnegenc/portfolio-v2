'use client'

import { useState, useEffect, useRef } from 'react'
import AsciiCanvas from '@/components/AsciiCanvas'
import ThemeToggle from '@/components/ThemeToggle'

// ─── Ditherform Logo ──────────────────────────────────────────────────────────
// Bayer-ordered dithering producing a halftone D — ported from Claude Design

const BAYER_8 = [
  [ 0,32, 8,40, 2,34,10,42],
  [48,16,56,24,50,18,58,26],
  [12,44, 4,36,14,46, 6,38],
  [60,28,52,20,62,30,54,22],
  [ 3,35,11,43, 1,33, 9,41],
  [51,19,59,27,49,17,57,25],
  [15,47, 7,39,13,45, 5,37],
  [63,31,55,23,61,29,53,21],
].map(r => r.map(v => (v + 0.5) / 64))

function DitherformLogo({ grid = 28 }: { grid?: number }) {
  const cx = grid * 0.32, cy = grid * 0.5
  const rOuter = grid * 0.55, rInner = rOuter * 0.45
  const cells: React.ReactElement[] = []
  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < grid; x++) {
      const dx = x - cx, dy = y - cy
      const d = Math.sqrt(dx*dx + dy*dy)
      let v: number
      if (d < rInner) v = 1
      else if (d > rOuter) v = 0
      else v = 1 - (d - rInner) / (rOuter - rInner)
      if (x < grid * 0.18 && y > grid * 0.08 && y < grid * 0.92) v = Math.max(v, 1)
      if (v > BAYER_8[y % 8][x % 8]) {
        cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" />)
      }
    }
  }
  return (
    <svg
      viewBox={`0 0 ${grid} ${grid}`}
      shapeRendering="crispEdges"
      style={{ display: 'block', flexShrink: 0, height: 'clamp(28px, 3.2vw, 44px)', width: 'auto', color: 'var(--ink)' }}
    >
      {cells}
    </svg>
  )
}

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
  { no: '01', name: 'Bloom',           kind: 'Publication',        tags: ['Research', 'Safety', 'Design'],          year: '2025', href: '/project/bloom', external: false, badge: 'CHI 2026 Best Paper · Top 1%' },
  { no: '02', name: 'Learning Et Al.', kind: 'Website',            tags: ['Solo', 'RecSys', 'LLM'],                 year: '2026', href: '/project/learningetal', external: false },
  { no: '03', name: 'Menuto',          kind: 'Full Stack iOS App', tags: ['Solo', 'AI', 'Mobile'],                  year: '2026', href: '/project/menuto',       external: false },
  { no: '04', name: 'Dishcovery',      kind: 'Full Stack iOS App', tags: ['Needfinding', 'Prototyping', 'Design'],  year: '2024', href: '/project/dishcovery',   external: false },
]


const PUBLICATIONS = [
  { title: 'Bloom: Designing for LLM-Augmented Behavior Change Interactions', venue: 'CHI 2026', note: '2nd author · accepted', href: 'https://arxiv.org/abs/2510.05449' },
]

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' }

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [clock, setClock]         = useState('')
  const [navOpen, setNavOpen]     = useState(false)
  const [contactOpen, setContact] = useState(false)
  const [formSent, setFormSent]   = useState(false)
  const [theme, setTheme]         = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      timeZone: 'America/New_York',
    }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

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

  return (
    <div
      data-theme={theme}
      className="root-frame"
      style={{ display: 'flex', flexDirection: 'column', width: '100vw', overflow: 'hidden', background: 'var(--bg)', color: 'var(--ink)' }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }

        /* Light theme */
        [data-theme="light"] {
          --bg: #F4F2EC;
          --ink: #1A1918;
          --ink-dim: #5A5955;
          --hairline: rgba(26, 25, 24, 0.15);
        }

        /* Project list */
        .pl { transition: background .2s; }
        .pl:hover { background: var(--hairline) !important; }

        /* Nav overlay links */
        .ni { transition: color .2s, transform .25s; }
        .ni:hover { color: var(--ink) !important; transform: translateX(8px); }

        /* Underline links */
        .ul { position: relative; transition: color .2s; }
        .ul::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 1px; background: currentColor; transform: scaleX(0); transform-origin: right; transition: transform .3s cubic-bezier(.19,1,.22,1); }
        .ul:hover::after { transform: scaleX(1); transform-origin: left; }
        .ul:hover { color: var(--ink) !important; }

        /* Nav tabs */
        .nav-tab { transition: color .2s; }
        .nav-tab:hover { color: var(--ink) !important; }

        /* Invert button */
        .btn-inv { transition: background .2s, color .2s; }
        .btn-inv:hover { background: var(--ink) !important; color: var(--bg) !important; }

        /* dvh fallback for iOS Safari address bar */
        .root-frame { height: 100vh; height: 100dvh; }
        .canvas-zone { flex: 0 0 34vh; flex: 0 0 34dvh; }

        @media (max-width: 860px) { .sidebar { display: none !important; } }

        @media (max-width: 600px) {
          .pl-tags     { display: none !important; }
          .canvas-zone { flex: 0 0 22vh !important; flex: 0 0 22dvh !important; }
          .nav-links   { display: none !important; }
        }

        /* bio-mobile hidden on desktop */
        .bio-mobile { display: none; }
        @media (max-width: 860px) { .bio-mobile { display: block !important; } }

        @media (max-width: 420px) {
          .name-strip  { padding: 0.65rem 1rem !important; gap: 0.5rem !important; }
          .ns-sub      { display: none !important; }
        }
      `}</style>

      {/* ── NAV OVERLAY ── */}
      {navOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setNavOpen(false) }}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--bg)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn .3s ease' }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
            {([
              { label: 'Work',     action: () => setNavOpen(false) },
              { label: 'About',    href:   '/about' },
              { label: 'Research', href:   'https://arxiv.org/abs/2510.05449' },
              { label: 'Résumé',   href:   '/resume' },
              { label: 'Contact',  action: () => { setNavOpen(false); setContact(true) } },
            ] as { label: string; href?: string; action?: () => void }[]).map(({ label, href, action }) =>
              action ? (
                <button key={label} className="ni" onClick={action}
                  style={{ fontSize: 'clamp(2.5rem,5vw,4.5rem)', fontWeight: 300, letterSpacing: '-0.03em', color: 'var(--ink-dim)', background: 'none', border: 'none' }}>
                  {label}
                </button>
              ) : (
                <a key={label} className="ni" href={href} target={href?.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                  style={{ fontSize: 'clamp(2.5rem,5vw,4.5rem)', fontWeight: 300, letterSpacing: '-0.03em', color: 'var(--ink-dim)', textDecoration: 'none' }}>
                  {label}
                </a>
              )
            )}
            <button onClick={() => setNavOpen(false)}
              style={{ fontSize: '0.95rem', color: 'var(--ink)', opacity: 0.7, background: 'none', border: 'none', cursor: 'pointer', marginTop: '1.25rem' }}>
              Close
            </button>
          </nav>
        </div>
      )}

      {/* ── NAME STRIP ── */}
      <div className="name-strip" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.75rem', borderBottom: '1px solid var(--hairline)', background: 'var(--bg)', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
          <DitherformLogo />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 0 }}>
            <h1 style={{ fontSize: 'clamp(1.4rem,4vw,2.8rem)', fontWeight: 400, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
              <TypewriterName text="DEFNE GENÇ" />
            </h1>
            <div className="ns-sub" style={{ fontSize: '0.92rem', color: 'var(--ink)', opacity: 0.75 }}>
              Stanford CS · Product @ Coinbase · NYC
            </div>
          </div>
        </div>
        <div className="ns-seg" style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexShrink: 0 }}>
          {/* Desktop nav links */}
          <div className="nav-links" style={{ display: 'flex', gap: '0', alignItems: 'center' }}>
            {([
              { label: 'About',  href: '/about' },
              { label: 'Résumé', href: '/resume' },
            ]).map(({ label, href }) => (
              <a key={label} href={href}
                style={{ fontSize: '0.95rem', color: 'var(--ink)', textDecoration: 'none', padding: '0.4rem 0.75rem', transition: 'opacity 0.15s', opacity: 0.8 }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '0.8' }}>
                {label}
              </a>
            ))}
          </div>
          {/* Theme toggle */}
          <ThemeToggle theme={theme} setTheme={setTheme} />
          {/* Hamburger */}
          <button
            onClick={() => setNavOpen(true)}
            aria-label="Open menu"
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem 0.2rem', width: 34, height: 34 }}
          >
            <span style={{ display: 'block', width: 22, height: 3, borderRadius: 999, background: 'var(--ink)' }} />
            <span style={{ display: 'block', width: 14, height: 3, borderRadius: 999, background: 'var(--ink)' }} />
            <span style={{ display: 'block', width: 22, height: 3, borderRadius: 999, background: 'var(--ink)' }} />
          </button>
        </div>
      </div>

      {/* ── CANVAS ZONE ── */}
      <div className="canvas-zone" style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--hairline)', background: isLight ? '#F4F2EC' : '#050505' }}>
        <AsciiCanvas breathe lightMode={isLight} chars='▓▒░' />

      </div>

      {/* ── BIO — mobile only ── */}
      <div className="bio-mobile" style={{ display: 'none', flexShrink: 0, padding: '1rem 1.25rem', borderBottom: '1px solid var(--hairline)', background: 'var(--bg)' }}>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.65, color: 'var(--ink-dim)', margin: 0 }}>
          Engineer and interaction designer. BS and MS in CS from Stanford University, where I specialized in human-AI interaction. Currently product manager at Coinbase, working on institutional derivatives. Current projects: recommendation systems using LLMs.
        </p>
      </div>

      {/* ── BOTTOM: sidebar + main ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Sidebar */}
        <aside className="sidebar" style={{ width: 300, flexShrink: 0, height: '100%', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--hairline)', background: 'var(--bg)' }}>
          <div style={{ flex: 1, minHeight: 0, padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem', overflowY: 'auto' }} className="scrollbar-none">
            <div style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--ink-dim)' }}>
              Engineer and interaction designer. BS and MS in CS from Stanford University, where I specialized in human-AI interaction. Currently product manager at Coinbase, working on institutional derivatives. Current projects: recommendation systems using LLMs.
            </div>
            <div>
              <div style={{ ...mono, fontSize: '0.72rem', color: 'var(--ink-dim)' }}>NYC {clock}</div>
            </div>
            <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: '0.9rem', marginTop: '0.1rem' }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 500, color: 'var(--ink)', marginBottom: '0.75rem' }}>Publications</div>
              {PUBLICATIONS.map(pub => (
                <a key={pub.href} href={pub.href} target="_blank" rel="noreferrer"
                  style={{ display: 'block', textDecoration: 'none', marginBottom: '0.6rem' }}>
                  <div style={{ fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--ink)', marginBottom: '0.25rem' }}>{pub.title}</div>
                  <div style={{ ...mono, fontSize: '0.65rem', color: 'var(--ink-dim)' }}>{pub.venue} · {pub.note}</div>
                </a>
              ))}
            </div>
          </div>
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 500, color: 'var(--ink)', marginBottom: '0.75rem' }}>Network</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {([
                { label: 'Email',    action: () => setContact(true) },
                { label: 'LinkedIn', href: 'https://linkedin.com/in/-defne' },
                { label: 'GitHub',   href: 'https://github.com/defnegenc' },
              ] as { label: string; href?: string; action?: () => void }[]).map(({ label, href, action }) =>
                action ? (
                  <button key={label} className="ul" onClick={action}
                    style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', fontSize: '0.88rem', color: 'var(--ink-dim)' }}>{label}</button>
                ) : (
                  <a key={label} className="ul" href={href} target={href?.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                    style={{ fontSize: '0.88rem', color: 'var(--ink-dim)', textDecoration: 'none' }}>{label}</a>
                )
              )}
            </div>
            <button onClick={() => setContact(true)}
              style={{ width: '100%', fontSize: '0.95rem', fontWeight: 500, color: 'var(--bg)', background: 'var(--ink)', border: 'none', borderRadius: 999, padding: '0.7rem 1rem', cursor: 'pointer' }}>
              Get in touch
            </button>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

          {/* Project list */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {PROJECTS.map(p => (
              <a key={p.no} href={p.href} target={p.external ? '_blank' : undefined} rel="noreferrer"
                className="pl"
                style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--hairline)', textDecoration: 'none', color: 'var(--ink)' }}>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'clamp(1.15rem, 1.8vw, 1.6rem)', fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {p.name}
                  </div>
                  {p.kind && (
                    <div style={{ ...mono, fontSize: '0.62rem', color: 'var(--ink-dim)', marginTop: '0.35rem', opacity: 0.7 }}>
                      {p.kind}
                    </div>
                  )}
                  {p.badge && (
                    <div style={{ ...mono, fontSize: '0.68rem', letterSpacing: '0.06em', color: isLight ? '#266C31' : '#52C462', fontWeight: 600, marginTop: '0.4rem' }}>
                      {p.badge}
                    </div>
                  )}
                </div>

                <div className="pl-tags" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  {p.tags.map((t, i) => (
                    <span key={t} style={{ fontSize: '0.85rem', color: 'var(--ink)', opacity: 0.65 }}>
                      {t}{i < p.tags.length - 1 ? '\u00a0·\u00a0' : ''}
                    </span>
                  ))}
                </div>

                <span style={{ ...mono, fontSize: '0.78rem', color: 'var(--ink-dim)', flexShrink: 0 }}>{p.year}</span>
              </a>
            ))}
          </div>

          <footer style={{ padding: '1.25rem 1.75rem', borderTop: '1px solid var(--hairline)', marginTop: 'auto', flexShrink: 0 }}>
            <div style={{ ...mono, fontSize: '0.65rem', color: 'var(--ink-dim)', opacity: 0.4 }}>© 2026 Defne Genç</div>
          </footer>
        </main>
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
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--ink)', opacity: 0.7 }}>
                Close
              </button>
            </div>
            {formSent ? (
              <div style={{ ...mono, fontSize: '0.85rem', color: 'var(--ink-dim)', padding: '2rem 0', textAlign: 'center' }}>Message sent. Talk soon.</div>
            ) : (
              <form onSubmit={handleSubmit}>
                {([{ label: 'Name', name: 'name', type: 'text', placeholder: 'Full name' }, { label: 'Email', name: 'email', type: 'email', placeholder: 'Your email' }]).map(f => (
                  <div key={f.name} style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--ink)', opacity: 0.75, marginBottom: '0.5rem' }}>{f.label}</label>
                    <input name={f.name} type={f.type} placeholder={f.placeholder} required
                      style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--hairline)', padding: '0.7rem 0', color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }} />
                  </div>
                ))}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--ink)', opacity: 0.75, marginBottom: '0.5rem' }}>Message</label>
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
