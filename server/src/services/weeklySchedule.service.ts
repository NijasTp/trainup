import { injectable, inject } from 'inversify';
import { IWeeklyScheduleService } from '../core/interfaces/services/IWeeklyScheduleService';
import { IWeeklyScheduleRepository } from '../core/interfaces/repositories/IWeeklyScheduleRepository';
import { ISlotRepository } from '../core/interfaces/repositories/ISlotRepository';
import { IWeeklySchedule } from '../models/weeklySchedule.model';
import TYPES from '../core/types/types';
import { AppError } from '../utils/appError.util';
import { STATUS_CODE } from '../constants/status';

@injectable()
export class WeeklyScheduleService implements IWeeklyScheduleService {
  constructor(
    @inject(TYPES.IWeeklyScheduleRepository) private _scheduleRepository: IWeeklyScheduleRepository,
    @inject(TYPES.ISlotRepository) private _slotRepository: ISlotRepository
  ) {}

  async createOrUpdateSchedule(scheduleData: Partial<IWeeklySchedule>): Promise<IWeeklySchedule> {
    const { trainerId, weekStart, schedule } = scheduleData;
    
    if (!trainerId || !weekStart || !schedule) {
      throw new AppError('Missing required fields', STATUS_CODE.BAD_REQUEST);
    }

    // Validate schedule data
    this.validateSchedule(schedule);

    const weekStartDate = new Date(weekStart);
    
    // Check if schedule exists for this trainer and week
    const existingSchedule = await this._scheduleRepository.findByTrainerAndWeek(
      trainerId.toString(),
      weekStartDate
    );

    let savedSchedule: IWeeklySchedule;

    if (existingSchedule) {
      // Update existing schedule
      savedSchedule = await this._scheduleRepository.update(existingSchedule._id.toString(), {
        schedule,
        updatedAt: new Date()
      });
    } else {
      // Create new schedule
      savedSchedule = await this._scheduleRepository.create({
        trainerId,
        weekStart: weekStartDate,
        schedule
      });
    }

    // Generate actual slots from the schedule
    await this.generateSlotsFromSchedule(savedSchedule);

    return savedSchedule;
  }

  async getTrainerSchedule(trainerId: string, weekStart?: Date): Promise<IWeeklySchedule | null> {
    const targetWeek = weekStart || this.getCurrentWeekStart();
    return await this._scheduleRepository.findByTrainerAndWeek(trainerId, targetWeek);
  }

  async deleteSchedule(trainerId: string, weekStart: Date): Promise<void> {
    const schedule = await this._scheduleRepository.findByTrainerAndWeek(trainerId, weekStart);
    
    if (!schedule) {
      throw new AppError('Schedule not found', STATUS_CODE.NOT_FOUND);
    }

    await this._slotRepository.deleteUnbookedSlotsByWeek(trainerId, weekStart);
    
    await this._scheduleRepository.delete(schedule._id.toString());
  }

  private validateSchedule(schedule: any[]): void {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    for (const daySchedule of schedule) {
      if (!daysOfWeek.includes(daySchedule.day)) {
        throw new AppError(`Invalid day: ${daySchedule.day}`, STATUS_CODE.BAD_REQUEST);
      }

      if (daySchedule.isActive && daySchedule.slots) {
        if (daySchedule.slots.length > 5) {
          throw new AppError(`Maximum 5 sessions allowed per day for ${daySchedule.day}`, STATUS_CODE.BAD_REQUEST);
        }

        for (const slot of daySchedule.slots) {
          // Validate time format
          if (!this.isValidTimeFormat(slot.startTime) || !this.isValidTimeFormat(slot.endTime)) {
            throw new AppError('Invalid time format', STATUS_CODE.BAD_REQUEST);
          }

          // Check if session is exactly 1 hour
          const start = new Date(`2000-01-01T${slot.startTime}`);
          const end = new Date(`2000-01-01T${slot.endTime}`);
          const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

          if (diffHours !== 1) {
            throw new AppError('Each session must be exactly 1 hour', STATUS_CODE.BAD_REQUEST);
          }
        }

        // Check for overlapping slots
        this.checkForOverlappingSlots(daySchedule.slots, daySchedule.day);
      }
    }
  }

  private checkForOverlappingSlots(slots: any[], day: string): void {
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const slot1Start = new Date(`2000-01-01T${slots[i].startTime}`);
        const slot1End = new Date(`2000-01-01T${slots[i].endTime}`);
        const slot2Start = new Date(`2000-01-01T${slots[j].startTime}`);
        const slot2End = new Date(`2000-01-01T${slots[j].endTime}`);

        if (slot1Start < slot2End && slot1End > slot2Start) {
          throw new AppError(`Overlapping slots found on ${day}`, STATUS_CODE.BAD_REQUEST);
        }
      }
    }
  }

  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  private async generateSlotsFromSchedule(schedule: IWeeklySchedule): Promise<void> {
    const weekStart = new Date(schedule.weekStart);
    
    await this._slotRepository.deleteUnbookedSlotsByWeek(schedule.trainerId.toString(), weekStart);

    const daysMap = {
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6,
      'Sunday': 0
    };

    for (const daySchedule of schedule.schedule) {
      if (!daySchedule.isActive || !daySchedule.slots.length) continue;

      const dayNumber = daysMap[daySchedule.day as keyof typeof daysMap];
      const slotDate = new Date(weekStart);
      slotDate.setDate(weekStart.getDate() + (dayNumber));

      for (const timeSlot of daySchedule.slots) {
        await this._slotRepository.create({
          trainerId: schedule.trainerId,
          day: daySchedule.day,
          date: slotDate,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          weekStart: weekStart,
          scheduleSlotId: timeSlot.id,
          requestedBy: []
        });
      }
    }
  }

  private getCurrentWeekStart(): Date {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  // Auto-reset schedules every Sunday
  async resetWeeklySchedules(): Promise<void> {
    // This method can be called by a cron job every Sunday
    const allSchedules = await this._scheduleRepository.findAll();
    
    for (const schedule of allSchedules) {
      const nextWeekStart = new Date(schedule.weekStart);
      nextWeekStart.setDate(nextWeekStart.getDate() + 7);
      
      // Create new schedule for next week with same pattern
      await this.createOrUpdateSchedule({
        trainerId: schedule.trainerId,
        weekStart: nextWeekStart,
        schedule: schedule.schedule
      });
    }
  }
}