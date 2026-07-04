import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [
      totalJobs,
      activeJobs,
      totalTorrents,
      activeTorrents,
      recentLogs,
      torrentStats,
    ] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({ where: { status: 'RUNNING' } }),
      prisma.torrent.count(),
      prisma.torrent.count({ where: { status: { in: ['DOWNLOADING', 'SEEDING'] } } }),
      prisma.syncLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { job: { select: { name: true } } }
      }),
      prisma.torrent.aggregate({
        _sum: { downloadSpeed: true, uploadSpeed: true },
        _count: { peers: true },
        where: { status: { in: ['DOWNLOADING', 'SEEDING'] } }
      }),
    ])

    return NextResponse.json({
      jobs: { total: totalJobs, active: activeJobs },
      torrents: {
        total: totalTorrents,
        active: activeTorrents,
        downloadSpeed: torrentStats._sum.downloadSpeed || 0,
        uploadSpeed: torrentStats._sum.uploadSpeed || 0,
      },
      recentLogs,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
