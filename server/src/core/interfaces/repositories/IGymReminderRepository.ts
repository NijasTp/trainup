import { IGymReminderPreference } from "../../../models/gymReminderPreference.model";

export interface IGymReminderRepository {
  upsertReminderPreference(
    userId: string,
    gymId: string,
    preferredTime: string
  ): Promise<void>;

  findReminderPreference(
    userId: string,
    gymId: string
  ): Promise<IGymReminderPreference | null>;

  getAllActiveReminders(): Promise<Array<{
    userId: string;
    gymId: string;
    preferredTime: string;
    userEmail: string;
    userName: string;
    gymName: string;
  }>>;

  deactivateReminder(userId: string, gymId: string): Promise<void>;
}