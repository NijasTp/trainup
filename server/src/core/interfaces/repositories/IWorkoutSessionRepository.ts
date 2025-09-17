import { IWorkoutSession } from "../../../models/workout.model";
import { Types } from "mongoose";

export interface IWorkoutSessionRepository {
  create(session: Partial<IWorkoutSession>): Promise<IWorkoutSession>;
  findById(id: string | Types.ObjectId): Promise<IWorkoutSession | null>;
  update(id: string, update: Partial<IWorkoutSession>): Promise<IWorkoutSession | null>;
  delete(id: string): Promise<void>;
  findTemplates(filter?: Record<string, unknown>): Promise<IWorkoutSession[]>;
  findAdminTemplates(page?: number, limit?: number, search?: string): Promise<{ templates: IWorkoutSession[], total: number, page: number, totalPages: number }>;
}