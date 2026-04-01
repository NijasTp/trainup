import { Document, Types } from 'mongoose';

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
