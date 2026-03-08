'use client'

import { useState } from 'react'
import Link from 'next/link'
import AsciiCanvas from '@/components/AsciiCanvas'

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' }

export default function About() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const isLight = theme === 'light'

  return (
    <div
      data-theme={theme}
      style={{ height: '100vh', overflowY: 'auto', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-main)', position: 'relative' }}
    >
      <style>{`
        [data-theme="light"] { --bg: #F4F2EC; --ink: #1A1918; --ink-dim: #5A5955; --hairline: rgba(26,25,24,0.15); }
        [data-theme="dark"]  { --bg: #0A0A0A; --ink: #E8E6E0; --ink-dim: #AEADA6; --hairline: rgba(232,230,224,0.1); }
        .about-link { color: var(--ink-dim); text-decoration: none; position: relative; transition: color 0.2s; }
        .about-link::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 1px; background: currentColor; transform: scaleX(0); transform-origin: right; transition: transform 0.3s cubic-bezier(.19,1,.22,1); }
        .about-link:hover::after { transform: scaleX(1); transform-origin: left; }
        .about-link:hover { color: var(--ink) !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.6s cubic-bezier(.16,1,.3,1) both; }
        .fade-up-1 { animation-delay: 0.05s; } .fade-up-2 { animation-delay: 0.12s; }
        .fade-up-3 { animation-delay: 0.2s; }  .fade-up-4 { animation-delay: 0.28s; }
        .fade-up-5 { animation-delay: 0.36s; }
        @media (max-width: 700px) {
          .hero-inner { flex-direction: column !important; gap: 1.5rem !important; }
          .hero-strips { height: 140px !important; }
          .content-grid { grid-template-columns: 1fr !important; gap: 1.25rem !important; }
          .fact-grid { grid-template-columns: 1fr !important; }
          .side-strip { display: none !important; }
        }
      `}</style>

      {/* Scattered animation strips — both sides, different modes */}
      <div className="side-strip" style={{ position: 'absolute', left: 0, top: 680, zIndex: 0, display: 'flex', gap: 5, height: 240, pointerEvents: 'none' }}>
        {[0.35, 0.55].map((op, i) => (
          <div key={i} style={{ width: 40, height: '100%', overflow: 'hidden', opacity: op }}>
            <AsciiCanvas trailMode lightMode={isLight} />
          </div>
        ))}
      </div>
      <div className="side-strip" style={{ position: 'absolute', right: 0, top: 1250, zIndex: 0, display: 'flex', gap: 5, height: 200, pointerEvents: 'none' }}>
        {[0.55, 0.4, 0.25].map((op, i) => (
          <div key={i} style={{ width: 38, height: '100%', overflow: 'hidden', opacity: op }}>
            <AsciiCanvas breathe lightMode={isLight} />
          </div>
        ))}
      </div>
      <div className="side-strip" style={{ position: 'absolute', left: 0, top: 1900, zIndex: 0, display: 'flex', gap: 5, height: 180, pointerEvents: 'none' }}>
        {[0.3, 0.5, 0.3].map((op, i) => (
          <div key={i} style={{ width: 36, height: '100%', overflow: 'hidden', opacity: op }}>
            <AsciiCanvas lightMode={isLight} />
          </div>
        ))}
      </div>
      <div className="side-strip" style={{ position: 'absolute', right: 0, top: 2500, zIndex: 0, display: 'flex', gap: 5, height: 220, pointerEvents: 'none' }}>
        {[0.4, 0.6].map((op, i) => (
          <div key={i} style={{ width: 40, height: '100%', overflow: 'hidden', opacity: op }}>
            <AsciiCanvas trailMode lightMode={isLight} />
          </div>
        ))}
      </div>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 2rem', borderBottom: '1px solid var(--hairline)', background: isLight ? 'rgba(244,242,236,0.92)' : 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)' }}>
        <Link href="/" style={{ ...mono, fontSize: '0.72rem', color: 'var(--ink-dim)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          ← Work
        </Link>
        <div style={{ display: 'flex', border: '1px solid var(--hairline)', borderRadius: 3, overflow: 'hidden' }}>
          {(['light', 'dark'] as const).map(t => (
            <span key={t} onClick={() => setTheme(t)} style={{
              ...mono, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em',
              padding: '0.4rem 0.7rem', cursor: 'pointer', userSelect: 'none',
              background: theme === t ? 'var(--ink)' : 'transparent',
              color: theme === t ? 'var(--bg)' : 'var(--ink-dim)',
              transition: 'background 0.15s, color 0.15s',
            }}>{t}</span>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem 8rem', position: 'relative', zIndex: 1 }}>

        {/* Hero */}
        <div className="fade-up fade-up-1 hero-inner" style={{ display: 'flex', gap: '4rem', padding: '4rem 0 4.5rem', borderBottom: '1px solid var(--hairline)', alignItems: 'flex-start' }}>
          <div className="hero-strips" style={{ display: 'flex', gap: 6, height: 280, flexShrink: 0, alignSelf: 'stretch' }}>
            {[0.4, 0.55, 0.7, 0.85, 1].map((opacity, i) => (
              <div key={i} style={{ flex: 1, minWidth: 40, maxWidth: 52, height: '100%', overflow: 'hidden', opacity }}>
                <AsciiCanvas breathe lightMode={isLight} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingTop: '1rem' }}>
            <div className="fade-up fade-up-2" style={{ ...mono, fontSize: '0.62rem', color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '1.25rem' }}>
              Istanbul · Stanford · New York
            </div>
            <h1 className="fade-up fade-up-3" style={{ fontSize: 'clamp(2.8rem, 5vw, 5.5rem)', fontWeight: 400, letterSpacing: '-0.04em', lineHeight: 0.88, marginBottom: '1.75rem' }}>
              Defne<br />Genç
            </h1>
            <p className="fade-up fade-up-4" style={{ fontSize: 'clamp(1rem, 1.3vw, 1.15rem)', fontWeight: 300, lineHeight: 1.75, color: 'var(--ink-dim)', maxWidth: 420 }}>
              I think like a designer, work like a researcher, and build like an engineer. Usually in that order, sometimes all at once.
            </p>
          </div>
        </div>

        {/* Background */}
        <div className="fade-up fade-up-5 content-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4rem', padding: '5rem 0', borderBottom: '1px solid var(--hairline)' }}>
          <div style={{ ...mono, fontSize: '0.75rem', color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.14em', paddingTop: '0.4rem' }}>
            Background
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <p style={{ fontSize: '1.2rem', fontWeight: 300, lineHeight: 1.85, color: 'var(--ink-dim)', maxWidth: 640 }}>
              I grew up in Istanbul and came to Stanford for undergrad. I studied Symbolic Systems, which is what you do when you can't choose between cognitive science, linguistics, philosophy, and CS. Stayed for an MS in Computer Science focused on HCI. That year mostly went into{' '}
              <a href="/project/bloom" className="about-link">Bloom</a>
              , an LLM-augmented physical activity coaching app built with Prof. Landay's lab. Second author on the CHI 2026 paper. I also took Arabic, which felt like the right way to spend whatever time was left.
            </p>
            <p style={{ fontSize: '1.2rem', fontWeight: 300, lineHeight: 1.85, color: 'var(--ink-dim)', maxWidth: 640 }}>
              I TA'd Stanford's core HCI sequence alongside the research: CS 147, CS 278, and CS 347. Before all of this I was in wet lab research at Stanford Medicine, studying ovarian cancer organoids at Kuo Lab. The experimental rigor carried over.
            </p>
            <p style={{ fontSize: '1.2rem', fontWeight: 300, lineHeight: 1.85, color: 'var(--ink-dim)', maxWidth: 640 }}>
              Now I'm an APM at Coinbase on the institutional derivatives team.
            </p>
          </div>
        </div>

        {/* What I'm thinking about */}
        <div className="content-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4rem', padding: '5rem 0', borderBottom: '1px solid var(--hairline)' }}>
          <div style={{ ...mono, fontSize: '0.75rem', color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.14em', paddingTop: '0.4rem' }}>
            What I'm<br />thinking about
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {[
              {
                title: 'Interfaces that surface strengths',
                body: 'Most health and productivity apps are built around gaps: what you haven\'t done, what you\'re behind on. Bloom showed me the other direction. Surfacing what people are already doing, in a way they hadn\'t noticed, can shift how they see themselves more than any streak or reminder. I want to build more things that work that way.',
              },
              {
                title: 'One-size-fits-all interfaces',
                body: 'We design for a hypothetical average person in a hypothetical average context. Someone with ADHD trying to use a habit tracker built for neurotypical attention gets an obstacle, not a tool. A student who thinks differently hits a wall in an app that assumes one reading mode. AI makes it genuinely plausible to do something about this.',
              },
              {
                title: 'Teaching AI to have taste',
                body: 'Ask AI to design something and you usually get something competent and forgettable. Models optimize toward what\'s most represented online. The more interesting question: can you give an AI a genuinely specific point of view? Not broad competence but spiky expertise — an agent that really knows Turkish hammam aesthetics and can tell you why one space works better than another. And here\'s the part that interests me most: a lot of taste is built offline. Things you touch, spaces you move through, what people wear on the street. Vision models and ubicomp open up something genuinely new here.',
              },
            ].map(({ title, body }) => (
              <div key={title}>
                <div style={{ fontSize: '1.15rem', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: '0.6rem' }}>
                  {title}
                </div>
                <p style={{ fontSize: '1.08rem', fontWeight: 300, lineHeight: 1.8, color: 'var(--ink-dim)', maxWidth: 580 }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Otherwise */}
        <div className="content-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4rem', padding: '5rem 0', borderBottom: '1px solid var(--hairline)' }}>
          <div style={{ ...mono, fontSize: '0.75rem', color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.14em', paddingTop: '0.4rem' }}>
            Otherwise
          </div>
          <div className="fact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem 3rem' }}>
            {[
              ['Origin', 'Istanbul, Turkey'],
              ['Based', 'New York City'],
              ['Education', 'Stanford MS CS (HCI) · BS SymSys'],
              ['Current role', 'APM @ Coinbase'],
              ['Research', 'Stanford HCI Group · Landay Lab'],
              ['Teaching', 'CS 147 · CS 278 · CS 347'],
              ['First research', 'Wet lab · Stanford Medicine · Kuo Lab'],
              ['Languages', 'Turkish (native), English (fluent), French (conversational)'],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ ...mono, fontSize: '0.7rem', color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.3rem', opacity: 0.6 }}>
                  {label}
                </div>
                <div style={{ fontSize: '1rem', color: 'var(--ink-dim)', lineHeight: 1.5 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div style={{ display: 'flex', gap: '2.5rem', padding: '3.5rem 0', flexWrap: 'wrap' }}>
          {[
            { label: 'Email', href: 'mailto:defneg@stanford.edu', text: 'defneg@stanford.edu' },
            { label: 'LinkedIn', href: 'https://linkedin.com/in/-defne', text: 'linkedin.com/in/-defne' },
            { label: 'GitHub', href: 'https://github.com/defnegenc', text: 'github.com/defnegenc' },
            { label: 'Résumé', href: '/resume', text: 'View résumé' },
          ].map(({ label, href, text }) => (
            <div key={label}>
              <div style={{ ...mono, fontSize: '0.7rem', color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.3rem', opacity: 0.6 }}>
                {label}
              </div>
              <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="about-link"
                style={{ fontSize: '1rem' }}>
                {text}
              </a>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
