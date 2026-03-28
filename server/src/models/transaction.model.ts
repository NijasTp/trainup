import { Schema, model, Document, Types } from 'mongoose'

export interface ITransaction extends Document {
  _id: string | Schema.Types.ObjectId
  userId: Types.ObjectId | string
  trainerId: Types.ObjectId | string
  stripeSessionId?: string
  paymentIntentId?: string
  amount: number
  platformFee: number
  trainerEarnings: number
  planType: 'basic' | 'premium' | 'pro'
  razorpayOrderId?: string
  duration?: number
  razorpayPaymentId?: string
  status: 'pending' | 'completed' | 'failed'
  provider: 'razorpay' | 'stripe'
  createdAt: Date
  updatedAt: Date
}

export const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    trainerId: {
      type: Schema.Types.ObjectId,
      ref: 'Trainer',
      required: true
    },
    stripeSessionId: { type: String },
    paymentIntentId: { type: String },
    amount: { type: Number, required: true },
    platformFee: { type: Number, default: 0 },
    trainerEarnings: { type: Number, default: 0 },
    planType: {
      type: String,
      required: true,
      enum: ['basic', 'premium', 'pro']
    },
    razorpayOrderId: { type: String },
    duration: { type: Number },
    razorpayPaymentId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    provider: { type: String, enum: ['razorpay', 'stripe'], default: 'stripe' },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

export const TransactionModel = model<ITransaction>(
  'Transaction',
  TransactionSchema
)
