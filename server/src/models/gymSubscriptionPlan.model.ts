import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISubscriptionPlan extends Document {
  _id: Types.ObjectId;
  gymId: Types.ObjectId;
  name: string;
  duration: number;
  durationUnit: 'day' | 'month' | 'year';
  price: number;
  description?: string;
  features: string[];
  trainerChat: boolean;
  videoCall: boolean;
  isCardioIncluded: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

}

const subscriptionPlanSchema: Schema<ISubscriptionPlan> = new Schema(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    name: { type: String, required: true },
    duration: { type: Number, required: true },
    durationUnit: { type: String, enum: ['day', 'month', 'year'], default: 'month' },
    price: { type: Number, required: true },
    description: { type: String },
    features: [{ type: String }],
    trainerChat: { type: Boolean, default: false },
    videoCall: { type: Boolean, default: false },
    isCardioIncluded: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },

  { timestamps: true }
);

export const SubscriptionPlanModel = mongoose.model<ISubscriptionPlan>('SubscriptionPlan', subscriptionPlanSchema);