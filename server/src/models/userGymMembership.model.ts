import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserGymMembership extends Document {
  _id: Types.ObjectId | string;
  userId: Types.ObjectId;
  gymId: Types.ObjectId;
  planId: Types.ObjectId | string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  joinedAt: Date;
  subscriptionStartDate: Date;
  subscriptionEndDate: Date;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  preferredTime?: string;
  price: number;
  refundedAmount: number;
  cancellationDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userGymMembershipSchema: Schema<IUserGymMembership> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    planId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    status: { type: String, enum: ['active', 'expired', 'cancelled', 'pending'], default: 'pending' },
    joinedAt: { type: Date, default: Date.now },
    subscriptionStartDate: { type: Date, required: true },
    subscriptionEndDate: { type: Date, required: true },
    paymentStatus: { type: String, enum: ['paid', 'pending', 'overdue'], default: 'pending' },
    preferredTime: { type: String, default: 'Anytime' },
    price: { type: Number, required: true },
    refundedAmount: { type: Number, default: 0 },
    cancellationDate: { type: Date, default: null },
  },
  { timestamps: true }
);

export const UserGymMembershipModel = mongoose.model<IUserGymMembership>('UserGymMembership', userGymMembershipSchema);
