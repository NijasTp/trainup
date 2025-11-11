import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import TYPES from '../core/types/types';
import { INotificationService } from '../core/interfaces/services/INotificationService';
import { STATUS_CODE } from '../constants/status';
import { JwtPayload } from '../core/interfaces/services/IJwtService';
import { logger } from '../utils/logger.util';
import { MESSAGES } from '../constants/messages.constants';

@injectable()
export class NotificationController {
  constructor(
    @inject(TYPES.INotificationService) private _notificationService: INotificationService
  ) {}

  async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as JwtPayload;
      const { page = '1', limit = '10' } = req.query as { page?: string; limit?: string };
      
      const result = await this._notificationService.getNotifications(
        user.id,
        user.role,
        parseInt(page, 10),
        parseInt(limit, 10)
      );
      
      res.status(STATUS_CODE.OK).json(result);
    } catch (err) {
      logger.error('Error fetching notifications:', err);
      next(err);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as JwtPayload;
      const { id } = req.params;
      
      const notification = await this._notificationService.markAsRead(id, user.id);
      
      if (!notification) {
         res.status(STATUS_CODE.NOT_FOUND).json({ message: MESSAGES.NOT_FOUND });
         return;
      }
      
      res.status(STATUS_CODE.OK).json(notification);
    } catch (err) {
      logger.error('Error marking notification as read:', err);
      next(err);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as JwtPayload;
      
      await this._notificationService.markAllAsRead(user.id, user.role);
      
      res.status(STATUS_CODE.OK).json({ message: 'All notifications marked as read' });
    } catch (err) {
      logger.error('Error marking all notifications as read:', err);
      next(err);
    }
  }

  async deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as JwtPayload;
      const { id } = req.params;
      
      await this._notificationService.deleteNotification(id, user.id);
      
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.DELETED });
    } catch (err) {
      logger.error('Error deleting notification:', err);
      next(err);
    }
  }
  async createNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as JwtPayload;
      const data = req.body; 
      const notification = await this._notificationService.createNotification({
        ...data,
        senderId: user.id, 
        senderRole: user.role,
      });
      res.status(STATUS_CODE.CREATED).json(notification);
    } catch (err) {
      logger.error('Error creating notification:', err);
      next(err);
    }
  }

  async createBulkNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as JwtPayload;
      const notifications = req.body; 
      const created = await this._notificationService.createBulkNotifications(notifications);
      res.status(STATUS_CODE.CREATED).json(created);
    } catch (err) {
      logger.error('Error creating bulk notifications:', err);
      next(err);
    }
  }

  async sendWeightReminders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this._notificationService.sendWeightReminderNotifications();
      res.status(STATUS_CODE.OK).json({ message: 'Weight reminders sent' });
    } catch (err) {
      logger.error('Error sending weight reminders:', err);
      next(err);
    }
  }

  async sendGymAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { gymId } = req.params;
      const { title, message } = req.body; 
      await this._notificationService.sendGymAnnouncementNotification(gymId, title || 'Announcement');
      res.status(STATUS_CODE.OK).json({ message: 'Announcement sent' });
    } catch (err) {
      logger.error('Error sending gym announcement:', err);
      next(err);
    }
  }
}