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
    @inject(TYPES.IDietService) private _dietService: DietService,
    @inject(TYPES.ITemplateService) private _templateService: DietTemplateService
  ) {}


  createOrGetDay = async (req: Request, res: Response) => {
    try {
      const userId = (req.user as JwtPayload).id
      const { date } = req.body
      const day = await this._dietService.createOrGetDay(userId, date)
      res.status(STATUS.OK).json(day)
    } catch (err: any) {
      res.status(STATUS.BAD_REQUEST).json({ error: err.message })
    }
  }


  trainerCreateOrGetDay = async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string
      const { date } = req.body
      const day = await this._dietService.createOrGetDay(userId, date)
      res.status(STATUS.OK).json(day)
    } catch (err: any) {
      res.status(STATUS.BAD_REQUEST).json({ error: err.message })
    }
  }



  getDay = async (req: Request, res: Response) => {
    try {
      const userId =(req.user as JwtPayload).id
      const { date } = req.params as any
      const day = await this._dietService.getDay(userId, date)
      if (!day) {
        res.status(STATUS.NOT_FOUND).json({ error: MESSAGES.NOT_FOUND })
        return
      }
      res.json(day)
    } catch (err: any) {
      res.status(STATUS.BAD_REQUEST).json({ error: err.message })
    }
  }

  trainerGetDay = async (req: Request, res: Response) => {
    try {
      const userId =req.query.userId as string
      const { date } = req.params
      const day = await this._dietService.getDay(userId, date)
      if (!day) {
        res.status(STATUS.NOT_FOUND).json({ error: MESSAGES.NOT_FOUND })
        return
      }
      res.json(day)
    } catch (err: any) {
      res.status(STATUS.BAD_REQUEST).json({ error: err.message })
    }
  }

   createDietSession = async (req: Request, res: Response) => {
    try {
      const actor = req.user as JwtPayload
      if (actor.role !== 'trainer') {
         res.status(STATUS.FORBIDDEN).json({ error: MESSAGES.FORBIDDEN })
         return
      }
      const { userId, date } = req.body
      if (!userId || !date) {
         res.status(STATUS.BAD_REQUEST).json({ error: 'userId and date are required' })
         return
      }
      const day = await this._dietService.createOrGetDay(userId, date)
      res.status(STATUS.CREATED).json(day)
    } catch (err: any) {
      res.status(STATUS.BAD_REQUEST).json({ error: err.message })
    }
  }

  addMeal = async (req: Request, res: Response) => {
    try {
      const actor = req.user as any
      const userId = req.query.userId || actor.id
      const { date } = req.params
      const payload = req.body
      const day = await this._dietService.addMeal(actor, userId, date, payload)
      res.status(STATUS.CREATED).json(day)
    } catch (err: any) {
      const code =
        err.message === MESSAGES.FORBIDDEN
          ? STATUS.FORBIDDEN
          : STATUS.BAD_REQUEST
      res.status(code).json({ error: err.message })
    }
  }

    addSession = async (req: Request, res: Response) => {
    try {
      const actor = req.user as any;
      const userId = req.query.userId || actor.id;
      const { date } = req.params;
      const payload = req.body; // { givenBy, meals, title, description, notes }
      const day = await this._dietService.addSession(actor, userId, date, payload);
      res.status(STATUS.CREATED).json(day);
    } catch (err: any) {
      const code =
        err.message === MESSAGES.FORBIDDEN
          ? STATUS.FORBIDDEN
          : STATUS.BAD_REQUEST;
      res.status(code).json({ error: err.message });
    }
  };

  updateMeal = async (req: Request, res: Response) => {
    try {
      const actor = req.user as any
      const userId = req.params.userId || actor.id
      const { date, mealId } = req.params
      const updated = await this._dietService.updateMeal(
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
      const updated = await this._dietService.markMealEaten(
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
      const updated = await this._dietService.removeMeal(
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

  // Templates
  createTemplate = async (req: Request, res: Response) => {
    try {
      const actor = req.user as any
      if (actor.role !== 'admin') {
        res.status(STATUS.FORBIDDEN).json({ error: MESSAGES.FORBIDDEN })
        return
      }

      const created = await this._templateService.createTemplate(
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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";

      const result = await this._templateService.listTemplates(page, limit, search);


      res.status(STATUS.OK).json({
        templates: result.templates,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      });
    } catch (err: any) {
      res.status(STATUS.BAD_REQUEST).json({ error: err.message });
    }
  };

  applyTemplate = async (req: Request, res: Response) => {
    try {
      const actor = req.user as any
      const userId = req.params.userId || actor.id
      const { date, templateId } = req.body
      if (actor.role === 'user' && actor.id !== userId) {
        res.status(STATUS.FORBIDDEN).json({ error: MESSAGES.FORBIDDEN })
        return
      }

      const template = await this._templateService.getTemplate(templateId)
      if (!template){
         res.status(STATUS.NOT_FOUND).json({ error: MESSAGES.NOT_FOUND })
        return 
      }

      const meals = template.templates.map(m => ({
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


      await this._dietService.createOrGetDay(userId, date)
      let day = null
      for (const meal of meals) {
        day = await this._dietService.addMeal(actor, userId, date, meal as any)
      }

      res.status(STATUS.OK).json(day)
    } catch (err: any) {
      res.status(STATUS.BAD_REQUEST).json({ error: err.message })
    }
  }
}
