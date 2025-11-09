import { injectable, inject } from 'inversify';
import { DaySchedule, IWeeklyScheduleService, TimeSlot } from '../core/interfaces/services/IWeeklyScheduleService';
import { IWeeklyScheduleRepository } from '../core/interfaces/repositories/IWeeklyScheduleRepository';
import { ISlotRepository } from '../core/interfaces/repositories/ISlotRepository';
import { IWeeklySchedule } from '../models/weeklySchedule.model';
import TYPES from '../core/types/types';
import { AppError } from '../utils/appError.util';
import { STATUS_CODE } from '../constants/status';
import { MESSAGES } from '../constants/messages.constants';

@injectable()
export class WeeklyScheduleService implements IWeeklyScheduleService {
  constructor(
    @inject(TYPES.IWeeklyScheduleRepository) private _scheduleRepository: IWeeklyScheduleRepository,
    @inject(TYPES.ISlotRepository) private _slotRepository: ISlotRepository
  ) {}

  async createOrUpdateSchedule(scheduleData: Partial<IWeeklySchedule>): Promise<IWeeklySchedule> {
    const { trainerId, weekStart, schedule } = scheduleData;
    
    if (!trainerId || !weekStart || !schedule) {
      throw new AppError(MESSAGES.MISSING_REQUIRED_FIELDS, STATUS_CODE.BAD_REQUEST);
    }

    this.validateSchedule(schedule as DaySchedule[]);

    const weekStartDate = new Date(weekStart);
    const adjustedWeekStart = this.getCurrentWeekStart(weekStartDate);
    
    const existingSchedule = await this._scheduleRepository.findByTrainerAndWeek(
      trainerId.toString(),
      adjustedWeekStart
    );

    let savedSchedule: IWeeklySchedule;

    if (existingSchedule) {
      // Merge existing schedule with new schedule instead of replacing
      const updatedSchedule = this.mergeSchedules(existingSchedule.schedule, schedule as DaySchedule[]);
      
      savedSchedule = await this._scheduleRepository.update(existingSchedule._id.toString(), {
        schedule: updatedSchedule,
        updatedAt: new Date()
      });
    } else {
      savedSchedule = await this._scheduleRepository.create({
        trainerId,
        weekStart: adjustedWeekStart,
        schedule: schedule as DaySchedule[]
      });
    }

    await this.generateSlotsFromSchedule(savedSchedule);

    return savedSchedule;
  }

  async getTrainerSchedule(trainerId: string, weekStart?: Date): Promise<IWeeklySchedule | null> {
    const targetWeek = weekStart ? this.getCurrentWeekStart(weekStart) : this.getCurrentWeekStart();
    return await this._scheduleRepository.findByTrainerAndWeek(trainerId, targetWeek);
  }

  async deleteSchedule(trainerId: string, weekStart: Date): Promise<void> {
    const adjustedWeekStart = this.getCurrentWeekStart(weekStart);
    const schedule = await this._scheduleRepository.findByTrainerAndWeek(trainerId, adjustedWeekStart);
    
    if (!schedule) {
      throw new AppError(MESSAGES.SESSION_NOT_FOUND, STATUS_CODE.NOT_FOUND);
    }

    await this._slotRepository.deleteUnbookedSlotsByWeek(trainerId, adjustedWeekStart);
    
    await this._scheduleRepository.delete(schedule._id.toString());
  }

  private mergeSchedules(existingSchedule: DaySchedule[], newSchedule: DaySchedule[]): DaySchedule[] {
    const merged = [...existingSchedule];
    
    newSchedule.forEach(newDay => {
      const existingDayIndex = merged.findIndex(day => day.day === newDay.day);
      
      if (existingDayIndex >= 0) {
        // Merge slots for the same day
        const existingDay = merged[existingDayIndex];
        const existingSlotIds = new Set(existingDay.slots.map(slot => slot.id));
        
        // Add new slots that don't already exist
        newDay.slots.forEach(newSlot => {
          if (!existingSlotIds.has(newSlot.id)) {
            existingDay.slots.push(newSlot);
          }
        });
        
        // Update the day's active status
        existingDay.isActive = newDay.isActive;
      } else {
        // Add entirely new day
        merged.push(newDay);
      }
    });
    
    return merged;
  }

  private validateSchedule(schedule: DaySchedule[]): void {
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
          if (!this.isValidTimeFormat(slot.startTime) || !this.isValidTimeFormat(slot.endTime)) {
            throw new AppError('Invalid time format', STATUS_CODE.BAD_REQUEST);
          }

          const start = new Date(`2000-01-01T${slot.startTime}`);
          const end = new Date(`2000-01-01T${slot.endTime}`);
          const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

          if (diffHours !== 1) {
            throw new AppError('Each session must be exactly 1 hour', STATUS_CODE.BAD_REQUEST);
          }
        }

        this.checkForOverlappingSlots(daySchedule.slots, daySchedule.day);
      }
    }
  }

  private checkForOverlappingSlots(slots: TimeSlot[], day: string): void {
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const slot1Start = new Date(`2000-01-01T${slots[i].startTime}`);
        const slot1End = new Date(`2000-01-01T${slots[i].endTime}`);
        const slot2Start = new Date(`2000-01-01T${slots[j].startTime}`);
        const slot2End = new Date(`2000-01-01T${slots[j].endTime}`);

        if (slot1Start < slot2End && slot1End > slot2Start) {
          throw new AppError(MESSAGES.SLOT_OVERLAP + ` on ${day}`, STATUS_CODE.BAD_REQUEST);
        }
      }
    }
  }

  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  private async generateSlotsFromSchedule(schedule: IWeeklySchedule): Promise<void> {
    const weekStart = this.getCurrentWeekStart(new Date(schedule.weekStart));
    
    await this._slotRepository.deleteUnbookedSlotsByWeek(schedule.trainerId.toString(), weekStart);

    const daysMap: Record<string, number> = {
      'Monday': 0,
      'Tuesday': 1,
      'Wednesday': 2,
      'Thursday': 3,
      'Friday': 4,
      'Saturday': 5,
      'Sunday': 6
    };

    for (const daySchedule of schedule.schedule) {
      if (!daySchedule.isActive || !daySchedule.slots.length) continue;

      const dayOffset = daysMap[daySchedule.day];
      const slotDate = new Date(weekStart);
      slotDate.setDate(weekStart.getDate() + dayOffset);
      slotDate.setHours(0, 0, 0, 0);

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

  private getCurrentWeekStart(date?: Date): Date {
    const now = date || new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysFromToday = 0; // Start from today instead of Monday
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysFromToday);
    weekStart.setHours(0, 0, 0, 0);
    
    return weekStart;
  }

  async resetWeeklySchedules(): Promise<void> {
    const allSchedules = await this._scheduleRepository.findAll();
    
    for (const schedule of allSchedules) {
      const nextWeekStart = new Date(schedule.weekStart);
      nextWeekStart.setDate(nextWeekStart.getDate() + 7);
      
      await this.createOrUpdateSchedule({
        trainerId: schedule.trainerId,
        weekStart: nextWeekStart.toISOString(),
        schedule: schedule.schedule
      });
    }
  }
}