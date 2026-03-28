import { Router } from 'express';
import container from '../core/di/inversify.config';
import TYPES from '../core/types/types';
import { GymProductController } from '../controllers/gymProduct.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const productController = container.get<GymProductController>(TYPES.GymProductController);

// Public/User Routes
router.get('/', productController.getShowcaseProducts.bind(productController));
router.get('/wishlist', authMiddleware, roleMiddleware(['user']), productController.getUserWishlist.bind(productController));
router.post('/wishlist/:productId', authMiddleware, roleMiddleware(['user']), productController.toggleWishlist.bind(productController));

// Gym Owner Routes
router.post('/manage', authMiddleware, roleMiddleware(['gym']), productController.createProduct.bind(productController));
router.get('/manage', authMiddleware, roleMiddleware(['gym']), productController.getGymProducts.bind(productController));
router.put('/manage/:id', authMiddleware, roleMiddleware(['gym']), productController.updateProduct.bind(productController));
router.delete('/manage/:id', authMiddleware, roleMiddleware(['gym']), productController.deleteProduct.bind(productController));
router.patch('/manage/:id/availability', authMiddleware, roleMiddleware(['gym']), productController.toggleAvailability.bind(productController));

export default router;
