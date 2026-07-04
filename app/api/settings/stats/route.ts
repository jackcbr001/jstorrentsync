import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const [
      totalGames, totalClients, activeClients, totalCategories,
      activeDownloads, recentLogs, topGames, syncSummary,
      expiredClients, expiringClients,
    ] = await Promise.all([
      prisma.game.count(),
      prisma.client.count(),
      prisma.client.count({ where: { lastSeen: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24) } } }),
      prisma.category.count(),
      prisma.clientGame.count({ where: { status: 'DOWNLOADING' } }),
      prisma.downloadLog.findMany({
        orderBy: { createdAt: 'desc' }, take: 30,
        include: { client: { select: { shopName: true } }, game: { select: { name: true } } }
      }),
      prisma.game.findMany({
        orderBy: { downloadCount: 'desc' }, take: 5,
        include: { category: { select: { name: true, icon: true } } },
        select: { id: true, name: true, downloadCount: true, version: true, category: true }
      }),
      prisma.clientGame.groupBy({ by: ['status'], _count: { status: true } }),
      // Clients already expired
      prisma.client.count({ where: { expiresAt: { lt: now } } }),
      // Clients expiring within 7 days (but not yet expired)
      prisma.client.count({ where: { expiresAt: { gte: now, lte: in7days } } }),
    ])

    return NextResponse.json({
      games: totalGames,
      clients: totalClients,
      activeClients,
      categories: totalCategories,
      activeDownloads,
      recentLogs,
      topGames,
      syncSummary,
      expiredClients,
      expiringClients,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
