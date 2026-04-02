import { injectable, inject } from 'inversify';
import { IGymProductService } from '../core/interfaces/services/IGymProductService';
import { IGymProductRepository } from '../core/interfaces/repositories/IGymProductRepository';
import { IUserRepository } from '../core/interfaces/repositories/IUserRepository';
import { IGymProduct } from '../models/gymProduct.model';
import TYPES from '../core/types/types';
import { AppError } from '../utils/appError.util';
import { STATUS_CODE } from '../constants/status';
import { MESSAGES } from '../constants/messages.constants';
import { Types } from 'mongoose';
import cloudinary from '../config/cloudinary';
import { GYM_PRODUCT_CONSTANTS } from '../constants/gym.constants';

@injectable()
export class GymProductService implements IGymProductService {
  constructor(
    @inject(TYPES.IGymProductRepository) private _gymProductRepo: IGymProductRepository,
    @inject(TYPES.IUserRepository) private _userRepo: IUserRepository
  ) {}

  async createProduct(data: Partial<IGymProduct>, files?: Express.Multer.File[]): Promise<IGymProduct> {
    const imageUrls: string[] = [];
    
    if (files && files.length > 0) {
      for (const file of files) {
        const upload = await cloudinary.uploader.upload(file.path, {
          folder: GYM_PRODUCT_CONSTANTS.CLOUDINARY_FOLDER
        });
        imageUrls.push(upload.secure_url);
      }
    }

    return await this._gymProductRepo.create({
      ...data,
      images: imageUrls
    });
  }

  async getProduct(id: string): Promise<IGymProduct> {
    const product = await this._gymProductRepo.findById(id);
    if (!product) throw new AppError(MESSAGES.PRODUCT_NOT_FOUND, STATUS_CODE.NOT_FOUND);
    return product;
  }

  async getGymProducts(gymId: string): Promise<IGymProduct[]> {
    return await this._gymProductRepo.findByGymId(gymId);
  }

  async updateProduct(id: string, data: any, files?: Express.Multer.File[]): Promise<IGymProduct> {
    const product = await this._gymProductRepo.findById(id);
    if (!product) throw new AppError(MESSAGES.PRODUCT_NOT_FOUND, STATUS_CODE.NOT_FOUND);

    let images = data.existingImages || [];
    if (typeof images === 'string') images = [images];

    if (files && files.length > 0) {
      for (const file of files) {
        const upload = await cloudinary.uploader.upload(file.path, {
          folder: GYM_PRODUCT_CONSTANTS.CLOUDINARY_FOLDER
        });
        images.push(upload.secure_url);
      }
    }

    const updateData = {
      ...data,
      images
    };

    delete updateData.existingImages;

    const updated = await this._gymProductRepo.update(id, updateData);
    if (!updated) throw new AppError(MESSAGES.PRODUCT_NOT_FOUND, STATUS_CODE.NOT_FOUND);
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    await this._gymProductRepo.delete(id);
  }

  async toggleAvailability(id: string): Promise<IGymProduct> {
    const product = await this._gymProductRepo.findById(id);
    if (!product) throw new AppError(MESSAGES.PRODUCT_NOT_FOUND, STATUS_CODE.NOT_FOUND);
    
    product.isAvailable = !product.isAvailable;
    const updated = await this._gymProductRepo.update(id, { isAvailable: product.isAvailable });
    return updated!;
  }

  async getShowcaseProducts(search: string, category: string, minPrice: number, maxPrice: number): Promise<IGymProduct[]> {
    return await this._gymProductRepo.findAll(search, category, minPrice, maxPrice);
  }

  async toggleWishlist(userId: string, productId: string): Promise<boolean> {
    const user = await this._userRepo.findById(userId);
    if (!user) throw new AppError(MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND);

    const wishlist = user.wishlist || [];
    const index = wishlist.findIndex(id => id.toString() === productId);
    let added = false;

    if (index === -1) {
      wishlist.push(new Types.ObjectId(productId) as any);
      added = true;
    } else {
      wishlist.splice(index, 1);
      added = false;
    }

    await this._userRepo.updateUser(userId, { wishlist });
    return added;
  }

  async getUserWishlist(userId: string): Promise<IGymProduct[]> {
    const user = await this._userRepo.findById(userId);
    if (!user) throw new AppError(MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND);
    
    // We assume the repository populates or we'll need to fetch manually
    // Since IUserRepository might not populate by default, let's just use the product repo
    const productIds = (user.wishlist || []).map(id => id.toString());
    const products: IGymProduct[] = [];
    
    for (const id of productIds) {
      const p = await this._gymProductRepo.findById(id);
      if (p) products.push(p);
    }
    
    return products;
  }
}
