import type { Metadata } from 'next'
import { Fragment_Mono } from 'next/font/google'
import './globals.css'

const fragmentMono = Fragment_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono',
})

const base = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
  : new URL('http://localhost:3000')

export const metadata: Metadata = {
  metadataBase: base,
  title: 'Defne Genç',
  description: 'Stanford HCI · APM @ Coinbase · Designer',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Defne Genç',
    description: 'Stanford HCI · APM @ Coinbase · Designer',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={fragmentMono.variable}>{children}</body>
    </html>
  )
}
