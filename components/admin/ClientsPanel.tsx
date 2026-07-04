'use client'

import { useState, useMemo } from 'react'
import { formatDate } from '@/lib/format'

/* ── helpers ─────────────────────────────────────────── */
function daysUntil(d: string | null): number | null {
  if (!d) return null
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000)
}

function expiryStatus(expiresAt: string | null, isActive: boolean) {
  if (!expiresAt) return { label: 'ไม่มีวันหมดอายุ', color: '#4a5f80', bg: 'rgba(42,55,80,0.3)', border: '#2a3750', icon: '∞' }
  const days = daysUntil(expiresAt)!
  if (!isActive) return { label: 'ถูกปิด', color: '#ff4d6d', bg: 'rgba(255,77,109,0.1)', border: 'rgba(255,77,109,0.25)', icon: '🚫' }
  if (days < 0)  return { label: `หมดอายุ ${Math.abs(days)} วันที่แล้ว`, color: '#ff4d6d', bg: 'rgba(255,77,109,0.1)', border: 'rgba(255,77,109,0.25)', icon: '💀' }
  if (days === 0) return { label: 'หมดอายุวันนี้!', color: '#ff4d6d', bg: 'rgba(255,77,109,0.12)', border: 'rgba(255,77,109,0.3)', icon: '⚠️' }
  if (days <= 3)  return { label: `เหลือ ${days} วัน`, color: '#ff4d6d', bg: 'rgba(255,77,109,0.1)', border: 'rgba(255,77,109,0.25)', icon: '🔴' }
  if (days <= 7)  return { label: `เหลือ ${days} วัน`, color: '#ffb020', bg: 'rgba(255,176,32,0.1)', border: 'rgba(255,176,32,0.25)', icon: '🟡' }
  if (days <= 30) return { label: `เหลือ ${days} วัน`, color: '#00d68f', bg: 'rgba(0,214,143,0.08)', border: 'rgba(0,214,143,0.2)', icon: '🟢' }
  return { label: `เหลือ ${days} วัน`, color: '#00d68f', bg: 'rgba(0,214,143,0.08)', border: 'rgba(0,214,143,0.2)', icon: '✅' }
}

const QUICK_PLANS = [
  { label: '7 วัน',    days: 7,   color: '#4a5f80' },
  { label: '30 วัน',   days: 30,  color: '#4f6ef7' },
  { label: '90 วัน',   days: 90,  color: '#a259ff' },
  { label: '180 วัน',  days: 180, color: '#00d68f' },
  { label: '365 วัน',  days: 365, color: '#ffb020' },
]

