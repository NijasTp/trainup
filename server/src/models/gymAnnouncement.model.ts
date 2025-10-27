import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGymAnnouncement extends Document {
  _id: Types.ObjectId;
  gymId: Types.ObjectId;
  title: string;
  content: string;
  type: 'trainer' | 'user' | 'general';
  targetAudience: Types.ObjectId[];
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const gymAnnouncementSchema: Schema<IGymAnnouncement> = new Schema(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['trainer', 'user', 'general'], required: true },
    targetAudience: [{ type: Schema.Types.ObjectId }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

export const GymAnnouncementModel = mongoose.model<IGymAnnouncement>('GymAnnouncement', gymAnnouncementSchema);