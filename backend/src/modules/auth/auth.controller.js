import { z } from 'zod'
import { loginAccount, registerAccount, switchDemoUser } from './auth.service.js'

const switchSchema = z.object({ demoId: z.string().min(1).max(32) })
const registerSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name.').max(80, 'Name must be 80 characters or less.'),
  email: z.string().trim().email('Enter a valid email address.').max(254),
  password: z.string().min(6, 'Password must be at least 6 characters.').max(128),
})
const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.').max(254),
  password: z.string().min(1, 'Enter your password.').max(128),
})

export async function register(request, response) {
  const input = registerSchema.parse(request.body)
  response.status(201).json({ success: true, data: await registerAccount(input) })
}

export async function login(request, response) {
  const input = loginSchema.parse(request.body)
  response.json({ success: true, data: await loginAccount(input) })
}

export function currentUser(request, response) {
  response.json({ success: true, data: request.user })
}

export async function switchUser(request, response) {
  const { demoId } = switchSchema.parse(request.body)
  const data = await switchDemoUser(demoId)
  response.json({ success: true, data })
}
