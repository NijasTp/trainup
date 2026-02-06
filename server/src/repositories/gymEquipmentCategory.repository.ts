import { injectable } from 'inversify';
import { IGymEquipmentCategoryRepository } from '../core/interfaces/repositories/IGymEquipmentCategoryRepository';
import { IGymEquipmentCategory, GymEquipmentCategoryModel } from '../models/gymEquipmentCategory.model';

@injectable()
export class GymEquipmentCategoryRepository implements IGymEquipmentCategoryRepository {
    async create(data: Partial<IGymEquipmentCategory>): Promise<IGymEquipmentCategory> {
        const category = new GymEquipmentCategoryModel(data);
        return await category.save();
    }

    async findByGymId(gymId: string): Promise<IGymEquipmentCategory[]> {
        return await GymEquipmentCategoryModel.find({ gymId }).sort({ name: 1 });
    }

    async findById(id: string): Promise<IGymEquipmentCategory | null> {
        return await GymEquipmentCategoryModel.findById(id);
    }

    async findByGymIdAndName(gymId: string, name: string): Promise<IGymEquipmentCategory | null> {
        return await GymEquipmentCategoryModel.findOne({ gymId, name: { $regex: new RegExp(`^${name}$`, 'i') } });
    }

    async update(id: string, data: Partial<IGymEquipmentCategory>): Promise<IGymEquipmentCategory | null> {
        return await GymEquipmentCategoryModel.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<void> {
        await GymEquipmentCategoryModel.findByIdAndDelete(id);
    }
}
