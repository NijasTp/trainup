export interface ITransactionDTO {
  _id: string;
  userId: string;
  trainerId?: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  planType: 'basic' | 'premium' | 'pro';
  createdAt: Date;
  updatedAt: Date;
}