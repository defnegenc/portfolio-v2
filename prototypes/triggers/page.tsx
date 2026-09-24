'use client'

/* Prototypes for the control that opens the canvas panel.

   The job is narrow: sit on top of a busy animated field, survive any accent
   colour, and make it obvious there is something to click. Each option below is
   live over a real canvas so it can be judged in the only context that counts.

   Temporary. Once one wins, it replaces the button in WeatherControl. */

import { useState } from 'react'
import Link from 'next/link'
import AsciiCanvas from '@/components/AsciiCanvas'
import ThemeToggle from '@/components/ThemeToggle'
import { useTheme } from '@/components/useTheme'

type Trigger = {
  id: string
  name: string
  note: string
  render: (on: boolean) => React.ReactNode
}

const Info = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <circle cx="12" cy="6.4" r="2.05" />
    <rect x="10.05" y="10.4" width="3.9" height="9.2" rx="1.95" />
  </svg>
)

const Chevron = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const TRIGGERS: Trigger[] = [
  {
    id: 'current',
    name: 'Current',
    note: 'What is live: an accent pill with the label inside it. Reads as a button, but competes with the field for attention and changes colour with the weather.',
    render: () => <button className="t t-current">About this canvas</button>,
  },
  {
    id: 'plate',
    name: 'Plate',
    note: 'Page background, hairline border, ink text. Sits on the field like the theme switch does, so it belongs to the chrome rather than the artwork.',
    render: () => <button className="t t-plate">About this canvas</button>,
  },
  {
    id: 'plate-dot',
    name: 'Plate with dot',
    note: 'The same plate with a live accent dot. The dot is the only coloured thing, so it carries the “this is running” signal without tinting the whole control.',
    render: () => <button className="t t-plate"><span className="t-dot" />About this canvas</button>,
  },
  {
    id: 'plate-info',
    name: 'Plate with an i',
    note: 'Plate plus the info mark. The icon does the “there is more here” work and the words say what the more is about.',
    render: () => <button className="t t-plate"><Info />About this canvas</button>,
  },
  {
    id: 'disc-hover',
    name: 'Disc, label on hover',
    note: 'Quietest at rest: a small info disc that grows its label when you approach. Costs discoverability for anyone who never hovers, which on touch is everyone.',
    render: () => (
      <button className="t t-disc">
        <Info />
        <span className="t-grow">About this canvas</span>
      </button>
    ),
  },
  {
    id: 'underline',
    name: 'Underlined text',
    note: 'No container at all, just an underlined label on a background plate. The underline is the affordance. Weakest on a busy field.',
    render: () => <button className="t t-underline"><span>About this canvas</span></button>,
  },
  {
    id: 'question',
    name: 'Question',
    note: 'Phrase it as a question and the answer is obviously behind a click. Longest label in the set.',
    render: () => <button className="t t-plate">What is this?<Chevron /></button>,
  },
  {
    id: 'reading',
    name: 'Live readout',
    note: 'States what the canvas is doing right now. The content is the invitation: you click because it told you something and you want the rest.',
    render: () => (
      <button className="t t-plate">
        <span>Overcast, night</span>
        <span className="t-sep" />
        <span className="t-cta">What is this?</span>
      </button>
    ),
  },
  {
    id: 'pulse',
    name: 'Pulsing dot',
    note: 'Plate with a dot that breathes on the same cycle as the field. Motion is the strongest attention cue here, and it stops once opened.',
    render: on => (
      <button className="t t-plate">
        <span className={on ? 't-dot' : 't-dot t-pulse'} />About this canvas
      </button>
    ),
  },
  {
    id: 'tab',
    name: 'Tab',
    note: 'Squared off and flush to the top edge, as though the panel is already there and you are pulling it down. The shape implies the gesture.',
    render: () => <button className="t t-tab">About this canvas<Chevron /></button>,
  },
  {
    id: 'corner',
    name: 'Corner tag',
    note: 'A tag clipped into the corner of the frame. Belongs to the canvas rather than floating over it, like a caption on a plate.',
    render: () => <button className="t t-corner"><Info size={12} />About this canvas</button>,
  },
  {
    id: 'ghost',
    name: 'Ghost',
    note: 'Accent outline, transparent centre, so the field shows through. Keeps the accent link without stamping a solid block onto the artwork.',
    render: () => <button className="t t-ghost"><Info />About this canvas</button>,
  },
]

