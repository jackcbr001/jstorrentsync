import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'gamesync-secret-key-change-in-production'
)

export async function hashPin(pin: string) {
  return bcrypt.hash(pin, 10)
}

export async function verifyPin(pin: string, hash: string) {
  return bcrypt.compare(pin, hash)
}

export async function signToken(payload: Record<string, unknown>, expiresIn = '7d') {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(SECRET)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload
  } catch {
    return null
  }
}

export const ADMIN_PIN = process.env.ADMIN_PIN || '000000'
