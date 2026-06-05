import mongoose, { Schema, Document, Types } from "mongoose";

export interface IWorkoutSnapshot extends Document {
    userId: Types.ObjectId;
    originalTemplateId: Types.ObjectId;
    title: string;
    description: string;
    image: string;
    type: 'one-time' | 'series';
    repetitions: number;
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    requiredEquipment: string[];
    days: Array<{
        dayNumber: number;
        exercises: Array<{
            exerciseId: string;
            name: string;
            sets: number;
            reps?: string;
            weight?: string;
            rest?: string;
            notes?: string;
            gifUrl?: string;
            bodyParts?: string[];
            targetMuscles?: string[];
            secondaryMuscles?: string[];
            equipments?: string[];
            instructions?: string[];
            description?: string;
            exerciseData?: any;
            setDetails?: Array<{
                setNumber: number;
                duration: number;
                restDuration: number;
            }>;
        }>;
    }>;
    startDate: Date;
    status: 'active' | 'completed' | 'abandoned';
    scheduleType?: 'contiguous' | 'weekly';
    weeklyDays?: number[];
    createdAt: Date;
    updatedAt: Date;
}

const WorkoutSnapshotSchema = new Schema<IWorkoutSnapshot>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    originalTemplateId: { type: Schema.Types.ObjectId, ref: 'WorkoutTemplate', required: true },
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    type: { type: String, enum: ['one-time', 'series'], required: true },
    repetitions: { type: Number, default: 1 },
    difficultyLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
    requiredEquipment: [String],
    days: [{
        dayNumber: Number,
        exercises: [{
            exerciseId: String,
            name: String,
            sets: Number,
            reps: String,
            weight: String,
            rest: String,
            notes: String,
            gifUrl: { type: String, default: "" },
            bodyParts: { type: [String], default: [] },
            targetMuscles: { type: [String], default: [] },
            secondaryMuscles: { type: [String], default: [] },
            equipments: { type: [String], default: [] },
            instructions: { type: [String], default: [] },
            description: { type: String, default: "" },
            exerciseData: { type: Schema.Types.Mixed },
            setDetails: { type: [Schema.Types.Mixed], default: [] }
        }]
    }],
    startDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' },
    scheduleType: { type: String, enum: ['contiguous', 'weekly'], default: 'contiguous' },
    weeklyDays: { type: [Number], default: [] }
}, { timestamps: true });

export const WorkoutSnapshotModel = mongoose.model<IWorkoutSnapshot>("WorkoutSnapshot", WorkoutSnapshotSchema);
