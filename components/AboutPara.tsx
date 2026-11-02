import { ABOUT_LINKS } from '@/components/aboutContent'

/* one About paragraph. [GUI] and [CLI] link to the other side of the site;
   `side` is the side you're on, whose own word stays plain. */
export default function AboutPara({ text, style, className, side = 'cli' }: { text: string; style?: React.CSSProperties; className?: string; side?: 'cli' | 'gui' }) {
  const parts = text.split(/\[([^\]]+)\]/)
  return (
    <p style={style} className={className}>
      {parts.map((part, i) => {
        if (i % 2 === 0) return part
        const here = part.toLowerCase() === side
        return here || !ABOUT_LINKS[part]
          ? part
          : <a key={i} href={ABOUT_LINKS[part]} style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '0.2em' }}>{part}</a>
      })}
    </p>
  )
}
