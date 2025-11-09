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
}