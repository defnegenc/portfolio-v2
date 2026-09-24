'use client'

/* One stroked 24-grid icon per hour and per sky condition, shared by the
   weather picker and the matrix so the two never drift apart. */

import type { Period, Sky } from '@/components/ambient'

// One 22px grid, stroked in currentColor, so they read as a set.

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>{children}</svg>
)
const CLOUD = 'M17.2 17H7.2a3.6 3.6 0 0 1 .9-7.1 4.7 4.7 0 0 1 8.8 1.1 3.1 3.1 0 0 1 .3 6Z'
const CLOUD_HI = 'M17.2 15H7.2a3.6 3.6 0 0 1 .9-7.1 4.7 4.7 0 0 1 8.8 1.1 3.1 3.1 0 0 1 .3 6Z'

const Sunrise = () => (
  <Svg><g {...S}>
    <path d="M4 18h16" /><path d="M12 5v4" /><path d="M9 8l3-3 3 3" />
    <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
  </g></Svg>
)
const Sun = () => (
  <Svg><g {...S}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
  </g></Svg>
)
const Sunset = () => (
  <Svg><g {...S}>
    <path d="M4 18h16" /><path d="M12 9V5" /><path d="M9 6l3 3 3-3" />
    <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
  </g></Svg>
)
const Moon = () => (
  <Svg><g {...S}><path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z" /></g></Svg>
)
const CloudIcon = () => <Svg><g {...S}><path d={CLOUD} /></g></Svg>
const Rain = () => (
  <Svg><g {...S}><path d={CLOUD_HI} /><path d="M9 18v1.6M12.5 17.6v2M16 18v1.6" /></g></Svg>
)
const Snow = () => (
  <Svg><g {...S}><path d={CLOUD_HI} /><path d="M9 18.8h.01M12.5 20h.01M16 18.8h.01" /></g></Svg>
)
const Fog = () => <Svg><g {...S}><path d="M4 9h16M6 13h13M4 17h12" /></g></Svg>
const Storm = () => (
  <Svg><g {...S}><path d="M17.2 14H7.2a3.6 3.6 0 0 1 .9-7.1 4.7 4.7 0 0 1 8.8 1.1 3.1 3.1 0 0 1 .3 6Z" />
    <path d="M13 16l-2.5 3.5h3l-2 3" /></g></Svg>
)
const Wind = () => (
  <Svg><g {...S}>
    <path d="M3 9h10a2.5 2.5 0 1 0-2.5-2.5" />
    <path d="M3 14h13a2.5 2.5 0 1 1-2.5 2.5" />
  </g></Svg>
)
const HOUR_ICON: Record<Period, () => React.ReactElement> = {
  dawn: Sunrise, day: Sun, dusk: Sunset, night: Moon, late: Moon,
}
const SKY_ICON: Record<Sky, () => React.ReactElement> = {
  clear: Sun, cloud: CloudIcon, rain: Rain, snow: Snow, fog: Fog, storm: Storm, wind: Wind,
}


export { HOUR_ICON, SKY_ICON }
