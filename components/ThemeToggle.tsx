'use client'

/* ── ThemeToggle ───────────────────────────────────────────────────────
   One toggle for every page (home, about, project pages). Pill shaped
   with a heavier border so it reads as a control rather than a hairline
   box. Takes theme state as props so each page keeps owning its own. */

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export default function ThemeToggle({
  theme,
  setTheme,
}: {
  theme: 'dark' | 'light'
  setTheme: (t: 'dark' | 'light') => void
}) {
  const btn = (active: boolean): React.CSSProperties => ({
    padding: '0.38rem 0.62rem',
    cursor: 'pointer',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    background: 'transparent',
    color: 'var(--ink)',
    opacity: active ? 1 : 0.32,
    transition: 'opacity 0.15s',
  })
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        border: '2px solid var(--ink-dim)',
        borderRadius: 999,
        padding: 2,
        lineHeight: 0,
      }}
    >
      <span onClick={() => setTheme('light')} style={btn(theme === 'light')} aria-label="Light theme"><SunIcon /></span>
      <span onClick={() => setTheme('dark')} style={btn(theme === 'dark')} aria-label="Dark theme"><MoonIcon /></span>
    </div>
  )
}
