export interface IExercise {
    id: string;
    name: string;
    image?: string;
    sets: number;
    weight?: number;
    reps?: string;
    time?: string;
    rest?: string;
    notes?: string;
}

export interface IExerciseUpdate {
    exerciseId: string;
    timeTaken: number;
}

export interface IWorkoutSession {
    _id: string;
    name: string;
    givenBy: "trainer" | "user";
    isDone: boolean;
    trainerId?: string;
    userId: string;
    date?: string;
    time?: string;
    exercises: IExercise[];
    exerciseUpdates?: IExerciseUpdate[];
    tags?: string[];
    goal?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface WgerExerciseSuggestion {
    value: string;
    data: {
        id: string;
        base_id: string;
        name: string;
        category: string;
        image: string;
        image_thumbnail: string;
    };
}

export interface WgerExerciseInfo {
    id: number;
    name: string;
    description: string;
    category: number;
    equipment?: number[];
    images?: { image: string; is_main: boolean }[];
    muscles?: number[];
}
