import { ZodError } from 'zod'
import { AppError } from '../shared/errors/AppError.js'

export function errorHandler(error, _request, response, _next) {
  if (response.headersSent) return

  if (error instanceof ZodError) {
    return response.status(400).json({
      success: false,
      message: 'Please check the submitted fields.',
      code: 'VALIDATION_ERROR',
      details: error.issues.map(({ path, message }) => ({ path: path.join('.'), message })),
    })
  }

  if (error instanceof AppError) {
    return response.status(error.status).json({
      success: false,
      message: error.message,
      code: error.code,
      ...(error.details ? { details: error.details } : {}),
    })
  }

  if (error?.type === 'entity.too.large') {
    return response.status(413).json({ success: false, message: 'Request is too large.', code: 'PAYLOAD_TOO_LARGE' })
  }

  if (error?.type === 'entity.parse.failed') {
    return response.status(400).json({ success: false, message: 'Request body must be valid JSON.', code: 'INVALID_JSON' })
  }

  response.status(500).json({ success: false, message: 'Something went wrong.', code: 'INTERNAL_ERROR' })
}
