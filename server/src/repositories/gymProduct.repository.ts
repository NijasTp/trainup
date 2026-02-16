import { injectable } from "inversify";
import mongoose from "mongoose";
import { IGymProductRepository } from "../core/interfaces/repositories/IGymProductRepository";
import { IGymProduct, GymProductModel } from "../models/gymProduct.model";

@injectable()
export class GymProductRepository implements IGymProductRepository {
    async create(data: Partial<IGymProduct>): Promise<IGymProduct> {
        return await GymProductModel.create(data);
    }

    async findById(id: string): Promise<IGymProduct | null> {
        return await GymProductModel.findById(id).lean();
    }

    async findOne(query: any): Promise<IGymProduct | null> {
        return await GymProductModel.findOne(query).lean();
    }

    async update(id: string, data: Partial<IGymProduct>): Promise<IGymProduct | null> {
        return await GymProductModel.findByIdAndUpdate(id, data, { new: true }).lean();
    }

    async updateOne(query: any, update: any): Promise<{ matchedCount: number; modifiedCount: number }> {
        const result = await GymProductModel.updateOne(query, update);
        return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
    }

    async find(query: any, page: number, limit: number): Promise<{
        products: IGymProduct[];
        total: number;
        totalPages: number;
    }> {
        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            GymProductModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            GymProductModel.countDocuments(query)
        ]);

        return {
            products: products as IGymProduct[],
            total,
            totalPages: Math.ceil(total / limit)
        };
    }

    async countDocuments(query: any): Promise<number> {
        return await GymProductModel.countDocuments(query);
    }
}
