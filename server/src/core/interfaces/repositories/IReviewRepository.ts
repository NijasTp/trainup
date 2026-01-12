import { IReview } from '../../../models/review.model';

export interface IReviewRepository {
    create(reviewData: Partial<IReview>): Promise<IReview>;
    findByTargetId(targetId: string, skip: number, limit: number, search?: string): Promise<IReview[]>;
    countByTargetId(targetId: string, search?: string): Promise<number>;
    getAverageRating(targetId: string): Promise<number>;
    findOne(query: Record<string, unknown>): Promise<IReview | null>;
    update(reviewId: string, updateData: Partial<IReview>): Promise<IReview | null>;
    delete(reviewId: string): Promise<IReview | null>;
}
