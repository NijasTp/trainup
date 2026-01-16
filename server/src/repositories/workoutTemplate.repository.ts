import { injectable } from "inversify";
import { FilterQuery } from "mongoose";
import WorkoutTemplateModel, { IWorkoutTemplate } from "../models/workoutTemplate.model";

@injectable()
export class WorkoutTemplateRepository {
    async create(template: Partial<IWorkoutTemplate>): Promise<IWorkoutTemplate> {
        const doc = new WorkoutTemplateModel(template);
        return await doc.save();
    }

    async findById(id: string) {
        return WorkoutTemplateModel.findById(id).lean().exec();
    }

    async update(id: string, update: Partial<IWorkoutTemplate>) {
        return WorkoutTemplateModel.findByIdAndUpdate(id, update, {
            new: true,
        }).exec();
    }

    async delete(id: string) {
        await WorkoutTemplateModel.findByIdAndDelete(id).exec();
    }

    async find(query: FilterQuery<IWorkoutTemplate>, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        const [templates, total] = await Promise.all([
            WorkoutTemplateModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            WorkoutTemplateModel.countDocuments(query).exec(),
        ]);

        return { templates, total, page, totalPages: Math.ceil(total / limit) };
    }
}
