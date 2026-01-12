export interface IWorkoutTemplateExercise {
    exerciseId: string;
    name: string;
    image?: string;
    sets: number;
    reps?: string;
    time?: string;
    allowWeight: boolean;
}

export interface IWorkoutTemplateDay {
    dayNumber: number;
    name: string;
    workoutName?: string;
    exercises: IWorkoutTemplateExercise[];
}

export interface IWorkoutTemplate {
    _id: string;
    name: string; // The backend uses title, frontend seems to use name? Let's check.
    title: string;
    description: string;
    duration: number;
    goal: string;
    equipment: boolean;
    bodyType: string;
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
    image?: string;
    equipmentNeeded?: string[];
    days: IWorkoutTemplateDay[];
    createdBy: string;
}

export interface WorkoutTemplatesResponse {
    templates: IWorkoutTemplate[];
    total: number;
    totalPages: number;
}
