import { Schema, model, Document, Types } from 'mongoose'

export interface ITransaction extends Document {
  _id: string | Schema.Types.ObjectId
  userId: Types.ObjectId | string
  trainerId: Types.ObjectId | string
  sessionId?: string
  amount: number
  planType: 'basic' | 'premium' | 'pro'
  razorpayOrderId: string
  razorpayPaymentId?: string
  status: 'pending' | 'completed' | 'failed'
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
    sessionId: { type: String },
    amount: { type: Number, required: true },
    planType: {
      type: String,
      required: true,
      enum: ['basic', 'premium', 'pro']
    },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

export const TransactionModel = model<ITransaction>(
  'Transaction',
  TransactionSchema
)
