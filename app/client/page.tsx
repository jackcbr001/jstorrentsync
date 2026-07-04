'use client'

import { useState, useEffect, useCallback } from 'react'
import ClientLogin from '@/components/client/ClientLogin'
import ClientGameList from '@/components/client/ClientGameList'

export default function ClientPage() {
  const [session, setSession] = useState<any>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('client_session')
    if (stored) {
      try { setSession(JSON.parse(stored)) } catch {}
    }
    setChecking(false)
  }, [])

  const onLogin = (data: any) => {
    localStorage.setItem('client_session', JSON.stringify(data))
    setSession(data)
  }

  const onLogout = () => {
    localStorage.removeItem('client_session')
    setSession(null)
    // Clear cookie
    fetch('/api/clients/auth', { method: 'DELETE' }).catch(() => {})
  }

  if (checking) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080a10' }}>
      <div style={{ fontSize: 14, color: '#4a5f80' }}>กำลังตรวจสอบ...</div>
    </div>
  )

  if (!session) return <ClientLogin onLogin={onLogin} />
  return <ClientGameList session={session} onLogout={onLogout} />
}
