export interface Exercise {
    id: string;
    name: string;
    sets: number;
    reps: string;
    weight?: number;
    image?: string;
}

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
