import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export type GuardResult =
  | { ok: true; clientId: string; client: any }
  | { ok: false; response: NextResponse }

/**
 * Call at the top of every protected API route.
 * Returns the verified client OR a ready-made error response.
 *
 * Checks (in order):
 *  1. Token present & valid JWT
 *  2. Client exists in DB
 *  3. Client.isActive === true
 *  4. Client.expiresAt is null OR in the future
 */
export async function guardClient(req: NextRequest): Promise<GuardResult> {
  const token =
    req.cookies.get('client_token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized', code: 'NO_TOKEN' }, { status: 401 }),
    }
  }

  const payload = await verifyToken(token)
  if (!payload?.clientId) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized', code: 'INVALID_TOKEN' }, { status: 401 }),
    }
  }

  const clientId = payload.clientId as string

  const client = await prisma.client.findUnique({ where: { id: clientId } })
  if (!client) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'ไม่พบบัญชีผู้ใช้', code: 'NOT_FOUND' }, { status: 404 }),
    }
  }

  if (!client.isActive) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'บัญชีถูกปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบ', code: 'DISABLED' },
        { status: 403 }
      ),
    }
  }

  if (client.expiresAt && client.expiresAt < new Date()) {
    const expiredDaysAgo = Math.ceil(
      (Date.now() - client.expiresAt.getTime()) / 86_400_000
    )
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: 'สมาชิกหมดอายุแล้ว กรุณาติดต่อผู้ดูแลระบบเพื่อต่ออายุ',
          code: 'EXPIRED',
          expiresAt: client.expiresAt,
          expiredDaysAgo,
          shopName: client.shopName,
        },
        { status: 403 }
      ),
    }
  }

  return { ok: true, clientId, client }
}
