'use client'

import { useState, useEffect, useCallback } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminDashboard from '@/components/admin/AdminDashboard'
import GamesPanel from '@/components/admin/GamesPanel'
import ClientsPanel from '@/components/admin/ClientsPanel'
import CategoriesPanel from '@/components/admin/CategoriesPanel'
import LogsPanel from '@/components/admin/LogsPanel'

export type AdminView = 'dashboard' | 'games' | 'clients' | 'categories' | 'logs'

export default function AdminPage() {
  const [view, setView] = useState<AdminView>('dashboard')
  const [stats, setStats] = useState<any>(null)
  const [games, setGames] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])

  const fetchAll = useCallback(async () => {
    try {
      const [sRes, gRes, cRes, clRes] = await Promise.all([
        fetch('/api/settings/stats'),
        fetch('/api/games'),
        fetch('/api/categories'),
        fetch('/api/clients'),
      ])
      if (sRes.ok) setStats(await sRes.json())
      if (gRes.ok) setGames(await gRes.json())
      if (cRes.ok) setCategories(await cRes.json())
      if (clRes.ok) setClients(await clRes.json())
    } catch (e) { console.error(e) }
  }, [])

  useEffect(() => {
    fetchAll()
    const t = setInterval(fetchAll, 8000)
    return () => clearInterval(t)
  }, [fetchAll])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#080a10' }}>
      <AdminSidebar view={view} onNavigate={setView} stats={stats} />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {view === 'dashboard'   && <AdminDashboard stats={stats} games={games} onRefresh={fetchAll} />}
        {view === 'games'       && <GamesPanel games={games} categories={categories} onRefresh={fetchAll} />}
        {view === 'clients'     && <ClientsPanel clients={clients} onRefresh={fetchAll} />}
        {view === 'categories'  && <CategoriesPanel categories={categories} onRefresh={fetchAll} />}
        {view === 'logs'        && <LogsPanel />}
      </main>
    </div>
  )
}
