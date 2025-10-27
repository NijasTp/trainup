import { IWeeklySchedule } from "../../../models/weeklySchedule.model";

export interface IWeeklyScheduleRepository {
  create(scheduleData: Partial<IWeeklySchedule>): Promise<IWeeklySchedule>;
  findByTrainerAndWeek(trainerId: string, weekStart: Date): Promise<IWeeklySchedule | null>;
  update(id: string, updateData: Partial<IWeeklySchedule>): Promise<IWeeklySchedule>;
  delete(id: string): Promise<void>;
  findAll(): Promise<IWeeklySchedule[]>;
}