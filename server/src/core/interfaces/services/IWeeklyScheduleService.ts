import { IWeeklySchedule } from "../../../models/weeklySchedule.model";

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

export interface DaySchedule {
  day: string;
  isActive: boolean;
  slots: TimeSlot[];
}


export interface IWeeklyScheduleService {
  createOrUpdateSchedule(scheduleData: Partial<IWeeklySchedule>): Promise<IWeeklySchedule>;
  getTrainerSchedule(trainerId: string, weekStart?: Date): Promise<IWeeklySchedule | null>;
  deleteSchedule(trainerId: string, weekStart: Date): Promise<void>;
  resetWeeklySchedules(): Promise<void>;
}