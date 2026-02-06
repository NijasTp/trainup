import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGymEquipment extends Document {
    _id: Types.ObjectId;
    gymId: Types.ObjectId;
    name: string;
    image: string | null;
    categoryId: Types.ObjectId;
    available: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const gymEquipmentSchema: Schema<IGymEquipment> = new Schema(
    {
        gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
        name: { type: String, required: true, trim: true },
        image: { type: String, default: null },
        categoryId: { type: Schema.Types.ObjectId, ref: 'GymEquipmentCategory', required: true },
        available: { type: Boolean, default: true },
    },
    { timestamps: true }
);

gymEquipmentSchema.index({ gymId: 1 });
gymEquipmentSchema.index({ categoryId: 1 });

export const GymEquipmentModel = mongoose.model<IGymEquipment>(
    'GymEquipment',
    gymEquipmentSchema
);
