import { injectable, inject } from 'inversify';
import TYPES from '../core/types/types';
import { IGymEquipmentService, CreateEquipmentDto, UpdateEquipmentDto, EquipmentResponseDto, CategoryResponseDto } from '../core/interfaces/services/IGymEquipmentService';
import { IGymEquipmentRepository } from '../core/interfaces/repositories/IGymEquipmentRepository';
import { IGymEquipmentCategoryRepository } from '../core/interfaces/repositories/IGymEquipmentCategoryRepository';
import { AppError } from '../utils/appError.util';
import { STATUS_CODE } from '../constants/status';
import { GYM_MESSAGES } from '../constants/messages.constants';

@injectable()
export class GymEquipmentService implements IGymEquipmentService {
    constructor(
        @inject(TYPES.IGymEquipmentRepository) private _equipmentRepo: IGymEquipmentRepository,
        @inject(TYPES.IGymEquipmentCategoryRepository) private _categoryRepo: IGymEquipmentCategoryRepository
    ) { }

    private mapToEquipmentResponse(equipment: any): EquipmentResponseDto {
        return {
            _id: equipment._id.toString(),
            gymId: equipment.gymId.toString(),
            name: equipment.name,
            image: equipment.image,
            categoryId: equipment.categoryId?._id?.toString() || equipment.categoryId?.toString(),
            categoryName: equipment.categoryId?.name || 'Unknown',
            available: equipment.available,
            createdAt: equipment.createdAt,
            updatedAt: equipment.updatedAt,
        };
    }

    private mapToCategoryResponse(category: any): CategoryResponseDto {
        return {
            _id: category._id.toString(),
            gymId: category.gymId.toString(),
            name: category.name,
        };
    }

    async createEquipment(dto: CreateEquipmentDto): Promise<EquipmentResponseDto> {
        let categoryId = dto.categoryId;

        // If categoryName is provided, create or find the category
        if (dto.categoryName && !dto.categoryId) {
            const existingCategory = await this._categoryRepo.findByGymIdAndName(dto.gymId, dto.categoryName);
            if (existingCategory) {
                categoryId = existingCategory._id.toString();
            } else {
                const newCategory = await this._categoryRepo.create({
                    gymId: dto.gymId as any,
                    name: dto.categoryName,
                });
                categoryId = newCategory._id.toString();
            }
        }

        if (!categoryId) {
            throw new AppError(GYM_MESSAGES.EQUIPMENT_CATEGORY_REQUIRED, STATUS_CODE.BAD_REQUEST);
        }

        const equipment = await this._equipmentRepo.create({
            gymId: dto.gymId as any,
            name: dto.name,
            image: dto.image || null,
            categoryId: categoryId as any,
            available: dto.available ?? true,
        });

        const populated = await this._equipmentRepo.findById(equipment._id.toString());
        return this.mapToEquipmentResponse(populated);
    }

    async getEquipmentByGymId(gymId: string): Promise<EquipmentResponseDto[]> {
        const equipments = await this._equipmentRepo.findByGymId(gymId);
        return equipments.map((e) => this.mapToEquipmentResponse(e));
    }

    async getEquipmentById(id: string): Promise<EquipmentResponseDto | null> {
        const equipment = await this._equipmentRepo.findById(id);
        return equipment ? this.mapToEquipmentResponse(equipment) : null;
    }

    async updateEquipment(id: string, dto: UpdateEquipmentDto): Promise<EquipmentResponseDto | null> {
        const equipment = await this._equipmentRepo.update(id, dto as any);
        return equipment ? this.mapToEquipmentResponse(equipment) : null;
    }

    async deleteEquipment(id: string): Promise<void> {
        await this._equipmentRepo.delete(id);
    }

    async toggleAvailability(id: string): Promise<EquipmentResponseDto | null> {
        const equipment = await this._equipmentRepo.findById(id);
        if (!equipment) {
            throw new AppError(GYM_MESSAGES.EQUIPMENT_NOT_FOUND, STATUS_CODE.NOT_FOUND);
        }
        const updated = await this._equipmentRepo.updateAvailability(id, !equipment.available);
        return updated ? this.mapToEquipmentResponse(updated) : null;
    }

    async createCategory(gymId: string, name: string): Promise<CategoryResponseDto> {
        const existingCategory = await this._categoryRepo.findByGymIdAndName(gymId, name);
        if (existingCategory) {
            throw new AppError(GYM_MESSAGES.CATEGORY_ALREADY_EXISTS, STATUS_CODE.CONFLICT);
        }

        const category = await this._categoryRepo.create({
            gymId: gymId as any,
            name,
        });
        return this.mapToCategoryResponse(category);
    }

    async getCategoriesByGymId(gymId: string): Promise<CategoryResponseDto[]> {
        const categories = await this._categoryRepo.findByGymId(gymId);
        return categories.map((c) => this.mapToCategoryResponse(c));
    }

    async deleteCategory(id: string): Promise<void> {
        await this._categoryRepo.delete(id);
    }
}
