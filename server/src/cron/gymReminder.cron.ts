import cron from 'node-cron';
import container from '../core/di/inversify.config';
import TYPES from '../core/types/types';
import { IGymReminderService } from '../core/interfaces/services/IGymReminderService';
import { IMailService } from '../core/interfaces/services/IMailService';
import { logger } from '../utils/logger.util';

export class GymReminderCron {
  private _gymReminderService: IGymReminderService;
  private _mailService: IMailService;

  constructor() {
    this._gymReminderService = container.get<IGymReminderService>(TYPES.IGymReminderService);
    this._mailService = container.get<IMailService>(TYPES.IMailService);
    this.setupCronJobs();
  }

  private setupCronJobs(): void {
    cron.schedule('0 * * * *', async () => {
      await this.sendWorkoutReminders();
    });

    cron.schedule('0 0 * * *', async () => {
      await this.checkSubscriptionExpiry();
    });
  }

  private async sendWorkoutReminders(): Promise<void> {
    try {
      const currentTime = new Date();
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();
      const dayOfWeek = currentTime.getDay();

      if (dayOfWeek === 0) {
        return;
      }

      const reminders = await this._gymReminderService.getAllActiveReminders();

      for (const reminder of reminders) {
        const [preferredHour] = reminder.preferredTime.split(':');

        if (parseInt(preferredHour, 10) === currentHour && currentMinute === 0) {
          await this._mailService.sendDailyWorkoutReminder(
            reminder.userEmail,
            reminder.userName,
            reminder.gymName
          );

          logger.info(`Workout reminder sent to ${reminder.userEmail} for ${reminder.gymName}`);
        }
      }
    } catch (error) {
      logger.error('Error sending workout reminders:', error);
    }
  }

  private async checkSubscriptionExpiry(): Promise<void> {
    try {
      logger.info('Checking subscription expiry...');
    } catch (error) {
      logger.error('Error checking subscription expiry:', error);
    }
  }
}

export const gymReminderCron = new GymReminderCron();