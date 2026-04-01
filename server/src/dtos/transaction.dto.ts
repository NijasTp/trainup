import { ITransaction } from '../models/transaction.model';
import { IGymTransaction } from '../models/gymTransaction.model';

export interface ITransactionDTO {
    _id: string;
    userId: { _id?: string; name: string; email: string } | string;
    trainerId?: { _id?: string; name: string } | string;
    gymId?: { _id?: string; name: string } | string;
    razorpayOrderId?: string;
    stripeSessionId?: string;
    razorpayPaymentId?: string;
    paymentIntentId?: string;
    amount: number;
    platformFee: number;
    trainerEarnings?: number;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    planType?: string;
    type: 'trainer' | 'gym';
    createdAt: Date;
    updatedAt: Date;
}

export class TransactionDto {
    static toResponse(transaction: ITransaction): ITransactionDTO {
        const userIdObj = transaction.userId as any;
        const trainerIdObj = transaction.trainerId as any;

        const mappedUser = (userIdObj && typeof userIdObj === 'object' && 'name' in userIdObj)
            ? { _id: userIdObj._id?.toString(), name: userIdObj.name, email: userIdObj.email }
            : (transaction.userId as unknown as string);

        const mappedTrainer = (trainerIdObj && typeof trainerIdObj === 'object' && 'name' in trainerIdObj)
            ? { _id: trainerIdObj._id?.toString(), name: trainerIdObj.name }
            : (transaction.trainerId as unknown as string);

        return {
            _id: transaction._id.toString(),
            userId: mappedUser,
            trainerId: mappedTrainer,
            razorpayOrderId: transaction.razorpayOrderId || '',
            stripeSessionId: transaction.stripeSessionId,
            razorpayPaymentId: transaction.razorpayPaymentId,
            paymentIntentId: transaction.paymentIntentId,
            amount: transaction.amount,
            platformFee: transaction.platformFee || 0,
            trainerEarnings: transaction.trainerEarnings,
            status: transaction.status,
            planType: transaction.planType,
            type: 'trainer',
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt
        };
    }

    static fromGymTransaction(transaction: IGymTransaction): ITransactionDTO {
        const userIdObj = transaction.userId as any;
        const gymIdObj = transaction.gymId as any;
        const planObj = transaction.subscriptionPlanId as any;

        const mappedUser = (userIdObj && typeof userIdObj === 'object' && 'name' in userIdObj)
            ? { _id: userIdObj._id?.toString(), name: userIdObj.name, email: userIdObj.email }
            : (transaction.userId as unknown as string);

        const mappedGym = (gymIdObj && typeof gymIdObj === 'object' && 'name' in gymIdObj)
            ? { _id: gymIdObj._id?.toString(), name: gymIdObj.name }
            : (transaction.gymId as unknown as string);

        return {
            _id: transaction._id.toString(),
            userId: mappedUser,
            gymId: mappedGym,
            stripeSessionId: transaction.stripeSessionId,
            paymentIntentId: transaction.paymentIntentId,
            amount: transaction.amount,
            platformFee: Math.floor(transaction.amount * 0.10), // Assuming 10% for gym too
            status: transaction.status as any,
            planType: planObj?.name || 'Gym Plan',
            type: 'gym',
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt
        };
    }
}
