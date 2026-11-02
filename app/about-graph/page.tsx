'use client'

/* About me and ideas as Star-style family trees; the graphs themselves live
   in components/aboutGraph. Not linked from anywhere; the GUI and the
   terminal show the same graphs in their About me. */

import { useState } from 'react'
import { useTheme } from '@/components/useTheme'
import { AboutGraph, GRAPH_CSS, type GraphView } from '@/components/aboutGraph'

export default function AboutGraphPage() {
  const [theme] = useTheme('light')
  const [view, setView] = useState<GraphView>('ideas')
  return (
    <main className="g-root" data-theme={theme}>
      <style>{GRAPH_CSS + CSS}</style>
      {/* two views, as two commands */}
      <div className="g-tabs">
        <button aria-pressed={view === 'ideas'} onClick={() => setView('ideas')}><span>%</span> cat ideas --graph</button>
        <button aria-pressed={view === 'life'} onClick={() => setView('life')}><span>%</span> cat about-me --graph</button>
      </div>
      <div className="g-box"><AboutGraph view={view} /></div>
      <a className="g-back" href="/">← Back</a>
    </main>
  )
}

const CSS = `
  .g-root { --g-bg: #F4F2EC; --g-ink: #1A1918; --g-accent: #013698; min-height: 100vh; box-sizing: border-box;
    background: var(--g-bg); color: var(--g-ink); padding: 6vh 5vw 5vh; display: flex; flex-direction: column; gap: 3vh; }
  .g-root[data-theme="dark"] { --g-bg: #0A0A0A; --g-ink: #E8E6E0; --g-accent: #7FA8F5; }
  .g-box { width: 100%; max-width: 1100px; align-self: center; }
  .g-tabs { display: flex; gap: 1.6rem; flex-wrap: wrap; }
  .g-tabs button { font: inherit; font-family: var(--font-mono), ui-monospace, monospace; font-size: 1rem; background: none; border: 0; padding: 0; color: var(--g-ink); cursor: pointer; }
  .g-tabs button span { margin-right: 0.4em; }
  .g-tabs button[aria-pressed="true"] { color: var(--g-accent); text-decoration: underline; text-underline-offset: 0.3em; }
  .g-back { font-family: var(--font-mono), ui-monospace, monospace; font-size: 0.95rem; color: var(--g-ink); text-decoration: none; align-self: flex-start; }
  .g-back:hover { color: var(--g-accent); }
`
