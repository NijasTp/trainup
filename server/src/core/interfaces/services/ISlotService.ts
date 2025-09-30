import { ISlot } from '../../../models/slot.model';

export interface ISlotService {
  createSlot(trainerId: string, date: Date, startTime: string, endTime: string): Promise<ISlot>;
  getTrainerSlots(trainerId: string): Promise<ISlot[]>;
  getAvailableSlots(userId: string): Promise<ISlot[]>;
  getUserSessions(userId: string): Promise<ISlot[]>;
  getTrainerSessionRequests(trainerId: string): Promise<ISlot[]>;
  deleteSlot(slotId: string, trainerId: string): Promise<void>;
  bookSession(slotId: string, userId: string): Promise<void>;
  approveSessionRequest(slotId: string, userId: string, trainerId: string): Promise<void>;
  rejectSessionRequest(slotId: string, userId: string, trainerId: string, rejectionReason: string): Promise<void>;
  generateVideoCallLink(slotId: string): Promise<string>;
}