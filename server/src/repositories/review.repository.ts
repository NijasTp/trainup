import { injectable } from 'inversify';
import Review, { IReview } from '../models/review.model';
import mongoose, { FilterQuery } from 'mongoose';

@injectable()
export class ReviewRepository {
    async create(reviewData: Partial<IReview>): Promise<IReview> {
        const review = await Review.create(reviewData);
        return review;
    }

    async findByTargetId(targetId: string, skip: number, limit: number): Promise<IReview[]> {
        return await Review.find({ targetId })
            .populate('userId', 'name profilePicture')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    }

    async countByTargetId(targetId: string): Promise<number> {
        return await Review.countDocuments({ targetId });
    }

    async findOne(filter: FilterQuery<IReview>): Promise<IReview | null> {
        return await Review.findOne(filter);
    }

    async update(reviewId: string, updateData: Partial<IReview>): Promise<IReview | null> {
        return await Review.findByIdAndUpdate(reviewId, updateData, { new: true });
    }

    async delete(reviewId: string): Promise<IReview | null> {
        return await Review.findByIdAndDelete(reviewId);
    }

    async getAverageRating(targetId: string): Promise<number> {
        const stats = await Review.aggregate([
            { $match: { targetId: new mongoose.Types.ObjectId(targetId) } },
            {
                $group: {
                    _id: '$targetId',
                    averageRating: { $avg: '$rating' },
                    count: { $sum: 1 }
                }
            }
        ]);

        return stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : 0;
    }
}
