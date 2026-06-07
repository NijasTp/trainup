import type { IExerciseDb } from "../exercise/IExerciseDb";

export interface Exercise {
    id: string;
    name: string;
    image?: string;
    sets: number;
    reps?: string;
    weight?: string;
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

export interface WgerExercise {
    value: string;
    data: IExerciseDb;
}

export interface WorkoutTemplate {
    name: string;
    goal: string;
    notes: string;
    exercises: Exercise[];
}
