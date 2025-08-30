import { injectable } from 'inversify';
import { Types } from 'mongoose';
import  {Streak, IStreak } from '../models/streak.model';
import { IStreakRepository } from '../core/interfaces/repositories/IStreakRepository';

@injectable()
export class StreakRepository implements IStreakRepository {
  async create(userId: Types.ObjectId): Promise<IStreak> {
    const streak = await Streak.create({
      userId,
      currentStreak: 0,
      longestStreak: 0,
      lastActionDate: new Date(),
    });
    return streak.toObject() as IStreak;
  }

  async findByUserId(userId: Types.ObjectId): Promise<IStreak | null> {
    const streak = await Streak.findOne({ userId }).lean<IStreak>().exec();
    return streak;
  }

  async update(streak: IStreak): Promise<IStreak> {
    await Streak.updateOne({ _id: streak._id }, streak).exec();
    return streak;
  }
}
