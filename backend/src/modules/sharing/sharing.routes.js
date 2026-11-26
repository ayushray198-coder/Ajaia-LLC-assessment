import { Router } from 'express'
import * as controller from './sharing.controller.js'

export const sharingRoutes = Router()
sharingRoutes.post('/:id/share', controller.share)
sharingRoutes.patch('/:id/share/:userId', controller.updateRole)
sharingRoutes.delete('/:id/share/:userId', controller.revoke)
