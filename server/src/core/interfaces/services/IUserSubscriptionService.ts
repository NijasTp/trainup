export interface IUserSubscriptionService {
    getUserSubscriptions(userId: string): Promise<any>;
}
