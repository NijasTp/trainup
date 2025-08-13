import mongoose, { Schema, Document, Types, Model } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  isVerified?: boolean;
  googleId:string;
  role: "user";
  goals?: string[];
  activityLevel?: string;
  equipment?: Boolean;
  assignedTrainer?: Types.ObjectId;
  gymId?: Types.ObjectId;
  isPrivate?: boolean;
  tokenVersion?: number;
  isBanned: boolean;
  streak?: number;
  xp?: number;
  achievements?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: false },
    phone: { type: String, required: false },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["user"], default: "user" },
    goals: { type: [String], required: false },
    activityLevel: { type: String, required: false },
    googleId: { type: String, required: false },
    equipment: { type: Boolean, required: false },
    assignedTrainer: { type: Schema.Types.ObjectId, ref: "Trainer", required: false },
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: false },
    tokenVersion: { type: Number, default: 0 },
    isPrivate: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    streak: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    achievements: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const UserModel: Model<IUser> = mongoose.model<IUser>("User", userSchema);
