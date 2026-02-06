import { injectable, inject } from 'inversify';
import TYPES from '../core/types/types';
import { IRefundService, RefundResult } from '../core/interfaces/services/IRefundService';
import { IUserPlanRepository } from '../core/interfaces/repositories/IUserPlanRepository';
import { AppError } from '../utils/appError.util';
import { STATUS_CODE } from '../constants/status';
import { GYM_MESSAGES, MESSAGES } from '../constants/messages.constants';
import { logger } from '../utils/logger.util';
import { UserGymMembershipModel } from '../models/userGymMembership.model';
import { UserPlanModel } from '../models/userPlan.model';

@injectable()
export class RefundService implements IRefundService {
    constructor(
        @inject(TYPES.IUserPlanRepository) private _userPlanRepo: IUserPlanRepository
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
        const membership = await UserGymMembershipModel.findById(membershipId);

        if (!membership) {
            throw new AppError(GYM_MESSAGES.MEMBERSHIP_NOT_FOUND, STATUS_CODE.NOT_FOUND);
        }

        if (membership.userId.toString() !== userId) {
            throw new AppError(MESSAGES.FORBIDDEN, STATUS_CODE.FORBIDDEN);
        }

        if (membership.status !== 'active') {
            throw new AppError(GYM_MESSAGES.NO_ACTIVE_SUBSCRIPTION, STATUS_CODE.BAD_REQUEST);
        }

        const refundResult = this.calculateRefund(
            membership.subscriptionStartDate,
            membership.subscriptionEndDate,
            membership.price
        );

        // Update membership with refund info
        membership.status = 'cancelled';
        membership.cancellationDate = new Date();
        membership.refundedAmount = refundResult.refundAmount;
        await membership.save();

        logger.info(`Gym refund applied: ${refundResult.refundAmount} for membership ${membershipId}`);

        return refundResult;
    }

    async applyTrainerRefund(userPlanId: string, userId: string): Promise<RefundResult> {
        const userPlan = await UserPlanModel.findById(userPlanId);

        if (!userPlan) {
            throw new AppError(MESSAGES.NOT_FOUND, STATUS_CODE.NOT_FOUND);
        }

        if (userPlan.userId.toString() !== userId) {
            throw new AppError(MESSAGES.FORBIDDEN, STATUS_CODE.FORBIDDEN);
        }

        // Calculate total days from duration (months)
        const startDate = userPlan.createdAt;
        const endDate = userPlan.expiryDate;

        const refundResult = this.calculateRefund(startDate, endDate, userPlan.amount);

        // Update user plan with refund info
        userPlan.cancellationDate = new Date();
        userPlan.refundedAmount = refundResult.refundAmount;
        await userPlan.save();

        logger.info(`Trainer refund applied: ${refundResult.refundAmount} for plan ${userPlanId}`);

        return refundResult;
    }
}
