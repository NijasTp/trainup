import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import TYPES from '../core/types/types';
import { IGymEquipmentService, CreateEquipmentDto, UpdateEquipmentDto } from '../core/interfaces/services/IGymEquipmentService';
import { IJwtService, JwtPayload } from '../core/interfaces/services/IJwtService';
import { STATUS_CODE } from '../constants/status';
import { GYM_MESSAGES } from '../constants/messages.constants';
import { logger } from '../utils/logger.util';

@injectable()
export class GymEquipmentController {
    constructor(
        @inject(TYPES.IGymEquipmentService) private _equipmentService: IGymEquipmentService
    ) { }

    async createEquipment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const gymId = (req.user as JwtPayload).id;
            const files = req.files as any;

            const dto: CreateEquipmentDto = {
                gymId,
                name: req.body.name,
                image: files?.image,
                categoryId: req.body.categoryId,
                categoryName: req.body.categoryName,
                available: req.body.available === 'true' || req.body.available === true,
            };

            const equipment = await this._equipmentService.createEquipment(dto);
            res.status(STATUS_CODE.CREATED).json({ message: GYM_MESSAGES.EQUIPMENT_CREATED, equipment });
        } catch (err) {
            logger.error('Error creating equipment:', err);
            next(err);
        }
    }

    async getEquipments(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const gymId = (req.user as JwtPayload).id;
            const equipments = await this._equipmentService.getEquipmentByGymId(gymId);
            res.status(STATUS_CODE.OK).json({ equipments });
        } catch (err) {
            logger.error('Error fetching equipments:', err);
            next(err);
        }
    }

    async getEquipmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const equipment = await this._equipmentService.getEquipmentById(id);
            if (!equipment) {
                res.status(STATUS_CODE.NOT_FOUND).json({ message: GYM_MESSAGES.EQUIPMENT_NOT_FOUND });
                return;
            }
            res.status(STATUS_CODE.OK).json({ equipment });
        } catch (err) {
            logger.error('Error fetching equipment:', err);
            next(err);
        }
    }

    async updateEquipment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const files = req.files as any;

            const dto: UpdateEquipmentDto = {
                name: req.body.name,
                image: files?.image || req.body.image,
                categoryId: req.body.categoryId,
                available: req.body.available !== undefined ? (req.body.available === 'true' || req.body.available === true) : undefined,
            };

            const equipment = await this._equipmentService.updateEquipment(id, dto);
            if (!equipment) {
                res.status(STATUS_CODE.NOT_FOUND).json({ message: GYM_MESSAGES.EQUIPMENT_NOT_FOUND });
                return;
            }
            res.status(STATUS_CODE.OK).json({ message: GYM_MESSAGES.EQUIPMENT_UPDATED, equipment });
        } catch (err) {
            logger.error('Error updating equipment:', err);
            next(err);
        }
    }

    async deleteEquipment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            await this._equipmentService.deleteEquipment(id);
            res.status(STATUS_CODE.OK).json({ message: GYM_MESSAGES.EQUIPMENT_DELETED });
        } catch (err) {
            logger.error('Error deleting equipment:', err);
            next(err);
        }
    }

    async toggleAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const equipment = await this._equipmentService.toggleAvailability(id);
            res.status(STATUS_CODE.OK).json({ equipment });
        } catch (err) {
            logger.error('Error toggling availability:', err);
            next(err);
        }
    }

    // Category endpoints
    async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const gymId = (req.user as JwtPayload).id;
            const { name } = req.body;
            const category = await this._equipmentService.createCategory(gymId, name);
            res.status(STATUS_CODE.CREATED).json({ message: GYM_MESSAGES.CATEGORY_CREATED, category });
        } catch (err) {
            logger.error('Error creating category:', err);
            next(err);
        }
    }

    async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const gymId = (req.user as JwtPayload).id;
            const categories = await this._equipmentService.getCategoriesByGymId(gymId);
            res.status(STATUS_CODE.OK).json({ categories });
        } catch (err) {
            logger.error('Error fetching categories:', err);
            next(err);
        }
    }

    async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            await this._equipmentService.deleteCategory(id);
            res.status(STATUS_CODE.OK).json({ message: GYM_MESSAGES.CATEGORY_DELETED });
        } catch (err) {
            logger.error('Error deleting category:', err);
            next(err);
        }
    }
}
