/* Figures for About me, drawn like the illustrations in Xerox's Star
   materials: plain outlined shapes, dot-pattern fills, labels in Helvetica.
   The wrapper sets --g-bg, --g-ink and --g-accent. Dates are from the résumé. */

const X0 = 2018, X1 = 2029.4
const x = (yr: number) => 70 + ((yr - X0) / (X1 - X0)) * 660
const NOW = 2026.84

type Bar = { from: number; to: number; t: string; open?: boolean; planned?: boolean }
const PLACES: Bar[] = [
  { from: X0, to: 2020.7, t: 'Istanbul' },
  { from: 2020.7, to: 2025.6, t: 'Stanford' },
  { from: 2025.6, to: X1, t: 'New York', open: true },
]
const SCHOOL: Bar[] = [
  { from: 2020.7, to: 2024.5, t: 'B.S. Symbolic Systems' },
  { from: 2023.7, to: 2025.5, t: 'M.S. CS (HCI)' },
  { from: 2027.7, to: X1, t: 'Ph.D.', planned: true },
]

/* Where I lived along the top, school underneath on its own lanes, so the
   B.S. and M.S. overlap where they did. */
export function Timeline() {
  // B.S. and the Ph.D. share a lane (they don't meet); the M.S. sits below, where it overlaps the B.S.
  const schoolY = (i: number) => (i === 1 ? 154 : 114)
  const lane = (b: Bar, y: number, h: number, fill: string, key: string) => (
    <g key={key}>
      <rect x={x(b.from)} y={y} width={x(b.to) - x(b.from)} height={h} fill={fill}
        stroke="var(--g-ink)" strokeWidth="1.5" strokeDasharray={b.planned ? '4 3' : undefined} />
      {/* a dotted bar keeps its label on a patch of paper */}
      {fill !== 'var(--g-bg)' && <rect x={x(b.from) + 4} y={y + 6} width={Math.min(b.t.length * 7.2 + 8, x(b.to) - x(b.from) - 8)} height={h - 12} fill="var(--g-bg)" />}
      <text x={x(b.from) + 8} y={y + h / 2} className="tl-label" dominantBaseline="middle">{b.t}</text>
      {b.open && <path d={`M${x(b.to) - 2},${y - 4} L${x(b.to) + 10},${y + h / 2} L${x(b.to) - 2},${y + h + 4}`} fill="var(--g-bg)" stroke="var(--g-ink)" strokeWidth="1.5" />}
    </g>
  )
  const years = Array.from({ length: 12 }, (_, i) => X0 + i)
  return (
    <svg className="tl-svg" viewBox="0 0 760 270" role="img" aria-label="Timeline: Istanbul until 2020, Stanford 2020 to 2025, New York since 2025. B.S. 2020 to 2024 and M.S. 2023 to 2025, overlapping, then a Ph.D. from 2027, deferred.">
      <defs>
        <pattern id="tl-dots" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="1.3" height="1.3" fill="var(--g-ink)" /></pattern>
      </defs>
      <text x="70" y="26" className="tl-head">WHERE I LIVED</text>
      {PLACES.map((b, i) => lane(b, 36, 34, 'var(--g-bg)', 'p' + i))}
      <text x="70" y="104" className="tl-head">SCHOOL</text>
      {SCHOOL.map((b, i) => lane(b, schoolY(i), 30, b.planned ? 'var(--g-bg)' : 'url(#tl-dots)', 's' + i))}
      {/* today */}
      <line x1={x(NOW)} x2={x(NOW)} y1="30" y2="212" stroke="var(--g-accent)" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x={x(NOW)} y="226" textAnchor="middle" className="tl-now">now</text>
      {/* the years */}
      <line x1={x(X0)} x2={x(X1)} y1="240" y2="240" stroke="var(--g-ink)" strokeWidth="1.5" />
      {years.map(y => <g key={y}>
        <line x1={x(y)} x2={x(y)} y1="236" y2="244" stroke="var(--g-ink)" strokeWidth="1.2" />
        <text x={x(y)} y="260" textAnchor="middle" className="tl-year">{y}</text>
      </g>)}
    </svg>
  )
}

/* The same site, twice: a terminal and a Star desktop. The one you're not on
   is a link to it. */
