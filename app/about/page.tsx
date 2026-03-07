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
      style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-main)' }}
    >
      <style>{`
        html, body { overflow: auto !important; }
        [data-theme="light"] {
          --bg: #F4F2EC;
          --ink: #1A1918;
          --ink-dim: #5A5955;
          --hairline: rgba(26,25,24,0.15);
        }
        [data-theme="dark"] {
          --bg: #0A0A0A;
          --ink: #E8E6E0;
          --ink-dim: #888880;
          --hairline: rgba(232,230,224,0.1);
        }
        .about-link { color: var(--ink-dim); text-decoration: none; position: relative; transition: color 0.2s; }
        .about-link::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 1px; background: currentColor; transform: scaleX(0); transform-origin: right; transition: transform 0.3s cubic-bezier(.19,1,.22,1); }
        .about-link:hover::after { transform: scaleX(1); transform-origin: left; }
        .about-link:hover { color: var(--ink) !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.6s cubic-bezier(.16,1,.3,1) both; }
        .fade-up-1 { animation-delay: 0.05s; }
        .fade-up-2 { animation-delay: 0.12s; }
        .fade-up-3 { animation-delay: 0.2s; }
        .fade-up-4 { animation-delay: 0.28s; }
        .fade-up-5 { animation-delay: 0.36s; }
        @media (max-width: 700px) {
          .hero-inner { flex-direction: column !important; }
          .hero-photo-wrap { width: 100% !important; height: 56vw !important; min-height: 220px !important; }
          .content-grid { grid-template-columns: 1fr !important; gap: 1.25rem !important; }
          .fact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

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

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem 8rem' }}>

        {/* Hero — compact inline */}
        <div className="fade-up fade-up-1 hero-inner" style={{ display: 'flex', gap: '4rem', padding: '4rem 0 4.5rem', borderBottom: '1px solid var(--hairline)', alignItems: 'flex-start' }}>

          {/* Vertical animation strips */}
          <div className="hero-photo-wrap" style={{ flexShrink: 0, display: 'flex', gap: 6, height: 300, alignItems: 'stretch' }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ width: 52, height: '100%', overflow: 'hidden', opacity: 0.7 + i * 0.075 }}>
                <AsciiCanvas breathe lightMode={isLight} />
              </div>
            ))}
          </div>

          {/* Text */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingTop: '1rem' }}>
            <div className="fade-up fade-up-2" style={{ ...mono, fontSize: '0.62rem', color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '1.25rem' }}>
              Istanbul · Stanford · New York
            </div>
            <h1 className="fade-up fade-up-3" style={{ fontSize: 'clamp(2.8rem, 5vw, 5.5rem)', fontWeight: 400, letterSpacing: '-0.04em', lineHeight: 0.88, marginBottom: '1.75rem' }}>
              Defne<br />Genç
            </h1>
            <p className="fade-up fade-up-4" style={{ fontSize: 'clamp(0.95rem, 1.3vw, 1.1rem)', fontWeight: 300, lineHeight: 1.75, color: 'var(--ink-dim)', maxWidth: 420 }}>
              Designer, researcher, engineer — in that order of how I think, and rarely in that order of how I work.
              I'm interested in interfaces that adapt to people rather than demanding people adapt to them.
            </p>
          </div>
        </div>

        {/* Background */}
        <div className="fade-up fade-up-5 content-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4rem', padding: '5rem 0', borderBottom: '1px solid var(--hairline)' }}>
          <div style={{ ...mono, fontSize: '0.62rem', color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.14em', paddingTop: '0.4rem' }}>
            Background
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 300, lineHeight: 1.85, color: 'var(--ink-dim)', maxWidth: 640 }}>
              I grew up in Istanbul and came to Stanford for undergrad — Symbolic Systems, which is what happens when you can't choose between cognitive science, linguistics, philosophy, and CS. I stayed for an MS in Computer Science (HCI), and the bulk of what I worked on during those two years was{' '}
              <a href="/project/bloom" className="about-link">Bloom</a>
              {' '}— an LLM-augmented physical activity coaching app with Prof. James Landay's lab. Second author on the CHI 2026 paper.
            </p>
            <p style={{ fontSize: '1.1rem', fontWeight: 300, lineHeight: 1.85, color: 'var(--ink-dim)', maxWidth: 640 }}>
              Alongside research, I was a teaching assistant for Stanford's core HCI sequence — CS 147, CS 278, and CS 347 — which kept me grounded in how designers actually learn to think. I started in wet lab research at Stanford Medicine (Kuo Lab, ovarian cancer organoids), which sounds like a pivot, but the experimental rigor transferred directly.
            </p>
            <p style={{ fontSize: '1.1rem', fontWeight: 300, lineHeight: 1.85, color: 'var(--ink-dim)', maxWidth: 640 }}>
              Now I'm APM at Coinbase, working on institutional derivatives. I still build things on the side —{' '}
              <a href="/project/menuto" className="about-link">Menuto</a>
              {' '}is a full-stack AI dish recommendation app I designed and built solo from scratch.
            </p>
          </div>
        </div>

        {/* What I'm thinking about */}
        <div className="content-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4rem', padding: '5rem 0', borderBottom: '1px solid var(--hairline)' }}>
          <div style={{ ...mono, fontSize: '0.62rem', color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.14em', paddingTop: '0.4rem' }}>
            What I'm<br />thinking about
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {[
              {
                title: 'Interfaces that surface strengths',
                body: 'Most health and productivity interfaces are optimized around gaps — what you haven\'t done, what you\'re missing. Bloom showed me that surfacing what people are already doing, in a way they haven\'t noticed, can shift self-perception more meaningfully than reminders and streaks. I\'m interested in building more systems that work this way.',
              },
              {
                title: 'Rigid interfaces failing diverse populations',
                body: 'We design for a hypothetical average user in a single context. Someone with ADHD finds a habit tracker designed for neurotypical attention spans becomes an obstacle. A student who processes information differently hits a wall in an interface that assumes one reading mode. AI and ubiquitous computing suggest we don\'t have to keep building this way.',
              },
              {
                title: 'The design of trust in AI systems',
                body: 'My safety work on Bloom was about building trust in a high-stakes direction — keeping an LLM from causing harm with vulnerable participants. The flip side is equally interesting: designing AI systems that earn appropriate trust from users, explain themselves legibly, and know when to defer. Menuto\'s "why this dish?" feature was a small version of this problem.',
              },
            ].map(({ title, body }) => (
              <div key={title}>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: '0.6rem' }}>
                  {title}
                </div>
                <p style={{ fontSize: '0.95rem', fontWeight: 300, lineHeight: 1.8, color: 'var(--ink-dim)', maxWidth: 580 }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Otherwise */}
        <div className="content-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4rem', padding: '5rem 0', borderBottom: '1px solid var(--hairline)' }}>
          <div style={{ ...mono, fontSize: '0.62rem', color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.14em', paddingTop: '0.4rem' }}>
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
                <div style={{ ...mono, fontSize: '0.58rem', color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.3rem', opacity: 0.6 }}>
                  {label}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--ink-dim)', lineHeight: 1.5 }}>{value}</div>
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
              <div style={{ ...mono, fontSize: '0.58rem', color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.3rem', opacity: 0.6 }}>
                {label}
              </div>
              <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="about-link"
                style={{ fontSize: '0.88rem' }}>
                {text}
              </a>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
