import { Document, model, Schema, Types } from "mongoose";

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
    exercises: IWorkoutTemplateExercise[];
}

export interface IWorkoutTemplate extends Document {
    _id: Types.ObjectId;
    title: string;
    description: string;
    duration: number; // e.g., 7 or 14
    goal: string;
    equipment: boolean;
    bodyType: string;
    days: IWorkoutTemplateDay[];
    createdBy: Types.ObjectId | string;
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
        time: { type: String },
        allowWeight: { type: Boolean, default: false },
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
        duration: { type: Number, required: true },
        goal: { type: String, required: true },
        equipment: { type: Boolean, default: false },
        bodyType: { type: String, required: true },
        days: { type: [DaySchema], default: [] },
        createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    },
    { timestamps: true }
);

export default model<IWorkoutTemplate>("WorkoutTemplate", WorkoutTemplateSchema);
