import 'dotenv/config'
import cors from 'cors'

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  'http://localhost:5173',
  'https://ajaia-llc-assessment.vercel.app',
].filter(Boolean)

export const corsMiddleware = cors({
  origin: [...new Set(allowedOrigins)],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Demo-User'],
  maxAge: 600,
})
