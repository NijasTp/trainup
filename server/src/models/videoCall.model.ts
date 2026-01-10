import { Schema, model, Document, Types } from 'mongoose';

export interface IParticipant {
  userId: Types.ObjectId;
  userType: 'user' | 'trainer';
  joinedAt: Date;
  leftAt?: Date;
  isActive: boolean;
}

export interface IVideoCall extends Document {
  _id: string | Schema.Types.ObjectId;
  slotId: Types.ObjectId | string;
  roomId: string;
  participants: IParticipant[];
  status: 'scheduled' | 'active' | 'ended';
  scheduledStartTime: Date;
  scheduledEndTime: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const VideoCallSchema = new Schema<IVideoCall>({
  slotId: { type: Schema.Types.ObjectId, ref: 'Slot', required: true, unique: true },
  roomId: { type: String, required: true, unique: true },
  participants: [{
    userId: { type: Schema.Types.ObjectId, required: true },
    userType: { type: String, enum: ['user', 'trainer'], required: true },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date },
    isActive: { type: Boolean, default: true }
  }],
  status: {
    type: String,
    enum: ['scheduled', 'active', 'ended'],
    default: 'scheduled'
  },
  scheduledStartTime: { type: Date, required: true },
  scheduledEndTime: { type: Date, required: true },
  actualStartTime: { type: Date },
  actualEndTime: { type: Date },
}, { timestamps: true });

VideoCallSchema.index({ status: 1 });

export const VideoCallModel = model<IVideoCall>('VideoCall', VideoCallSchema);