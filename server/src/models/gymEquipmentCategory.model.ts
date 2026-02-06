import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGymEquipmentCategory extends Document {
    _id: Types.ObjectId;
    gymId: Types.ObjectId;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

const gymEquipmentCategorySchema: Schema<IGymEquipmentCategory> = new Schema(
    {
        gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
        name: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

gymEquipmentCategorySchema.index({ gymId: 1, name: 1 }, { unique: true });

export const GymEquipmentCategoryModel = mongoose.model<IGymEquipmentCategory>(
    'GymEquipmentCategory',
    gymEquipmentCategorySchema
);
