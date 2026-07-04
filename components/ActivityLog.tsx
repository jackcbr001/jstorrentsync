'use client'

import { useState, useEffect } from 'react'
import { ScrollText, RefreshCw } from 'lucide-react'

export default function ActivityLog() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/stats')
      if (res.ok) {
        const data = await res.json()
        setLogs(data.recentLogs || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    const i = setInterval(fetchLogs, 5000)
    return () => clearInterval(i)
  }, [])

  const levelIcon: Record<string, string> = {
    INFO: '·', WARN: '!', ERROR: '✕', SUCCESS: '✓'
  }
  const levelClass: Record<string, string> = {
    INFO: 'text-blue-400', WARN: 'text-yellow-400',
    ERROR: 'text-red-400', SUCCESS: 'text-emerald-400'
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">ประวัติกิจกรรม</h1>
          <p className="text-sm text-slate-500 mt-0.5">{logs.length} รายการล่าสุด</p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 bg-[#1e2435] px-3 py-2 rounded-lg border border-[#2a3045]"
        >
          <RefreshCw size={14} />
          รีเฟรช
        </button>
      </div>

      <div className="bg-[#1e2435] border border-[#2a3045] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-[#161b27] border-b border-[#2a3045] text-xs text-slate-500 font-medium">
          <div className="col-span-1">ระดับ</div>
          <div className="col-span-2">งาน</div>
          <div className="col-span-7">ข้อความ</div>
          <div className="col-span-2 text-right">เวลา</div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-500 text-sm">กำลังโหลด...</div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <ScrollText size={32} className="text-slate-700 mx-auto mb-3" />
            <div className="text-slate-400 text-sm">ยังไม่มีประวัติกิจกรรม</div>
          </div>
        ) : (
          <div className="divide-y divide-[#2a3045] max-h-[calc(100vh-220px)] overflow-y-auto">
            {logs.map((log: any) => (
              <div key={log.id} className="grid grid-cols-12 gap-2 px-4 py-3 text-xs hover:bg-[#252c40]">
                <div className={`col-span-1 font-bold ${levelClass[log.level] ?? 'text-slate-400'}`}>
                  {levelIcon[log.level] ?? '?'} {log.level}
                </div>
                <div className="col-span-2 text-slate-400 truncate">{log.job?.name ?? '—'}</div>
                <div className="col-span-7 text-slate-300">{log.message}</div>
                <div className="col-span-2 text-right text-slate-600 mono">
                  {new Date(log.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'medium' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
