import { injectable, inject } from 'inversify';
import TYPES from '../core/types/types';
import { IReviewRepository } from '../core/interfaces/repositories/IReviewRepository';
import { ITrainerRepository } from '../core/interfaces/repositories/ITrainerRepository';
import { IGymRepository } from '../core/interfaces/repositories/IGymRepository';
import { IReview } from '../models/review.model';
import { IGym } from '../models/gym.model';
import { AppError } from '../utils/appError.util';
import { Types } from 'mongoose';
import { STATUS_CODE } from '../constants/status';

import { IReviewService } from '../core/interfaces/services/IReviewService'

@injectable()
export class ReviewService implements IReviewService {
    constructor(
        @inject(TYPES.IReviewRepository) private reviewRepository: IReviewRepository,
        @inject(TYPES.ITrainerRepository) private trainerRepository: ITrainerRepository,
        @inject(TYPES.IGymRepository) private gymRepository: IGymRepository
    ) { }

    async addReview(userId: string, targetId: string, targetModel: 'Trainer' | 'Gym', rating: number, comment: string, subscriptionPlan?: string): Promise<IReview> {
        const userObjectId = new Types.ObjectId(userId);
        const targetObjectId = new Types.ObjectId(targetId);

        const existingReview = await this.reviewRepository.findOne({ 
            userId: userObjectId, 
            targetId: targetObjectId, 
            targetModel 
        });
        
        if (existingReview) {
            // Update existing review instead of throwing error
            const updatedReview = await this.reviewRepository.update((existingReview as any)._id.toString(), { rating, comment, subscriptionPlan });
            if (!updatedReview) throw new AppError('Failed to update existing review', STATUS_CODE.INTERNAL_SERVER_ERROR);
            
            await this.updateEntityRating(targetId, targetModel);
            await updatedReview.populate('userId', 'firstName lastName profilePicture name');
            return updatedReview;
        }

        const reviewData: Partial<IReview> = {
            userId: userObjectId as unknown as Types.ObjectId,
            targetId: targetObjectId as unknown as Types.ObjectId,
            targetModel,
            rating,
            comment,
            subscriptionPlan
        };

        const newReview = await this.reviewRepository.create(reviewData);

        await this.updateEntityRating(targetId, targetModel);

        await newReview.populate('userId', 'firstName lastName profilePicture name');

        return newReview;
    }
    async getUserReview(userId: string, targetId: string, targetModel: 'Trainer' | 'Gym'): Promise<IReview | null> {
        const userObjectId = new Types.ObjectId(userId);
        const targetObjectId = new Types.ObjectId(targetId);
        const review = await this.reviewRepository.findOne({ 
            userId: userObjectId, 
            targetId: targetObjectId, 
            targetModel 
        });
        if (review) {
            await review.populate('userId', 'firstName lastName profilePicture name');
        }
        return review;
    }

    async getReviews(targetId: string, page: number = 1, limit: number = 5, search: string = '', rating?: number): Promise<{ reviews: IReview[], total: number, pages: number }> {
        const skip = (page - 1) * limit;
        const reviews = await this.reviewRepository.findByTargetId(targetId, skip, limit, search, rating);
        const total = await this.reviewRepository.countByTargetId(targetId, search, rating);
        const pages = Math.ceil(total / limit);

        return { reviews, total, pages };
    }

    private async updateEntityRating(targetId: string, targetModel: 'Trainer' | 'Gym'): Promise<void> {
        const averageRating = await this.reviewRepository.getAverageRating(targetId);

        if (targetModel === 'Trainer') {
            await this.trainerRepository.findByIdAndUpdate(targetId, { rating: averageRating });
        } else if (targetModel === 'Gym') {
            await this.gymRepository.updateGym(targetId, { rating: averageRating } as Partial<IGym>);
        }
    }

    async editReview(userId: string, reviewId: string, rating: number, comment: string): Promise<IReview> {
        const review = await this.reviewRepository.findOne({ _id: reviewId, userId });
        if (!review) {
            throw new AppError('Review not found or you do not have permission to edit it.', STATUS_CODE.NOT_FOUND);
        }

        const updatedReview = await this.reviewRepository.update(reviewId, { rating, comment });
        if (!updatedReview) throw new AppError('Failed to update review', STATUS_CODE.INTERNAL_SERVER_ERROR);

        await this.updateEntityRating(updatedReview.targetId.toString(), updatedReview.targetModel);
        await updatedReview.populate('userId', 'name profilePicture');
        return updatedReview;
    }

    async deleteReview(userId: string, reviewId: string): Promise<void> {
        const review = await this.reviewRepository.findOne({ _id: reviewId, userId });
        if (!review) {
            throw new AppError('Review not found or you do not have permission to delete it.', STATUS_CODE.NOT_FOUND);
        }

        await this.reviewRepository.delete(reviewId);
        await this.updateEntityRating(review.targetId.toString(), review.targetModel);
    }
}
