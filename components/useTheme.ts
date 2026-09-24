'use client'

/* One theme for the whole site. Pages own their own state as before, but it is
   seeded from (and written back to) localStorage so dark mode survives a jump
   from the homepage to the résumé. */

import { useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

export function useTheme(fallback: Theme = 'dark') {
  const [theme, setTheme] = useState<Theme>(fallback)

  useEffect(() => {
    const saved = window.localStorage.getItem('theme')
    if (saved === 'dark' || saved === 'light') setTheme(saved)
  }, [])

  useEffect(() => {
    window.localStorage.setItem('theme', theme)
  }, [theme])

  return [theme, setTheme] as const
}
