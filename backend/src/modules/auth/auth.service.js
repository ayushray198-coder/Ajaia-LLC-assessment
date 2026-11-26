import { createHash, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { AppError } from '../../shared/errors/AppError.js'
import { createUser, findByDemoId, findByEmail } from '../users/user.repository.js'
import { DEMO_USER_IDS } from './auth.constants.js'
import { AuthSession } from './session.model.js'

const scrypt = promisify(scryptCallback)
const TOKEN_TTL_MS = 60 * 60 * 24 * 7 * 1000
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/

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

async function createAuthToken(userId) {
  const token = randomBytes(32).toString('base64url')
  const tokenHash = createHash('sha256').update(token).digest('hex')
  await AuthSession.create({
    userId,
    tokenHash,
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
  })
  return token
}

export async function verifyToken(token) {
  if (typeof token !== 'string' || !TOKEN_PATTERN.test(token)) return null

  const tokenHash = createHash('sha256').update(token).digest('hex')
  const session = await AuthSession.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
  }).select('userId').lean()

  return session?.userId ? String(session.userId) : null
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
  return { user: publicUser(user), token: await createAuthToken(user._id) }
}

export async function loginAccount({ email, password }) {
  const user = await findByEmail(email.toLowerCase())
  if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    throw new AppError(401, 'Email or password is incorrect.', 'INVALID_CREDENTIALS')
  }
  return { user: publicUser(user), token: await createAuthToken(user._id) }
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
