import { inject, injectable } from 'inversify';
import { Types } from 'mongoose';
import { IStreak } from '../models/streak.model';
import { IStreakService } from '../core/interfaces/services/IStreakService';
import { IStreakRepository } from '../core/interfaces/repositories/IStreakRepository';
import TYPES from '../core/types/types';
import { logger } from '../utils/logger.util';

@injectable()
export class StreakService implements IStreakService {
  constructor(
    @inject(TYPES.IStreakRepository)
    private _streakRepo: IStreakRepository
  ) {}

  async getOrCreateUserStreak(userId: Types.ObjectId): Promise<IStreak> {
    let streak = await this._streakRepo.findByUserId(userId);
    if (!streak) {
      streak = await this._streakRepo.create(userId);
    }
    return streak;
  }

  async updateUserStreak(userId: Types.ObjectId): Promise<IStreak> {
    const streak = await this.getOrCreateUserStreak(userId);
    const today = new Date();
    const lastAction = new Date(streak.lastActionDate);
    
    const diffDays = Math.floor(
      (today.getTime() - lastAction.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      return streak;
    }

    if (diffDays === 1) {
      streak.currentStreak += 1;
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }
    } else {
      streak.currentStreak = 1;
    }

    streak.lastActionDate = today;
    return await this._streakRepo.update(streak);
  }

  async resetUserStreak(userId: Types.ObjectId): Promise<IStreak> {
    const streak = await this.getOrCreateUserStreak(userId);
    streak.currentStreak = 0;
    streak.lastActionDate = new Date();
    return await this._streakRepo.update(streak);
  }
}
