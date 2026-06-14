'use client'

import { useState } from 'react'

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' }

// Render **bold** spans without dangerouslySetInnerHTML.
function renderBody(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} style={{ fontWeight: 600, color: 'var(--ink)' }}>{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  )
}

/* A compact, expandable card. Collapsed, it clamps the body to a few lines so a
   cluster of these reads as a scannable grid; clicking reveals the full text.
   Long-only: the toggle is hidden when the body is short enough to show whole. */
export default function ExpandableTile({
  label,
  body,
  accent,
}: {
  label: string
  body: string
  accent: string
}) {
  const [expanded, setExpanded] = useState(false)
  const isLong = body.length > 180

  return (
    <div
      style={{
        border: '1px solid var(--hairline)',
        borderRadius: 6,
        padding: '1.5rem 1.5rem 1.25rem',
        background: 'rgba(26,25,24,0.015)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: '0.6rem' }}>
        {label}
      </div>
      <p
        style={{
          fontSize: '0.92rem',
          fontWeight: 300,
          lineHeight: 1.65,
          color: 'var(--ink-dim)',
          margin: 0,
          ...(expanded || !isLong
            ? {}
            : {
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical' as const,
                overflow: 'hidden',
              }),
        }}
      >
        {renderBody(body)}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            ...mono,
            marginTop: '0.85rem',
            alignSelf: 'flex-start',
            background: 'none',
            border: 'none',
            padding: 0,
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: accent,
            cursor: 'pointer',
          }}
        >
          {expanded ? '− Less' : '+ More'}
        </button>
      )}
    </div>
  )
}
