import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { STATUS_CODE } from '../constants/status';
import TYPES from '../core/types/types';
import { IPaymentService } from '../core/interfaces/services/IPaymentService';
import { IUserService } from '../core/interfaces/services/IUserService';
import { IGymService } from '../core/interfaces/services/IGymService';
import { JwtPayload } from '../core/interfaces/services/IJwtService';
import { CreateOrderResponseDto } from '../dtos/payment.dto';
import { CreateGymTransactionDto, VerifyGymPaymentDto } from '../dtos/gym.dto';
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

    async createGymOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: CreateGymTransactionDto = req.body;
            const userId = (req.user as JwtPayload).id;

            if (!dto.gymId || !dto.subscriptionPlanId || !dto.amount || !dto.preferredTime) {
                throw new AppError(MESSAGES.MISSING_REQUIRED_FIELDS, STATUS_CODE.BAD_REQUEST);
            }

            const user = await this._userService.getUserById(userId);
            if (user?.gymId) {
                throw new AppError('You already have a gym membership', STATUS_CODE.BAD_REQUEST);
            }

            const order: CreateOrderResponseDto = await this._paymentService.createOrder(
                dto.amount,
                dto.currency || 'INR',
                `gym_${Date.now()}`
            );

            await this._paymentService.createGymTransaction({
                userId,
                gymId: dto.gymId,
                subscriptionPlanId: dto.subscriptionPlanId,
                razorpayOrderId: order.id,
                amount: dto.amount,
                status: 'pending',
                preferredTime: dto.preferredTime
            });

            res.status(STATUS_CODE.OK).json(order);
        } catch (err) {
            logger.error('Create Gym Order Error', err);
            next(err);
        }
    }

    async verifyGymPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: VerifyGymPaymentDto = req.body;
            const userId = (req.user as JwtPayload).id;

            if (!dto.gymId || !dto.subscriptionPlanId || !userId || !dto.preferredTime) {
                throw new AppError(MESSAGES.MISSING_REQUIRED_FIELDS, STATUS_CODE.BAD_REQUEST);
            }

            const isValid = await this._paymentService.verifyPayment(
                dto.orderId,
                dto.paymentId,
                dto.signature
            );

            let transaction = await this._paymentService.findGymTransactionByOrderId(dto.orderId);
            if (!transaction) {
                throw new AppError('Transaction not found', STATUS_CODE.BAD_REQUEST);
            }

            if (!isValid) {
                await this._paymentService.updateGymTransactionStatus(
                    dto.orderId,
                    'failed',
                    dto.paymentId,
                    dto.signature
                );
                throw new AppError(MESSAGES.INVALID_SIGNATURE, STATUS_CODE.BAD_REQUEST);
            }

            const user = await this._userService.getUserById(userId);
            if (user?.gymId) {
                await this._paymentService.updateGymTransactionStatus(
                    dto.orderId,
                    'failed',
                    dto.paymentId,
                    dto.signature
                );
                throw new AppError('User already has a gym membership', STATUS_CODE.BAD_REQUEST);
            }

            const subscriptionPlan = await this._gymService.getSubscriptionPlan(dto.subscriptionPlanId);
            if (!subscriptionPlan) {
                throw new AppError('Subscription plan not found', STATUS_CODE.NOT_FOUND);
            }

            const startDate = new Date();
            let endDate: Date;

            switch (subscriptionPlan.durationUnit) {
                case 'day':
                    endDate = addDays(startDate, subscriptionPlan.duration);
                    break;
                case 'month':
                    endDate = addMonths(startDate, subscriptionPlan.duration);
                    break;
                case 'year':
                    endDate = addYears(startDate, subscriptionPlan.duration);
                    break;
                default:
                    endDate = addMonths(startDate, subscriptionPlan.duration);
            }

            transaction = await this._paymentService.updateGymTransactionStatus(
                dto.orderId,
                'completed',
                dto.paymentId,
                dto.signature
            );

            await this._userService.updateUserGymMembership(
                userId,
                dto.gymId,
                dto.subscriptionPlanId,
                startDate,
                endDate,
                dto.preferredTime
            );

            await this._gymService.addMemberToGym(dto.gymId, userId);

            const gymDetails = await this._gymService.getGymById(dto.gymId);

            if (gymDetails && subscriptionPlan) {
                await this._notificationService.sendGymSubscribedNotification(
                    userId,
                    gymDetails.name || 'Gym',
                    subscriptionPlan.name
                );

                await this._notificationService.createNotification({
                    recipientId: dto.gymId,
                    recipientRole: 'gym',
                    type: 'gym_new_member',
                    title: 'New Member!',
                    message: `New member ${user?.name} joined your gym with ${subscriptionPlan.name} plan`,
                    priority: 'high',
                    category: 'success'
                });

                await this._notificationService.createNotification({
                    recipientId: dto.gymId,
                    recipientRole: 'gym',
                    type: 'gym_payment_received',
                    title: 'Payment Received',
                    message: `Payment received from ${user?.name} for ${subscriptionPlan.name}`,
                    priority: 'medium',
                    category: 'success'
                });
            }

            await this._gymReminderService.saveReminderPreference(
                userId,
                dto.gymId,
                dto.preferredTime
            );

            if (user && gymDetails && subscriptionPlan) {
                await this._emailService.sendGymSubscriptionEmail(
                    user.email,
                    user.name,
                    gymDetails.name!,
                    subscriptionPlan.name,
                    dto.preferredTime
                );
            }

            const response = {
                success: true,
                message: 'Payment verified and gym membership confirmed!',
                transactionId: transaction?._id,
            };

            res.status(STATUS_CODE.OK).json(response);
        } catch (err) {
            logger.error('Verify Gym Payment Error', err);
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
