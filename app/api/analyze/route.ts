import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guardClient } from '@/lib/guardClient'

export async function POST(req: NextRequest) {
  const guard = await guardClient(req)
  if (!guard.ok) return guard.response

  const { clientId } = guard

  try {
    const { gameId, localChecksum, localVersion } = await req.json()

    const game = await prisma.game.findUnique({ where: { id: gameId } })
    if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 })

    const needsUpdate =
      !localVersion ||
      localVersion !== game.version ||
      (localChecksum && game.checksum && localChecksum !== game.checksum)

    const status = needsUpdate ? 'PENDING' : 'UP_TO_DATE'

    await prisma.clientGame.upsert({
      where: { clientId_gameId: { clientId, gameId } },
      update: { status, localVersion },
      create: { clientId, gameId, status, localVersion },
    })

    await prisma.downloadLog.create({
      data: {
        clientId, gameId, method: 'TORRENT', status: 'INFO',
        message: needsUpdate
          ? `วิเคราะห์เสร็จ: ต้องอัพเดท (local: ${localVersion || 'ไม่มี'} → server: ${game.version})`
          : `วิเคราะห์เสร็จ: ไฟล์อัพเดทแล้ว (v${game.version})`,
      },
    })

    return NextResponse.json({
      needsUpdate,
      serverVersion: game.version,
      serverChecksum: game.checksum,
      localVersion,
      status,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Analyze failed' }, { status: 500 })
  }
}
