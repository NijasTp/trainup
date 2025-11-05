import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGymAnnouncement extends Document {
  _id: Types.ObjectId;
  gymId: Types.ObjectId;
  title: string;
  description: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const gymAnnouncementSchema: Schema<IGymAnnouncement> = new Schema(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    image: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const GymAnnouncementModel = mongoose.model<IGymAnnouncement>('GymAnnouncement', gymAnnouncementSchema);