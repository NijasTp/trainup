import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
    userId: mongoose.Types.ObjectId;
    targetId: mongoose.Types.ObjectId;
    targetModel: 'Trainer' | 'Gym';
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        targetId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'targetModel' },
        targetModel: { type: String, required: true, enum: ['Trainer', 'Gym'] },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
    },
    { timestamps: true }
);

// Prevent duplicate reviews from same user to same target
ReviewSchema.index({ userId: 1, targetId: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', ReviewSchema);
