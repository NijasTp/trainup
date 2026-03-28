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
}
