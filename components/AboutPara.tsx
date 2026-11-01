import { ABOUT_LINK } from '@/components/aboutContent'

// one About paragraph, with its [bracketed] phrase as a link
export default function AboutPara({ text, style, className }: { text: string; style?: React.CSSProperties; className?: string }) {
  const parts = text.split(/\[([^\]]+)\]/)
  return (
    <p style={style} className={className}>
      {parts.map((part, i) => (i % 2
        ? <a key={i} href={ABOUT_LINK} style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '0.2em' }}>{part}</a>
        : part))}
    </p>
  )
}
