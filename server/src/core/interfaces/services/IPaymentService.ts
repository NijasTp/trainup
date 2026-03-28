export interface IPaymentService {
  createTrainerCheckoutSession(params: {
    userId: string;
    trainerId: string;
    planType: 'basic' | 'premium' | 'pro';
    amount: number;
    userName: string;
    trainerName: string;
    duration: number;
  }): Promise<{ sessionId: string; url: string | null }>;

  createGymCheckoutSession(params: {
    userId: string;
    gymId: string;
    subscriptionPlanId: string;
    amount: number;
    userName: string;
    gymName: string;
    planName: string;
    preferredTime: string;
  }): Promise<{ sessionId: string; url: string | null }>;

  getGymTransactions(
    gymId: string,
    page: number,
    limit: number
  ): Promise<{ transactions: any[]; totalPages: number }>;

  createGymTransaction(data: any): Promise<any>;

  findPendingGymTransactionByUser(userId: string): Promise<any>;

  getCheckoutSession(sessionId: string): Promise<any>;

  markUserPendingGymTransactionsAsFailed(userId: string): Promise<number>;
}
