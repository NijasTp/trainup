import { injectable } from 'inversify';
import { IGymReminderRepository } from '../core/interfaces/repositories/IGymReminderRepository';
import {
  IGymReminderPreference,
  GymReminderPreferenceModel,
} from '../models/gymReminderPreference.model';
import { Types } from 'mongoose';

@injectable()
export class GymReminderRepository implements IGymReminderRepository {
  async upsertReminderPreference(
    userId: string,
    gymId: string,
    preferredTime: string
  ): Promise<void> {
    await GymReminderPreferenceModel.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),
        gymId: new Types.ObjectId(gymId),
      },
      {
        preferredTime,
        isActive: true,
      },
      { upsert: true }
    );
  }

  async findReminderPreference(
    userId: string,
    gymId: string
  ): Promise<IGymReminderPreference | null> {
    return await GymReminderPreferenceModel.findOne({
      userId: new Types.ObjectId(userId),
      gymId: new Types.ObjectId(gymId),
      isActive: true,
    }).lean();
  }

  async getAllActiveReminders(): Promise<Array<{
    userId: string;
    gymId: string;
    preferredTime: string;
    userEmail: string;
    userName: string;
    gymName: string;
  }>> {
    const result = await GymReminderPreferenceModel.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $lookup: {
          from: 'gyms',
          localField: 'gymId',
          foreignField: '_id',
          as: 'gym',
        },
      },
      { $unwind: '$user' },
      { $unwind: '$gym' },
      {
        $project: {
          userId: { $toString: '$userId' },
          gymId: { $toString: '$gymId' },
          preferredTime: 1,
          userEmail: '$user.email',
          userName: '$user.name',
          gymName: '$gym.name',
        },
      },
    ]);

    return result;
  }

  async deactivateReminder(userId: string, gymId: string): Promise<void> {
    await GymReminderPreferenceModel.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),
        gymId: new Types.ObjectId(gymId),
      },
      { isActive: false }
    );
  }
}