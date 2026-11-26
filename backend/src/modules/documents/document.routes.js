import { Router } from 'express'
import * as controller from './document.controller.js'

export const documentRoutes = Router()

documentRoutes.get('/', controller.list)
documentRoutes.post('/', controller.create)
documentRoutes.get('/:id', controller.get)
documentRoutes.patch('/:id', controller.update)
documentRoutes.delete('/:id', controller.remove)
