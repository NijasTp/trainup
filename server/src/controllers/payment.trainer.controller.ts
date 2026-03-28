import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { STATUS_CODE } from '../constants/status';
import TYPES from '../core/types/types';
import { IPaymentService } from '../core/interfaces/services/IPaymentService';
import { IUserService } from '../core/interfaces/services/IUserService';
import { ITrainerService } from '../core/interfaces/services/ITrainerService';
import { ITransactionService } from '../core/interfaces/services/ITransactionService';
import { IUserPlanService } from '../core/interfaces/services/IUserPlanService';
import { JwtPayload } from '../core/interfaces/services/IJwtService';
import { MESSAGES } from '../constants/messages.constants';
import { logger } from '../utils/logger.util';
import { AppError } from '../utils/appError.util';
import { addMonths } from 'date-fns';
import { INotificationService } from '../core/interfaces/services/INotificationService';

@injectable()
export class PaymentTrainerController {
    constructor(
        @inject(TYPES.IPaymentService) private _paymentService: IPaymentService,
        @inject(TYPES.IUserService) private _userService: IUserService,
        @inject(TYPES.ITrainerService) private _trainerService: ITrainerService,
        @inject(TYPES.ITransactionService) private _transactionService: ITransactionService,
        @inject(TYPES.IUserPlanService) private _userPlanService: IUserPlanService,
        @inject(TYPES.INotificationService) private _notificationService: INotificationService
    ) { }

    async getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id;
            const { page = '1', limit = '10', search = '', status = '', sort = 'newest' } = req.query as {
                page?: string;
                limit?: string;
                search?: string;
                status?: string;
                sort?: string;
            };

            const transactions = await this._transactionService.getUserTransactions(
                userId,
                parseInt(page, 10),
                parseInt(limit, 10),
                search,
                status,
                sort
            );

            res.status(STATUS_CODE.OK).json(transactions);
        } catch (err) {
            logger.error('Get Transactions Error', err);
            next(err);
        }
    }

    async checkPendingTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id;
            const pendingTransaction = await this._transactionService.getUserPendingTransaction(userId);
            res.status(STATUS_CODE.OK).json({
                hasPending: !!pendingTransaction,
                transaction: pendingTransaction
            });
        } catch (err) {
            logger.error('Check Pending Transaction Error', err);
            next(err);
        }
    }

    async cleanupPendingTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id;
            const updatedCount = await this._transactionService.markUserPendingTransactionsAsFailed(userId);
            res.status(STATUS_CODE.OK).json({
                success: true,
                message: `${updatedCount} pending transactions cancelled`,
                updatedCount
            });
        } catch (err) {
            logger.error('Cleanup Pending Transactions Error', err);
            next(err);
        }
    }

    async createCheckoutSession(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { trainerId, planType, duration } = req.body;
            const userId = (req.user as JwtPayload).id;

            if (!trainerId || !planType || !duration) {
                throw new AppError(MESSAGES.MISSING_REQUIRED_FIELDS, STATUS_CODE.BAD_REQUEST);
            }

            // Check for pending transaction
            const pending = await this._transactionService.getUserPendingTransaction(userId);
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

            const trainer = await this._trainerService.getTrainerById(trainerId);
            if (!trainer) throw new AppError(MESSAGES.TRAINER_NOT_FOUND, STATUS_CODE.NOT_FOUND);

            const trainerPrice = trainer.price as unknown as Record<string, number>;
            if (!trainerPrice || typeof trainerPrice !== 'object') {
                throw new AppError('Trainer has no price configuration', STATUS_CODE.BAD_REQUEST);
            }

            const basePrice = trainerPrice[planType as string];
            if (!basePrice) throw new AppError(`Plan '${planType}' is not available for this trainer`, STATUS_CODE.BAD_REQUEST);

            const amount = basePrice * duration;

            const session = await this._paymentService.createTrainerCheckoutSession({
                userId,
                trainerId,
                planType: planType as 'basic' | 'premium' | 'pro',
                amount,
                userName: user.name,
                trainerName: trainer.name,
                duration
            });

            res.status(STATUS_CODE.OK).json(session);
        } catch (err) {
            logger.error('Create Trainer Checkout Session Error', err);
            next(err);
        }
    }

    async getSessionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { sessionId } = req.params;
            const session = await this._paymentService.getCheckoutSession(sessionId);

            if (session.payment_status === 'paid') {
                const metadata = session.metadata;
                const userId = metadata.userId;
                const trainerId = metadata.trainerId;
                const planType = metadata.planType as 'basic' | 'premium' | 'pro';
                const duration = parseInt(metadata.duration, 10);
                const amount = parseFloat(metadata.amount);

                // Check if already fulfilled via previous call or webhook (if enabled eventually)
                const existingTransaction = await this._transactionService.findByOrderId(sessionId);
                if (!existingTransaction) {
                    // Start Fulfillment
                    await this._transactionService.createTransaction({
                        userId,
                        trainerId,
                        amount,
                        platformFee: Math.floor(amount * 0.10),
                        trainerEarnings: amount - Math.floor(amount * 0.10),
                        planType,
                        duration,
                        stripeSessionId: sessionId, 
                        paymentIntentId: session.payment_intent as string,
                        status: 'completed',
                        provider: 'stripe',
                        createdAt: new Date(),
                    });

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

                    await this._notificationService.sendTrainerSubscribedNotification(userId, metadata.trainerName || 'Trainer');
                }
            }

            res.status(STATUS_CODE.OK).json({ 
                status: session.status, 
                payment_status: session.payment_status 
            });
        } catch (err) {
            logger.error('Get Session Status Error', err);
            next(err);
        }
    }
}
