import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all torrents (with optional jobId filter)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const jobId = searchParams.get('jobId')
    const status = searchParams.get('status')

    const torrents = await prisma.torrent.findMany({
      where: {
        ...(jobId ? { jobId } : {}),
        ...(status ? { status: status as any } : {}),
      },
      include: {
        files: true,
        job: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const serialized = torrents.map(t => ({
      ...t,
      size: t.size.toString(),
      files: t.files.map(f => ({ ...f, size: f.size.toString() }))
    }))

    return NextResponse.json(serialized)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch torrents' }, { status: 500 })
  }
}

// POST add torrent to job
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { jobId, name, magnetLink, infoHash, size, filePath } = body

    if (!jobId || !name || !magnetLink || !infoHash) {
      return NextResponse.json(
        { error: 'jobId, name, magnetLink, infoHash are required' },
        { status: 400 }
      )
    }

    // Check if torrent already exists
    const existing = await prisma.torrent.findUnique({ where: { infoHash } })
    if (existing) {
      return NextResponse.json({ error: 'Torrent already exists', torrent: existing }, { status: 409 })
    }

    const torrent = await prisma.torrent.create({
      data: {
        jobId,
        name,
        magnetLink,
        infoHash,
        size: BigInt(size || 0),
        filePath,
        status: 'PENDING',
      }
    })

    await prisma.syncLog.create({
      data: {
        jobId,
        level: 'INFO',
        message: `Torrent added: ${name}`,
      }
    })

    return NextResponse.json({ ...torrent, size: torrent.size.toString() }, { status: 201 })
  } catch (error) {
    console.error('POST /api/torrents error:', error)
    return NextResponse.json({ error: 'Failed to add torrent' }, { status: 500 })
  }
}
