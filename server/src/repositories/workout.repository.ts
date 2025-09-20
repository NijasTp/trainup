import { injectable } from 'inversify';
import WorkoutSessionModel, { IWorkoutSession } from '../models/workout.model';
import { IWorkoutSessionRepository } from '../core/interfaces/repositories/IWorkoutSessionRepository';

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
    return WorkoutSessionModel.findByIdAndUpdate(id, update, {
      new: true
    }).exec();
  }

  async delete(id: string) {
    await WorkoutSessionModel.findByIdAndDelete(id).exec();
  }

  async findTemplates(filter = {}) {
    return WorkoutSessionModel.find({ date: { $exists: false }, ...filter })
      .lean()
      .exec();
  }

  async findAdminTemplates(page: number = 1, limit: number = 5, search: string = '') {
    const query: Record<string, any> = { date: { $exists: false }, givenBy: 'admin' };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const templates = await WorkoutSessionModel.find(query)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const total = await WorkoutSessionModel.countDocuments(query);

    return { templates, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findAll(filter: any = {}) {
    return WorkoutSessionModel.find(filter).lean().exec();
  }

  async count(filter: any = {}) {
    return WorkoutSessionModel.countDocuments(filter).exec();
  }

  async findSessions(query: any, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [sessions, total] = await Promise.all([
      WorkoutSessionModel.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      WorkoutSessionModel.countDocuments(query).exec()
    ]);

    return { sessions, total };
  }
}