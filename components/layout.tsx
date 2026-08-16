import type { CSSProperties, ReactNode } from 'react'

const mono: CSSProperties = { fontFamily: 'var(--font-mono)' }

/* ── Shared layout tokens ──────────────────────────────────────────────
   One source of truth for page width and the type scale, so the About
   page and project pages read at the same density as the homepage.
   These are plain style objects / presentational components with no hooks,
   so they import cleanly into both client and server components. */

export const PAGE_MAX = 1200

export const pageContainer = (maxWidth: number = PAGE_MAX): CSSProperties => ({
  maxWidth,
  margin: '0 auto',
  padding: '0 2.5rem 6rem',
  position: 'relative',
  zIndex: 1,
})

// Big page title. Smaller and tighter than before so it stops dominating.
export const heroTitle: CSSProperties = {
  fontSize: 'clamp(2.4rem, 4.5vw, 4.25rem)',
  fontWeight: 400,
  letterSpacing: '-0.04em',
  lineHeight: 0.92,
}

// Section heading (e.g. project section <h2>). Dialed down from the old 2.4rem cap.
export const sectionHeading: CSSProperties = {
  fontSize: 'clamp(1.35rem, 2.6vw, 1.9rem)',
  fontWeight: 700,
  letterSpacing: '-0.03em',
  color: 'var(--ink)',
}

// Row label. Sentence case in the body face: the small tracked-out uppercase
// mono version read as faint decoration rather than as a label.
export const eyebrow: CSSProperties = {
  fontSize: '0.95rem',
  fontWeight: 500,
  color: 'var(--ink)',
  opacity: 0.75,
}

// Default body copy. Lighter and wider-set than the old 1.2rem / 1.85 lh.
export const bodyText: CSSProperties = {
  fontSize: '1.02rem',
  fontWeight: 300,
  lineHeight: 1.7,
  color: 'var(--ink-dim)',
}

// Comfortable reading measure for body columns.
export const TEXT_MAX = 760

/* ── SectionRow ────────────────────────────────────────────────────────
   Two-column row: a mono label on the left, content on the right.
   Tighter left column than before (0.55fr vs 1fr) so the content column
   gets noticeably wider. Collapses to a single column on mobile via the
   .section-row rule in globals.css. */

export function SectionRow({
  label,
  children,
  last = false,
}: {
  label: ReactNode
  children: ReactNode
  last?: boolean
}) {
  return (
    <div
      className="section-row"
      style={{
        display: 'grid',
        gridTemplateColumns: '0.55fr 2fr',
        gap: '3rem',
        padding: '2.75rem 0',
        borderBottom: last ? 'none' : '1px solid var(--hairline)',
      }}
    >
      <div style={{ ...eyebrow, paddingTop: '0.35rem', lineHeight: 1.4 }}>{label}</div>
      <div>{children}</div>
    </div>
  )
}
