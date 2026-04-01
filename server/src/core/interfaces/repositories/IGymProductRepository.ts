import { IGymProduct } from '../../../models/gymProduct.model';

export interface IGymProductRepository {
  create(data: Partial<IGymProduct>): Promise<IGymProduct>;
  findById(id: string): Promise<IGymProduct | null>;
  findByGymId(gymId: string): Promise<IGymProduct[]>;
  update(id: string, data: Partial<IGymProduct>): Promise<IGymProduct | null>;
  delete(id: string): Promise<void>;
  findAll(search: string, category: string, minPrice: number, maxPrice: number): Promise<IGymProduct[]>;
  find(query: any, page: number, limit: number): Promise<{ products: IGymProduct[]; total: number; totalPages: number }>;
  findOne(query: any): Promise<IGymProduct | null>;
  updateOne(query: any, update: any): Promise<{ matchedCount: number; modifiedCount: number }>;
}
