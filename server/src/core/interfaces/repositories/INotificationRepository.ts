import { INotification } from '../../../models/notification.model';

export interface INotificationRepository {
  create(notification: Partial<INotification>): Promise<INotification>;
  findById(id: string): Promise<INotification | null>;
  findByRecipient(recipientId: string, recipientRole: string, page: number, limit: number): Promise<{
    notifications: INotification[];
    total: number;
    unreadCount: number;
  }>;
  markAsRead(id: string, recipientId: string): Promise<INotification | null>;
  markAllAsRead(recipientId: string, recipientRole: string): Promise<void>;
  delete(id: string, recipientId: string): Promise<void>;
  findScheduledNotifications(): Promise<INotification[]>;
  findExpiredNotifications(): Promise<INotification[]>;
  deleteExpired(): Promise<void>;
  getUnreadCount(recipientId: string, recipientRole: string): Promise<number>;
}