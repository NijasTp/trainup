import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { IVideoCallService } from '../core/interfaces/services/IVideoCallService';
import { IJwtService, JwtPayload } from '../core/interfaces/services/IJwtService';
import TYPES from '../core/types/types';
import { STATUS_CODE } from '../constants/status';
import { MESSAGES } from '../constants/messages.constants';
import { logger } from '../utils/logger.util';
import { AppError } from '../utils/appError.util';

@injectable()
export class VideoCallController {
  constructor(
    @inject(TYPES.IVideoCallService) private _videoCallService: IVideoCallService
  ) {}

  async joinCall(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId } = req.params;
      const userId = (req.user as JwtPayload).id;
      const userRole = (req.user as JwtPayload).role;
      
      const userType = userRole === 'trainer' ? 'trainer' : 'user';
      const videoCall = await this._videoCallService.joinVideoCall(roomId, userId, userType);
      
      res.status(STATUS_CODE.OK).json({ 
        videoCall,
        message: MESSAGES.VIDEO_CALL_JOINED 
      });
    } catch (err) {
      logger.error('Error joining video call:', err);
      next(err);
    }
  }

  async leaveCall(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId } = req.params;
      const userId = (req.user as JwtPayload).id;
      
      await this._videoCallService.leaveVideoCall(roomId, userId);
      
      res.status(STATUS_CODE.OK).json({ 
        message: MESSAGES.VIDEO_CALL_LEFT 
      });
    } catch (err) {
      logger.error('Error leaving video call:', err);
      next(err);
    }
  }

  async getCallInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId } = req.params;
      const userId = (req.user as JwtPayload).id;
      
      const videoCall = await this._videoCallService.getVideoCallByRoomId(roomId);
      if (!videoCall) {
        throw new AppError(MESSAGES.VIDEO_CALL_NOT_FOUND, STATUS_CODE.NOT_FOUND);
      }

      const canJoin = await this._videoCallService.canJoinCall(roomId, userId);
      if (!canJoin) {
        throw new AppError(MESSAGES.VIDEO_CALL_ACCESS_DENIED, STATUS_CODE.FORBIDDEN);
      }

      const activeParticipants = await this._videoCallService.getActiveParticipants(roomId);
      
      res.status(STATUS_CODE.OK).json({ 
        videoCall,
        activeParticipants,
        canJoin 
      });
    } catch (err) {
      logger.error('Error getting call info:', err);
      next(err);
    }
  }

  async endCall(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId } = req.params;
      
      await this._videoCallService.endVideoCall(roomId);
      
      res.status(STATUS_CODE.OK).json({ 
        message: MESSAGES.VIDEO_CALL_ENDED 
      });
    } catch (err) {
      logger.error('Error ending video call:', err);
      next(err);
    }
  }

  async getCallBySlot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slotId } = req.params;
      const userId = (req.user as JwtPayload).id;
      
      const videoCall = await this._videoCallService.getVideoCallBySlotId(slotId);
      console.log('1. Fetched video call by slot:', videoCall);
      if (!videoCall) {
        // Create video call if it doesn't exist
        const newVideoCall = await this._videoCallService.createVideoCallSession(slotId);
        console.log('2. Created new video call:', newVideoCall);
        res.status(STATUS_CODE.CREATED).json({ 
          videoCall: newVideoCall,
          message: MESSAGES.VIDEO_CALL_CREATED 
        });
        return;
      }

      const canJoin = await this._videoCallService.canJoinCall(videoCall.roomId, userId);
      console.log('3. Can user join the call?', canJoin);
      if (!canJoin) {
        throw new AppError(MESSAGES.VIDEO_CALL_ACCESS_DENIED, STATUS_CODE.FORBIDDEN);
      }
      
      res.status(STATUS_CODE.OK).json({ videoCall });
    } catch (err) {
      logger.error('Error getting call by slot:', err);
      next(err);
    }
  }
}