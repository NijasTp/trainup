import { inject, injectable } from 'inversify';
import { Types } from 'mongoose';
import { IStreakRepository } from '../core/interfaces/repositories/IStreakRepository';

@injectable()
export class StreakService {
  constructor(
    @inject('StreakRepository') private streakRepository: IStreakRepository
  ) {}

  async incrementStreak(userId: Types.ObjectId) {
    return await this.streakRepository.updateStreak(userId, true);
  }

  async resetStreak(userId: Types.ObjectId) {
    return await this.streakRepository.updateStreak(userId, false);
  }

  async getUserStreak(userId: Types.ObjectId) {
    return await this.streakRepository.findByUserId(userId);
  }
}
