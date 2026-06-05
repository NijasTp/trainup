export interface SetDetail {
    setNumber: number;
    duration: number;
    restDuration: number;
}

export interface Exercise {
    id: string;
    name: string;
    sets: number;
    reps: string;
    weight?: number;
    image?: string;
    gifUrl?: string;
    timeTaken?: number;
    setDetails?: SetDetail[];
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
    templateDay?: number;
    templateName?: string;
    templateDuration?: number;
}
