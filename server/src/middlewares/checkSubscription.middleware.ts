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
import { UserGymMembershipModel } from "../models/userGymMembership.model";
import { IUserGymMembershipRepository } from "../core/interfaces/repositories/IUserGymMembershipRepository";

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

    await streakService.checkAndResetUserStreak(new Types.ObjectId(userId));

    const userPlans = await userPlanService.findAllByUserId(userId);
    const now = new Date();

    for (const plan of userPlans) {
      const trainerId = plan.trainerId.toString();
      const expiryDate = new Date(plan.expiryDate);

      if (now > expiryDate) {
        logger.info(`Auto-cancelling expired subscription for user ${userId} and trainer ${trainerId}`);

        await userService.cancelSubscription(userId, trainerId);
        await userPlanService.deleteUserPlan(userId, trainerId);

        try {
          await trainerService.removeClientFromTrainer(trainerId, userId);
        } catch (err) {
          logger.warn(`Could not remove client from trainer ${trainerId}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }

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
          let trainerName = 'your trainer';
          try {
            const trainer = await trainerService.getTrainerById(trainerId);
            trainerName = trainer?.name || 'your trainer';
          } catch (err) {
            logger.warn(`Could not fetch trainer ${trainerId} for notification: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }

          await notificationService.createNotification({
            recipientId: userId,
            recipientRole: "user",
            type: 'user_subscription_expiring_soon',
            title: "Subscription Expiring Soon",
            message: `Your subscription to ${trainerName} is expiring soon on ${expiryDate.toLocaleDateString()}.`,
            priority: "medium",
            category: "info"
          });
        }
      }
    }
    
    // Check Gym Memberships
    const gymMembershipRepo = container.get<IUserGymMembershipRepository>(TYPES.IUserGymMembershipRepository);
    const activeGymMemberships = await UserGymMembershipModel.find({
      userId: new Types.ObjectId(userId),
      status: 'active'
    });

    for (const membership of activeGymMemberships) {
      if (now > new Date(membership.subscriptionEndDate)) {
        logger.info(`Auto-expiring gym membership for user ${userId} and gym ${membership.gymId}`);
        
        await UserGymMembershipModel.updateOne(
          { _id: membership._id },
          { $set: { status: 'expired' } }
        );

        // Clear user's gymId if it points to this gym
        const user = await userRepo.findById(userId);
        if (user && user.gymId?.toString() === membership.gymId.toString()) {
          await userRepo.updateUser(userId, { gymId: null });
        }

        await notificationService.createNotification({
          recipientId: userId,
          recipientRole: "user",
          type: "gym_membership_expired",
          title: "Gym Membership Expired",
          message: `Your gym membership has expired.`,
          priority: "high",
          category: "warning"
        });
      }
    }

    next();
  } catch (err) {
    logger.error("Error in checkSubscriptionExpiry middleware:", err);
    next(err);
  }
};
