import { IWeeklySchedule } from "../../../models/weeklySchedule.model";

export interface IWeeklyScheduleService {
  createOrUpdateSchedule(scheduleData: Partial<IWeeklySchedule>): Promise<IWeeklySchedule>;
  getTrainerSchedule(trainerId: string, weekStart?: Date): Promise<IWeeklySchedule | null>;
  deleteSchedule(trainerId: string, weekStart: Date): Promise<void>;
  resetWeeklySchedules(): Promise<void>;
}