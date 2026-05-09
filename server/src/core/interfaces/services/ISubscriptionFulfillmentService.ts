export interface ISubscriptionFulfillmentService {
    fulfillTrainerSubscription(sessionId: string, metadata: any): Promise<void>;
    fulfillGymSubscription(sessionId: string, metadata: any): Promise<void>;
    fulfillBundlePurchase(sessionId: string, metadata: any): Promise<void>;
}
