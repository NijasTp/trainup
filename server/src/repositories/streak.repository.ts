import { Types } from 'mongoose';
import { Streak, IStreak } from '../models/streak.model';
import { IStreakRepository } from '../core/interfaces/repositories/IStreakRepository';

export class StreakRepository implements IStreakRepository {
  async findByUserId(userId: Types.ObjectId): Promise<IStreak | null> {
    return await Streak.findOne({ userId }).exec();
  }

  async create(userId: Types.ObjectId | string): Promise<IStreak | null> {
    return await Streak.create({
      userId,
      currentStreak: 0,
      longestStreak: 0,
      lastActionDate: new Date(),
    });
  }

  async updateStreak(userId: Types.ObjectId, increment: boolean): Promise<IStreak | null> {
    const streak = await Streak.findOne({ userId }).exec();

    if (!streak) {
      return await this.create(userId);
    }

    const today = new Date();
    const lastUpdate = new Date(streak.lastActionDate);
    const diffDays = Math.floor(
      (today.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1 && increment) {
      // Continuing streak
      streak.currentStreak += 1;
    } else if (diffDays > 1) {
      // Missed days → reset streak
      streak.currentStreak = increment ? 1 : 0;
    } else if (diffDays === 0 && increment) {
      // Same day, already updated → do nothing special
    }

    // Update highest streak if needed
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }

    if (increment) streak.lastActionDate = today;

    await streak.save();
    return streak;
  }
}
