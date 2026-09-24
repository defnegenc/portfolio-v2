'use client'

/* Ambient modes: let the field choose itself.

   'clock'   — the visitor's local time of day picks the combination.
   'weather' — time of day *and* current conditions pick it, so morning sun,
               morning cloud and morning rain are three different fields.

   Weather comes from Open-Meteo: no key, CORS-friendly, works on a static
   export. It defaults to New York; the visitor can hand over their own
   location, which is only ever sent to Open-Meteo. The place name comes from
   the timezone Open-Meteo returns, so no reverse-geocoding service is involved.

   Both return the same shape the picker sets by hand, plus a caption so the
   choice is legible rather than arbitrary. */

import { useCallback, useEffect, useState } from 'react'
import type { Render, Motion, Hover } from './AsciiCanvas'

export type AmbientMode = 'off' | 'clock' | 'weather'
export type Period = 'dawn' | 'day' | 'dusk' | 'night' | 'late'
export type Sky = 'clear' | 'cloud' | 'rain' | 'snow' | 'fog' | 'storm' | 'wind'

export type Ambient = {
  color: string | null
  /** Accent for --award when the field itself is theme ink (snow), so the UI
   *  does not fall back to the default green. Defaults to `color`. */
  accent?: string
  render: Render
  motion: Motion
  hover: Hover
  caption: string
}

type Look = Omit<Ambient, 'caption'>

export const PERIOD_LABEL: Record<Period, string> = {
  dawn: 'Early', day: 'Daytime', dusk: 'Evening', night: 'Night', late: 'Late',
}
export const SKY_LABEL: Record<Sky, string> = {
  clear: 'Clear', cloud: 'Overcast', rain: 'Rain', snow: 'Snow', fog: 'Fog', storm: 'Storms', wind: 'Wind',
}

export function periodOf(d = new Date()): Period {
  const h = d.getHours()
  if (h >= 5 && h < 9) return 'dawn'
  if (h >= 9 && h < 17) return 'day'
  if (h >= 17 && h < 20) return 'dusk'
  if (h >= 20 && h < 24) return 'night'
  return 'late'
}

// WMO code → the conditions the field cares about
export function skyOf(code: number, wind = 0): Sky {
  if (code >= 95) return 'storm'
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow'
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain'
  if (code === 45 || code === 48) return 'fog'
  if (wind > 28) return 'wind'
  if (code === 2 || code === 3) return 'cloud'
  return 'clear'
}

// ── The matrix: every time of day × sky gets its own field ──────────────────

