import { inject, injectable } from 'inversify';
import TYPES from '../core/types/types';
import { ISubscriptionFulfillmentService } from '../core/interfaces/services/ISubscriptionFulfillmentService';
import { IUserService } from '../core/interfaces/services/IUserService';
import { ITrainerService } from '../core/interfaces/services/ITrainerService';
import { IGymService } from '../core/interfaces/services/IGymService';
import { ITransactionService } from '../core/interfaces/services/ITransactionService';
import { IUserPlanService } from '../core/interfaces/services/IUserPlanService';
import { INotificationService } from '../core/interfaces/services/INotificationService';
import { IGymReminderService } from '../core/interfaces/services/IGymReminderService';
import { IGymTransactionRepository } from '../core/interfaces/repositories/IGymTransactionRepository';
import { IPaymentService } from '../core/interfaces/services/IPaymentService';
import { addDays, addMonths, addYears } from 'date-fns';
import { logger } from '../utils/logger.util';

@injectable()
export class SubscriptionFulfillmentService implements ISubscriptionFulfillmentService {
    constructor(
        @inject(TYPES.IUserService) private _userService: IUserService,
        @inject(TYPES.ITrainerService) private _trainerService: ITrainerService,
        @inject(TYPES.IGymService) private _gymService: IGymService,
        @inject(TYPES.ITransactionService) private _transactionService: ITransactionService,
        @inject(TYPES.IUserPlanService) private _userPlanService: IUserPlanService,
        @inject(TYPES.INotificationService) private _notificationService: INotificationService,
        @inject(TYPES.IGymReminderService) private _gymReminderService: IGymReminderService,
        @inject(TYPES.IGymTransactionRepository) private _gymTransactionRepo: IGymTransactionRepository,
        @inject(TYPES.IPaymentService) private _paymentService: IPaymentService
    ) { }

    async fulfillTrainerSubscription(sessionId: string, metadata: Record<string, string>): Promise<void> {
        const userId = metadata.userId;
        const trainerId = metadata.trainerId;
        const planType = metadata.planType as 'basic' | 'premium' | 'pro';
        const duration = parseInt(metadata.duration, 10);
        const amount = parseFloat(metadata.amount);
        const trainerName = metadata.trainerName || 'Trainer';

        // Idempotency check: find transaction by sessionId
        const existingTransaction = await this._transactionService.findBySessionId(sessionId);

        // If already completed, skip
        if (existingTransaction && existingTransaction.status === 'completed') {
            logger.info(`[Fulfillment] Trainer subscription ${sessionId} already fulfilled.`);
            return;
        }

        // Fetch session from Stripe to get payment intent if not in metadata
        const session = await this._paymentService.getCheckoutSession(sessionId);
        const paymentIntentId = session.payment_intent as string;

        if (existingTransaction && existingTransaction.status === 'pending') {
            await this._transactionService.updateTransactionStatusBySessionId(sessionId, 'completed', paymentIntentId);
        } else if (!existingTransaction) {
            await this._transactionService.createTransaction({
                userId,
                trainerId,
                amount,
                platformFee: Math.floor(amount * 0.10),
                trainerEarnings: amount - Math.floor(amount * 0.10),
                planType,
                duration,
                stripeSessionId: sessionId,
                paymentIntentId,
                status: 'completed',
                provider: 'stripe',
                transactionType: 'debit',
                description: `Premium Fitness Plan - ${trainerName}`,
                createdAt: new Date(),
            });
        }

        // Update User State
        await this._userService.updateUserTrainerId(userId, trainerId);
        await this._userService.updateUserPlan(userId, planType);
        await this._trainerService.addClientToTrainer(trainerId, userId);

        const expiryDate = addMonths(new Date(), duration);
        let messagesLeft = 0;
        let videoCallsLeft = 0;

        if (planType === 'premium') messagesLeft = 200 * duration;
        if (planType === 'pro') {
            messagesLeft = -1;
            videoCallsLeft = 5 * duration;
        }

        await this._userPlanService.createUserPlan({
            userId,
            trainerId,
            planType,
            messagesLeft,
            videoCallsLeft,
            expiryDate,
            duration,
            amount
        });

        await this._notificationService.sendTrainerSubscribedNotification(userId, trainerName);
        logger.info(`[Fulfillment] Trainer subscription fulfilled for user ${userId}, trainer ${trainerId}`);
    }

