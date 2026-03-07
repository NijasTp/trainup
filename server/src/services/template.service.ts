import { inject, injectable } from "inversify";
import TYPES from "../core/types/types";
import { ITemplateService } from "../core/interfaces/services/ITemplateService";
import { IWorkoutTemplateRepository } from "../core/interfaces/repositories/IWorkoutTemplateRepository";
import { ITemplateRepository as IDietTemplateRepository } from "../core/interfaces/repositories/IDietTemplateRepository";
import { IUserRepository } from "../core/interfaces/repositories/IUserRepository";
import {
    CreateWorkoutTemplateRequestDto,
    WorkoutTemplateResponseDto,
    CreateDietTemplateRequestDto,
    DietTemplateResponseDto,
    TemplateQueryDto,
    PaginatedWorkoutTemplatesDto,
    PaginatedDietTemplatesDto
} from "../dtos/template.dto";
import { IWorkoutTemplate } from "../models/workoutTemplate.model";
import { IDietTemplate } from "../models/dietTemplate.model";
import { WorkoutSnapshotModel } from "../models/workoutSnapshot.model";
import { DietSnapshotModel } from "../models/dietSnapshot.model";
import { AppError } from "../utils/appError.util";
import { STATUS_CODE } from "../constants/status";
import { FilterQuery } from "mongoose";

@injectable()
export class TemplateService implements ITemplateService {
    constructor(
        @inject(TYPES.WorkoutTemplateRepository) private _workoutTemplateRepo: IWorkoutTemplateRepository,
        @inject(TYPES.ITemplateRepository) private _dietTemplateRepo: IDietTemplateRepository,
        @inject(TYPES.IUserRepository) private _userRepo: IUserRepository
    ) { }

    // Workout Templates
    async createWorkoutTemplate(adminId: string, dto: CreateWorkoutTemplateRequestDto): Promise<WorkoutTemplateResponseDto> {
        const template = await this._workoutTemplateRepo.create({
            ...dto,
            createdById: dto.createdById || adminId,
            createdByType: dto.createdByType || 'Admin'
        });
        return this.mapWorkoutToDto(template);
    }

    async updateWorkoutTemplate(id: string, dto: Partial<CreateWorkoutTemplateRequestDto>): Promise<WorkoutTemplateResponseDto> {
        const updated = await this._workoutTemplateRepo.update(id, dto);
        if (!updated) throw new AppError("Template not found", STATUS_CODE.NOT_FOUND);
        return this.mapWorkoutToDto(updated);
    }

    async deleteWorkoutTemplate(id: string): Promise<void> {
        await this._workoutTemplateRepo.delete(id);
    }

    async getWorkoutTemplate(id: string): Promise<WorkoutTemplateResponseDto | null> {
        const template = await this._workoutTemplateRepo.findById(id);
        return template ? this.mapWorkoutToDto(template) : null;
    }

    async listWorkoutTemplates(query: TemplateQueryDto): Promise<PaginatedWorkoutTemplatesDto> {
        const filter: FilterQuery<IWorkoutTemplate> = {};
        if (query.search) filter.title = { $regex: query.search, $options: "i" };
        if (query.difficultyLevel) filter.difficultyLevel = query.difficultyLevel;
        if (query.type) filter.type = query.type;
        if (query.goal) filter.goal = query.goal;
        if (query.createdById) filter.createdById = query.createdById;

        // If not admin/authenticated specifically for a search, 
        // normally we'd restrict by isPublic or Gym here.
        // We'll add those filters if query.gymId is present or for general user view.
        if (query.gymId) {
            filter.$or = [
                { isPublic: true },
                { gymId: query.gymId }
            ];
        } else {
            filter.isPublic = true;
        }

        const result = await this._workoutTemplateRepo.find(filter, query.page || 1, query.limit || 10);
        return {
            templates: result.templates.map(t => this.mapWorkoutToDto(t)),
            total: result.total,
            page: result.page,
            totalPages: result.totalPages
        };
    }

    // Diet Templates
    async createDietTemplate(creatorId: string, dto: CreateDietTemplateRequestDto): Promise<DietTemplateResponseDto> {
        const template = await this._dietTemplateRepo.create({
            ...dto,
            createdById: dto.createdById || creatorId,
            createdByType: dto.createdByType || 'Admin'
        });
        return this.mapDietToDto(template);
    }

    async updateDietTemplate(id: string, dto: Partial<CreateDietTemplateRequestDto>): Promise<DietTemplateResponseDto> {
        const updated = await this._dietTemplateRepo.update(id, dto);
        if (!updated) throw new AppError("Template not found", STATUS_CODE.NOT_FOUND);
        return this.mapDietToDto(updated);
    }

