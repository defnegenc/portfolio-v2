/* Vanta ships no types. Each effect module default-exports a factory taking an
   options bag and returning a handle with destroy(). */
declare module 'vanta/dist/vanta.net.min' {
  const fx: (o: Record<string, unknown>) => { destroy: () => void }
  export default fx
}
declare module 'vanta/dist/vanta.fog.min' {
  const fx: (o: Record<string, unknown>) => { destroy: () => void }
  export default fx
}
declare module 'vanta/dist/vanta.topology.min' {
  const fx: (o: Record<string, unknown>) => { destroy: () => void }
  export default fx
}
declare module 'vanta/dist/vanta.dots.min' {
  const fx: (o: Record<string, unknown>) => { destroy: () => void }
  export default fx
}
