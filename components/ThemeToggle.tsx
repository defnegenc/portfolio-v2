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
  // Deliberately monochrome: this control is not part of the weather palette,
  // so it never takes --award. Selected is full ink, the other sits back.
  const btn = (active: boolean): React.CSSProperties => ({
    width: 24,
    height: 24,
    cursor: 'pointer',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    color: active ? 'var(--ink)' : 'var(--ink-dim)',
    opacity: active ? 1 : 0.55,
    transition: 'opacity .15s, color .15s',
  })

  // Clicking anywhere on the pill flips the theme, including the gap between icons
  const flip = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <div
      className="theme-toggle"
      onClick={flip}
      role="button"
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        border: '2px solid var(--ink-dim)',
        borderRadius: 999,
        padding: 3,
        // sits over the animation, so it needs to carry its own background
        background: 'var(--bg)',
        height: 30,
        lineHeight: 0,
        cursor: 'pointer',
      }}
    >
      <span style={btn(theme === 'light')} aria-hidden><SunIcon /></span>
      <span style={btn(theme === 'dark')} aria-hidden><MoonIcon /></span>
    </div>
  )
}
