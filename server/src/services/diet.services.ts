import { inject, injectable } from 'inversify'
import { IDietDayRepository } from '../core/interfaces/repositories/IDietRepository'
import TYPES from '../core/types/types'
import { IDietDay, IMeal } from '../models/diet.model'
import { MESSAGES } from '../constants/messages'

@injectable()
export class DietService {
  constructor (
    @inject(TYPES.IDietDayRepository) private _repo: IDietDayRepository
  ) {}

  async createOrGetDay (userId: string, date: string): Promise<IDietDay> {
    return this._repo.createOrGet(userId, date)
  }

  async getDay (userId: string, date: string): Promise<IDietDay | null> {
    return this._repo.getByUserAndDate(userId, date)
  }

  async addMeal (
    actor: { id: string; role: string },
    userId: string,
    date: string,
    mealPayload: Partial<IMeal>
  ): Promise<IDietDay> {
    if (mealPayload.source === 'admin') {
      throw new Error(
        "Admin meals must be created as templates, not added directly to a user's day"
      )
    }

    if (actor.role === 'user') {
      // if (actor.id !== userId) throw new Error(MESSAGES.FORBIDDEN)
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

    await this._repo.createOrGet(userId, date)
    return this._repo.addMeal(userId, date, mealPayload as IMeal)
  }

  async updateMeal (
    actor: { id: string; role: string },
    userId: string,
    date: string,
    mealId: string,
    update: Partial<IMeal>
  ): Promise<IDietDay | null> {
    const day = await this._repo.getByUserAndDate(userId, date)
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

    return this._repo.updateMeal(userId, date, mealId, update)
  }

  async markMealEaten (
    actor: { id: string; role: string },
    userId: string,
    date: string,
    mealId: string,
    isEaten: boolean
  ): Promise<IDietDay | null> {
    if (actor.role === 'user' && actor.id !== userId)
      throw new Error(MESSAGES.FORBIDDEN)
    if (actor.role !== 'user' && actor.role !== 'trainer')
      throw new Error(MESSAGES.FORBIDDEN)

    return this._repo.markMeal(userId, date, mealId, isEaten)
  }

  async removeMeal (
    actor: { id: string; role: string },
    userId: string,
    date: string,
    mealId: string
  ): Promise<IDietDay | null> {
    const day = await this._repo.getByUserAndDate(userId, date)
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

    return this._repo.removeMeal(userId, date, mealId)
  }
}
