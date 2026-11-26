import { z } from 'zod'

export const importDocumentSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  content: z.string().max(1_000_000),
})
