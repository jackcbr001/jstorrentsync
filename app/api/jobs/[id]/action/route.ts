import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { action } = await req.json()
    const jobId = params.id

    const job = await prisma.job.findUnique({ where: { id: jobId } })
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    let newStatus = job.status
    let logMessage = ''

    switch (action) {
      case 'start':
        newStatus = 'RUNNING'
        logMessage = 'Job started - scanning for file changes...'
        break
      case 'pause':
        newStatus = 'PAUSED'
        logMessage = 'Job paused by user'
        break
      case 'stop':
        newStatus = 'IDLE'
        logMessage = 'Job stopped'
        // Pause all active torrents
        await prisma.torrent.updateMany({
          where: { jobId, status: { in: ['DOWNLOADING', 'SEEDING'] } },
          data: { status: 'PAUSED' }
        })
        break
      case 'sync':
        newStatus = 'RUNNING'
        logMessage = 'Manual sync triggered - checking file checksums...'
        break
      case 'complete':
        newStatus = 'COMPLETED'
        logMessage = 'Job completed successfully'
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        status: newStatus,
        ...(action === 'sync' || action === 'start' ? { lastSync: new Date() } : {}),
      }
    })

    await prisma.syncLog.create({
      data: {
        jobId,
        level: action === 'stop' ? 'WARN' : 'INFO',
        message: logMessage,
      }
    })

    return NextResponse.json({ success: true, job: updatedJob, action })
  } catch (error) {
    console.error('Job action error:', error)
    return NextResponse.json({ error: 'Action failed' }, { status: 500 })
  }
}
