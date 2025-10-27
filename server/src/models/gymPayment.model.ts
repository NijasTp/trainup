import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGymPayment extends Document {
  _id: Types.ObjectId;
  gymId: Types.ObjectId;
  userId: Types.ObjectId;
  planId: Types.ObjectId;
  amount: number;
  paymentMethod: 'stripe' | 'manual';
  stripeSessionId?: string;
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate: Date;
  subscriptionStartDate: Date;
  subscriptionEndDate: Date;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const gymPaymentSchema: Schema<IGymPayment> = new Schema(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    planId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['stripe', 'manual'], required: true },
    stripeSessionId: { type: String },
    transactionId: { type: String },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    paymentDate: { type: Date, default: Date.now },
    subscriptionStartDate: { type: Date, required: true },
    subscriptionEndDate: { type: Date, required: true },
    createdBy: { type: Schema.Types.ObjectId },
  },
  { timestamps: true }
);

export const GymPaymentModel = mongoose.model<IGymPayment>('GymPayment', gymPaymentSchema);