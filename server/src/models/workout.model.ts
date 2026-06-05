
import { Document, model, Schema, Types } from "mongoose";

export interface ISetDetail {
  setNumber: number;
  duration: number;
  restDuration: number;
}

export interface IExercise {
  id: string;
  name: string;
  image?: string;
  sets: number;
  reps?: string;
  time?: string;
  timeTaken?: number;
  exerciseId?: string;
  gifUrl?: string;
  bodyParts?: string[];
  targetMuscles?: string[];
  secondaryMuscles?: string[];
  equipments?: string[];
  instructions?: string[];
  description?: string;
  exerciseData?: any;
  setDetails?: ISetDetail[];
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
  source: "trainer" | "user" | "admin" | "template" | "gym";
  templateId?: Types.ObjectId | string;
}

const SetDetailSchema = new Schema<ISetDetail>({
  setNumber: { type: Number, required: true },
  duration: { type: Number, required: true },
  restDuration: { type: Number, default: 0 }
}, { _id: false });

const ExerciseSchema = new Schema<IExercise>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String },
    sets: { type: Number, required: true },
    reps: { type: String },
    time: { type: String },
    timeTaken: { type: Number },
    exerciseId: { type: String },
    gifUrl: { type: String, default: "" },
    bodyParts: { type: [String], default: [] },
    targetMuscles: { type: [String], default: [] },
    secondaryMuscles: { type: [String], default: [] },
    equipments: { type: [String], default: [] },
    instructions: { type: [String], default: [] },
    description: { type: String, default: "" },
    exerciseData: { type: Schema.Types.Mixed },
    setDetails: { type: [SetDetailSchema], default: [] },
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
    source: { type: String, enum: ["trainer", "user", "admin", "template", "gym"], default: "user" },
    templateId: { type: Schema.Types.ObjectId, ref: "WorkoutTemplate" },
  },
  { timestamps: true }
);

export default model<IWorkoutSession>("WorkoutSession", WorkoutSessionSchema);