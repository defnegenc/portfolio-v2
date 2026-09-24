/* The accent swatches are tuned against the black background. On the cream one
   the light tints (amber especially) fall apart as text and as a 2px border, so
   they get pulled down in lightness before they are used as --award. */

export function forLight(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16)
  let r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2
  if (max === min) return '#1A1918'
  const d = max - min
  const sat = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  h /= 6
  const L = 0.3, S = Math.min(1, sat * 1.15)
  const q = L < 0.5 ? L * (1 + S) : L + S - L * S, p = 2 * L - q
  const f = (t: number) => { t = ((t % 1) + 1) % 1; return t < 1/6 ? p + (q - p) * 6 * t : t < 1/2 ? q : t < 2/3 ? p + (q - p) * (2/3 - t) * 6 : p }
  r = f(h + 1/3); g = f(h); b = f(h - 1/3)
  return '#' + [r, g, b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('')
}

/* Project accents were picked against the cream background, so several of them
   (deep green, near-black) disappear on the dark one. forTheme keeps a colour
   inside a readable lightness band for whichever theme is showing: pulled down
   on cream, lifted on black. */
export function forTheme(hex: string, isLight: boolean) {
  if (isLight) return forLight(hex)
  const n = parseInt(hex.replace('#', ''), 16)
  let r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2
  if (max === min) return '#E8E6E0'          // greys become the theme ink
  const d = max - min
  const sat = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  h /= 6
  const L = Math.max(l, 0.66), S = Math.max(0.45, Math.min(1, sat))
  const q = L < 0.5 ? L * (1 + S) : L + S - L * S, p = 2 * L - q
  const f = (t: number) => { t = ((t % 1) + 1) % 1; return t < 1/6 ? p + (q - p) * 6 * t : t < 1/2 ? q : t < 2/3 ? p + (q - p) * (2/3 - t) * 6 : p }
  r = f(h + 1/3); g = f(h); b = f(h - 1/3)
  return '#' + [r, g, b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('')
}
