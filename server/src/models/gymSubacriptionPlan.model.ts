import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISubscriptionPlan extends Document {
  _id: Types.ObjectId;
  gymId: Types.ObjectId;
  name: string;
  duration: number; // in days
  durationUnit: 'days' | 'months';
  price: number;
  description?: string;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionPlanSchema: Schema<ISubscriptionPlan> = new Schema(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    name: { type: String, required: true },
    duration: { type: Number, required: true },
    durationUnit: { type: String, enum: ['days', 'months'], default: 'days' },
    price: { type: Number, required: true },
    description: { type: String },
    features: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SubscriptionPlanModel = mongoose.model<ISubscriptionPlan>('SubscriptionPlan', subscriptionPlanSchema);