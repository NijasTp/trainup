import { IWorkoutTemplate } from "../../../models/workoutTemplate.model";
import { FilterQuery } from "mongoose";

export interface IWorkoutTemplateRepository {
    create(template: Partial<IWorkoutTemplate>): Promise<IWorkoutTemplate>;
    findById(id: string): Promise<IWorkoutTemplate | null>;
    update(id: string, update: Partial<IWorkoutTemplate>): Promise<IWorkoutTemplate | null>;
    delete(id: string): Promise<void>;
    find(query: FilterQuery<IWorkoutTemplate>, page: number, limit: number): Promise<{
        templates: IWorkoutTemplate[];
        total: number;
        page: number;
        totalPages: number;
    }>;
}