/* ── ExpiryBar ───────────────────────────────────────── */
function ExpiryBar({ expiresAt, planName }: { expiresAt: string | null; planName: string | null }) {
  if (!expiresAt) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: 'rgba(42,55,80,0.3)', border: '1px solid #2a3750' }}>
      <span style={{ fontSize: 14 }}>∞</span>
      <span style={{ fontSize: 12, color: '#4a5f80' }}>ไม่มีวันหมดอายุ</span>
    </div>
  )
  const days = daysUntil(expiresAt)!
  const st = expiryStatus(expiresAt, true)
  // Progress bar: show remaining out of total plan (assume 30d if unknown)
  const totalDays = 30
  const pct = Math.max(0, Math.min(100, (days / totalDays) * 100))

  return (
    <div style={{ padding: '10px 12px', borderRadius: 10, background: st.bg, border: `1px solid ${st.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13 }}>{st.icon}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: st.color }}>{st.label}</span>
        </div>
        <span style={{ fontSize: 11, color: '#4a5f80', fontFamily: 'var(--font-mono)' }}>
          {new Date(expiresAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })}
        </span>
      </div>
      <div style={{ height: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: 4, width: `${pct}%`, borderRadius: 99, background: st.color, transition: 'width 0.5s ease' }} />
      </div>
      {planName && <div style={{ fontSize: 10, color: '#4a5f80', marginTop: 5 }}>📦 {planName}</div>}
    </div>
  )
}

/* ── RenewModal ──────────────────────────────────────── */
function RenewModal({ client, onClose, onDone }: { client: any; onClose: () => void; onDone: () => void }) {
  const [days, setDays] = useState<number>(30)
  const [planName, setPlanName] = useState(client.planName || '')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  // Preview new expiry
  const base = client.expiresAt && new Date(client.expiresAt) > new Date()
    ? new Date(client.expiresAt) : new Date()
  const preview = new Date(base)
  preview.setDate(preview.getDate() + days)

  const renew = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/clients/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id, daysAdded: days, planName, note }),
      })
      if (!res.ok) { alert('ต่ออายุไม่สำเร็จ'); return }
      onDone()
      onClose()
    } finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#131825', border: '1px solid #1f2a3d', borderRadius: 20, width: '100%', maxWidth: 460, boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #1f2a3d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#e2eaff' }}>🔄 ต่ออายุสมาชิก</h2>
            <p style={{ fontSize: 12, color: '#4a5f80', marginTop: 2 }}>🏪 {client.shopName}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#4a5f80', cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: 24 }}>
          {/* Current status */}
          <div style={{ marginBottom: 18 }}>
            <ExpiryBar expiresAt={client.expiresAt} planName={client.planName} />
          </div>

          {/* Quick plan buttons */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: '#4a5f80', fontWeight: 600, display: 'block', marginBottom: 8 }}>เลือกระยะเวลา</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {QUICK_PLANS.map(p => (
                <button key={p.days} onClick={() => { setDays(p.days); setPlanName(p.label) }} style={{
                  padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                  background: days === p.days ? `${p.color}22` : '#0e1118',
                  color: days === p.days ? p.color : '#4a5f80',
                  border: days === p.days ? `1px solid ${p.color}55` : '1px solid #1f2a3d',
                }}>{p.label}</button>
              ))}
            </div>
          </div>

          {/* Custom days */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 11, color: '#4a5f80', fontWeight: 600, display: 'block', marginBottom: 6 }}>จำนวนวัน (กำหนดเอง)</label>
              <input className="input" type="number" min="1" max="3650" value={days}
                onChange={e => setDays(Math.max(1, Number(e.target.value)))} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#4a5f80', fontWeight: 600, display: 'block', marginBottom: 6 }}>ชื่อแพ็กเกจ</label>
              <input className="input" value={planName} placeholder="เช่น รายเดือน" onChange={e => setPlanName(e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 11, color: '#4a5f80', fontWeight: 600, display: 'block', marginBottom: 6 }}>หมายเหตุ</label>
            <input className="input" value={note} placeholder="เช่น โอนเงินแล้ว, ชำระด้วยเงินสด..." onChange={e => setNote(e.target.value)} />
          </div>

          {/* Preview new expiry */}
          <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(0,214,143,0.08)', border: '1px solid rgba(0,214,143,0.2)', marginBottom: 4 }}>
            <div style={{ fontSize: 11, color: '#4a5f80', marginBottom: 4 }}>📅 วันหมดอายุใหม่</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#00d68f', fontFamily: 'var(--font-syne)' }}>
              {preview.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div style={{ fontSize: 12, color: '#4a5f80', marginTop: 3 }}>
              {client.expiresAt && new Date(client.expiresAt) > new Date()
                ? `ต่อจากวันเดิม + ${days} วัน`
                : `เริ่มนับจากวันนี้ + ${days} วัน`}
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #1f2a3d', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} className="btn-ghost">ยกเลิก</button>
          <button onClick={renew} disabled={saving} className="btn-primary" style={{ minWidth: 120 }}>
            {saving ? 'กำลังต่ออายุ...' : `✅ ต่ออายุ ${days} วัน`}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── HistoryModal ────────────────────────────────────── */
function HistoryModal({ client, onClose }: { client: any; onClose: () => void }) {
  const subs = client.subscriptions || []
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#131825', border: '1px solid #1f2a3d', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #1f2a3d', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#e2eaff' }}>📋 ประวัติการต่ออายุ</h2>
            <p style={{ fontSize: 12, color: '#4a5f80', marginTop: 2 }}>🏪 {client.shopName} · {subs.length} รายการ</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#4a5f80', cursor: 'pointer', fontSize: 22 }}>×</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {subs.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#4a5f80', fontSize: 13 }}>ยังไม่มีประวัติการต่ออายุ</div>
          ) : (
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {subs.map((s: any, i: number) => (
                <div key={s.id} style={{ padding: '14px 16px', borderRadius: 12, background: i === 0 ? 'rgba(0,214,143,0.06)' : '#0e1118', border: `1px solid ${i === 0 ? 'rgba(0,214,143,0.2)' : '#1f2a3d'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? '#00d68f' : '#c8d4f0' }}>+{s.daysAdded} วัน</span>
                      {s.planName && <span style={{ marginLeft: 8, fontSize: 11, color: '#4f6ef7', background: 'rgba(79,110,247,0.12)', padding: '2px 8px', borderRadius: 99 }}>{s.planName}</span>}
                      {i === 0 && <span style={{ marginLeft: 6, fontSize: 10, color: '#00d68f', background: 'rgba(0,214,143,0.12)', padding: '2px 7px', borderRadius: 99 }}>ล่าสุด</span>}
                    </div>
                    <span style={{ fontSize: 11, color: '#4a5f80', fontFamily: 'var(--font-mono)' }}>
                      {new Date(s.startedAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#4a5f80' }}>
                    <span>📅 หมดอายุ: <strong style={{ color: '#7a8fb8' }}>{new Date(s.expiresAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></span>
                    {s.note && <span>📝 {s.note}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding: '14px 24px', borderTop: '1px solid #1f2a3d', flexShrink: 0 }}>
          <button onClick={onClose} className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>ปิด</button>
        </div>
      </div>
    </div>
  )
}

/* ── AddClientModal ──────────────────────────────────── */
function AddClientModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ shopName: '', pinCode: '', description: '', planName: '', daysValid: 30, hasExpiry: true })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.shopName || !form.pinCode) { alert('กรอกชื่อร้านและรหัส PIN'); return }
    setSaving(true)
    try {
      await fetch('/api/clients', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, daysValid: form.hasExpiry ? form.daysValid : 0 }),
      })
      onSave(); onClose()
    } finally { setSaving(false) }
  }

  const preview = (() => {
    if (!form.hasExpiry) return null
    const d = new Date(); d.setDate(d.getDate() + form.daysValid); return d
  })()

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#131825', border: '1px solid #1f2a3d', borderRadius: 20, width: '100%', maxWidth: 460, boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #1f2a3d', display: 'flex', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#e2eaff' }}>🏪 เพิ่มร้านใหม่</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#4a5f80', cursor: 'pointer', fontSize: 22 }}>×</button>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'ชื่อร้าน *', k: 'shopName', placeholder: 'GameZone สาขา 1' },
            { label: 'รหัส PIN *', k: 'pinCode', placeholder: '4-8 หลัก', type: 'password' },
            { label: 'คำอธิบาย', k: 'description', placeholder: 'สาขา, ที่อยู่...' },
          ].map(({ label, k, placeholder, type }) => (
            <div key={k}>
              <label style={{ fontSize: 11, color: '#4a5f80', fontWeight: 600, display: 'block', marginBottom: 6 }}>{label}</label>
              <input className="input" type={type || 'text'} placeholder={placeholder} value={(form as any)[k]}
                onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}

          {/* Expiry toggle */}
          <div>
            <label style={{ fontSize: 11, color: '#4a5f80', fontWeight: 600, display: 'block', marginBottom: 8 }}>วันหมดอายุ</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: form.hasExpiry ? 10 : 0 }}>
              {[true, false].map(v => (
                <button key={String(v)} onClick={() => setForm(f => ({ ...f, hasExpiry: v }))} style={{
                  flex: 1, padding: '8px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                  background: form.hasExpiry === v ? (v ? 'rgba(79,110,247,0.15)' : 'rgba(42,55,80,0.4)') : '#0e1118',
                  color: form.hasExpiry === v ? (v ? '#4f6ef7' : '#7a8fb8') : '#4a5f80',
                  border: form.hasExpiry === v ? (v ? '1px solid rgba(79,110,247,0.3)' : '1px solid #2a3750') : '1px solid #1f2a3d',
                }}>{v ? '📅 มีวันหมดอายุ' : '∞ ไม่มีวันหมดอายุ'}</button>
              ))}
            </div>
            {form.hasExpiry && (
              <>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                  {QUICK_PLANS.map(p => (
                    <button key={p.days} onClick={() => setForm(f => ({ ...f, daysValid: p.days, planName: p.label }))} style={{
                      padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                      background: form.daysValid === p.days ? `${p.color}22` : '#0e1118',
                      color: form.daysValid === p.days ? p.color : '#4a5f80',
                      border: form.daysValid === p.days ? `1px solid ${p.color}55` : '1px solid #1f2a3d',
                    }}>{p.label}</button>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 10, color: '#4a5f80', display: 'block', marginBottom: 5 }}>จำนวนวัน</label>
                    <input className="input" type="number" min="1" value={form.daysValid}
                      onChange={e => setForm(f => ({ ...f, daysValid: Math.max(1, Number(e.target.value)) }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: '#4a5f80', display: 'block', marginBottom: 5 }}>ชื่อแพ็กเกจ</label>
                    <input className="input" value={form.planName} placeholder="รายเดือน..." onChange={e => setForm(f => ({ ...f, planName: e.target.value }))} />
                  </div>
                </div>
                {preview && (
                  <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 10, background: 'rgba(0,214,143,0.08)', border: '1px solid rgba(0,214,143,0.2)', fontSize: 12, color: '#00d68f' }}>
                    📅 หมดอายุ: {preview.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                )}
              </>
            )}
          </div>

          <div style={{ background: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.2)', borderRadius: 10, padding: 12, fontSize: 12, color: '#7a8fb8' }}>
            💡 ลูกค้าล็อกอินที่ <strong style={{ color: '#4f6ef7' }}>/client</strong> ด้วยรหัส PIN
          </div>
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #1f2a3d', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} className="btn-ghost">ยกเลิก</button>
          <button onClick={save} disabled={saving} className="btn-primary">{saving ? 'กำลังบันทึก...' : 'สร้างร้าน'}</button>
        </div>
      </div>
    </div>
  )
}

