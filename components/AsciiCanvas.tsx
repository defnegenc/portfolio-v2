'use client'

import { useEffect, useRef } from 'react'

export type Render = 'glyphs' | 'tiles' | 'cipher' | 'letters'
export type Motion = 'breathe' | 'trickle' | 'geometric' | 'lightning' | 'brush'
export type Hover  = 'mono' | 'rainbow'

/** Imperative hooks for driving the field from outside (pixel coords). Only the
 *  cursor-driven motions read the field, so pair this with e.g. motion="brush". */
export type CanvasApi = {
  glow: (x: number, y: number, w: number, h: number, int: number) => void
  line: (x0: number, y0: number, x1: number, y1: number, int: number) => void
}

interface Props {
  chars?: string
  trailMode?: boolean
  breathe?: boolean
  lightMode?: boolean
  /** Hex tint for the glyphs/tiles. Defaults to the theme ink. */
  color?: string
  /** glyphs: unicode chars. tiles: soft grainy squares. cipher: numbers and symbols that scramble
   *  constantly. letters: a hidden message that reads where it's lit. */
  render?: Render
  /** breathe: slow noise field. trickle: rain running down from the cursor.
   *  geometric: threads tied between the points the cursor passes. lightning: bolts strike out from the cursor.
   *  brush: an inked bristle stroke that follows the cursor. */
  motion?: Motion
  /** Cursor glow: same colour family, or hue-cycling. Glyphs are always mono. */
  hover?: Hover
  /** Text laid across the grid for the letters render (wrapped at word boundaries, repeated to fill). */
  message?: string
  /** How bright the field sits when the cursor has never touched it, 0..1. The
   *  cursor motions only light what you draw on, so a small band needs a higher
   *  floor than a full-screen one or it reads as empty. */
  rest?: number
  apiRef?: React.MutableRefObject<CanvasApi | null>
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h / 6, s, l]
}
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 1) + 1) % 1
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q
  const f = (t: number) => { t = ((t % 1) + 1) % 1; return t < 1/6 ? p + (q - p) * 6 * t : t < 1/2 ? q : t < 2/3 ? p + (q - p) * (2/3 - t) * 6 : p }
  return [Math.round(f(h + 1/3) * 255), Math.round(f(h) * 255), Math.round(f(h - 1/3) * 255)]
}
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

type Drop = { x: number; y: number; vx: number; vy: number; int: number; hot: number; ph: number; life: number }

