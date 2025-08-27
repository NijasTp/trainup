import { Schema, model, Document, Types } from "mongoose";

export interface NutritionItem {
  label: string;
  value: number;
  unit?: string;
}

export type MealSource = "user" | "trainer" | "admin";

export interface IMeal {
  _id?: Types.ObjectId;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  time: string; // "HH:mm"
  isEaten: boolean;
  usedBy: Types.ObjectId | string;  
  source: MealSource;               
  sourceId: Types.ObjectId | string; 
  nutritions?: NutritionItem[];
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDietDay extends Document {
  user: Types.ObjectId;
  date: string; // "YYYY-MM-DD"
  meals: IMeal[];
  createdAt: Date;
  updatedAt: Date;
}

const NutritionSchema = new Schema<NutritionItem>(
  {
    label: { type: String, required: true },
    value: { type: Number, required: true },
    unit: { type: String },
  },
  { _id: false }
);

const MealSchema = new Schema<IMeal>(
  {
    name: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fats: { type: Number, default: 0 },
    time: { type: String, required: true }, // HH:mm
    isEaten: { type: Boolean, default: false },
    usedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    source: { type: String, enum: ["user", "trainer", "admin"], required: true },
    sourceId: { type: Schema.Types.ObjectId, required: true },
    nutritions: { type: [NutritionSchema], default: [] },
    notes: { type: String },
  },
  { timestamps: true }
);

const DietDaySchema = new Schema<IDietDay>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    meals: { type: [MealSchema], default: [] },
  },
  { timestamps: true }
);

DietDaySchema.index({ user: 1, date: 1 }, { unique: true });

export const DietDayModel = model<IDietDay>("DietDay", DietDaySchema);
