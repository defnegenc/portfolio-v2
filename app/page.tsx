'use client'

import { useState, useEffect, useRef } from 'react'
import AsciiCanvas from '@/components/AsciiCanvas'

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
  { no: '01', name: 'Bloom',           tags: ['Research', 'Safety', 'Design'],       year: '2025', href: '/project/bloom',           external: false, preview: '/bloom-0alpha.png', badge: 'CHI 2026 Best Paper · Top 1%' },
  { no: '02', name: 'Learning Et Al.', tags: ['Solo', 'RecSys', 'LLM'],              year: '2026', href: '/project/learningetal',    external: false, preview: '/learningetal-0alpha.png' },
  { no: '03', name: 'Menuto',          tags: ['Solo', 'AI', 'Mobile'],               year: '2026', href: '/project/menuto',          external: false, preview: '/menuto-0alpha.png' },
  { no: '04', name: 'Dishcovery',      tags: ['Needfinding', 'Prototyping', 'Design'],  year: '2024', href: '/project/dishcovery',      external: false, preview: '/dishcovery-0alpha.png' },
]


const PUBLICATIONS = [
  { title: 'Bloom: Designing for LLM-Augmented Behavior Change Interactions', venue: 'CHI 2026', note: '2nd author · accepted', href: 'https://arxiv.org/abs/2510.05449' },
]

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' }

// ─── Icons ────────────────────────────────────────────────────────────────────

function SunIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────

interface ThemeToggleProps {
  theme: 'dark' | 'light'
  setTheme: (t: 'dark' | 'light') => void
  toggleBg?: string
  toggleFg?: string
  mobile?: boolean
}

