'use client'
import { useState } from 'react'

// ─── Categories Panel ───────────────────────────────────────
export function CategoriesPanel({ categories, onRefresh }: any) {
  const [form, setForm] = useState({ name: '', icon: '🎮', color: '#6366f1' })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.name) { alert('กรอกชื่อหมวดหมู่'); return }
    setSaving(true)
    try {
      await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      setForm({ name: '', icon: '🎮', color: '#6366f1' }); onRefresh()
    } finally { setSaving(false) }
  }

  const del = async (id: string, name: string) => {
    if (!confirm(`ลบหมวดหมู่ "${name}"? เกมทั้งหมดจะถูกลบด้วย`)) return
    await fetch('/api/categories', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    onRefresh()
  }

  const PRESET_ICONS = ['🎮', '🔫', '⚔️', '🏎️', '⚽', '🧩', '🌍', '🚀', '🥊', '🎯', '👾', '🃏', '🎲', '🏆', '🦸']
  const PRESET_COLORS = ['#6366f1', '#4f6ef7', '#00e5ff', '#a259ff', '#ff6b35', '#00d68f', '#ffb020', '#ff4d6d', '#06b6d4', '#8b5cf6']

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#e2eaff', fontFamily: 'var(--font-syne)', marginBottom: 24 }}>หมวดหมู่</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Add form */}
        <div style={{ background: '#131825', border: '1px solid #1f2a3d', borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#c8d4f0', marginBottom: 18 }}>เพิ่มหมวดหมู่ใหม่</h2>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: '#4a5f80', fontWeight: 600, display: 'block', marginBottom: 6 }}>ชื่อ *</label>
            <input className="input" value={form.name} placeholder="Action, RPG, Sports..." onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: '#4a5f80', fontWeight: 600, display: 'block', marginBottom: 8 }}>ไอคอน</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {PRESET_ICONS.map(ico => (
                <button key={ico} onClick={() => setForm(f => ({ ...f, icon: ico }))} style={{
                  width: 36, height: 36, borderRadius: 8, fontSize: 18, cursor: 'pointer',
                  background: form.icon === ico ? 'rgba(79,110,247,0.15)' : '#0e1118',
                  border: form.icon === ico ? '2px solid #4f6ef7' : '1px solid #1f2a3d'
                }}>{ico}</button>
              ))}
            </div>
            <input className="input" value={form.icon} style={{ fontSize: 20 }} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, color: '#4a5f80', fontWeight: 600, display: 'block', marginBottom: 8 }}>สี</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {PRESET_COLORS.map(col => (
                <button key={col} onClick={() => setForm(f => ({ ...f, color: col }))} style={{
                  width: 28, height: 28, borderRadius: 6, background: col, cursor: 'pointer',
                  border: form.color === col ? '3px solid white' : '2px solid transparent'
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                style={{ width: 40, height: 36, borderRadius: 8, border: '1px solid #1f2a3d', cursor: 'pointer', background: 'none' }} />
              <input className="input" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
            </div>
          </div>
          {/* Preview */}
          <div style={{ background: '#0e1118', borderRadius: 10, padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `${form.color}22`, border: `1px solid ${form.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{form.icon}</div>
            <span style={{ fontWeight: 700, color: form.color, fontSize: 14 }}>{form.name || 'ชื่อหมวดหมู่'}</span>
          </div>
          <button onClick={save} disabled={saving} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            {saving ? 'กำลังบันทึก...' : '+ เพิ่มหมวดหมู่'}
          </button>
        </div>

        {/* List */}
        <div style={{ background: '#131825', border: '1px solid #1f2a3d', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1f2a3d' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#c8d4f0' }}>หมวดหมู่ ({categories.length})</span>
          </div>
          <div>
            {categories.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: '#4a5f80', fontSize: 13 }}>ยังไม่มีหมวดหมู่</div>
            )}
            {categories.map((c: any) => (
              <div key={c.id} style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #0e1118' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${c.color}22`, border: `1px solid ${c.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{c.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: c.color }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: '#4a5f80' }}>{c._count?.games ?? 0} เกม</div>
                </div>
                <button onClick={() => del(c.id, c.name)} className="btn-danger" style={{ padding: '5px 12px', fontSize: 12 }}>ลบ</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Logs Panel ─────────────────────────────────────────────
export function LogsPanel() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetch_ = async () => {
    const res = await fetch('/api/settings/stats')
    if (res.ok) { const d = await res.json(); setLogs(d.recentLogs || []) }
    setLoading(false)
  }

  useState(() => { fetch_() })

  const LOG_COLOR: Record<string, string> = { INFO: '#4f6ef7', SUCCESS: '#00d68f', WARN: '#ffb020', ERROR: '#ff4d6d' }

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#e2eaff', fontFamily: 'var(--font-syne)' }}>ประวัติกิจกรรม</h1>
        <button onClick={fetch_} className="btn-ghost">↻ รีเฟรช</button>
      </div>
      <div style={{ background: '#131825', border: '1px solid #1f2a3d', borderRadius: 16, overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr><th>ระดับ</th><th>ร้าน</th><th>เกม</th><th>ข้อความ</th><th>วิธี</th><th>เวลา</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#4a5f80' }}>กำลังโหลด...</td></tr>}
            {!loading && logs.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#4a5f80' }}>ยังไม่มีประวัติ</td></tr>}
            {logs.map((l: any) => (
              <tr key={l.id}>
                <td><span style={{ fontSize: 12, fontWeight: 700, color: LOG_COLOR[l.status] || '#7a8fb8' }}>{l.status}</span></td>
                <td style={{ fontSize: 12, color: '#7a8fb8' }}>{l.client?.shopName || '—'}</td>
                <td style={{ fontSize: 12, color: '#7a8fb8' }}>{l.game?.name || '—'}</td>
                <td style={{ fontSize: 12, color: '#c8d4f0' }}>{l.message}</td>
                <td><span style={{ fontSize: 11, color: l.method === 'FTP' ? '#a259ff' : '#4f6ef7' }}>{l.method}</span></td>
                <td style={{ fontSize: 11, color: '#4a5f80', fontFamily: 'var(--font-mono)' }}>
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

export default CategoriesPanel
