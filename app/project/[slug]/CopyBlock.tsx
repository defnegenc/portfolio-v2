'use client'

import { useState } from 'react'

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' }

export default function CopyBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{ position: 'relative', marginTop: '0.25rem' }}>
      <div style={{
        ...mono, fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--ink-dim)',
        background: 'rgba(26,25,24,0.05)', border: '1px solid var(--hairline)',
        padding: '0.75rem 2.5rem 0.75rem 0.9rem', borderRadius: 2,
        userSelect: 'text',
      }}>
        {text}
      </div>
      <button
        onClick={handleCopy}
        title="Copy citation"
        style={{
          position: 'absolute', top: '0.55rem', right: '0.55rem',
          fontFamily: 'inherit', fontSize: '0.85rem',
          color: copied ? 'var(--award)' : 'var(--ink)',
          background: 'none', border: 'none', cursor: 'pointer',
          transition: 'color 0.2s',
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}
