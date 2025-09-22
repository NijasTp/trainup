import { inject, injectable } from 'inversify';
import { IDietDayRepository } from '../core/interfaces/repositories/IDietRepository';
import TYPES from '../core/types/types';
import { IDietDay, IMeal } from '../models/diet.model';
import { MESSAGES } from '../constants/messages';
import { IStreakService } from '../core/interfaces/services/IStreakService';
import { CreateOrGetDayResponseDto, MealDto } from '../dtos/diet.dto';
import { IDietService } from '../core/interfaces/services/IDietService';
import { JwtPayload } from '../core/interfaces/services/IJwtService';
import { ROLE } from '../constants/role';
import { AppError } from '../utils/appError.util';
import { STATUS_CODE } from '../constants/status';

@injectable()
export class DietService implements IDietService {
  constructor(
    @inject(TYPES.IDietDayRepository) private _dietRepo: IDietDayRepository,
    @inject(TYPES.IStreakService) private _streakService: IStreakService
  ) {}

  async createOrGetDay(userId: string, date: string): Promise<CreateOrGetDayResponseDto> {
    const day = await this._dietRepo.createOrGet(userId, date);
    return this.mapToResponseDto(day);
  }

  async getDay(userId: string, date: string): Promise<CreateOrGetDayResponseDto | null> {
    const day = await this._dietRepo.getByUserAndDate(userId, date);
    return day ? this.mapToResponseDto(day) : null;
  }

  async addMeal(
    actor: JwtPayload,
    userId: string,
    date: string,
    mealPayload: Partial<MealDto>
  ): Promise<CreateOrGetDayResponseDto> {
    if (mealPayload.source === ROLE.ADMIN) {
      throw new AppError(MESSAGES.ADMIN_MEALS_NOT_ALLOWED, STATUS_CODE.FORBIDDEN);
    }

    if (actor.role === ROLE.USER) {
      mealPayload.source = ROLE.USER;
      mealPayload.sourceId = actor.id;
    }

    if (actor.role === ROLE.TRAINER) {
      mealPayload.source = ROLE.TRAINER;
      mealPayload.sourceId = actor.id;
    }

    if (actor.role !== ROLE.USER && actor.role !== ROLE.TRAINER) {
      throw new AppError(MESSAGES.FORBIDDEN, STATUS_CODE.FORBIDDEN);
    }

    mealPayload.usedBy = userId;

    await this._dietRepo.createOrGet(userId, date);
    const day = await this._dietRepo.addMeal(userId, date, mealPayload as IMeal);
    return this.mapToResponseDto(day);
  }

  async updateMeal(
    actor: JwtPayload,
    userId: string,
    date: string,
    mealId: string,
    update: Partial<MealDto>
  ): Promise<CreateOrGetDayResponseDto | null> {
    const day = await this._dietRepo.getByUserAndDate(userId, date);
    if (!day) throw new AppError(MESSAGES.NOT_FOUND, STATUS_CODE.NOT_FOUND);

    const meal = day.meals.find((m) => m._id?.toString() === mealId);
    if (!meal) throw new AppError(MESSAGES.NOT_FOUND, STATUS_CODE.NOT_FOUND);

    const creatorId = meal.sourceId?.toString();
    if (actor.role === ROLE.ADMIN) throw new AppError(MESSAGES.FORBIDDEN, STATUS_CODE.FORBIDDEN);

    if (actor.role === ROLE.TRAINER) {
      if (creatorId !== actor.id) throw new AppError(MESSAGES.FORBIDDEN, STATUS_CODE.FORBIDDEN);
    }

    if (actor.role === ROLE.USER) {
      if (meal.source !== ROLE.USER || actor.id !== creatorId) throw new AppError(MESSAGES.FORBIDDEN, STATUS_CODE.FORBIDDEN);
    }

    const updated = await this._dietRepo.updateMeal(userId, date, mealId, update as Partial<IMeal>);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async markMealEaten(
    actor: JwtPayload,
    userId: string,
    date: string,
    mealId: string,
    isEaten: boolean
  ): Promise<CreateOrGetDayResponseDto | null> {
    if (actor.role === ROLE.USER && actor.id !== userId) throw new AppError(MESSAGES.FORBIDDEN, STATUS_CODE.FORBIDDEN);
    if (actor.role !== ROLE.USER && actor.role !== ROLE.TRAINER) throw new AppError(MESSAGES.FORBIDDEN, STATUS_CODE.FORBIDDEN);

    await this._streakService.updateUserStreak(userId);

    const updated = await this._dietRepo.markMeal(userId, date, mealId, isEaten);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async removeMeal(
    actor: JwtPayload,
    userId: string,
    date: string,
    mealId: string
  ): Promise<CreateOrGetDayResponseDto | null> {
    const day = await this._dietRepo.getByUserAndDate(userId, date);
    if (!day) throw new AppError(MESSAGES.NOT_FOUND, STATUS_CODE.NOT_FOUND);
    const meal = day.meals.find((m) => m._id?.toString() === mealId);
    if (!meal) throw new AppError(MESSAGES.NOT_FOUND, STATUS_CODE.NOT_FOUND);

    const creatorId = meal.sourceId?.toString();

    if (actor.role === ROLE.ADMIN) throw new AppError(MESSAGES.FORBIDDEN, STATUS_CODE.FORBIDDEN);

    if (actor.role === ROLE.TRAINER) {
      if (creatorId !== actor.id) throw new AppError(MESSAGES.FORBIDDEN, STATUS_CODE.FORBIDDEN);
    }

    if (actor.role === ROLE.USER) {
      if (meal.source !== ROLE.USER || creatorId !== actor.id) throw new AppError(MESSAGES.FORBIDDEN, STATUS_CODE.FORBIDDEN);
    }

    const updated = await this._dietRepo.removeMeal(userId, date, mealId);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  private mapToResponseDto(day: IDietDay): CreateOrGetDayResponseDto {
    return {
      _id: day._id.toString(),
      user: day.user.toString(),
      date: day.date,
      meals: day.meals.map((meal) => ({
        _id: meal._id?.toString(),
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fats: meal.fats,
        time: meal.time,
        isEaten: meal.isEaten,
        usedBy: meal.usedBy.toString(),
        source: meal.source,
        sourceId: meal.sourceId.toString(),
        nutritions: meal.nutritions,
        notes: meal.notes,
        createdAt: meal.createdAt,
        updatedAt: meal.updatedAt,
      })),
      createdAt: day.createdAt,
      updatedAt: day.updatedAt,
    };
  }
}