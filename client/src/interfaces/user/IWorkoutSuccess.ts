export interface ExerciseTime {
    exerciseId: string;
    name: string;
    duration: number;
}

export interface LocationState {
    exerciseTimes: ExerciseTime[];
    totalWorkoutTime: number;
    isDone: boolean;
}
