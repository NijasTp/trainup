import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGymAttendance extends Document {
  _id: Types.ObjectId;
  gymId: Types.ObjectId;
  userId: Types.ObjectId;
  date: Date;
  checkInTime: Date;
  checkOutTime?: Date;
  markedBy: 'user' | 'trainer' | 'gym';
  markedById?: Types.ObjectId;
  qrCodeId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const gymAttendanceSchema: Schema<IGymAttendance> = new Schema(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    checkInTime: { type: Date, required: true, default: Date.now },
    checkOutTime: { type: Date },
    markedBy: { type: String, enum: ['user', 'trainer', 'gym'], required: true },
    markedById: { type: Schema.Types.ObjectId },
    qrCodeId: { type: Schema.Types.ObjectId, ref: 'GymQRCode' },
  },
  { timestamps: true }
);

export const GymAttendanceModel = mongoose.model<IGymAttendance>('GymAttendance', gymAttendanceSchema);