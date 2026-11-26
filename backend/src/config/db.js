import 'dotenv/config'
import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGODB_URI?.trim()
  if (!uri) {
    throw new Error('MONGODB_URI is missing. Set it in backend/.env before starting the API.')
  }
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DATABASE || 'atlas_app' })
}
