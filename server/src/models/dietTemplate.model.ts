import { Schema, model, Document, Types } from "mongoose";

export interface TemplateMeal {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  time: string; // HH:mm
  nutritions?: { label: string; value: number; unit?: string }[];
  notes?: string;
}

export interface ITemplate extends Document {
  _id: Types.ObjectId | string;
  title: string;
  description?: string;
  createdBy: Types.ObjectId | string; 
  meals: TemplateMeal[];
  createdAt: Date;
  updatedAt: Date;
}

const TemplateMealSchema = new Schema<TemplateMeal>(
  {
    name: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: Number,
    carbs: Number,
    fats: Number,
    time: { type: String, required: true },
    nutritions: { type: [{ label: String, value: Number, unit: String }], default: [] },
    notes: String,
  },
  { _id: true }
);

const TemplateSchema = new Schema<ITemplate>(
  {
    title: { type: String, required: true },
    description: String,
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    meals: { type: [TemplateMealSchema], default: [] },
  },
  { timestamps: true }
);

export const TemplateModel = model<ITemplate>("DietTemplate", TemplateSchema);
