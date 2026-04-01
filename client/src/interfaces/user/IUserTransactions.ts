export interface Transaction {
    _id: string;
    amount: number;
    status: 'completed' | 'failed' | 'pending' | 'cancelled';
    type: 'trainer' | 'gym';
    trainerId?: {
        _id: string;
        name: string;
        profileImage?: string;
    };
    gymId?: {
        _id: string;
        name: string;
    };
    planType?: string;
    months?: number;
    createdAt: string;
    razorpayOrderId?: string;
    stripeSessionId?: string;
    razorpayPaymentId?: string;
}
