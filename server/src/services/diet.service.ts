import { inject, injectable } from 'inversify';
import { IDietDayRepository } from '../core/interfaces/repositories/IDietRepository';
import TYPES from '../core/types/types';
import { IDietDay, IMeal } from '../models/diet.model';
import { MESSAGES } from '../constants/messages.constants';
import { IStreakService } from '../core/interfaces/services/IStreakService';
import { CreateOrGetDayResponseDto, MealDto } from '../dtos/diet.dto';
import { IDietService } from '../core/interfaces/services/IDietService';
import { JwtPayload } from '../core/interfaces/services/IJwtService';
import { Role } from '../constants/role';
import { AppError } from '../utils/appError.util';
import { STATUS_CODE } from '../constants/status';
import { IUserService } from '../core/interfaces/services/IUserService';
import { INotificationService } from '../core/interfaces/services/INotificationService';
import { NOTIFICATION_MESSAGES, NOTIFICATION_TYPES } from '../constants/notification.constants';

import { ITemplateRepository as IDietTemplateRepository } from '../core/interfaces/repositories/IDietTemplateRepository';

@injectable()
export class DietService implements IDietService {
  constructor(
    @inject(TYPES.IDietDayRepository) private _dietRepo: IDietDayRepository,
    @inject(TYPES.IStreakService) private _streakService: IStreakService,
    @inject(TYPES.IUserService) private _userService: IUserService,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
    @inject(TYPES.ITemplateRepository) private _dietTemplateRepo: IDietTemplateRepository
  ) { }

  async createOrGetDay(userId: string, date: string): Promise<CreateOrGetDayResponseDto> {
    const day = await this._dietRepo.createOrGet(userId, date);
    const templateInfo = await this.getTemplateInfo(userId, date);
    return { ...this.mapToResponseDto(day), ...templateInfo };
  }

  async getDay(userId: string, date: string): Promise<CreateOrGetDayResponseDto | null> {
    const day = await this._dietRepo.getByUserAndDate(userId, date);
    const templateInfo = await this.getTemplateInfo(userId, date);

    if (!day) {
      if (templateInfo.templateDay) {
        return {
          _id: "",
          user: userId,
          date: date,
          meals: [],
          ...templateInfo,
          createdAt: new Date(),
          updatedAt: new Date()
        } as unknown as CreateOrGetDayResponseDto;
      }
      return null;
    }

    return { ...this.mapToResponseDto(day), ...templateInfo };
  }

