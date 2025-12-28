export interface Exercise {
    id: string;
    name: string;
    sets: number;
    reps: string;
    weight?: number;
    image?: string;
    timeTaken?: number;
}

export interface WorkoutSession {
    _id: string;
    name: string;
    givenBy: "trainer" | "user" | "admin";
    trainerId?: string;
    date: string;
    time: string;
    exercises: Exercise[];
    goal?: string;
    notes?: string;
    isDone?: boolean;
}

export interface WorkoutDay {
    _id: string;
    userId: string;
    date: string;
    sessions: WorkoutSession[];
}
