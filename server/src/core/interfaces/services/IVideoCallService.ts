import { IVideoCall } from '../../../models/videoCall.model';

export interface IVideoCallService {
  createVideoCallSession(slotId: string): Promise<IVideoCall>;
  joinVideoCall(roomId: string, userId: string, userType: 'user' | 'trainer'): Promise<IVideoCall>;
  leaveVideoCall(roomId: string, userId: string): Promise<void>;
  getVideoCallByRoomId(roomId: string): Promise<IVideoCall | null>;
  getVideoCallBySlotId(slotId: string): Promise<IVideoCall | null>;
  canJoinCall(roomId: string, userId: string): Promise<boolean>;
  endVideoCall(roomId: string): Promise<void>;
  getActiveParticipants(roomId: string): Promise<number>;
}