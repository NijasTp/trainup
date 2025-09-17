import { inject, injectable } from 'inversify';
import { Types } from 'mongoose';
import { IStreakService } from '../core/interfaces/services/IStreakService';
import { IStreakRepository } from '../core/interfaces/repositories/IStreakRepository';
import TYPES from '../core/types/types';

@injectable()
export class StreakService implements IStreakService {
  constructor(
    @inject(TYPES.IStreakRepository)
    private _streakRepo: IStreakRepository
  ) {}

  async getOrCreateUserStreak(userId: Types.ObjectId) {
    let streak = await this._streakRepo.findByUserId(userId);
    if (!streak) {
      streak = await this._streakRepo.create(userId);
    }
    return streak;
  }

  async updateUserStreak(userId: Types.ObjectId){
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
  async checkAndResetUserStreak(userId: Types.ObjectId) {
    const streak = await this.getOrCreateUserStreak(userId);
    const today = new Date();

    const diffDays = Math.floor(
      (today.getTime() - new Date(streak.lastActionDate).getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays <= 1) {
      return streak;
    }
    streak.currentStreak = 0;
    streak.lastActionDate = new Date();
    return await this._streakRepo.update(streak);
  }
}
