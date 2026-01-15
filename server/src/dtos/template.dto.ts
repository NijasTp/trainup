export class WorkoutTemplateExerciseDto {
    exerciseId: string;
    name: string;
    image?: string;
    sets: number;
    reps?: string;
}

export class WorkoutTemplateDayDto {
    dayNumber: number;
    exercises: WorkoutTemplateExerciseDto[];
}

export class CreateWorkoutTemplateRequestDto {
    title: string;
    description: string;
    duration: number;
    goal: string;
    equipment: boolean;
    days: WorkoutTemplateDayDto[];
}

export class WorkoutTemplateResponseDto extends CreateWorkoutTemplateRequestDto {
    _id: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export class DietTemplateMealDto {
    name: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    time: string;
    notes?: string;
}

export class DietTemplateDayDto {
    dayNumber: number;
    meals: DietTemplateMealDto[];
}

export class CreateDietTemplateRequestDto {
    title: string;
    description: string;
    duration: number;
    goal: string;
    bodyType: string;
    days: DietTemplateDayDto[];
}

export class DietTemplateResponseDto extends CreateDietTemplateRequestDto {
    _id: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export class TemplateQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    goal?: string;
    equipment?: boolean;
}

export class PaginatedWorkoutTemplatesDto {
    templates: WorkoutTemplateResponseDto[];
    total: number;
    page: number;
    totalPages: number;
}

export class PaginatedDietTemplatesDto {
    templates: DietTemplateResponseDto[];
    total: number;
    page: number;
    totalPages: number;
}
