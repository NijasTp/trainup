import { injectable } from 'inversify';
import { IWeeklyScheduleRepository } from '../core/interfaces/repositories/IWeeklyScheduleRepository';
import { IWeeklySchedule, WeeklyScheduleModel } from '../models/weeklySchedule.model';

@injectable()
export class WeeklyScheduleRepository implements IWeeklyScheduleRepository {
  async create(scheduleData: Partial<IWeeklySchedule>): Promise<IWeeklySchedule> {
    return await WeeklyScheduleModel.create(scheduleData);
  }

  async findByTrainerAndWeek(trainerId: string, weekStart: Date): Promise<IWeeklySchedule | null> {
    return await WeeklyScheduleModel.findOne({
      trainerId,
      weekStart: {
        $gte: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate()),
        $lt: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 1)
      }
    });
  }

  async update(id: string, updateData: Partial<IWeeklySchedule>): Promise<IWeeklySchedule> {
    const updated = await WeeklyScheduleModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      throw new Error('Weekly schedule not found');
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await WeeklyScheduleModel.findByIdAndDelete(id);
  }

  async findAll(): Promise<IWeeklySchedule[]> {
    return await WeeklyScheduleModel.find();
  }
}