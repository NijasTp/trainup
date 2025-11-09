import { injectable } from 'inversify';
import { NotificationModel, INotification } from '../models/notification.model';
import { INotificationRepository } from '../core/interfaces/repositories/INotificationRepository';
import { Types } from 'mongoose';

@injectable()
export class NotificationRepository implements INotificationRepository {
  async create(notification: Partial<INotification>): Promise<INotification> {
    return await NotificationModel.create(notification);
  }

  async findById(id: string): Promise<INotification | null> {
    return await NotificationModel.findById(id);
  }

  async findByRecipient(
    recipientId: string, 
    recipientRole: string, 
    page: number, 
    limit: number
  ): Promise<{
    notifications: INotification[];
    total: number;
    unreadCount: number;
  }> {
    const skip = (page - 1) * limit;
    const filter = { 
      recipientId: new Types.ObjectId(recipientId), 
      recipientRole 
    };

    const [notifications, total, unreadCount] = await Promise.all([
      NotificationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      NotificationModel.countDocuments(filter),
      NotificationModel.countDocuments({ ...filter, isRead: false })
    ]);

    return {
      notifications: notifications as INotification[],
      total,
      unreadCount
    };
  }

  async markAsRead(id: string, recipientId: string): Promise<INotification | null> {
    return await NotificationModel.findOneAndUpdate(
      { 
        _id: id, 
        recipientId: new Types.ObjectId(recipientId) 
      },
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(recipientId: string, recipientRole: string): Promise<void> {
    await NotificationModel.updateMany(
      { 
        recipientId: new Types.ObjectId(recipientId), 
        recipientRole,
        isRead: false 
      },
      { isRead: true }
    );
  }

  async delete(id: string, recipientId: string): Promise<void> {
    await NotificationModel.findOneAndDelete({
      _id: id,
      recipientId: new Types.ObjectId(recipientId)
    });
  }

  async findScheduledNotifications(): Promise<INotification[]> {
    return await NotificationModel.find({
      scheduledAt: { $lte: new Date() },
      isRead: false
    }).lean() as INotification[];
  }

  async findExpiredNotifications(): Promise<INotification[]> {
    return await NotificationModel.find({
      expiresAt: { $lte: new Date() }
    }).lean() as INotification[];
  }

  async deleteExpired(): Promise<void> {
    await NotificationModel.deleteMany({
      expiresAt: { $lte: new Date() }
    });
  }

  async getUnreadCount(recipientId: string, recipientRole: string): Promise<number> {
    return await NotificationModel.countDocuments({
      recipientId: new Types.ObjectId(recipientId),
      recipientRole,
      isRead: false
    });
  }
}