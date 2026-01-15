export interface IExercise {
    exerciseId: string;
    name: string;
    image?: string;
    sets: number;
    reps?: string;
}

export interface IWorkoutTemplateDay {
    dayNumber: number;
    exercises: IExercise[];
}

export interface IWorkoutTemplate {
    _id?: string;
    title: string;
    description: string;
    duration: number;
    goal: string;
    equipment: boolean;
    days: IWorkoutTemplateDay[];
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
    image?: string;
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
