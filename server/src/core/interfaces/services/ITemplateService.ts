import {
    CreateWorkoutTemplateRequestDto,
    WorkoutTemplateResponseDto,
    CreateDietTemplateRequestDto,
    DietTemplateResponseDto,
    TemplateQueryDto,
    PaginatedWorkoutTemplatesDto,
    PaginatedDietTemplatesDto
} from "../../../dtos/template.dto";

export interface ITemplateService {
    // Workout Templates
    createWorkoutTemplate(adminId: string, dto: CreateWorkoutTemplateRequestDto): Promise<WorkoutTemplateResponseDto>;
    updateWorkoutTemplate(id: string, dto: Partial<CreateWorkoutTemplateRequestDto>): Promise<WorkoutTemplateResponseDto>;
    deleteWorkoutTemplate(id: string): Promise<void>;
    getWorkoutTemplate(id: string): Promise<WorkoutTemplateResponseDto | null>;
    listWorkoutTemplates(query: TemplateQueryDto): Promise<PaginatedWorkoutTemplatesDto>;

    // Diet Templates
    createDietTemplate(adminId: string, dto: CreateDietTemplateRequestDto): Promise<DietTemplateResponseDto>;
    updateDietTemplate(id: string, dto: Partial<CreateDietTemplateRequestDto>): Promise<DietTemplateResponseDto>;
    deleteDietTemplate(id: string): Promise<void>;
    getDietTemplate(id: string): Promise<DietTemplateResponseDto | null>;
    listDietTemplates(query: TemplateQueryDto): Promise<PaginatedDietTemplatesDto>;

    // User Template Management
    startWorkoutTemplate(userId: string, templateId: string): Promise<void>;
    stopWorkoutTemplate(userId: string): Promise<void>;
    startDietTemplate(userId: string, templateId: string): Promise<void>;
    stopDietTemplate(userId: string): Promise<void>;
}
