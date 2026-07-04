import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPin } from '@/lib/auth'

export async function GET() {
  const clients = await prisma.client.findMany({
    include: {
      _count: { select: { clientGames: true } },
      subscriptions: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(clients.map(({ pinCode: _, ...c }) => c))
}

export async function POST(req: NextRequest) {
  try {
    const { shopName, pinCode, description, planName, expiresAt, daysValid } = await req.json()
    if (!shopName || !pinCode) return NextResponse.json({ error: 'shopName and pinCode required' }, { status: 400 })
    if (pinCode.length < 4) return NextResponse.json({ error: 'PIN must be at least 4 digits' }, { status: 400 })

    // Calculate expiry
    let expiry: Date | null = null
    if (daysValid && Number(daysValid) > 0) {
      expiry = new Date()
      expiry.setDate(expiry.getDate() + Number(daysValid))
    } else if (expiresAt) {
      expiry = new Date(expiresAt)
    }

    const hashed = await hashPin(pinCode)
    const client = await prisma.client.create({
      data: {
        shopName, pinCode: hashed, description,
        planName: planName || null,
        expiresAt: expiry,
      },
    })

    // Create first subscription record if has expiry
    if (expiry) {
      await prisma.subscription.create({
        data: {
          clientId: client.id,
          planName: planName || 'เริ่มต้น',
          daysAdded: Number(daysValid) || 0,
          expiresAt: expiry,
          note: 'สร้างใหม่',
        },
      })
    }

    const { pinCode: _, ...safe } = client
    return NextResponse.json(safe, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, isActive, shopName, description, planName } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const updated = await prisma.client.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(shopName && { shopName }),
        ...(description !== undefined && { description }),
        ...(planName !== undefined && { planName }),
      },
    })
    const { pinCode: _, ...safe } = updated
    return NextResponse.json(safe)
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await prisma.client.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
