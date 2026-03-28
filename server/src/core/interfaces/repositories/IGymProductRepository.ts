import { IGymProduct } from '../../../models/gymProduct.model';

export interface IGymProductRepository {
  create(data: Partial<IGymProduct>): Promise<IGymProduct>;
  findById(id: string): Promise<IGymProduct | null>;
  findByGymId(gymId: string): Promise<IGymProduct[]>;
  update(id: string, data: Partial<IGymProduct>): Promise<IGymProduct | null>;
  delete(id: string): Promise<void>;
  findAll(search: string, category: string, minPrice: number, maxPrice: number): Promise<IGymProduct[]>;
}
