

export interface IRatingService {
    addTrainerRating(trainerId: string, userId: string, rating: number, message: string, subscriptionPlan?: string): Promise<any>
    addGymRating(gymId: string, userId: string, rating: number, message: string, subscriptionPlan?: string): Promise<any>
    getTrainerRatings(trainerId: string, page?: number, limit?: number): Promise<{ ratings: any[], totalPages: number, totalCount: number }>
    getGymRatings(gymId: string, page?: number, limit?: number): Promise<{ ratings: any[], totalPages: number, totalCount: number }>
}
