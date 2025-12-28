import { ITransaction } from '../models/transaction.model';

export interface ITransactionDTO {
    _id: string;
    userId: { _id?: string; name: string; email: string } | string;
    trainerId: { _id?: string; name: string } | string;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    amount: number;
    platformFee: number;
    trainerEarnings: number;
    status: 'pending' | 'completed' | 'failed';
    planType: 'basic' | 'premium' | 'pro';
    createdAt: Date;
    updatedAt: Date;
}

export class TransactionDto {
    static toResponse(transaction: ITransaction): ITransactionDTO {
        const userIdObj = transaction.userId as unknown as { _id?: { toString: () => string }; name: string; email: string };
        const trainerIdObj = transaction.trainerId as unknown as { _id?: { toString: () => string }; name: string };

        // Check if userId is a populated object with name/email properties, otherwise treat as ID string
        const mappedUser = (userIdObj && typeof userIdObj === 'object' && 'name' in userIdObj)
            ? {
                _id: userIdObj._id?.toString() || (transaction.userId as unknown as string),
                name: userIdObj.name,
                email: userIdObj.email
            }
            : (transaction.userId as unknown as string);

        // Check if trainerId is a populated object with name property, otherwise treat as ID string
        const mappedTrainer = (trainerIdObj && typeof trainerIdObj === 'object' && 'name' in trainerIdObj)
            ? {
                _id: trainerIdObj._id?.toString() || (transaction.trainerId as unknown as string),
                name: trainerIdObj.name
            }
            : (transaction.trainerId as unknown as string);

        return {
            _id: transaction._id.toString(),
            userId: mappedUser,
            trainerId: mappedTrainer,
            razorpayOrderId: transaction.razorpayOrderId,
            razorpayPaymentId: transaction.razorpayPaymentId,
            amount: transaction.amount,
            platformFee: transaction.platformFee,
            trainerEarnings: transaction.trainerEarnings,
            status: transaction.status,
            planType: transaction.planType,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt
        };
    }
}
