'use client'

/* Lenis on the scroll-open gesture.

   The site currently intercepts `wheel` and accumulates deltaY into a number.
   That works on a trackpad and nowhere else: no keyboard, no scrollbar, no
   momentum, and the page cannot actually scroll because the frame is
   overflow:hidden.

   Lenis instead lets the page scroll normally and smooths it, so the open
   amount can be read off real scroll progress. Toggle it below to feel the
   difference on the same content. */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Lenis from 'lenis'
import AsciiCanvas from '@/components/AsciiCanvas'

export default function LenisProto() {
  const [smooth, setSmooth] = useState(true)
  const [open, setOpen] = useState(0)
  const lenis = useRef<Lenis | null>(null)

  useEffect(() => {
    if (!smooth) return
    const l = new Lenis({ duration: 1.1, wheelMultiplier: 0.9 })
    lenis.current = l
    let raf = 0
    const loop = (t: number) => { l.raf(t); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); l.destroy(); lenis.current = null }
  }, [smooth])

  // open amount comes from real scroll progress, smoothed or not
  useEffect(() => {
    const read = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setOpen(max > 0 ? Math.min(1, window.scrollY / (max * 0.5)) : 0)
    }
    read()
    window.addEventListener('scroll', read, { passive: true })
    return () => window.removeEventListener('scroll', read)
  }, [])

  return (
    <div style={{ background: '#0A0A0A', color: '#E8E6E0' }}>
      <style>{`
        .l-btn { font: inherit; font-size: 0.88rem; font-weight: 600; padding: 0.4rem 0.9rem; border-radius: 999px;
                 background: none; color: #E8E6E0; border: 1px solid rgba(232,230,224,.2); cursor: pointer; }
        .l-btn[data-on="1"] { border-color: #7FA8F5; color: #7FA8F5; }
        .l-note { font-size: 0.9rem; line-height: 1.6; color: #D2D0CA; max-width: 760px; }
        .l-h2 { font-size: 1.1rem; font-weight: 600; color: #7FA8F5; margin-bottom: 0.5rem; }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', pointerEvents: 'none', zIndex: 5 }}>
        <div style={{ flex: `0 0 ${62 + 38 * open}%`, position: 'relative' }}>
          <AsciiCanvas render="tiles" motion="breathe" breathe hover="rainbow" chars="▓▒░" color="#7FA8F5" />
        </div>
        <div style={{ flex: 1, background: '#0A0A0A', padding: '1.5rem clamp(1.25rem,3vw,2rem)', opacity: 1 - Math.min(1, open * 2), pointerEvents: 'auto' }}>
          <Link href="/proto" style={{ fontSize: '0.9rem', color: '#D2D0CA', textDecoration: 'none' }}>← Prototypes</Link>
          <h1 style={{ fontSize: 'clamp(1.5rem,2.6vw,2.1rem)', fontWeight: 600, letterSpacing: '-0.02em', margin: '0.5rem 0 0.7rem' }}>Lenis</h1>
          <p className="l-note">
            Scroll the page. The windows open from real scroll position rather than accumulated wheel deltas,
            so the scrollbar, arrow keys, space bar and page-down all work. Turn smoothing off to compare.
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
            <button className="l-btn" data-on={smooth ? 1 : 0} onClick={() => setSmooth(true)}>Smooth on</button>
            <button className="l-btn" data-on={smooth ? 0 : 1} onClick={() => setSmooth(false)}>Native</button>
            <span className="l-note" style={{ alignSelf: 'center' }}>open {Math.round(open * 100)}%</span>
          </div>
        </div>
      </div>

      {/* the scroll track the fixed frame reads from */}
      <div style={{ height: '320vh' }} />
    </div>
  )
}
