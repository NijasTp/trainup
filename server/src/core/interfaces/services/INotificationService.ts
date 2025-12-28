import { INotification } from '../../../models/notification.model';

export interface CreateNotificationDto {
  recipientId: string;
  recipientRole: 'user' | 'trainer' | 'gym' | 'admin';
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: 'info' | 'warning' | 'success' | 'error';
  scheduledAt?: Date;
  expiresAt?: Date;
}

export interface INotificationService {
  createNotification(data: CreateNotificationDto): Promise<INotification>;
  createBulkNotifications(notifications: CreateNotificationDto[]): Promise<INotification[]>;
  getNotifications(recipientId: string, recipientRole: string, page: number, limit: number): Promise<{
    notifications: INotification[];
    total: number;
    unreadCount: number;
  }>;
  markAsRead(notificationId: string, recipientId: string): Promise<INotification | null>;
  markAllAsRead(recipientId: string, recipientRole: string): Promise<void>;
  deleteNotification(notificationId: string, recipientId: string): Promise<void>;
  sendWorkoutReminder(userId: string, workoutName: string, scheduledAt?: Date): Promise<void>;
  sendMealReminder(userId: string, mealName: string, scheduledAt?: Date): Promise<void>;
  sendTrainerSubscribedNotification(userId: string, trainerName: string): Promise<void>;
  sendGymSubscribedNotification(userId: string, gymName: string, planName: string): Promise<void>;
  sendSessionRequestNotification(trainerId: string, userName: string): Promise<void>;
  sendSessionResponseNotification(userId: string, trainerName: string, accepted: boolean, reason?: string): Promise<void>;
  sendWeightReminderNotifications(): Promise<void>;
  sendInactivityNotifications(): Promise<void>;
  sendGymAnnouncementNotification(gymId: string, title: string): Promise<void>;
  sendAdminPendingVerificationsNotification(): Promise<void>;
  processScheduledNotifications(): Promise<void>;
  cleanupExpiredNotifications(): Promise<void>;
}