import { DEMO_USER_IDS } from './auth.constants.js'
import { getDemoUser, verifyToken } from './auth.service.js'
import { findById } from '../users/user.repository.js'

export async function requireDemoUser(request, response, next) {
  try {
    const authorization = request.get('Authorization')
    if (authorization?.startsWith('Bearer ')) {
      const userId = await verifyToken(authorization.slice(7))
      const user = userId ? await findById(userId) : null
      if (!user) return response.status(401).json({ success: false, message: 'Please sign in again.', code: 'UNAUTHENTICATED' })
      request.user = user
      return next()
    }

    const demoId = request.get('X-Demo-User')
    if (!demoId) return response.status(401).json({ success: false, message: 'Please sign in to continue.', code: 'UNAUTHENTICATED' })

    if (!DEMO_USER_IDS.includes(demoId)) {
      return response.status(401).json({ success: false, message: 'Unknown demo user.', code: 'INVALID_DEMO_USER' })
    }

    const user = await getDemoUser(demoId)
    if (!user) {
      return response.status(503).json({ success: false, message: 'Demo users are not ready.', code: 'DEMO_USERS_UNAVAILABLE' })
    }
    request.user = user
    return next()
  } catch (error) {
    return next(error)
  }
}
