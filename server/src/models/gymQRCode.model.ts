import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGymQRCode extends Document {
  _id: Types.ObjectId;
  gymId: Types.ObjectId;
  code: string;
  date: Date;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const gymQRCodeSchema: Schema<IGymQRCode> = new Schema(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    code: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const GymQRCodeModel = mongoose.model<IGymQRCode>('GymQRCode', gymQRCodeSchema);