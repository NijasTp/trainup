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
  certificate: string;
  verifyStatus: "pending" | "approved" | "rejected";
  rejectReason: string | null;
  isBanned: boolean;
  tokenVersion?: number;
  trainers?: Types.ObjectId[] | null;
  members?: Types.ObjectId[] | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  images: string[] | null;
  profileImage: string | null;
  rating?: number;
  reviews?: { rating: number; message: string; userId: Types.ObjectId; subscriptionPlan?: string; createdAt: Date }[];
}

const GymSchema = new Schema<IGym>(
  {
    role: { type: String, enum: ["gym"], default: "gym" },
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    announcements: [
      {
        title: String,
        message: String,
        date: { type: Date, default: Date.now },
      },
    ],
    geoLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true, minlength: 2, maxlength: 2 },
    },
    verifyStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectReason: { type: String },
    isBanned: { type: Boolean, default: false },
    tokenVersion: { type: Number, default: 0 },
    certificate: { type: String },
    trainers: [{ type: Schema.Types.ObjectId, ref: "Trainer" }],
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    images: [{ type: String }],
    profileImage: { type: String, default: null },
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