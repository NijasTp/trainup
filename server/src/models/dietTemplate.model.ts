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
  duration: number; // e.g., 7 or 14
  goal: string;
  bodyType: string;
  days: IDietTemplateDay[];
  createdBy: Types.ObjectId | string;
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
    duration: { type: Number, required: true },
    goal: { type: String, required: true },
    bodyType: { type: String, required: true },
    days: { type: [DaySchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
  },
  { timestamps: true }
);

export const DietTemplateModel = model<IDietTemplate>("DietTemplate", DietTemplateSchema);
