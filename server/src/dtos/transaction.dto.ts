export interface ITransactionDTO {
  _id: string;
  userId: string;
  trainerId?: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  months: number;
  createdAt: Date;
  updatedAt: Date;
}
