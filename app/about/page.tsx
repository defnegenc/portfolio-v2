'use client'

import PageShell from '@/components/PageShell'
import FieldRule from '@/components/FieldRule'
import { SectionRow, bodyText, heroTitle } from '@/components/layout'
import { useTheme } from '@/components/useTheme'

// About runs at full ink and a step up in size: this page is mostly prose, so
// the site-wide dim body colour reads as too faint here.
const copy: React.CSSProperties = { ...bodyText, fontSize: '0.95rem', lineHeight: 1.65, color: 'var(--ink)' }

const FACTS: [string, string][] = [
  ['Based', 'New York City'],
  ['Education', 'Stanford CS PhD (deferred) · MS CS (HCI) · BS SymSys'],
  ['Languages', 'Turkish (native), English (fluent), French (conversational), Arabic (elementary), Spanish (elementary)'],
]


export default function About() {
  const [theme] = useTheme('dark')
  const rule = <FieldRule render="glyphs" motion="trickle" hover="mono" color="#7FA8F5" lightMode={theme === 'light'} />
  return (
    <PageShell here="about" field="right" motion="trickle" hover="mono" render="glyphs" fieldColor="#7FA8F5">
      <style>{`
        .about-link { color: var(--ink-dim); text-decoration: none; position: relative; transition: color 0.2s; }
        .about-link::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 1px; background: currentColor; transform: scaleX(0); transform-origin: right; transition: transform 0.3s cubic-bezier(.19,1,.22,1); }
        .about-link:hover::after { transform: scaleX(1); transform-origin: left; }
        .about-link:hover { color: var(--award) !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.6s cubic-bezier(.16,1,.3,1) both; }
        .fade-up-1 { animation-delay: 0.05s; } .fade-up-2 { animation-delay: 0.12s; }
        .fade-up-3 { animation-delay: 0.2s; }
        /* the copy lives in a narrower column now, so the label rail tightens up */
        .about .section-row { grid-template-columns: 0.4fr 2fr; gap: 1.5rem; padding: 1.15rem 0; }
        @media (max-width: 1100px) { .about .section-row { grid-template-columns: 1fr !important; gap: 0.5rem !important; } }
        @media (max-width: 700px) { .fact-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 860px) { .about .section-row { border-bottom: none !important; padding-bottom: 0.3rem; } }
      `}</style>

      <div className="about">

        <div className="fade-up fade-up-2">
          <SectionRow label={<h1 style={{ ...heroTitle, margin: 0 }}>About Me</h1>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <p style={copy}>
                At my day job, I'm a product manager. I have a computer science degree + research experience, which would make me an engineer. People want to call me a designer because I have good taste and can make things look pretty. I am all and none of those things. And today, I would argue, those distinctions don't matter.
              </p>
              <p style={copy}>
                What does matter is how we turn new technology into something useful. That takes product vision, design taste, and engineering knowledge. There are too many smart people thinking about AI model capabilities and not enough people thinking about their affordances.
              </p>
              <p style={copy}>
                The chat interface is to LLMs what the CLI was to personal computers. Still useful, but not the final interface. We need to make the leap to find AI's GUI.
              </p>
              <p style={copy}>
                I'm a humanist obsessed with AI interfaces. I grew up in Istanbul, Turkey. I'm about to obtain my third computer science degree from Stanford University and have decided to devote it solely to thinking about the next interface revolution.
              </p>
            </div>
          </SectionRow>
        </div>

        {rule}

        <SectionRow label="Otherwise" last>
          <div className="fact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem 2rem' }}>
            {FACTS.map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.25rem' }}>{label}</div>
                <div style={{ fontSize: '0.92rem', color: 'var(--ink-dim)', lineHeight: 1.5 }}>{value}</div>
              </div>
            ))}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.25rem' }}>Research</div>
              <div style={{ fontSize: '0.92rem', color: 'var(--ink-dim)', lineHeight: 1.5 }}>
                <a href="https://hci.stanford.edu/" target="_blank" rel="noreferrer" className="about-link">Landay Lab</a>
                {' · Kuo Lab (Stanford Medicine)'}
              </div>
            </div>
          </div>
        </SectionRow>

      </div>
    </PageShell>
  )
}