export function CliGui({ here }: { here: 'cli' | 'gui' }) {
  const screen = (side: 'cli' | 'gui', ox: number) => {
    const body = side === 'cli'
      ? <g>
          <rect x={ox + 14} y="34" width="272" height="170" fill="var(--g-ink)" />
          {['% ls projects', 'bloom/  catching-my-drift/', 'learning-et-al/  dishcovery/', '% open .'].map((t, i) => (
            <text key={t} x={ox + 28} y={60 + i * 22} className="cg-mono">{t}</text>
          ))}
          <rect x={ox + 102} y="117" width="9" height="15" fill="#F59A2B" />
        </g>
      : <g>
          <rect x={ox + 14} y="34" width="272" height="170" fill="url(#cg-dots)" stroke="var(--g-ink)" strokeWidth="1" />
          <rect x={ox + 30} y="50" width="160" height="112" fill="var(--g-bg)" stroke="var(--g-ink)" strokeWidth="1.5" />
          {[0, 1, 2].map(i => <line key={i} x1={ox + 30} x2={ox + 190} y1={54 + i * 3} y2={54 + i * 3} stroke="var(--g-ink)" strokeWidth="1" />)}
          {[0, 1, 2, 3, 4].map(i => <line key={i} x1={ox + 40} x2={ox + 180 - (i % 2) * 30} y1={76 + i * 11} y2={76 + i * 11} stroke="var(--g-ink)" strokeWidth="1" />)}
          {[[214, 52], [246, 52], [214, 94], [246, 94], [214, 136]].map(([dx, dy]) => (
            <rect key={`${dx}${dy}`} x={ox + dx} y={dy} width="24" height="28" fill="var(--g-bg)" stroke="var(--g-ink)" strokeWidth="1.5" />
          ))}
        </g>
    const monitor = (
      <g className={side === here ? 'cg-here' : 'cg-go'}>
        <rect x={ox} y="20" width="300" height="198" rx="3" fill="var(--g-bg)" stroke="var(--g-ink)" strokeWidth="3" />
        {body}
        <path d={`M${ox + 150},218 V236 M${ox + 110},240 H${ox + 190}`} stroke="var(--g-ink)" strokeWidth="3" fill="none" />
        <text x={ox + 150} y="268" textAnchor="middle" className="cg-name">{side === 'cli' ? 'CLI' : 'GUI'}</text>
      </g>
    )
    return side === here ? <g key={side}>{monitor}</g> : <a key={side} href={side === 'cli' ? '/cli' : '/'} aria-label={`Switch to the ${side.toUpperCase()}`}>{monitor}</a>
  }
  return (
    <svg className="tl-svg" viewBox="0 0 760 290" role="img" aria-label="The same site as a command line and as a desktop">
      <defs>
        <pattern id="cg-dots" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="1.3" height="1.3" fill="var(--g-ink)" /></pattern>
      </defs>
      {screen('cli', 40)}
      {screen('gui', 420)}
      <path d="M352 120 H408" stroke="var(--g-ink)" strokeWidth="1.5" strokeDasharray="4 3" />
      <path d="M400 114 L410 120 L400 126" fill="none" stroke="var(--g-ink)" strokeWidth="1.5" />
    </svg>
  )
}

export const FIGURE_CSS = `
  .tl-svg { width: 100%; height: auto; display: block; overflow: visible; }
  .tl-head { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; fill: var(--g-ink); }
  .tl-label { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 13px; fill: var(--g-ink); }
  .tl-year { font-family: var(--font-mono), ui-monospace, monospace; font-size: 11px; fill: var(--g-ink); }
  .tl-now { font-family: var(--font-mono), ui-monospace, monospace; font-size: 11px; fill: var(--g-accent); }
  .cg-mono { font-family: var(--font-mono), ui-monospace, monospace; font-size: 13px; fill: var(--g-bg); }
  .cg-name { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 700; fill: var(--g-ink); }
  .cg-here .cg-name { paint-order: stroke; stroke: var(--g-ink); stroke-width: 12px; stroke-linejoin: round; fill: var(--g-bg); }
  a .cg-go { cursor: pointer; }
  a:hover .cg-go .cg-name { text-decoration: underline; }
`
