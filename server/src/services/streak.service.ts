import { inject, injectable } from 'inversify';
import { Types } from 'mongoose';
import { IStreakService } from '../core/interfaces/services/IStreakService';
import { IStreakRepository } from '../core/interfaces/repositories/IStreakRepository';
import TYPES from '../core/types/types';
import { IStreak } from '../models/streak.model';
import { MESSAGES } from '../constants/messages.constants';
import { AppError } from '../utils/appError.util';
import { STATUS_CODE } from '../constants/status';
import { IEventService } from '../core/interfaces/services/IEventService';

@injectable()
export class StreakService implements IStreakService {
  constructor(
    @inject(TYPES.IStreakRepository) private _streakRepo: IStreakRepository,
    @inject(TYPES.IEventService) private _eventService: IEventService
  ) { }

  async getOrCreateUserStreak(userId: Types.ObjectId): Promise<IStreak> {
    let streak = await this._streakRepo.findByUserId(userId);
    if (!streak) {
      streak = await this._streakRepo.create(userId);
    }
    return streak;
  }

  async updateUserStreak(userId: Types.ObjectId): Promise<IStreak> {
    const streak = await this.getOrCreateUserStreak(userId);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastActionDate = new Date(streak.lastActionDate);
    const lastAction = new Date(lastActionDate.getFullYear(), lastActionDate.getMonth(), lastActionDate.getDate());

    const diffTime = today.getTime() - lastAction.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0 && streak.currentStreak > 0) {
      return streak;
    }

    if (diffDays <= 1) {
      streak.currentStreak += 1;
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }
    } else {
      streak.currentStreak = 1;
    }

    streak.lastActionDate = now;
    const updated = await this._streakRepo.update(streak);
    if (!updated) throw new AppError(MESSAGES.FAILED_TO_UPDATE_STREAK, STATUS_CODE.INTERNAL_SERVER_ERROR);

    this._eventService.emitToUser(userId.toString(), 'streak_updated', { streak: updated.currentStreak });

    return updated;
  }

  async checkAndResetUserStreak(userId: Types.ObjectId): Promise<IStreak> {
    const streak = await this.getOrCreateUserStreak(userId);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastActionDate = new Date(streak.lastActionDate);
    const lastAction = new Date(lastActionDate.getFullYear(), lastActionDate.getMonth(), lastActionDate.getDate());

    const diffTime = today.getTime() - lastAction.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      return streak;
    }

    streak.currentStreak = 0;
    streak.lastActionDate = now;
    const updated = await this._streakRepo.update(streak);
    if (!updated) throw new AppError(MESSAGES.FAILED_TO_UPDATE_STREAK, STATUS_CODE.INTERNAL_SERVER_ERROR);

    this._eventService.emitToUser(userId.toString(), 'streak_updated', { streak: updated.currentStreak });

    return updated;
  }
}