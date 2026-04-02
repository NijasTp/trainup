import { injectable, inject } from 'inversify';
import cron from 'node-cron';
import TYPES from '../core/types/types';
import { INotificationService } from '../core/interfaces/services/INotificationService';
import { IGymReminderService } from '../core/interfaces/services/IGymReminderService';
import { IUserService } from '../core/interfaces/services/IUserService';
import { IGymService } from '../core/interfaces/services/IGymService';
import { IMessageService } from '../core/interfaces/services/IMessageService';
import { logger } from '../utils/logger.util';
import { format, isBefore, parse } from 'date-fns';

@injectable()
export class CronService {
  constructor(
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
    @inject(TYPES.IGymReminderService) private _gymReminderService: IGymReminderService,
    @inject(TYPES.IUserService) private _userService: IUserService,
    @inject(TYPES.IGymService) private _gymService: IGymService,
    @inject(TYPES.IMessageService) private _messageService: IMessageService
  ) {}

  public startJobs(): void {
    logger.info('Starting Cron Jobs...');

    // Every 30 minutes, check for gym reminders
    cron.schedule('*/30 * * * *', async () => {
      await this.processGymReminders();
    });

    // Daily at midnight, reset/update streaks if necessary
    cron.schedule('0 0 * * *', async () => {
      await this.processDailyStreaks();
    });

    // Every hour, check for unread chat messages
    cron.schedule('0 * * * *', async () => {
      await this.processUnreadChatNotifications();
    });

    logger.info('Cron Jobs Scheduled successfully.');
  }

  private async processUnreadChatNotifications(): Promise<void> {
    try {
      const recipients = await this._messageService.getRecipientsWithUnreadMessages();
      const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;

      for (const recipient of recipients) {
        // Check for recent unread_chat notification
        const recentNotification = await this._notificationService.getLatestNotification(
          recipient.recipientId,
          recipient.recipientRole,
          'unread_chat'
        );

        const shouldNotify = !recentNotification || 
          (new Date().getTime() - new Date(recentNotification.createdAt).getTime() > FIVE_HOURS_MS);

        if (shouldNotify) {
          await this._notificationService.createNotification({
            recipientId: recipient.recipientId,
            recipientRole: recipient.recipientRole,
            type: 'unread_chat',
            title: 'Unread Messages',
            message: 'You have unread messages in your inbox. Log in to your tactical hub to check your Intel.',
            priority: 'medium',
            category: 'info'
          });
        }
      }
    } catch (error) {
      logger.error('Error processing unread chat notifications cron:', error);
    }
  }

  private async processGymReminders(): Promise<void> {
    try {
      const activeReminders = await this._gymReminderService.getAllActiveReminders();
      const currentTime = format(new Date(), 'HH:mm');

      for (const reminder of activeReminders) {
        // Simple logic: if today's check-in hasn't happened and current time is past preferred time
        // We'll need a way to check today's attendance. 
        // For Batch 1, I'll implement a basic notification logic.
        
        if (reminder.preferredTime === currentTime) {
           await this._notificationService.createNotification({
             recipientId: reminder.userId,
             recipientRole: 'user',
             type: 'gym_reminder',
             title: 'Time to Workout!',
             message: `Hey ${reminder.userName}, it's ${reminder.preferredTime}. Ready for your session at ${reminder.gymName}?`,
             priority: 'medium',
             category: 'info'
           });
        }
      }
    } catch (error) {
      logger.error('Error processing gym reminders cron:', error);
    }
  }

  private async processDailyStreaks(): Promise<void> {
    try {
      // Logic to check last check-in date and reset streaks if gap > 1 day
      // This will involve calling a method in UserService or a dedicated StreakService
      logger.info('Processing daily streaks...');
    } catch (error) {
      logger.error('Error processing daily streaks cron:', error);
    }
  }
}
