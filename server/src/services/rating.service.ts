import { injectable, inject } from 'inversify'
import { IRatingService } from '../core/interfaces/services/IRatingService'
import { IRatingRepository } from '../core/interfaces/repositories/IRatingRepository'
import TYPES from '../core/types/types'
import { ITrainer } from '../models/trainer.model'
import { IGym } from '../models/gym.model'

@injectable()
export class RatingService implements IRatingService {
    constructor(
        @inject(TYPES.IRatingRepository) private _ratingRepository: IRatingRepository
    ) { }

    async addTrainerRating(
        trainerId: string,
        userId: string,
        rating: number,
        message: string,
        subscriptionPlan?: string
    ): Promise<ITrainer | null> {
        return this._ratingRepository.addTrainerRating(trainerId, userId, rating, message, subscriptionPlan)
    }

    async addGymRating(
        gymId: string,
        userId: string,
        rating: number,
        message: string,
        subscriptionPlan?: string
    ): Promise<IGym | null> {
        return this._ratingRepository.addGymRating(gymId, userId, rating, message, subscriptionPlan)
    }

    async getTrainerRatings(trainerId: string, page?: number, limit?: number): Promise<{ ratings: any[], totalPages: number, totalCount: number }> {
        return this._ratingRepository.getTrainerRatings(trainerId, page, limit)
    }

    async getGymRatings(gymId: string, page?: number, limit?: number): Promise<{ ratings: any[], totalPages: number, totalCount: number }> {
        return this._ratingRepository.getGymRatings(gymId, page, limit)
    }
}
