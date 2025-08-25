import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { DietService } from '../services/diet.services'
import TYPES from '../core/types/types'
import { STATUS_CODE as STATUS } from '../constants/status'
import { MESSAGES } from '../constants/messages'
import { DietTemplateService } from '../services/dietTemplate.services'
import { JwtPayload } from '../core/interfaces/services/IJwtService'

@injectable()
export class DietController {
  constructor (
    @inject(TYPES.IDietService) private dietService: DietService,
    @inject(TYPES.ITemplateService) private templateService: DietTemplateService
  ) {}

  // Create / get day
  createOrGetDay = async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId || (req.user as any).id
      const { date } = req.body
      const day = await this.dietService.createOrGetDay(userId, date)
      res.status(STATUS.OK).json(day)
    } catch (err: any) {
      res.status(STATUS.BAD_REQUEST).json({ error: err.message })
    }
  }

  getDay = async (req: Request, res: Response) => {
    try {
      const userId =(req.user as JwtPayload).id
      const { date } = req.params as any
      const day = await this.dietService.getDay(userId, date)
      if (!day) {
        res.status(STATUS.NOT_FOUND).json({ error: MESSAGES.NOT_FOUND })
        return
      }
      res.json(day)
    } catch (err: any) {
      res.status(STATUS.BAD_REQUEST).json({ error: err.message })
    }
  }

  addMeal = async (req: Request, res: Response) => {
    try {
      const actor = req.user as any
      const userId = req.params.userId || actor.id
      const { date } = req.params
      const payload = req.body
      const day = await this.dietService.addMeal(actor, userId, date, payload)
      res.status(STATUS.CREATED).json(day)
    } catch (err: any) {
      const code =
        err.message === MESSAGES.FORBIDDEN
          ? STATUS.FORBIDDEN
          : STATUS.BAD_REQUEST
      res.status(code).json({ error: err.message })
    }
  }

  updateMeal = async (req: Request, res: Response) => {
    try {
      const actor = req.user as any
      const userId = req.params.userId || actor.id
      const { date, mealId } = req.params
      const updated = await this.dietService.updateMeal(
        actor,
        userId,
        date,
        mealId,
        req.body
      )
      if (!updated) {
        res.status(STATUS.NOT_FOUND).json({ error: MESSAGES.NOT_FOUND })
      }
      res.json(updated)
    } catch (err: any) {
      const code =
        err.message === MESSAGES.FORBIDDEN
          ? STATUS.FORBIDDEN
          : STATUS.BAD_REQUEST
      res.status(code).json({ error: err.message })
    }
  }

  markEaten = async (req: Request, res: Response) => {
    try {
      const actor = req.user as any
      const userId = req.params.userId || actor.id
      const { date, mealId } = req.params
      const { isEaten } = req.body
      const updated = await this.dietService.markMealEaten(
        actor,
        userId,
        date,
        mealId,
        !!isEaten
      )
      if (!updated) {
        res.status(STATUS.NOT_FOUND).json({ error: MESSAGES.NOT_FOUND })
        return
      }
      res.json(updated)
    } catch (err: any) {
      const code =
        err.message === MESSAGES.FORBIDDEN
          ? STATUS.FORBIDDEN
          : STATUS.BAD_REQUEST
      res.status(code).json({ error: err.message })
    }
  }

  removeMeal = async (req: Request, res: Response) => {
    try {
      const actor = req.user as any
      const userId = req.params.userId || actor.id
      const { date, mealId } = req.params
      const updated = await this.dietService.removeMeal(
        actor,
        userId,
        date,
        mealId
      )
      if (!updated) {
        res.status(STATUS.NOT_FOUND).json({ error: MESSAGES.NOT_FOUND })
        return
      }
      res.json(updated)
    } catch (err: any) {
      const code =
        err.message === MESSAGES.FORBIDDEN
          ? STATUS.FORBIDDEN
          : STATUS.BAD_REQUEST
      res.status(code).json({ error: err.message })
    }
  }

  // Templates (admin)
  createTemplate = async (req: Request, res: Response) => {
    try {
      const actor = req.user as any
      if (actor.role !== 'admin') {
        res.status(STATUS.FORBIDDEN).json({ error: MESSAGES.FORBIDDEN })
        return
      }

      const created = await this.templateService.createTemplate(
        actor.id,
        req.body
      )
      res.status(STATUS.CREATED).json(created)
    } catch (err: any) {
      res.status(STATUS.BAD_REQUEST).json({ error: err.message })
    }
  }

  listTemplates = async (req: Request, res: Response) => {
    try {
      const templates = await this.templateService.listTemplates()
      res.json(templates)
    } catch (err: any) {
      res.status(STATUS.BAD_REQUEST).json({ error: err.message })
    }
  }

  applyTemplate = async (req: Request, res: Response) => {
    try {
      const actor = req.user as any
      const userId = req.params.userId || actor.id
      const { date, templateId } = req.body
      // only user can apply template to their own day (or trainer could apply on behalf of a user if you want)
      if (actor.role === 'user' && actor.id !== userId) {
        res.status(STATUS.FORBIDDEN).json({ error: MESSAGES.FORBIDDEN })
        return
      }

      const template = await this.templateService.getTemplate(templateId)
      if (!template){
         res.status(STATUS.NOT_FOUND).json({ error: MESSAGES.NOT_FOUND })
        return 
      }

      // map template meals to day meals with source = 'admin' and sourceId = template.createdBy
      const meals = template.meals.map(m => ({
        name: m.name,
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fats: m.fats,
        time: m.time,
        isEaten: false,
        usedBy: userId,
        source: 'admin',
        sourceId: template.createdBy,
        nutritions: m.nutritions,
        notes: m.notes
      }))

      // ensure day exists and push all meals
      await this.dietService.createOrGetDay(userId, date)
      let day = null
      for (const meal of meals) {
        day = await this.dietService.addMeal(actor, userId, date, meal as any)
      }

      res.status(STATUS.OK).json(day)
    } catch (err: any) {
      res.status(STATUS.BAD_REQUEST).json({ error: err.message })
    }
  }
}
