import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWgerExercise extends Document {
  wgerId: number;
  name: string;
  category: string;
  image: string;
  image_thumbnail: string;
  rawData: any;
  createdAt: Date;
  updatedAt: Date;
}

const wgerExerciseSchema: Schema<IWgerExercise> = new Schema(
  {
    wgerId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, default: "" },
    image_thumbnail: { type: String, default: "" },
    rawData: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const WgerExerciseModel: Model<IWgerExercise> = mongoose.model<IWgerExercise>("WgerExercise", wgerExerciseSchema);
