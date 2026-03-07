'use client'

import { useEffect, useRef } from 'react'

interface Props {
  chars?: string
  trailMode?: boolean
  breathe?: boolean
  lightMode?: boolean
}

export default function AsciiCanvas({ chars: charsStr, trailMode = false, breathe = false, lightMode = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const chars = charsStr
      ? charsStr.split('')
      : (trailMode || breathe)
        ? '·:|¦I'.split('')
        : ' .:-=+*#%@'.split('')

    // Color scheme based on mode
    const bgR = lightMode ? 244 : 10
    const bgG = lightMode ? 242 : 10
    const bgB = lightMode ? 236 : 10
    // Primary char color (light mode: dark ink; dark mode: off-white)
    const chR = lightMode ? 26  : 232
    const chG = lightMode ? 25  : 230
    const chB = lightMode ? 24  : 224
    // Hover highlight (light mode: deep black; dark mode: white)
    const hlR = lightMode ? 0   : 255
    const hlG = lightMode ? 0   : 255
    const hlB = lightMode ? 0   : 255

    let width: number, height: number, rows: number, cols: number
    let cellW: number, cellH: number
    let time = 0
    const mouse = { x: -1000, y: -1000 }
    let animId: number

    function resize() {
      width = container!.offsetWidth
      height = container!.offsetHeight
      canvas!.width = width * window.devicePixelRatio
      canvas!.height = height * window.devicePixelRatio
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio)
      const targetCW = (trailMode || breathe) ? 9 : 7
      cols = Math.round(width / targetCW)
      cellW = width / cols
      cellH = cellW * ((trailMode || breathe) ? 1.5 : 1.4)
      rows = Math.ceil(height / cellH)
    }

    function draw() {
      const alpha = breathe ? 0.08 : (trailMode ? 0.2 : 1)
      ctx!.fillStyle = `rgba(${bgR}, ${bgG}, ${bgB}, ${alpha})`
      ctx!.fillRect(0, 0, width, height)

      time += breathe ? 0.004 : (trailMode ? 0.02 : 0.01)

      ctx!.textAlign = 'center'
      ctx!.textBaseline = 'middle'
      const fontSize = Math.max(8, cellH * ((trailMode || breathe) ? 0.9 : 0.8))
      ctx!.font = `${fontSize}px "Fragment Mono", monospace`

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = c * cellW + cellW / 2
          const py = r * cellH + cellH / 2
          const nx = c / cols
          const ny = r / rows

          let noise: number

          if (breathe) {
            const spatial = Math.sin(nx * 7) * Math.cos(ny * 5)
                          + Math.sin(nx * 13 + ny * 9) * 0.5
            const shimmer = Math.sin(nx * 4 + ny * 6 + time * 0.6) * 0.35
                          + Math.cos(nx * 9 - ny * 5 + time * 0.5) * 0.2
            noise = spatial + shimmer
          } else if (trailMode) {
            noise = Math.sin(ny * 10 - time) * Math.cos(nx * 5 + time * 0.5)
            noise += Math.sin(nx * 20 + time)
          } else {
            noise = Math.sin(nx * 5 + time) * Math.cos(ny * 3 - time * 0.5)
            noise += Math.sin(nx * 10 - time * 1.2) * 0.5
            noise += Math.cos(ny * 8 + time * 0.8) * 0.3
          }

          const dx = px - mouse.x
          const dy = py - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (trailMode || breathe) {
            const influence = Math.max(0, 1 - dist / 200)
            noise += influence * 3
            const val = (noise + 2) / 4
            const charIdx = Math.floor(Math.abs(val * chars.length * 2) % chars.length)
            const scanline = breathe ? 0 : Math.sin(py * 0.1 - time * 5)
            const opacity = Math.max(0.04, Math.min(0.85, val * 0.55 + (scanline > 0.8 ? 0.25 : 0)))
            if (influence > 0) {
              ctx!.fillStyle = `rgba(${hlR}, ${hlG}, ${hlB}, ${opacity + influence * 0.5})`
            } else {
              ctx!.fillStyle = `rgba(${chR}, ${chG}, ${chB}, ${opacity})`
            }
            ctx!.fillText(chars[charIdx], px, py)
          } else {
            const influence = Math.exp(-dist / 150)
            noise += influence * 4 * Math.sin(time * 5)
            const val = (noise + 2) / 4
            const charIdx = Math.floor(Math.min(chars.length - 1, Math.max(0, val * chars.length)))
            const opacity = Math.min(1, Math.max(0.05, val * 0.8 + influence))
            ctx!.fillStyle = `rgba(${chR}, ${chG}, ${chB}, ${opacity})`
            const offX = Math.cos(time + ny * 10) * influence * 20
            const offY = Math.sin(time + nx * 10) * influence * 20
            ctx!.fillText(chars[charIdx], px + offX, py + offY)
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const onMouseLeave = () => { mouse.x = -1000; mouse.y = -1000 }

    window.addEventListener('resize', resize)
    container.addEventListener('mousemove', onMouseMove)
    container.addEventListener('mouseleave', onMouseLeave)
    resize()
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      container.removeEventListener('mousemove', onMouseMove)
      container.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [charsStr, trailMode, breathe, lightMode])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  )
}
