import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { Types } from 'mongoose';
import TYPES from '../core/types/types';
import { STATUS_CODE as STATUS } from '../constants/status';
import { MESSAGES } from '../constants/messages.constants';
// 7: import { DietTemplateService } from '../services/dietTemplate.service'; - Unused

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
import { IDietService } from '../core/interfaces/services/IDietService';
import { AppError } from '../utils/appError.util';
import { IDietTemplateService } from '../core/interfaces/services/IDietTemplateService';
import { IStreakService } from '../core/interfaces/services/IStreakService';

@injectable()
export class DietController {
  constructor(
    @inject(TYPES.IDietService) private _dietService: IDietService,
    @inject(TYPES.ITemplateService) private _templateService: IDietTemplateService,
    @inject(TYPES.IStreakService) private _streakService: IStreakService
  ) { }

  async createOrGetDay(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id;
      const dto: CreateOrGetDayRequestDto = req.body;
      if (!dto.date) throw new AppError(MESSAGES.MISSING_REQUIRED_FIELDS, STATUS.BAD_REQUEST);
      const day: CreateOrGetDayResponseDto = await this._dietService.createOrGetDay(userId, dto.date);
      res.status(STATUS.OK).json(day);
    } catch (err) {
      next(err);
    }
  }

  async trainerCreateOrGetDay(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryDto: GetDayQueryDto = req.query;
      const userId = queryDto.userId;
      if (!userId) throw new AppError(MESSAGES.INVALID_USER_ID, STATUS.BAD_REQUEST);
      const dto: CreateOrGetDayRequestDto = req.body;
      if (!dto.date) throw new AppError(MESSAGES.MISSING_REQUIRED_FIELDS, STATUS.BAD_REQUEST);
      const day: CreateOrGetDayResponseDto = await this._dietService.createOrGetDay(userId, dto.date);
      res.status(STATUS.OK).json(day);
    } catch (err) {
      next(err);
    }
  }

  async getDay(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id;
      const dto: GetDayParamsDto = { date: req.params.date };
      const day = await this._dietService.getDay(userId, dto.date);
      if (!day) throw new AppError(MESSAGES.NOT_FOUND, STATUS.NOT_FOUND);
      res.status(STATUS.OK).json(day);
    } catch (err) {
      next(err);
    }
  }

  async trainerGetDay(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryDto: GetDayQueryDto = req.query;
      const userId = queryDto.userId;
      if (!userId) throw new AppError(MESSAGES.INVALID_USER_ID, STATUS.BAD_REQUEST);
      const dto: GetDayParamsDto = { date: req.params.date };
      const day = await this._dietService.getDay(userId, dto.date);
      if (!day) throw new AppError(MESSAGES.NOT_FOUND, STATUS.NOT_FOUND);
      res.status(STATUS.OK).json(day);
    } catch (err) {
      next(err);
    }
  }

  async createDietSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actor = req.user as JwtPayload;
      if (actor.role !== 'trainer') throw new AppError(MESSAGES.FORBIDDEN, STATUS.FORBIDDEN);
      const dto: CreateDietSessionRequestDto = req.body;
      if (!dto.userId || !dto.date) throw new AppError(MESSAGES.MISSING_REQUIRED_FIELDS, STATUS.BAD_REQUEST);
      const day = await this._dietService.createOrGetDay(dto.userId, dto.date);
      res.status(STATUS.CREATED).json(day);
    } catch (err) {
      next(err);
    }
  }

  async addMeal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actor = req.user as JwtPayload;
      const queryDto: GetDayQueryDto = req.query;
      const userId = queryDto.userId || actor.id;
      const paramsDto: AddMealParamsDto = { date: req.params.date };
      const dto: AddMealRequestDto = req.body;
      const day = await this._dietService.addMeal(actor, userId, paramsDto.date, dto);
      res.status(STATUS.CREATED).json(day);
    } catch (err) {
      next(err);
    }
  }

  async updateMeal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actor = req.user as JwtPayload;
      const paramsDto: UpdateMealParamsDto = {
        date: req.params.date,
        mealId: req.params.mealId,
        userId: req.params.userId,
      };
      const userId = paramsDto.userId || actor.id;
      const dto: UpdateMealRequestDto = req.body;
      const updated = await this._dietService.updateMeal(actor, userId, paramsDto.date, paramsDto.mealId, dto);
      if (!updated) throw new AppError(MESSAGES.NOT_FOUND, STATUS.NOT_FOUND);
      res.status(STATUS.OK).json(updated);
    } catch (err) {
      next(err);
    }
  }

  async markEaten(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actor = req.user as JwtPayload;
      const paramsDto: MarkEatenParamsDto = {
        date: req.params.date,
        mealId: req.params.mealId,
        userId: req.params.userId,
      };
      const userId = paramsDto.userId || actor.id;
      const dto: MarkEatenRequestDto = req.body;
      const updated = await this._dietService.markMealEaten(actor, userId, paramsDto.date, paramsDto.mealId, !!dto.isEaten);
      if (!updated) throw new AppError(MESSAGES.NOT_FOUND, STATUS.NOT_FOUND);

      if (dto.isEaten) {
        await this._streakService.updateUserStreak(new Types.ObjectId(userId));
      }

      res.status(STATUS.OK).json(updated);
    } catch (err) {
      next(err);
    }
  }

  async removeMeal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actor = req.user as JwtPayload;
      const paramsDto: RemoveMealParamsDto = {
        date: req.params.date,
        mealId: req.params.mealId,
        userId: req.params.userId,
      };
      const userId = paramsDto.userId || actor.id;
      const updated = await this._dietService.removeMeal(actor, userId, paramsDto.date, paramsDto.mealId);
      if (!updated) throw new AppError(MESSAGES.NOT_FOUND, STATUS.NOT_FOUND);
      res.status(STATUS.OK).json(updated);
    } catch (err) {
      next(err);
    }
  }

  async createTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actor = req.user as JwtPayload;
      if (actor.role !== 'admin') throw new AppError(MESSAGES.FORBIDDEN, STATUS.FORBIDDEN);
      const dto: CreateTemplateRequestDto = req.body;
      const created: TemplateResponseDto = await this._templateService.createTemplate(actor.id, dto);
      res.status(STATUS.CREATED).json(created);
    } catch (err) {
      next(err);
    }
  }

  async listTemplates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const templates = await this._templateService.listTemplates();
      res.status(STATUS.OK).json(templates);
    } catch (err) {
      next(err);
    }
  }

  async applyTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actor = req.user as JwtPayload;
      const paramsDto: ApplyTemplateParamsDto = req.params;
      const userId = paramsDto.userId || actor.id;
      const dto: ApplyTemplateRequestDto = req.body;

      if (actor.role === 'user' && actor.id !== userId) {
        throw new AppError(MESSAGES.FORBIDDEN, STATUS.FORBIDDEN);
      }

      const template = await this._templateService.getTemplate(dto.templateId);
      if (!template) {
        throw new AppError(MESSAGES.NOT_FOUND, STATUS.NOT_FOUND);
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
      next(err);
    }
  }
}