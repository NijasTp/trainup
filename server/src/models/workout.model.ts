import { Document, model, Schema, Types } from "mongoose";

export interface IExercise {
  id: string; 
  name: string;
  image?: string;
  sets: number;
  reps?: string;
  time?: string;
  rest?: string;
  notes?: string;
}

export interface IWorkoutSession extends Document {
  _id: Types.ObjectId;  
  name: string; 
  givenBy: "trainer" | "user";
  trainerId?: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  date?: string;
  time?: string;
  exercises: IExercise[];
  tags?: string[];
  goal?: string;
  notes?: string; // trainer sessions
  createdAt: Date;
  updatedAt: Date;
}




const ExerciseSchema = new Schema<IExercise>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String },
    sets: { type: Number, required: true },
    reps: { type: String },
    time: { type: String },
    rest: { type: String },
    notes: { type: String },
  },
  { _id: false }
);

const WorkoutSessionSchema = new Schema<IWorkoutSession>(
  {
    name: { type: String, required: true },
    givenBy: { type: String, enum: ["trainer", "user"], required: true },
    trainerId: { type: Schema.Types.ObjectId, ref: "Trainer" },
    date: { type: String },
    time: { type: String },
    exercises: { type: [ExerciseSchema], default: [] },
    tags: { type: [String], default: [] },
    goal: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export default model<IWorkoutSession>("WorkoutSession", WorkoutSessionSchema);
