'use client'

/* One theme for the whole site. Pages own their own state as before, but it is
   seeded from (and written back to) localStorage so dark mode survives a jump
   from the homepage to the résumé. */

import { useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

// a new key, so everyone starts in light mode again; the toggle still remembers
const KEY = 'theme-v2'

export function useTheme(fallback: Theme = 'light') {
  const [theme, setTheme] = useState<Theme>(fallback)

  useEffect(() => {
    const saved = window.localStorage.getItem(KEY)
    if (saved === 'dark' || saved === 'light') setTheme(saved)
  }, [])

  useEffect(() => {
    window.localStorage.setItem(KEY, theme)
  }, [theme])

  return [theme, setTheme] as const
}
