import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGymTransaction extends Document {
  _id: Types.ObjectId | string;
  gymId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  subscriptionPlanId: Types.ObjectId | string;
  preferredTime: Date|string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

const gymTransactionSchema: Schema<IGymTransaction> = new Schema(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subscriptionPlanId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'cancelled'], 
      default: 'pending' 
    },
    paymentMethod: { type: String, default: 'razorpay' },
  },
  { timestamps: true }
);

export const GymTransactionModel = mongoose.model<IGymTransaction>('GymTransaction', gymTransactionSchema);