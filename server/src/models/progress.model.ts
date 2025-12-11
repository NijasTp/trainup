import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProgress extends Document {
    userId: Types.ObjectId;
    date: Date;
    photos: string[];
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ProgressSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    photos: [{ type: String }],
    notes: { type: String },
}, {
    timestamps: true
});

// Index for efficient querying by user and date
ProgressSchema.index({ userId: 1, date: 1 });

export const Progress = mongoose.model<IProgress>('Progress', ProgressSchema);
