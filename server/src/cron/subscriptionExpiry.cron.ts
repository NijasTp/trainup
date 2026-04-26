import cron from 'node-cron';
import { injectable, inject } from 'inversify';
import TYPES from '../core/types/types';
import { IUserRepository } from '../core/interfaces/repositories/IUserRepository';
import { IUserPlanRepository } from '../core/interfaces/repositories/IUserPlanRepository';
import { IUserPlanService } from '../core/interfaces/services/IUserPlanService';
import { ITrainerService } from '../core/interfaces/services/ITrainerService';
import { IUserService } from '../core/interfaces/services/IUserService';
import { INotificationService } from '../core/interfaces/services/INotificationService';
import { IUserGymMembershipRepository } from '../core/interfaces/repositories/IUserGymMembershipRepository';
import { NOTIFICATION_TYPES } from '../constants/notification.constants';
import { logger } from '../utils/logger.util';
import { Types } from 'mongoose';

/**
 * SubscriptionExpiryCron
 * Runs every 10 minutes to detect and process expired trainer subscriptions
 * and gym memberships. This replaces the per-request middleware check,
 * eliminating 3+ DB queries on every API call.
 */
@injectable()
export class SubscriptionExpiryCron {
    constructor(
        @inject(TYPES.IUserRepository) private _userRepo: IUserRepository,
        @inject(TYPES.IUserPlanRepository) private _userPlanRepo: IUserPlanRepository,
        @inject(TYPES.IUserPlanService) private _userPlanService: IUserPlanService,
        @inject(TYPES.ITrainerService) private _trainerService: ITrainerService,
        @inject(TYPES.IUserService) private _userService: IUserService,
        @inject(TYPES.INotificationService) private _notificationService: INotificationService,
        @inject(TYPES.IUserGymMembershipRepository) private _gymMembershipRepo: IUserGymMembershipRepository
    ) {
        this.initialize();
    }

    private initialize() {
        // Every 10 minutes: check trainer subscriptions
        cron.schedule('*/10 * * * *', async () => {
            await this.processExpiredTrainerSubscriptions();
        });

        // Every 15 minutes: check gym memberships
        cron.schedule('*/15 * * * *', async () => {
            await this.processExpiredGymMemberships();
        });

        logger.info('[SubscriptionExpiryCron] Initialized — running every 10/15 minutes');
    }

    /**
     * Find all UserPlan records past their expiryDate, cancel the subscription,
     * remove the client from the trainer, delete the plan, and notify the user.
     */
    private async processExpiredTrainerSubscriptions(): Promise<void> {
        try {
            const now = new Date();
            const expiredPlans = await this._userPlanRepo.findAllExpired(now);

            if (expiredPlans.length === 0) return;
            logger.info(`[SubscriptionExpiryCron] Processing ${expiredPlans.length} expired trainer subscriptions`);

            for (const plan of expiredPlans) {
                try {
                    const userId = plan.userId.toString();
                    const trainerId = plan.trainerId.toString();

                    await this._userService.cancelSubscription(userId, trainerId);
                    await this._userPlanService.deleteUserPlan(userId, trainerId);

                    try {
                        await this._trainerService.removeClientFromTrainer(trainerId, userId);
                    } catch (err) {
                        logger.warn(`[SubscriptionExpiryCron] Could not remove client ${userId} from trainer ${trainerId}: ${err instanceof Error ? err.message : err}`);
                    }

                    await this._notificationService.createNotification({
                        recipientId: userId,
                        recipientRole: 'user',
                        type: NOTIFICATION_TYPES.USER.SESSION_REJECTED,
                        title: 'Trainer Subscription Expired',
                        message: 'Your trainer subscription has expired. Subscribe again to continue.',
                        priority: 'high',
                        category: 'warning'
                    });
                } catch (err) {
                    logger.error(`[SubscriptionExpiryCron] Error cancelling trainer plan ${plan._id}:`, err);
                }
            }
        } catch (err) {
            logger.error('[SubscriptionExpiryCron] Error in processExpiredTrainerSubscriptions:', err);
        }
    }

    /**
     * Find all active gym memberships past their subscriptionEndDate,
     * mark them as expired, clear user.gymId, and notify the user.
     */
    private async processExpiredGymMemberships(): Promise<void> {
        try {
            const now = new Date();
            const expiredMemberships = await this._gymMembershipRepo.findExpiredActive(now);

            if (expiredMemberships.length === 0) return;
            logger.info(`[SubscriptionExpiryCron] Processing ${expiredMemberships.length} expired gym memberships`);

            for (const membership of expiredMemberships) {
                try {
                    const userId = membership.userId.toString();

                    await this._gymMembershipRepo.updateById(membership._id.toString(), { status: 'expired' });

                    const user = await this._userRepo.findById(userId);
                    if (user && user.gymId?.toString() === membership.gymId.toString()) {
                        await this._userRepo.updateUser(userId, { gymId: null as any });
                    }

                    await this._notificationService.createNotification({
                        recipientId: userId,
                        recipientRole: 'user',
                        type: 'gym_membership_expired',
                        title: 'Gym Membership Expired',
                        message: 'Your gym membership has expired. Renew to continue accessing gym services.',
                        priority: 'high',
                        category: 'warning'
                    });
                } catch (err) {
                    logger.error(`[SubscriptionExpiryCron] Error expiring gym membership ${membership._id}:`, err);
                }
            }
        } catch (err) {
            logger.error('[SubscriptionExpiryCron] Error in processExpiredGymMemberships:', err);
        }
    }
}
