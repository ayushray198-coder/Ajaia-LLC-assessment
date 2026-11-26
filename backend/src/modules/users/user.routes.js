import { Router } from 'express'
import { list } from './user.controller.js'

export const userRoutes = Router()
userRoutes.get('/', list)
