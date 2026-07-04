import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guardClient } from '@/lib/guardClient'

// GET: game list — blocked when expired
export async function GET(req: NextRequest) {
  const guard = await guardClient(req)
  if (!guard.ok) return guard.response

  const { clientId } = guard

  const games = await prisma.game.findMany({
    where: { status: { not: 'DISABLED' } },
    include: {
      category: true,
      clientGames: { where: { clientId } },
    },
    orderBy: [{ category: { sortOrder: 'asc' } }, { name: 'asc' }],
  })

  return NextResponse.json(games.map(g => ({
    id: g.id,
    name: g.name,
    version: g.version,
    description: g.description,
    coverImage: g.coverImage,
    sizeBytes: g.sizeBytes.toString(),
    categoryId: g.categoryId,
    categoryName: g.category.name,
    categoryIcon: g.category.icon,
    hasMagnet: !!g.magnetLink,
    hasFtp: !!g.ftpPath,
    serverPath: g.serverPath,
    syncStatus: g.clientGames[0] || null,
  })))
}

// POST: register sync entry — blocked when expired
export async function POST(req: NextRequest) {
  const guard = await guardClient(req)
  if (!guard.ok) return guard.response

  const { clientId } = guard
  const { gameId, downloadMethod } = await req.json()

  const entry = await prisma.clientGame.upsert({
    where: { clientId_gameId: { clientId, gameId } },
    update: { downloadMethod, status: 'PENDING' },
    create: { clientId, gameId, downloadMethod: downloadMethod || 'TORRENT', status: 'PENDING' },
  })

  return NextResponse.json(entry)
}