export default function TriggerLab() {
  const [theme, setTheme] = useTheme('dark')
  const isLight = theme === 'light'
  const [on, setOn] = useState<string | null>(null)

  return (
    <div data-theme={theme} style={{ position: 'fixed', inset: 0, overflowY: 'auto', background: 'var(--bg)', color: 'var(--ink)' }}>
      <style>{`
        [data-theme="light"] { --bg: #F4F2EC; --ink: #1A1918; --ink-dim: #2E2D2A; --hairline: rgba(26,25,24,0.15); --award: #013698; }
        [data-theme="dark"]  { --bg: #0A0A0A; --ink: #E8E6E0; --ink-dim: #D2D0CA; --hairline: rgba(232,230,224,0.12); --award: #7FA8F5; }

        .tg-back { display: inline-block; font-size: 0.9rem; color: var(--ink-dim); text-decoration: none; transition: color .2s; }
        .tg-back:hover { color: var(--award); }
        .tg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }
        .tg-card { display: flex; flex-direction: column; gap: 0.7rem; }
        .tg-stage {
          position: relative; height: 130px; border: 1px solid var(--hairline); border-radius: 10px;
          overflow: hidden; cursor: pointer;
        }
        .tg-stage > .tg-slot { position: absolute; top: 0.7rem; right: 0.7rem; z-index: 5; }
        .tg-name { font-size: 1rem; font-weight: 600; letter-spacing: -0.01em; }
        .tg-note { font-size: 0.85rem; line-height: 1.5; color: var(--ink-dim); }

        /* ── the triggers ─────────────────────────────────────────────── */
        .t {
          display: inline-flex; align-items: center; gap: 0.45rem;
          font-family: inherit; font-size: 0.88rem; font-weight: 600; line-height: 1;
          height: 30px; padding: 0 0.85rem; border-radius: 999px;
          border: none; cursor: pointer; white-space: nowrap;
          transition: box-shadow .2s, background .2s, color .2s, border-color .2s;
        }
        .t-current { background: var(--award); color: var(--bg); }
        .t-plate { background: var(--bg); color: var(--ink); border: 1px solid var(--hairline); }
        .t-plate:hover { border-color: var(--award); color: var(--award); }
        .t-ghost { background: transparent; color: var(--award); border: 2px solid var(--award); }
        .t-ghost:hover { background: var(--award); color: var(--bg); }

        .t-dot { width: 7px; height: 7px; border-radius: 999px; background: var(--award); flex-shrink: 0; }
        @keyframes t-breathe { 0%,100% { transform: scale(1); opacity: .65 } 50% { transform: scale(1.5); opacity: 1 } }
        .t-pulse { animation: t-breathe 2.4s ease-in-out infinite; }
        .t-sep { width: 1px; height: 12px; background: var(--hairline); }
        /* the half of the control that is actually the invitation */
        .t-cta { color: var(--award); border-bottom: 1.5px solid transparent; padding-bottom: 1px; transition: border-color .2s; }
        .t:hover .t-cta { border-bottom-color: var(--award); }

        /* disc that grows a label */
        .t-disc {
          background: var(--bg); color: var(--ink); border: 1px solid var(--hairline);
          padding: 0 0.55rem; overflow: hidden;
        }
        .t-grow {
          max-width: 0; opacity: 0; overflow: hidden;
          transition: max-width .35s cubic-bezier(.19,1,.22,1), opacity .2s, margin-left .35s;
        }
        .t-disc:hover { border-color: var(--award); color: var(--award); }
        .t-disc:hover .t-grow { max-width: 12rem; opacity: 1; margin-left: 0.4rem; }

        .t-underline {
          background: var(--bg); color: var(--ink); border: 1px solid transparent;
          padding: 0.25rem 0.5rem; border-radius: 6px;
        }
        .t-underline span { border-bottom: 2px solid var(--award); padding-bottom: 1px; }
        .t-underline:hover { color: var(--award); }

        /* flush to the top edge, like a drawer pull */
        .t-tab {
          background: var(--bg); color: var(--ink); border: 1px solid var(--hairline); border-top: none;
          border-radius: 0 0 10px 10px; height: 28px;
        }
        .t-tab:hover { color: var(--award); border-color: var(--award); }

        .t-corner {
          background: var(--bg); color: var(--ink); border: 1px solid var(--hairline);
          border-radius: 0 0 0 10px; border-top: none; border-right: none; height: 30px;
        }
        .t-corner:hover { color: var(--award); }
      `}</style>

      <div style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>

        <header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '2rem' }}>
            <div>
              <Link href="/" className="tg-back">← Work</Link>
              <h1 style={{ fontSize: 'clamp(1.5rem, 2.6vw, 2.1rem)', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: '0.5rem' }}>
                Canvas trigger studies
              </h1>
            </div>
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
          <p style={{ fontSize: '0.98rem', lineHeight: 1.6, color: 'var(--ink)', marginTop: '0.7rem', maxWidth: 820 }}>
            Twelve ways to say “there is something behind this”. Each one sits on a live field at the size
            and position it would really occupy, because the whole difficulty is surviving a busy animated
            background. The accent tracks the field, as it does on the real site. Flip the theme to check both.
          </p>
        </header>

        <div className="tg-grid">
          {TRIGGERS.map(t => (
            <div key={t.id} className="tg-card">
              <div className="tg-stage" onClick={() => setOn(on === t.id ? null : t.id)}
                style={{ ['--award' as string]: isLight ? '#8a5a16' : '#F2B26B' }}>
                <AsciiCanvas render="tiles" motion="brush" hover="mono" lightMode={isLight}
                  chars="▓▒░" color="#F2B26B" rest={0.38} />
                {/* the tab and corner variants attach to the frame edge */}
                <div className="tg-slot" style={
                  t.id === 'tab' ? { top: 0, right: '1.2rem' }
                  : t.id === 'corner' ? { top: 0, right: 0 }
                  : undefined
                }>
                  {t.render(on === t.id)}
                </div>
              </div>
              <div className="tg-name">{t.name}</div>
              <div className="tg-note">{t.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
