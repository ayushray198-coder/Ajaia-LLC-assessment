import { createHmac, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { AppError } from '../../shared/errors/AppError.js'
import { createUser, findByDemoId, findByEmail } from '../users/user.repository.js'
import { DEMO_USER_IDS } from './auth.constants.js'
import { env } from '../../config/env.js'

const scrypt = promisify(scryptCallback)
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7

function publicUser(user) {
  const value = user.toObject ? user.toObject() : user
  const { passwordHash, ...safeUser } = value
  return safeUser
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const key = await scrypt(password, salt, 64)
  return `scrypt$${salt}$${key.toString('hex')}`
}

async function verifyPassword(password, passwordHash) {
  const [algorithm, salt, storedKey] = (passwordHash || '').split('$')
  if (algorithm !== 'scrypt' || !salt || !storedKey) return false
  const key = await scrypt(password, salt, 64)
  const expected = Buffer.from(storedKey, 'hex')
  return expected.length === key.length && timingSafeEqual(expected, key)
}

function signToken(userId) {
  const payload = Buffer.from(JSON.stringify({ sub: String(userId), exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS })).toString('base64url')
  const signature = createHmac('sha256', env.AUTH_TOKEN_SECRET).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

export function verifyToken(token) {
  if (typeof token !== 'string') return null
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null
  const expected = createHmac('sha256', env.AUTH_TOKEN_SECRET).update(payload).digest()
  let received
  try { received = Buffer.from(signature, 'base64url') } catch { return null }
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return claims.exp > Math.floor(Date.now() / 1000) && typeof claims.sub === 'string' ? claims.sub : null
  } catch { return null }
}

export async function registerAccount({ name, email, password }) {
  const existing = await findByEmail(email.toLowerCase())
  if (existing) throw new AppError(409, 'An account with this email already exists.', 'EMAIL_IN_USE')
  const normalizedName = name.trim()
  let user
  try {
    user = await createUser({
      name: normalizedName,
      email: email.toLowerCase(),
      demoId: `account_${randomUUID()}`,
      initials: normalizedName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(),
      passwordHash: await hashPassword(password),
    })
  } catch (error) {
    if (error?.code === 11000) throw new AppError(409, 'An account with this email already exists.', 'EMAIL_IN_USE')
    throw error
  }
  return { user: publicUser(user), token: signToken(user._id) }
}

export async function loginAccount({ email, password }) {
  const user = await findByEmail(email.toLowerCase())
  if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    throw new AppError(401, 'Email or password is incorrect.', 'INVALID_CREDENTIALS')
  }
  return { user: publicUser(user), token: signToken(user._id) }
}

export async function getDemoUser(demoId) {
  if (!DEMO_USER_IDS.includes(demoId)) return null
  return findByDemoId(demoId)
}

export async function switchDemoUser(demoId) {
  if (!DEMO_USER_IDS.includes(demoId)) throw new AppError(400, 'Unknown demo user.', 'INVALID_DEMO_USER')
  const user = await findByDemoId(demoId)
  if (!user) throw new AppError(503, 'Demo users are not ready.', 'DEMO_USERS_UNAVAILABLE')
  return user
}
