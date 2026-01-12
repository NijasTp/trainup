export interface IReview {
    _id: string;
    userId: {
        _id: string;
        name: string;
        profilePicture?: string;
        profileImage?: string;
        firstName?: string;
        lastName?: string;
    };
    targetId: string;
    targetModel: 'Trainer' | 'Gym';
    rating: number;
    comment: string;
    subscriptionPlan?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedReviews {
    reviews: IReview[];
    total: number;
    pages: number;
}
