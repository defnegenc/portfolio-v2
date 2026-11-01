'use client'

/* One pixel icon per hour and per sky condition, shared by the
   weather picker and the matrix so the two never drift apart. */

import { createContext, useContext } from 'react'
import type { Period, Sky } from '@/components/ambient'

/* Pixel icons drawn as square cells, the same unit the field is drawn in, so
   the picker reads as part of the canvas rather than an icon set. Each "#" is
   one cell; whole pixels per cell keep every edge crisp. */
const px = (rows: string[]) => {
  let d = ''
  rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === '#') d += `M${x} ${y}h1v1h-1Z` }))
  const n = rows.length
  const Icon = ({ size = n * 2 }: { size?: number }) => (
    <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges" aria-hidden>
      <path d={d} fill="currentColor" />
    </svg>
  )
  return Icon
}

/* The fine set: one-pixel lines on a 15×15 grid, drawn at 1px or 2px a
   cell. Lighter than the 9×9 blocks, so they sit quietly beside type. */
const Sun = px([
  '.......#.......',
  '.......#.......',
  '..#.........#..',
  '...#.......#...',
  '.....#####.....',
  '....#.....#....',
  '....#.....#....',
  '##..#.....#..##',
  '....#.....#....',
  '....#.....#....',
  '.....#####.....',
  '...#.......#...',
  '..#.........#..',
  '.......#.......',
  '.......#.......',
])
const CLOUD_TOP = [
  '......###......',
  '.....#...#.....',
  '...###....#....',
  '..#........##..',
  '..#..........#.',
  '.#...........#.',
  '..###########..',
]
const CloudIcon = px([
  '...............',
  '...............',
  '...............',
  '...............',
  ...CLOUD_TOP,
  '...............',
  '...............',
  '...............',
  '...............',
])
const Rain = px([
  ...CLOUD_TOP,
  '...............',
  '...#...#...#...',
  '..#...#...#....',
  '...............',
  '.#...#...#.....',
  '#...#...#......',
  '...............',
  '...............',
])
const Snow = px([
  ...CLOUD_TOP,
  '...............',
  '...#...#...#...',
  '...............',
  '.....#...#.....',
  '...............',
  '...#...#...#...',
  '...............',
  '...............',
])
const Fog = px([
  '...............',
  '...............',
  '...............',
  '.###########...',
  '...............',
  '...###########.',
  '...............',
  '.###########...',
  '...............',
  '.....#######...',
  '...............',
  '...............',
  '...............',
  '...............',
  '...............',
])
const Storm = px([
  ...CLOUD_TOP,
  '...............',
  '.......##......',
  '......##.......',
  '.....####......',
  '.......##......',
  '......##.......',
  '......#........',
  '...............',
])
const Wind = px([
  '...............',
  '...............',
  '...............',
  '..........##...',
  '............#..',
  '............#..',
  '.###########...',
  '...............',
  '...............',
  '.#########.....',
  '..........#....',
  '..........#....',
  '........##.....',
  '...............',
  '...............',
])
const Moon = px([
  '......###......',
  '....##.#.......',
  '...#..#........',
  '..#...#........',
  '..#...#........',
  '.#....#........',
  '.#.....#.......',
  '.#......#......',
  '.#.......##....',
  '..#........###.',
  '..#.........#..',
  '...#.......#...',
  '....##...##....',
  '......###......',
  '...............',
])
const Sunrise = px([
  '.........',
  '....#....',
  '.#.....#.',
  '...###...',
  '..#####..',
  '.#######.',
  '.........',
  '#########',
  '.........',
])
const Sunset = px([
  '.........',
  '.........',
  '.........',
  '.#.....#.',
  '...###...',
  '..#####..',
  '.#######.',
  '#########',
  '.........',
])
type PxIcon = (p: { size?: number }) => React.ReactElement

