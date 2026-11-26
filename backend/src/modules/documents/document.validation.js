import { z } from 'zod'

const richTextContent = z.object({
  type: z.literal('doc'),
  content: z.array(z.unknown()).optional(),
}).passthrough()

export const createDocumentSchema = z.object({
  title: z.string().trim().min(1).max(120).default('Untitled document'),
  content: richTextContent.optional(),
})

export const updateDocumentSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  content: richTextContent.optional(),
}).refine((value) => value.title !== undefined || value.content !== undefined, {
  message: 'Provide a title or content to update.',
})
