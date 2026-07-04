'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatBytes, formatDate } from '@/lib/format'

type Method = 'TORRENT' | 'FTP'

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'รอ', ANALYZING: 'กำลังวิเคราะห์', DOWNLOADING: 'กำลังโหลด',
  PAUSED: 'หยุด', COMPLETED: 'เสร็จแล้ว', ERROR: 'ผิดพลาด', UP_TO_DATE: 'อัพเดทแล้ว'
}
const STATUS_CLASS: Record<string, string> = {
  PENDING: 'badge-pending', ANALYZING: 'badge-analyzing', DOWNLOADING: 'badge-downloading',
  PAUSED: 'badge-paused', COMPLETED: 'badge-completed', ERROR: 'badge-error', UP_TO_DATE: 'badge-up-to-date'
}

export default function ClientGameList({ session, onLogout }: any) {
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expiredInfo, setExpiredInfo] = useState<any>(null)   // non-null = locked out
  const [filterCat, setFilterCat] = useState('all')
  const [search, setSearch] = useState('')
  const [methods, setMethods] = useState<Record<string, Method>>({})
  const [analyzing, setAnalyzing] = useState<Set<string>>(new Set())
  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set())

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.token}`
  }

  // Central 403/EXPIRED handler
  const handleExpiry = (data: any) => {
    if (data?.code === 'EXPIRED' || data?.code === 'DISABLED') {
      setExpiredInfo(data)
      return true
    }
    return false
  }

  const fetchGames = useCallback(async () => {
    const res = await fetch('/api/clients/games', { headers })
    if (res.status === 403) {
      const data = await res.json()
      handleExpiry(data)
      setLoading(false)
      return
    }
    if (res.ok) setGames(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchGames()
    const t = setInterval(fetchGames, 6000)
    return () => clearInterval(t)
  }, [fetchGames])

  // ── Expired lockout screen ────────────────────────
  if (expiredInfo) {
    const isDisabled = expiredInfo.code === 'DISABLED'
    return (
      <div style={{ minHeight: '100vh', background: '#080a10', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
        {/* Radial bg glow */}
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,77,109,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ background: '#131825', border: '1px solid rgba(255,77,109,0.3)', borderRadius: 24, padding: '40px 44px', maxWidth: 440, width: '100%', textAlign: 'center', boxShadow: '0 0 60px rgba(255,77,109,0.1)' }}>
          {/* Icon */}
          <div style={{ width: 80, height: 80, borderRadius: 20, margin: '0 auto 24px', background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
            {isDisabled ? '🚫' : '🔒'}
          </div>

          <div style={{ fontSize: 22, fontWeight: 800, color: '#ff4d6d', fontFamily: 'var(--font-syne)', marginBottom: 8 }}>
            {isDisabled ? 'บัญชีถูกปิดใช้งาน' : 'สมาชิกหมดอายุแล้ว'}
          </div>

          <div style={{ fontSize: 14, color: '#7a8fb8', lineHeight: 1.6, marginBottom: 24 }}>
            {isDisabled
              ? 'บัญชีร้านค้านี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ'
              : <>
                  สิทธิ์การใช้งานของ <strong style={{ color: '#c8d4f0' }}>{expiredInfo.shopName || session.client?.shopName}</strong> หมดอายุแล้ว
                  {expiredInfo.expiredDaysAgo > 0 && (
                    <> (<span style={{ color: '#ff4d6d' }}>{expiredInfo.expiredDaysAgo} วันที่แล้ว</span>)</>
                  )}
                  <br />กรุณาติดต่อผู้ดูแลระบบเพื่อต่ออายุสมาชิก
                </>
            }
          </div>

          {/* Expired date */}
          {expiredInfo.expiresAt && (
            <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.2)', marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: '#4a5f80', marginBottom: 4 }}>วันหมดอายุ</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#ff4d6d', fontFamily: 'var(--font-mono)' }}>
                {new Date(expiredInfo.expiresAt).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          )}

          {/* What's blocked */}
          <div style={{ textAlign: 'left', marginBottom: 28 }}>
            {['วิเคราะห์ไฟล์เกม', 'ดาวน์โหลดผ่าน Torrent', 'ดาวน์โหลดผ่าน FTP', 'ซิงค์อัพเดทไฟล์'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid #1f2a3d' }}>
                <span style={{ fontSize: 14, color: '#ff4d6d' }}>✕</span>
                <span style={{ fontSize: 13, color: '#4a5f80', textDecoration: 'line-through' }}>{item}</span>
              </div>
            ))}
          </div>

          <button onClick={onLogout} className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
            ← ออกจากระบบ
          </button>
        </div>
      </div>
    )
  }

  const categories = [...new Map(games.map(g => [g.categoryId, { id: g.categoryId, name: g.categoryName, icon: g.categoryIcon }])).values()]

  const filtered = games.filter(g => {
    const matchCat = filterCat === 'all' || g.categoryId === filterCat
    const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const setAction = (id: string, add: boolean) =>
    setActionLoading(s => { const n = new Set(s); add ? n.add(id) : n.delete(id); return n })

  // ── Analyze ──────────────────────────────────────
  const analyze = async (game: any) => {
    setAnalyzing(s => new Set(s).add(game.id))
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST', headers,
        body: JSON.stringify({ gameId: game.id, localVersion: game.syncStatus?.localVersion })
      })
      const data = await res.json()
      if (res.status === 403 && handleExpiry(data)) return
      await fetchGames()
      if (!data.needsUpdate) {
        alert(`✅ "${game.name}" อัพเดทแล้ว (v${data.serverVersion})`)
      } else {
        alert(`⚠️ "${game.name}" ต้องอัพเดท: v${data.localVersion || 'ไม่มี'} → v${data.serverVersion}`)
      }
    } finally {
      setAnalyzing(s => { const n = new Set(s); n.delete(game.id); return n })
    }
  }

  // ── Start download ───────────────────────────────
  const startDownload = async (game: any) => {
    const method = methods[game.id] || (game.hasMagnet ? 'TORRENT' : 'FTP')
    setAction(game.id, true)
    try {
      const res = await fetch('/api/download', {
        method: 'POST', headers,
        body: JSON.stringify({ gameId: game.id, action: 'start', method })
      })
      const data = await res.json()
      if (res.status === 403 && handleExpiry(data)) return
      if (!res.ok) { alert(data.error); return }

      await fetchGames()

      if (method === 'TORRENT' && data.game?.magnetLink) {
        simulateProgress(game.id, method)
      } else if (method === 'FTP' && data.game?.ftpPath) {
        simulateProgress(game.id, method)
      } else {
        alert('ไม่พบ link สำหรับดาวน์โหลด กรุณาติดต่อแอดมิน')
        await fetch('/api/download', { method: 'POST', headers, body: JSON.stringify({ gameId: game.id, action: 'error', method }) })
      }
    } finally { setAction(game.id, false) }
  }

  // Simulate download progress (in production: real WebTorrent/FTP)
  const simulateProgress = async (gameId: string, method: string) => {
    let p = 0
    const interval = setInterval(async () => {
      p += Math.random() * 0.05
      if (p >= 1) {
        p = 1; clearInterval(interval)
        await fetch('/api/download', { method: 'POST', headers, body: JSON.stringify({ gameId, action: 'complete', method, progress: 1 }) })
        await fetchGames()
        return
      }
      await fetch('/api/download', { method: 'POST', headers, body: JSON.stringify({ gameId, action: 'progress', method, progress: p, downloadSpeed: Math.random() * 10_000_000 }) })
      await fetchGames()
    }, 2000)
  }

  // ── Pause ────────────────────────────────────────
  const pause = async (game: any) => {
    const method = methods[game.id] || 'TORRENT'
    await fetch('/api/download', { method: 'POST', headers, body: JSON.stringify({ gameId: game.id, action: 'pause', method }) })
    await fetchGames()
  }

  // ── Stop ─────────────────────────────────────────
  const stop = async (game: any) => {
    const method = methods[game.id] || 'TORRENT'
    await fetch('/api/download', { method: 'POST', headers, body: JSON.stringify({ gameId: game.id, action: 'stop', method }) })
    await fetchGames()
  }

  // ── Manual sync ──────────────────────────────────
  const manualSync = async (game: any) => {
    await analyze(game)
    const g = games.find(x => x.id === game.id)
    if (g?.syncStatus?.status === 'PENDING') await startDownload(game)
  }

  const getMethod = (game: any): Method => methods[game.id] || (game.hasMagnet ? 'TORRENT' : 'FTP')

  return (
    <div style={{ minHeight: '100vh', background: '#080a10' }}>
      {/* Top bar */}
      <div style={{
        background: '#0e1118', borderBottom: '1px solid #1f2a3d', padding: '0 24px',
        display: 'flex', alignItems: 'center', gap: 16, height: 60, position: 'sticky', top: 0, zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 24 }}>🎮</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#e2eaff', fontFamily: 'var(--font-syne)' }}>GameSync</div>
            <div style={{ fontSize: 11, color: '#4a5f80' }}>ระบบอัพเดทเกม</div>
          </div>
        </div>
        <div style={{ height: 24, width: 1, background: '#1f2a3d', margin: '0 4px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d68f' }} className="ping-dot" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#00d68f' }}>🏪 {session.client?.shopName}</span>
        </div>
        <div style={{ flex: 1 }} />
        <input className="input" style={{ width: 200, fontSize: 12, height: 36 }} placeholder="🔍 ค้นหาเกม..." value={search} onChange={e => setSearch(e.target.value)} />
        <button onClick={onLogout} className="btn-ghost" style={{ height: 36, fontSize: 12 }}>ออกจากระบบ</button>
      </div>

      <div style={{ padding: 24 }}>
        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <button onClick={() => setFilterCat('all')} style={{
            padding: '7px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            background: filterCat === 'all' ? 'rgba(79,110,247,0.15)' : 'rgba(42,55,80,0.3)',
            color: filterCat === 'all' ? '#4f6ef7' : '#4a5f80',
            border: filterCat === 'all' ? '1px solid rgba(79,110,247,0.3)' : '1px solid #1f2a3d'
          }}>ทั้งหมด ({games.length})</button>
          {categories.map(c => {
            const count = games.filter(g => g.categoryId === c.id).length
            const active = filterCat === c.id
            return (
              <button key={c.id} onClick={() => setFilterCat(c.id)} style={{
                padding: '7px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: active ? 'rgba(79,110,247,0.15)' : 'rgba(42,55,80,0.3)',
                color: active ? '#4f6ef7' : '#4a5f80',
                border: active ? '1px solid rgba(79,110,247,0.3)' : '1px solid #1f2a3d', transition: 'all 0.2s'
              }}>{c.icon} {c.name} ({count})</button>
            )
          })}
        </div>

        {/* Game list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#4a5f80', fontSize: 14 }}>กำลังโหลดรายการเกม...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: 60, color: '#4a5f80', fontSize: 14 }}>ไม่พบเกม</div>
            )}
            {filtered.map(game => {
              const sync = game.syncStatus
              const status = sync?.status || 'PENDING'
              const progress = sync?.progress || 0
              const method = getMethod(game)
              const isAnalyzing = analyzing.has(game.id)
              const isLoading = actionLoading.has(game.id)
              const isDownloading = status === 'DOWNLOADING'
              const isPaused = status === 'PAUSED'
              const isDone = status === 'COMPLETED' || status === 'UP_TO_DATE'

              return (
                <div key={game.id} style={{
                  background: '#131825', border: '1px solid #1f2a3d', borderRadius: 16, padding: '16px 20px',
                  transition: 'border-color 0.2s', display: 'flex', gap: 16, alignItems: 'flex-start'
                }}>
                  {/* Game icon */}
                  <div style={{
                    width: 52, height: 52, borderRadius: 12, background: '#1f2a3d', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                    border: '1px solid #2a3750'
                  }}>{game.coverImage || '🎮'}</div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#c8d4f0' }}>{game.name}</span>
                      <span style={{ fontSize: 11, color: '#4a5f80', fontFamily: 'var(--font-mono)' }}>v{game.version}</span>
                      <span className={`badge ${STATUS_CLASS[status]}`}>{STATUS_LABEL[status]}</span>
                      <span style={{ fontSize: 11, color: '#4a5f80' }}>{game.categoryIcon} {game.categoryName}</span>
                    </div>

                    {game.description && (
                      <div style={{ fontSize: 12, color: '#4a5f80', marginBottom: 8, lineHeight: 1.5 }}>{game.description}</div>
                    )}

                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#4a5f80', marginBottom: isDownloading ? 10 : 0 }}>
                      <span>💾 {formatBytes(game.sizeBytes)}</span>
                      {sync?.lastSynced && <span>🕐 ซิงค์ล่าสุด: {formatDate(sync.lastSynced)}</span>}
                      {sync?.localVersion && <span>📦 local: v{sync.localVersion}</span>}
                    </div>

                    {/* Progress bar */}
                    {(isDownloading || isPaused) && (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11, color: '#4a5f80' }}>
                          <span>{isDownloading ? '⬇ กำลังดาวน์โหลด...' : '⏸ หยุดชั่วคราว'}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', color: method === 'FTP' ? '#a259ff' : '#4f6ef7' }}>
                            {(progress * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="progress-track" style={{ height: 6 }}>
                          <div className={method === 'FTP' ? 'progress-fill-ftp' : 'progress-fill-torrent'}
                            style={{ height: 6, width: `${progress * 100}%` }} />
                        </div>
                        {sync?.downloadSpeed > 0 && (
                          <div style={{ fontSize: 11, color: '#4a5f80', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                            ⬇ {(sync.downloadSpeed / 1024 / 1024).toFixed(1)} MB/s · {method === 'FTP' ? '🔗 FTP' : '⚡ Torrent'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right controls */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, alignItems: 'flex-end' }}>
                    {/* Method toggle */}
                    {!isDownloading && !isDone && (
                      <div style={{ display: 'flex', gap: 4, background: '#0e1118', borderRadius: 10, padding: 4, border: '1px solid #1f2a3d' }}>
                        {game.hasMagnet && (
                          <button
                            className={`method-btn ${method === 'TORRENT' ? 'active-torrent' : ''}`}
                            onClick={() => setMethods(m => ({ ...m, [game.id]: 'TORRENT' }))}
                          >⚡ Torrent</button>
                        )}
                        {game.hasFtp && (
                          <button
                            className={`method-btn ${method === 'FTP' ? 'active-ftp' : ''}`}
                            onClick={() => setMethods(m => ({ ...m, [game.id]: 'FTP' }))}
                          >🔗 FTP</button>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      {/* Analyze */}
                      {!isDownloading && (
                        <button onClick={() => analyze(game)} disabled={isAnalyzing || isLoading} className="btn-ghost" style={{ padding: '7px 14px', fontSize: 12, minWidth: 80 }}>
                          {isAnalyzing ? '...' : '🔍 วิเคราะห์'}
                        </button>
                      )}

                      {/* Start / Pause / Stop / Manual */}
                      {!isDownloading && !isPaused && !isDone && (
                        <button onClick={() => startDownload(game)} disabled={isLoading || isAnalyzing} className="btn-primary" style={{ padding: '7px 14px', fontSize: 12, minWidth: 80 }}>
                          {isLoading ? '...' : '▶ อัพเดท'}
                        </button>
                      )}

                      {isPaused && (
                        <>
                          <button onClick={() => startDownload(game)} className="btn-primary" style={{ padding: '7px 14px', fontSize: 12 }}>▶ ต่อ</button>
                          <button onClick={() => stop(game)} className="btn-ghost" style={{ padding: '7px 14px', fontSize: 12 }}>■ หยุด</button>
                        </>
                      )}

                      {isDownloading && (
                        <>
                          <button onClick={() => pause(game)} className="btn-ghost" style={{ padding: '7px 14px', fontSize: 12, color: '#ffb020', borderColor: 'rgba(255,176,32,0.3)' }}>⏸ หยุด</button>
                          <button onClick={() => stop(game)} className="btn-danger" style={{ padding: '7px 14px', fontSize: 12 }}>■ ยกเลิก</button>
                        </>
                      )}

                      {isDone && (
                        <button onClick={() => manualSync(game)} className="btn-ghost" style={{ padding: '7px 14px', fontSize: 12, color: '#00d68f', borderColor: 'rgba(0,214,143,0.3)' }}>
                          ↻ ซิงค์ใหม่
                        </button>
                      )}
                    </div>

                    {/* Manual update note */}
                    {!isDownloading && !isDone && (
                      <button onClick={() => manualSync(game)} style={{ fontSize: 11, color: '#4a5f80', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                        อัพเดทแบบ Manual
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
