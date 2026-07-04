import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guardClient } from '@/lib/guardClient'

export async function POST(req: NextRequest) {
  // ── Guard: reject expired / disabled clients immediately ──
  const guard = await guardClient(req)
  if (!guard.ok) return guard.response

  const { clientId } = guard

  try {
    const { gameId, action, method, progress, downloadSpeed } = await req.json()

    const game = await prisma.game.findUnique({ where: { id: gameId } })
    if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 })

    let newStatus: string
    let logMsg: string

    switch (action) {
      case 'start':
        newStatus = 'DOWNLOADING'
        logMsg = `เริ่มดาวน์โหลด "${game.name}" ด้วย ${method === 'FTP' ? 'FTP' : 'Torrent'}`
        await prisma.game.update({ where: { id: gameId }, data: { downloadCount: { increment: 1 } } })
        break
      case 'pause':
        newStatus = 'PAUSED'
        logMsg = `หยุด "${game.name}" ชั่วคราว`
        break
      case 'stop':
        newStatus = 'PENDING'
        logMsg = `หยุด "${game.name}"`
        break
      case 'progress':
        newStatus = 'DOWNLOADING'
        logMsg = ''
        break
      case 'complete':
        newStatus = 'COMPLETED'
        logMsg = `ดาวน์โหลด "${game.name}" เสร็จแล้ว`
        await prisma.clientGame.update({
          where: { clientId_gameId: { clientId, gameId } },
          data: { localVersion: game.version, lastSynced: new Date() },
        })
        break
      case 'error':
        newStatus = 'ERROR'
        logMsg = `ดาวน์โหลด "${game.name}" ผิดพลาด`
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    await prisma.clientGame.upsert({
      where: { clientId_gameId: { clientId, gameId } },
      update: {
        status: newStatus as any,
        downloadMethod: method || 'TORRENT',
        ...(progress !== undefined && { progress }),
        ...(downloadSpeed !== undefined && { downloadSpeed }),
      },
      create: {
        clientId, gameId,
        status: newStatus as any,
        downloadMethod: method || 'TORRENT',
        progress: progress || 0,
      },
    })

    if (logMsg) {
      await prisma.downloadLog.create({
        data: {
          clientId, gameId,
          method: (method || 'TORRENT') as any,
          status: action === 'error' ? 'ERROR' : action === 'complete' ? 'SUCCESS' : 'INFO',
          message: logMsg,
        },
      })
    }

    return NextResponse.json({
      success: true,
      action,
      game: {
        id: game.id,
        name: game.name,
        magnetLink: game.magnetLink,
        ftpPath: game.ftpPath,
        ftpHost: game.ftpHost,
        ftpUser: game.ftpUser,
        ftpPass: game.ftpPass,
        version: game.version,
        sizeBytes: game.sizeBytes.toString(),
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
