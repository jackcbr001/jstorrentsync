import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'TorrentSync',
  description: 'File synchronization powered by WebTorrent',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${inter.variable} ${mono.variable}`}>
      <body className="bg-[#0d0f14] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  )
}