export default function AsciiCanvas({ chars: charsStr, trailMode = false, breathe: breatheProp = false, lightMode = false, color, render = 'glyphs', motion = 'breathe', hover = 'mono', message, rest: restLevel = 0.05, apiRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cipher = render === 'cipher'
    const letters = render === 'letters'
    const glyphs = render === 'glyphs' || cipher || letters
    const tiles = !glyphs
    const MESSAGE = (message || 'Defne Genç. Stanford CS, human-AI interaction.').replace(/\s+/g, ' ').trim()
    const breathe = breatheProp
    const water = motion !== 'breathe'   // every cursor-driven motion renders from the field
    const web = motion === 'geometric'
    const brush = motion === 'brush'
    const lightning = motion === 'lightning'
    let strikeAcc = 0
    let flash = 0
    // Rainbow everywhere except the original glyph breathe, which stays as it was
    const rainbow = hover === 'rainbow' && !(render === 'glyphs' && motion === 'breathe')
    // "soft" = the breathe/water family (vs. the legacy trail/default looks)
    const soft = breathe || water

    const chars = cipher
      ? '0123456789/&*.#$%+=<>'.split('')
      : letters
      ? Array.from(new Set(MESSAGE.split('')))
      : charsStr
      ? charsStr.split('')
      : (trailMode || soft)
        ? '·:|¦I'.split('')
        : ' .:-=+*#%@'.split('')

    // Color scheme based on mode
    const bgR = lightMode ? 244 : 10
    const bgG = lightMode ? 242 : 10
    const bgB = lightMode ? 236 : 10
    // Primary char color (light mode: dark ink; dark mode: off-white), or a tint.
    /* On black, a pastel swatch pops on its own. On cream it does not: both are
       light, so the tiles vanish. Light mode therefore pushes saturation hard
       and holds lightness in a mid band, which makes the hue read as vivid
       colour against the paper rather than as a paler shade of it. */
    const rawTint = color ? hexToRgb(color) : null
    const tint = rawTint && lightMode
      ? (() => {
          const [h, sa, l] = rgbToHsl(...rawTint)
          return hslToRgb(h, Math.min(1, sa * 1.5), Math.max(0.42, Math.min(l, 0.56)))
        })()
      : rawTint
    const chR = tint ? tint[0] : lightMode ? 26  : 232
    const chG = tint ? tint[1] : lightMode ? 25  : 230
    const chB = tint ? tint[2] : lightMode ? 24  : 224
    const [hue, satBase, litBase] = rgbToHsl(chR, chG, chB)

    // Tone palette: 0 = base, 1 = mono highlight (same family, brighter and a
    // touch more saturated), 2.. = HUE_TONES hue-rotated tones for rainbow hover.
    const HUE_TONES = 10
    const mono: [number, number, number] = tint
      ? hslToRgb(hue, Math.min(1, satBase * 1.15), lightMode ? litBase * 0.5 : litBase + (1 - litBase) * 0.55)
      : lightMode ? [0, 0, 0] : [255, 255, 255]
    const tones: [number, number, number][] = [[chR, chG, chB], mono]
    if (rainbow) {
      const sat = Math.max(0.65, satBase)
      const lit = lightMode ? Math.min(litBase, 0.45) : Math.max(litBase, 0.7)
      for (let i = 0; i < HUE_TONES; i++) tones.push(hslToRgb(hue + (i / HUE_TONES) * 0.6 - 0.3, sat, lit))
    }

    // Variants per render: tiles are pre-rendered at TILE_VARIANTS sizes. Four
    // steps made the breathe visibly stair-step, so the ramp is much finer now.
    const TILE_VARIANTS = 12
    const nVariants = tiles ? TILE_VARIANTS : chars.length
    let grain = new Float32Array(0)
    let cidx  = new Uint8Array(0)   // cipher: current char per cell; letters: fixed char per cell

    // Water: drops deposit into an intensity field that decays into trails.
    // `hot` marks cells lit by cursor-born drops so they take the highlight tone.
    let field = new Float32Array(0)
    let hotf  = new Float32Array(0)
    let drops: Drop[] = []
    let streamAcc = 0

    // Web: anchor points dropped along the cursor's path, silk threads between neighbours
    type Node = { x: number; y: number }
    type Thread = { a: number; b: number; born: number; ph: number }
    let nodes: Node[] = []
    let threads: Thread[] = []
    const lastNode = { x: -1e9, y: -1e9 }
    const mouseCell = { c: -1, r: -1 }

    // Brush: previous cursor position in cell space
    const prev = { x: -1, y: -1 }

    /* Cursor pool radii are in pixels, which on a phone covers most of a short
       band and hides the shape of the effect. Scale them with the canvas. */
    let reach = 1
    let width: number, height: number, rows: number, cols: number
    let cellW: number, cellH: number
    let time = 0
    let last = performance.now()
    const mouse = { x: -1000, y: -1000 }
    let animId: number

    // Glyph atlas: every variant pre-rendered at LEVELS opacities per tone, so
    // the hot loop is drawImage, not fillText.
    /* Atlas budget. Safari on iOS refuses canvases past a few thousand pixels a
       side and charges the full backing store against the tab's memory, so this
       has to stay small: stacking tones down the Y axis at devicePixelRatio 3
       produced a 16,000px-tall surface and killed the tab.

       Tones now run along X beside the variants, and both axes are clamped by
       dropping the opacity resolution and then the pixel ratio until they fit. */
    const MAX_SIDE = 4096
    let LEVELS = 48
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    const atlas = document.createElement('canvas')
    let spriteW = 0, spriteH = 0

    function fitAtlas() {
      LEVELS = 48
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      for (;;) {
        const w = Math.ceil(cellW * dpr) * nVariants * tones.length
        const h = Math.ceil(cellH * dpr) * LEVELS
        if (w <= MAX_SIDE && h <= MAX_SIDE) return
        if (LEVELS > 12) LEVELS = Math.floor(LEVELS / 2)
        else if (dpr > 1) dpr = 1
        else return          // nothing left to give; the clamp below caps it
      }
    }

    function buildAtlas() {
      fitAtlas()
      spriteW = Math.ceil(cellW * dpr)
      spriteH = Math.ceil(cellH * dpr)
      atlas.width = Math.min(MAX_SIDE, spriteW * nVariants * tones.length)
      atlas.height = Math.min(MAX_SIDE, spriteH * LEVELS)
      const a = atlas.getContext('2d')!
      const fontSize = Math.max(8, cellH * ((trailMode || soft) ? 0.9 : 0.8)) * dpr
      a.font = `${fontSize}px "Fragment Mono", monospace`
      a.textAlign = 'center'
      a.textBaseline = 'middle'
      for (let tone = 0; tone < tones.length; tone++) {
        const [r, g, b] = tones[tone]
        const rgba = (al: number) => `rgba(${r}, ${g}, ${b}, ${al})`
        const [mr, mg, mb] = tones[1]
        for (let l = 0; l < LEVELS; l++) {
          const alpha = (l + 1) / LEVELS
          const y0 = l * spriteH
          for (let c = 0; c < nVariants; c++) {
            const x0 = (tone * nVariants + c) * spriteW
            if (tiles) {
              // Soft square: size grows with variant, 1px gutter keeps the grid visible
              a.fillStyle = rgba(alpha)
              const frac = 0.45 + 0.55 * (c / (TILE_VARIANTS - 1))
              const w = (spriteW - 2 * dpr) * frac, h = (spriteH - 2 * dpr) * frac
              a.fillRect(x0 + (spriteW - w) / 2, y0 + (spriteH - h) / 2, w, h)
            } else {
              a.fillStyle = rgba(alpha)
              a.fillText(chars[c], x0 + spriteW / 2, y0 + spriteH / 2)
            }
          }
        }
      }
    }

    function glyph(charIdx: number, opacity: number, tone: number, px: number, py: number) {
      const l = Math.min(LEVELS - 1, Math.max(0, Math.round(opacity * LEVELS) - 1))
      const sx = (tone * nVariants + charIdx) * spriteW
      ctx!.drawImage(atlas, sx, l * spriteH, spriteW, spriteH, px - cellW / 2, py - cellH / 2, cellW, cellH)
    }

    function resize() {
      width = container!.offsetWidth
      height = container!.offsetHeight
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = width * ratio
      canvas!.height = height * ratio
      ctx!.scale(ratio, ratio)
      const targetCW = (cipher || letters) ? 8 : tiles ? 9 : trailMode ? 9 : 7
      cols = Math.round(width / targetCW)
      cellW = width / cols
      cellH = tiles ? cellW : cellW * ((trailMode || soft) ? 1.5 : 1.4)
      rows = Math.ceil(height / cellH)
      reach = Math.max(0.45, Math.min(1, Math.min(width, height * 1.6) / 760))
      const n = cols * rows
      grain = new Float32Array(n)
      cidx  = new Uint8Array(n)
      for (let i = 0; i < n; i++) {
        const c = i % cols, r = (i / cols) | 0
        const h = Math.sin(c * 12.9898 + r * 78.233) * 43758.5453
        const f = h - Math.floor(h)
        grain[i] = f - 0.5
        cidx[i]  = Math.floor(Math.random() * chars.length)
      }
      if (letters) {
        // Lay the message out like text: wrap at word boundaries, a 2-cell margin, a blank row
        // between repeats, and repeat until the grid is full. Spaces map to the ' ' glyph.
        const space = chars.indexOf(' ')
        cidx.fill(space)
        const words = MESSAGE.split(' ')
        const margin = 2, maxW = cols - margin * 2
        let r = 1, c = 0, wi = 0
        while (r < rows) {
          const w = words[wi % words.length]
          if (wi > 0 && wi % words.length === 0) { r += 2; c = 0; if (r >= rows) break }
          if (c + w.length > maxW) { r += 1; c = 0; if (r >= rows) break; continue }
          for (let k = 0; k < w.length; k++) { const idx = chars.indexOf(w[k]); if (idx >= 0) cidx[r * cols + margin + c + k] = idx }
          c += w.length + 1
          wi++
        }
      }
      field = new Float32Array(n)
      hotf  = new Float32Array(n)
      nodes = []; threads = []
      drops = []
      buildAtlas()
    }

    // ── Trickle ──────────────────────────────────────────────────────────
    function spawnTrickle(x: number, y: number, int: number, hot: number) {
      if (drops.length > 7000) return
      drops.push({ x, y, vx: 0, vy: 9 + Math.random() * 26, int, hot, ph: Math.random() * Math.PI * 2, life: Infinity })
    }

    function deposit(idx: number, int: number, hot: number) {
      if (int > field[idx]) field[idx] = int
      if (hot > hotf[idx]) hotf[idx] = hot
    }

    function stepDrops(dt: number) {
      const sec = dt / 60
      // The cursor is the only source; drops keep running after it moves on
      if (mouseCell.c >= 0) for (let k = 0; k < 2; k++) if (Math.random() < 0.7) {
        spawnTrickle(mouseCell.c + (Math.random() - 0.5) * 5, mouseCell.r + (Math.random() - 0.5) * 2, 0.75 + Math.random() * 0.25, 1)
      }
      const k = Math.pow(0.9, dt), kh = Math.pow(0.93, dt)
      for (let i = 0; i < field.length; i++) { field[i] *= k; hotf[i] *= kh }
      // Advance drops; crawl = speed pulses, tiny sideways drift; deposit along the path
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i]
        const crawl = 0.55 + 0.45 * Math.sin(time * 6 + d.ph)
        const y0 = d.y
        d.y += d.vy * crawl * sec
        if (Math.random() < 0.06) d.x += (Math.random() - 0.5) * 1.2
        const c = Math.round(d.x)
        if (c >= 0 && c < cols) {
          for (let r = Math.max(0, Math.ceil(y0)); r <= Math.min(rows - 1, Math.floor(d.y)); r++) deposit(r * cols + c, d.int, d.hot)
          const rh = Math.round(d.y)
          if (rh >= 0 && rh < rows) deposit(rh * cols + c, Math.min(1, d.int + 0.15), d.hot)
        }
        if (d.y >= rows || c < 0 || c >= cols) drops.splice(i, 1)
      }
    }

    // ── Web ──────────────────────────────────────────────────────────────
    function stepWeb() {
      // Drop an anchor every few cells of travel; tie it to its nearest neighbours
      if (mouseCell.c >= 0 && Math.hypot(mouseCell.c - lastNode.x, mouseCell.r - lastNode.y) > 6) {
        lastNode.x = mouseCell.c; lastNode.y = mouseCell.r
        const idx = nodes.push({ x: mouseCell.c, y: mouseCell.r }) - 1
        const near = nodes.slice(0, idx).map((n, j) => ({ j, d: Math.hypot(n.x - mouseCell.c, n.y - mouseCell.r) }))
          .filter(o => o.d < 45).sort((p, q) => p.d - q.d).slice(0, 3)
        if (idx > 0 && !near.some(o => o.j === idx - 1)) near.push({ j: idx - 1, d: 0 })
        for (const o of near) threads.push({ a: o.j, b: idx, born: time, ph: Math.random() * Math.PI * 2 })
        if (nodes.length > 260) {
          // retire the oldest anchor and everything tied to it
          nodes.shift(); lastNode.x -= 0
          threads = threads.filter(t => t.a !== 0 && t.b !== 0).map(t => ({ ...t, a: t.a - 1, b: t.b - 1 }))
        }
      }
      // Silk: redrawn every frame. Light surges along each thread on its own, the whole
      // web breathes slowly, and the cursor passing over it sends an extra pulse.
      for (let k = 0; k < threads.length; k++) {
        const t = threads[k]
        const A = nodes[t.a], B = nodes[t.b]
        drawSilk(A.x, A.y, B.x, B.y, t.born, t.ph)
      }
      // dew on the anchors
      for (const n of nodes) if (n.x >= 0 && n.x < cols && n.y >= 0 && n.y < rows) deposit(n.y * cols + n.x, 0.85, 0)
      threads = threads.filter(t => (time - t.born) / 0.009 / 60 < 55)
    }

    function drawSilk(ax: number, ay: number, bx: number, by: number, born: number, ph: number) {
      const age = (time - born) / 0.009 / 60          // seconds
      const strength = age > 40 ? Math.max(0, 1 - (age - 40) / 15) : 1
      if (strength <= 0) return
      const breatheP = 0.5 + 0.5 * Math.sin(time * 1.6 + ph)
      const steps = Math.max(1, Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(by - ay))))
      for (let s2 = 0; s2 <= steps; s2++) {
        const f = s2 / steps
        const c = Math.round(ax + (bx - ax) * f), r = Math.round(ay + (by - ay) * f)
        if (c < 0 || c >= cols || r < 0 || r >= rows) continue
        const surge = 0.5 + 0.5 * Math.sin(f * 9 - time * 6 + ph)
        const near = mouseCell.c >= 0 ? Math.max(0, 1 - Math.hypot(c - mouseCell.c, r - mouseCell.r) / 16) : 0
        deposit(r * cols + c, (0.22 + surge * 0.32 + breatheP * 0.14 + near * 0.45) * strength, 1)
      }
    }

    // ── Lightning ────────────────────────────────────────────────────────
    function bolt(x0: number, y0: number, x1: number, y1: number, int: number, depth: number) {
      // midpoint displacement; branches peel off at random midpoints
      const pts: [number, number][] = [[x0, y0], [x1, y1]]
      let disp = Math.hypot(x1 - x0, y1 - y0) * 0.22
      for (let it = 0; it < 5; it++) {
        for (let i = pts.length - 1; i > 0; i--) {
          const [ax, ay] = pts[i - 1], [bx, by] = pts[i]
          const mx = (ax + bx) / 2 + (Math.random() - 0.5) * disp
          const my = (ay + by) / 2 + (Math.random() - 0.5) * disp
          pts.splice(i, 0, [mx, my])
          if (depth < 2 && Math.random() < 0.08) {
            const a = Math.atan2(by - ay, bx - ax) + (Math.random() < 0.5 ? 0.7 : -0.7)
            const len = Math.hypot(x1 - x0, y1 - y0) * (0.2 + Math.random() * 0.3)
            bolt(mx, my, mx + Math.cos(a) * len, my + Math.sin(a) * len, int * 0.55, depth + 1)
          }
        }
        disp *= 0.5
      }
      for (let i = 1; i < pts.length; i++) {
        const [ax, ay] = pts[i - 1], [bx, by] = pts[i]
        const steps = Math.max(1, Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(by - ay))))
        for (let s2 = 0; s2 <= steps; s2++) {
          const c = Math.round(ax + (bx - ax) * s2 / steps), r = Math.round(ay + (by - ay) * s2 / steps)
          if (c >= 0 && c < cols && r >= 0 && r < rows) deposit(r * cols + c, int, 1)
        }
      }
    }

    function stepLightning(dt: number) {
      const sec = dt / 60
      const k = Math.pow(0.84, dt)
      for (let i = 0; i < field.length; i++) { field[i] *= k; hotf[i] *= k }
      flash *= k
      if (mouseCell.c < 0) return
      strikeAcc += sec
      // strikes come in irregular bursts; a fast-moving cursor draws more
      if (strikeAcc > 0.12 + Math.random() * 0.6) {
        strikeAcc = 0
        const n = 1 + (Math.random() < 0.3 ? 1 : 0)
        for (let k2 = 0; k2 < n; k2++) {
          // target: a point on the edge, biased downward
          const side = Math.random()
          const tx = side < 0.6 ? mouseCell.c + (Math.random() - 0.5) * cols * 0.8 : Math.random() < 0.5 ? -2 : cols + 2
          const ty = side < 0.6 ? rows + 2 : Math.random() * rows
          bolt(mouseCell.c, mouseCell.r, tx, ty, 1, 0)
        }
        flash = Math.min(0.35, flash + 0.18)
      }
    }

    // ── Brush ────────────────────────────────────────────────
    function stepBrush(dt: number) {
      const k = Math.pow(0.996, dt)
      for (let i = 0; i < field.length; i++) { field[i] *= k; hotf[i] *= k }
      if (mouseCell.c < 0) { prev.x = -1; return }
      const x = mouse.x / cellW, y = mouse.y / cellH
      if (prev.x < 0) { prev.x = x; prev.y = y; return }
      const ddx = x - prev.x, ddy = y - prev.y
      const len = Math.hypot(ddx, ddy)
      if (len < 0.01) return
      {
        // Slow = fat and wet, fast = thin and dry. Bristles are parallel lines with their own weight.
        const w = Math.max(1.5, 9 / (1 + len / 1.2))
        const nx = -ddy / len, ny = ddx / len
        const bristles = Math.max(3, Math.round(w * 1.4))
        const steps = Math.max(1, Math.ceil(len * 1.5))
        for (let b = 0; b < bristles; b++) {
          const off = (b / (bristles - 1) - 0.5) * w
          const edge = 1 - Math.abs(off) / (w / 2)
          const hb = Math.sin(b * 12.9898) * 43758.5453
          const weight = 0.45 + (hb - Math.floor(hb)) * 0.55
          for (let s2 = 0; s2 <= steps; s2++) {
            const f = s2 / steps
            const c = Math.round(prev.x + ddx * f + nx * off), r = Math.round(prev.y + ddy * f + ny * off)
            if (c >= 0 && c < cols && r >= 0 && r < rows) deposit(r * cols + c, Math.min(1, (0.35 + edge * 0.5) * weight + 0.2), 1)
          }
        }
      }
      prev.x = x; prev.y = y
    }

    function rainbowTone(phase: number) {
      return 2 + (((Math.floor(phase * HUE_TONES) % HUE_TONES) + HUE_TONES) % HUE_TONES)
    }

    // Cipher breathe: data rain. Each column runs its own packet down the grid at
    // its own speed, so the field reads as columns of moving text, not noise.
    function cipherPattern(c: number, r: number) {
      const h1 = Math.sin(c * 91.17) * 43758.5453, seed = h1 - Math.floor(h1)
      const speed = 3 + seed * 9
      const head = (time * speed * 6 + seed * 80) % (rows + 14)
      const behind = head - r
      const trail = behind >= 0 && behind < 12 ? 1 - behind / 12 : 0
      const base = 0.12 + 0.2 * Math.sin(c * 0.6 + time * 0.8) * Math.sin(r * 0.25 - time * 0.5)
      return Math.max(0, Math.min(1, base + trail * trail * 1.1))
    }

    function breatheNoise(nx: number, ny: number) {
      const spatial = Math.sin(nx * 7) * Math.cos(ny * 5) + Math.sin(nx * 13 + ny * 9) * 0.5
      const shimmer = Math.sin(nx * 4 + ny * 6 + time * 0.6) * 0.35 + Math.cos(nx * 9 - ny * 5 + time * 0.5) * 0.2
      return spatial + shimmer
    }

    function draw() {
      const alpha = soft ? 0.08 : (trailMode ? 0.2 : 1)
      ctx!.fillStyle = `rgba(${bgR}, ${bgG}, ${bgB}, ${water ? 0.2 : alpha})`
      ctx!.fillRect(0, 0, width, height)

      const now = performance.now()
      const dt = Math.min(3, (now - last) / 16.667)
      last = now
      time += (breathe ? 0.009 : water ? 0.009 : (trailMode ? 0.02 : 0.01)) * dt

      if (web) {
        const k = Math.pow(0.985, dt)
        for (let i = 0; i < field.length; i++) { field[i] *= k; hotf[i] *= k }
        stepWeb()
      } else if (lightning) stepLightning(dt)
      else if (brush) stepBrush(dt)
      else if (water) stepDrops(dt)

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = c * cellW + cellW / 2
          const py = r * cellH + cellH / 2
          const nx = c / cols
          const ny = r / rows
          const i = r * cols + c

          const dx = px - mouse.x
          const dy = py - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (letters) {
            // Hidden message: letters sit faintly on the grid and read out where the light is
            let val: number, hot: number
            if (water) { val = Math.max(0, field[i] + flash); hot = hotf[i] }
            else {
              const influence = Math.max(0, 1 - dist / (220 * reach))
              val = Math.max(0, Math.min(1, (breatheNoise(nx, ny) + influence * 3 + 1.2) / 4.2))
              hot = influence
            }
            const opacity = Math.max(0.06, Math.min(1, 0.06 + val * val * 1.1))
            glyph(cidx[i], opacity, 0, px, py)
            if (hot > 0.05) glyph(cidx[i], Math.min(1, opacity * hot), rainbow ? rainbowTone(ny * 0.8 + nx * 0.3 + time * 0.4 + hot * 0.4) : 1, px, py)
            continue
          }

          if (cipher) {
            // Scrambling characters: every cell reshuffles many times a second, faster where it's
            // bright and under the cursor. Brightness comes from the field or the breathe noise.
            let val: number, hot: number
            if (water) {
              val = Math.max(restLevel + grain[i] * restLevel * 0.6, field[i] + flash)
              hot = hotf[i]
            } else {
              const influence = Math.max(0, 1 - dist / (130 * reach))
              val = Math.max(0, Math.min(1, cipherPattern(c, r) + influence * 0.9))
              hot = influence
            }
            const rate = 0.12 + val * 0.5 + hot * 0.4
            if (Math.random() < rate * dt) cidx[i] = Math.floor(Math.random() * chars.length)
            const opacity = Math.max(lightMode ? 0.12 : 0.05, Math.min(0.95, (lightMode ? 0.2 : 0.12) + val * (lightMode ? 0.95 : 0.8)))
            glyph(cidx[i], opacity, 0, px, py)
            if (hot > 0.05) glyph(cidx[i], Math.min(1, opacity * hot), rainbow ? rainbowTone(ny * 0.8 + nx * 0.3 + time * 0.4 + hot * 0.4) : 1, px, py)
            continue
          }

          if (water) {
            // Faint resting texture so the surface isn't empty, plus the running water
            const rest = restLevel + grain[i] * restLevel * 0.6
            const val = Math.max(rest, field[i] + flash + (tiles ? grain[i] * 0.08 : 0))
            const hot = hotf[i]
            const charIdx = tiles
              ? Math.min(TILE_VARIANTS - 1, Math.floor(val * TILE_VARIANTS))
              : Math.floor(Math.abs(val * chars.length * 2) % chars.length)
            const opacity = Math.max(0.03, Math.min(0.95, val * 0.9))
            if (hot > 0.05) {
              const tone = rainbow ? rainbowTone(ny * 0.8 + nx * 0.3 + time * 0.4 + hot * 0.4) : 1
              glyph(charIdx, Math.min(1, opacity + hot * 0.25), tone, px, py)
            } else {
              glyph(charIdx, opacity, 0, px, py)
            }
            continue
          }

          let noise: number

          if (breathe) {
            noise = breatheNoise(nx, ny)
          } else if (trailMode) {
            noise = Math.sin(ny * 10 - time) * Math.cos(nx * 5 + time * 0.5)
            noise += Math.sin(nx * 20 + time)
          } else {
            noise = Math.sin(nx * 5 + time) * Math.cos(ny * 3 - time * 0.5)
            noise += Math.sin(nx * 10 - time * 1.2) * 0.5
            noise += Math.cos(ny * 8 + time * 0.8) * 0.3
          }

          if (tiles) {
            // Cursor glow with a wobbling outline
            const ang = Math.atan2(dy, dx)
            const wob = 1 + 0.35 * Math.sin(ang * 3 + time * 2.4) + 0.2 * Math.sin(ang * 5 - time * 3.3)
            const influence = Math.max(0, 1 - dist / (190 * wob * reach))
            noise += influence * 3
            const g = grain[i]
            const val = Math.max(0, Math.min(1, (noise + 2) / 4 + g * 0.22))
            const charIdx = Math.min(TILE_VARIANTS - 1, Math.floor(val * TILE_VARIANTS))
            const opacity = Math.max(lightMode ? 0.1 : 0.03, Math.min(lightMode ? 1 : 0.9, val * (lightMode ? 0.95 : 0.7) + g * 0.1))
            if (influence > 0) {
              const tone = rainbow ? rainbowTone(ang / (Math.PI * 2) + time * 0.35 + influence * 0.6 + g * 0.15) : 1
              glyph(charIdx, Math.min(1, opacity + influence * 0.7), tone, px, py)
            } else {
              glyph(charIdx, opacity, 0, px, py)
            }
          } else if (trailMode || breathe) {
            // Kept verbatim from what is live on defne.io: plain circular pool,
            // hard swap to the highlight tone, no wobble and no extra contrast.
            const influence = Math.max(0, 1 - dist / (200 * reach))
            noise += influence * 3
            const val = (noise + 2) / 4
            const charIdx = Math.floor(Math.abs(val * chars.length * 2) % chars.length)
            const scanline = breathe ? 0 : Math.sin(py * 0.1 - time * 5)
            const opacity = Math.max(0.04, Math.min(0.85, val * 0.55 + (scanline > 0.8 ? 0.25 : 0)))
            if (influence > 0) {
              glyph(charIdx, Math.min(1, opacity + influence * 0.5), 1, px, py)
            } else {
              glyph(charIdx, opacity, 0, px, py)
            }
          } else {
            const influence = Math.exp(-dist / (150 * reach))
            noise += influence * 4 * Math.sin(time * 5)
            const val = (noise + 2) / 4
            const charIdx = Math.floor(Math.min(chars.length - 1, Math.max(0, val * chars.length)))
            const opacity = Math.min(1, Math.max(0.05, val * 0.8 + influence))
            const offX = Math.cos(time + ny * 10) * influence * 20
            const offY = Math.sin(time + nx * 10) * influence * 20
            glyph(charIdx, opacity, 0, px + offX, py + offY)
          }
        }
      }


      animId = requestAnimationFrame(draw)
    }

    const setMouse = (clientX: number, clientY: number) => {
      const rect = canvas!.getBoundingClientRect()
      mouse.x = clientX - rect.left
      mouse.y = clientY - rect.top
      mouseCell.c = Math.floor(mouse.x / cellW)
      mouseCell.r = Math.floor(mouse.y / cellH)
    }
    const clearMouse = () => { mouse.x = -1000; mouse.y = -1000; mouseCell.c = -1; mouseCell.r = -1 }

    const onMouseMove = (e: MouseEvent) => setMouse(e.clientX, e.clientY)
    const onMouseLeave = clearMouse
    /* Never preventDefault here. On mobile the field is something you scroll
       past, not a drawing surface, and swallowing touchmove left the page
       unscrollable anywhere the canvas was under your thumb. */
    const onTouchMove = (e: TouchEvent) => setMouse(e.touches[0].clientX, e.touches[0].clientY)
    const onTouchStart = (e: TouchEvent) => setMouse(e.touches[0].clientX, e.touches[0].clientY)
    const onTouchEnd = clearMouse

    /* The canvas bitmap is sized from the container, but the CSS box is 100%.
       Listening only to window resize meant any container-only size change (a
       vh clamp settling, a font landing, a panel opening) left a stale bitmap
       stretched to fit the new box. Observe the container itself. */
    const ro = new ResizeObserver(() => resize())
    ro.observe(container)
    window.addEventListener('resize', resize)
    container.addEventListener('mousemove', onMouseMove)
    container.addEventListener('mouseleave', onMouseLeave)
    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchmove', onTouchMove, { passive: true })
    container.addEventListener('touchend', onTouchEnd)
    resize()
    if (apiRef) apiRef.current = {
      glow(x, y, w, h, int) {
        const c0 = Math.max(0, Math.floor(x / cellW)), c1 = Math.min(cols - 1, Math.ceil((x + w) / cellW))
        const r0 = Math.max(0, Math.floor(y / cellH)), r1 = Math.min(rows - 1, Math.ceil((y + h) / cellH))
        for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) deposit(r * cols + c, int, 1)
      },
      line(x0, y0, x1, y1, int) {
        const ax = x0 / cellW, ay = y0 / cellH, bx = x1 / cellW, by = y1 / cellH
        const steps = Math.max(1, Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(by - ay))))
        for (let s2 = 0; s2 <= steps; s2++) {
          const c = Math.round(ax + (bx - ax) * s2 / steps), r = Math.round(ay + (by - ay) * s2 / steps)
          if (c >= 0 && c < cols && r >= 0 && r < rows) deposit(r * cols + c, int, 1)
        }
      },
    }
    // Rebuild once the webfont is in so glyphs aren't cached in the fallback face
    document.fonts?.ready.then(buildAtlas)
    draw()

    return () => {
      if (apiRef) apiRef.current = null
      cancelAnimationFrame(animId)
      ro.disconnect()
      window.removeEventListener('resize', resize)
      container.removeEventListener('mousemove', onMouseMove)
      container.removeEventListener('mouseleave', onMouseLeave)
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchmove', onTouchMove)
      container.removeEventListener('touchend', onTouchEnd)
    }
  }, [charsStr, trailMode, breatheProp, lightMode, color, render, motion, hover, message, restLevel, apiRef])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  )
}
