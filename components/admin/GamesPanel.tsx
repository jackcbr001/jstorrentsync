'use client'

import { useState } from 'react'
import { formatBytes } from '@/lib/format'

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'badge-active', MAINTENANCE: 'badge-maintenance', DISABLED: 'badge-error'
}
const STATUS_LABEL: Record<string, string> = { ACTIVE: 'ใช้งาน', MAINTENANCE: 'บำรุง', DISABLED: 'ปิด' }

export default function GamesPanel({ games, categories, onRefresh }: any) {
  const [filterCat, setFilterCat] = useState('all')
  const [modal, setModal] = useState<{ open: boolean; game?: any }>({ open: false })
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = games.filter((g: any) => {
    const matchCat = filterCat === 'all' || g.categoryId === filterCat
    const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const openAdd = () => {
    setForm({ version: '1.0.0', status: 'ACTIVE', downloadMethod: 'TORRENT' })
    setModal({ open: true })
  }
  const openEdit = (g: any) => {
    setForm({ ...g })
    setModal({ open: true, game: g })
  }

  const save = async () => {
    if (!form.name || !form.categoryId || !form.serverPath) {
      alert('กรุณากรอก ชื่อเกม, หมวดหมู่, และ Server Path')
      return
    }
    setSaving(true)
    try {
      const method = modal.game ? 'PUT' : 'POST'
      const url = modal.game ? `/api/games/${modal.game.id}` : '/api/games'
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      setModal({ open: false })
      onRefresh()
    } finally { setSaving(false) }
  }

  const del = async (id: string, name: string) => {
    if (!confirm(`ลบเกม "${name}"?`)) return
    await fetch(`/api/games/${id}`, { method: 'DELETE' })
    onRefresh()
  }

  const Field = ({ label, k, placeholder, type = 'text', span = 1 }: any) => (
    <div style={{ gridColumn: `span ${span}` }}>
      <label style={{ fontSize: 11, color: '#4a5f80', fontWeight: 600, display: 'block', marginBottom: 6 }}>{label}</label>
      <input className="input" type={type} value={form[k] || ''} placeholder={placeholder}
        onChange={e => setForm((f: any) => ({ ...f, [k]: e.target.value }))} />
    </div>
  )

  return (
    <div style={{ padding: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#e2eaff', fontFamily: 'var(--font-syne)' }}>จัดการเกม</h1>
          <p style={{ fontSize: 13, color: '#4a5f80', marginTop: 2 }}>{games.length} เกม</p>
        </div>
        <div style={{ flex: 1 }} />
        <input className="input" style={{ width: 200, fontSize: 12 }} placeholder="🔍 ค้นหาเกม..." value={search} onChange={e => setSearch(e.target.value)} />
        <button onClick={openAdd} className="btn-primary">+ เพิ่มเกม</button>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => setFilterCat('all')} style={{
          padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
          background: filterCat === 'all' ? 'rgba(79,110,247,0.15)' : 'rgba(42,55,80,0.3)',
          color: filterCat === 'all' ? '#4f6ef7' : '#4a5f80',
          border: filterCat === 'all' ? '1px solid rgba(79,110,247,0.3)' : '1px solid #1f2a3d'
        }}>ทั้งหมด ({games.length})</button>
        {categories.map((c: any) => {
          const count = games.filter((g: any) => g.categoryId === c.id).length
          const active = filterCat === c.id
          return (
            <button key={c.id} onClick={() => setFilterCat(c.id)} style={{
              padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              background: active ? `${c.color}22` : 'rgba(42,55,80,0.3)',
              color: active ? c.color : '#4a5f80',
              border: active ? `1px solid ${c.color}44` : '1px solid #1f2a3d'
            }}>
              {c.icon} {c.name} ({count})
            </button>
          )
        })}
      </div>

      {/* Game Table */}
      <div style={{ background: '#131825', border: '1px solid #1f2a3d', borderRadius: 16, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>เกม</th><th>หมวดหมู่</th><th>เวอร์ชัน</th><th>ขนาด</th>
              <th>วิธีโหลด</th><th>โหลด</th><th>สถานะ</th><th style={{ textAlign: 'center' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#4a5f80' }}>ไม่พบเกม</td></tr>
            )}
            {filtered.map((g: any) => (
              <tr key={g.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, fontSize: 20,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: '#1f2a3d', flexShrink: 0
                    }}>{g.coverImage || '🎮'}</div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#c8d4f0', fontSize: 13 }}>{g.name}</div>
                      {g.description && (
                        <div style={{ fontSize: 11, color: '#4a5f80', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {g.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: 13 }}>{g.category?.icon}</span>
                  <span style={{ fontSize: 12, color: '#7a8fb8', marginLeft: 5 }}>{g.category?.name}</span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#7a8fb8' }}>v{g.version}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#7a8fb8' }}>{formatBytes(g.sizeBytes)}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {g.magnetLink && <span style={{ fontSize: 10, color: '#4f6ef7', fontWeight: 600 }}>⚡ TORRENT</span>}
                    {g.ftpPath && <span style={{ fontSize: 10, color: '#a259ff', fontWeight: 600 }}>🔗 FTP</span>}
                    {!g.magnetLink && !g.ftpPath && <span style={{ fontSize: 10, color: '#4a5f80' }}>—</span>}
                  </div>
                </td>
                <td style={{ fontWeight: 700, color: '#ffb020', fontSize: 14 }}>{g.downloadCount || 0}</td>
                <td><span className={`badge ${STATUS_COLOR[g.status] || 'badge-pending'}`}>{STATUS_LABEL[g.status] || g.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <button onClick={() => openEdit(g)} className="btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }}>แก้ไข</button>
                    <button onClick={() => del(g.id, g.name)} className="btn-danger" style={{ padding: '5px 12px', fontSize: 12 }}>ลบ</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal.open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: '#131825', border: '1px solid #1f2a3d', borderRadius: 20,
            width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #1f2a3d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#e2eaff' }}>{modal.game ? 'แก้ไขเกม' : 'เพิ่มเกมใหม่'}</h2>
              <button onClick={() => setModal({ open: false })} style={{ background: 'none', border: 'none', color: '#4a5f80', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="ชื่อเกม *" k="name" placeholder="Counter-Strike 2" span={2} />
              <div>
                <label style={{ fontSize: 11, color: '#4a5f80', fontWeight: 600, display: 'block', marginBottom: 6 }}>หมวดหมู่ *</label>
                <select className="input" value={form.categoryId || ''} onChange={e => setForm((f: any) => ({ ...f, categoryId: e.target.value }))}>
                  <option value="">เลือกหมวดหมู่...</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <Field label="เวอร์ชัน" k="version" placeholder="1.0.0" />
              <Field label="Server Path *" k="serverPath" placeholder="/games/cs2" span={2} />
              <Field label="คำอธิบาย" k="description" placeholder="รายละเอียดเกม..." span={2} />
              <Field label="Emoji ปก" k="coverImage" placeholder="🎮" />
              <div>
                <label style={{ fontSize: 11, color: '#4a5f80', fontWeight: 600, display: 'block', marginBottom: 6 }}>สถานะ</label>
                <select className="input" value={form.status || 'ACTIVE'} onChange={e => setForm((f: any) => ({ ...f, status: e.target.value }))}>
                  <option value="ACTIVE">ใช้งาน</option>
                  <option value="MAINTENANCE">บำรุงรักษา</option>
                  <option value="DISABLED">ปิดใช้งาน</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2', borderTop: '1px solid #1f2a3d', paddingTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#4f6ef7', marginBottom: 12 }}>⚡ Torrent</div>
                <Field label="Magnet Link" k="magnetLink" placeholder="magnet:?xt=urn:btih:..." span={2} />
              </div>

              <div style={{ gridColumn: 'span 2', borderTop: '1px solid #1f2a3d', paddingTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#a259ff', marginBottom: 12 }}>🔗 FTP</div>
                <Field label="FTP Host" k="ftpHost" placeholder="ftp.example.com" />
                <Field label="FTP Path" k="ftpPath" placeholder="/games/cs2" />
                <Field label="FTP User" k="ftpUser" placeholder="username" />
                <Field label="FTP Password" k="ftpPass" placeholder="password" type="password" />
              </div>

              <div style={{ gridColumn: 'span 2', borderTop: '1px solid #1f2a3d', paddingTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#7a8fb8', marginBottom: 12 }}>🔍 Checksum</div>
                <Field label="Checksum (MD5/SHA)" k="checksum" placeholder="d41d8cd98f00b204e9800998ecf8427e" span={2} />
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #1f2a3d', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setModal({ open: false })} className="btn-ghost">ยกเลิก</button>
              <button onClick={save} disabled={saving} className="btn-primary">{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
