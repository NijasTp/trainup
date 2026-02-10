import { Schema, model, Document, ObjectId, Types } from "mongoose";

export interface IGym extends Document {
  _id: ObjectId;
  role: "gym";
  name: string | null;
  email: string | null;
  password: string | null;
  announcements: { title: string; message: string; date: Date }[];
  geoLocation: {
    type: "Point";
    coordinates: [number, number];
  };
  address: string | null;
  certifications: string[];
  openingHours: {
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
  }[];
  verifyStatus: "pending" | "approved" | "rejected";
  rejectReason: string | null;
  isBanned: boolean;
  isEmailVerified: boolean;
  onboardingCompleted: boolean;
  otp?: string;
  otpExpiresAt?: Date;
  createdAt: Date | null;
  updatedAt: Date | null;
  images: string[] | null;
  profileImage: string | null;
  logo: string | null;
  description: string | null;
  rating?: number;
  reviews?: { rating: number; message: string; userId: Types.ObjectId; subscriptionPlan?: string; createdAt: Date }[];
  tokenVersion: number;
  trainers: Types.ObjectId[];
  members: Types.ObjectId[];
}

const GymSchema = new Schema<IGym>(
  {
    role: { type: String, enum: ["gym"], default: "gym" },
    name: { type: String },
    email: { type: String, unique: true, lowercase: true, trim: true },
    password: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    onboardingCompleted: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    announcements: [
      {
        title: String,
        message: String,
        date: { type: Date, default: Date.now },
      },
    ],
    geoLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true, default: [0, 0] },
    },
    address: { type: String },
    certifications: [{ type: String }],
    openingHours: [
      {
        day: { type: String, required: true },
        open: { type: String },
        close: { type: String },
        isClosed: { type: Boolean, default: false },
      },
    ],
    verifyStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectReason: { type: String },
    isBanned: { type: Boolean, default: false },
    tokenVersion: { type: Number, default: 0 },
    trainers: [{ type: Schema.Types.ObjectId, ref: "Trainer" }],
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    images: [{ type: String }],
    profileImage: { type: String, default: null },
    logo: { type: String, default: null },
    description: { type: String },
    rating: { type: Number, default: 0 },
    reviews: [
      {
        rating: { type: Number, required: true },
        message: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        subscriptionPlan: { type: String },
        createdAt: { type: Date, default: Date.now }
      },
    ],
  },
  { timestamps: true }
);

GymSchema.index({ geoLocation: "2dsphere" });

export const GymModel = model<IGym>("Gym", GymSchema);