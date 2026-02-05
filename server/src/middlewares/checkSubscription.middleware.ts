import { Request, Response, NextFunction } from "express";
import { IUserRepository } from "../core/interfaces/repositories/IUserRepository";
import { IStreakService } from "../core/interfaces/services/IStreakService";
import { IUserPlanService } from "../core/interfaces/services/IUserPlanService";
import container from "../core/di/inversify.config";
import TYPES from "../core/types/types";
import { UserService } from "../services/user.service";
import { TrainerService } from "../services/trainer.service";
import { logger } from "../utils/logger.util";
import { JwtPayload } from "../core/interfaces/services/IJwtService";
import { INotificationService } from "../core/interfaces/services/INotificationService";
import { NOTIFICATION_TYPES } from "../constants/notification.constants";
import { Types } from "mongoose";

export const checkSubscriptionExpiry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userPayload = req.user as JwtPayload;
    if (!userPayload || userPayload.role !== 'user') return next();

    const userId = userPayload.id;

    const userService = container.get<UserService>(TYPES.IUserService);
    const trainerService = container.get<TrainerService>(TYPES.ITrainerService);
    const notificationService = container.get<INotificationService>(TYPES.INotificationService);
    const userRepo = container.get<IUserRepository>(TYPES.IUserRepository);
    const streakService = container.get<IStreakService>(TYPES.IStreakService);
    const userPlanService = container.get<IUserPlanService>(TYPES.IUserPlanService);

    const user = await userRepo.findById(userId);
    if (!user || user.isBanned) return next();

    // 1. Check and Reset Streak
    await streakService.checkAndResetUserStreak(new Types.ObjectId(userId));

    // 2. Check Subscription Expiry
    const userPlans = await userPlanService.findAllByUserId(userId);
    const now = new Date();

    for (const plan of userPlans) {
      const trainerId = plan.trainerId.toString();
      const expiryDate = new Date(plan.expiryDate);

      // Already expired
      if (now > expiryDate) {
        logger.info(`Auto-cancelling expired subscription for user ${userId} and trainer ${trainerId}`);

        await userService.cancelSubscription(userId, trainerId);
        await trainerService.removeClientFromTrainer(trainerId, userId);

        await notificationService.createNotification({
          recipientId: userId,
          recipientRole: "user",
          type: NOTIFICATION_TYPES.USER.SESSION_REJECTED,
          title: "Subscription Expired",
          message: `Your subscription has expired.`,
          priority: "high",
          category: "warning"
        });
      }

      else if ((expiryDate.getTime() - now.getTime()) < (3 * 24 * 60 * 60 * 1000)) {
        if (req.method === 'GET') {
          const trainer = await trainerService.getTrainerById(trainerId);
          await notificationService.createNotification({
            recipientId: userId,
            recipientRole: "user",
            type: 'user_subscription_expiring_soon',
            title: "Subscription Expiring Soon",
            message: `Your subscription to ${trainer?.name || 'your trainer'} is expiring soon on ${expiryDate.toLocaleDateString()}.`,
            priority: "medium",
            category: "info"
          });
        }
      }
    }

    next();
  } catch (err) {
    logger.error("Error in checkSubscriptionExpiry middleware:", err);
    next(err);
  }
};
