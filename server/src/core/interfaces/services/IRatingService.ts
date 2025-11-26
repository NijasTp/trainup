 import { ITrainer } from '../../../models/trainer.model'
import { IGym } from '../../../models/gym.model'

export interface IRatingService {
    addTrainerRating(trainerId: string, userId: string, rating: number, message: string, subscriptionPlan?: string): Promise<ITrainer | null>
    addGymRating(gymId: string, userId: string, rating: number, message: string, subscriptionPlan?: string): Promise<IGym | null>
    getTrainerRatings(trainerId: string, page?: number, limit?: number): Promise<{ ratings: any[], totalPages: number, totalCount: number }>
    getGymRatings(gymId: string, page?: number, limit?: number): Promise<{ ratings: any[], totalPages: number, totalCount: number }>
}
