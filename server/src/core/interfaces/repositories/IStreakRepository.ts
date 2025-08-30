import { Types } from "mongoose";
import { IStreak } from "../../../models/streak.model";

export interface IStreakRepository {
  findByUserId(userId: Types.ObjectId): Promise<IStreak | null>;
  create(userId: Types.ObjectId): Promise<IStreak | null>;
  updateStreak(userId: Types.ObjectId, increment: boolean): Promise<IStreak | null>;
}