export const LOOKS: Record<Period, Record<Sky, Look>> = {
  /* Rules the matrix follows:
     · every colour is distinct within its row, so no two conditions in the
       same hour ever look alike
     · cipher never breathes and never strikes — it gets brush or geometric
     · lightning only ever lands on tiles
     · tiles + breathe always hovers rainbow
     · overcast is tiles + breathe like clear, told apart by colour alone
     · glyphs + trickle stays mono; tiles + trickle may go rainbow
     · fog is cipher + brush; geometric is not in the matrix at present
     · snow paints in theme ink and carries a blue accent for the UI */
  dawn: {
    clear: { color: '#F08AA8', render: 'tiles',  motion: 'breathe',   hover: 'rainbow' },
    cloud: { color: '#B9A6F5', render: 'tiles',  motion: 'breathe',   hover: 'rainbow' },
    rain:  { color: '#6FD7E8', render: 'glyphs', motion: 'trickle',   hover: 'mono' },
    snow:  { color: null,      accent: '#7FA8F5', render: 'tiles', motion: 'trickle', hover: 'mono' },
    fog:   { color: '#7FA8F5', render: 'cipher', motion: 'brush',     hover: 'mono' },
    storm: { color: '#F26A4B', render: 'tiles',  motion: 'lightning', hover: 'rainbow' },
    wind:  { color: '#F2B26B', render: 'tiles',  motion: 'brush',     hover: 'rainbow' },
  },
  day: {
    clear: { color: '#F2B26B', render: 'tiles',  motion: 'breathe',   hover: 'rainbow' },
    cloud: { color: '#B9A6F5', render: 'tiles',  motion: 'breathe',   hover: 'rainbow' },
    rain:  { color: '#6FD7E8', render: 'glyphs', motion: 'trickle',   hover: 'mono' },
    snow:  { color: null,      accent: '#7FA8F5', render: 'tiles', motion: 'trickle', hover: 'mono' },
    fog:   { color: '#7FA8F5', render: 'cipher', motion: 'brush',     hover: 'mono' },
    storm: { color: '#F26A4B', render: 'tiles',  motion: 'lightning', hover: 'rainbow' },
    wind:  { color: '#7EE38A', render: 'tiles',  motion: 'brush',     hover: 'rainbow' },
  },
  dusk: {
    clear: { color: '#F26A4B', render: 'tiles',  motion: 'breathe',   hover: 'rainbow' },
    cloud: { color: '#F08AA8', render: 'tiles',  motion: 'breathe',   hover: 'rainbow' },
    rain:  { color: '#7FA8F5', render: 'glyphs', motion: 'trickle',   hover: 'mono' },
    snow:  { color: '#B9A6F5', render: 'tiles',  motion: 'trickle',   hover: 'mono' },
    fog:   { color: '#F2B26B', render: 'cipher', motion: 'brush',     hover: 'mono' },
    storm: { color: '#6FD7E8', render: 'tiles',  motion: 'lightning', hover: 'rainbow' },
    wind:  { color: '#7EE38A', render: 'tiles',  motion: 'brush',     hover: 'mono' },
  },
  night: {
    clear: { color: '#7FA8F5', render: 'tiles',  motion: 'breathe',   hover: 'rainbow' },
    cloud: { color: '#B9A6F5', render: 'tiles',  motion: 'breathe',   hover: 'rainbow' },
    rain:  { color: '#7EE38A', render: 'glyphs', motion: 'trickle',   hover: 'mono' },
    snow:  { color: null,      accent: '#7FA8F5', render: 'tiles', motion: 'trickle', hover: 'mono' },
    fog:   { color: '#F26A4B', render: 'cipher', motion: 'brush',     hover: 'mono' },
    storm: { color: '#F08AA8', render: 'tiles',  motion: 'lightning', hover: 'rainbow' },
    wind:  { color: '#F2B26B', render: 'tiles',  motion: 'brush',     hover: 'mono' },
  },
  late: {
    clear: { color: '#7EE38A', render: 'cipher', motion: 'brush',     hover: 'mono' },
    cloud: { color: '#F2B26B', render: 'tiles',  motion: 'breathe',   hover: 'rainbow' },
    rain:  { color: '#6FD7E8', render: 'cipher', motion: 'trickle',   hover: 'mono' },
    snow:  { color: null,      accent: '#7FA8F5', render: 'cipher', motion: 'trickle', hover: 'mono' },
    fog:   { color: '#B9A6F5', render: 'cipher', motion: 'brush',     hover: 'mono' },
    storm: { color: '#F08AA8', render: 'tiles',  motion: 'lightning', hover: 'rainbow' },
    wind:  { color: '#7FA8F5', render: 'cipher', motion: 'brush',     hover: 'mono' },
  },
}

// Clock-only mode uses the clear-sky column
export function fromClock(d = new Date()): Ambient {
  const p = periodOf(d)
  return { ...LOOKS[p].clear, caption: PERIOD_LABEL[p] }
}

// "America/New_York" → "New York"
function placeFrom(tz?: string) {
  if (!tz) return ''
  const city = tz.split('/').pop() ?? ''
  return city.replace(/_/g, ' ')
}

// A plain-language reading of the WMO code, for the tooltip
const CONDITION: Record<number, string> = {
  0: 'clear', 1: 'mostly clear', 2: 'partly cloudy', 3: 'overcast',
  45: 'foggy', 48: 'freezing fog',
  51: 'light drizzle', 53: 'drizzle', 55: 'heavy drizzle',
  56: 'freezing drizzle', 57: 'freezing drizzle',
  61: 'light rain', 63: 'raining', 65: 'heavy rain',
  66: 'freezing rain', 67: 'freezing rain',
  71: 'light snow', 73: 'snowing', 75: 'heavy snow', 77: 'snow grains',
  80: 'rain showers', 81: 'rain showers', 82: 'heavy showers',
  85: 'snow showers', 86: 'heavy snow showers',
  95: 'thunderstorms', 96: 'thunderstorms with hail', 99: 'thunderstorms with hail',
}
export const describe = (code: number) => CONDITION[code] ?? 'hard to say'

