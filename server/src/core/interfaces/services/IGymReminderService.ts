export interface IGymReminderService {
  saveReminderPreference(
    userId: string,
    gymId: string,
    preferredTime: string
  ): Promise<void>;

  getReminderPreference(
    userId: string,
    gymId: string
  ): Promise<string | null>;

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