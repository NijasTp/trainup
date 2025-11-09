import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import TYPES from '../core/types/types';
import { IAttendanceService } from '../core/interfaces/services/IAttendanceService';
import { JwtPayload } from '../core/interfaces/services/IJwtService';
import { STATUS_CODE } from '../constants/status';
import { AppError } from '../utils/appError.util';
import { MESSAGES } from '../constants/messages.constants';

@injectable()
export class AttendanceController {
  constructor(
    @inject(TYPES.IAttendanceService) private _attendanceService: IAttendanceService
  ) {}

  async markAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id;
      const { gymId, location } = req.body;

      if (!gymId || !location || !location.lat || !location.lng) {
        throw new AppError(MESSAGES.MISSING_REQUIRED_FIELDS, STATUS_CODE.BAD_REQUEST);
      }

      const result = await this._attendanceService.markAttendance(
        userId,
        gymId,
        { lat: location.lat, lng: location.lng }
      );

      res.status(STATUS_CODE.OK).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getAttendanceHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id;
      const { gymId } = req.params;
      const { page = '1', limit = '10' } = req.query as {
        page?: string;
        limit?: string;
      };

      const result = await this._attendanceService.getAttendanceHistory(
        userId,
        gymId,
        parseInt(page, 10),
        parseInt(limit, 10)
      );

      res.status(STATUS_CODE.OK).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getGymAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const { date } = req.params;
      const { page = '1', limit = '10' } = req.query as {
        page?: string;
        limit?: string;
      };

      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      const result = await this._attendanceService.getGymAttendance(
        gymId,
        targetDate,
        parseInt(page, 10),
        parseInt(limit, 10)
      );

      res.status(STATUS_CODE.OK).json(result);
    } catch (err) {
      next(err);
    }
  }
}