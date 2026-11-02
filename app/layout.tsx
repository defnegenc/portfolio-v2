import type { Metadata } from 'next'
import { Fragment_Mono } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import './globals.css'

const fragmentMono = Fragment_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono',
})

// the live site, so link previews point at real files (not localhost)
const base = new URL('https://defne.io')

export const metadata: Metadata = {
  metadataBase: base,
  title: "Defne's Portfolio",
  description: 'Stanford HCI · AI Platform @ Coinbase · Designer',
  icons: { icon: '/favicon.svg', apple: '/apple-icon.png' },
  openGraph: {
    title: "Defne's Portfolio",
    description: 'Stanford HCI · AI Platform @ Coinbase · Designer',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${fragmentMono.variable} ${GeistSans.variable}`}>{children}</body>
    </html>
  )
}