function ThemeToggle({ theme, setTheme, toggleBg, toggleFg, mobile }: ThemeToggleProps) {
  const bg = toggleBg ?? 'var(--bg)'
  const fg = toggleFg ?? 'var(--ink)'
  const btn = (active: boolean): React.CSSProperties => ({
    padding: '0.38rem 0.5rem', cursor: 'pointer', userSelect: 'none' as const,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: active ? fg : 'transparent',
    color: active ? bg : mobile ? 'var(--ink-dim)' : `${toggleFg}99`,
    transition: 'background 0.15s, color 0.15s',
  })
  return (
    <div style={{ display: 'flex', background: bg, borderRadius: 3, overflow: 'hidden', border: mobile ? '1px solid var(--hairline)' : 'none' }}>
      <span onClick={() => setTheme('light')} style={btn(theme === 'light')}><SunIcon /></span>
      <span onClick={() => setTheme('dark')} style={btn(theme === 'dark')}><MoonIcon /></span>
    </div>
  )
}

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
  const toggleBg = isLight ? 'rgba(26,25,24,0.82)' : 'rgba(232,230,224,0.88)'
  const toggleFg = isLight ? '#F4F2EC' : '#0A0A0A'

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

        /* Tiles */
        .pt { overflow: hidden; position: relative; }
        .pt:hover .pt-preview { opacity: 1 !important; }

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
          .pgrid       { grid-template-columns: 1fr !important; }
          .pt          { min-height: 160px !important; }
          .pt::after   { display: none !important; }
          .canvas-zone { flex: 0 0 22vh !important; flex: 0 0 22dvh !important; }
          .sym-controls { display: none !important; }
          .sym-mobile  { display: flex !important; }
          .nav-links   { display: none !important; }
        }

        /* sym-mobile and bio-mobile hidden on desktop */
        .sym-mobile { display: none; }
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
              style={{ ...mono, fontSize: '0.68rem', color: 'var(--ink-dim)', background: 'none', border: 'none', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '1.25rem' }}>
              Close [ESC]
            </button>
          </nav>
        </div>
      )}

      {/* ── NAME STRIP ── */}
      <div className="name-strip" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.75rem', borderBottom: '1px solid var(--hairline)', background: 'var(--bg)', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 0 }}>
          <h1 style={{ fontSize: 'clamp(1.4rem,4vw,2.8rem)', fontWeight: 400, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
            <TypewriterName text="DEFNE GENÇ" />
          </h1>
          <div className="ns-sub" style={{ ...mono, fontSize: '0.62rem', color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
            Stanford CS HCI · APM @ Coinbase · NYC
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
                style={{ ...mono, fontSize: '0.68rem', color: 'var(--ink)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0.4rem 0.75rem', transition: 'color 0.15s', opacity: 0.65 }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '0.65' }}>
                {label}
              </a>
            ))}
          </div>
          {/* Hamburger */}
          <button
            onClick={() => setNavOpen(true)}
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem 0.2rem', width: 32, height: 32 }}
          >
            <span style={{ display: 'block', width: 18, height: 1, background: 'var(--ink-dim)' }} />
            <span style={{ display: 'block', width: 12, height: 1, background: 'var(--ink-dim)' }} />
            <span style={{ display: 'block', width: 18, height: 1, background: 'var(--ink-dim)' }} />
          </button>
        </div>
      </div>

      {/* ── CANVAS ZONE ── */}
      <div className="canvas-zone" style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--hairline)', background: isLight ? '#F4F2EC' : '#050505' }}>
        <AsciiCanvas breathe lightMode={isLight} chars='▓▒░' />

        {/* Canvas hint — top right */}
        <div className="sym-controls" style={{ position: 'absolute', top: '0.9rem', right: '1.75rem', zIndex: 10, pointerEvents: 'none', textAlign: 'right' }}>
          <div style={{ ...mono, fontSize: '0.52rem', color: isLight ? 'rgba(26,25,24,0.38)' : 'rgba(232,230,224,0.3)', textTransform: 'uppercase', letterSpacing: '0.13em', lineHeight: 1.75 }}>
            interactive canvas<br />
            hover · drag · set symbols ↙
          </div>
        </div>

        {/* Canvas controls — bottom left */}
        <div className="sym-controls" style={{ position: 'absolute', bottom: '1rem', left: '1.75rem', zIndex: 10 }}>
          <ThemeToggle theme={theme} setTheme={setTheme} toggleBg={toggleBg} toggleFg={toggleFg} />
        </div>
      </div>

      {/* ── SYMBOL CONTROLS — mobile only, below canvas ── */}
      <div className="sym-mobile" style={{ flexShrink: 0, flexDirection: 'column', gap: '0.5rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--hairline)', background: 'var(--bg)' }}>
        <ThemeToggle theme={theme} setTheme={setTheme} mobile />
      </div>

      {/* ── BIO — mobile only ── */}
      <div className="bio-mobile" style={{ display: 'none', flexShrink: 0, padding: '1rem 1.25rem', borderBottom: '1px solid var(--hairline)', background: 'var(--bg)' }}>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.65, color: 'var(--ink-dim)', margin: 0 }}>
          Engineer, designer, researcher, and product manager. BS and MS in CS from Stanford University, where I specialized in human-AI interaction. Currently APM at Coinbase. Current projects: recommendation systems using LLMs.
        </p>
      </div>

      {/* ── BOTTOM: sidebar + main ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Sidebar */}
        <aside className="sidebar" style={{ width: 300, flexShrink: 0, height: '100%', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--hairline)', background: 'var(--bg)' }}>
          <div style={{ flex: 1, padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem', overflowY: 'auto' }} className="scrollbar-none">
            <div style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--ink-dim)' }}>
              Engineer, designer, researcher, and product manager. BS and MS in CS from Stanford University, where I specialized in human-AI interaction. Currently APM at Coinbase. Current projects: recommendation systems using LLMs.
            </div>
            <div>
              <div style={{ ...mono, fontSize: '0.62rem', color: 'var(--ink-dim)', opacity: 0.6, marginBottom: '0.25rem' }}>40.7128° N · 74.0060° W</div>
              <div style={{ ...mono, fontSize: '0.72rem', color: 'var(--ink-dim)' }}>NYC {clock}</div>
            </div>
            <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: '0.9rem', marginTop: '0.1rem' }}>
              <div style={{ ...mono, fontSize: '0.65rem', color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '0.75rem' }}>Publications</div>
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
            <div style={{ ...mono, fontSize: '0.65rem', color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '0.75rem' }}>Network</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {([
                { label: 'Email',    action: () => setContact(true) },
                { label: 'LinkedIn', href: 'https://linkedin.com/in/-defne' },
                { label: 'GitHub',   href: 'https://github.com/defnegenc' },
                { label: 'Résumé',   href: '/resume' },
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
            <button className="btn-inv" onClick={() => setContact(true)}
              style={{ width: '100%', ...mono, fontSize: '0.65rem', color: 'var(--ink-dim)', background: 'none', border: '1px solid var(--hairline)', padding: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Get in touch
            </button>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

          {/* Project grid */}
          <div className="pgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', flex: 1 }}>
            {PROJECTS.map(p => (
              <a key={p.no} href={p.href} target={p.external ? '_blank' : undefined} rel="noreferrer"
                className="pt" data-no={p.no}
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 220, padding: '1.5rem 1.75rem', borderRight: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)', textDecoration: 'none', color: 'var(--ink)', background: 'transparent', position: 'relative' }}>
                {p.preview && (
                  <div className="pt-preview" style={{
                    position: 'absolute', inset: '20% 25%', zIndex: 0,
                    backgroundImage: `url(${p.preview})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: 0, transition: 'opacity .4s cubic-bezier(.16,1,.3,1)',
                    pointerEvents: 'none',
                  }} />
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                  <span className="td" style={{ ...mono, fontSize: '0.68rem', color: 'var(--ink-dim)' }}>{p.no}</span>
                  <span className="td trg" style={{ ...mono, fontSize: '0.62rem', color: 'var(--ink-dim)', border: '1px solid var(--hairline)', padding: '0.15rem 0.5rem', borderRadius: 999 }}>{p.year}</span>
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div className="tn" style={{ fontSize: 'clamp(1.4rem,2.2vw,2.2rem)', fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: p.badge ? '0.5rem' : '0.7rem', transition: 'transform .25s cubic-bezier(.16,1,.3,1)' }}>
                    {p.name}
                  </div>
                  {p.badge && (
                    <div style={{ ...mono, fontSize: '0.6rem', letterSpacing: '0.06em', color: isLight ? '#266C31' : '#52C462', fontWeight: 600, marginBottom: '0.5rem' }}>
                      {p.badge}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem 0.15rem', alignItems: 'center' }}>
                      {p.tags.map((t, i) => (
                        <span key={t} className="td" style={{ ...mono, fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-dim)' }}>
                          {t}{i < p.tags.length - 1 ? ' ·' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
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
              <div style={{ ...mono, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Get in Touch</div>
              <button onClick={() => setContact(false)}
                style={{ background: 'none', border: 'none', ...mono, fontSize: '0.65rem', color: 'var(--ink-dim)', textTransform: 'uppercase' }}>
                Close [ESC]
              </button>
            </div>
            {formSent ? (
              <div style={{ ...mono, fontSize: '0.85rem', color: 'var(--ink-dim)', padding: '2rem 0', textAlign: 'center' }}>Message sent. Talk soon.</div>
            ) : (
              <form onSubmit={handleSubmit}>
                {([{ label: 'Name', name: 'name', type: 'text', placeholder: 'Full name' }, { label: 'Email', name: 'email', type: 'email', placeholder: 'Your email' }]).map(f => (
                  <div key={f.name} style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', ...mono, fontSize: '0.65rem', color: 'var(--ink-dim)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{f.label}</label>
                    <input name={f.name} type={f.type} placeholder={f.placeholder} required
                      style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--hairline)', padding: '0.7rem 0', color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }} />
                  </div>
                ))}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', ...mono, fontSize: '0.65rem', color: 'var(--ink-dim)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Message</label>
                  <textarea name="message" placeholder="What's on your mind?" required rows={4}
                    style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--hairline)', padding: '0.7rem 0', color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', resize: 'none' }} />
                </div>
                <button type="submit"
                  style={{ width: '100%', background: 'var(--ink)', color: 'var(--bg)', border: 'none', padding: '1rem', ...mono, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
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
