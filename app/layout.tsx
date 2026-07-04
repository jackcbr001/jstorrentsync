import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GameSync Pro',
  description: 'Game File Synchronization System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}
