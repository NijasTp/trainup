import { Schema, model, Document, Types } from "mongoose";

export interface IDietTemplateMeal {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  time: string; // HH:mm
  notes?: string;
}

export interface IDietTemplateDay {
  dayNumber: number;
  meals: IDietTemplateMeal[];
}

export interface IDietTemplate extends Document {
  _id: Types.ObjectId | string;
  title: string;
  description?: string;
  image: string; // Mandatory
  duration: number; // e.g., 7 or 14
  goal: string;
  bodyType: string;
  days: IDietTemplateDay[];
  isPublic: boolean;
  popularityCount: number;
  averageRating: number;
  reviewCount: number;
  createdById: Types.ObjectId | string;
  createdByType: 'Admin' | 'Trainer' | 'Gym';
  gymId?: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const MealSchema = new Schema<IDietTemplateMeal>(
  {
    name: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: Number,
    carbs: Number,
    fats: Number,
    time: { type: String, required: true },
    notes: String,
  },
  { _id: false }
);

const DaySchema = new Schema<IDietTemplateDay>(
  {
    dayNumber: { type: Number, required: true },
    meals: { type: [MealSchema], default: [] },
  },
  { _id: false }
);

const DietTemplateSchema = new Schema<IDietTemplate>(
  {
    title: { type: String, required: true },
    description: String,
    image: { type: String, required: true },
    duration: { type: Number, required: true },
    goal: { type: String, required: true },
    bodyType: { type: String, required: true },
    days: { type: [DaySchema], default: [] },
    isPublic: { type: Boolean, default: false },
    popularityCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    createdById: { type: Schema.Types.ObjectId, required: true, refPath: 'createdByType' },
    createdByType: { type: String, required: true, enum: ['Admin', 'Trainer', 'Gym'] },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym' }
  },
  { timestamps: true }
);

export const DietTemplateModel = model<IDietTemplate>("DietTemplate", DietTemplateSchema);
