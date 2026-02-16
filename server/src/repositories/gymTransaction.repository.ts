import { injectable } from 'inversify';
import { FilterQuery, UpdateQuery } from 'mongoose';
import { IGymTransactionRepository } from '../core/interfaces/repositories/IGymTransactionRepository';
import { IGymTransaction, GymTransactionModel } from '../models/gymTransaction.model';

@injectable()
export class GymTransactionRepository implements IGymTransactionRepository {
    async create(data: Partial<IGymTransaction>): Promise<IGymTransaction> {
        return await GymTransactionModel.create(data);
    }

    async findOne(query: FilterQuery<IGymTransaction>): Promise<IGymTransaction | null> {
        return await GymTransactionModel.findOne(query);
    }

    async findOneAndUpdate(
        query: FilterQuery<IGymTransaction>,
        update: UpdateQuery<IGymTransaction>
    ): Promise<IGymTransaction | null> {
        return await GymTransactionModel.findOneAndUpdate(query, update, { new: true });
    }

    async find(
        query: FilterQuery<IGymTransaction>,
        page: number,
        limit: number
    ): Promise<{ transactions: IGymTransaction[]; total: number; totalPages: number }> {
        const skip = (page - 1) * limit;
        const [transactions, total] = await Promise.all([
            GymTransactionModel.find(query)
                .populate('userId', 'name email')
                .populate('subscriptionPlanId', 'name price duration')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            GymTransactionModel.countDocuments(query),
        ]);

        const totalPages = Math.ceil(total / limit);
        return { transactions: transactions as IGymTransaction[], total, totalPages };
    }

    async updateMany(
        query: FilterQuery<IGymTransaction>,
        update: UpdateQuery<IGymTransaction>
    ): Promise<{ modifiedCount: number }> {
        return await GymTransactionModel.updateMany(query, update);
    }
}
