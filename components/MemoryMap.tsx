'use client'

import { useEffect, useRef } from 'react'

// 5×7 pixel font bitmaps
const FONT: Record<string, number[][]> = {
  'A': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  'B': [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0]],
  'C': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,1],[0,1,1,1,0]],
  'D': [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0]],
  'E': [[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  'F': [[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0]],
  'G': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[1,0,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'H': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  'I': [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1]],
  'K': [[1,0,0,0,1],[1,0,0,1,0],[1,0,1,0,0],[1,1,0,0,0],[1,0,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
  'L': [[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  'M': [[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  'N': [[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  'O': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'R': [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
  'S': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[0,1,1,1,0],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'T': [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  'U': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'W': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,0,1,0,1],[1,1,0,1,1],[1,0,0,0,1]],
  'X': [[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1]],
  '0': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,1,1],[1,0,1,0,1],[1,1,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  '1': [[0,0,1,0,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
  '2': [[0,1,1,1,0],[1,0,0,0,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[1,1,1,1,1]],
  '3': [[0,1,1,1,0],[1,0,0,0,1],[0,0,0,0,1],[0,0,1,1,0],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  '4': [[0,0,0,1,0],[0,0,1,1,0],[0,1,0,1,0],[1,0,0,1,0],[1,1,1,1,1],[0,0,0,1,0],[0,0,0,1,0]],
  '5': [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[0,0,0,0,1],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  '6': [[0,0,1,1,0],[0,1,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  '7': [[1,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,1,0,0,0]],
  '8': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  '9': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0],[0,1,1,0,0]],
  '%': [[1,1,0,0,1],[1,1,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[0,1,0,1,1],[1,0,0,1,1],[0,0,0,0,0]],
  '×': [[0,0,0,0,0],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1],[0,0,0,0,0]],
  ' ': [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
}

// Scale each font pixel to SCALE grid cells
const SCALE = 2

// Returns set of [col, row] indices occupied by text centered in the grid
function getTextCells(text: string, gridCols: number, gridRows: number): Set<string> {
  const chars = text.split('').filter(c => FONT[c] !== undefined)
  const charW = 5 * SCALE
  const charGap = SCALE
  const totalW = chars.length * charW + (chars.length - 1) * charGap
  const totalH = 7 * SCALE
  const startCol = Math.floor((gridCols - totalW) / 2)
  const startRow = Math.floor((gridRows - totalH) / 2)
  const cells = new Set<string>()

  chars.forEach((ch, ci) => {
    const bitmap = FONT[ch]
    const xOff = startCol + ci * (charW + charGap)
    bitmap.forEach((rowBits, ri) => {
      rowBits.forEach((bit, bi) => {
        if (bit) {
          for (let sy = 0; sy < SCALE; sy++) {
            for (let sx = 0; sx < SCALE; sx++) {
              cells.add(`${xOff + bi * SCALE + sx},${startRow + ri * SCALE + sy}`)
            }
          }
        }
      })
    })
  })

  return cells
}

export type Project = {
  id: string
  display: string // what to render in pixel font, e.g. "5×" or "BL"
}

type Props = {
  activeProject: Project | null
  onReady?: () => void
}

export default function MemoryMap({ activeProject }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef({
    grid: [] as number[][],
    target: new Set<string>(),
    mouseX: -999,
    mouseY: -999,
    isHovering: false,
    ripples: [] as { x: number; y: number; r: number; alpha: number }[],
    explosions: [] as { x: number; y: number; r: number; alpha: number }[],
    raf: 0,
    width: 0,
    height: 0,
    cols: 0,
    rows: 0,
  })
  const CELL = 16

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const s = stateRef.current

    function resize() {
      s.width = canvas!.parentElement!.clientWidth
      s.height = canvas!.parentElement!.clientHeight
      canvas!.width = s.width
      canvas!.height = s.height
      s.cols = Math.ceil(s.width / CELL)
      s.rows = Math.ceil(s.height / CELL)
      initGrid()
    }

    function initGrid() {
      s.grid = []
      for (let y = 0; y < s.rows; y++) {
        const row: number[] = []
        for (let x = 0; x < s.cols; x++) {
          row.push(Math.random() > 0.85 ? (Math.random() > 0.6 ? 1 : 2) : 0)
        }
        s.grid.push(row)
      }
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect()
      s.mouseX = e.clientX - rect.left
      s.mouseY = e.clientY - rect.top
      s.isHovering = true
      const cx = Math.floor(s.mouseX / CELL)
      const cy = Math.floor(s.mouseY / CELL)
      const radius = 3
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = cx + dx, ny = cy + dy
          if (ny >= 0 && ny < s.rows && nx >= 0 && nx < s.cols) {
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist <= radius && Math.random() > dist / radius) {
              s.grid[ny][nx] = Math.random() > 0.5 ? 2 : 1
            }
          }
        }
      }
    }

    function onClick(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect()
      const ex = e.clientX - rect.left
      const ey = e.clientY - rect.top
      s.explosions.push({ x: ex, y: ey, r: 0, alpha: 1.0 })
      s.ripples.push({ x: ex, y: ey, r: 0, alpha: 0.8 })
      const cx = Math.floor(ex / CELL)
      const cy = Math.floor(ey / CELL)
      for (let dy = -8; dy <= 8; dy++) {
        for (let dx = -8; dx <= 8; dx++) {
          const nx = cx + dx, ny = cy + dy
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (ny >= 0 && ny < s.rows && nx >= 0 && nx < s.cols && dist <= 8) {
            s.grid[ny][nx] = Math.random() > dist / 8 ? 2 : (Math.random() > 0.5 ? 1 : 0)
          }
        }
      }
    }

    function draw() {
      const ctx = canvas!.getContext('2d')!
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, s.width, s.height)
      if (!s.grid.length) { s.raf = requestAnimationFrame(draw); return }

      const hCX = Math.floor(s.mouseX / CELL)
      const hCY = Math.floor(s.mouseY / CELL)

      for (let y = 0; y < s.rows; y++) {
        for (let x = 0; x < s.cols; x++) {
          const key = `${x},${y}`
          const isTarget = s.target.has(key)
          const px = x * CELL, py = y * CELL

          if (isTarget) {
            // Pixel font cell — gradually materialize
            if (s.grid[y][x] !== 3) {
              if (Math.random() < 0.04) s.grid[y][x] = 3
            }
            // Draw as solid black (the "pixel")
            ctx.fillStyle = '#000000'
            ctx.fillRect(px, py, CELL - 1, CELL - 1)
          } else {
            // If was a target cell but no longer, slowly decay
            if (s.grid[y][x] === 3) {
              if (Math.random() < 0.03) s.grid[y][x] = 0
              else {
                ctx.fillStyle = '#000000'
                ctx.fillRect(px, py, CELL - 1, CELL - 1)
                continue
              }
            }

            const cell = s.grid[y][x]
            const dx = x - hCX, dy = y - hCY
            const dist = Math.sqrt(dx * dx + dy * dy)
            const inRadius = s.isHovering && dist < 6

            if (cell === 1) {
              ctx.fillStyle = '#000000'
              ctx.fillRect(px, py, CELL, CELL)
            } else if (cell === 2) {
              ctx.fillStyle = '#aaaaaa'
              ctx.fillRect(px + 2, py + 2, CELL - 4, CELL - 4)
              if (Math.random() > 0.98) s.grid[y][x] = 0
            } else {
              const spawnChance = inRadius ? 0.05 : 0.0005
              if (Math.random() < spawnChance) s.grid[y][x] = Math.random() > 0.5 ? 1 : 2
            }

            if (s.isHovering && x === hCX && y === hCY) {
              ctx.strokeStyle = '#000000'
              ctx.lineWidth = 2
              ctx.strokeRect(px + 1, py + 1, CELL - 2, CELL - 2)
            }
          }
        }
      }

      if (s.isHovering) {
        ctx.strokeStyle = 'rgba(0,0,0,0.08)'
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(s.mouseX, 0); ctx.lineTo(s.mouseX, s.height); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(0, s.mouseY); ctx.lineTo(s.width, s.mouseY); ctx.stroke()
      }

      s.explosions = s.explosions.filter(e => e.alpha > 0.01)
      for (const exp of s.explosions) {
        exp.r += 2; exp.alpha -= 0.02
        ctx.beginPath(); ctx.arc(exp.x, exp.y, exp.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,0,0,${exp.alpha * 0.15})`; ctx.fill()
      }
      s.ripples = s.ripples.filter(r => r.alpha > 0.02)
      for (const rp of s.ripples) {
        rp.r += 2; rp.alpha -= 0.015
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0,0,0,${rp.alpha})`; ctx.lineWidth = 1; ctx.stroke()
      }

      s.raf = requestAnimationFrame(draw)
    }

    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseleave', () => { s.isHovering = false })
    canvas.addEventListener('click', onClick)
    window.addEventListener('resize', () => { resize() })

    resize()
    draw()

    return () => {
      cancelAnimationFrame(s.raf)
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('click', onClick)
    }
  }, [])

  // Update target cells when active project changes
  useEffect(() => {
    const s = stateRef.current
    if (!s.cols || !s.rows) return

    if (activeProject) {
      s.target = getTextCells(activeProject.display, s.cols, s.rows)
    } else {
      // Slowly clear all target cells (decay handled in draw loop)
      s.target = new Set()
    }
  }, [activeProject])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
    />
  )
}
