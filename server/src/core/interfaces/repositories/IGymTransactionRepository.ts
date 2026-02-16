import { FilterQuery, UpdateQuery } from 'mongoose';
import { IGymTransaction } from '../../../models/gymTransaction.model';

export interface IGymTransactionRepository {
    create(data: Partial<IGymTransaction>): Promise<IGymTransaction>;
    findOne(query: FilterQuery<IGymTransaction>): Promise<IGymTransaction | null>;
    findOneAndUpdate(
        query: FilterQuery<IGymTransaction>,
        update: UpdateQuery<IGymTransaction>
    ): Promise<IGymTransaction | null>;
    find(
        query: FilterQuery<IGymTransaction>,
        page: number,
        limit: number
    ): Promise<{ transactions: IGymTransaction[]; total: number; totalPages: number }>;
    updateMany(
        query: FilterQuery<IGymTransaction>,
        update: UpdateQuery<IGymTransaction>
    ): Promise<{ modifiedCount: number }>;
}
