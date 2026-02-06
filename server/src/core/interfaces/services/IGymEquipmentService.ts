import { IGymEquipmentCategory } from '../../../models/gymEquipmentCategory.model';
import { IGymEquipment } from '../../../models/gymEquipment.model';

export interface CreateEquipmentDto {
    gymId: string;
    name: string;
    image?: string;
    categoryId: string;
    categoryName?: string; // For creating new category
    available?: boolean;
}

export interface UpdateEquipmentDto {
    name?: string;
    image?: string;
    categoryId?: string;
    available?: boolean;
}

export interface EquipmentResponseDto {
    _id: string;
    gymId: string;
    name: string;
    image: string | null;
    categoryId: string;
    categoryName: string;
    available: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CategoryResponseDto {
    _id: string;
    gymId: string;
    name: string;
}

export interface IGymEquipmentService {
    createEquipment(dto: CreateEquipmentDto): Promise<EquipmentResponseDto>;
    getEquipmentByGymId(gymId: string): Promise<EquipmentResponseDto[]>;
    getEquipmentById(id: string): Promise<EquipmentResponseDto | null>;
    updateEquipment(id: string, dto: UpdateEquipmentDto): Promise<EquipmentResponseDto | null>;
    deleteEquipment(id: string): Promise<void>;
    toggleAvailability(id: string): Promise<EquipmentResponseDto | null>;

    // Category methods
    createCategory(gymId: string, name: string): Promise<CategoryResponseDto>;
    getCategoriesByGymId(gymId: string): Promise<CategoryResponseDto[]>;
    deleteCategory(id: string): Promise<void>;
}
