import { injectable } from "inversify";
import { IProgressRepository } from "../core/interfaces/repositories/IProgressRepository";
import { IProgress, Progress } from "../models/progress.model";
import moment from 'moment';

@injectable()
export class ProgressRepository implements IProgressRepository {
    async create(progress: Partial<IProgress>): Promise<IProgress> {
        return await Progress.create(progress);
    }

    async findByUserId(userId: string): Promise<IProgress[]> {
        return await Progress.find({ userId }).sort({ date: -1 }).exec();
    }

    async findByDate(userId: string, date: Date): Promise<IProgress | null> {
        const startOfDay = moment(date).startOf('day').toDate();
        const endOfDay = moment(date).endOf('day').toDate();

        return await Progress.findOne({
            userId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }).exec();
    }

    async update(id: string, data: Partial<IProgress>): Promise<IProgress | null> {
        return await Progress.findByIdAndUpdate(id, data, { new: true }).exec();
    }

    async findFirstEntry(userId: string): Promise<IProgress | null> {
        return await Progress.findOne({ userId, photos: { $exists: true, $ne: [] } })
            .sort({ date: 1 })
            .exec();
    }

    async findLatestEntry(userId: string): Promise<IProgress | null> {
        return await Progress.findOne({ userId, photos: { $exists: true, $ne: [] } })
            .sort({ date: -1 })
            .exec();
    }
}
