import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { currentUser, login, register, switchUser } from './auth.controller.js'

export const publicAuthRoutes = Router()
publicAuthRoutes.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false }))
publicAuthRoutes.post('/register', register)
publicAuthRoutes.post('/login', login)

export const authRoutes = Router()
authRoutes.get('/me', currentUser)
authRoutes.post('/switch', switchUser)
