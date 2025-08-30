import { Schema, Types, model } from "mongoose";

export interface IStreak {
    _id: Types.ObjectId|string;
    userId: Types.ObjectId | string;
    currentStreak: number;
    longestStreak: number;
    lastActionDate: Date | string;
}

const streakSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActionDate: { type: Date, default: null },
});

export const Streak = model("Streak", streakSchema);
