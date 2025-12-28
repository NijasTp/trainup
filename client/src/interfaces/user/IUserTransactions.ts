export interface Transaction {
    _id: string;
    amount: number;
    status: 'completed' | 'failed' | 'pending';
    trainerId: {
        _id: string;
        name: string;
        profileImage?: string;
    };
    months: number;
    createdAt: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
}
