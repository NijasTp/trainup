import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { STATUS_CODE } from '../constants/status';
import TYPES from '../core/types/types';
import { IWorkoutService } from '../core/interfaces/services/IWorkoutService';
import { SocketHandler } from '../utils/socketHandler.util';

import { JwtPayload } from '../core/interfaces/services/IJwtService';
import { MESSAGES } from '../constants/messages.constants';
import { Role } from '../constants/role';
import {
  CreateSessionRequestDto,
  WorkoutSessionResponseDto,
  GetSessionParamsDto,
  UpdateSessionRequestDto,
  UpdateSessionParamsDto,
  DeleteSessionParamsDto,
  CreateOrGetDayRequestDto,
  WorkoutDayResponseDto,
  AddSessionToDayRequestDto,
  AddSessionToDayParamsDto,
  TrainerCreateSessionRequestDto,
  GetDayParamsDto,
  TrainerGetDayQueryDto,
} from '../dtos/workout.dto';
import { AppError } from '../utils/appError.util';

import { Types } from 'mongoose';
import { IStreakService } from '../core/interfaces/services/IStreakService';

@injectable()
export class WorkoutController {
  constructor(
    @inject(TYPES.WorkoutService) private _workoutService: IWorkoutService,
    @inject(TYPES.IStreakService) private _streakService: IStreakService,
    @inject(TYPES.SocketHandler) private _socketHandler: SocketHandler
  ) { }

  async createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const jwtUser = req.user as JwtPayload;
      const dto: CreateSessionRequestDto = req.body;
      const payload = {
        ...dto,
        userId: jwtUser?.role === Role.USER ? jwtUser.id : undefined,
        trainerId: jwtUser?.role === Role.TRAINER ? jwtUser.id : undefined,
        givenBy: dto.givenBy || jwtUser?.role
      };

