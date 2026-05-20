import { injectable, inject } from 'inversify';
import TYPES from '../core/types/types';
import { IRefundService, RefundResult } from '../core/interfaces/services/IRefundService';
import { IUserPlanRepository } from '../core/interfaces/repositories/IUserPlanRepository';
import { IUserRepository } from '../core/interfaces/repositories/IUserRepository';
import { AppError } from '../utils/appError.util';
import { STATUS_CODE } from '../constants/status';
import { Types } from 'mongoose';
import { GYM_MESSAGES, MESSAGES } from '../constants/messages.constants';
import { IGymRepository } from '../core/interfaces/repositories/IGymRepository';
import { logger } from '../utils/logger.util';

import { IWalletRepository } from '../core/interfaces/repositories/IWalletRepository';
import { ITransactionRepository } from '../core/interfaces/repositories/ITransactionRepository';
import { IGymTransactionRepository } from '../core/interfaces/repositories/IGymTransactionRepository';

@injectable()
export class RefundService implements IRefundService {
    constructor(
        @inject(TYPES.IUserPlanRepository) private _userPlanRepo: IUserPlanRepository,
        @inject(TYPES.IUserRepository) private _userRepo: IUserRepository,
        @inject(TYPES.IWalletRepository) private _walletRepo: IWalletRepository,
        @inject(TYPES.IGymRepository) private _gymRepo: IGymRepository,
        @inject(TYPES.ITransactionRepository) private _transactionRepo: ITransactionRepository,
        @inject(TYPES.IGymTransactionRepository) private _gymTransactionRepo: IGymTransactionRepository
    ) { }


    calculateRefund(startDate: Date, endDate: Date, price: number): RefundResult {
        const now = new Date();
        const totalMs = endDate.getTime() - startDate.getTime();
        const remainingMs = Math.max(0, endDate.getTime() - now.getTime());

        const totalDays = Math.ceil(totalMs / (1000 * 60 * 60 * 24));
        const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

        if (remainingDays <= 0) {
            return { refundAmount: 0, remainingDays: 0, totalDays };
        }

        const refundAmount = Math.round((remainingDays / totalDays) * price * 100) / 100;

        return {
            refundAmount,
            remainingDays,
            totalDays,
        };
    }

    async applyGymRefund(membershipId: string, userId: string): Promise<RefundResult> {
        const membership = await this._gymRepo.getMembershipById(membershipId);

        if (!membership) {
            throw new AppError(GYM_MESSAGES.MEMBERSHIP_NOT_FOUND, STATUS_CODE.NOT_FOUND);
        }

        if (membership.userId.toString() !== userId) {
            throw new AppError(MESSAGES.FORBIDDEN, STATUS_CODE.FORBIDDEN);
        }

        if (membership.status !== 'active' && membership.status !== 'pending') {
            throw new AppError(GYM_MESSAGES.NO_ACTIVE_SUBSCRIPTION, STATUS_CODE.BAD_REQUEST);
        }

        const refundResult = this.calculateRefund(
            membership.subscriptionStartDate,
            membership.subscriptionEndDate,
            membership.price
        );

        // Update membership with refund info
        await this._gymRepo.updateMember(membershipId, {
            status: 'cancelled',
            cancellationDate: new Date(),
            refundedAmount: refundResult.refundAmount
        });

        // Clean up User and Gym models
        await this._userRepo.updateUser(userId, { gymId: null as unknown as Types.ObjectId });
        await this._gymRepo.removeMemberFromGym(membership.gymId.toString(), userId);

        // Credit user wallet
        if (refundResult.refundAmount > 0) {
            await this._walletRepo.addTransaction(
                userId,
                refundResult.refundAmount,
                'credit',
                `Refund for gym membership cancellation: ${membershipId}`,
                membershipId
            );

            // Also create a GymTransaction record for the history page
            await this._gymTransactionRepo.create({
                gymId: membership.gymId,
                userId,
                subscriptionPlanId: membership.planId,
                amount: refundResult.refundAmount,
                status: 'completed',
                transactionType: 'credit',
                description: `Refund for membership cancellation`,
                provider: 'stripe', // Assuming stripe as default for now
                paymentMethod: 'wallet',
                preferredTime: membership.preferredTime
            });
        }

        logger.info(`Gym refund applied: ${refundResult.refundAmount} for membership ${membershipId}`);

        return refundResult;
    }


    async applyTrainerRefund(userPlanId: string, userId: string): Promise<RefundResult> {
        const userPlan = await this._userPlanRepo.findById(userPlanId);

        if (!userPlan) {
            throw new AppError(MESSAGES.NOT_FOUND, STATUS_CODE.NOT_FOUND);
        }

        if (userPlan.userId.toString() !== userId) {
            throw new AppError(MESSAGES.FORBIDDEN, STATUS_CODE.FORBIDDEN);
        }

        // Calculate total days from duration (months)
        const startDate = userPlan.createdAt as Date;
        const endDate = userPlan.expiryDate;

        const refundResult = this.calculateRefund(startDate, endDate, userPlan.amount);

        // Update user plan with refund info
        await this._userPlanRepo.updateById(userPlanId, {
            cancellationDate: new Date(),
            refundedAmount: refundResult.refundAmount
        });

        // Credit user wallet
        if (refundResult.refundAmount > 0) {
            await this._walletRepo.addTransaction(
                userId,
                refundResult.refundAmount,
                'credit',
                `Refund for trainer plan cancellation: ${userPlanId}`,
                userPlanId
            );

            // Also create a Transaction record for the history page
            await this._transactionRepo.createTransaction({
                userId,
                trainerId: userPlan.trainerId,
                amount: refundResult.refundAmount,
                status: 'completed',
                transactionType: 'credit',
                description: `Refund for trainer plan cancellation`,
                planType: userPlan.planType,
                provider: 'stripe'
            });
        }


        return refundResult;
    }

}