const NYC = { lat: 40.7128, lon: -74.006, place: 'New York' }

type Coords = { lat: number; lon: number } | null
type Place = { lat: number; lon: number; place: string }

/* IP lookup. No key, CORS-friendly, and accurate to the neighbourhood, so a
   visitor in Williamsburg reads as Brooklyn rather than as "New York" from the
   timezone. It runs without a permission prompt; the precise-location button
   still exists for anyone who wants the field to match their actual block. */
async function lookupIp(): Promise<Place | null> {
  try {
    const j = await fetch('https://ipwho.is/').then(r => r.json())
    if (!j?.success || typeof j.latitude !== 'number') return null
    // "Brooklyn, New York" rather than just "Brooklyn"
    const place = [j.city, j.region].filter(Boolean).join(', ')
    return { lat: j.latitude, lon: j.longitude, place }
  } catch {
    return null
  }
}

export function useAmbient(mode: AmbientMode) {
  const [coords, setCoords] = useState<Coords>(null)   // precise, only if granted
  const [ip, setIp] = useState<Place | null>(null)     // IP-derived, no prompt
  const [ipDone, setIpDone] = useState(false)
  const [geoState, setGeoState] = useState<'idle' | 'asking' | 'granted' | 'denied'>('idle')
  const [sky, setSky] = useState<{ sky: Sky; place: string; text: string } | null>(null)
  const [, setTick] = useState(0)

  // keep a long-open tab honest about the time
  useEffect(() => {
    if (mode === 'off') return
    const id = setInterval(() => setTick(t => t + 1), 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [mode])

  // Where the visitor is, before anyone is asked anything
  useEffect(() => {
    if (mode !== 'weather' || ipDone) return
    let cancelled = false
    lookupIp().then(p => { if (!cancelled) { setIp(p); setIpDone(true) } })
    return () => { cancelled = true }
  }, [mode, ipDone])

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) { setGeoState('denied'); return }
    setGeoState('asking')
    navigator.geolocation.getCurrentPosition(
      pos => { setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }); setGeoState('granted') },
      () => setGeoState('denied'),
      { timeout: 8000, maximumAge: 10 * 60 * 1000 },
    )
  }, [])

  // Precise location wins, then IP, then Defne's city
  const located = coords !== null || ip !== null
  const origin = coords ?? ip ?? NYC
  const knownPlace = ip?.place || (coords ? '' : NYC.place)

  useEffect(() => {
    if (mode !== 'weather') { setSky(null); return }
    if (!ipDone && !coords) return   // wait for the IP lookup so we don't fetch twice
    const { lat, lon } = origin
    let cancelled = false
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,wind_speed_10m&timezone=auto`
    fetch(url)
      .then(r => r.json())
      .then(j => {
        if (cancelled || !j?.current) return
        setSky({
          sky: skyOf(j.current.weather_code, j.current.wind_speed_10m ?? 0),
          // the IP city is finer-grained than the timezone, so prefer it
          place: knownPlace || placeFrom(j.timezone),
          text: describe(j.current.weather_code),
        })
      })
      .catch(() => { /* fall through to the clock */ })
    return () => { cancelled = true }
  }, [mode, ipDone, coords, origin.lat, origin.lon, knownPlace])   // eslint-disable-line react-hooks/exhaustive-deps

  let ambient: Ambient | null = null
  if (mode === 'clock') ambient = fromClock()
  else if (mode === 'weather') {
    const p = periodOf()
    /* Null until the sky is actually known. Guessing with the clear column
       meant every load painted one colour and then snapped to another as the
       fetch returned; the caller shows the last remembered cell instead. */
    if (sky) ambient = { ...LOOKS[p][sky.sky], caption: `${SKY_LABEL[sky.sky]}, ${PERIOD_LABEL[p]}${sky.place ? ` in ${sky.place}` : ''}` }
  }

  // e.g. "partly cloudy in Brooklyn"
  const weatherText = sky ? `${sky.text}${sky.place ? ` in ${sky.place}` : ''}` : null

  return {
    ambient,
    /** the raw reading, so callers can show or override the live cell */
    sky,
    weatherText,
    requestLocation,
    geoState,
    /** true once we know where the visitor actually is, by IP or by permission */
    located,
    /** true only when they handed over precise coordinates */
    usingOwnLocation: coords !== null,
  }
}
