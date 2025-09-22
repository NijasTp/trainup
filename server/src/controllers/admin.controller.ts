import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import TYPES from '../core/types/types';
import { IAdminService } from '../core/interfaces/services/IAdminService';
import { ITrainerService } from '../core/interfaces/services/ITrainerService';
import { IUserService } from '../core/interfaces/services/IUserService';
import { PaginatedTrainers } from '../core/interfaces/services/ITrainerService';
import { IJwtService, JwtPayload } from '../core/interfaces/services/IJwtService';
import { IGymService } from '../core/interfaces/services/IGymService';
import { STATUS_CODE } from '../constants/status';
import {
  AdminLoginRequestDto,
  AdminLoginResponseDto,
  GetAllTrainersQueryDto,
  UpdateTrainerStatusDto,
  GetAllUsersQueryDto,
  UpdateUserStatusDto,
  GetAllGymsQueryDto,
  UpdateGymStatusDto,
  CheckSessionResponseDto,
} from '../dtos/admin.dto';
import { MESSAGES } from '../constants/messages';
import { logger } from '../utils/logger.util';
import { AppError } from '../utils/appError.util';

@injectable()
export class AdminController {
  constructor(
    @inject(TYPES.IAdminService) private _adminService: IAdminService,
    @inject(TYPES.ITrainerService) private _trainerService: ITrainerService,
    @inject(TYPES.IUserService) private _userService: IUserService,
    @inject(TYPES.IJwtService) private _JwtService: IJwtService,
    @inject(TYPES.IGymService) private _gymService: IGymService
  ) {}

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: AdminLoginRequestDto = req.body;
      const result: AdminLoginResponseDto = await this._adminService.login(dto);
      this._JwtService.setTokens(res, result.accessToken, result.refreshToken);
      res.status(STATUS_CODE.OK).json({ admin: result.admin });
    } catch (err) {
      next(err);
    }
  }

  async getAllTrainers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: GetAllTrainersQueryDto = req.query;
      const page = Number(dto.page) || 1;
      const limit = Number(dto.limit) || 5;
      const search = String(dto.search || '');
      const { isBanned, isVerified, startDate, endDate } = dto;

      const result: PaginatedTrainers = await this._trainerService.getAllTrainers(
        page,
        limit,
        search,
        isBanned,
        isVerified,
        startDate,
        endDate
      );
      res.status(STATUS_CODE.OK).json(result);
    } catch (err) {
      next(err);
    }
  }

  async updateTrainer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: UpdateTrainerStatusDto = req.body;
      const trainer = await this._trainerService.updateTrainerStatus(req.params.id, dto);
      res.status(STATUS_CODE.OK).json(trainer);
    } catch (err) {
      next(err);
    }
  }

  async getTrainerById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const trainer = await this._trainerService.getTrainerById(req.params.id);
      if (!trainer) {
        throw new AppError(MESSAGES.TRAINER_NOT_FOUND, STATUS_CODE.NOT_FOUND);
      }
      res.status(STATUS_CODE.OK).json(trainer);
    } catch (err) {
      next(err);
    }
  }

  async getTrainerApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const application = await this._trainerService.getTrainerApplication(req.params.id);
      if (!application) {
        throw new AppError(MESSAGES.NOT_FOUND, STATUS_CODE.NOT_FOUND);
      }
      res.status(STATUS_CODE.OK).json(application);
    } catch (err) {
      next(err);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: GetAllUsersQueryDto = req.query;
      const page = Number(dto.page) || 1;
      const limit = Number(dto.limit) || 5;
      const search = String(dto.search || '');
      const { isBanned, isVerified, startDate, endDate } = dto;

      const result = await this._userService.getAllUsers(
        page,
        limit,
        search,
        isBanned,
        isVerified,
        startDate,
        endDate
      );
      res.status(STATUS_CODE.OK).json(result);
    } catch (err) {
      logger.error('Controller error:', err);
      next(err);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      const user = await this._userService.getUserById(id);
      if (!user) {
        throw new AppError(MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND);
      }
      res.status(STATUS_CODE.OK).json(user);
    } catch (err) {
      logger.error('Controller error:', err);
      next(err);
    }
  }

  async updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dto: UpdateUserStatusDto = req.body;
      const updatedUser = await this._userService.updateUserStatus(id, dto);
      res.status(STATUS_CODE.OK).json(updatedUser);
    } catch (err) {
      next(err);
    }
  }

  async checkSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as JwtPayload;
      const response: CheckSessionResponseDto = {
        valid: true,
        id: user.id,
        role: user.role,
      };
      res.status(STATUS_CODE.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getGyms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: GetAllGymsQueryDto = req.query;
      const page = parseInt(String(dto.page)) || 1;
      const limit = parseInt(String(dto.limit)) || 10;
      const searchQuery = String(dto.searchQuery || '');

      const result = await this._gymService.getAllGyms(page, limit, searchQuery);
      res.status(STATUS_CODE.OK).json(result);
    } catch (err) {
      next(err);
    }
  }

  async updateGymStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dto: UpdateGymStatusDto = req.body;
      const updatedGym = await this._gymService.updateGymStatus(id, dto);
      if (!updatedGym) {
        throw new AppError(MESSAGES.GYM_NOT_FOUND, STATUS_CODE.NOT_FOUND);
      }
      res.status(STATUS_CODE.OK).json(updatedGym);
    } catch (err) {
      next(err);
    }
  }

  async getGymApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const gym = await this._gymService.getGymApplication(id);
      if (!gym) {
        throw new AppError(MESSAGES.GYM_NOT_FOUND, STATUS_CODE.NOT_FOUND);
      }
      res.status(STATUS_CODE.OK).json(gym);
    } catch (err) {
      next(err);
    }
  }

  async getGymById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const gym = await this._gymService.getGymById(id);
      if (!gym) {
        throw new AppError(MESSAGES.GYM_NOT_FOUND, STATUS_CODE.NOT_FOUND);
      }
      res.status(STATUS_CODE.OK).json(gym);
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const jwtUser = req.user as JwtPayload;
      await this._adminService.updateTokenVersion(jwtUser.id);
      this._JwtService.clearTokens(res);
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.DELETED });
    } catch (err) {
      logger.error('Logout error:', err);
      next(err);
    }
  }
}