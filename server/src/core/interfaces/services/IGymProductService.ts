import { IGymProduct } from '../../../models/gymProduct.model';

export interface IGymProductService {
  createProduct(data: Partial<IGymProduct>): Promise<IGymProduct>;
  getProduct(id: string): Promise<IGymProduct>;
  getGymProducts(gymId: string): Promise<IGymProduct[]>;
  updateProduct(id: string, data: Partial<IGymProduct>): Promise<IGymProduct>;
  deleteProduct(id: string): Promise<void>;
  toggleAvailability(id: string): Promise<IGymProduct>;
  getShowcaseProducts(search: string, category: string, minPrice: number, maxPrice: number): Promise<IGymProduct[]>;
  toggleWishlist(userId: string, productId: string): Promise<boolean>;
  getUserWishlist(userId: string): Promise<IGymProduct[]>;
}
