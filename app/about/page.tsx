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

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem 8rem', position: 'relative', zIndex: 1 }}>

        {/* Hero */}
        <div className="fade-up fade-up-1 hero-inner" style={{ display: 'flex', gap: '4rem', padding: '4rem 0 4.5rem', borderBottom: '1px solid var(--hairline)', alignItems: 'flex-start' }}>
          <div className="hero-strips" style={{ display: 'flex', gap: 6, height: 280, flexShrink: 0, alignSelf: 'stretch' }}>
            {[0.45, 0.65, 0.82, 1].map((opacity, i) => (
              <div key={i} style={{ flex: 1, minWidth: 56, maxWidth: 72, height: '100%', overflow: 'hidden', opacity }}>
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
              What I think about most as a technologist is systems that are context-aware, human-centered, and so well fitted to a person's life that they stop feeling like technology at all.
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
              I grew up in Istanbul, Turkey, and came to Stanford to pursue a liberal arts education. I studied Symbolic Systems, which is what you do when you can't choose between cognitive science, linguistics, philosophy, and CS. I stayed another year to focus on research: I received an MS in CS and spent the year working on{' '}
              <a href="/project/bloom" className="about-link">Bloom</a>
              , an LLM-augmented physical activity coaching app we built in Prof. James Landay's Interaction Design Lab, where I was second author on the CHI 2026 paper. Alongside the research I also took Arabic, which felt like a natural way to spend the remaining time — I have a goal of speaking six languages before I turn 30.
            </p>
            <p style={{ fontSize: '1.2rem', fontWeight: 300, lineHeight: 1.85, color: 'var(--ink-dim)', maxWidth: 640 }}>
              I also spent a lot of time teaching. I was a course assistant for Stanford's core HCI sequence:{' '}
              <a href="https://hci.stanford.edu/courses/cs147/2024/au/" target="_blank" rel="noreferrer" className="about-link">CS 147</a>
              ,{' '}
              <a href="https://web.stanford.edu/class/cs278/" target="_blank" rel="noreferrer" className="about-link">CS 278</a>
              , and{' '}
              <a href="https://stanfordhci.github.io/cs347-winter-2025/index" target="_blank" rel="noreferrer" className="about-link">CS 347</a>
              , and it was arguably one of my favorite things about being at Stanford. Teaching and my students taught me just as much as my classes did. I worked with students in hands-on design studios, taking projects from early interviews to working prototypes, and led weekly sections reading through HCI research papers with small groups. The conversations about where the field is going were some of the best I had. It was a spectacular complement to the research, and someday I'd like to use what I've learned about HCI to think more seriously about education itself.
            </p>
            <p style={{ fontSize: '1.2rem', fontWeight: 300, lineHeight: 1.85, color: 'var(--ink-dim)', maxWidth: 640 }}>
              Now I'm an APM at Coinbase on the institutional derivatives team, working on perpetual futures, dated futures, and options on one of the largest regulated crypto derivatives venues in the world.
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
                body: 'I see two critical problems with current behavior change systems: rigid interfaces that fail diverse populations, and negative feedback loops that undermine the outcomes they\'re designed to support. I want to build adaptive systems that learn from ambient patterns and surface positive behaviors people are unaware of. Beyond chat, I\'m interested in contextual interventions, editable ambient widgets, spatial design, and tangible objects that carry personal meaning — deployed over weeks to measure real shifts in self-efficacy and confidence.',
              },
              {
                title: 'The myth of the universal user',
                body: 'Interface design has always operated on the premise of the "universal user." Someone with ADHD using a habit tracker built for neurotypical attention doesn\'t have a personal failing — they have an interface that was never designed for them. This isn\'t only a challenge for marginalized populations. Even the so-called ideal user is constrained by interfaces that assume a singular context. AI changes this. Systems can now understand semantic goals and adapt to how someone is engaging in real time. Flexible interfaces are no longer a research aspiration. They are a design problem, and we will build the solutions with AI.',
              },
              {
                title: 'Can AI have taste, or is it all slop?',
                body: 'Technology that learns from human output tends, by design, to regress toward the mean. The most represented wins. But taste is almost the opposite of that: it\'s about having strong preferences, specific references, a point of view. I want to think about how to give AI genuine spikes, the way humans have them. Specialties. Dislikes. An aesthetic sensibility that can tell you not just what is good on average, but what is right for a specific place, material, or moment. And here is what makes this hard: a lot of taste is built in the physical world. Things you touch, spaces you move through, what people wear on the street. It is embodied and contextual in a way that text on the internet is not. Ubiquitous computing changes that. Ambient sensing, wearables, spatial awareness — these open up the possibility of grounding AI taste in real-world experience rather than just what has been written about it.',
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
            {([
              ['Origin', 'Istanbul, Turkey'],
              ['Based', 'New York City'],
              ['Education', 'Stanford MS CS (HCI) · BS SymSys'],
              ['Current role', 'APM @ Coinbase'],
              ['Teaching', 'CS 147 · CS 278 · CS 347'],
              ['Languages', 'Turkish (native), English (fluent), French (conversational), Arabic (elementary), Spanish (elementary)'],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label}>
                <div style={{ ...mono, fontSize: '0.7rem', color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.3rem', opacity: 0.6 }}>
                  {label}
                </div>
                <div style={{ fontSize: '1rem', color: 'var(--ink-dim)', lineHeight: 1.5 }}>{value}</div>
              </div>
            ))}
            <div>
              <div style={{ ...mono, fontSize: '0.7rem', color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.3rem', opacity: 0.6 }}>Research</div>
              <div style={{ fontSize: '1rem', color: 'var(--ink-dim)', lineHeight: 1.5 }}>
                <a href="https://hci.stanford.edu/" target="_blank" rel="noreferrer" className="about-link">Landay Lab (Computer Science)</a>
                {' · Kuo Lab (Stanford Medicine)'}
              </div>
            </div>
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
