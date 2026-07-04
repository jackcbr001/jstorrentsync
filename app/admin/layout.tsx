import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — GameSync Pro' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
