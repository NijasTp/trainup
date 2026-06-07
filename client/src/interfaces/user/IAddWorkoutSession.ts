import type { IExerciseDb } from "../exercise/IExerciseDb";

export interface WgerExerciseSuggestion {
    value: string;
    data: IExerciseDb;
}

export type WgerExerciseInfo = IExerciseDb;

export interface AddedExercise {
    id: string;
    name: string;
    sets: number;
    reps?: string;
    time?: string;
    weight?: number;
    image?: string;
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

export interface Exercise {
    id?: string;
    name: string;
    sets?: number;
    reps?: string;
    time?: string;
    weight?: number;
    image?: string;
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

export interface WorkoutSessionPayload {
    name: string;
    givenBy?: "trainer" | "user";
    date?: string;
    time?: string;
    goal?: string;
    notes?: string;
    exercises?: Exercise[];
}
