/* About me as family trees, drawn like the Star's genealogy in "The Xerox
   Star: A Retrospective" (1989): plain labels, curved arrows that meet,
   double lines for a direct line of descent, and time running down the right.
   Two graphs: ideas (technologies and their interfaces) and life (where I
   lived, school, work, research, projects). Used by /about-graph, the GUI's
   About me window and the terminal's cat about-me. */

type N = { x: number; y: number; t: string; sub?: string; hot?: boolean }
/* Five trees side by side, all on one clock: where I lived, school, work
   (from the résumé), research, and projects. Rows are years; they meet at
   AI's GUI and the next interface revolution. */
const Y: Record<string, number> = { pre: 95, 2020: 150, early: 215, 2023: 275, 2024: 345, 2025: 415, 2026: 490, '2026b': 535, 2027: 620, later: 715 }
const LIFE_YEARS: [string, number][] = [['2020', Y[2020]], ['2023', Y[2023]], ['2024', Y[2024]], ['2025', Y[2025]], ['2026', Y[2026]], ['2027', Y[2027]]]
const LIFE_HEADS: [string, number][] = [['Life', 70], ['School', 235], ['Work', 410], ['Research', 580], ['Projects', 790]]
const LIFE: Record<string, N> = {
  // life
  istanbul: { x: 70,  y: Y.pre,  t: 'Istanbul' },
  stanford: { x: 70,  y: Y[2020], t: 'Stanford' },
  nyc:      { x: 70,  y: Y[2025], t: 'New York' },
  // school
  bs:       { x: 235, y: Y[2020], t: 'B.S. Symbolic Systems' },
  ms:       { x: 235, y: Y[2023], t: 'M.S. CS', sub: '(HCI)' },
  phd:      { x: 235, y: Y[2027], t: 'Ph.D. CS', sub: '(HCI, with Landay)' },
  // work
  brewbird: { x: 410, y: Y[2023], t: 'BrewBird', sub: '(product strategy)' },
  apm:      { x: 410, y: Y[2024], t: 'Coinbase', sub: '(APM intern)' },
  pm:       { x: 410, y: Y[2025], t: 'Coinbase', sub: '(product manager, AI Platform)' },
  // research
  kuo:      { x: 580, y: Y.early, t: 'Kuo Lab', sub: '(ovarian cancer organoids)' },
  landay:   { x: 580, y: Y[2024], t: 'Stanford HCI Group', sub: '(Landay Lab)' },
  bloom:    { x: 580, y: Y[2025], t: 'Bloom' },
  chi:      { x: 580, y: Y[2026], t: 'CHI 2026', sub: '(Best Paper)' },
  // projects
  dish:     { x: 790, y: Y[2024], t: 'Dishcovery' },
  let:      { x: 720, y: Y[2026], t: 'Learning Et Al.' },
  drift:    { x: 855, y: Y[2026], t: 'Catching My Drift' },
  sponge:   { x: 720, y: Y['2026b'] + 15, t: 'Sponge OS' },
  kilim:    { x: 855, y: Y['2026b'] + 15, t: 'Kilim' },
  // where it all goes
  aigui:    { x: 600, y: Y[2027], t: 'AI\u2019s GUI', sub: '(not found yet)', hot: true },
  next:     { x: 420, y: Y.later, t: 'the next interface revolution', hot: true },
}
// [from, to, double line = direct descent, bend]
const LIFE_EDGES: [string, string, boolean?, number?][] = [
  ['istanbul', 'stanford', true], ['stanford', 'nyc', true],
  ['stanford', 'bs'], ['bs', 'ms', true], ['ms', 'phd', true],
  ['brewbird', 'apm'], ['apm', 'pm', true], ['pm', 'nyc'],
  ['bs', 'kuo'], ['kuo', 'landay'], ['landay', 'bloom', true], ['bloom', 'chi', true],
  ['ms', 'dish', false, 60],
  ['bloom', 'aigui', false, 40], ['pm', 'aigui', false, 30], ['let', 'aigui'], ['drift', 'aigui', false, -20],
  ['aigui', 'next', true], ['phd', 'next'],
]

