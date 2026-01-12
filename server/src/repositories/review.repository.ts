import { injectable } from 'inversify';
import Review, { IReview } from '../models/review.model';
import mongoose, { FilterQuery } from 'mongoose';

@injectable()
export class ReviewRepository {
    async create(reviewData: Partial<IReview>): Promise<IReview> {
        const review = await Review.create(reviewData);
        return review;
    }

    async findByTargetId(targetId: string, skip: number, limit: number, search: string = ''): Promise<IReview[]> {
        const query: FilterQuery<IReview> = { targetId: new mongoose.Types.ObjectId(targetId) };
        if (search) {
            query.comment = { $regex: search, $options: 'i' };
        }
        return await Review.find(query)
            .populate('userId', 'name profilePicture firstName lastName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    }

    async countByTargetId(targetId: string, search: string = ''): Promise<number> {
        const query: FilterQuery<IReview> = { targetId: new mongoose.Types.ObjectId(targetId) };
        if (search) {
            query.comment = { $regex: search, $options: 'i' };
        }
        return await Review.countDocuments(query);
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
