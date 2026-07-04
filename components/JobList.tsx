'use client'

import { useState } from 'react'
import { Plus, Play, Pause, Square, RefreshCw, Pencil, Trash2, ChevronDown, ChevronUp, FolderSync } from 'lucide-react'
import JobModal from './JobModal'

interface JobListProps {
  jobs: any[]
  onRefresh: () => void
}

function StatusBadge({ status }: { status: string }) {
  const label: Record<string, string> = {
    RUNNING: 'กำลังซิงค์', IDLE: 'รอ', PAUSED: 'หยุด',
    ERROR: 'ผิดพลาด', COMPLETED: 'เสร็จแล้ว',
  }
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium status-${status.toLowerCase()}`}>
      {label[status] ?? status}
    </span>
  )
}

function formatDate(d: string | null) {
  if (!d) return 'ไม่เคย'
  return new Date(d).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
}

export default function JobList({ jobs, onRefresh }: JobListProps) {
  const [modal, setModal] = useState<{ open: boolean; job?: any }>({ open: false })
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) =>
    setExpanded(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  const jobAction = async (jobId: string, action: string) => {
    setLoading(s => new Set(s).add(jobId))
    try {
      await fetch(`/api/jobs/${jobId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      await onRefresh()
    } finally {
      setLoading(s => { const n = new Set(s); n.delete(jobId); return n })
    }
  }

  const deleteJob = async (jobId: string) => {
    if (!confirm('ลบงานนี้? ทอร์เรนต์ทั้งหมดในงานจะถูกลบด้วย')) return
    await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' })
    onRefresh()
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">งานซิงค์</h1>
          <p className="text-sm text-slate-500 mt-0.5">{jobs.length} งาน</p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium"
        >
          <Plus size={15} />
          สร้างงานใหม่
        </button>
      </div>

      {/* Jobs */}
      {jobs.length === 0 ? (
        <div className="bg-[#1e2435] border border-dashed border-[#2a3045] rounded-xl py-16 text-center">
          <FolderSync size={32} className="text-slate-600 mx-auto mb-3" />
          <div className="text-slate-400 text-sm font-medium">ยังไม่มีงาน</div>
          <div className="text-slate-600 text-xs mt-1">คลิก "สร้างงานใหม่" เพื่อเริ่มต้น</div>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div
              key={job.id}
              className="bg-[#1e2435] border border-[#2a3045] rounded-xl job-card overflow-hidden"
            >
              {/* Job Header */}
              <div className="px-4 py-3.5 flex items-center gap-3">
                <button onClick={() => toggleExpand(job.id)} className="text-slate-500 hover:text-slate-300">
                  {expanded.has(job.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-medium text-slate-100">{job.name}</span>
                    <StatusBadge status={job.status} />
                    {job.autoSync && (
                      <span className="text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full px-2 py-0.5">
                        Auto
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 mono truncate">{job.sourcePath}</span>
                    <span className="text-slate-700">→</span>
                    <span className="text-xs text-slate-500 mono truncate">{job.destPath}</span>
                  </div>
                </div>

                {/* Torrent count */}
                <div className="text-xs text-slate-500 text-right shrink-0 hidden sm:block">
                  <div>{job.torrents?.length ?? 0} ทอร์เรนต์</div>
                  <div className="text-slate-600">ซิงค์ล่าสุด: {formatDate(job.lastSync)}</div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {loading.has(job.id) ? (
                    <RefreshCw size={14} className="text-blue-400 animate-spin mx-2" />
                  ) : (
                    <>
                      {job.status === 'RUNNING' ? (
                        <ActionBtn icon={Pause} onClick={() => jobAction(job.id, 'pause')} label="หยุดชั่วคราว" color="yellow" />
                      ) : (
                        <ActionBtn icon={Play} onClick={() => jobAction(job.id, 'start')} label="เริ่ม" color="green" />
                      )}
                      {job.status !== 'IDLE' && (
                        <ActionBtn icon={Square} onClick={() => jobAction(job.id, 'stop')} label="หยุด" color="red" />
                      )}
                      <ActionBtn icon={RefreshCw} onClick={() => jobAction(job.id, 'sync')} label="ซิงค์เดี๋ยวนี้" color="blue" />
                      <ActionBtn icon={Pencil} onClick={() => setModal({ open: true, job })} label="แก้ไข" color="slate" />
                      <ActionBtn icon={Trash2} onClick={() => deleteJob(job.id)} label="ลบ" color="red" />
                    </>
                  )}
                </div>
              </div>

              {/* Expanded - Torrent list */}
              {expanded.has(job.id) && job.torrents?.length > 0 && (
                <div className="border-t border-[#2a3045] bg-[#161b27]">
                  {job.torrents.map((t: any) => (
                    <div key={t.id} className="px-4 py-2.5 flex items-center gap-3 border-b border-[#2a3045]/50 last:border-0">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-300 truncate">{t.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-[#2a3045] rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all ${
                                t.status === 'DOWNLOADING' ? 'bg-blue-500 progress-active' :
                                t.status === 'COMPLETED' || t.status === 'SEEDING' ? 'bg-emerald-500' :
                                t.status === 'ERROR' ? 'bg-red-500' : 'bg-slate-600'
                              }`}
                              style={{ width: `${(t.progress * 100).toFixed(0)}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 mono w-10 text-right">
                            {(t.progress * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded status-${t.status.toLowerCase()}`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Expanded - no torrents */}
              {expanded.has(job.id) && (!job.torrents || job.torrents.length === 0) && (
                <div className="border-t border-[#2a3045] px-4 py-4 text-xs text-slate-600 text-center">
                  ยังไม่มีทอร์เรนต์ในงานนี้
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <JobModal
          job={modal.job}
          onClose={() => setModal({ open: false })}
          onSave={async (data) => {
            if (modal.job) {
              await fetch(`/api/jobs/${modal.job.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              })
            } else {
              await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              })
            }
            setModal({ open: false })
            onRefresh()
          }}
        />
      )}
    </div>
  )
}

function ActionBtn({ icon: Icon, onClick, label, color }: {
  icon: any; onClick: () => void; label: string; color: string
}) {
  const colors: Record<string, string> = {
    green: 'hover:text-emerald-400 hover:bg-emerald-500/10',
    yellow: 'hover:text-yellow-400 hover:bg-yellow-500/10',
    red: 'hover:text-red-400 hover:bg-red-500/10',
    blue: 'hover:text-blue-400 hover:bg-blue-500/10',
    slate: 'hover:text-slate-200 hover:bg-slate-500/10',
  }
  return (
    <button
      onClick={onClick}
      title={label}
      className={`p-1.5 rounded-lg text-slate-500 transition-colors ${colors[color]}`}
    >
      <Icon size={14} />
    </button>
  )
}
