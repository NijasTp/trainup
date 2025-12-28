export interface WgerExerciseSuggestion {
    value: string;
    data: {
        id: string;
        base_id: string;
        name: string;
        category: string;
        image: string;
        image_thumbnail: string;
    };
}

export interface WgerExerciseInfo {
    id: number;
    name: string;
    description: string;
    category: number;
    equipment?: number[];
    images?: { image: string; is_main: boolean }[];
}

export interface Exercise {
    id: string;
    name: string;
    sets: number;
    reps?: string;
    time?: string;
    weight?: number;
    image?: string;
}
