import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single job
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        torrents: { include: { files: true } },
        logs: { orderBy: { createdAt: 'desc' }, take: 50 },
      }
    })

    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    const serialized = {
      ...job,
      torrents: job.torrents.map(t => ({
        ...t,
        size: t.size.toString(),
        files: t.files.map(f => ({ ...f, size: f.size.toString() }))
      }))
    }

    return NextResponse.json(serialized)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 })
  }
}

// PUT update job
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { name, description, sourcePath, destPath, schedule, autoSync, status } = body

    const job = await prisma.job.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(sourcePath && { sourcePath }),
        ...(destPath && { destPath }),
        ...(schedule !== undefined && { schedule }),
        ...(autoSync !== undefined && { autoSync }),
        ...(status && { status }),
      }
    })

    await prisma.syncLog.create({
      data: {
        jobId: job.id,
        level: 'INFO',
        message: `Job updated: ${Object.keys(body).join(', ')} changed`,
      }
    })

    return NextResponse.json(job)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 })
  }
}

// DELETE job
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.job.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true, message: 'Job deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
  }
}
