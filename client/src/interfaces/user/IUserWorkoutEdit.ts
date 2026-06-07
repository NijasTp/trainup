import type { IExerciseDb } from "../exercise/IExerciseDb";

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
    exerciseId?: string;
    gifUrl?: string;
    bodyParts?: string[];
    targetMuscles?: string[];
    secondaryMuscles?: string[];
    equipments?: string[];
    instructions?: string[];
    description?: string;
    exerciseData?: SafeAny;
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
    data: IExerciseDb;
}

export type WgerExerciseInfo = IExerciseDb;
