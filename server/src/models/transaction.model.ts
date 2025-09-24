import { Schema, model, Document } from 'mongoose';

export interface ITransaction extends Document {
  _id: string | Schema.Types.ObjectId;
  userId: string;
  trainerId: string;
  sessionId?: string;
  amount: number;
  months: number;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export const TransactionSchema = new Schema<ITransaction>({
  userId: { type: String, required: true },
  trainerId: { type: String, required: true },
  sessionId: { type: String },
  amount: { type: Number, required: true },
  months: { type: Number, required: true, enum: [1, 3, 5] },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String},
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export const TransactionModel = model<ITransaction>('Transaction', TransactionSchema);