/* Ideas: each new technology on the left, the interface it got on the
   right, time running down. The interfaces descend from each other (double
   lines); HCI feeds the ones it gave us. It ends at LLMs and chat, and at
   the interface LLMs haven't got yet. */
const IDEA_HEADS: [string, number][] = [['Technology', 210], ['Interface', 560], ['', 840]]
const IY = { a: 95, b: 175, c: 255, d: 335, e: 415, f: 495, g: 590, h: 690 }
const IDEA_YEARS: [string, number][] = [['1960s', IY.a], ['1968', IY.b], ['1973', IY.c], ['1984', IY.d], ['1993', IY.e], ['2007', IY.f], ['2022', IY.g]]
const IDEAS: Record<string, N> = {
  mainframe: { x: 210, y: IY.a, t: 'time-sharing computers' },
  cli:       { x: 560, y: IY.a, t: 'the command line' },
  sri:       { x: 210, y: IY.b, t: 'Engelbart\u2019s lab', sub: '(SRI)' },
  mouse:     { x: 560, y: IY.b, t: 'the mouse' },
  alto:      { x: 210, y: IY.c, t: 'bitmap displays', sub: '(the Alto, Xerox PARC)' },
  gui:       { x: 560, y: IY.c, t: 'the GUI', sub: '(windows, icons, the desktop)' },
  pc:        { x: 210, y: IY.d, t: 'personal computers', sub: '(the Macintosh)' },
  desktop:   { x: 560, y: IY.d, t: 'the GUI, for everyone' },
  web:       { x: 210, y: IY.e, t: 'the internet' },
  browser:   { x: 560, y: IY.e, t: 'the web browser', sub: '(links, pages)' },
  phone:     { x: 210, y: IY.f, t: 'smartphones' },
  touch:     { x: 560, y: IY.f, t: 'the touchscreen', sub: '(multitouch)' },
  llm:       { x: 210, y: IY.g, t: 'LLMs', hot: true },
  chat:      { x: 560, y: IY.g, t: 'chat', sub: '(still useful)' },
  hci:       { x: 840, y: IY.c, t: 'HCI' },
  chatty:    { x: 840, y: IY.g, t: 'the chattification', sub: 'of every interface' },
  aigui:     { x: 560, y: IY.h, t: 'AI\u2019s GUI', sub: '(not found yet)', hot: true },
}
const IDEA_EDGES: [string, string, boolean?, number?][] = [
  ['mainframe', 'cli'], ['sri', 'mouse'], ['alto', 'gui'], ['pc', 'desktop'], ['web', 'browser'], ['phone', 'touch'], ['llm', 'chat'],
  ['cli', 'gui', true, 150], ['mouse', 'gui', true], ['gui', 'desktop', true], ['desktop', 'browser', true], ['browser', 'touch', true], ['touch', 'chat', true],
  ['hci', 'mouse'], ['hci', 'gui'], ['hci', 'touch', false, -40],
  ['chat', 'chatty'], ['chat', 'aigui', true], ['llm', 'aigui', false, 40],
]

// a label's box: centre and half sizes, near enough to aim arrows at
const box = (n: N) => ({
  cx: n.x, cy: n.sub ? n.y + 3 : n.y - 5,
  hw: Math.max(n.t.length, (n.sub ?? '').length * 0.8) * 4.6 + 6,
  hh: n.sub ? 21 : 11,
})
// where a line from a label's centre toward (tx, ty) leaves its box
function exit(n: N, tx: number, ty: number, pad = 4) {
  const b = box(n)
  const dx = tx - b.cx, dy = ty - b.cy
  const k = 1 / Math.max(Math.abs(dx) / (b.hw + pad), Math.abs(dy) / (b.hh + pad), 1e-6)
  return [b.cx + dx * k, b.cy + dy * k]
}
/* Lines run straight from label to label, the way the genealogy draws them;
   a bend (in px, sideways) arcs one gently around whatever is in the way. */
