import { injectable } from 'inversify';
import { IGymEquipmentRepository } from '../core/interfaces/repositories/IGymEquipmentRepository';
import { IGymEquipment, GymEquipmentModel } from '../models/gymEquipment.model';

@injectable()
export class GymEquipmentRepository implements IGymEquipmentRepository {
    async create(data: Partial<IGymEquipment>): Promise<IGymEquipment> {
        const equipment = new GymEquipmentModel(data);
        return await equipment.save();
    }

    async findByGymId(gymId: string): Promise<IGymEquipment[]> {
        return await GymEquipmentModel.find({ gymId })
            .populate('categoryId', 'name')
            .sort({ name: 1 });
    }

    async findById(id: string): Promise<IGymEquipment | null> {
        return await GymEquipmentModel.findById(id).populate('categoryId', 'name');
    }

    async findByGymIdAndCategory(gymId: string, categoryId: string): Promise<IGymEquipment[]> {
        return await GymEquipmentModel.find({ gymId, categoryId })
            .populate('categoryId', 'name')
            .sort({ name: 1 });
    }

    async update(id: string, data: Partial<IGymEquipment>): Promise<IGymEquipment | null> {
        return await GymEquipmentModel.findByIdAndUpdate(id, data, { new: true })
            .populate('categoryId', 'name');
    }

    async delete(id: string): Promise<void> {
        await GymEquipmentModel.findByIdAndDelete(id);
    }

    async updateAvailability(id: string, available: boolean): Promise<IGymEquipment | null> {
        return await GymEquipmentModel.findByIdAndUpdate(id, { available }, { new: true })
            .populate('categoryId', 'name');
    }
}
