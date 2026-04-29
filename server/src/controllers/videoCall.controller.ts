import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { IVideoCallService } from '../core/interfaces/services/IVideoCallService';
import { JwtPayload } from '../core/interfaces/services/IJwtService';
import TYPES from '../core/types/types';
import { STATUS_CODE } from '../constants/status';
import { MESSAGES } from '../constants/messages.constants';
import { logger } from '../utils/logger.util';
import { AppError } from '../utils/appError.util';

@injectable()
export class VideoCallController {
  constructor(
    @inject(TYPES.IVideoCallService) private _videoCallService: IVideoCallService
  ) { }

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
      if (!videoCall) {
        const newVideoCall = await this._videoCallService.createVideoCallSession(slotId);
        res.status(STATUS_CODE.CREATED).json({
          videoCall: newVideoCall,
          message: MESSAGES.VIDEO_CALL_CREATED
        });
        return;
      }

      const canJoin = await this._videoCallService.canJoinCall(videoCall.roomId, userId);
      if (!canJoin) {
        throw new AppError(MESSAGES.VIDEO_CALL_ACCESS_DENIED, STATUS_CODE.FORBIDDEN);
      }

      res.status(STATUS_CODE.OK).json({ videoCall });
    } catch (err) {
      logger.error('Error getting call by slot:', err);
      next(err);
    }
  }

  async submitFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId } = req.params;
      const { rating, feedback } = req.body;

      if (rating === undefined || rating < 0 || rating > 10) {
        throw new AppError('Rating must be between 0 and 10', STATUS_CODE.BAD_REQUEST);
      }

      await this._videoCallService.submitFeedback(roomId, rating, feedback);

      res.status(STATUS_CODE.OK).json({
        message: 'Feedback submitted successfully'
      });
    } catch (err) {
      logger.error('Error submitting feedback:', err);
      next(err);
    }
  }
}