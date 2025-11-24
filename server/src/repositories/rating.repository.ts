import { injectable } from 'inversify'
import { IRatingRepository } from '../core/interfaces/repositories/IRatingRepository'
import Trainer, { ITrainer } from '../models/trainer.model'
import { GymModel, IGym } from '../models/gym.model'
import mongoose from 'mongoose'

@injectable()
export class RatingRepository implements IRatingRepository {
    async addTrainerRating(
        trainerId: string,
        userId: string,
        rating: number,
        message: string,
        subscriptionPlan?: string
    ): Promise<ITrainer | null> {
        const trainer = await Trainer.findById(trainerId)
        if (!trainer) return null

        const review = {
            rating,
            message,
            userId: new mongoose.Types.ObjectId(userId),
            subscriptionPlan,
            createdAt: new Date()
        }

        trainer.reviews.push(review)

        const totalRating = trainer.reviews.reduce((acc, curr) => acc + curr.rating, 0)
        trainer.rating = totalRating / trainer.reviews.length

        return await trainer.save()
    }

    async addGymRating(
        gymId: string,
        userId: string,
        rating: number,
        message: string,
        subscriptionPlan?: string
    ): Promise<IGym | null> {
        const gym = await GymModel.findById(gymId)
        if (!gym) return null

        const review = {
            rating,
            message,
            userId: new mongoose.Types.ObjectId(userId),
            subscriptionPlan,
            createdAt: new Date()
        }

        if (!gym.reviews) {
            gym.reviews = []
        }

        gym.reviews.push(review)

        // Calculate new average rating
        const totalRating = gym.reviews.reduce((acc, curr) => acc + curr.rating, 0)
        gym.rating = totalRating / gym.reviews.length

        return await gym.save()
    }

    async getTrainerRatings(trainerId: string): Promise<any> {
        const trainer = await Trainer.findById(trainerId).populate('reviews.userId', 'name profileImage')
        return trainer?.reviews || []
    }

    async getGymRatings(gymId: string): Promise<any> {
        const gym = await GymModel.findById(gymId).populate('reviews.userId', 'name profileImage')
        return gym?.reviews || []
    }
}