      const created: WorkoutSessionResponseDto = await this._workoutService.createSession(payload);
      res.status(STATUS_CODE.CREATED).json(created);
    } catch (err) {
      next(err);
    }
  }

  async getSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: GetSessionParamsDto = { id: req.params.id };
      const session: WorkoutSessionResponseDto = await this._workoutService.getSession(dto.id);
      if (!session) {
        throw new AppError(MESSAGES.SESSION_NOT_FOUND, STATUS_CODE.NOT_FOUND);
      }
      res.status(STATUS_CODE.OK).json(session);
    } catch (err) {
      next(err);
    }
  }

  async updateSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const paramsDto: UpdateSessionParamsDto = { id: req.params.id };
      const dto: UpdateSessionRequestDto = req.body;
      const updated: WorkoutSessionResponseDto = await this._workoutService.updateSession(paramsDto.id, dto);
      if (!updated) {
        throw new AppError(MESSAGES.SESSION_NOT_FOUND, STATUS_CODE.NOT_FOUND);
      }

      if (dto.isDone && updated.userId) {
        console.log(`[STREAK_DEBUG] Completing workout for user: ${updated.userId}`);
        await this._streakService.updateUserStreak(new Types.ObjectId(updated.userId));
        const streakData = await this._streakService.checkAndResetUserStreak(new Types.ObjectId(updated.userId));

        console.log(`[STREAK_DEBUG] Current streak: ${streakData.currentStreak}. Emitting via SocketHandler...`);
        // Emit socket event for real-time streak update via SocketHandler
        this._socketHandler.emitStreakUpdate(updated.userId, streakData.currentStreak);

        res.status(STATUS_CODE.OK).json({
          success: true,
          streak: streakData.currentStreak,
          session: updated
        });
        return;
      }

      res.status(STATUS_CODE.OK).json(updated);
    } catch (err) {
      next(err);
    }
  }

  async deleteSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: DeleteSessionParamsDto = { id: req.params.id };
      await this._workoutService.deleteSession(dto.id);
      res.status(STATUS_CODE.NO_CONTENT).end();
    } catch (err) {
      next(err);
    }
  }

  async getSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const jwtUser = req.user as JwtPayload;
      const {
        page = '1',
        limit = '10',
        search = ''
      } = req.query as {
        page?: string;
        limit?: string;
        search?: string;
      };
      const result = await this._workoutService.getSessions(
        jwtUser.id,
        parseInt(page, 10),
        parseInt(limit, 10),
        search
      );
      res.status(STATUS_CODE.OK).json(result);
    } catch (err) {
      next(err);
    }
  }

  async createOrGetDay(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const jwtUser = req.user as JwtPayload;
      const userId = jwtUser.id;
      const dto: CreateOrGetDayRequestDto = req.body;
      if (!dto.date) throw new AppError(MESSAGES.MISSING_REQUIRED_FIELDS, STATUS_CODE.BAD_REQUEST);
      const day: WorkoutDayResponseDto = await this._workoutService.createDay(userId, dto.date);
      res.status(STATUS_CODE.OK).json(day);
    } catch (err) {
      next(err);
    }
  }

  async addSessionToDay(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const jwtUser = req.user as JwtPayload;
      const userId = jwtUser.id;
      const paramsDto: AddSessionToDayParamsDto = { date: req.params.date };
      const dto: AddSessionToDayRequestDto = req.body;
      if (!dto.sessionId) throw new AppError(MESSAGES.MISSING_REQUIRED_FIELDS, STATUS_CODE.BAD_REQUEST);
      const day: WorkoutDayResponseDto = await this._workoutService.addSessionToDay(
        userId,
        paramsDto.date,
        dto.sessionId
      );
      res.status(STATUS_CODE.CREATED).json(day);
    } catch (err) {
      next(err);
    }
  }

  async trainerCreateSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const jwtUser = req.user as JwtPayload;
      if (!jwtUser || jwtUser.role !== 'trainer') {
        throw new AppError(MESSAGES.TRAINER_REQUIRED, STATUS_CODE.UNAUTHORIZED);
      }
      const dto: TrainerCreateSessionRequestDto = req.body;
      if (!dto.clientId || !dto.name || !dto.date || !dto.time) {
        throw new AppError(MESSAGES.MISSING_REQUIRED_FIELDS, STATUS_CODE.BAD_REQUEST);
      }
      const session: WorkoutSessionResponseDto = await this._workoutService.trainerCreateSession(
        jwtUser.id,
        dto.clientId,
        {
          name: dto.name,
          date: dto.date,
          time: dto.time,
          exercises: dto.exercises,
          goal: dto.goal,
          notes: dto.notes
        }
      );
      res.status(STATUS_CODE.CREATED).json(session);
    } catch (err) {
      next(err);
    }
  }

  async getDay(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const jwtUser = req.user as JwtPayload;
      const userId = jwtUser.id;
      const dto: GetDayParamsDto = { date: req.params.date };
      const day: WorkoutDayResponseDto | null = await this._workoutService.getDay(userId, dto.date);
      if (!day) {
        throw new AppError(MESSAGES.NOT_FOUND, STATUS_CODE.NOT_FOUND);
      }
      res.status(STATUS_CODE.OK).json(day);
    } catch (err) {
      next(err);
    }
  }

  async trainerGetDay(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryDto: TrainerGetDayQueryDto = { clientId: req.query.clientId as string };
      const userId = queryDto.clientId;
      if (!userId) {
        throw new AppError(MESSAGES.INVALID_USER_ID, STATUS_CODE.BAD_REQUEST);
      }
      const paramsDto: GetDayParamsDto = { date: req.params.date };
      const day: WorkoutDayResponseDto | null = await this._workoutService.getDay(userId, paramsDto.date);
      if (!day) {
        throw new AppError(MESSAGES.NOT_FOUND, STATUS_CODE.NOT_FOUND);
      }
      res.status(STATUS_CODE.OK).json(day);
    } catch (err) {
      next(err);
    }
  }
}