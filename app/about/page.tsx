'use client'

import PageShell from '@/components/PageShell'
import { SectionRow, bodyText } from '@/components/layout'

// About runs at full ink and a step up in size: this page is mostly prose, so
// the site-wide dim body colour reads as too faint here.
const copy: React.CSSProperties = { ...bodyText, fontSize: '0.95rem', lineHeight: 1.65, color: 'var(--ink)' }

const THINKING: { claim: string; body: string }[] = [
  {
    claim: 'The next interface for computing with AI.',
    body: 'The last interface revolution we had was the touchscreen, and agentic capability and presence have only grown since. How will we keep track of agentic progress and find the right input and output modality?',
  },
  {
    claim: 'Personal information spaces.',
    body: 'Given the wealth of information available now that we’re letting agents work on our behalf, how do we represent and navigate our own knowledge? Normies call this context engineering, after the knowledge we give our agents.',
  },
  {
    claim: 'Can AI have taste, or is it all slop?',
    body: 'A lot of taste is built in the physical world, through things you touch, spaces you move through, what people wear on the street.',
  },
]

const FACTS: [string, string][] = [
  ['Based', 'New York City'],
  ['Education', 'Stanford CS PhD (deferred) · MS CS (HCI) · BS SymSys'],
  ['Languages', 'Turkish (native), English (fluent), French (conversational), Arabic (elementary), Spanish (elementary)'],
]


export default function About() {
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
      `}</style>

      <div className="about">

        <div className="fade-up fade-up-2">
          <SectionRow label="Background">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <p style={copy}>
                I grew up in <strong>Istanbul, Turkey</strong> and attended <strong>Stanford University</strong>, where I obtained my BS and MS specialising in Human-Computer Interaction. While at Stanford, I did academic research around AI for behavior change. I was second author on{' '}
                <a href="/project/bloom" className="about-link">Bloom</a>
                , an LLM-augmented physical activity coaching app built in Prof. James Landay{'’'}s Interaction Design Lab. I was admitted to the Stanford Computer Science PhD with a fall 2026 start, but I have deferred to remain in industry for the time being.
              </p>
              <p style={copy}>
                Since then, I{'’'}ve been thinking about how AI fits into the everyday lives of non-engineers: creatives, deep domain experts, the population it{'’'}s poorly designed for. What{'’'}s more, I think a lot about how modern interfaces fail to meet our needs with exponentially growing AI capabilities.
              </p>
            </div>
          </SectionRow>
        </div>

        <div className="fade-up fade-up-3">
          <SectionRow label={<>What I{'’'}m<br />thinking about</>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {THINKING.map(({ claim, body }) => (
                <div key={claim}>
                  <p style={{ ...copy, fontWeight: 600 }}>{claim}</p>
                  <p style={{ ...copy, marginTop: '0.25rem', color: 'var(--ink-dim)' }}>{body}</p>
                </div>
              ))}
            </div>
          </SectionRow>
        </div>

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
