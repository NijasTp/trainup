export interface Exercise {
    id: string;
    name: string;
    image?: string;
    sets: number;
    reps?: string;
    weight?: string;
}

export interface WgerExercise {
    value: string;
    data: {
        id: string; // or string | number depending on API
        base_id: string;
        name: string;
        category: string;
        image: string;
        image_thumbnail: string;
    };
}

export interface WorkoutTemplate {
    name: string;
    goal: string;
    notes: string;
    exercises: Exercise[];
}