function edge(a: N, b: N, bend = 0) {
  const A = box(a), B = box(b)
  const mx = (A.cx + B.cx) / 2, my = (A.cy + B.cy) / 2
  const len = Math.hypot(B.cx - A.cx, B.cy - A.cy) || 1
  const cx = mx - ((B.cy - A.cy) / len) * bend, cy = my + ((B.cx - A.cx) / len) * bend
  const [x1, y1] = exit(a, bend ? cx : B.cx, bend ? cy : B.cy)
  const [x2, y2] = exit(b, bend ? cx : A.cx, bend ? cy : A.cy, 7)
  return bend ? `M${x1},${y1} Q${cx},${cy} ${x2},${y2}` : `M${x1},${y1} L${x2},${y2}`
}

export function Graph({ nodes, edges, heads, years, label, w = 1060, h = 780 }: {
  nodes: Record<string, N>; edges: [string, string, boolean?, number?][]; heads: [string, number][]; years: [string, number][]; label: string; w?: number; h?: number
}) {
  // time runs down the right edge, the years just beside it
  const tx = w - 85, mid = h / 2
  return (
    <svg className="g-svg" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>
      <defs>
        <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="11" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="g-head" />
        </marker>
      </defs>
      {edges.map(([f, t, dbl, bend]) => {
        const d = edge(nodes[f], nodes[t], bend)
        return dbl
          ? <g key={f + t}><path d={d} className="g-dbl-out" /><path d={d} className="g-dbl-in" /><path d={d} className="g-end" markerEnd="url(#ah)" /></g>
          : <path key={f + t} d={d} className="g-line" markerEnd="url(#ah)" />
      })}
      {heads.map(([h, x]) => h && <text key={h} x={x} y={38} textAnchor="middle" className="g-head-label">{h}</text>)}
      {years.map(([yr, y]) => <text key={yr} x={tx + 20} y={y} className="g-year">{yr}</text>)}
      {Object.entries(nodes).map(([k, n]) => (
        <g key={k} className={n.hot ? 'g-node hot' : 'g-node'}>
          <text x={n.x} y={n.y} textAnchor="middle">{n.t}</text>
          {n.sub && <text x={n.x} y={n.y + 17} textAnchor="middle" className="g-sub">{n.sub}</text>}
        </g>
      ))}
      {/* time, running down the right edge */}
      <g className="g-time">
        <path d={`M${tx},20 V${h - 20}`} className="g-dbl-out" /><path d={`M${tx},20 V${h - 20}`} className="g-dbl-in" />
        <path d={`M${tx - 10},${h - 35} L${tx},${h - 15} L${tx + 10},${h - 35}`} className="g-tip" />
        <text x={tx} y={mid} textAnchor="middle" transform={`rotate(90 ${tx} ${mid})`} className="g-time-label">Time</text>
      </g>
    </svg>
  )
}


/* The short version, for About me: three trees (life, research, work) and
   the projects, all meeting at AI's GUI. */
