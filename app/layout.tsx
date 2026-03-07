import type { Metadata } from 'next'
import { Fragment_Mono } from 'next/font/google'
import './globals.css'

const fragmentMono = Fragment_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Defne Genç',
  description: 'Stanford HCI · APM @ Coinbase · Designer',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={fragmentMono.variable}>{children}</body>
    </html>
  )
}
