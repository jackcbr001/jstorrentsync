import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId')
    const status = searchParams.get('status')

    const games = await prisma.game.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(status ? { status: status as any } : {}),
      },
      include: { category: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(games.map(g => ({
      ...g, sizeBytes: g.sizeBytes.toString()
    })))
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, version, description, categoryId, serverPath, magnetLink,
            ftpPath, ftpHost, ftpUser, ftpPass, sizeBytes, coverImage } = body

    if (!name || !categoryId || !serverPath) {
      return NextResponse.json({ error: 'name, categoryId, serverPath required' }, { status: 400 })
    }

    const game = await prisma.game.create({
      data: {
        name, version: version || '1.0.0', description, categoryId,
        serverPath, magnetLink, ftpPath, ftpHost, ftpUser, ftpPass,
        sizeBytes: BigInt(sizeBytes || 0), coverImage,
      },
      include: { category: true }
    })

    return NextResponse.json({ ...game, sizeBytes: game.sizeBytes.toString() }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 })
  }
}
