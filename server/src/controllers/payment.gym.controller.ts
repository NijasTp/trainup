import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { STATUS_CODE } from '../constants/status';
import TYPES from '../core/types/types';
import { IPaymentService } from '../core/interfaces/services/IPaymentService';
import { IUserService } from '../core/interfaces/services/IUserService';
import { IGymService } from '../core/interfaces/services/IGymService';
import { JwtPayload } from '../core/interfaces/services/IJwtService';
import { MESSAGES } from '../constants/messages.constants';
import { logger } from '../utils/logger.util';
import { AppError } from '../utils/appError.util';
import { addDays, addMonths, addYears } from 'date-fns';
import { IMailService } from '../core/interfaces/services/IMailService';
import { IGymReminderService } from '../core/interfaces/services/IGymReminderService';
import { INotificationService } from '../core/interfaces/services/INotificationService';

@injectable()
export class PaymentGymController {
    constructor(
        @inject(TYPES.IPaymentService) private _paymentService: IPaymentService,
        @inject(TYPES.IUserService) private _userService: IUserService,
        @inject(TYPES.IGymService) private _gymService: IGymService,
        @inject(TYPES.IMailService) private _emailService: IMailService,
        @inject(TYPES.IGymReminderService) private _gymReminderService: IGymReminderService,
        @inject(TYPES.INotificationService) private _notificationService: INotificationService
    ) { }

    async createGymCheckoutSession(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { gymId, subscriptionPlanId, preferredTime } = req.body;
            const userId = (req.user as JwtPayload).id;

            if (!gymId || !subscriptionPlanId || !preferredTime) {
                throw new AppError(MESSAGES.MISSING_REQUIRED_FIELDS, STATUS_CODE.BAD_REQUEST);
            }

            // Check for pending transaction
            const pending = await this._paymentService.findPendingGymTransactionByUser(userId);
            if (pending) {
                res.status(STATUS_CODE.CONFLICT).json({ 
                    message: "You have a pending transaction. Please complete or cancel it first.",
                    hasPending: true,
                    transaction: pending
                });
                return;
            }

            const user = await this._userService.getUserById(userId);
            if (!user) throw new AppError(MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND);

            const gym = await this._gymService.getGymById(gymId);
            if (!gym) throw new AppError(MESSAGES.GYM_NOT_FOUND, STATUS_CODE.NOT_FOUND);

            const subscriptionPlan = await this._gymService.getSubscriptionPlan(subscriptionPlanId);
            if (!subscriptionPlan) throw new AppError('Subscription plan not found', STATUS_CODE.NOT_FOUND);

            const session = await this._paymentService.createGymCheckoutSession({
                userId,
                gymId,
                subscriptionPlanId,
                amount: subscriptionPlan.price,
                userName: user.name,
                gymName: gym.name || 'Gym',
                planName: subscriptionPlan.name,
                preferredTime
            });

            res.status(STATUS_CODE.OK).json(session);
        } catch (err) {
            logger.error('Create Gym Checkout Session Error', err);
            next(err);
        }
    }

    async getGymSessionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { sessionId } = req.params;
            const session = await this._paymentService.getCheckoutSession(sessionId);

            if (session.payment_status === 'paid') {
                const metadata = session.metadata;
                const userId = metadata.userId;
                const gymId = metadata.gymId;
                const subscriptionPlanId = metadata.subscriptionPlanId;
                const preferredTime = metadata.preferredTime;
                const amount = parseFloat(metadata.amount);

                // Check fulfillment
                const user = await this._userService.getUserById(userId);
                if (user && !user.gymId) {
                    const subscriptionPlan = await this._gymService.getSubscriptionPlan(subscriptionPlanId);
                    if (subscriptionPlan) {
                        const startDate = new Date();
                        let endDate: Date;
                        switch (subscriptionPlan.durationUnit) {
                            case 'day': endDate = addDays(startDate, subscriptionPlan.duration); break;
                            case 'month': endDate = addMonths(startDate, subscriptionPlan.duration); break;
                            case 'year': endDate = addYears(startDate, subscriptionPlan.duration); break;
                            default: endDate = addMonths(startDate, subscriptionPlan.duration);
                        }

                        // Create transaction record
                        await this._paymentService.createGymTransaction({
                            userId,
                            gymId,
                            subscriptionPlanId,
                            stripeSessionId: sessionId,
                            paymentIntentId: session.payment_intent as string,
                            amount,
                            status: 'completed',
                            provider: 'stripe',
                            preferredTime
                        });

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
                    }
                }
            }

            res.status(STATUS_CODE.OK).json({ 
                status: session.status, 
                payment_status: session.payment_status 
            });
        } catch (err) {
            logger.error('Get Gym Session Status Error', err);
            next(err);
        }
    }

    async checkPendingGymTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id;
            const pending = await this._paymentService.findPendingGymTransactionByUser(userId);
            res.status(STATUS_CODE.OK).json({ hasPending: !!pending, transaction: pending });
        } catch (err) {
            logger.error('Check Pending Gym Transaction Error', err);
            next(err);
        }
    }

    async cleanupPendingGymTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id;
            const updated = await this._paymentService.markUserPendingGymTransactionsAsFailed(userId);
            res.status(STATUS_CODE.OK).json({
                success: true,
                message: MESSAGES.GYM_PAYMENT_CANCELLED,
                updatedCount: updated
            });
        } catch (err) {
            logger.error('Cleanup Pending Gym Transactions Error', err);
            next(err);
        }
    }
}
