'use client'

/* Résumé, one page, no tabs or collapsing. Lives inside the site frame as a
   solid sheet over the tile field. Print drops the field and prints on white.

   Content tracks defne-genc-resume.pdf in public/, trimmed by one sentence per
   entry for the web. Wording is verbatim from the PDF: sentences are dropped
   whole, never rewritten. */

const display: React.CSSProperties = { fontFamily: 'var(--font-display)' }

const EDUCATION = [
  {
    deg: 'Ph.D. Computer Science (HCI)',
    period: '2027 –',
    note: 'Advised by James Landay.',
  },
  { deg: 'M.S. Computer Science (HCI)', period: '2023 – 2025', gpa: 'GPA 3.93' },
  { deg: 'B.S. Symbolic Systems', period: '2020 – 2024' },
]

const ROLES = [
  {
    title: 'Product Manager',
    org: 'Coinbase',
    team: 'AI Platform, previously Institutional Derivatives',
    period: 'Aug 2025 – Present',
  },
  {
    title: 'Graduate Researcher',
    org: 'Stanford HCI Group',
    team: 'Bloom',
    period: 'Sep 2024 – Jun 2025',
    award: 'CHI 2026 Best Paper',
  },
  {
    title: 'Associate Product Manager Intern',
    org: 'Coinbase',
    team: 'Advanced Trade, Retail',
    period: 'Jun – Sep 2024',
  },
  {
    title: 'Product Strategy Intern',
    org: 'BrewBird',
    team: 'Sequoia-backed coffee platform',
    period: 'Jun 2023 – Jun 2024',
  },
  {
    title: 'Course Assistant',
    org: 'Stanford Computer Science',
    period: 'Sep 2024 – Present',
  },
]

const PROJECTS = [
  {
    name: 'Learning Et Al.',
    period: '2026 – Present',
    note: 'Solo, live at learningetal.com',
    href: 'https://learningetal.com',
    body: 'Daily research-digest agent that picks a central question, retrieves contrasting papers, then runs a multi-stage synthesis loop that self-critiques and revises before shipping.',
    stack: 'Next.js, TypeScript, FastAPI',
  },
  {
    name: 'Menuto',
    period: '2025',
    note: 'Solo full-stack AI dish-recommendation app',
    body: 'Built a four-path menu-ingestion pipeline with LLM structure extraction into typed dish objects, plus a preference-learning recommendation loop.',
  },
]

const SKILLS: [string, string][] = [
  ['Build', 'TypeScript, React Native, Next.js, Python, FastAPI, SQLAlchemy'],
  ['AI', 'Agent harnesses, tool use, LLM evals and safety, vector embeddings'],
  ['Design', 'UI/UX design, UX research, prototyping'],
  ['Research', 'Study design, qualitative coding'],
  ['Data', 'SQL, Snowflake, data visualisation'],
  ['Product', 'Product management, AI education and teaching in product'],
]

export function SheetHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ ...display, fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--ink)', marginBottom: '1.1rem' }}>
      {children}
    </div>
  )
}

/* A dated entry: the period sits in a fixed rail on the left so every date
   lines up and the years can be scanned without reading the titles. */
function Entry({ period, children }: { period: string; children: React.ReactNode }) {
  return (
    <div className="rs-entry">
      <div className="rs-when" style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--ink-dim)', lineHeight: 1.5, paddingTop: '0.25rem' }}>{period}</div>
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  )
}

