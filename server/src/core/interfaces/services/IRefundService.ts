export interface RefundResult {
    refundAmount: number;
    remainingDays: number;
    totalDays: number;
}

export interface IRefundService {
    calculateRefund(
        startDate: Date,
        endDate: Date,
        price: number
    ): RefundResult;

    applyGymRefund(
        membershipId: string,
        userId: string
    ): Promise<RefundResult>;

    applyTrainerRefund(
        userPlanId: string,
        userId: string
    ): Promise<RefundResult>;
}
