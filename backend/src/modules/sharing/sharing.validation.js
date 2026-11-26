import { z } from 'zod'

export const shareDocumentSchema = z.object({
  userId: z.string().regex(/^[a-f\d]{24}$/i, 'Choose a valid Draftly user.'),
  role: z.enum(['viewer', 'editor']).default('editor'),
})

export const updateShareRoleSchema = z.object({ role: z.enum(['viewer', 'editor']) })
