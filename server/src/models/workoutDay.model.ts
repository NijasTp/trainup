import { Document, model, Schema, Types } from "mongoose";
import { IWorkoutSession } from "./workout.model";

export interface IWorkoutDay extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId|string;
    date: string; // YYYY-MM-DD
    sessions: Types.ObjectId[] | IWorkoutSession[] | string[];
    createdAt: Date;
    updatedAt: Date;
}


const WorkoutDaySchema = new Schema<IWorkoutDay>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        date: {
            type: String,
            required: true
        },
        sessions: [{
            type: Schema.Types.ObjectId,
            ref: "WorkoutSession"
        }],
    },
    {
        timestamps: true
    }
);

export default model<IWorkoutDay>("WorkoutDay", WorkoutDaySchema);