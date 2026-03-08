'use client'

import { useState } from 'react'
import Link from 'next/link'

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' }
const dim: React.CSSProperties = { color: 'var(--ink-dim)' }

// ─── Data ──────────────────────────────────────────────────────────────────

const ROLES = [
  {
    category: 'Work',
    title: 'Associate Product Manager',
    org: 'Coinbase',
    period: 'Aug 2025 – Present',
    bullets: [
      'PM for institutional derivatives on Coinbase International Exchange — one of the largest regulated crypto derivatives venues globally.',
      'Shipped market data infrastructure, platform settings, and cross-functional internal tooling across UI/UX, marketing, and regulatory compliance.',
      'Works with engineers, designers, and risk/legal to scope and land launches affecting the exchange at scale.',
      'Owns the team\'s business intelligence dashboards.',
    ],
  },
  {
    category: 'Research',
    title: 'Graduate Researcher',
    org: 'Stanford HCI Group (GPTCoach / Bloom)',
    period: 'Sep 2024 – Present',
    bullets: [
      'Core researcher on Bloom, an LLM-augmented physical activity coaching app — CHI 2026, 2nd author, accepted.',
      'Led UI/UX design across the app, including a novel ambient activity display (garden metaphor) on homescreen and lockscreen.',
      'Owned React Native frontend implementation; built Streamlit + Firestore dashboard for live field monitoring.',
      'Led safety red-teaming: designed harm taxonomy, validated on a 600-example benchmark with >96% recall across risk categories.',
      'Co-led 54-participant 4-week randomized field deployment — recruitment, onboarding, data pipelines, and qualitative coding.',
    ],
  },
  {
    category: 'Work',
    title: 'Associate Product Manager Intern',
    org: 'Coinbase',
    period: 'Jun – Sep 2024',
    bullets: [
      'Built 0→1 charting tool and notifications engine for the International Exchange platform.',
      'Authored PRDs for 3 features, including a promotional-tab A/B test projected to increase international perpetual trader onboarding by 20%.',
      'Synthesized 1,000+ user feedback datapoints into prioritized roadmap direction.',
    ],
  },
  {
    category: 'Work',
    title: 'Product Strategy Intern',
    org: 'BrewBird',
    period: 'Jun 2023 – Jun 2024',
    bullets: [
      'Sole UX designer for a Sequoia-backed IoT coffee platform — owned end-to-end product design and the public landing page.',
      'Drove data-informed marketing strategy that increased digital engagement 9× and generated 600+ qualified sales leads.',
    ],
  },
  {
    category: 'Teaching',
    title: 'Course Assistant — CS 147, CS 278, CS 347',
    org: 'Stanford Computer Science',
    period: 'Sep 2024 – Present',
    bullets: [
      'Teaching assistant across Stanford\'s core HCI sequence: HCI Design (CS 147), Social Computing (CS 278), and HCI Foundations & Frontiers graduate seminar (CS 347).',
      'Led studio sections on AI-supported language learning and building sociotechnical systems.',
    ],
  },
]

const TABS = ['All', 'Work', 'Research', 'Teaching'] as const
type Tab = typeof TABS[number]

// ─── Components ────────────────────────────────────────────────────────────

