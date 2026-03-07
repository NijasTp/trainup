import mongoose, { Schema, Document, Types } from "mongoose";

export interface IDietSnapshot extends Document {
    userId: Types.ObjectId;
    originalTemplateId: Types.ObjectId;
    title: string;
    description?: string;
    image: string;
    duration: number;
    goal: string;
    bodyType: string;
    days: Array<{
        dayNumber: number;
        meals: Array<{
            name: string;
            calories: number;
            protein?: number;
            carbs?: number;
            fats?: number;
            time: string;
            notes?: string;
        }>;
    }>;
    startDate: Date;
    status: 'active' | 'completed' | 'abandoned';
    createdAt: Date;
    updatedAt: Date;
}

const DietSnapshotSchema = new Schema<IDietSnapshot>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    originalTemplateId: { type: Schema.Types.ObjectId, ref: 'DietTemplate', required: true },
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    duration: { type: Number, required: true },
    goal: { type: String },
    bodyType: { type: String },
    days: [{
        dayNumber: Number,
        meals: [{
            name: String,
            calories: Number,
            protein: Number,
            carbs: Number,
            fats: Number,
            time: String,
            notes: String
        }]
    }],
    startDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' }
}, { timestamps: true });

export const DietSnapshotModel = mongoose.model<IDietSnapshot>("DietSnapshot", DietSnapshotSchema);
