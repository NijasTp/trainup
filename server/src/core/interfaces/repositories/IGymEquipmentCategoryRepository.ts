import { IGymEquipmentCategory } from '../../../models/gymEquipmentCategory.model';

export interface IGymEquipmentCategoryRepository {
    create(data: Partial<IGymEquipmentCategory>): Promise<IGymEquipmentCategory>;
    findByGymId(gymId: string): Promise<IGymEquipmentCategory[]>;
    findById(id: string): Promise<IGymEquipmentCategory | null>;
    findByGymIdAndName(gymId: string, name: string): Promise<IGymEquipmentCategory | null>;
    update(id: string, data: Partial<IGymEquipmentCategory>): Promise<IGymEquipmentCategory | null>;
    delete(id: string): Promise<void>;
}
