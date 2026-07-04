'use client'

import { useState } from 'react'
import { Plus, Pause, Play, Trash2, ArrowDown, ArrowUp, Users, Link } from 'lucide-react'
import { useTorrent } from '@/lib/useTorrent'

interface TorrentListProps {
  torrents: any[]
  jobs: any[]
  onRefresh: () => void
}

function formatBytes(bytes: number | string) {
  const n = typeof bytes === 'string' ? parseInt(bytes) : bytes
  if (n < 1024) return `${n} B`
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`
  return `${(n / 1024 ** 3).toFixed(2)} GB`
}

function formatSpeed(bps: number) {
  if (!bps) return '—'
  if (bps < 1024 * 1024) return `${(bps / 1024).toFixed(1)} KB/s`
  return `${(bps / 1024 / 1024).toFixed(1)} MB/s`
}

export default function TorrentList({ torrents, jobs, onRefresh }: TorrentListProps) {
  const [addModal, setAddModal] = useState(false)
  const [magnet, setMagnet] = useState('')
  const [selectedJob, setSelectedJob] = useState('')
  const [adding, setAdding] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const { addMagnet, pauseTorrent, resumeTorrent, removeTorrent } = useTorrent({
    onProgress: (data) => console.log('Progress:', data),
    onDone: (hash) => { onRefresh() },
    onError: (err) => console.error('Torrent error:', err),
  })

  const handleAddMagnet = async () => {
    if (!magnet || !selectedJob) return
    setAdding(true)
    try {
      // Parse info hash from magnet
      const hashMatch = magnet.match(/xt=urn:btih:([a-fA-F0-9]{40}|[a-zA-Z2-7]{32})/i)
      const infoHash = hashMatch ? hashMatch[1].toLowerCase() : Math.random().toString(36).slice(2)
      const nameMatch = magnet.match(/dn=([^&]+)/)
      const name = nameMatch ? decodeURIComponent(nameMatch[1].replace(/\+/g, ' ')) : `Torrent-${infoHash.slice(0, 8)}`

      // Save to DB
      const res = await fetch('/api/torrents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJob,
          name,
          magnetLink: magnet,
          infoHash,
          size: 0,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        if (err.error === 'Torrent already exists') {
          alert('ทอร์เรนต์นี้มีอยู่แล้ว')
          return
        }
      }

      const torrent = await res.json()
      // Start WebTorrent download
      await addMagnet(torrent.id, magnet, '/tmp/torrentsync')

      setMagnet('')
      setAddModal(false)
      onRefresh()
    } catch (err) {
      console.error('Add magnet error:', err)
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (t: any) => {
    if (!confirm(`ลบทอร์เรนต์ "${t.name}"?`)) return
    removeTorrent(t.id, t.magnetLink)
    await fetch(`/api/torrents/${t.id}`, { method: 'DELETE' })
    onRefresh()
  }

  const toggleSelect = (id: string) =>
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  const statusLabel: Record<string, string> = {
    PENDING: 'รอ', DOWNLOADING: 'ดาวน์โหลด', SEEDING: 'อัพโหลด',
    PAUSED: 'หยุด', ERROR: 'ผิดพลาด', COMPLETED: 'เสร็จ'
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">ทอร์เรนต์</h1>
          <p className="text-sm text-slate-500 mt-0.5">{torrents.length} รายการ</p>
        </div>
        <button
          onClick={() => setAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium"
        >
          <Plus size={15} />
          เพิ่ม Magnet
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#1e2435] border border-[#2a3045] rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-[#161b27] border-b border-[#2a3045] text-xs text-slate-500 font-medium">
          <div className="col-span-4">ชื่อ</div>
          <div className="col-span-2">ขนาด</div>
          <div className="col-span-2">ความคืบหน้า</div>
          <div className="col-span-1 text-center"><ArrowDown size={12} className="inline" /></div>
          <div className="col-span-1 text-center"><ArrowUp size={12} className="inline" /></div>
          <div className="col-span-1 text-center"><Users size={12} className="inline" /></div>
          <div className="col-span-1 text-center">จัดการ</div>
        </div>

        {torrents.length === 0 ? (
          <div className="py-16 text-center">
            <Link size={32} className="text-slate-700 mx-auto mb-3" />
            <div className="text-slate-400 text-sm">ยังไม่มีทอร์เรนต์</div>
            <div className="text-slate-600 text-xs mt-1">เพิ่ม Magnet link เพื่อเริ่มดาวน์โหลด</div>
          </div>
        ) : (
          <div className="divide-y divide-[#2a3045]">
            {torrents.map(t => (
              <div
                key={t.id}
                className={`grid grid-cols-12 gap-2 px-4 py-3 items-center text-xs hover:bg-[#252c40] cursor-pointer transition-colors ${
                  selected.has(t.id) ? 'bg-blue-500/5 border-l-2 border-l-blue-500' : ''
                }`}
                onClick={() => toggleSelect(t.id)}
              >
                {/* Name + status */}
                <div className="col-span-4 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      t.status === 'DOWNLOADING' ? 'bg-blue-400 animate-pulse' :
                      t.status === 'SEEDING' ? 'bg-emerald-400' :
                      t.status === 'ERROR' ? 'bg-red-400' :
                      t.status === 'COMPLETED' ? 'bg-emerald-400' : 'bg-slate-600'
                    }`} />
                    <span className="text-slate-200 truncate">{t.name}</span>
                  </div>
                  <div className="text-slate-600 mt-0.5 ml-4 truncate">{t.job?.name}</div>
                </div>

                {/* Size */}
                <div className="col-span-2 text-slate-400 mono">{formatBytes(t.size)}</div>

                {/* Progress */}
                <div className="col-span-2">
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 bg-[#2a3045] rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          t.status === 'DOWNLOADING' ? 'bg-blue-500 progress-active' :
                          t.status === 'COMPLETED' || t.status === 'SEEDING' ? 'bg-emerald-500' :
                          t.status === 'ERROR' ? 'bg-red-500' : 'bg-slate-600'
                        }`}
                        style={{ width: `${(t.progress * 100).toFixed(0)}%` }}
                      />
                    </div>
                    <span className="text-slate-500 mono w-8 text-right">{(t.progress * 100).toFixed(0)}%</span>
                  </div>
                  <div className={`text-xs mt-0.5 status-${t.status.toLowerCase()}`}>
                    {statusLabel[t.status] ?? t.status}
                  </div>
                </div>

                {/* Download speed */}
                <div className="col-span-1 text-center text-emerald-400 mono">
                  {t.status === 'DOWNLOADING' ? formatSpeed(t.downloadSpeed) : '—'}
                </div>

                {/* Upload speed */}
                <div className="col-span-1 text-center text-blue-400 mono">
                  {t.status === 'SEEDING' || t.status === 'DOWNLOADING' ? formatSpeed(t.uploadSpeed) : '—'}
                </div>

                {/* Peers */}
                <div className="col-span-1 text-center text-slate-400 mono">{t.peers || '—'}</div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-center gap-0.5" onClick={e => e.stopPropagation()}>
                  {t.status === 'DOWNLOADING' ? (
                    <button
                      onClick={() => pauseTorrent(t.id)}
                      className="p-1.5 text-slate-500 hover:text-yellow-400 hover:bg-yellow-500/10 rounded"
                      title="หยุดชั่วคราว"
                    >
                      <Pause size={12} />
                    </button>
                  ) : (
                    <button
                      onClick={() => resumeTorrent(t.id)}
                      className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded"
                      title="เริ่มใหม่"
                    >
                      <Play size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(t)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded"
                    title="ลบ"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Magnet Modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1e2435] border border-[#2a3045] rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <h2 className="text-base font-semibold text-slate-100">เพิ่ม Magnet Link</h2>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Magnet Link *</label>
              <textarea
                value={magnet}
                onChange={e => setMagnet(e.target.value)}
                placeholder="magnet:?xt=urn:btih:..."
                rows={3}
                className="w-full bg-[#141720] border border-[#2a3045] rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500/60 mono resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">งานที่เชื่อมโยง *</label>
              <select
                value={selectedJob}
                onChange={e => setSelectedJob(e.target.value)}
                className="w-full bg-[#141720] border border-[#2a3045] rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500/60"
              >
                <option value="">เลือกงาน...</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setAddModal(false)} className="flex-1 text-sm text-slate-400 bg-[#141720] border border-[#2a3045] rounded-lg py-2 hover:bg-[#2a3045] transition-colors">
                ยกเลิก
              </button>
              <button
                onClick={handleAddMagnet}
                disabled={adding || !magnet || !selectedJob}
                className="flex-1 text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg py-2 font-medium transition-colors"
              >
                {adding ? 'กำลังเพิ่ม...' : 'เพิ่มทอร์เรนต์'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
