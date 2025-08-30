import { Types } from 'mongoose';
import { IStreak } from '../../../models/streak.model';

export interface IStreakRepository {
  create(userId: Types.ObjectId): Promise<IStreak>;
  findByUserId(userId: Types.ObjectId): Promise<IStreak | null>;
  update(streak: IStreak): Promise<IStreak>;
}
