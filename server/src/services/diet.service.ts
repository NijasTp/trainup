import { inject, injectable } from 'inversify'
import { IDietDayRepository } from '../core/interfaces/repositories/IDietRepository'
import TYPES from '../core/types/types'
import { IDietDay, IMeal } from '../models/diet.model'
import { MESSAGES } from '../constants/messages'
import { IStreakService } from '../core/interfaces/services/IStreakService'
import { CreateOrGetDayResponseDto, MealDto } from '../dtos/diet.dto'
import { IDietService } from '../core/interfaces/services/IDietService'

@injectable()
export class DietService implements IDietService {
  constructor (
    @inject(TYPES.IDietDayRepository) private _dietRepo: IDietDayRepository,
    @inject(TYPES.IStreakService) private _streakService: IStreakService
  ) {}

  async createOrGetDay (
    userId: string,
    date: string
  ): Promise<CreateOrGetDayResponseDto> {
    const day = await this._dietRepo.createOrGet(userId, date)
    return this.mapToResponseDto(day)
  }

  async getDay (
    userId: string,
    date: string
  ): Promise<CreateOrGetDayResponseDto | null> {
    const day = await this._dietRepo.getByUserAndDate(userId, date)
    return day ? this.mapToResponseDto(day) : null
  }

  async addMeal (
    actor: { id: string; role: string },
    userId: string,
    date: string,
    mealPayload: Partial<MealDto>
  ): Promise<CreateOrGetDayResponseDto> {
    if (mealPayload.source === 'admin') {
      throw new Error(
        "Admin meals must be created as templates, not added directly to a user's day"
      )
    }

    if (actor.role === 'user') {
      mealPayload.source = 'user'
      mealPayload.sourceId = actor.id
    }

    if (actor.role === 'trainer') {
      mealPayload.source = 'trainer'
      mealPayload.sourceId = actor.id
    }

    if (actor.role !== 'user' && actor.role !== 'trainer') {
      throw new Error(MESSAGES.FORBIDDEN)
    }

    mealPayload.usedBy = userId

    await this._dietRepo.createOrGet(userId, date)
    const day = await this._dietRepo.addMeal(userId, date, mealPayload as IMeal)
    return this.mapToResponseDto(day)
  }

  async updateMeal (
    actor: { id: string; role: string },
    userId: string,
    date: string,
    mealId: string,
    update: Partial<MealDto>
  ): Promise<CreateOrGetDayResponseDto | null> {
    const day = await this._dietRepo.getByUserAndDate(userId, date)
    if (!day) throw new Error(MESSAGES.NOT_FOUND)

    const meal = day.meals.find(m => m._id?.toString() === mealId)
    if (!meal) throw new Error(MESSAGES.NOT_FOUND)

    const creatorId = meal.sourceId?.toString()
    if (actor.role === 'admin') throw new Error(MESSAGES.FORBIDDEN)

    if (actor.role === 'trainer') {
      if (creatorId !== actor.id) throw new Error(MESSAGES.FORBIDDEN)
    }

    if (actor.role === 'user') {
      if (meal.source !== 'user' || actor.id !== creatorId)
        throw new Error(MESSAGES.FORBIDDEN)
    }

    const updated = await this._dietRepo.updateMeal(
      userId,
      date,
      mealId,
      update as any
    )
    return updated ? this.mapToResponseDto(updated) : null
  }

  async markMealEaten (
    actor: { id: string; role: string },
    userId: string,
    date: string,
    mealId: string,
    isEaten: boolean
  ): Promise<CreateOrGetDayResponseDto | null> {
    if (actor.role === 'user' && actor.id !== userId)
      throw new Error(MESSAGES.FORBIDDEN)
    if (actor.role !== 'user' && actor.role !== 'trainer')
      throw new Error(MESSAGES.FORBIDDEN)

    await this._streakService.updateUserStreak(userId as any)

    const updated = await this._dietRepo.markMeal(userId, date, mealId, isEaten)
    return updated ? this.mapToResponseDto(updated) : null
  }

  async removeMeal (
    actor: { id: string; role: string },
    userId: string,
    date: string,
    mealId: string
  ): Promise<CreateOrGetDayResponseDto | null> {
    const day = await this._dietRepo.getByUserAndDate(userId, date)
    if (!day) throw new Error(MESSAGES.NOT_FOUND)
    const meal = day.meals.find(m => m._id?.toString() === mealId)
    if (!meal) throw new Error(MESSAGES.NOT_FOUND)

    const creatorId = meal.sourceId?.toString()

    if (actor.role === 'admin') throw new Error(MESSAGES.FORBIDDEN)

    if (actor.role === 'trainer') {
      if (creatorId !== actor.id) throw new Error(MESSAGES.FORBIDDEN)
    }

    if (actor.role === 'user') {
      if (meal.source !== 'user' || creatorId !== actor.id)
        throw new Error(MESSAGES.FORBIDDEN)
    }

    const updated = await this._dietRepo.removeMeal(userId, date, mealId)
    return updated ? this.mapToResponseDto(updated) : null
  }

  private mapToResponseDto (day: IDietDay): CreateOrGetDayResponseDto {
    return {
      _id: day._id.toString(),
      user: day.user.toString(),
      date: day.date,
      meals: day.meals.map(meal => ({
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
        updatedAt: meal.updatedAt
      })),
      createdAt: day.createdAt,
      updatedAt: day.updatedAt
    }
  }
}
