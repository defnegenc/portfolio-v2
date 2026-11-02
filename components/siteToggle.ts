/* The CLI <> GUI switch comes in pairs: each design has a terminal version on
   the CLI side and a Xerox Star version on the GUI side. Picked from Options on
   localhost (?g=), remembered in this browser so the other side matches. */
export type ToggleStyle = 'sheet' | 'radio' | 'keys' | 'icons'
export const TOGGLES: { key: ToggleStyle; label: string }[] = [
  { key: 'sheet', label: 'Property sheet' }, { key: 'radio', label: 'Radio' }, { key: 'keys', label: 'Keys' }, { key: 'icons', label: 'Icons' },
]
export function readToggle(): ToggleStyle {
  const q = new URLSearchParams(window.location.search).get('g') as ToggleStyle | null
  const v = q ?? (window.localStorage.getItem('toggle-style') as ToggleStyle | null)
  return TOGGLES.some(t => t.key === v) ? (v as ToggleStyle) : 'sheet'
}
export function saveToggle(v: ToggleStyle) { try { window.localStorage.setItem('toggle-style', v) } catch {} }
