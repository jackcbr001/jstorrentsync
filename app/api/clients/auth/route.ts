import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPin, signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { pinCode } = await req.json()
    if (!pinCode) return NextResponse.json({ error: 'PIN required' }, { status: 400 })

    const clients = await prisma.client.findMany({ where: { isActive: true } })

    let matched = null
    for (const c of clients) {
      const ok = await verifyPin(pinCode, c.pinCode)
      if (ok) { matched = c; break }
    }

    if (!matched) return NextResponse.json({ error: 'รหัสไม่ถูกต้อง' }, { status: 401 })

    // Check expiry
    if (matched.expiresAt && matched.expiresAt < new Date()) {
      return NextResponse.json({
        error: 'บัญชีหมดอายุแล้ว กรุณาติดต่อผู้ดูแลระบบเพื่อต่ออายุ',
        expired: true,
        expiresAt: matched.expiresAt,
      }, { status: 403 })
    }

    // Update last seen
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || ''
    await prisma.client.update({
      where: { id: matched.id },
      data: { lastSeen: new Date(), ipAddress: ip }
    })

    const token = await signToken({ clientId: matched.id, shopName: matched.shopName, role: 'client' })

    const res = NextResponse.json({
      token,
      client: { id: matched.id, shopName: matched.shopName, description: matched.description }
    })
    res.cookies.set('client_token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: '/' })
    return res
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
