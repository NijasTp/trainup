import { Schema, model, Document, Types } from 'mongoose';

export interface IRequestedBy {
  userId: Types.ObjectId;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface ISlot extends Document {
  _id: string | Schema.Types.ObjectId;
  trainerId: Types.ObjectId | string;
  date: Date;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  bookedBy?: Types.ObjectId;
  requestedBy: IRequestedBy[];
  videoCallLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const SlotSchema = new Schema<ISlot>({
  trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
  bookedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  requestedBy: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    requestedAt: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
    rejectionReason: { type: String }
  }],
  videoCallLink: { type: String },
}, { timestamps: true });

SlotSchema.index({ trainerId: 1, date: 1 });
SlotSchema.index({ bookedBy: 1 });
SlotSchema.index({ 'requestedBy.userId': 1 });

export const SlotModel = model<ISlot>('Slot', SlotSchema);