function SectionHeader({
  label, open, onToggle,
}: { label: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'none', border: 'none', padding: 0,
        borderTop: '1px solid var(--hairline)', paddingTop: '1.75rem', marginBottom: open ? '1.5rem' : '1.75rem',
        cursor: 'pointer',
      }}
    >
      <span style={{ ...mono, fontSize: '0.75rem', color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
        {label}
      </span>
      <span style={{ ...mono, fontSize: '0.7rem', color: 'var(--ink-dim)', transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
        ↓
      </span>
    </button>
  )
}

function Role({ title, org, period, bullets }: {
  title: string; org: string; period: string; bullets: string[]
}) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>{title}</span>
          <span style={{ ...dim, fontSize: '1rem' }}> — {org}</span>
        </div>
        <div style={{ ...mono, fontSize: '0.72rem', ...dim, whiteSpace: 'nowrap' }}>{period}</div>
      </div>
      <ul style={{ paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.55rem' }}>
        {bullets.map((b, i) => (
          <li key={i} style={{ fontSize: '1rem', lineHeight: 1.65, ...dim }}>{b}</li>
        ))}
      </ul>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function Resume() {
  const [activeTab, setActiveTab] = useState<Tab>('All')
  const [open, setOpen] = useState({ education: true, experience: true, publications: true, skills: true })

  const toggle = (s: keyof typeof open) => setOpen(prev => ({ ...prev, [s]: !prev[s] }))

  const visibleRoles = activeTab === 'All' ? ROLES : ROLES.filter(r => r.category === activeTab)

  return (
    <main data-theme="light" style={{
      background: 'var(--bg)', color: 'var(--ink)',
      height: '100vh', fontFamily: 'var(--font-main)',
      overflowY: 'auto',
    }}>
      <style>{`
        .resume-tab { transition: color 0.15s, border-color 0.15s; cursor: pointer; }
        .resume-tab:hover { color: var(--ink) !important; }
        .section-collapse { overflow: hidden; transition: opacity 0.2s; }
        .section-collapse.closed { opacity: 0; height: 0; pointer-events: none; }
        .section-collapse.open { opacity: 1; }
        @page { size: letter; margin: 0.55in 0.65in; }
        @media print {
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          html, body { background: #fff !important; color: #000 !important; overflow: visible !important; height: auto !important; }
          [data-theme="light"] { --bg: #fff !important; --ink: #111 !important; --ink-dim: #555 !important; --hairline: rgba(0,0,0,0.12) !important; }
          main { height: auto !important; overflow: visible !important; background: #fff !important; min-height: 0 !important; }
          div, section, nav, header, footer { background-color: transparent !important; }
          button { display: none !important; }
          .section-collapse.closed { opacity: 1 !important; height: auto !important; pointer-events: auto !important; }
          nav[data-tabbar] { display: none !important; }
          canvas { display: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '3.5rem 2rem 6rem' }}>

        {/* Nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
          <Link href="/" style={{ ...mono, fontSize: '0.75rem', color: 'var(--ink-dim)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            ← Back
          </Link>
          <button
            onClick={() => window.print()}
            style={{
              ...mono, fontSize: '0.75rem', color: 'var(--ink-dim)',
              background: 'none', border: '1px solid var(--hairline)',
              padding: '0.4rem 0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
            }}
          >
            Print / Save PDF
          </button>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 0.9, marginBottom: '1.25rem' }}>
            Defne Genç
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', ...mono, fontSize: '0.85rem', ...dim }}>
            {[
              { label: 'defneg@stanford.edu', href: 'mailto:defneg@stanford.edu' },
              { label: 'defne.io', href: 'https://defne.io' },
              { label: 'linkedin.com/in/-defne', href: 'https://linkedin.com/in/-defne' },
              { label: 'github.com/defnegenc', href: 'https://github.com/defnegenc' },
            ].map(({ label, href }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer"
                style={{ color: 'var(--ink-dim)', textDecoration: 'none' }}>
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Education */}
        <SectionHeader label="Education" open={open.education} onToggle={() => toggle('education')} />
        <div className={`section-collapse ${open.education ? 'open' : 'closed'}`}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.2rem' }}>M.S. Computer Science — HCI</div>
              <div style={{ fontSize: '1rem', ...dim }}>Stanford University</div>
              <div style={{ ...mono, fontSize: '0.72rem', ...dim, marginTop: '0.25rem' }}>2024 – 2025 · GPA 3.93 / 4.0</div>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.2rem' }}>B.S. Symbolic Systems</div>
              <div style={{ fontSize: '1rem', ...dim }}>Stanford University</div>
              <div style={{ ...mono, fontSize: '0.72rem', ...dim, marginTop: '0.25rem' }}>2020 – 2024</div>
            </div>
          </div>
          <div style={{ ...mono, fontSize: '0.8rem', ...dim, lineHeight: 1.8, marginBottom: '1.75rem' }}>
            Algorithms · Big Data · Probability · HCI · AI · Applied Stats (R/SQL) · Operating Systems · Computational Logic
          </div>
        </div>

        {/* Experience */}
        <SectionHeader label="Experience" open={open.experience} onToggle={() => toggle('experience')} />
        <div className={`section-collapse ${open.experience ? 'open' : 'closed'}`}>
          {/* Tab bar */}
          <nav data-tabbar style={{ display: 'flex', gap: '0', marginBottom: '2rem', borderBottom: '1px solid var(--hairline)' }}>
            {TABS.map(tab => (
              <button
                key={tab}
                className="resume-tab"
                onClick={() => setActiveTab(tab)}
                style={{
                  ...mono, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em',
                  background: 'none', border: 'none', padding: '0.5rem 1rem 0.6rem',
                  color: activeTab === tab ? 'var(--ink)' : 'var(--ink-dim)',
                  borderBottom: `2px solid ${activeTab === tab ? 'var(--ink)' : 'transparent'}`,
                  marginBottom: '-1px',
                }}
              >
                {tab}
              </button>
            ))}
          </nav>
          {visibleRoles.map((r, i) => (
            <Role key={i} title={r.title} org={r.org} period={r.period} bullets={r.bullets} />
          ))}
        </div>

        {/* Publications */}
        <SectionHeader label="Research & Publications" open={open.publications} onToggle={() => toggle('publications')} />
        <div className={`section-collapse ${open.publications ? 'open' : 'closed'}`}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '1.05rem', lineHeight: 1.5, marginBottom: '0.3rem' }}>
              <span style={{ fontWeight: 600 }}>Bloom: Designing for LLM-Augmented Behavior Change Interactions</span>
            </div>
            <div style={{ fontSize: '0.98rem', ...dim, marginBottom: '0.3rem' }}>
              Jörke, <span style={{ color: 'var(--ink)' }}>Genç</span>, Teutschbein, Sapkota, Chung, Schmiedmayer, Campero, King, Brunskill, Landay
            </div>
            <div style={{ ...mono, fontSize: '0.75rem', ...dim, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span>CHI 2026 · 2nd author · Accepted</span>
              <a href="https://arxiv.org/abs/2510.05449" target="_blank" rel="noreferrer"
                style={{ color: 'var(--ink-dim)', textDecoration: 'none' }}>
                arXiv:2510.05449
              </a>
            </div>
          </div>
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '1.05rem', marginBottom: '0.2rem' }}>
              Kuo Lab — Ovarian Cancer Organoids
            </div>
            <div style={{ fontSize: '0.98rem', ...dim, marginBottom: '0.2rem' }}>
              Stanford School of Medicine · Wet Lab Researcher
            </div>
            <div style={{ ...mono, fontSize: '0.75rem', ...dim }}>Jan 2021 – Jan 2022</div>
          </div>
        </div>

        {/* Skills */}
        <SectionHeader label="Skills" open={open.skills} onToggle={() => toggle('skills')} />
        <div className={`section-collapse ${open.skills ? 'open' : 'closed'}`}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem 1.5rem', marginBottom: '2rem' }}>
            {[
              ['Languages', 'Python, TypeScript, SQL, C/C++'],
              ['Frontend', 'React Native, Streamlit'],
              ['Backend / Data', 'Supabase, Firebase, FastAPI'],
              ['Design', 'Figma, UI/UX Systems, Prototyping'],
              ['Research', 'User Research, A/B Testing, Qualitative Coding'],
              ['AI / Safety', 'Red Teaming, AI Safety, LLM Integration'],
              ['PM', 'PRDs, Roadmapping, BI Dashboards'],
            ].map(([cat, items]) => (
              <div key={cat}>
                <div style={{ ...mono, fontSize: '0.72rem', ...dim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>
                  {cat}
                </div>
                <div style={{ fontSize: '0.95rem', ...dim, lineHeight: 1.6 }}>{items}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}
