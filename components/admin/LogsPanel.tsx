'use client'
import { useState, useEffect } from 'react'

const LOG_COLOR: Record<string, string> = { INFO: '#4f6ef7', SUCCESS: '#00d68f', WARN: '#ffb020', ERROR: '#ff4d6d' }

export default function LogsPanel() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = async () => {
    const res = await fetch('/api/settings/stats')
    if (res.ok) { const d = await res.json(); setLogs(d.recentLogs || []) }
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()
    const t = setInterval(fetchLogs, 6000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#e2eaff', fontFamily: 'var(--font-syne)' }}>ประวัติกิจกรรม</h1>
          <p style={{ fontSize: 13, color: '#4a5f80', marginTop: 2 }}>{logs.length} รายการล่าสุด</p>
        </div>
        <button onClick={fetchLogs} className="btn-ghost">↻ รีเฟรช</button>
      </div>
      <div style={{ background: '#131825', border: '1px solid #1f2a3d', borderRadius: 16, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr><th>ระดับ</th><th>ร้าน</th><th>เกม</th><th>ข้อความ</th><th>วิธี</th><th>เวลา</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#4a5f80' }}>กำลังโหลด...</td></tr>}
            {!loading && logs.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#4a5f80' }}>ยังไม่มีประวัติ</td></tr>
            )}
            {logs.map((l: any) => (
              <tr key={l.id}>
                <td>
                  <span style={{ fontSize: 11, fontWeight: 700, color: LOG_COLOR[l.status] || '#7a8fb8',
                    background: `${LOG_COLOR[l.status] || '#7a8fb8'}15`, padding: '3px 8px', borderRadius: 6 }}>
                    {l.status}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: '#7a8fb8' }}>🏪 {l.client?.shopName || '—'}</td>
                <td style={{ fontSize: 12, color: '#7a8fb8' }}>{l.game?.name || '—'}</td>
                <td style={{ fontSize: 12, color: '#c8d4f0', maxWidth: 300 }}>{l.message}</td>
                <td>
                  <span style={{ fontSize: 11, fontWeight: 600, color: l.method === 'FTP' ? '#a259ff' : '#4f6ef7' }}>
                    {l.method === 'FTP' ? '🔗 FTP' : '⚡ TORRENT'}
                  </span>
                </td>
                <td style={{ fontSize: 11, color: '#4a5f80', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                  {new Date(l.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
