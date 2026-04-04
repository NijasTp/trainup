export class WorkoutTemplateExerciseDto {
    exerciseId: string;
    name: string;
    image?: string;
    sets: number;
    reps?: string;
    weight?: string;
    rest?: string;
    notes?: string;
}

export class WorkoutTemplateDayDto {
    dayNumber: number;
    exercises: WorkoutTemplateExerciseDto[];
}

export class CreateWorkoutTemplateRequestDto {
    title: string;
    description: string;
    image: string;
    type: 'one-time' | 'series';
    repetitions: number;
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    goal?: string;
    requiredEquipment: string[];
    isPublic: boolean;
    days: WorkoutTemplateDayDto[];
    createdById?: string;
    createdByType?: 'Admin' | 'Trainer' | 'Gym';
    gymId?: string;
}

export class WorkoutTemplateResponseDto extends CreateWorkoutTemplateRequestDto {
    _id: string;
    popularityCount: number;
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
    image: string;
    duration: number;
    goal: string;
    bodyType: string;
    isPublic: boolean;
    days: DietTemplateDayDto[];
    createdById?: string;
    createdByType?: 'Admin' | 'Trainer' | 'Gym';
    gymId?: string;
}

export class DietTemplateResponseDto extends CreateDietTemplateRequestDto {
    _id: string;
    popularityCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export class TemplateQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    difficultyLevel?: string;
    type?: string;
    goal?: string;
    bodyType?: string;
    equipment?: boolean;
    createdById?: string;
    gymId?: string;
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
