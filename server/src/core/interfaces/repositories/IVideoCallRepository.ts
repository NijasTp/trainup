import { IVideoCall } from '../../../models/videoCall.model';

export interface IVideoCallRepository {
  create(videoCallData: Partial<IVideoCall>): Promise<IVideoCall>;
  findByRoomId(roomId: string): Promise<IVideoCall | null>;
  findBySlotId(slotId: string): Promise<IVideoCall | null>;
  findById(id: string): Promise<IVideoCall | null>;
  updateVideoCall(id: string, updates: Partial<IVideoCall>): Promise<IVideoCall | null>;
  joinCall(roomId: string, userId: string, userType: 'user' | 'trainer'): Promise<IVideoCall | null>;
  leaveCall(roomId: string, userId: string): Promise<IVideoCall | null>;
  endCall(roomId: string): Promise<IVideoCall | null>;
  getActiveParticipants(roomId: string): Promise<number>;
}