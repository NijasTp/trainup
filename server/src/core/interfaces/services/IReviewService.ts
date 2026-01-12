import { IReview } from '../../../models/review.model';

export interface IReviewService {
    addReview(userId: string, targetId: string, targetModel: 'Trainer' | 'Gym', rating: number, comment: string, subscriptionPlan?: string): Promise<IReview>;
    getReviews(targetId: string, page?: number, limit?: number, search?: string): Promise<{ reviews: IReview[], total: number, pages: number }>;
    editReview(userId: string, reviewId: string, rating: number, comment: string): Promise<IReview>;
    deleteReview(userId: string, reviewId: string): Promise<void>;
}
