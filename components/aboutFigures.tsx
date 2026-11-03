/* Figures for About me, drawn like the illustrations in Xerox's Star
   materials: plain outlined shapes, dot-pattern fills, labels in Helvetica.
   The wrapper sets --g-bg, --g-ink and --g-accent. Dates are from the résumé. */

/* The axis stops at 2027. Anything still going runs to the edge and fades
   out, so the figure doesn't say when it ends. */
const X0 = 2018, X1 = 2028.3
const x = (yr: number) => 70 + ((yr - X0) / (X1 - X0)) * 660
const NOW = 2026.84

type Bar = { from: number; to: number; t: string; open?: boolean; planned?: boolean; lane?: number; label?: 'left' }
const PLACES: Bar[] = [
  { from: X0, to: 2020.7, t: 'Istanbul' },
  { from: 2020.7, to: 2025.6, t: 'Stanford' },
  { from: 2025.6, to: X1, t: 'New York', open: true },
]
// B.S. and the Ph.D. share a lane (they don't meet); the M.S. sits below, where it overlaps the B.S.
const SCHOOL: Bar[] = [
  { from: 2020.7, to: 2024.5, t: 'B.S. Symbolic Systems', lane: 0 },
  { from: 2023.7, to: 2025.5, t: 'M.S. CS (HCI)', lane: 1 },
  { from: 2027.7, to: X1, t: 'CS Ph.D.', planned: true, open: true, lane: 0 },
]
const WORK: Bar[] = [
  { from: 2023.42, to: 2024.42, t: 'BrewBird', lane: 0 },
  { from: 2025.6, to: X1, t: 'Coinbase, PM', lane: 0, open: true },
  { from: 2024.42, to: 2024.67, t: 'Coinbase, intern', lane: 1, label: 'left' },
  { from: 2024.67, to: X1, t: 'Graduate researcher, Stanford HCI', lane: 2, open: true },
  { from: 2024.67, to: X1, t: 'Teaching, Stanford CS', lane: 3, open: true },
]

/* Where I lived along the top, then school and work on their own lanes, so
   overlaps show where they happened. */
export function Timeline() {
  const ROW = 38, H = 28
  const bar = (b: Bar, y: number, fill: string, key: string) => {
    const x1 = x(b.from), x2 = x(b.to), w = x2 - x1
    const fade = b.open ? `url(#tl-fade-${key})` : undefined
    return (
      <g key={key}>
        {b.open && <defs><linearGradient id={`tl-fade-${key}`} x1={x1} x2={x2} y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset={Math.max(0, 1 - 80 / w)} stopColor="white" /><stop offset="1" stopColor="black" />
        </linearGradient><mask id={`m-${key}`}><rect x={x1 - 2} y={y - 2} width={w + 4} height={H + 4} fill={fade} /></mask></defs>}
        <g mask={b.open ? `url(#m-${key})` : undefined}>
          <rect x={x1} y={y} width={w} height={H} fill={fill} stroke="var(--g-ink)" strokeWidth="1.5"
            strokeDasharray={b.planned ? '4 3' : undefined} />
        </g>
        {b.label === 'left'
          ? <text x={x1 - 8} y={y + H / 2} textAnchor="end" className="tl-label" dominantBaseline="middle">{b.t}</text>
          : <>
              {fill !== 'var(--g-bg)' && <rect x={x1 + 4} y={y + 5} width={b.t.length * 7.2 + 8} height={H - 10} fill="var(--g-bg)" />}
              <text x={x1 + 8} y={y + H / 2} className="tl-label" dominantBaseline="middle">{b.t}</text>
            </>}
      </g>
    )
  }
  const placesY = 36, schoolY = 112, workY = schoolY + 2 * ROW + 40
  const axisY = workY + 4 * ROW + 18
  const years = Array.from({ length: 10 }, (_, i) => X0 + i)
  return (
    <svg className="tl-svg" viewBox={`0 0 760 ${axisY + 28}`} role="img" aria-label="Timeline: Istanbul until 2020, Stanford 2020 to 2025, New York since 2025. B.S. 2020 to 2024 and M.S. 2023 to 2025, overlapping, then a CS Ph.D. from 2027. Work: BrewBird 2023 to 2024, Coinbase intern in 2024, graduate researcher at Stanford HCI and teaching at Stanford CS since 2024, Coinbase product manager since 2025.">
      <defs>
        <pattern id="tl-dots" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="1.3" height="1.3" fill="var(--g-ink)" /></pattern>
      </defs>
      <text x="70" y={placesY - 10} className="tl-head">WHERE I LIVED</text>
      {PLACES.map((b, i) => bar(b, placesY, 'var(--g-bg)', 'p' + i))}
      <text x="70" y={schoolY - 10} className="tl-head">SCHOOL</text>
      {SCHOOL.map((b, i) => bar(b, schoolY + (b.lane ?? 0) * ROW, b.planned ? 'var(--g-bg)' : 'url(#tl-dots)', 's' + i))}
      <text x="70" y={workY - 10} className="tl-head">WORK</text>
      {WORK.map((b, i) => bar(b, workY + (b.lane ?? 0) * ROW, 'url(#tl-dots)', 'w' + i))}
      {/* today */}
      <line x1={x(NOW)} x2={x(NOW)} y1={placesY - 6} y2={axisY - 18} stroke="var(--g-accent)" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x={x(NOW)} y={axisY - 6} textAnchor="middle" className="tl-now">now</text>
      {/* the years, stopping at 2027 */}
      <line x1={x(X0)} x2={x(2027.4)} y1={axisY} y2={axisY} stroke="var(--g-ink)" strokeWidth="1.5" />
      {years.map(y => <g key={y}>
        <line x1={x(y)} x2={x(y)} y1={axisY - 4} y2={axisY + 4} stroke="var(--g-ink)" strokeWidth="1.2" />
        <text x={x(y)} y={axisY + 20} textAnchor="middle" className="tl-year">{y}</text>
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
