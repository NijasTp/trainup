import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { IGymProductService } from '../core/interfaces/services/IGymProductService';
import TYPES from '../core/types/types';
import { STATUS_CODE } from '../constants/status';
import { MESSAGES } from '../constants/messages.constants';
import { JwtPayload } from '../core/interfaces/services/IJwtService';
import { GYM_PRODUCT_CONSTANTS } from '../constants/gym.constants';

@injectable()
export class GymProductController {
  constructor(
    @inject(TYPES.IGymProductService) private _productService: IGymProductService
  ) {}

  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const productFiles = files?.[GYM_PRODUCT_CONSTANTS.IMAGE_FIELD] || [];
      
      const data = { ...req.body };
      if (typeof data.isAvailable === 'string') {
        data.isAvailable = data.isAvailable === 'true';
      }

      const product = await this._productService.createProduct({ ...data, gymId }, productFiles);
      res.status(STATUS_CODE.CREATED).json({ product, message: MESSAGES.PRODUCT_CREATED });
    } catch (error) {
      next(error);
    }
  }

  async getGymProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const products = await this._productService.getGymProducts(gymId);
      res.status(STATUS_CODE.OK).json({ products });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const productFiles = files?.[GYM_PRODUCT_CONSTANTS.IMAGE_FIELD] || [];

      const data = { ...req.body };
      if (typeof data.isAvailable === 'string') {
        data.isAvailable = data.isAvailable === 'true';
      }

      // Handle existingImages array if it's a single string from FormData
      const existingImagesField = GYM_PRODUCT_CONSTANTS.EXISTING_IMAGES_FIELD;
      if (data[existingImagesField] && typeof data[existingImagesField] === 'string') {
        data[existingImagesField] = [data[existingImagesField]];
      }

      const product = await this._productService.updateProduct(id, data, productFiles);
      res.status(STATUS_CODE.OK).json({ product, message: MESSAGES.PRODUCT_UPDATED });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this._productService.deleteProduct(id);
      res.status(STATUS_CODE.OK).json({ message: 'Product deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async toggleAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const product = await this._productService.toggleAvailability(id);
      res.status(STATUS_CODE.OK).json({ product, message: 'Availability updated' });
    } catch (error) {
      next(error);
    }
  }

  async getShowcaseProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search = '', category = 'all', minPrice = '0', maxPrice = '10000000' } = req.query as any;
      const products = await this._productService.getShowcaseProducts(search, category, Number(minPrice), Number(maxPrice));
      res.status(STATUS_CODE.OK).json({ products });
    } catch (error) {
      next(error);
    }
  }

  async toggleWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id;
      const { productId } = req.params;
      const added = await this._productService.toggleWishlist(userId, productId);
      res.status(STATUS_CODE.OK).json({ message: added ? 'Added to wishlist' : 'Removed from wishlist', added });
    } catch (error) {
      next(error);
    }
  }

  async getUserWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id;
      const products = await this._productService.getUserWishlist(userId);
      res.status(STATUS_CODE.OK).json({ products });
    } catch (error) {
      next(error);
    }
  }
}
