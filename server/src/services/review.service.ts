import { injectable, inject } from 'inversify';
import TYPES from '../core/types/types';
import { ReviewRepository } from '../repositories/review.repository';
import { TrainerRepository } from '../repositories/trainer.repository';
import { GymRepository } from '../repositories/gym.repository';
import { IReview } from '../models/review.model';
import { IGym } from '../models/gym.model';
import { AppError } from '../utils/appError.util';
import { Types } from 'mongoose';
import { STATUS_CODE } from '../constants/status';

import { IReviewService } from '../core/interfaces/services/IReviewService'

@injectable()
export class ReviewService implements IReviewService {
    constructor(
        @inject(TYPES.IReviewRepository) private reviewRepository: ReviewRepository,
        @inject(TYPES.ITrainerRepository) private trainerRepository: TrainerRepository,
        @inject(TYPES.IGymRepository) private gymRepository: GymRepository
    ) { }

    async addReview(userId: string, targetId: string, targetModel: 'Trainer' | 'Gym', rating: number, comment: string, subscriptionPlan?: string): Promise<IReview> {
        const existingReview = await this.reviewRepository.findOne({ userId, targetId });
        if (existingReview) {
            throw new AppError('You have already reviewed this.', STATUS_CODE.BAD_REQUEST);
        }

        const reviewData: Partial<IReview> = {
            userId: new Types.ObjectId(userId) as unknown as Types.ObjectId,
            targetId: new Types.ObjectId(targetId) as unknown as Types.ObjectId,
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

    async getReviews(targetId: string, page: number = 1, limit: number = 5): Promise<{ reviews: IReview[], total: number, pages: number }> {
        const skip = (page - 1) * limit;
        const reviews = await this.reviewRepository.findByTargetId(targetId, skip, limit);
        const total = await this.reviewRepository.countByTargetId(targetId);
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
