'use client'

/* The homepage frame, reused on content pages.

   Same slim name strip, same weather-driven field, same margins: the content
   sits inside the wall inset, so its edges line up with the canvas band above
   it. No windows here, and the field is cursor-only — the weather picks the
   pattern and the colour, but nothing moves until you move. */

import Link from 'next/link'
import AsciiCanvas, { type Motion, type Hover, type Render } from '@/components/AsciiCanvas'
import ThemeToggle from '@/components/ThemeToggle'
import NavMenu from '@/components/NavMenu'
import { useEffect, useState } from 'react'
import { useTheme } from '@/components/useTheme'
import { useAmbient } from '@/components/ambient'
import { forTheme } from '@/components/color'

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' }

export default function PageShell({
  here, band = 132, field = 'band', accent, motion = 'brush', hover = 'mono', render = 'tiles', fieldColor, children,
}: { here: 'about' | 'project' | 'resume'; band?: number; field?: 'band' | 'right' | 'none'; accent?: string; motion?: Motion; hover?: Hover; render?: Render; fieldColor?: string; children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false)
  // the colour the homepage field last resolved to, so a visit reads as one piece
  const [carried, setCarried] = useState<string | null>(null)
  useEffect(() => { setCarried(window.localStorage.getItem('accent')) }, [])
  const [theme, setTheme] = useTheme('dark')
  const isLight = theme === 'light'
  const { ambient } = useAmbient('weather')

  // The field here is always an ink brush stroke: no colour, no rainbow, no
  // caption. The weather still quietly picks the accent, but a project's own
  // accent overrides it when there is one.
  const tint = carried ?? accent ?? ambient?.accent ?? ambient?.color ?? null
  const canvas = (
    <AsciiCanvas
      render={render}
      motion={motion}
      hover={hover}
      breathe={motion === 'breathe'}
      lightMode={isLight}
      chars='▓▒░'
      color={fieldColor}
      rest={0.34}
    />
  )

  return (
    <div
      data-theme={theme}
      className="shell"
      style={{
        position: 'fixed', inset: 0, overflowY: 'auto',
        background: 'var(--bg)', color: 'var(--ink)',
        ...(tint ? ({ '--award': forTheme(tint, isLight) } as React.CSSProperties) : {}),
      }}
    >
      <style>{`
        .shell { --wall: 1.75rem; }
        [data-theme="light"] { --bg: #F4F2EC; --ink: #1A1918; --ink-dim: #2E2D2A; --hairline: rgba(26,25,24,0.15); --award: #013698; }
        [data-theme="dark"]  { --bg: #0A0A0A; --ink: #E8E6E0; --ink-dim: #D2D0CA; --hairline: rgba(232,230,224,0.12); --award: #7FA8F5; }
        .shell .award { color: var(--award); }
        .shell .ul { transition: color .2s; }
        .shell .ul:hover { color: var(--award) !important; }
        /* On a phone the field replaces the hairline between sections: a short
           band reads as the same object as the one above, where a rule is just
           a line. Desktop keeps the hairline. */
        .shell-rule { display: none; }
        @media (max-width: 860px) {
          .shell-rule { display: block; position: relative; height: 72px; margin: 0.4rem 0 1rem; }
          .about .section-row { border-bottom: none !important; }
        }
        .shell .ns-seg .theme-toggle { transition: opacity .25s ease; }
        .shell .ns-seg[data-navopen="1"] .theme-toggle { opacity: 0; pointer-events: none; }
        @media (max-width: 420px) { .shell .ns-sub { display: none; } }
        @media (max-width: 860px) {
          .shell-split { grid-template-columns: 1fr !important; }
          .shell-split > div:first-child { order: 2; }
          .shell-field { position: static !important; order: 1; }
          .shell-field > div:first-child { height: 30vh !important; height: 30dvh !important; min-height: 190px !important; }
        }
        @media (max-width: 700px) {
          .shell { --wall: 1.25rem; }
          .shell-band { height: 88px !important; }
        }
      `}</style>

      {/* name strip: identical to the homepage — same padding, same order,
          same items, same baseline alignment */}
      <div className="name-strip" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0.45rem 1.75rem', borderBottom: '1px solid var(--hairline)', position: 'sticky', top: 0, zIndex: 310, background: 'var(--bg)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.85rem', minWidth: 0 }}>
          <Link href="/" style={{ fontSize: 'clamp(0.95rem,1.5vw,1.15rem)', fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1, color: 'var(--ink)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            DEFNE GENÇ
          </Link>
          <div className="ns-sub" style={{ fontSize: '0.86rem', lineHeight: 1.2, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Stanford CS / AI @ Coinbase / NYC
          </div>
        </div>
        <div className="ns-seg" data-navopen={navOpen ? 1 : 0} style={{ display: 'flex', gap: '0.7rem', alignItems: 'center', flexShrink: 0 }}>
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <NavMenu open={navOpen} setOpen={setNavOpen} items={[
            { label: 'Home', href: '/' },
            { label: 'About', href: '/about', here: here === 'about' },
            { label: 'Résumé', href: '/resume', here: here === 'resume' },
            { label: 'Research', href: 'https://arxiv.org/abs/2510.05449' },
          ]} />
        </div>
      </div>

      {field === 'none' ? (
        /* the résumé desk owns the whole viewport, so no field here */
        <div style={{ padding: 'var(--wall)' }}>{children}</div>
      ) : field === 'right' ? (
        /* the field stands as a full-height column on the right, the copy runs
           down the left. On narrow screens it drops back to a band on top. */
        <div className="shell-split" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 0.58fr)', gap: 'var(--wall)', padding: 'var(--wall)', alignItems: 'start' }}>
          <div style={{ paddingBottom: '2rem' }}>{children}</div>
          <div className="shell-field" style={{ position: 'sticky', top: 'calc(var(--wall) + 2.4rem)' }}>
            <div style={{ height: 'calc(100dvh - var(--wall) * 2 - 4.4rem)', minHeight: 320, position: 'relative' }}>
              {canvas}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* the field: same margins as the content below it */}
          <div style={{ padding: 'var(--wall) var(--wall) 0' }}>
            <div className="shell-band" style={{ height: band, position: 'relative' }}>{canvas}</div>
          </div>

          {/* content, aligned to the same edges */}
          <div style={{ padding: '1.5rem var(--wall) 4rem' }}>
            {children}
          </div>
        </>
      )}

    </div>
  )
}