  private async getTemplateInfo(userId: string, date: string): Promise<Partial<CreateOrGetDayResponseDto>> {
    const user = await this._userService.getUserById(userId);
    if (user?.activeDietTemplate && user.dietTemplateStartDate) {
      const template = await this._dietTemplateRepo.getById(user.activeDietTemplate.toString());
      if (template) {
        const startDate = new Date(user.dietTemplateStartDate);
        startDate.setHours(0, 0, 0, 0);
        const currentDate = new Date(date);
        currentDate.setHours(0, 0, 0, 0);

        const diffTime = currentDate.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0) {
          const dayNumber = (diffDays % template.duration) + 1;
          const templateDay = template.days.find(d => d.dayNumber === dayNumber);

          const virtualMeals = templateDay ? templateDay.meals.map(m => ({
            _id: `template-${template._id}-${dayNumber}-${m.name}`,
            name: m.name,
            calories: m.calories,
            protein: m.protein,
            carbs: m.carbs,
            fats: m.fats,
            time: m.time,
            isEaten: false,
            usedBy: userId,
            source: Role.ADMIN,
            sourceId: template._id.toString(),
            notes: m.notes || `From active template: ${template.title}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          })) : [];

          return {
            templateDay: dayNumber,
            templateName: template.title,
            templateDuration: template.duration,
            templateMeals: virtualMeals as unknown as MealDto[]
          };
        }
      }
    }
    return {};
  }

  async addMeal(
    actor: JwtPayload,
    userId: string,
    date: string,
    mealPayload: Partial<MealDto>
  ): Promise<CreateOrGetDayResponseDto> {
    if (mealPayload.source === Role.ADMIN) {
      throw new AppError(MESSAGES.ADMIN_MEALS_NOT_ALLOWED, STATUS_CODE.FORBIDDEN);
    }

    if (actor.role === Role.USER) {
      mealPayload.source = Role.USER;
      mealPayload.sourceId = actor.id;
    }

    if (actor.role === Role.TRAINER) {
      mealPayload.source = Role.TRAINER;
      mealPayload.sourceId = actor.id;
    }

    if (actor.role !== Role.USER && actor.role !== Role.TRAINER) {
      throw new AppError(MESSAGES.FORBIDDEN, STATUS_CODE.FORBIDDEN);
    }

    mealPayload.usedBy = userId;

    await this._dietRepo.createOrGet(userId, date);
    const day = await this._dietRepo.addMeal(userId, date, mealPayload as IMeal);

    if (userId && date && mealPayload.time) {
      const mealDate = new Date(`${date}T${mealPayload.time}`);
      if (mealDate > new Date()) {
        await this._notificationService.sendMealReminder(
          userId,
          mealPayload.name!,
          mealDate
        );
      }
    }

    if (actor.role === Role.TRAINER) {
      await this._notificationService.createNotification({
        recipientId: userId,
        recipientRole: 'user',
        type: NOTIFICATION_TYPES.USER.DIET_ASSIGNED,
        title: 'New Diet Assigned',
        message: NOTIFICATION_MESSAGES.USER.DIET_ASSIGNED,
        priority: 'medium',
        category: 'info'
      });
    }

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
    if (actor.role === Role.ADMIN) throw new AppError(MESSAGES.FORBIDDEN, STATUS_CODE.FORBIDDEN);

    if (actor.role === Role.TRAINER) {
      if (creatorId !== actor.id) throw new AppError(MESSAGES.FORBIDDEN, STATUS_CODE.FORBIDDEN);
    }

    if (actor.role === Role.USER) {
      if (meal.source !== Role.USER || actor.id !== creatorId) throw new AppError(MESSAGES.FORBIDDEN, STATUS_CODE.FORBIDDEN);
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
    if (actor.role === Role.USER && actor.id !== userId) throw new AppError(MESSAGES.FORBIDDEN, STATUS_CODE.FORBIDDEN);
    if (actor.role !== Role.USER && actor.role !== Role.TRAINER) throw new AppError(MESSAGES.FORBIDDEN, STATUS_CODE.FORBIDDEN);

    await this._streakService.updateUserStreak(userId);

    const updated = await this._dietRepo.markMeal(userId, date, mealId, isEaten);

    if (actor.role === Role.USER && isEaten) {
      const user = await this._userService.getUserById(userId);
      if (user && user.assignedTrainer) {
        await this._notificationService.createNotification({
          recipientId: user.assignedTrainer.toString(),
          recipientRole: 'trainer',
          type: NOTIFICATION_TYPES.TRAINER.CLIENT_DIET_LOGGED,
          title: 'Client Logged Meal',
          message: NOTIFICATION_MESSAGES.TRAINER.CLIENT_DIET_LOGGED.replace('{userName}', user.name),
          priority: 'low',
          category: 'info'
        });
      }
    }

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

    if (actor.role === Role.ADMIN) throw new AppError(MESSAGES.FORBIDDEN, STATUS_CODE.FORBIDDEN);

    if (actor.role === Role.TRAINER) {
      if (creatorId !== actor.id) throw new AppError(MESSAGES.FORBIDDEN, STATUS_CODE.FORBIDDEN);
    }

    if (actor.role === Role.USER) {
      if (meal.source !== Role.USER || creatorId !== actor.id) throw new AppError(MESSAGES.FORBIDDEN, STATUS_CODE.FORBIDDEN);
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