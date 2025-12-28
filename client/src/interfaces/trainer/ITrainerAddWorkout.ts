import type { Exercise, WgerExerciseSuggestion, WgerExerciseInfo } from "./ITrainerAddSession";

export type { Exercise, WgerExerciseSuggestion, WgerExerciseInfo };

export interface WorkoutSession {
    _id: string;
    name: string;
    givenBy: "trainer" | "user";
    trainerId?: string;
    date: string;
    time: string;
    exercises: Exercise[];
    goal?: string;
    notes?: string;
}

export interface WorkoutDay {
    _id: string;
    userId: string;
    date: string;
    sessions: WorkoutSession[];
}
