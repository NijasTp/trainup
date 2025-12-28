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
    isDone?: boolean;
    timeTaken?: number;
}

export interface IWorkoutSession {
    _id: string;
    name: string;
    givenBy: "trainer" | "user";
    trainerId?: string;
    userId: string;
    date?: string;
    time?: string;
    exercises: IExercise[];
    tags?: string[];
    goal?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ExerciseTime {
    exerciseId: string;
    name: string;
    duration: number;
}
