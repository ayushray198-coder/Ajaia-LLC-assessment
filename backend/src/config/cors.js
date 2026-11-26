import 'dotenv/config'
import cors from 'cors'

export const corsMiddleware = cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Demo-User'],
  maxAge: 600,
})
