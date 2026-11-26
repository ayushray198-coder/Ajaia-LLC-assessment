import express from 'express'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import mongoose from 'mongoose'
import { env } from './config/env.js'
import { corsMiddleware } from './config/cors.js'
import { requireDemoUser } from './modules/auth/demoAuth.middleware.js'
import { authRoutes, publicAuthRoutes } from './modules/auth/auth.routes.js'
import { userRoutes } from './modules/users/user.routes.js'
import { documentRoutes } from './modules/documents/document.routes.js'
import { sharingRoutes } from './modules/sharing/sharing.routes.js'
import { importRoutes } from './modules/file-import/import.routes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFoundHandler } from './middleware/notFoundHandler.js'

export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  if (env.NODE_ENV === 'production') app.set('trust proxy', 1)
  app.use(helmet())
  app.use(corsMiddleware)
  app.use(express.json({ limit: '8mb' }))
  app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-8', legacyHeaders: false }))

  app.get('/api/health', (_request, response) => {
    const connected = mongoose.connection.readyState === 1
    response.status(connected ? 200 : 503).json({
      success: connected,
      data: { status: connected ? 'ok' : 'unavailable', database: connected ? 'connected' : 'disconnected' },
    })
  })

  app.use('/api/auth', publicAuthRoutes)
  app.use('/api', requireDemoUser)
  app.use('/api/auth', authRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/documents', documentRoutes)
  app.use('/api/documents', sharingRoutes)
  app.use('/api/documents', importRoutes)
  app.use(notFoundHandler)
  app.use(errorHandler)
  return app
}

export const app = createApp()
export { env }
