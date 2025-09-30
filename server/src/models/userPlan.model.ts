import { Schema, model, Document, Types } from 'mongoose';

export interface IUserPlan extends Document {
  _id: string | Schema.Types.ObjectId;
  userId: Types.ObjectId | string;
  trainerId: Types.ObjectId | string;
  planType: 'basic' | 'premium' | 'pro';
  messagesLeft: number;
  videoCallsLeft: number;
  expiryDate: Date;
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
}, { timestamps: true });

UserPlanSchema.index({ userId: 1, trainerId: 1 }, { unique: true });

export const UserPlanModel = model<IUserPlan>('UserPlan', UserPlanSchema);