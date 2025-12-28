import { Request, Response, NextFunction } from "express";
import { IUserRepository } from "../core/interfaces/repositories/IUserRepository";
import container from "../core/di/inversify.config";
import TYPES from "../core/types/types";
import { UserService } from "../services/user.service";
import { TrainerService } from "../services/trainer.service";
import { logger } from "../utils/logger.util";
import { JwtPayload } from "../core/interfaces/services/IJwtService";
import { UserPlanModel } from "../models/userPlan.model";
import { INotificationService } from "../core/interfaces/services/INotificationService";
import { NOTIFICATION_TYPES } from "../constants/notification.constants";

export const checkSubscriptionExpiry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as JwtPayload)?.id;
    if (!userId) return next();

    const userService = container.get<UserService>(TYPES.IUserService);
    const trainerService = container.get<TrainerService>(TYPES.ITrainerService);
    const notificationService = container.get<INotificationService>(TYPES.INotificationService);
    const userRepo = container.get<IUserRepository>(TYPES.IUserRepository);

    const user = await userRepo.findById(userId);
    if (!user || user.isBanned) return next();

    if (!user.assignedTrainer) return next();

    const trainerId = user.assignedTrainer.toString();
    const trainer = await trainerService.getTrainerById(trainerId);

    let shouldCancel = false;
    let reason = "";

    if (!trainer) {
      shouldCancel = true;
      reason = "Trainer no longer exists";
    } else if (trainer.isBanned) {
      shouldCancel = true;
      reason = "Trainer has been banned";
    } else {
      const userPlan = await UserPlanModel.findOne({ userId, trainerId });
      if (userPlan && userPlan.expiryDate && new Date() > userPlan.expiryDate) {
        shouldCancel = true;
        reason = "Subscription has expired";
      }
    }

    if (shouldCancel) {
      logger.info(`Auto-cancelling subscription for user ${userId}. Reason: ${reason}`);

      const trainerName = trainer?.name || "your trainer";

      await userService.cancelSubscription(userId, trainerId);
      await trainerService.removeClientFromTrainer(trainerId, userId);

      await notificationService.createNotification({
        recipientId: user._id.toString(),
        recipientRole: "user",
        type: NOTIFICATION_TYPES.USER.SESSION_REJECTED,
        title: "Subscription Cancelled",
        message: `Your subscription to ${trainerName} has been cancelled. Reason: ${reason}`,
        priority: "high",
        category: "warning"
      });
    }

    next();
  } catch (err) {
    logger.error("Error in checkSubscriptionExpiry middleware:", err);
    next(err);
  }
};
