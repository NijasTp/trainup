import { IGymJob } from "../../../models/gymJob.model";

export interface IGymJobRepository {
    create(data: Partial<IGymJob>): Promise<IGymJob>;
    findById(id: string): Promise<IGymJob | null>;
    findOne(query: any): Promise<IGymJob | null>;
    findOneAndUpdate(query: any, update: any, options?: any): Promise<IGymJob | null>;
    deleteOne(query: any): Promise<{ deletedCount: number }>;
    find(query: any, page: number, limit: number): Promise<{
        jobs: IGymJob[];
        total: number;
        totalPages: number;
    }>;
    countDocuments(query: any): Promise<number>;
}
