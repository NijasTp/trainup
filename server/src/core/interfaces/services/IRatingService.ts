

export interface IRatingService {
    addTrainerRating(trainerId: string, userId: string, rating: number, message: string, subscriptionPlan?: string): Promise<unknown>
    addGymRating(gymId: string, userId: string, rating: number, message: string, subscriptionPlan?: string): Promise<unknown>
    getTrainerRatings(trainerId: string, page?: number, limit?: number): Promise<{ ratings: unknown[], totalPages: number, totalCount: number }>
    getGymRatings(gymId: string, page?: number, limit?: number): Promise<{ ratings: unknown[], totalPages: number, totalCount: number }>
}
