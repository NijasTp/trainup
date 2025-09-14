import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { DietService } from '../services/diet.service'
import TYPES from '../core/types/types'
import { STATUS_CODE as STATUS } from '../constants/status'
import { MESSAGES } from '../constants/messages'
import { DietTemplateService } from '../services/dietTemplate.service'
import { JwtPayload } from '../core/interfaces/services/IJwtService'
import {
  CreateOrGetDayRequestDto,
  CreateOrGetDayResponseDto,
  GetDayParamsDto,
  GetDayQueryDto,
  CreateDietSessionRequestDto,
  AddMealRequestDto,
  AddMealParamsDto,
  UpdateMealRequestDto,
  UpdateMealParamsDto,
  MarkEatenRequestDto,
  MarkEatenParamsDto,
  RemoveMealParamsDto,
  CreateTemplateRequestDto,
  TemplateResponseDto,
  ApplyTemplateRequestDto,
  ApplyTemplateParamsDto
} from '../dtos/diet.dto'

@injectable()
export class DietController {
  constructor (
    @inject(TYPES.IDietService) private _dietService: DietService,
    @inject(TYPES.ITemplateService) private _templateService: DietTemplateService
  ) {}

  createOrGetDay = async (req: Request, res: Response) => {
    try {
      const userId = (req.user as JwtPayload).id
      const dto: CreateOrGetDayRequestDto = req.body
      const day = await this._dietService.createOrGetDay(userId, dto.date)
      res.status(STATUS.OK).json(day)
    } catch (err: any) {
      res.status(STATUS.BAD_REQUEST).json({ error: err.message })
    }
  }

  trainerCreateOrGetDay = async (req: Request, res: Response) => {
    try {
      const queryDto: GetDayQueryDto = req.query as any
      const userId = queryDto.userId as string
      const dto: CreateOrGetDayRequestDto = req.body
      const day = await this._dietService.createOrGetDay(userId, dto.date)
      res.status(STATUS.OK).json(day)
    } catch (err: any) {
      res.status(STATUS.BAD_REQUEST).json({ error: err.message })
    }
  }

  getDay = async (req: Request, res: Response) => {
    try {
      const userId = (req.user as JwtPayload).id
      const dto: GetDayParamsDto = req.params as any
      const day = await this._dietService.getDay(userId, dto.date)
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
      const queryDto: GetDayQueryDto = req.query as any
      const userId = queryDto.userId as string
      const dto: GetDayParamsDto = req.params as any
      const day = await this._dietService.getDay(userId, dto.date)
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
      const dto: CreateDietSessionRequestDto = req.body
      if (!dto.userId || !dto.date) {
         res.status(STATUS.BAD_REQUEST).json({ error: 'userId and date are required' })
         return
      }
      const day = await this._dietService.createOrGetDay(dto.userId, dto.date)
      res.status(STATUS.CREATED).json(day)
    } catch (err: any) {
      res.status(STATUS.BAD_REQUEST).json({ error: err.message })
    }
  }

  addMeal = async (req: Request, res: Response) => {
    try {
      const actor = req.user as any
      const queryDto: GetDayQueryDto = req.query as any
      const userId = queryDto.userId || actor.id
      const paramsDto: AddMealParamsDto = req.params as any
      const dto: AddMealRequestDto = req.body
      const day = await this._dietService.addMeal(actor, userId, paramsDto.date, dto)
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
      const paramsDto: UpdateMealParamsDto = req.params as any
      const userId = paramsDto.userId || actor.id
      const dto: UpdateMealRequestDto = req.body
      const updated = await this._dietService.updateMeal(
        actor,
        userId,
        paramsDto.date,
        paramsDto.mealId,
        dto
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
      const paramsDto: MarkEatenParamsDto = req.params as any
      const userId = paramsDto.userId || actor.id
      const dto: MarkEatenRequestDto = req.body
      const updated = await this._dietService.markMealEaten(
        actor,
        userId,
        paramsDto.date,
        paramsDto.mealId,
        !!dto.isEaten
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
      const paramsDto: RemoveMealParamsDto = req.params as any
      const userId = paramsDto.userId || actor.id
      const updated = await this._dietService.removeMeal(
        actor,
        userId,
        paramsDto.date,
        paramsDto.mealId
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

  createTemplate = async (req: Request, res: Response) => {
    try {
      const actor = req.user as any
      if (actor.role !== 'admin') {
        res.status(STATUS.FORBIDDEN).json({ error: MESSAGES.FORBIDDEN })
        return
      }

      const dto: CreateTemplateRequestDto = req.body
      const created: TemplateResponseDto = await this._templateService.createTemplate(
        actor.id,
        dto
      )
      res.status(STATUS.CREATED).json(created)
    } catch (err: any) {
      res.status(STATUS.BAD_REQUEST).json({ error: err.message })
    }
  }

  listTemplates = async (req: Request, res: Response) => {
    try {
      const templates = await this._templateService.listTemplates()
      res.json(templates)
    } catch (err: any) {
      res.status(STATUS.BAD_REQUEST).json({ error: err.message })
    }
  }

  applyTemplate = async (req: Request, res: Response) => {
    try {
      const actor = req.user as any
      const paramsDto: ApplyTemplateParamsDto = req.params as any
      const userId = paramsDto.userId || actor.id
      const dto: ApplyTemplateRequestDto = req.body
      
      if (actor.role === 'user' && actor.id !== userId) {
        res.status(STATUS.FORBIDDEN).json({ error: MESSAGES.FORBIDDEN })
        return
      }

      const template = await this._templateService.getTemplate(dto.templateId)
      if (!template){
         res.status(STATUS.NOT_FOUND).json({ error: MESSAGES.NOT_FOUND })
        return 
      }

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

      await this._dietService.createOrGetDay(userId, dto.date)
      let day = null
      for (const meal of meals) {
        day = await this._dietService.addMeal(actor, userId, dto.date, meal as any)
      }

      res.status(STATUS.OK).json(day)
    } catch (err: any) {
      res.status(STATUS.BAD_REQUEST).json({ error: err.message })
    }
  }
}