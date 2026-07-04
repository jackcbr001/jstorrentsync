import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all jobs
export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        torrents: {
          select: {
            id: true,
            name: true,
            status: true,
            progress: true,
            downloadSpeed: true,
            uploadSpeed: true,
            peers: true,
            size: true,
          }
        },
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    const serialized = jobs.map(job => ({
      ...job,
      torrents: job.torrents.map(t => ({
        ...t,
        size: t.size.toString(),
      }))
    }))

    return NextResponse.json(serialized)
  } catch (error) {
    console.error('GET /api/jobs error:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

// POST create new job
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, sourcePath, destPath, schedule, autoSync } = body

    if (!name || !sourcePath || !destPath) {
      return NextResponse.json(
        { error: 'name, sourcePath, and destPath are required' },
        { status: 400 }
      )
    }

    const job = await prisma.job.create({
      data: {
        name,
        description,
        sourcePath,
        destPath,
        schedule,
        autoSync: autoSync ?? false,
        status: 'IDLE',
      }
    })

    await prisma.syncLog.create({
      data: {
        jobId: job.id,
        level: 'INFO',
        message: `Job "${name}" created successfully`,
      }
    })

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error('POST /api/jobs error:', error)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}
