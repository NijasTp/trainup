import { Schema, model, Document, ObjectId, Types } from "mongoose";

export interface IGym extends Document {
    _id: ObjectId;
    role: 'gym'
    name: string | null;
    email: string | null;
    password: string | null;
    announcements: { title: string; message: string; date: Date }[];
    location: string | null;
    certificate: string;
    verifyStatus: 'pending' | 'approved' | 'rejected';
    rejectReason: string | null;
    isBanned:boolean;
    tokenVersion?:number;
    trainers?: Types.ObjectId[] | null;
    members?: Types.ObjectId[] | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    images: string[] | null;
    profileImage: string | null;
}

const GymSchema = new Schema<IGym>({
    role: { type: String, enum: ["gym"], default: "gym" },
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    announcements: [{
        title: String,
        message: String,
        date: { type: Date, default: Date.now }
    }],
    location: { type: String },
    verifyStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    rejectReason: { type: String },
    isBanned: { type: Boolean, default: false },
    tokenVersion: { type: Number, default: 0 },
    certificate: { type: String },
    trainers: [{ type: Schema.Types.ObjectId, ref: "Trainer" }],
    members: [{ type: Schema.Types.ObjectId, ref: "Member" }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    images: [{ type: String }],
    profileImage: { type: String, default: null }
});

export const GymModel = model<IGym>("Gym", GymSchema);