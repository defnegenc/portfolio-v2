'use client'

/* GSAP rebuild of two things already on the site.

   1. The bio phrase walk. Today it is a chain of setTimeouts stepping a React
      state, which re-renders all forty words on every step. Here it is one
      timeline over pre-rendered spans, so the highlight is a property tween and
      React never re-renders. It also gains a scrubber, pause, and replay for
      free, because a timeline is a value you can hold.

   2. The scroll-open windows. Today a wheel listener accumulates a number.
      Here ScrollTrigger drives it from real scroll position, which means it
      works with trackpads, keyboards, and the scrollbar, and can be scrubbed
      backwards. */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import AsciiCanvas from '@/components/AsciiCanvas'

const BIO = 'I think about how modern interfaces fail to meet our needs with exponentially growing AI capabilities. BS, MS, and a deferred PhD admission in Computer Science from Stanford University. Now AI @ Coinbase, where I own the agent creation experience.'
const WORDS = BIO.split(' ')
const LENGTHS = [3, 3, 5, 5, 7, 3, 3, 4, 4, 3]
const PHRASES: [number, number][] = (() => {
  const out: [number, number][] = []
  let i = 0
  LENGTHS.forEach(n => { out.push([i, i + n - 1]); i += n })
  return out
})()

const PROJECTS = ['Bloom', 'Learning Et Al.', 'Menuto', 'Dishcovery']

export default function GsapProto() {
  const para = useRef<HTMLParagraphElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)
  const [progress, setProgress] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>('.g-w')

      // ── 1. the phrase walk as one timeline ──────────────────────────
      const t = gsap.timeline({
        onUpdate: () => setProgress(t.progress()),
        onComplete: () => setPlaying(false),
      })
      PHRASES.forEach(([from, to], i) => {
        const group = words.slice(from, to + 1)
        t.to(group, { backgroundColor: 'var(--award)', color: 'var(--bg)', duration: 0.18, stagger: 0.02 }, i * 0.9)
         .to(group, { backgroundColor: 'rgba(0,0,0,0)', color: 'var(--ink)', duration: 0.25 }, i * 0.9 + 0.72)
      })
      tl.current = t

      // ── 2. the project list, revealed on scroll ─────────────────────
      gsap.from('.g-row', {
        scrollTrigger: { trigger: list.current, start: 'top 85%' },
        y: 18, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out',
      })

      // ── 3. the windows opening, driven by real scroll ───────────────
      gsap.to('.g-top', {
        scrollTrigger: { trigger: '.g-stage', start: 'top top', end: '+=120%', scrub: 0.6, pin: true },
        height: '100%', ease: 'none',
      })
      gsap.to('.g-copy', {
        scrollTrigger: { trigger: '.g-stage', start: 'top top', end: '+=60%', scrub: 0.6 },
        opacity: 0, y: -20, ease: 'none',
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <div style={{ background: '#0A0A0A', color: '#E8E6E0', ['--award' as string]: '#F2B26B', ['--ink' as string]: '#E8E6E0', ['--bg' as string]: '#0A0A0A' }}>
      <style>{`
        .g-w { display: inline-block; padding: 0.06em 0.16em; margin-right: 0.1em; border-radius: 3px; }
        .g-ctl { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.4rem; flex-wrap: wrap; }
        .g-btn { font: inherit; font-size: 0.88rem; font-weight: 600; padding: 0.4rem 0.9rem; border-radius: 999px;
                 background: none; color: #E8E6E0; border: 1px solid rgba(232,230,224,.2); cursor: pointer; }
        .g-btn:hover { border-color: #F2B26B; color: #F2B26B; }
        .g-bar { flex: 1; min-width: 180px; height: 3px; background: rgba(232,230,224,.14); border-radius: 999px; overflow: hidden; }
        .g-fill { height: 100%; background: #F2B26B; }
        .g-row { display: flex; gap: 1rem; align-items: baseline; padding: 0.7rem 0; border-bottom: 1px solid rgba(232,230,224,.12); font-size: 1.3rem; font-weight: 500; }
        .g-note { font-size: 0.9rem; line-height: 1.6; color: #D2D0CA; max-width: 760px; }
        .g-h2 { font-size: 1.1rem; font-weight: 600; color: #F2B26B; margin-bottom: 0.5rem; }
      `}</style>

      <div style={{ padding: 'clamp(1.25rem,3vw,2rem)', maxWidth: 1000, margin: '0 auto' }}>
        <Link href="/proto" style={{ fontSize: '0.9rem', color: '#D2D0CA', textDecoration: 'none' }}>← Prototypes</Link>
        <h1 style={{ fontSize: 'clamp(1.5rem,2.6vw,2.1rem)', fontWeight: 600, letterSpacing: '-0.02em', margin: '0.5rem 0 0.7rem' }}>
          GSAP
        </h1>
        <p className="g-note">
          The same phrase walk and scroll-open that are live on the site, rebuilt as GSAP timelines. The
          difference is not how it looks, it is that the animation becomes an object you can scrub, pause and
          replay, and that scroll is driven by real scroll position rather than accumulated wheel deltas.
        </p>

        <section style={{ marginTop: '2.5rem' }}>
          <div className="g-h2">1 · Phrase walk as a scrubbable timeline</div>
          <p ref={para} style={{ fontSize: 'clamp(1.15rem,1.5vw,1.35rem)', lineHeight: 1.75, maxWidth: 860 }}>
            {WORDS.map((w, i) => <span key={i} className="g-w">{w}</span>)}
          </p>
          <div className="g-ctl">
            <button className="g-btn" onClick={() => { const t = tl.current!; playing ? t.pause() : t.play(); setPlaying(!playing) }}>
              {playing ? 'Pause' : 'Play'}
            </button>
            <button className="g-btn" onClick={() => { tl.current!.restart(); setPlaying(true) }}>Replay</button>
            <div className="g-bar" onClick={e => {
              const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
              tl.current!.progress((e.clientX - r.left) / r.width).pause()
              setPlaying(false)
            }}>
              <div className="g-fill" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>
        </section>

        <section ref={list} style={{ marginTop: '3rem' }}>
          <div className="g-h2">2 · Project list, staggered on scroll</div>
          <p className="g-note">Each row enters as the list reaches 85% of the viewport. ScrollTrigger handles the observer, the stagger and the reverse.</p>
          <div style={{ marginTop: '1rem' }}>
            {PROJECTS.map(p => <div key={p} className="g-row">{p}</div>)}
          </div>
        </section>
      </div>

      <section className="g-stage" style={{ marginTop: '4rem', height: '100vh', position: 'relative', overflow: 'hidden' }}>
        <div className="g-top" style={{ height: '62%', position: 'relative' }}>
          <AsciiCanvas render="tiles" motion="breathe" breathe hover="rainbow" chars="▓▒░" color="#F2B26B" />
        </div>
        <div className="g-copy" style={{ padding: '1.5rem', background: '#0A0A0A' }}>
          <div className="g-h2">3 · Scroll-open, driven by scroll position</div>
          <p className="g-note">
            Pinned and scrubbed. Unlike the wheel-delta version on the site, this reverses smoothly, respects
            the scrollbar and the keyboard, and lands exactly where the scroll says it should.
          </p>
        </div>
      </section>

      <div style={{ height: '60vh' }} />
    </div>
  )
}
