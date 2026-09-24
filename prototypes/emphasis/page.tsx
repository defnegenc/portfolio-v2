'use client'

/* Prototypes for emphasising the homepage paragraph.

   The reference is the attention piece: a reader walks the sentence and the
   current word sits in a filled block. Here the block is the accent colour and
   the word inside it is the page background, so it inverts rather than tints.
   Everything not highlighted stays at full ink, because the paragraph has to
   stay readable while the highlight moves.

   Temporary. Once one wins it replaces the plain <p> in the homepage About. */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import { useTheme } from '@/components/useTheme'

const BIO = 'I think about how modern interfaces fail to meet our needs with exponentially growing AI capabilities. BS, MS, and a deferred PhD admission in Computer Science from Stanford University. Now AI @ Coinbase, where I own the agent creation experience.'

const WORDS = BIO.split(' ')

/* Contiguous phrases covering the whole paragraph, so the walk never skips any
   of it. Break at punctuation first, then split any run longer than MAX so a
   single clause does not sit lit for three seconds. */
const MAX = 6
const PHRASES: [number, number][] = (() => {
  const out: [number, number][] = []
  let start = 0
  const push = (from: number, to: number) => {
    const len = to - from + 1
    if (len <= MAX) { out.push([from, to]); return }
    const parts = Math.ceil(len / MAX)
    const size = Math.ceil(len / parts)
    for (let i = from; i <= to; i += size) out.push([i, Math.min(to, i + size - 1)])
  }
  WORDS.forEach((w, i) => {
    if (/[,.;:]$/.test(w) || i === WORDS.length - 1) { push(start, i); start = i + 1 }
  })
  return out
})()

// the phrases worth landing on, for the static highlighter pass
const KEY: [number, number][] = (() => {
  const find = (phrase: string): [number, number] => {
    const p = phrase.split(' ')
    for (let i = 0; i <= WORDS.length - p.length; i++) {
      if (p.every((w, j) => WORDS[i + j].replace(/[.,]/g, '') === w.replace(/[.,]/g, ''))) {
        return [i, i + p.length - 1]
      }
    }
    return [0, 0]
  }
  return [
    find('modern interfaces'),
    find('exponentially growing AI capabilities'),
    find('deferred PhD admission'),
    find('Stanford University'),
    find('agent creation experience'),
  ]
})()

const inRange = (i: number, r: [number, number]) => i >= r[0] && i <= r[1]

type Variant = {
  id: string
  name: string
  note: string
  kind: 'walk' | 'keys' | 'walk-keys' | 'sweep' | 'hover' | 'plain'
}

const VARIANTS: Variant[] = [
  {
    id: 'walk', name: 'Reader', kind: 'walk',
    note: 'One word at a time, straight through, looping. Closest to the attention piece. Constant motion, which may be too much on a homepage you want people to read.',
  },
  {
    id: 'keys', name: 'Key phrases, static', kind: 'keys',
    note: 'The five phrases that carry the meaning, all blocked at once. No motion. Reads like a highlighter pass rather than an animation.',
  },
  {
    id: 'walk-keys', name: 'Phrase walk', kind: 'walk-keys',
    note: 'Steps phrase by phrase through the whole paragraph, breaking at punctuation and splitting any clause longer than six words. Slower than the reader and never mid-word.',
  },
  {
    id: 'sweep', name: 'Single sweep', kind: 'sweep',
    note: 'Walks every phrase once on load, then stops on the last and stays. The movement introduces itself and then gets out of the way.',
  },
  {
    id: 'hover', name: 'On hover', kind: 'hover',
    note: 'Nothing moves on its own. Any word blocks when you point at it, so the paragraph becomes something you can play with without demanding attention.',
  },
  {
    id: 'plain', name: 'No highlight', kind: 'plain',
    note: 'The control: what is live now. Included so the others can be judged against it rather than against memory.',
  },
]

