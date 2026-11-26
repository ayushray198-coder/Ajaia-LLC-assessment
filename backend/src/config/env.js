import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().default(''),
  MONGODB_DATABASE: z.string().default('atlas_app'),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  AUTH_TOKEN_SECRET: z.string().min(32).default('draftly-local-development-secret-change-before-deploying'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.issues.map((issue) => issue.path.join('.') + ' ' + issue.message).join('; ')}`)
}

export const env = parsed.data

if (env.NODE_ENV === 'production' && ['draftly-local-development-secret-change-before-deploying', 'replace-this-with-a-long-random-secret'].includes(env.AUTH_TOKEN_SECRET)) {
  throw new Error('AUTH_TOKEN_SECRET must be set to a private value in production.')
}