const SY = { pre: 70, 2020: 125, early: 185, 2024: 250, 2025: 315, 2026: 380, end: 455 }
const SHORT_YEARS: [string, number][] = [['2020', SY[2020]], ['2024', SY[2024]], ['2025', SY[2025]], ['2026', SY[2026]]]
const SHORT_HEADS: [string, number][] = [['Life', 80], ['Research', 260], ['Work', 430], ['Projects', 600]]
const SHORT: Record<string, N> = {
  istanbul: { x: 80, y: SY.pre, t: 'Istanbul' },
  stanford: { x: 80, y: SY[2020], t: 'Stanford', sub: '(B.S., M.S.)' },
  nyc: { x: 80, y: SY[2025], t: 'New York' },
  kuo: { x: 260, y: SY.early, t: 'Kuo Lab', sub: '(cancer research)' },
  landay: { x: 260, y: SY[2024], t: 'Landay Lab', sub: '(Stanford HCI)' },
  bloom: { x: 260, y: SY[2025], t: 'Bloom' },
  chi: { x: 260, y: SY[2026], t: 'CHI 2026', sub: '(Best Paper)' },
  apm: { x: 430, y: SY[2024], t: 'Coinbase', sub: '(APM intern)' },
  pm: { x: 430, y: SY[2025], t: 'Coinbase', sub: '(AI Platform)' },
  dish: { x: 600, y: SY[2024], t: 'Dishcovery' },
  let: { x: 600, y: SY[2026] - 14, t: 'Learning Et Al.' },
  drift: { x: 600, y: SY[2026] + 18, t: 'Catching My Drift' },
  aigui: { x: 400, y: SY.end, t: 'AI\u2019s GUI', sub: '(not found yet)', hot: true },
}
const SHORT_EDGES: [string, string, boolean?, number?][] = [
  ['istanbul', 'stanford', true], ['stanford', 'nyc', true], ['stanford', 'kuo'], ['kuo', 'landay', true],
  ['landay', 'bloom', true], ['bloom', 'chi', true], ['apm', 'pm', true],
  ['chi', 'aigui'], ['pm', 'aigui'], ['drift', 'aigui'],
]

export type GraphView = 'ideas' | 'life' | 'short'
export function AboutGraph({ view }: { view: GraphView }) {
  if (view === 'short') return <Graph nodes={SHORT} edges={SHORT_EDGES} heads={SHORT_HEADS} years={SHORT_YEARS} w={780} h={510} label="Defne's life, research, work and projects as family trees over time, meeting at AI's GUI" />
  return view === 'ideas'
    ? <Graph nodes={IDEAS} edges={IDEA_EDGES} heads={IDEA_HEADS} years={IDEA_YEARS} label="New technologies and the interfaces they got, from the command line to the GUI, the web, the touchscreen and chat, leading to AI's GUI, not found yet" />
    : <Graph nodes={LIFE} edges={LIFE_EDGES} heads={LIFE_HEADS} years={LIFE_YEARS} label="Defne's life, school, work, research and projects as family trees over time, meeting at AI's GUI and the next interface revolution" />
}

/* the graphs' look; the wrapper sets --g-bg, --g-ink and --g-accent */
export const GRAPH_CSS = `
  .g-svg { width: 100%; height: auto; overflow: visible; display: block; }
  .g-line { fill: none; stroke: var(--g-ink); stroke-width: 1.3; }
  .g-head { fill: var(--g-ink); }
  .g-dbl-out { fill: none; stroke: var(--g-ink); stroke-width: 5; }
  .g-dbl-in { fill: none; stroke: var(--g-bg); stroke-width: 2.2; }
  .g-end { fill: none; stroke: none; }
  .g-node text { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 17px; fill: var(--g-ink); paint-order: stroke; stroke: var(--g-bg); stroke-width: 6px; }
  .g-node .g-sub { font-size: 13.5px; }
  .g-node.hot text { fill: var(--g-accent); font-weight: 600; }
  .g-head-label { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 700; fill: var(--g-ink); letter-spacing: 0.06em; text-transform: uppercase; }
  .g-year { font-family: var(--font-mono), ui-monospace, monospace; font-size: 13px; fill: var(--g-ink); dominant-baseline: middle; }
  .g-time .g-tip { fill: none; stroke: var(--g-ink); stroke-width: 2; }
  .g-time-label { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 700; fill: var(--g-ink); paint-order: stroke; stroke: var(--g-bg); stroke-width: 8px; }
`
