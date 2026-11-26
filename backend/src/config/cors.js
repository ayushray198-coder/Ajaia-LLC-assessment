import cors from 'cors'
import { env } from './env.js'

export const corsMiddleware = cors({
  origin: env.CLIENT_ORIGIN,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Demo-User'],
  maxAge: 600,
})
