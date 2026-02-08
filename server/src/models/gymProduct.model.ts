import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGymProduct extends Document {
    _id: Types.ObjectId | string;
    gymId: Types.ObjectId | string;
    name: string;
    description: string;
    price: number;
    category: 'supplements' | 'clothing' | 'accessories';
    subcategory: string;
    stock: number;
    images: string[];
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const gymProductSchema: Schema<IGymProduct> = new Schema(
    {
        gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        category: {
            type: String,
            enum: ['supplements', 'clothing', 'accessories'],
            required: true,
        },
        subcategory: { type: String },
        stock: { type: Number, default: 0 },
        images: { type: [String], default: [] },
        isAvailable: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const GymProductModel = mongoose.model<IGymProduct>('GymProduct', gymProductSchema);
