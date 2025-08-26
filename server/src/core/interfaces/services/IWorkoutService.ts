// src/core/interfaces/services/IWorkoutService.ts
import { IWorkoutSession } from "../../../models/workout.model";
import { IWorkoutDay } from "../../../models/workoutDay.model";

export interface IWorkoutService {
  createSession(payload: Partial<IWorkoutSession>): Promise<IWorkoutSession>;
  getSession(id: string): Promise<IWorkoutSession | null>;
  updateSession(id: string, payload: Partial<IWorkoutSession>): Promise<IWorkoutSession | null>;
  deleteSession(id: string): Promise<void>;
  trainerCreateSession(trainerId: string,clientId: string,payload: Partial<IWorkoutSession>): Promise<IWorkoutSession>
  createDay(userId: string, date: string): Promise<IWorkoutDay>;
  addSessionToDay(userId: string, date: string, sessionId: string): Promise<IWorkoutDay | null>;
  getDay(userId: string, date: string): Promise<IWorkoutDay | null>;
}
