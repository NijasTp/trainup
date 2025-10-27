import { ISlot } from '../../../models/slot.model';
import { UpdateQuery, QueryOptions } from 'mongoose';

export interface ISlotRepository {
  create(slotData: Partial<ISlot>): Promise<ISlot>;
  findById(id: string): Promise<ISlot | null>;
  findByTrainerId(trainerId: string): Promise<ISlot[]>;
  findAvailableSlots(userId?: string): Promise<ISlot[]>;
  findUserSessions(userId: string): Promise<ISlot[]>;
  findTrainerSessionRequests(trainerId: string): Promise<ISlot[]>;
  updateSlot(id: string, updateData: UpdateQuery<ISlot>, options?: QueryOptions): Promise<ISlot | null>;
  deleteSlot(id: string): Promise<void>;
  addBookingRequest(slotId: string, userId: string): Promise<ISlot | null>;
  checkSlotOverlap(trainerId: string, date: Date, startTime: string, endTime: string): Promise<boolean>;
  deleteUnbookedSlotsByWeek(trainerId: string, weekStart: Date): Promise<void> 
}