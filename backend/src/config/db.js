import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectDB() {
  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing. Set it in backend/.env before starting the API.')
  }
  await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DATABASE })
}
