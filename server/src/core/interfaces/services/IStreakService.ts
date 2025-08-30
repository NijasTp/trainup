import { Types } from 'mongoose'
import { IStreak } from '../../../models/streak.model'

export interface IStreakService {
  getOrCreateUserStreak(userId: Types.ObjectId | string): Promise<IStreak>
  updateUserStreak(userId: Types.ObjectId | string): Promise<IStreak>
  resetUserStreak(userId: Types.ObjectId | string): Promise<IStreak>
}
