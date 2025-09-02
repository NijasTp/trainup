// src/repositories/WorkoutSessionRepository.ts
import { injectable } from "inversify";
import WorkoutSessionModel,{IWorkoutSession} from "../models/workout.model";
import { IWorkoutSessionRepository } from "../core/interfaces/repositories/IWorkoutSessionRepository";

@injectable()
export class WorkoutSessionRepository implements IWorkoutSessionRepository {
  async create(session: Partial<IWorkoutSession>): Promise<IWorkoutSession> {
    const doc = new WorkoutSessionModel(session);
    return await doc.save();
  }

  async findById(id: string) {
    return WorkoutSessionModel.findById(id).lean().exec();
  }

  async update(id: string, update: Partial<IWorkoutSession>) {
    return WorkoutSessionModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async delete(id: string) {
    await WorkoutSessionModel.findByIdAndDelete(id).exec();
  }

  async findTemplates(filter: any = {}) {
    return WorkoutSessionModel.find({ date: { $exists: false }, ...filter }).lean().exec();
  }
  async findAdminTemplates() {
    return WorkoutSessionModel.find({
      date: { $exists: false },
      givenBy: "admin",
    }).lean().exec();
  }
}
