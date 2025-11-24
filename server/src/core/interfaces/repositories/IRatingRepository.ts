import { ITrainer } from '../../../models/trainer.model'
import { IGym } from '../../../models/gym.model'

export interface IRatingRepository {
    addTrainerRating(trainerId: string, userId: string, rating: number, message: string, subscriptionPlan?: string): Promise<ITrainer | null>
    addGymRating(gymId: string, userId: string, rating: number, message: string, subscriptionPlan?: string): Promise<IGym | null>
    getTrainerRatings(trainerId: string): Promise<any>
    getGymRatings(gymId: string): Promise<any>
}
