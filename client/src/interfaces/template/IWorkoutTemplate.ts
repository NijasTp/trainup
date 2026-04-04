export interface IWorkoutTemplateExercise {
    exerciseId: string;
    name: string;
    image?: string;
    sets: number;
    reps?: string;
    weight?: string;
    time?: string;
}

export interface IWorkoutTemplateDay {
    dayNumber: number;
    name?: string;
    exercises: IWorkoutTemplateExercise[];
}

export interface IWorkoutTemplate {
    _id: string;
    title: string;
    description: string;
    image: string;
    type: 'one-time' | 'series';
    repetitions: number;
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    goal?: string;
    requiredEquipment: string[];
    isPublic: boolean;
    popularityCount: number;
    averageRating: number;
    reviewCount: number;
    days: IWorkoutTemplateDay[];
    createdById: string;
    createdByType: 'Admin' | 'Trainer' | 'Gym';
    gymId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface WorkoutTemplatesResponse {
    templates: IWorkoutTemplate[];
    total: number;
    totalPages: number;
}