/* The classic set: little colour icons with an outline and a lit side, the way
   desktop icons looked in the nineties. 'k' is the outline (it follows the
   ink, so it holds in dark mode); the rest are fixed colours. Two screen
   pixels a cell. Picked with the icons option while we compare. */
const PALETTE: Record<string, string> = {
  k: 'currentColor', w: '#ffffff', g: '#cdd3df', s: '#8d96ab', y: '#ffd23f', o: '#f2992e', b: '#3d7be0', c: '#8fd0ff',
}
const cpx = (rows: string[]) => {
  const rects: React.ReactElement[] = []
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch !== '.') rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={PALETTE[ch]} />)
  }))
  const n = rows.length
  const Icon = () => (
    <svg width={n * 2} height={n * 2} viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges" aria-hidden>{rects}</svg>
  )
  return Icon
}
const CLASSIC_CLOUD = [
  '.....kkk.....',
  '....kwwwk....',
  '..kkwwwwwkk..',
  '.kwwwwwwwwwk.',
  'kwwwwwwwwwggk',
  'kwwwwwwwwgggk',
  '.kgggggggggk.',
  '..kkkkkkkkk..',
]
const CLASSIC: Record<Sky, () => React.ReactElement> = {
  clear: cpx([
    '......k......',
    '..k...k...k..',
    '...k.....k...',
    '.....kkk.....',
    '....kyyyk....',
    '...kywyyok...',
    'kk.kyyyyok.kk',
    '...kyyyook...',
    '....koook....',
    '.....kkk.....',
    '...k.....k...',
    '..k...k...k..',
    '......k......',
  ]),
  cloud: cpx(['.............', '.............', '.............', ...CLASSIC_CLOUD, '.............', '.............']),
  rain: cpx([...CLASSIC_CLOUD, '.............', '..b...b...b..', '.b...b...b...', '.............', 'b...b...b....']),
  snow: cpx([...CLASSIC_CLOUD, '.............', '..c...c...c..', '.............', '....c...c....', '..c...c...c..']),
  fog: cpx([
    '.............', '.............', '.............',
    '.ggggggggg...', '.............', '...sssssssss.', '.............',
    '.ggggggggg...', '.............', '...sssssss...', '.............', '.............', '.............',
  ]),
  storm: cpx([
    '.....kkk.....',
    '....kgggk....',
    '..kkgggggkk..',
    '.kgggggggggk.',
    'kgggggggggssk',
    'kggggggggsssk',
    '.ksssssssssk.',
    '..kkkkyykkk..',
    '.....yy......',
    '....yyyy.....',
    '......yy.....',
    '.....yy......',
    '.....y.......',
  ]),
  wind: cpx([
    '.............', '.............',
    '........ccc..', '...........c.', 'cccccccccccc.',
    '.............', '.............',
    'ssssssss.....', '........s....', '......ss.....',
    '.............', 'ccccc........', '.............',
  ]),
}
export const IconStyleCtx = createContext<'line' | 'classic'>('line')
export const CLASSIC_ICON = CLASSIC
const LINE: Record<Sky, PxIcon> = { clear: Sun, cloud: CloudIcon, rain: Rain, snow: Snow, fog: Fog, storm: Storm, wind: Wind }
const skyIcon = (sky: Sky): PxIcon => function SkyIcon({ size }) {
  const style = useContext(IconStyleCtx)
  if (style === 'classic') { const C = CLASSIC[sky]; return <C /> }
  const L = LINE[sky]
  return <L size={size} />
}

const HOUR_ICON: Record<Period, PxIcon> = {
  dawn: Sunrise, day: Sun, dusk: Sunset, night: Moon, late: Moon,
}
const SKY_ICON: Record<Sky, PxIcon> = {
  clear: skyIcon('clear'), cloud: skyIcon('cloud'), rain: skyIcon('rain'), snow: skyIcon('snow'),
  fog: skyIcon('fog'), storm: skyIcon('storm'), wind: skyIcon('wind'),
}


export { HOUR_ICON, SKY_ICON }
