'use client'

import PageShell from '@/components/PageShell'
import FieldRule from '@/components/FieldRule'
import { SectionRow, bodyText, heroTitle } from '@/components/layout'
import { useTheme } from '@/components/useTheme'
import { ABOUT_PARAS, ABOUT_FACTS } from '@/components/aboutContent'
import AboutPara from '@/components/AboutPara'

// About runs at full ink and a step up in size: this page is mostly prose, so
// the site-wide dim body colour reads as too faint here.
const copy: React.CSSProperties = { ...bodyText, fontSize: '0.95rem', lineHeight: 1.65, color: 'var(--ink)' }

const FACTS = ABOUT_FACTS


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
              {ABOUT_PARAS.map((t, i) => <AboutPara key={i} text={t} style={copy} />)}
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
