import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { create } from './import.controller.js'

export const importRoutes = Router()
importRoutes.post('/import', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false }), create)
