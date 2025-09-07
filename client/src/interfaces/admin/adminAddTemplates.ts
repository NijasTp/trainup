export interface IExercise {
    name: string;
    sets: number;
    reps: string;
    weight: string;
}

export interface IWorkoutTemplate {
    name: string;
    goal?: string;
    notes?: string;
    exercises: IExercise[];
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
