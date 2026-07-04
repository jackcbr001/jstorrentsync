'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import Dashboard from '@/components/Dashboard'
import JobList from '@/components/JobList'
import TorrentList from '@/components/TorrentList'
import ActivityLog from '@/components/ActivityLog'

export type View = 'dashboard' | 'jobs' | 'torrents' | 'logs'

export default function Home() {
  const [view, setView] = useState<View>('dashboard')
  const [stats, setStats] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [torrents, setTorrents] = useState<any[]>([])

  const fetchAll = useCallback(async () => {
    try {
      const [statsRes, jobsRes, torrentsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/jobs'),
        fetch('/api/torrents'),
      ])
      if (statsRes.ok) setStats(await statsRes.json())
      if (jobsRes.ok) setJobs(await jobsRes.json())
      if (torrentsRes.ok) setTorrents(await torrentsRes.json())
    } catch (err) {
      console.error('Fetch error:', err)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 5000) // Poll every 5s
    return () => clearInterval(interval)
  }, [fetchAll])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentView={view} onNavigate={setView} stats={stats} />

      <main className="flex-1 overflow-y-auto bg-[#0d0f14]">
        {view === 'dashboard' && (
          <Dashboard stats={stats} jobs={jobs} torrents={torrents} onRefresh={fetchAll} />
        )}
        {view === 'jobs' && (
          <JobList jobs={jobs} onRefresh={fetchAll} />
        )}
        {view === 'torrents' && (
          <TorrentList torrents={torrents} jobs={jobs} onRefresh={fetchAll} />
        )}
        {view === 'logs' && (
          <ActivityLog />
        )}
      </main>
    </div>
  )
}