function Para({ kind }: { kind: Variant['kind'] }) {
  const [step, setStep] = useState(0)
  const [hover, setHover] = useState<number | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (kind === 'plain' || kind === 'keys' || kind === 'hover') return
    if (kind === 'sweep' && done) return
    const period = kind === 'walk' ? 260 : 1100
    const id = setInterval(() => {
      setStep(v => {
        const n = kind === 'walk' ? WORDS.length : PHRASES.length
        const next = v + 1
        if (kind === 'sweep' && next >= n) { setDone(true); return n - 1 }
        return next % n
      })
    }, period)
    return () => clearInterval(id)
  }, [kind, done])

  const lit = (i: number) => {
    if (kind === 'plain') return false
    if (kind === 'hover') return hover === i
    if (kind === 'keys') return KEY.some(r => inRange(i, r))
    if (kind === 'walk') return i === step
    return inRange(i, PHRASES[step % PHRASES.length])
  }

  return (
    <p className="em-p">
      {WORDS.map((w, i) => (
        <span key={i} className={lit(i) ? 'em-w em-on' : 'em-w'}
          onMouseEnter={kind === 'hover' ? () => setHover(i) : undefined}
          onMouseLeave={kind === 'hover' ? () => setHover(null) : undefined}>
          {w}
        </span>
      ))}
    </p>
  )
}

export default function EmphasisLab() {
  const [theme, setTheme] = useTheme('dark')
  const [accent, setAccent] = useState('#B9A6F5')

  const SWATCH = ['#B9A6F5', '#F2B26B', '#7FA8F5', '#7EE38A', '#F08AA8', '#F26A4B']

  return (
    <div data-theme={theme} style={{ position: 'fixed', inset: 0, overflowY: 'auto', background: 'var(--bg)', color: 'var(--ink)', ...({ '--award': accent } as React.CSSProperties) }}>
      <style>{`
        [data-theme="light"] { --bg: #F4F2EC; --ink: #1A1918; --ink-dim: #2E2D2A; --hairline: rgba(26,25,24,0.15); }
        [data-theme="dark"]  { --bg: #0A0A0A; --ink: #E8E6E0; --ink-dim: #D2D0CA; --hairline: rgba(232,230,224,0.12); }

        .em-back { display: inline-block; font-size: 0.9rem; color: var(--ink-dim); text-decoration: none; }
        .em-back:hover { color: var(--award); }
        .em-card { border-top: 1px solid var(--hairline); padding-top: 1.4rem; }
        .em-name { font-size: 1.05rem; font-weight: 600; letter-spacing: -0.01em; color: var(--award); }
        .em-note { font-size: 0.88rem; line-height: 1.5; color: var(--ink-dim); margin-top: 0.3rem; max-width: 720px; }

        /* the paragraph: full ink throughout, the block inverts to the accent */
        .em-p {
          font-size: clamp(1.15rem, 1.5vw, 1.35rem); line-height: 1.75; color: var(--ink);
          max-width: 860px; margin-top: 1rem;
        }
        .em-w { display: inline-block; padding: 0.06em 0.16em; margin-right: 0.1em; border-radius: 3px; transition: background .18s ease, color .18s ease; }
        .em-on { background: var(--award); color: var(--bg); }

        .em-sw { display: flex; gap: 0.4rem; align-items: center; }
        .em-chip { width: 22px; height: 22px; border-radius: 999px; border: 2px solid transparent; cursor: pointer; padding: 0; }
        .em-chip[data-on="1"] { border-color: var(--ink); }
      `}</style>

      <div style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
        <header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '2rem' }}>
            <div>
              <Link href="/" className="em-back">← Work</Link>
              <h1 style={{ fontSize: 'clamp(1.5rem, 2.6vw, 2.1rem)', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: '0.5rem' }}>
                Paragraph emphasis
              </h1>
            </div>
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
          <p style={{ fontSize: '0.98rem', lineHeight: 1.6, color: 'var(--ink)', marginTop: '0.7rem', maxWidth: 820 }}>
            The block takes the accent and the word inside it inverts to the page background, so it is black
            on the accent in dark mode and cream in light. Everything unhighlighted stays at full ink. Change
            the accent below to check it holds across the palette.
          </p>
          <div className="em-sw" style={{ marginTop: '0.9rem' }}>
            {SWATCH.map(c => (
              <button key={c} className="em-chip" data-on={accent === c ? 1 : 0}
                style={{ background: c }} onClick={() => setAccent(c)} aria-label={c} />
            ))}
          </div>
        </header>

        {VARIANTS.map(v => (
          <div key={v.id} className="em-card">
            <div className="em-name">{v.name}</div>
            <div className="em-note">{v.note}</div>
            <Para kind={v.kind} />
          </div>
        ))}
      </div>
    </div>
  )
}
