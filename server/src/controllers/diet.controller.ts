import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { DietService } from '../services/diet.service';
import TYPES from '../core/types/types';
import { STATUS_CODE as STATUS } from '../constants/status';
import { MESSAGES } from '../constants/messages';
import { DietTemplateService } from '../services/dietTemplate.service';
import { JwtPayload } from '../core/interfaces/services/IJwtService';
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
  ApplyTemplateParamsDto,
} from '../dtos/diet.dto';

@injectable()
export class DietController {
  constructor(
    @inject(TYPES.IDietService) private _dietService: DietService,
    @inject(TYPES.ITemplateService) private _templateService: DietTemplateService
  ) {}

  async createOrGetDay(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id;
      const dto: CreateOrGetDayRequestDto = req.body;
      const day: CreateOrGetDayResponseDto = await this._dietService.createOrGetDay(userId, dto.date);
      res.status(STATUS.OK).json(day);
    } catch (err) {
      const error = err as Error;
      res.status(STATUS.BAD_REQUEST).json({ error: error.message || MESSAGES.INVALID_REQUEST });
    }
  }

  async trainerCreateOrGetDay(req: Request, res: Response): Promise<void> {
    try {
      const queryDto: GetDayQueryDto = req.query;
      const userId = queryDto.userId;
      if (!userId) {
        res.status(STATUS.BAD_REQUEST).json({ error: MESSAGES.INVALID_USER_ID });
        return;
      }
      const dto: CreateOrGetDayRequestDto = req.body;
      const day: CreateOrGetDayResponseDto = await this._dietService.createOrGetDay(userId, dto.date);
      res.status(STATUS.OK).json(day);
    } catch (err) {
      const error = err as Error;
      res.status(STATUS.BAD_REQUEST).json({ error: error.message || MESSAGES.INVALID_REQUEST });
    }
  }

  async getDay(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id;
      const dto: GetDayParamsDto = { date: req.params.date };
      const day = await this._dietService.getDay(userId, dto.date);
      if (!day) {
        res.status(STATUS.NOT_FOUND).json({ error: MESSAGES.NOT_FOUND });
        return;
      }
      res.status(STATUS.OK).json(day);
    } catch (err) {
      const error = err as Error;
      res.status(STATUS.BAD_REQUEST).json({ error: error.message || MESSAGES.INVALID_REQUEST });
    }
  }

  async trainerGetDay(req: Request, res: Response): Promise<void> {
    try {
      const queryDto: GetDayQueryDto = req.query;
      const userId = queryDto.userId;
      if (!userId) {
        res.status(STATUS.BAD_REQUEST).json({ error: MESSAGES.INVALID_USER_ID });
        return;
      }
      const dto: GetDayParamsDto = { date: req.params.date };
      const day = await this._dietService.getDay(userId, dto.date);
      if (!day) {
        res.status(STATUS.NOT_FOUND).json({ error: MESSAGES.NOT_FOUND });
        return;
      }
      res.status(STATUS.OK).json(day);
    } catch (err) {
      const error = err as Error;
      res.status(STATUS.BAD_REQUEST).json({ error: error.message || MESSAGES.INVALID_REQUEST });
    }
  }

  async createDietSession(req: Request, res: Response): Promise<void> {
    try {
      const actor = req.user as JwtPayload;
      if (actor.role !== 'trainer') {
        res.status(STATUS.FORBIDDEN).json({ error: MESSAGES.FORBIDDEN });
        return;
      }
      const dto: CreateDietSessionRequestDto = req.body;
      if (!dto.userId || !dto.date) {
        res.status(STATUS.BAD_REQUEST).json({ error: MESSAGES.MISSING_REQUIRED_FIELDS });
        return;
      }
      const day = await this._dietService.createOrGetDay(dto.userId, dto.date);
      res.status(STATUS.CREATED).json(day);
    } catch (err) {
      const error = err as Error;
      res.status(STATUS.BAD_REQUEST).json({ error: error.message || MESSAGES.INVALID_REQUEST });
    }
  }

  async addMeal(req: Request, res: Response): Promise<void> {
    try {
      const actor = req.user as JwtPayload;
      const queryDto: GetDayQueryDto = req.query;
      const userId = queryDto.userId || actor.id;
      const paramsDto: AddMealParamsDto = { date: req.params.date };
      const dto: AddMealRequestDto = req.body;
      const day = await this._dietService.addMeal(actor, userId, paramsDto.date, dto);
      res.status(STATUS.CREATED).json(day);
    } catch (err) {
      const error = err as Error;
      const code = error.message === MESSAGES.FORBIDDEN ? STATUS.FORBIDDEN : STATUS.BAD_REQUEST;
      res.status(code).json({ error: error.message || MESSAGES.INVALID_REQUEST });
    }
  }

  async updateMeal(req: Request, res: Response): Promise<void> {
    try {
      const actor = req.user as JwtPayload;
      const paramsDto: UpdateMealParamsDto = {
        date: req.params.date,
        mealId: req.params.mealId,
        userId: req.params.userId
      };
      const userId = paramsDto.userId || actor.id;
      const dto: UpdateMealRequestDto = req.body;
      const updated = await this._dietService.updateMeal(actor, userId, paramsDto.date, paramsDto.mealId, dto);
      if (!updated) {
        res.status(STATUS.NOT_FOUND).json({ error: MESSAGES.NOT_FOUND });
        return;
      }
      res.status(STATUS.OK).json(updated);
    } catch (err) {
      const error = err as Error;
      const code = error.message === MESSAGES.FORBIDDEN ? STATUS.FORBIDDEN : STATUS.BAD_REQUEST;
      res.status(code).json({ error: error.message || MESSAGES.INVALID_REQUEST });
    }
  }

  async markEaten(req: Request, res: Response): Promise<void> {
    try {
      const actor = req.user as JwtPayload;
      const paramsDto: MarkEatenParamsDto = {
        date: req.params.date,
        mealId: req.params.mealId,
        userId: req.params.userId
      };
      const userId = paramsDto.userId || actor.id;
      const dto: MarkEatenRequestDto = req.body;
      const updated = await this._dietService.markMealEaten(actor, userId, paramsDto.date, paramsDto.mealId, !!dto.isEaten);
      if (!updated) {
        res.status(STATUS.NOT_FOUND).json({ error: MESSAGES.NOT_FOUND });
        return;
      }
      res.status(STATUS.OK).json(updated);
    } catch (err) {
      const error = err as Error;
      const code = error.message === MESSAGES.FORBIDDEN ? STATUS.FORBIDDEN : STATUS.BAD_REQUEST;
      res.status(code).json({ error: error.message || MESSAGES.INVALID_REQUEST });
    }
  }

  async removeMeal(req: Request, res: Response): Promise<void> {
    try {
      const actor = req.user as JwtPayload;
      const paramsDto: RemoveMealParamsDto = {
        date: req.params.date,
        mealId: req.params.mealId,
        userId: req.params.userId
      };
      const userId = paramsDto.userId || actor.id;
      const updated = await this._dietService.removeMeal(actor, userId, paramsDto.date, paramsDto.mealId);
      if (!updated) {
        res.status(STATUS.NOT_FOUND).json({ error: MESSAGES.NOT_FOUND });
        return;
      }
      res.status(STATUS.OK).json(updated);
    } catch (err) {
      const error = err as Error;
      const code = error.message === MESSAGES.FORBIDDEN ? STATUS.FORBIDDEN : STATUS.BAD_REQUEST;
      res.status(code).json({ error: error.message || MESSAGES.INVALID_REQUEST });
    }
  }

  async createTemplate(req: Request, res: Response): Promise<void> {
    try {
      const actor = req.user as JwtPayload;
      if (actor.role !== 'admin') {
        res.status(STATUS.FORBIDDEN).json({ error: MESSAGES.FORBIDDEN });
        return;
      }

      const dto: CreateTemplateRequestDto = req.body;
      const created: TemplateResponseDto = await this._templateService.createTemplate(actor.id, dto);
      res.status(STATUS.CREATED).json(created);
    } catch (err) {
      const error = err as Error;
      res.status(STATUS.BAD_REQUEST).json({ error: error.message || MESSAGES.INVALID_REQUEST });
    }
  }

  async listTemplates(req: Request, res: Response): Promise<void> {
    try {
      const templates = await this._templateService.listTemplates();
      res.status(STATUS.OK).json(templates);
    } catch (err) {
      const error = err as Error;
      res.status(STATUS.BAD_REQUEST).json({ error: error.message || MESSAGES.INVALID_REQUEST });
    }
  }

  async applyTemplate(req: Request, res: Response): Promise<void> {
    try {
      const actor = req.user as JwtPayload;
      const paramsDto: ApplyTemplateParamsDto = req.params;
      const userId = paramsDto.userId || actor.id;
      const dto: ApplyTemplateRequestDto = req.body;

      if (actor.role === 'user' && actor.id !== userId) {
        res.status(STATUS.FORBIDDEN).json({ error: MESSAGES.FORBIDDEN });
        return;
      }

      const template = await this._templateService.getTemplate(dto.templateId);
      if (!template) {
        res.status(STATUS.NOT_FOUND).json({ error: MESSAGES.NOT_FOUND });
        return;
      }

      const meals = template.meals.map((m) => ({
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
        notes: m.notes,
      }));

      await this._dietService.createOrGetDay(userId, dto.date);
      let day = null;
      for (const meal of meals) {
        day = await this._dietService.addMeal(actor, userId, dto.date, meal);
      }

      res.status(STATUS.OK).json(day);
    } catch (err) {
      const error = err as Error;
      res.status(STATUS.BAD_REQUEST).json({ error: error.message || MESSAGES.INVALID_REQUEST });
    }
  }
}