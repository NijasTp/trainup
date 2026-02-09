import mongoose, { Schema, Document } from 'mongoose';

export interface IAuthGymTemp extends Document {
    email: string;
    otp: string;
    expiresAt: Date;
    verified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AuthGymTempSchema: Schema<IAuthGymTemp> = new Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        otp: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        verified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Auto-delete expired records
AuthGymTempSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AuthGymTempModel = mongoose.model<IAuthGymTemp>('AuthGymTemp', AuthGymTempSchema);
