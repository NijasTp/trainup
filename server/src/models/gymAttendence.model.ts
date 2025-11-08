import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAttendance extends Document {
  _id: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  gymId: Types.ObjectId | string;
  date: Date;
  checkInTime: Date;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  isValidLocation: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema: Schema<IAttendance> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    date: { type: Date, required: true },
    checkInTime: { type: Date, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true, minlength: 2, maxlength: 2 },
    },
    isValidLocation: { type: Boolean, required: true },
  },
  { timestamps: true }
);

attendanceSchema.index({ userId: 1, gymId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ location: '2dsphere' });

export const AttendanceModel = mongoose.model<IAttendance>('Attendance', attendanceSchema);