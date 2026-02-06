import { Schema, model, Document, Types } from 'mongoose';

export interface IUserPlan extends Document {
  _id: string | Schema.Types.ObjectId;
  userId: Types.ObjectId | string;
  trainerId: Types.ObjectId | string;
  planType: 'basic' | 'premium' | 'pro';
  messagesLeft: number;
  videoCallsLeft: number;
  expiryDate: Date;
  duration: number; // in months
  amount: number; // total paid
  refundedAmount: number;
  cancellationDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const UserPlanSchema = new Schema<IUserPlan>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer', required: true },
  planType: { type: String, required: true, enum: ['basic', 'premium', 'pro'] },
  messagesLeft: { type: Number, default: 0 },
  videoCallsLeft: { type: Number, default: 0 },
  expiryDate: { type: Date, required: true },
  duration: { type: Number, required: true },
  amount: { type: Number, required: true },
  refundedAmount: { type: Number, default: 0 },
  cancellationDate: { type: Date, default: null },
}, { timestamps: true });

UserPlanSchema.index({ userId: 1, trainerId: 1 }, { unique: true });

export const UserPlanModel = model<IUserPlan>('UserPlan', UserPlanSchema);