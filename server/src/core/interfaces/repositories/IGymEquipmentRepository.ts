import { IGymEquipment } from '../../../models/gymEquipment.model';

export interface IGymEquipmentRepository {
    create(data: Partial<IGymEquipment>): Promise<IGymEquipment>;
    findByGymId(gymId: string): Promise<IGymEquipment[]>;
    findById(id: string): Promise<IGymEquipment | null>;
    findByGymIdAndCategory(gymId: string, categoryId: string): Promise<IGymEquipment[]>;
    update(id: string, data: Partial<IGymEquipment>): Promise<IGymEquipment | null>;
    delete(id: string): Promise<void>;
    updateAvailability(id: string, available: boolean): Promise<IGymEquipment | null>;
}
