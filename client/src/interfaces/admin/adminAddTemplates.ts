export interface IExercise {
    exerciseId: string;
    name: string;
    image?: string;
    sets: number;
    reps?: string;
    weight?: string;
    rest?: string;
    notes?: string;
}

export interface IWorkoutTemplateDay {
    dayNumber: number;
    exercises: IExercise[];
}

export interface IWorkoutTemplate {
    _id?: string;
    title: string;
    description: string;
    image: string;
    type: 'one-time' | 'series';
    repetitions: number;
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    requiredEquipment: string[];
    isPublic: boolean;
    days: IWorkoutTemplateDay[];
    createdById?: string;
    createdByType?: 'Admin' | 'Trainer' | 'Gym';
    gymId?: string;
}

export interface WgerExerciseData {
    id: number;
    base_id: number;
    name: string;
    category: string;
    image: string | null;
    image_thumbnail: string | null;
}

export interface WgerExercise {
    value: string;
    data: WgerExerciseData;
}
