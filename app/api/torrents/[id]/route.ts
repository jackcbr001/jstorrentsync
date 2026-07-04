import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH update torrent progress/status (called from WebTorrent client)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { progress, status, downloadSpeed, uploadSpeed, peers, seeds } = body

    const torrent = await prisma.torrent.update({
      where: { id: params.id },
      data: {
        ...(progress !== undefined && { progress }),
        ...(status && { status }),
        ...(downloadSpeed !== undefined && { downloadSpeed }),
        ...(uploadSpeed !== undefined && { uploadSpeed }),
        ...(peers !== undefined && { peers }),
        ...(seeds !== undefined && { seeds }),
      }
    })

    return NextResponse.json({ ...torrent, size: torrent.size.toString() })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update torrent' }, { status: 500 })
  }
}

// DELETE remove torrent
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const torrent = await prisma.torrent.findUnique({
      where: { id: params.id },
      select: { jobId: true, name: true }
    })

    await prisma.torrent.delete({ where: { id: params.id } })

    if (torrent) {
      await prisma.syncLog.create({
        data: {
          jobId: torrent.jobId,
          level: 'WARN',
          message: `Torrent removed: ${torrent.name}`,
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete torrent' }, { status: 500 })
  }
}
