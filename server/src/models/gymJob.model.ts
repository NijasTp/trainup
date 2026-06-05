import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInterestedTrainer {
    trainerId: Types.ObjectId | string;
    appliedAt: Date;
    isPinned: boolean;
}

export interface IGymJob extends Document {
    _id: Types.ObjectId | string;
    gymId: Types.ObjectId | string;
    title: string;
    description: string;
    requirements: string[];
    salary: string;
    type: 'Trainer' | 'Staff' | 'Manager';
    location: 'On-site' | 'Remote' | 'Hybrid';
    isActive: boolean;
    interestedTrainers?: IInterestedTrainer[];
    createdAt: Date;
    updatedAt: Date;
}

const gymJobSchema: Schema<IGymJob> = new Schema(
    {
        gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        requirements: { type: [String], default: [] },
        salary: { type: String },
        type: {
            type: String,
            enum: ['Trainer', 'Staff', 'Manager'],
            default: 'Trainer',
        },
        location: {
            type: String,
            enum: ['On-site', 'Remote', 'Hybrid'],
            default: 'On-site',
        },
        isActive: { type: Boolean, default: true },
        interestedTrainers: [{
            trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer', required: true },
            appliedAt: { type: Date, default: Date.now },
            isPinned: { type: Boolean, default: false }
        }]
    },
    { timestamps: true }
);

export const GymJobModel = mongoose.model<IGymJob>('GymJob', gymJobSchema);
