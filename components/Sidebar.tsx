'use client'

import { View } from '@/app/page'
import {
  LayoutDashboard, Briefcase, Download, ScrollText,
  Wifi, WifiOff, ArrowDown, ArrowUp, RefreshCw
} from 'lucide-react'

interface SidebarProps {
  currentView: View
  onNavigate: (view: View) => void
  stats: any
}

const navItems: { id: View; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'ภาพรวม', icon: LayoutDashboard },
  { id: 'jobs', label: 'งานซิงค์', icon: Briefcase },
  { id: 'torrents', label: 'ทอร์เรนต์', icon: Download },
  { id: 'logs', label: 'ประวัติ', icon: ScrollText },
]

function formatSpeed(bps: number) {
  if (!bps) return '0 B/s'
  if (bps < 1024) return `${bps.toFixed(0)} B/s`
  if (bps < 1024 * 1024) return `${(bps / 1024).toFixed(1)} KB/s`
  return `${(bps / 1024 / 1024).toFixed(1)} MB/s`
}

export default function Sidebar({ currentView, onNavigate, stats }: SidebarProps) {
  const isConnected = true // WebTorrent connection status

  return (
    <aside className="w-56 flex flex-col bg-[#141720] border-r border-[#2a3045] h-screen">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[#2a3045]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <RefreshCw size={16} className="text-blue-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100 leading-none">TorrentSync</div>
            <div className="text-xs text-slate-500 mt-0.5">File Sync Manager</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              currentView === id
                ? 'bg-blue-500/15 text-blue-400 font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e2435]'
            }`}
          >
            <Icon size={16} />
            {label}
            {id === 'jobs' && stats?.jobs.active > 0 && (
              <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 rounded px-1.5 py-0.5">
                {stats.jobs.active}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Status */}
      <div className="p-3 border-t border-[#2a3045] space-y-2">
        <div className="flex items-center gap-2 text-xs">
          {isConnected
            ? <Wifi size={12} className="text-emerald-400" />
            : <WifiOff size={12} className="text-red-400" />}
          <span className={isConnected ? 'text-emerald-400' : 'text-red-400'}>
            {isConnected ? 'เชื่อมต่อแล้ว' : 'ออฟไลน์'}
          </span>
        </div>
        {stats && (
          <>
            <div className="flex items-center gap-2 text-xs text-slate-500 mono">
              <ArrowDown size={11} className="text-emerald-400" />
              <span>{formatSpeed(stats.torrents.downloadSpeed)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mono">
              <ArrowUp size={11} className="text-blue-400" />
              <span>{formatSpeed(stats.torrents.uploadSpeed)}</span>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
