'use client'
import { formatBytes, formatDate } from '@/lib/format'

const StatCard = ({ label, value, sub, color, icon }: any) => (
  <div className={`stat-card ${color}`} style={{ flex: 1, minWidth: 160 }}>
    <div style={{ fontSize: 11, color: '#4a5f80', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 32, fontWeight: 800, color: '#e2eaff', lineHeight: 1, fontFamily: 'var(--font-syne)', marginBottom: 4 }}>
      {value ?? <span style={{ opacity: 0.3 }}>—</span>}
    </div>
    <div style={{ fontSize: 12, color: '#4a5f80' }}>{sub}</div>
    <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 32, opacity: 0.08 }}>{icon}</div>
  </div>
)

const LOG_COLOR: Record<string, string> = {
  INFO: '#4f6ef7', SUCCESS: '#00d68f', WARN: '#ffb020', ERROR: '#ff4d6d'
}

export default function AdminDashboard({ stats, games, onRefresh }: any) {
  const s = stats || {}

  return (
    <div style={{ padding: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#e2eaff', fontFamily: 'var(--font-syne)', letterSpacing: '-0.02em' }}>
            แดชบอร์ด
          </h1>
          <p style={{ fontSize: 13, color: '#4a5f80', marginTop: 3 }}>ภาพรวมระบบ GameSync Pro</p>
        </div>
        <button onClick={onRefresh} className="btn-ghost" style={{ fontSize: 12 }}>
          ↻ รีเฟรช
        </button>
      </div>

      {/* ── Expiry Alert Banner ── */}
      {((s.expiredClients ?? 0) > 0 || (s.expiringClients ?? 0) > 0) && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {(s.expiredClients ?? 0) > 0 && (
            <div style={{ flex: 1, minWidth: 220, padding: '14px 18px', borderRadius: 14, background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.25)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 28 }}>💀</span>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#ff4d6d', lineHeight: 1, fontFamily: 'var(--font-syne)' }}>{s.expiredClients} ร้าน</div>
                <div style={{ fontSize: 12, color: '#ff4d6d', opacity: 0.8, marginTop: 2 }}>หมดอายุแล้ว — รอต่ออายุ</div>
              </div>
            </div>
          )}
          {(s.expiringClients ?? 0) > 0 && (
            <div style={{ flex: 1, minWidth: 220, padding: '14px 18px', borderRadius: 14, background: 'rgba(255,176,32,0.08)', border: '1px solid rgba(255,176,32,0.25)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 28 }}>⏰</span>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#ffb020', lineHeight: 1, fontFamily: 'var(--font-syne)' }}>{s.expiringClients} ร้าน</div>
                <div style={{ fontSize: 12, color: '#ffb020', opacity: 0.8, marginTop: 2 }}>ใกล้หมดอายุภายใน 7 วัน</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard label="เกมทั้งหมด" value={s.games ?? 0} sub={`${s.categories ?? 0} หมวดหมู่`} color="plasma" icon="🎮" />
        <StatCard label="ร้านค้า" value={s.clients ?? 0} sub={`${s.activeClients ?? 0} ออนไลน์วันนี้`} color="jade" icon="🏪" />
        <StatCard label="กำลังดาวน์โหลด" value={s.activeDownloads ?? 0} sub="เครื่องลูกข่าย" color="pulse" icon="⬇" />
        <StatCard label="ดาวน์โหลดรวม" value={games.reduce((a: number, g: any) => a + (g.downloadCount || 0), 0)} sub="ครั้งทั้งหมด" color="amber" icon="📊" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Top Games */}
        <div style={{ background: '#131825', border: '1px solid #1f2a3d', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1f2a3d', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>🏆</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#c8d4f0' }}>เกมยอดนิยม</span>
          </div>
          {!s.topGames?.length ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#4a5f80', fontSize: 13 }}>ยังไม่มีข้อมูล</div>
          ) : (
            s.topGames.map((g: any, i: number) => (
              <div key={g.id} style={{
                padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12,
                borderBottom: i < s.topGames.length - 1 ? '1px solid #131825' : 'none'
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 11, fontWeight: 800,
                  background: i === 0 ? 'rgba(255,176,32,0.15)' : 'rgba(42,55,80,0.5)',
                  color: i === 0 ? '#ffb020' : '#4a5f80'
                }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#c8d4f0', fontWeight: 600 }}>{g.name}</div>
                  <div style={{ fontSize: 11, color: '#4a5f80' }}>{g.category?.icon} {g.category?.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#4f6ef7' }}>{g.downloadCount}</div>
                  <div style={{ fontSize: 10, color: '#4a5f80' }}>ครั้ง</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent Activity */}
        <div style={{ background: '#131825', border: '1px solid #1f2a3d', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1f2a3d', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>📋</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#c8d4f0' }}>กิจกรรมล่าสุด</span>
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {!s.recentLogs?.length ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#4a5f80', fontSize: 13 }}>ยังไม่มีกิจกรรม</div>
            ) : (
              s.recentLogs.map((log: any) => (
                <div key={log.id} style={{
                  padding: '10px 20px', display: 'flex', gap: 10, alignItems: 'flex-start',
                  borderBottom: '1px solid #0e1118', transition: 'background 0.1s'
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%', background: LOG_COLOR[log.status] || '#4a5f80',
                    marginTop: 5, flexShrink: 0
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: '#c8d4f0', lineHeight: 1.4 }}>{log.message}</div>
                    <div style={{ fontSize: 11, color: '#4a5f80', marginTop: 2 }}>
                      🏪 {log.client?.shopName} · {log.game?.name}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: '#3a4d6a', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                    {new Date(log.createdAt).toLocaleTimeString('th-TH')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sync Status Summary */}
      {s.syncSummary?.length > 0 && (
        <div style={{ marginTop: 16, background: '#131825', border: '1px solid #1f2a3d', borderRadius: 16, padding: '16px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#c8d4f0', marginBottom: 14 }}>สรุปสถานะซิงค์</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {s.syncSummary.map((s: any) => {
              const colors: Record<string, [string, string]> = {
                COMPLETED: ['#00d68f', 'rgba(0,214,143,0.12)'],
                DOWNLOADING: ['#4f6ef7', 'rgba(79,110,247,0.12)'],
                PAUSED: ['#ffb020', 'rgba(255,176,32,0.12)'],
                ERROR: ['#ff4d6d', 'rgba(255,77,109,0.12)'],
                UP_TO_DATE: ['#00d68f', 'rgba(0,214,143,0.08)'],
                PENDING: ['#4a5f80', 'rgba(42,55,80,0.3)'],
              }
              const [color, bg] = colors[s.status] || ['#4a5f80', 'rgba(42,55,80,0.3)']
              return (
                <div key={s.status} style={{ padding: '8px 14px', borderRadius: 10, background: bg, border: `1px solid ${color}33` }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{s._count.status}</div>
                  <div style={{ fontSize: 10, color, marginTop: 2, fontWeight: 600 }}>{s.status}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
