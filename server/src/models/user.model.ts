import mongoose, { Schema, Document, Types, Model } from "mongoose";

export interface IXPLog {
  amount: number;
  reason: string; 
  date: Date;
}

export interface IWeightLog {
  weight: number;
  date: Date;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  isVerified?: boolean;
  googleId?: string;
  role: "user";
  goals?: string[];
  activityLevel?: string;
  equipment?: boolean;
  assignedTrainer?: Types.ObjectId | string | null;
  subscriptionStartDate?: Date | null;
  gymId?: Types.ObjectId;
  isPrivate?: boolean;
  tokenVersion?: number;
  isBanned: boolean;

  streak: number;
  lastActiveDate?: Date; 
  xp: number;
  xpLogs: IXPLog[];
  achievements: string[];

  todaysWeight?: number;
  goalWeight?: number;
  weightHistory: IWeightLog[];

  height?: number; 
  age?: number;
  gender?: "male" | "female" | "other";

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
    googleId: { type: String, required: false },
    role: { type: String, enum: ["user"], default: "user" },
    goals: { type: [String], default: [] },
    activityLevel: { type: String, default: null },
    equipment: { type: Boolean, default: false },
    assignedTrainer: { type: Schema.Types.ObjectId, ref: "Trainer" },
    subscriptionStartDate: { type: Date },
    gymId: { type: Schema.Types.ObjectId, ref: "Gym" },
    tokenVersion: { type: Number, default: 0 },
    isPrivate: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },

    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    xp: { type: Number, default: 0 },
    xpLogs: [
      {
        amount: { type: Number, required: true },
        reason: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    achievements: { type: [String], default: [] },

    todaysWeight: { type: Number },
    goalWeight: { type: Number },
    weightHistory: [
      {
        weight: { type: Number, required: true },
        date: { type: Date, default: Date.now },
      },
    ],

    height: { type: Number, default: null },
    age: { type: Number, default: null },
    gender: { type: String, enum: ["male", "female", "other"] },
  },
  { timestamps: true }
);


export const UserModel: Model<IUser> = mongoose.model<IUser>("User", userSchema);
