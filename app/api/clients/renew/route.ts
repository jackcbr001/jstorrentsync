import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { clientId, daysAdded, planName, note } = await req.json()
    if (!clientId || !daysAdded) {
      return NextResponse.json({ error: 'clientId and daysAdded required' }, { status: 400 })
    }

    const client = await prisma.client.findUnique({ where: { id: clientId } })
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    // Calculate new expiry: extend from current expiry or from now (whichever is later)
    const base = client.expiresAt && client.expiresAt > new Date()
      ? client.expiresAt   // still active → extend from current expiry
      : new Date()         // expired/none → start fresh from today

    const newExpiry = new Date(base)
    newExpiry.setDate(newExpiry.getDate() + Number(daysAdded))

    // Update client
    const updated = await prisma.client.update({
      where: { id: clientId },
      data: {
        expiresAt: newExpiry,
        isActive: true,
        planName: planName || client.planName,
      },
    })

    // Record subscription history
    const sub = await prisma.subscription.create({
      data: {
        clientId,
        planName: planName || client.planName || 'ต่ออายุ',
        daysAdded: Number(daysAdded),
        expiresAt: newExpiry,
        note: note || null,
      },
    })

    const { pinCode: _, ...safe } = updated
    return NextResponse.json({ client: safe, subscription: sub, newExpiry })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to renew' }, { status: 500 })
  }
}
