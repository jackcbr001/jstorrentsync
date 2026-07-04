'use client'

import { ArrowDown, ArrowUp, Briefcase, Download, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

function formatSpeed(bps: number) {
  if (!bps) return '0 B/s'
  if (bps < 1024 * 1024) return `${(bps / 1024).toFixed(1)} KB/s`
  return `${(bps / 1024 / 1024).toFixed(2)} MB/s`
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium status-${status.toLowerCase()}`}>
      {status === 'RUNNING' ? 'กำลังซิงค์' :
       status === 'IDLE' ? 'รอ' :
       status === 'PAUSED' ? 'หยุดชั่วคราว' :
       status === 'ERROR' ? 'ผิดพลาด' :
       status === 'COMPLETED' ? 'เสร็จแล้ว' : status}
    </span>
  )
}

interface DashboardProps {
  stats: any
  jobs: any[]
  torrents: any[]
  onRefresh: () => void
}

export default function Dashboard({ stats, jobs, torrents, onRefresh }: DashboardProps) {
  const statCards = [
    {
      label: 'งานทั้งหมด',
      value: stats?.jobs.total ?? 0,
      sub: `${stats?.jobs.active ?? 0} กำลังทำงาน`,
      icon: Briefcase,
      color: 'blue',
    },
    {
      label: 'ทอร์เรนต์',
      value: stats?.torrents.total ?? 0,
      sub: `${stats?.torrents.active ?? 0} กำลังดาวน์โหลด`,
      icon: Download,
      color: 'violet',
    },
    {
      label: 'ดาวน์โหลด',
      value: formatSpeed(stats?.torrents.downloadSpeed ?? 0),
      sub: 'ความเร็วปัจจุบัน',
      icon: ArrowDown,
      color: 'emerald',
    },
    {
      label: 'อัพโหลด',
      value: formatSpeed(stats?.torrents.uploadSpeed ?? 0),
      sub: 'ความเร็วปัจจุบัน',
      icon: ArrowUp,
      color: 'sky',
    },
  ]

  const colorMap: Record<string, string> = {
    blue:   'bg-blue-500/10 border-blue-500/20 text-blue-400',
    violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
    emerald:'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    sky:    'bg-sky-500/10 border-sky-500/20 text-sky-400',
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">ภาพรวมระบบ</h1>
          <p className="text-sm text-slate-500 mt-0.5">TorrentSync File Synchronization</p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 bg-[#1e2435] hover:bg-[#252c40] px-3 py-2 rounded-lg border border-[#2a3045] transition-colors"
        >
          <RefreshCw size={14} />
          รีเฟรช
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-[#1e2435] border border-[#2a3045] rounded-xl p-4">
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border ${colorMap[color]} mb-3`}>
              <Icon size={18} />
            </div>
            <div className="text-2xl font-bold text-slate-100 mono">{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
            <div className="text-xs text-slate-600 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Recent Jobs */}
      <div className="bg-[#1e2435] border border-[#2a3045] rounded-xl">
        <div className="px-4 py-3 border-b border-[#2a3045] flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-200">งานล่าสุด</h2>
        </div>
        {jobs.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            ยังไม่มีงาน — <span className="text-blue-400">สร้างงานใหม่</span>ในแท็บ "งานซิงค์"
          </div>
        ) : (
          <div className="divide-y divide-[#2a3045]">
            {jobs.slice(0, 5).map(job => (
              <div key={job.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    job.status === 'RUNNING' ? 'bg-emerald-400' :
                    job.status === 'ERROR' ? 'bg-red-400' :
                    job.status === 'PAUSED' ? 'bg-yellow-400' : 'bg-slate-600'
                  }`} />
                  <div>
                    <div className="text-sm text-slate-200">{job.name}</div>
                    <div className="text-xs text-slate-500 mono">{job.sourcePath}</div>
                  </div>
                </div>
                <StatusBadge status={job.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Logs */}
      {stats?.recentLogs?.length > 0 && (
        <div className="bg-[#1e2435] border border-[#2a3045] rounded-xl">
          <div className="px-4 py-3 border-b border-[#2a3045]">
            <h2 className="text-sm font-medium text-slate-200">ประวัติกิจกรรม</h2>
          </div>
          <div className="p-2 space-y-0.5 max-h-48 overflow-y-auto">
            {stats.recentLogs.map((log: any) => (
              <div key={log.id} className="flex items-start gap-2 px-2 py-1.5 rounded hover:bg-[#252c40]">
                <span className={`mt-0.5 ${
                  log.level === 'ERROR' ? 'text-red-400' :
                  log.level === 'WARN' ? 'text-yellow-400' :
                  log.level === 'SUCCESS' ? 'text-emerald-400' : 'text-blue-400'
                }`}>
                  {log.level === 'ERROR' ? '✕' :
                   log.level === 'WARN' ? '!' :
                   log.level === 'SUCCESS' ? '✓' : '·'}
                </span>
                <span className="text-xs text-slate-400 flex-1">{log.message}</span>
                <span className="text-xs text-slate-600 mono shrink-0">
                  {new Date(log.createdAt).toLocaleTimeString('th-TH')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
