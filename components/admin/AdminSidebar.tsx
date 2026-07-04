'use client'
import { AdminView } from '@/app/admin/page'

const ICON = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  games: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  clients: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  categories: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
  ),
  logs: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
}

const NAV: { id: AdminView; label: string }[] = [
  { id: 'dashboard', label: 'แดชบอร์ด' },
  { id: 'games',     label: 'จัดการเกม' },
  { id: 'clients',   label: 'ร้านค้า' },
  { id: 'categories',label: 'หมวดหมู่' },
  { id: 'logs',      label: 'ประวัติ' },
]

export default function AdminSidebar({
  view, onNavigate, stats
}: { view: AdminView; onNavigate: (v: AdminView) => void; stats: any }) {
  return (
    <aside style={{
      width: 220, background: '#0e1118', borderRight: '1px solid #1f2a3d',
      display: 'flex', flexDirection: 'column', height: '100vh', flexShrink: 0
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #1f2a3d' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #4f6ef7, #a259ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 4px 12px rgba(79,110,247,0.4)'
          }}>🎮</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e2eaff', letterSpacing: '-0.02em' }}>GameSync</div>
            <div style={{ fontSize: 11, color: '#4f6ef7', fontWeight: 600 }}>PRO ADMIN</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 8px', flex: 1 }}>
        {NAV.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`nav-item ${view === id ? 'active' : ''}`}
            style={{ width: '100%', marginBottom: 2, border: view === id ? undefined : 'none', cursor: 'pointer' }}
          >
            <span style={{ opacity: view === id ? 1 : 0.6 }}>{ICON[id]}</span>
            {label}
            {id === 'games' && stats?.games > 0 && (
              <span style={{
                marginLeft: 'auto', fontSize: 11, fontWeight: 700,
                background: 'rgba(79,110,247,0.15)', color: '#4f6ef7',
                padding: '1px 7px', borderRadius: 99
              }}>{stats.games}</span>
            )}
            {id === 'clients' && ((stats?.expiredClients ?? 0) + (stats?.expiringClients ?? 0)) > 0 && (
              <span style={{
                marginLeft: 'auto', fontSize: 11, fontWeight: 700,
                background: stats?.expiredClients > 0 ? 'rgba(255,77,109,0.2)' : 'rgba(255,176,32,0.2)',
                color: stats?.expiredClients > 0 ? '#ff4d6d' : '#ffb020',
                padding: '1px 7px', borderRadius: 99,
              }}>
                {(stats?.expiredClients ?? 0) + (stats?.expiringClients ?? 0)}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Stats footer */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid #1f2a3d' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: '#4a5f80' }}>ร้านออนไลน์</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#00d68f' }}>{stats?.activeClients ?? 0}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: '#4a5f80' }}>กำลังโหลด</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#4f6ef7' }}>{stats?.activeDownloads ?? 0}</span>
        </div>
        {(stats?.expiredClients ?? 0) > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: '#4a5f80' }}>💀 หมดอายุ</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#ff4d6d' }}>{stats.expiredClients}</span>
          </div>
        )}
        {(stats?.expiringClients ?? 0) > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: '#4a5f80' }}>⚠️ ใกล้หมด</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#ffb020' }}>{stats.expiringClients}</span>
          </div>
        )}
        <div style={{ marginTop: 12, padding: '8px 10px', borderRadius: 8, background: '#131825', border: '1px solid #1f2a3d' }}>
          <div style={{ fontSize: 10, color: '#4a5f80', marginBottom: 2 }}>Client Login URL</div>
          <div style={{ fontSize: 11, color: '#4f6ef7', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
            /client
          </div>
        </div>
      </div>
    </aside>
  )
}
