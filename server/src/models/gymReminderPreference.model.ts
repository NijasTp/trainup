import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGymReminderPreference extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  gymId: Types.ObjectId;
  preferredTime: string; // Format: "HH:MM"
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const gymReminderPreferenceSchema: Schema<IGymReminderPreference> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    preferredTime: { type: String, required: true }, // Format: "07:30"
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

gymReminderPreferenceSchema.index({ userId: 1, gymId: 1 }, { unique: true });

export const GymReminderPreferenceModel = mongoose.model<IGymReminderPreference>(
  'GymReminderPreference',
  gymReminderPreferenceSchema
);