import mongoose from 'mongoose'
import { app, env } from './app.js'
import { connectDB } from './config/db.js'
import { seedDemoUsers } from './modules/users/user.service.js'

async function start() {
  await connectDB()
  await seedDemoUsers()

  const server = app.listen(env.PORT)

  const shutdown = async () => {
    server.close()
    await mongoose.disconnect()
  }
  process.once('SIGINT', shutdown)
  process.once('SIGTERM', shutdown)
}

start().catch((error) => {
  console.error('Backend startup failed:', error.message)
  process.exitCode = 1
})
