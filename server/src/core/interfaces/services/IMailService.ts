export interface IMailService {
  sendMail(to: string, subject: string, html: string): Promise<void>;
  sendGymSubscriptionEmail (
    userEmail: string,
    userName: string,
    gymName: string,
    planName: string,
    preferredTime: string
  ): Promise<void>
  sendDailyWorkoutReminder (
    userEmail: string,
    userName: string,
    gymName: string
  ): Promise<void>
  sendReminderMail (to: string, message: string): Promise<void>
}
