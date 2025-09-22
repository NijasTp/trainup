import { Request, Response, NextFunction } from "express";
import container from "../core/di/inversify.config";
import TYPES from "../core/types/types";
import { UserService } from "../services/user.service";
import { TrainerService } from "../services/trainer.service";
import { logger } from "../utils/logger.util";
import { JwtPayload } from "../core/interfaces/services/IJwtService";

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

    const user = await userService.getUserById(userId);

    if (!user || !user.assignedTrainer || !user.subscriptionStartDate) {
      return next();
    }

    const subscriptionDuration = 30 * 24 * 60 * 60 * 1000; 
    const expiryDate =
      new Date(user.subscriptionStartDate).getTime() + subscriptionDuration;

    if (Date.now() > expiryDate) {
      await userService.cancelSubscription(userId, user.assignedTrainer);
      await trainerService.removeClientFromTrainer(
        user.assignedTrainer,
        userId
      );

      logger.info?.(
        `Auto-cancelled subscription for user ${userId} (expired on ${new Date(
          expiryDate
        ).toISOString()})`
      );
    }

    next();
  } catch (err) {
    logger.error?.("Error in checkSubscriptionExpiry middleware:", err);
     next(err);
  }
};
