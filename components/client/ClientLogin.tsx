'use client'

import { useState } from 'react'

export default function ClientLogin({ onLogin }: { onLogin: (data: any) => void }) {
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const press = (k: string) => {
    if (k === 'del') { setPin(p => p.slice(0, -1)); setError(''); return }
    if (pin.length >= 8) return
    setPin(p => p + k)
    setError('')
  }

  const login = async () => {
    if (!pin) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/clients/auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinCode: pin })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'ผิดพลาด'); setPin(''); return }
      onLogin(data)
    } catch { setError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้') } finally { setLoading(false) }
  }

  const KEYS = ['1','2','3','4','5','6','7','8','9','','0','del']

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#080a10', position: 'relative', overflow: 'hidden'
    }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,110,247,0.08) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />

      <div style={{
        background: 'rgba(19,24,37,0.9)', border: '1px solid #1f2a3d', borderRadius: 24,
        padding: '40px 36px', width: 340, textAlign: 'center',
        backdropFilter: 'blur(20px)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #4f6ef7, #a259ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, boxShadow: '0 8px 24px rgba(79,110,247,0.5)'
          }}>🎮</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#e2eaff', fontFamily: 'var(--font-syne)', letterSpacing: '-0.02em' }}>GameSync Pro</div>
          <div style={{ fontSize: 13, color: '#4a5f80', marginTop: 4 }}>กรอกรหัส PIN ของร้าน</div>
        </div>

        {/* PIN display */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              width: 26, height: 26, borderRadius: 50, border: '2px solid',
              borderColor: i < pin.length ? '#4f6ef7' : '#1f2a3d',
              background: i < pin.length ? '#4f6ef7' : 'transparent',
              transition: 'all 0.2s',
              boxShadow: i < pin.length ? '0 0 8px rgba(79,110,247,0.5)' : 'none'
            }} />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: 16, padding: '8px 14px', borderRadius: 10, background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.2)', color: '#ff4d6d', fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* Keypad */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          {KEYS.map((k, i) => (
            <button key={i} onClick={() => k && press(k)} disabled={!k} style={{
              height: 52, borderRadius: 12, fontSize: k === 'del' ? 18 : 20, fontWeight: 700, cursor: k ? 'pointer' : 'default',
              background: k === 'del' ? 'rgba(255,77,109,0.1)' : k ? '#192033' : 'transparent',
              border: k === 'del' ? '1px solid rgba(255,77,109,0.2)' : k ? '1px solid #1f2a3d' : 'none',
              color: k === 'del' ? '#ff4d6d' : '#c8d4f0',
              transition: 'all 0.15s', opacity: k ? 1 : 0,
              fontFamily: 'var(--font-mono)'
            }} onMouseEnter={e => k && ((e.target as any).style.background = k === 'del' ? 'rgba(255,77,109,0.2)' : '#1f2a3d')}
              onMouseLeave={e => k && ((e.target as any).style.background = k === 'del' ? 'rgba(255,77,109,0.1)' : '#192033')}>
              {k === 'del' ? '⌫' : k}
            </button>
          ))}
        </div>

        <button onClick={login} disabled={loading || pin.length < 4} className="btn-primary" style={{ width: '100%', justifyContent: 'center', height: 48, fontSize: 15 }}>
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </div>
    </div>
  )
}
