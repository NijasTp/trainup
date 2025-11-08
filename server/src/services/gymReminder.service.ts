import { injectable, inject } from 'inversify';
import { IGymReminderService } from '../core/interfaces/services/IGymReminderService';
import { IGymReminderRepository } from '../core/interfaces/repositories/IGymReminderRepository';
import TYPES from '../core/types/types';

@injectable()
export class GymReminderService implements IGymReminderService {
  constructor(
    @inject(TYPES.IGymReminderRepository) private _gymReminderRepo: IGymReminderRepository
  ) {}

  async saveReminderPreference(
    userId: string,
    gymId: string,
    preferredTime: string
  ): Promise<void> {
    await this._gymReminderRepo.upsertReminderPreference(
      userId,
      gymId,
      preferredTime
    );
  }

  async getReminderPreference(
    userId: string,
    gymId: string
  ): Promise<string | null> {
    const preference = await this._gymReminderRepo.findReminderPreference(
      userId,
      gymId
    );
    return preference?.preferredTime || null;
  }

  async getAllActiveReminders(): Promise<Array<{
    userId: string;
    gymId: string;
    preferredTime: string;
    userEmail: string;
    userName: string;
    gymName: string;
  }>> {
    return await this._gymReminderRepo.getAllActiveReminders();
  }

  async deactivateReminder(userId: string, gymId: string): Promise<void> {
    await this._gymReminderRepo.deactivateReminder(userId, gymId);
  }
}