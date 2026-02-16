import { injectable } from "inversify";
import { IGymJobRepository } from "../core/interfaces/repositories/IGymJobRepository";
import { IGymJob, GymJobModel } from "../models/gymJob.model";

@injectable()
export class GymJobRepository implements IGymJobRepository {
    async create(data: Partial<IGymJob>): Promise<IGymJob> {
        return await GymJobModel.create(data);
    }

    async findById(id: string): Promise<IGymJob | null> {
        return await GymJobModel.findById(id).lean();
    }

    async findOne(query: any): Promise<IGymJob | null> {
        return await GymJobModel.findOne(query).lean();
    }

    async findOneAndUpdate(query: any, update: any, options: any = { new: true }): Promise<IGymJob | null> {
        return await GymJobModel.findOneAndUpdate(query, update, options).lean();
    }

    async deleteOne(query: any): Promise<{ deletedCount: number }> {
        const result = await GymJobModel.deleteOne(query);
        return { deletedCount: result.deletedCount || 0 };
    }

    async find(query: any, page: number, limit: number): Promise<{
        jobs: IGymJob[];
        total: number;
        totalPages: number;
    }> {
        const skip = (page - 1) * limit;
        const [jobs, total] = await Promise.all([
            GymJobModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            GymJobModel.countDocuments(query)
        ]);

        return {
            jobs: jobs as IGymJob[],
            total,
            totalPages: Math.ceil(total / limit)
        };
    }

    async countDocuments(query: any): Promise<number> {
        return await GymJobModel.countDocuments(query);
    }
}