    async deleteDietTemplate(id: string): Promise<void> {
        await this._dietTemplateRepo.delete(id);
    }

    async getDietTemplate(id: string): Promise<DietTemplateResponseDto | null> {
        const template = await this._dietTemplateRepo.getById(id);
        return template ? this.mapDietToDto(template) : null;
    }

    async listDietTemplates(query: TemplateQueryDto): Promise<PaginatedDietTemplatesDto> {
        const filter: FilterQuery<IDietTemplate> = {};
        if (query.search) filter.title = { $regex: query.search, $options: "i" };
        if (query.goal) filter.goal = query.goal;
        if (query.bodyType) filter.bodyType = query.bodyType;
        if (query.createdById) filter.createdById = query.createdById;

        if (query.gymId) {
            filter.$or = [
                { isPublic: true },
                { gymId: query.gymId }
            ];
        } else {
            filter.isPublic = true;
        }

        const result = await this._dietTemplateRepo.find(filter, query.page || 1, query.limit || 10);
        return {
            templates: result.templates.map(t => this.mapDietToDto(t)),
            total: result.total,
            page: result.page,
            totalPages: result.totalPages
        };
    }

    // User Template Management
    async startWorkoutTemplate(userId: string, templateId: string): Promise<void> {
        const template = await this._workoutTemplateRepo.findById(templateId);
        if (!template) throw new AppError("Template not found", STATUS_CODE.NOT_FOUND);

        // Create a snapshot to freeze the workout data
        const snapshot = await WorkoutSnapshotModel.create({
            userId: userId,
            originalTemplateId: template._id,
            title: template.title,
            description: template.description || "",
            image: template.image,
            type: template.type,
            repetitions: template.repetitions,
            difficultyLevel: template.difficultyLevel,
            requiredEquipment: template.requiredEquipment,
            days: template.days,
            startDate: new Date(),
            status: 'active'
        });

        await this._userRepo.updateUser(userId, {
            activeWorkoutTemplate: snapshot._id as any, // Link to snapshot instead of original template
            workoutTemplateStartDate: new Date()
        });

        // Increment popularity count
        await this._workoutTemplateRepo.update(templateId, {
            popularityCount: (template.popularityCount || 0) + 1
        });
    }

    async stopWorkoutTemplate(userId: string): Promise<void> {
        await this._userRepo.updateUser(userId, {
            activeWorkoutTemplate: null,
            workoutTemplateStartDate: null
        });
    }

    async startDietTemplate(userId: string, templateId: string): Promise<void> {
        const template = await this._dietTemplateRepo.getById(templateId);
        if (!template) throw new AppError("Template not found", STATUS_CODE.NOT_FOUND);

        // Create snapshot
        const snapshot = await DietSnapshotModel.create({
            userId: userId,
            originalTemplateId: template._id,
            title: template.title,
            description: template.description || "",
            image: template.image,
            duration: template.duration,
            goal: template.goal,
            bodyType: template.bodyType,
            days: template.days,
            startDate: new Date(),
            status: 'active'
        });

        await this._userRepo.updateUser(userId, {
            activeDietTemplate: snapshot._id as any,
            dietTemplateStartDate: new Date()
        });

        // Increment popularity
        await this._dietTemplateRepo.update(templateId, {
            popularityCount: (template.popularityCount || 0) + 1
        });
    }

    async stopDietTemplate(userId: string): Promise<void> {
        await this._userRepo.updateUser(userId, {
            activeDietTemplate: null,
            dietTemplateStartDate: null
        });
    }

    private mapWorkoutToDto(t: IWorkoutTemplate): WorkoutTemplateResponseDto {
        return {
            _id: t._id.toString(),
            title: t.title,
            description: t.description || "",
            image: t.image,
            type: t.type,
            repetitions: t.repetitions,
            difficultyLevel: t.difficultyLevel,
            requiredEquipment: t.requiredEquipment,
            isPublic: t.isPublic,
            popularityCount: t.popularityCount,
            days: t.days as any,
            createdById: t.createdById.toString(),
            createdByType: t.createdByType,
            gymId: t.gymId?.toString(),
            createdAt: t.createdAt,
            updatedAt: t.updatedAt
        };
    }

    private mapDietToDto(t: IDietTemplate): DietTemplateResponseDto {
        return {
            _id: t._id.toString(),
            title: t.title,
            description: t.description || "",
            image: t.image,
            duration: t.duration,
            goal: t.goal,
            bodyType: t.bodyType,
            days: t.days,
            isPublic: t.isPublic,
            popularityCount: t.popularityCount,
            createdById: t.createdById?.toString() || "",
            createdByType: t.createdByType,
            gymId: t.gymId?.toString(),
            createdAt: t.createdAt,
            updatedAt: t.updatedAt
        };
    }
}
