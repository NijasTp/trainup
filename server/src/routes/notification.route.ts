import { Router } from 'express';
import container from '../core/di/inversify.config';
import TYPES from '../core/types/types';
import { NotificationController } from '../controllers/notification.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const notificationController = container.get<NotificationController>(TYPES.NotificationController);

router.use(authMiddleware);

router.get('/', notificationController.getNotifications.bind(notificationController));
router.patch('/:id/read', notificationController.markAsRead.bind(notificationController));
router.patch('/read-all', notificationController.markAllAsRead.bind(notificationController));
router.delete('/:id', notificationController.deleteNotification.bind(notificationController));

export default router;