export default function ResumeSheet() {
  return (
    <>
      <style>{`
        /* main column carries the record; the aside carries projects and skills */
        .rs-two { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr); gap: 3.5rem; align-items: start; max-width: 1100px; }
        /* the aside is too narrow for a date rail, so its dates sit above */
        .rs-two aside .rs-entry { grid-template-columns: 1fr; gap: 0.2rem; }
        .rs-two aside .rs-when { order: -1; padding-top: 0 !important; margin-bottom: 0.1rem; }
        @media (max-width: 900px) { .rs-two { grid-template-columns: 1fr; gap: 2.4rem; } }
        .rs-entry { display: grid; grid-template-columns: 9rem minmax(0, 1fr); gap: 1.25rem; }
        .rs-entry + .rs-entry { margin-top: 1.05rem; }
        .rs-section + .rs-section { margin-top: 2.2rem; }
        @media (max-width: 700px) {
          .rs-entry { grid-template-columns: 1fr; gap: 0.2rem; }
          .rs-entry + .rs-entry { margin-top: 1.4rem; }
        }
      `}</style>

      <div className="rs-two">
        <div>
        <section className="rs-section">
          <SheetHeading>Education</SheetHeading>
          {EDUCATION.map(e => (
            <Entry key={e.deg} period={e.period}>
              <div style={{ ...display, fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.3 }}>{e.deg}</div>
              <div style={{ fontSize: '0.92rem', color: 'var(--ink-dim)', marginTop: '0.12rem' }}>
                Stanford University{e.gpa ? ` · ${e.gpa}` : ''}
              </div>
              {e.note && (
                <div style={{ fontSize: '0.9rem', color: 'var(--ink-dim)', marginTop: '0.3rem', lineHeight: 1.55 }}>{e.note}</div>
              )}
            </Entry>
          ))}
        </section>
        <section className="rs-section">
          <SheetHeading>Experience</SheetHeading>
          {ROLES.map(r => (
            <Entry key={r.title + r.org} period={r.period}>
              <div style={{ ...display, fontSize: '1.12rem', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                {r.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.14rem' }}>
                <span style={{ fontSize: '0.95rem', color: 'var(--ink)' }}>{r.org}</span>
                {r.team && <span style={{ fontSize: '0.9rem', color: 'var(--ink-dim)' }}>{r.team}</span>}
                {r.award && <span className="award" style={{ fontSize: '0.9rem', fontWeight: 500 }}>{r.award}</span>}
              </div>
            </Entry>
          ))}
        </section>
        <section className="rs-section">
          <SheetHeading>Research and publications</SheetHeading>
          <Entry period="2024 – 2025">
            <div style={{ ...display, fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.35 }}>
              Bloom: Designing for LLM-Augmented Behavior Change Interactions
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--ink-dim)', marginTop: '0.3rem', lineHeight: 1.55 }}>
              Jörke, <span style={{ color: 'var(--ink)', fontWeight: 500 }}>Genç</span>, Teutschbein, Sapkota, Chung, Schmiedmayer, Campero, King, Brunskill, Landay. Second author.
            </div>
            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', display: 'flex', gap: '1.1rem', flexWrap: 'wrap' }}>
              <span className="award">CHI 2026 · Best Paper</span>
              <a className="ul" href="https://arxiv.org/abs/2510.05449" target="_blank" rel="noreferrer" style={{ color: 'var(--ink)', textDecoration: 'none' }}>arXiv:2510.05449</a>
            </div>
          </Entry>
        </section>
        </div>

        <aside>
        <section className="rs-section">
          <SheetHeading>Projects</SheetHeading>
          {PROJECTS.map(p => (
            <Entry key={p.name} period={p.period}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap' }}>
                <span style={{ ...display, fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.3 }}>{p.name}</span>
                {p.href
                  ? <a className="ul" href={p.href} target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem', color: 'var(--ink-dim)', textDecoration: 'none' }}>{p.note}</a>
                  : <span style={{ fontSize: '0.9rem', color: 'var(--ink-dim)' }}>{p.note}</span>}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--ink-dim)', marginTop: '0.3rem', lineHeight: 1.6 }}>{p.body}</div>
              {p.stack && <div style={{ fontSize: '0.88rem', color: 'var(--ink-dim)', marginTop: '0.4rem' }}>{p.stack}</div>}
            </Entry>
          ))}
        </section>
        <section className="rs-section">
          <SheetHeading>Skills</SheetHeading>
          {SKILLS.map(([cat, items]) => (
            <Entry key={cat} period={cat}>
              <div style={{ fontSize: '0.92rem', color: 'var(--ink)', lineHeight: 1.5 }}>{items}</div>
            </Entry>
          ))}
        </section>
        </aside>
      </div>
    </>
  )
}
