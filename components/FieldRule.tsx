'use client'

/* A short band of the field, used between sections on small screens in place of
   a hairline. On a phone the page is one column of text with the field at the
   top; repeating a sliver of it between sections ties the page together in a
   way a 1px rule cannot. Hidden on desktop, where the hairline is enough. */

import AsciiCanvas, { type Motion, type Hover, type Render } from '@/components/AsciiCanvas'

export default function FieldRule({
  render = 'tiles', motion = 'brush', hover = 'mono', color, lightMode,
}: {
  render?: Render; motion?: Motion; hover?: Hover; color?: string; lightMode?: boolean
}) {
  return (
    <div className="field-rule" aria-hidden>
      <style>{`
        .field-rule { display: none; }
        @media (max-width: 860px) {
          .field-rule { display: block; position: relative; height: 64px; margin: 0.2rem 0 1.1rem; }
        }
      `}</style>
      <AsciiCanvas render={render} motion={motion} hover={hover} lightMode={lightMode} chars="▓▒░" color={color} rest={0.34} />
    </div>
  )
}
