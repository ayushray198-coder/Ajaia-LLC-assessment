import { AppError } from '../../shared/errors/AppError.js'
import { importDocumentSchema } from './import.validation.js'
import { importDocument } from './import.service.js'

export async function create(request, response) {
  const { fileName, content } = importDocumentSchema.parse(request.body)
  if (Buffer.byteLength(content, 'utf8') > 1_000_000) {
    throw new AppError(413, 'Files must be 1 MB or smaller.', 'FILE_TOO_LARGE')
  }
  const data = await importDocument(request.user, fileName, content)
  response.status(201).json({ success: true, data })
}
