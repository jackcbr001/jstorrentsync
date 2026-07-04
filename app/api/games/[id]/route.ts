import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const game = await prisma.game.findUnique({
      where: { id: params.id },
      include: { category: true, clientGames: { include: { client: true } } }
    })
    if (!game) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ...game, sizeBytes: game.sizeBytes.toString() })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const game = await prisma.game.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.version && { version: body.version }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.categoryId && { categoryId: body.categoryId }),
        ...(body.serverPath && { serverPath: body.serverPath }),
        ...(body.magnetLink !== undefined && { magnetLink: body.magnetLink }),
        ...(body.ftpPath !== undefined && { ftpPath: body.ftpPath }),
        ...(body.ftpHost !== undefined && { ftpHost: body.ftpHost }),
        ...(body.ftpUser !== undefined && { ftpUser: body.ftpUser }),
        ...(body.ftpPass !== undefined && { ftpPass: body.ftpPass }),
        ...(body.status && { status: body.status }),
        ...(body.sizeBytes !== undefined && { sizeBytes: BigInt(body.sizeBytes) }),
        ...(body.checksum !== undefined && { checksum: body.checksum }),
        ...(body.coverImage !== undefined && { coverImage: body.coverImage }),
      },
      include: { category: true }
    })
    return NextResponse.json({ ...game, sizeBytes: game.sizeBytes.toString() })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.game.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
