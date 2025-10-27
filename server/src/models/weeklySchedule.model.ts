import { Schema, model, Document, Types } from 'mongoose';

export interface ITimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

export interface IDaySchedule {
  day: string;
  isActive: boolean;
  slots: ITimeSlot[];
}

export interface IWeeklySchedule extends Document {
  _id: string | Schema.Types.ObjectId;
  trainerId: Types.ObjectId | string;
  weekStart: Date;
  schedule: IDaySchedule[];
  createdAt: Date;
  updatedAt: Date;
}

export const WeeklyScheduleSchema = new Schema<IWeeklySchedule>({
  trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer', required: true },
  weekStart: { type: Date, required: true },
  schedule: [{
    day: { type: String, required: true },
    isActive: { type: Boolean, default: false },
    slots: [{
      id: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true }
    }]
  }]
}, { timestamps: true });


WeeklyScheduleSchema.index({ trainerId: 1, weekStart: 1 }, { unique: true });

export const WeeklyScheduleModel = model<IWeeklySchedule>('WeeklySchedule', WeeklyScheduleSchema);