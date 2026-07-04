import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const cats = await prisma.category.findMany({
    include: { _count: { select: { games: true } } },
    orderBy: { sortOrder: 'asc' }
  })
  return NextResponse.json(cats)
}

export async function POST(req: NextRequest) {
  try {
    const { name, icon, color } = await req.json()
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
    const cat = await prisma.category.create({ data: { name, icon: icon || '🎮', color: color || '#6366f1' } })
    return NextResponse.json(cat, { status: 201 })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
