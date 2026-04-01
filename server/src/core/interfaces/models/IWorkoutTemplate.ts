import { Document, Types } from "mongoose";

export interface IWorkoutTemplateExercise {
    exerciseId: string;
    name: string;
    image?: string;
    sets: number;
    reps?: string;
    weight?: string;
    rest?: string;
    notes?: string;
}

export interface IWorkoutTemplateDay {
    dayNumber: number;
    exercises: IWorkoutTemplateExercise[];
}

export interface IWorkoutTemplate extends Document {
    _id: Types.ObjectId;
    title: string;
    description: string;
    image: string;
    type: 'one-time' | 'series';
    repetitions: number;
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    requiredEquipment: string[];
    isPublic: boolean;
    popularityCount: number;
    averageRating: number;
    reviewCount: number;
    days: IWorkoutTemplateDay[];
    createdById: Types.ObjectId | string;
    createdByType: 'Admin' | 'Trainer' | 'Gym';
    gymId?: Types.ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
}
