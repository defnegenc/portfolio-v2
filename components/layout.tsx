import type { CSSProperties, ReactNode } from 'react'

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
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(1.6rem, 2.6vw, 2.2rem)',
  fontWeight: 600,
  letterSpacing: '-0.02em',
  lineHeight: 1,
}

// Section heading (e.g. project section <h2>). Dialed down from the old 2.4rem cap.
export const sectionHeading: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '1rem',
  fontWeight: 600,
  letterSpacing: '-0.01em',
  color: 'var(--ink)',
}

/* Row label. A proper heading in the display face: the small mono version read
   as faint decoration rather than as a label, and tiny dim text is banned. */
export const eyebrow: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(1.05rem, 1.5vw, 1.3rem)',
  fontWeight: 600,
  letterSpacing: '-0.01em',
  color: 'var(--ink)',
}

// Default body copy. Lighter and wider-set than the old 1.2rem / 1.85 lh.
export const bodyText: CSSProperties = {
  fontSize: '0.88rem',
  fontWeight: 400,
  lineHeight: 1.6,
  color: 'var(--ink-dim)',
}

// Comfortable reading measure for body columns.
export const TEXT_MAX = 720

/* ── SectionRow ────────────────────────────────────────────────────────
   Two-column row: a heading on the left, content on the right.
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
        gridTemplateColumns: '0.45fr 2fr',
        gap: '2rem',
        padding: '1.35rem 0',
        borderBottom: last ? 'none' : '1px solid var(--hairline)',
      }}
    >
      <div style={{ ...eyebrow, paddingTop: '0.2rem', lineHeight: 1.4 }}>{label}</div>
      <div>{children}</div>
    </div>
  )
}
