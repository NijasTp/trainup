export interface Transaction {
    _id: string;
    userId: {
        _id: string;
        name: string;
        profileImage?: string;
    } | string;
    amount: number;
    platformFee: number;
    trainerEarnings: number;
    planType: 'basic' | 'premium' | 'pro';
    status: 'pending' | 'completed' | 'failed';
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface TransactionResponse {
    transactions: Transaction[];
    total: number;
    page: number;
    totalPages: number;
    totalRevenue: number;
}
