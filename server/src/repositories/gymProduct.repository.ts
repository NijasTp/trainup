import { injectable } from 'inversify';
import { IGymProductRepository } from '../core/interfaces/repositories/IGymProductRepository';
import { IGymProduct, GymProductModel } from '../models/gymProduct.model';
import { FilterQuery } from 'mongoose';

@injectable()
export class GymProductRepository implements IGymProductRepository {
  async create(data: Partial<IGymProduct>): Promise<IGymProduct> {
    return await GymProductModel.create(data);
  }

  async findById(id: string): Promise<IGymProduct | null> {
    return await GymProductModel.findById(id);
  }

  async findByGymId(gymId: string): Promise<IGymProduct[]> {
    return await GymProductModel.find({ gymId }).sort({ createdAt: -1 });
  }

  async update(id: string, data: Partial<IGymProduct>): Promise<IGymProduct | null> {
    return await GymProductModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<void> {
    await GymProductModel.findByIdAndDelete(id);
  }

  async findAll(search: string, category: string, minPrice: number, maxPrice: number): Promise<IGymProduct[]> {
    const query: FilterQuery<IGymProduct> = { isAvailable: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }

    return await GymProductModel.find(query).sort({ createdAt: -1 });
  }

  async find(query: any, page: number, limit: number): Promise<{ products: IGymProduct[]; total: number; totalPages: number }> {
    const total = await GymProductModel.countDocuments(query);
    const products = await GymProductModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean() as IGymProduct[];

    return {
      products,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(query: any): Promise<IGymProduct | null> {
    return await GymProductModel.findOne(query).lean() as IGymProduct | null;
  }

  async updateOne(query: any, update: any): Promise<{ matchedCount: number; modifiedCount: number }> {
    const result = await GymProductModel.updateOne(query, update);
    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    };
  }
}