    async fulfillGymSubscription(sessionId: string, metadata: Record<string, string>): Promise<void> {
        const userId = metadata.userId;
        const gymId = metadata.gymId;
        const subscriptionPlanId = metadata.subscriptionPlanId;
        const preferredTime = metadata.preferredTime;
        const amount = parseFloat(metadata.amount);

        const existingTransaction = await this._gymTransactionRepo.findOne({ stripeSessionId: sessionId });

        if (existingTransaction && existingTransaction.status === 'completed') {
            logger.info(`[Fulfillment] Gym membership ${sessionId} already fulfilled.`);
            return;
        }

        const session = await this._paymentService.getCheckoutSession(sessionId);
        const paymentIntentId = session.payment_intent as string;

        const subscriptionPlan = await this._gymService.getSubscriptionPlan(subscriptionPlanId);
        if (!subscriptionPlan) {
            logger.error(`[Fulfillment] Subscription plan ${subscriptionPlanId} not found during fulfillment of ${sessionId}`);
            return;
        }

        const startDate = new Date();
        let endDate: Date;
        switch (subscriptionPlan.durationUnit) {
            case 'day': endDate = addDays(startDate, subscriptionPlan.duration); break;
            case 'month': endDate = addMonths(startDate, subscriptionPlan.duration); break;
            case 'year': endDate = addYears(startDate, subscriptionPlan.duration); break;
            default: endDate = addMonths(startDate, subscriptionPlan.duration);
        }

        if (existingTransaction && existingTransaction.status === 'pending') {
            await this._gymTransactionRepo.findOneAndUpdate(
                { stripeSessionId: sessionId },
                {
                    $set: {
                        status: 'completed',
                        paymentIntentId,
                        amount,
                        description: `Gym Membership - ${subscriptionPlan.name}`,
                        preferredTime
                    }
                }
            );
        } else if (!existingTransaction) {
            await this._paymentService.createGymTransaction({
                userId,
                gymId,
                subscriptionPlanId,
                stripeSessionId: sessionId,
                paymentIntentId,
                amount,
                status: 'completed',
                provider: 'stripe',
                transactionType: 'debit',
                description: `Gym Membership - ${subscriptionPlan.name}`,
                preferredTime
            });
        }

        await this._userService.updateUserGymMembership(
            userId, gymId, subscriptionPlanId, startDate, endDate, preferredTime
        );
        await this._gymService.addMemberToGym(gymId, userId);
        await this._gymReminderService.saveReminderPreference(userId, gymId, preferredTime);

        const gymDetails = await this._gymService.getGymById(gymId);
        if (gymDetails) {
            await this._notificationService.sendGymSubscribedNotification(
                userId, gymDetails.name || 'Gym', subscriptionPlan.name
            );
        }
        logger.info(`[Fulfillment] Gym membership fulfilled for user ${userId}, gym ${gymId}`);
    }

    async fulfillBundlePurchase(sessionId: string, metadata: Record<string, string>): Promise<void> {
        const { userId, trainerId, sessions, amount } = metadata;
        const sessionCount = parseInt(sessions, 10);
        const amountNum = parseFloat(amount);

        // Idempotency check
        const existingTransaction = await this._transactionService.findBySessionId(sessionId);
        if (existingTransaction && existingTransaction.status === 'completed') {
            logger.info(`[Fulfillment] Bundle purchase ${sessionId} already fulfilled.`);
            return;
        }

        const session = await this._paymentService.getCheckoutSession(sessionId);
        const paymentIntentId = session.payment_intent as string;

        if (existingTransaction && existingTransaction.status === 'pending') {
            await this._transactionService.updateTransactionStatusBySessionId(sessionId, 'completed', paymentIntentId);
        } else if (!existingTransaction) {
            await this._transactionService.createTransaction({
                userId,
                trainerId,
                amount: amountNum,
                platformFee: Math.floor(amountNum * 0.10),
                trainerEarnings: amountNum - Math.floor(amountNum * 0.10),
                planType: 'session_bundle',
                stripeSessionId: sessionId,
                paymentIntentId,
                status: 'completed',
                provider: 'stripe',
                transactionType: 'debit',
                description: `${sessionCount} Session Top-up`,
                createdAt: new Date(),
            });
        }

        // Increment videoCallsLeft in user plan
        const userPlan = await this._userPlanService.getUserPlan(userId, trainerId);
        if (userPlan) {
            await this._userPlanService.updateUserPlan(userId, trainerId, {
                videoCallsLeft: userPlan.videoCallsLeft + sessionCount
            });
        }

        // Notifications
        await this._notificationService.createNotification({
            recipientId: userId,
            recipientRole: 'user',
            type: 'payment_success',
            title: 'Top-up Successful!',
            message: `You have successfully added ${sessionCount} video call sessions.`,
            priority: 'high',
            category: 'success'
        });

        logger.info(`[Fulfillment] Bundle purchase fulfilled for user ${userId}: +${sessionCount} sessions`);
    }
}
