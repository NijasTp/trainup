import { injectable } from 'inversify';
import { IRatingRepository } from '../core/interfaces/repositories/IRatingRepository';
import Trainer from '../models/trainer.model';
import { GymModel } from '../models/gym.model';
import mongoose from 'mongoose';

@injectable()
export class RatingRepository implements IRatingRepository {
    async addTrainerRating(
        trainerId: string,
        userId: string,
        rating: number,
        message: string,
        subscriptionPlan?: string
    ): Promise<unknown> {
        const trainer = await Trainer.findById(trainerId);
        if (!trainer) return null;
        const review = {
            rating,
            message,
            userId: new mongoose.Types.ObjectId(userId),
            subscriptionPlan,
            createdAt: new Date()
        };
        trainer.reviews.push(review);
        const totalRating = trainer.reviews.reduce((acc, cur) => acc + cur.rating, 0);
        trainer.rating = totalRating / trainer.reviews.length;
        await trainer.save();

        const updatedTrainer = await Trainer.findById(trainerId).populate('reviews.userId', 'name profileImage firstName lastName');
        if (!updatedTrainer || !updatedTrainer.reviews) return null;
        return updatedTrainer.reviews[updatedTrainer.reviews.length - 1];
    }

    async addGymRating(
        gymId: string,
        userId: string,
        rating: number,
        message: string,
        subscriptionPlan?: string
    ): Promise<unknown> {
        const gym = await GymModel.findById(gymId);
        if (!gym) return null;
        const review = {
            rating,
            message,
            userId: new mongoose.Types.ObjectId(userId),
            subscriptionPlan,
            createdAt: new Date()
        };
        if (!gym.reviews) gym.reviews = [];
        gym.reviews.push(review);
        const totalRating = gym.reviews.reduce((acc, cur) => acc + cur.rating, 0);
        gym.rating = totalRating / gym.reviews.length;
        await gym.save();

        const updatedGym = await GymModel.findById(gymId).populate('reviews.userId', 'name profileImage firstName lastName');
        if (!updatedGym || !updatedGym.reviews) return null;
        return updatedGym.reviews[updatedGym.reviews.length - 1];
    }

    async getTrainerRatings(
        trainerId: string,
        page: number = 1,
        limit: number = 5
    ): Promise<{ ratings: unknown[]; totalPages: number; totalCount: number }> {
        const trainer = await Trainer.findById(trainerId).populate('reviews.userId', 'name profileImage');
        const allReviews = trainer?.reviews || [];
        const totalCount = allReviews.length;
        const totalPages = Math.ceil(totalCount / limit);
        const start = (page - 1) * limit;
        const paginated = allReviews.slice(start, start + limit);
        return { ratings: paginated, totalPages, totalCount };
    }

    async getGymRatings(
        gymId: string,
        page: number = 1,
        limit: number = 5
    ): Promise<{ ratings: unknown[]; totalPages: number; totalCount: number }> {
        const gym = await GymModel.findById(gymId).populate('reviews.userId', 'name profileImage');
        const allReviews = gym?.reviews || [];
        const totalCount = allReviews.length;
        const totalPages = Math.ceil(totalCount / limit);
        const start = (page - 1) * limit;
        const paginated = allReviews.slice(start, start + limit);
        return { ratings: paginated, totalPages, totalCount };
    }
}
