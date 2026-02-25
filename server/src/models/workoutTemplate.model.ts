import { Document, model, Schema, Types } from "mongoose";

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
    image: string; // Mandatory
    type: 'one-time' | 'series';
    durationDays: number; // e.g., 7, 14, 30
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    requiredEquipment: string[];
    isPublic: boolean;
    popularityCount: number;
    days: IWorkoutTemplateDay[];
    createdById: Types.ObjectId | string;
    createdByType: 'Admin' | 'Trainer' | 'Gym';
    gymId?: Types.ObjectId | string; // Optional context
    createdAt: Date;
    updatedAt: Date;
}


const ExerciseSchema = new Schema<IWorkoutTemplateExercise>(
    {
        exerciseId: { type: String, required: true },
        name: { type: String, required: true },
        image: { type: String },
        sets: { type: Number, required: true },
        reps: { type: String },
        weight: { type: String },
        rest: { type: String },
        notes: { type: String },
    },
    { _id: false }
);


const DaySchema = new Schema<IWorkoutTemplateDay>(
    {
        dayNumber: { type: Number, required: true },
        exercises: { type: [ExerciseSchema], default: [] },
    },
    { _id: false }
);

const WorkoutTemplateSchema = new Schema<IWorkoutTemplate>(
    {
        title: { type: String, required: true },
        description: { type: String },
        image: { type: String, required: true },
        type: { type: String, enum: ['one-time', 'series'], required: true },
        durationDays: { type: Number, required: true },
        difficultyLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
        requiredEquipment: { type: [String], default: [] },
        isPublic: { type: Boolean, default: false },
        popularityCount: { type: Number, default: 0 },
        days: { type: [DaySchema], default: [] },
        createdById: { type: Schema.Types.ObjectId, required: true, refPath: 'createdByType' },
        createdByType: { type: String, required: true, enum: ['Admin', 'Trainer', 'Gym'] },
        gymId: { type: Schema.Types.ObjectId, ref: 'Gym' }
    },
    { timestamps: true }
);


export default model<IWorkoutTemplate>("WorkoutTemplate", WorkoutTemplateSchema);