/* ── Main ClientsPanel ───────────────────────────────── */
export default function ClientsPanel({ clients, onRefresh }: any) {
  const [addModal, setAddModal]     = useState(false)
  const [renewTarget, setRenewTarget]   = useState<any>(null)
  const [historyTarget, setHistoryTarget] = useState<any>(null)
  const [filter, setFilter]         = useState<'all' | 'active' | 'expiring' | 'expired'>('all')
  const [search, setSearch]         = useState('')

  const now = new Date()
  const in7 = new Date(now.getTime() + 7 * 86_400_000)

  const filtered = useMemo(() => {
    let list = clients
    if (search) list = list.filter((c: any) => c.shopName.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()))
    if (filter === 'active')   list = list.filter((c: any) => !c.expiresAt || new Date(c.expiresAt) > in7)
    if (filter === 'expiring') list = list.filter((c: any) => c.expiresAt && new Date(c.expiresAt) >= now && new Date(c.expiresAt) <= in7)
    if (filter === 'expired')  list = list.filter((c: any) => c.expiresAt && new Date(c.expiresAt) < now)
    return list
  }, [clients, filter, search])

  const counts = useMemo(() => ({
    all: clients.length,
    active: clients.filter((c: any) => !c.expiresAt || new Date(c.expiresAt) > in7).length,
    expiring: clients.filter((c: any) => c.expiresAt && new Date(c.expiresAt) >= now && new Date(c.expiresAt) <= in7).length,
    expired: clients.filter((c: any) => c.expiresAt && new Date(c.expiresAt) < now).length,
  }), [clients])

  const toggleActive = async (c: any) => {
    await fetch('/api/clients', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: c.id, isActive: !c.isActive }) })
    onRefresh()
  }

  const deleteClient = async (c: any) => {
    if (!confirm(`ลบร้าน "${c.shopName}"? ข้อมูลทั้งหมดจะถูกลบ`)) return
    await fetch('/api/clients', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: c.id }) })
    onRefresh()
  }

  const FILTER_TABS = [
    { key: 'all', label: 'ทั้งหมด', color: '#4a5f80' },
    { key: 'active', label: '✅ ใช้งานได้', color: '#00d68f' },
    { key: 'expiring', label: '⚠️ ใกล้หมด', color: '#ffb020' },
    { key: 'expired', label: '💀 หมดอายุ', color: '#ff4d6d' },
  ] as const

  return (
    <div style={{ padding: 28 }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#e2eaff', fontFamily: 'var(--font-syne)' }}>ร้านค้า</h1>
          <p style={{ fontSize: 13, color: '#4a5f80', marginTop: 2 }}>{clients.length} ร้าน</p>
        </div>

        {/* Summary pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {counts.expiring > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 99, background: 'rgba(255,176,32,0.12)', border: '1px solid rgba(255,176,32,0.25)' }}>
              <span style={{ fontSize: 12 }}>⚠️</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#ffb020' }}>{counts.expiring} ร้านใกล้หมดอายุ</span>
            </div>
          )}
          {counts.expired > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 99, background: 'rgba(255,77,109,0.12)', border: '1px solid rgba(255,77,109,0.25)' }}>
              <span style={{ fontSize: 12 }}>💀</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#ff4d6d' }}>{counts.expired} ร้านหมดอายุ</span>
            </div>
          )}
        </div>

        <div style={{ flex: 1 }} />
        <input className="input" style={{ width: 200, fontSize: 12 }} placeholder="🔍 ค้นหาร้าน..." value={search} onChange={e => setSearch(e.target.value)} />
        <button onClick={() => setAddModal(true)} className="btn-primary">+ เพิ่มร้าน</button>
      </div>

      {/* ── Filter tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {FILTER_TABS.map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
            padding: '7px 16px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            background: filter === tab.key ? `${tab.color}22` : 'rgba(42,55,80,0.3)',
            color: filter === tab.key ? tab.color : '#4a5f80',
            border: filter === tab.key ? `1px solid ${tab.color}44` : '1px solid #1f2a3d',
          }}>
            {tab.label} ({(counts as any)[tab.key]})
          </button>
        ))}
      </div>

      {/* ── Client cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#4a5f80', fontSize: 13 }}>
            {search ? 'ไม่พบร้านที่ค้นหา' : 'ยังไม่มีร้านค้า'}
          </div>
        )}
        {filtered.map((c: any) => {
          const st = expiryStatus(c.expiresAt, c.isActive)
          const isExpired = c.expiresAt && new Date(c.expiresAt) < now
          const isExpiring = c.expiresAt && new Date(c.expiresAt) >= now && new Date(c.expiresAt) <= in7

          return (
            <div key={c.id} style={{
              background: '#131825',
              border: `1px solid ${isExpired ? 'rgba(255,77,109,0.25)' : isExpiring ? 'rgba(255,176,32,0.25)' : '#1f2a3d'}`,
              borderRadius: 16, overflow: 'hidden', transition: 'transform 0.15s, border-color 0.2s',
            }}>
              {/* Card header */}
              <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid #0e1118' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, fontSize: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isExpired ? 'rgba(255,77,109,0.1)' : isExpiring ? 'rgba(255,176,32,0.1)' : 'rgba(0,214,143,0.1)',
                    border: `1px solid ${isExpired ? 'rgba(255,77,109,0.2)' : isExpiring ? 'rgba(255,176,32,0.2)' : 'rgba(0,214,143,0.2)'}`,
                  }}>🏪</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#e2eaff' }}>{c.shopName}</div>
                    <div style={{ fontSize: 11, color: '#4a5f80', marginTop: 2 }}>{c.description || 'ไม่มีคำอธิบาย'}</div>
                  </div>
                </div>
                <span className={`badge ${c.isActive && !isExpired ? 'badge-active' : 'badge-error'}`}>
                  {!c.isActive ? 'ปิด' : isExpired ? 'หมดอายุ' : 'เปิด'}
                </span>
              </div>

              {/* Expiry bar */}
              <div style={{ padding: '12px 18px', borderBottom: '1px solid #0e1118' }}>
                <ExpiryBar expiresAt={c.expiresAt} planName={c.planName} />
              </div>

              {/* Info grid */}
              <div style={{ padding: '10px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, borderBottom: '1px solid #0e1118' }}>
                {[
                  ['🎮 เกมที่ซิงค์', `${c._count?.clientGames ?? 0} เกม`],
                  ['🕐 ออนไลน์ล่าสุด', formatDate(c.lastSeen)],
                  ['🌐 IP ล่าสุด', c.ipAddress || '—'],
                  ['📅 สร้างเมื่อ', formatDate(c.createdAt)],
                ].map(([l, v]) => (
                  <div key={l} style={{ background: '#0e1118', borderRadius: 8, padding: '7px 10px' }}>
                    <div style={{ fontSize: 10, color: '#4a5f80', marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 11, color: '#c8d4f0', fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* ID */}
              <div style={{ padding: '8px 18px', borderBottom: '1px solid #0e1118' }}>
                <div style={{ fontSize: 10, color: '#2a3750', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
                  ID: {c.id}
                </div>
              </div>

              {/* Actions */}
              <div style={{ padding: '12px 18px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => setRenewTarget(c)} className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '7px 12px' }}>
                  🔄 ต่ออายุ
                </button>
                <button onClick={() => setHistoryTarget(c)} className="btn-ghost" style={{ fontSize: 12, padding: '7px 12px' }}>
                  📋 ประวัติ
                </button>
                <button onClick={() => toggleActive(c)} className="btn-ghost" style={{ fontSize: 12, padding: '7px 12px', color: c.isActive ? '#ffb020' : '#00d68f' }}>
                  {c.isActive ? '⏸ ปิด' : '▶ เปิด'}
                </button>
                <button onClick={() => deleteClient(c)} className="btn-danger" style={{ fontSize: 12, padding: '7px 12px' }}>
                  🗑
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Modals ── */}
      {addModal    && <AddClientModal onClose={() => setAddModal(false)} onSave={onRefresh} />}
      {renewTarget && <RenewModal client={renewTarget} onClose={() => setRenewTarget(null)} onDone={onRefresh} />}
      {historyTarget && <HistoryModal client={historyTarget} onClose={() => setHistoryTarget(null)} />}
    </div>
  )
}
