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
        const template = await this._workoutTemplateRepo.create({ ...dto, createdBy: adminId });
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
        if (query.goal) filter.goal = query.goal;
        if (query.equipment !== undefined) filter.equipment = query.equipment;
        if (query.bodyType) filter.bodyType = query.bodyType;

        const result = await this._workoutTemplateRepo.find(filter, query.page || 1, query.limit || 10);
        return {
            templates: result.templates.map(t => this.mapWorkoutToDto(t)),
            total: result.total,
            page: result.page,
            totalPages: result.totalPages
        };
    }

    // Diet Templates
    async createDietTemplate(adminId: string, dto: CreateDietTemplateRequestDto): Promise<DietTemplateResponseDto> {
        const template = await this._dietTemplateRepo.create({ ...dto, createdBy: adminId });
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

        await this._userRepo.updateUser(userId, {
            activeWorkoutTemplate: template._id,
            workoutTemplateStartDate: new Date()
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

        await this._userRepo.updateUser(userId, {
            activeDietTemplate: template._id,
            dietTemplateStartDate: new Date()
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
            duration: t.duration,
            goal: t.goal,
            equipment: t.equipment,
            bodyType: t.bodyType,
            days: t.days,
            createdBy: t.createdBy.toString(),
            createdAt: t.createdAt,
            updatedAt: t.updatedAt
        };
    }

    private mapDietToDto(t: IDietTemplate): DietTemplateResponseDto {
        return {
            _id: t._id.toString(),
            title: t.title,
            description: t.description || "",
            duration: t.duration,
            goal: t.goal,
            bodyType: t.bodyType,
            days: t.days,
            createdBy: t.createdBy?.toString() || "",
            createdAt: t.createdAt,
            updatedAt: t.updatedAt
        };
    }
}
