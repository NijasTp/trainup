import { injectable, inject } from 'inversify';
import TYPES from '../core/types/types';
import { INotificationService, CreateNotificationDto } from '../core/interfaces/services/INotificationService';
import { INotificationRepository } from '../core/interfaces/repositories/INotificationRepository';
import { IUserRepository } from '../core/interfaces/repositories/IUserRepository';
import { ITrainerRepository } from '../core/interfaces/repositories/ITrainerRepository';
import { IGymRepository } from '../core/interfaces/repositories/IGymRepository';
import { INotification } from '../models/notification.model';
import { NOTIFICATION_MESSAGES, NOTIFICATION_TYPES } from '../constants/notification.constants';
import { logger } from '../utils/logger.util';

@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject(TYPES.INotificationRepository) private _notificationRepo: INotificationRepository,
    @inject(TYPES.IUserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.ITrainerRepository) private _trainerRepo: ITrainerRepository,
    @inject(TYPES.IGymRepository) private _gymRepo: IGymRepository
  ) {}

  async createNotification(data: CreateNotificationDto): Promise<INotification> {
    return await this._notificationRepo.create({
      recipientId: data.recipientId,
      recipientRole: data.recipientRole,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data,
      priority: data.priority || 'medium',
      category: data.category || 'info',
      scheduledAt: data.scheduledAt,
      expiresAt: data.expiresAt
    });
  }

  async createBulkNotifications(notifications: CreateNotificationDto[]): Promise<INotification[]> {
    const createdNotifications = [];
    for (const notification of notifications) {
      try {
        const created = await this.createNotification(notification);
        createdNotifications.push(created);
      } catch (error) {
        logger.error('Error creating notification:', error);
      }
    }
    return createdNotifications;
  }

  async getNotifications(
    recipientId: string, 
    recipientRole: string, 
    page: number, 
    limit: number
  ): Promise<{
    notifications: INotification[];
    total: number;
    unreadCount: number;
  }> {
    return await this._notificationRepo.findByRecipient(recipientId, recipientRole, page, limit);
  }

  async markAsRead(notificationId: string, recipientId: string): Promise<INotification | null> {
    return await this._notificationRepo.markAsRead(notificationId, recipientId);
  }

  async markAllAsRead(recipientId: string, recipientRole: string): Promise<void> {
    await this._notificationRepo.markAllAsRead(recipientId, recipientRole);
  }

  async deleteNotification(notificationId: string, recipientId: string): Promise<void> {
    await this._notificationRepo.delete(notificationId, recipientId);
  }

  async sendWorkoutReminder(userId: string, workoutName: string): Promise<void> {
    const message = NOTIFICATION_MESSAGES.USER.WORKOUT_TIME.replace('{workoutName}', workoutName);
    await this.createNotification({
      recipientId: userId,
      recipientRole: 'user',
      type: NOTIFICATION_TYPES.USER.WORKOUT_TIME,
      title: 'Workout Time!',
      message,
      priority: 'high',
      category: 'info'
    });
  }

  async sendMealReminder(userId: string, mealName: string): Promise<void> {
    const message = NOTIFICATION_MESSAGES.USER.MEAL_TIME.replace('{mealName}', mealName);
    await this.createNotification({
      recipientId: userId,
      recipientRole: 'user',
      type: NOTIFICATION_TYPES.USER.MEAL_TIME,
      title: 'Meal Time!',
      message,
      priority: 'medium',
      category: 'info'
    });
  }

  async sendTrainerSubscribedNotification(userId: string, trainerName: string): Promise<void> {
    const message = NOTIFICATION_MESSAGES.USER.TRAINER_SUBSCRIBED.replace('{trainerName}', trainerName);
    await this.createNotification({
      recipientId: userId,
      recipientRole: 'user',
      type: NOTIFICATION_TYPES.USER.TRAINER_SUBSCRIBED,
      title: 'Subscription Successful!',
      message,
      priority: 'high',
      category: 'success'
    });
  }

  async sendGymSubscribedNotification(userId: string, gymName: string, planName: string): Promise<void> {
    const message = NOTIFICATION_MESSAGES.USER.GYM_SUBSCRIBED
      .replace('{gymName}', gymName)
      .replace('{planName}', planName);
    await this.createNotification({
      recipientId: userId,
      recipientRole: 'user',
      type: NOTIFICATION_TYPES.USER.GYM_SUBSCRIBED,
      title: 'Gym Subscription Successful!',
      message,
      priority: 'high',
      category: 'success'
    });
  }

  async sendSessionRequestNotification(trainerId: string, userName: string): Promise<void> {
    const message = NOTIFICATION_MESSAGES.TRAINER.SESSION_REQUEST.replace('{userName}', userName);
    await this.createNotification({
      recipientId: trainerId,
      recipientRole: 'trainer',
      type: NOTIFICATION_TYPES.TRAINER.SESSION_REQUEST,
      title: 'New Session Request',
      message,
      priority: 'high',
      category: 'info'
    });
  }

  async sendSessionResponseNotification(userId: string, trainerName: string, accepted: boolean, reason?: string): Promise<void> {
    const baseMessage = accepted 
      ? NOTIFICATION_MESSAGES.USER.SESSION_ACCEPTED.replace('{trainerName}', trainerName)
      : NOTIFICATION_MESSAGES.USER.SESSION_REJECTED
          .replace('{trainerName}', trainerName)
          .replace('{reason}', reason || 'No reason provided');

    await this.createNotification({
      recipientId: userId,
      recipientRole: 'user',
      type: accepted ? NOTIFICATION_TYPES.USER.SESSION_ACCEPTED : NOTIFICATION_TYPES.USER.SESSION_REJECTED,
      title: accepted ? 'Session Accepted!' : 'Session Rejected',
      message: baseMessage,
      priority: 'high',
      category: accepted ? 'success' : 'warning'
    });
  }

  async sendWeightReminderNotifications(): Promise<void> {
    try {
      // Get all users who haven't logged weight today
      const today = new Date();
      today.setHours(16, 0, 0, 0); // 4 PM

      const users = await this._userRepo.findAll(0, 1000); // Adjust as needed
      
      for (const user of users) {
        const lastWeightDate = user.weightHistory?.length > 0 
          ? user.weightHistory[user.weightHistory.length - 1].date 
          : null;
        
        const todayString = today.toDateString();
        const lastWeightString = lastWeightDate?.toDateString();
        
        if (lastWeightString !== todayString) {
          await this.createNotification({
            recipientId: user._id,
            recipientRole: 'user',
            type: NOTIFICATION_TYPES.USER.WEIGHT_REMINDER,
            title: 'Weight Reminder',
            message: NOTIFICATION_MESSAGES.USER.WEIGHT_REMINDER,
            priority: 'medium',
            category: 'info',
            scheduledAt: today
          });
        }
      }
    } catch (error) {
      logger.error('Error sending weight reminder notifications:', error);
    }
  }

  async sendInactivityNotifications(): Promise<void> {
    try {
      // This would need to be implemented based on user activity tracking
      // For now, it's a placeholder
      logger.info('Inactivity notifications would be processed here');
    } catch (error) {
      logger.error('Error sending inactivity notifications:', error);
    }
  }

  async sendGymAnnouncementNotification(gymId: string, title: string): Promise<void> {
    try {
      const gym = await this._gymRepo.findById(gymId);
      if (!gym) return;

      const members = await this._gymRepo.getGymMembers(gymId);
      const notifications: CreateNotificationDto[] = members.map((member: any) => ({
        recipientId: member._id.toString(),
        recipientRole: 'user' as const,
        type: NOTIFICATION_TYPES.USER.GYM_ANNOUNCEMENT,
        title: 'New Gym Announcement',
        message: NOTIFICATION_MESSAGES.USER.GYM_ANNOUNCEMENT
          .replace('{gymName}', gym.name || 'Your Gym')
          .replace('{title}', title),
        priority: 'medium' as const,
        category: 'info' as const
      }));

      await this.createBulkNotifications(notifications);
    } catch (error) {
      logger.error('Error sending gym announcement notifications:', error);
    }
  }

  async sendAdminPendingVerificationsNotification(): Promise<void> {
    try {
      // Count pending trainers and gyms
      const pendingTrainers = await this._trainerRepo.count('', '', 'unverified');
      const pendingGyms = await this._gymRepo.findGyms(1, 1, ''); // This needs adjustment

      if (pendingTrainers > 0 || pendingGyms.total > 0) {
        const message = NOTIFICATION_MESSAGES.ADMIN.PENDING_VERIFICATIONS
          .replace('{trainerCount}', pendingTrainers.toString())
          .replace('{gymCount}', pendingGyms.total.toString());

        // Send to all admins (you'd need to get admin users)
        await this.createNotification({
          recipientId: 'admin', // This should be actual admin IDs
          recipientRole: 'admin',
          type: NOTIFICATION_TYPES.ADMIN.PENDING_VERIFICATIONS,
          title: 'Pending Verifications',
          message,
          priority: 'high',
          category: 'warning'
        });
      }
    } catch (error) {
      logger.error('Error sending admin pending verifications notification:', error);
    }
  }

  async processScheduledNotifications(): Promise<void> {
    try {
      const scheduledNotifications = await this._notificationRepo.findScheduledNotifications();
      // Process scheduled notifications (send emails, push notifications, etc.)
      logger.info(`Processing ${scheduledNotifications.length} scheduled notifications`);
    } catch (error) {
      logger.error('Error processing scheduled notifications:', error);
    }
  }

  async cleanupExpiredNotifications(): Promise<void> {
    try {
      await this._notificationRepo.deleteExpired();
      logger.info('Cleaned up expired notifications');
    } catch (error) {
      logger.error('Error cleaning up expired notifications:', error);
    }
  }
}