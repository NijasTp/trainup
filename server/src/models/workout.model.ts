
import { Document, model, Schema, Types } from "mongoose";

export interface IExercise {
  id: string;
  name: string;
  image?: string;
  sets: number;
  reps?: string;
  time?: string;
  timeTaken?: number;
}

export interface IWorkoutSession extends Document {
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
  name: string;
  givenBy: "trainer" | "user" | "admin";
  trainerId?: Types.ObjectId | string;
  userId?: Types.ObjectId | string;
  date?: string;
  time?: string;
  exercises: IExercise[];
  goal?: string;
  notes?: string;
  isDone?: boolean;
  completedAt?: Date;
}

const ExerciseSchema = new Schema<IExercise>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String },
    sets: { type: Number, required: true },
    reps: { type: String },
    time: { type: String },
    timeTaken: { type: Number },
  },
  { _id: false }
);

const WorkoutSessionSchema = new Schema<IWorkoutSession>(
  {

    name: { type: String, required: true },
    givenBy: { type: String, enum: ["trainer", "user", "admin"], required: true },
    trainerId: { type: Schema.Types.ObjectId, ref: "Trainer" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    date: { type: String },
    time: { type: String },
    exercises: { type: [ExerciseSchema], default: [] },
    goal: { type: String },
    notes: { type: String },
    isDone: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default model<IWorkoutSession>("WorkoutSession", WorkoutSessionSchema);