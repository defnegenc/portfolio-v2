// Render **bold** spans without dangerouslySetInnerHTML.
function renderBody(text: string, strongColor: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} style={{ fontWeight: 600, color: strongColor }}>{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  )
}

/* One big tile = one whole section, shown fully expanded. The section title is
   the tile header; its sub-points stack inside. `featured` flips it to a bold
   inverted (dark) card so lead concepts stand out from the technical tiles. */
export default function ExpandableTile({
  title,
  rows,
  accent,
  featured = false,
}: {
  title: string
  rows: { label?: string; body: string }[]
  accent: string
  featured?: boolean
}) {
  const titleColor = featured ? 'var(--bg)' : 'var(--ink)'
  const bodyColor = featured ? 'rgba(244,242,236,0.72)' : 'var(--ink-dim)'
  const labelColor = featured ? 'var(--bg)' : accent

  return (
    <div
      style={{
        border: featured ? 'none' : '1px solid var(--hairline)',
        borderRadius: 8,
        padding: featured ? '2.1rem 2.1rem 1.9rem' : '1.75rem 1.75rem 1.6rem',
        background: featured ? 'var(--ink)' : 'rgba(26,25,24,0.02)',
        boxShadow: featured ? '0 12px 40px rgba(26,25,24,0.16)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div style={{ fontSize: featured ? '1.45rem' : '1.2rem', fontWeight: 700, letterSpacing: '-0.025em', color: titleColor, marginBottom: featured ? '1.25rem' : '1.1rem' }}>
        {title}
      </div>
      <div style={{ flex: 1 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ marginBottom: i < rows.length - 1 ? '1.1rem' : 0 }}>
            {r.label && (
              <div style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '-0.01em', color: labelColor, marginBottom: '0.3rem' }}>
                {r.label}
              </div>
            )}
            <p style={{ fontSize: featured ? '0.98rem' : '0.92rem', fontWeight: 300, lineHeight: 1.65, color: bodyColor, margin: 0 }}>
              {renderBody(r.body, titleColor)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
