// src/controllers/gym.controller.ts
import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import TYPES from '../core/types/types';
import { IGymService } from '../core/interfaces/services/IGymService';
import { IOTPService } from '../core/interfaces/services/IOtpService';
import { UploadedFile } from 'express-fileupload';
import { IJwtService, JwtPayload } from '../core/interfaces/services/IJwtService';
import { STATUS_CODE } from '../constants/status';
import { MESSAGES } from '../constants/messages';
import { Role } from '../constants/role';
import {
  GymRequestOtpDto,
  GymVerifyOtpDto,
  GymLoginDto,
  GymLoginResponseDto,
  GymDataResponseDto,
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  AddTrainerDto,
  UpdateTrainerDto,
  AddMemberDto,
  UpdateMemberDto,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  CreatePaymentDto,
} from '../dtos/gym.dto';
import { logger } from '../utils/logger.util';
import { AppError } from '../utils/appError.util';

@injectable()
export class GymController {
  constructor(
    @inject(TYPES.IGymService) private _gymService: IGymService,
    @inject(TYPES.IOtpService) private _otpService: IOTPService,
    @inject(TYPES.IJwtService) private _jwtService: IJwtService
  ) {}

  async requestOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: GymRequestOtpDto = req.body;
      await this._otpService.requestOtp(dto.email, Role.GYM);
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT });
    } catch (err) {
      next(err);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: GymVerifyOtpDto = req.body;
      await this._otpService.verifyOtp(dto.email, dto.otp);
      const result: GymLoginResponseDto = await this._gymService.registerGym(
        {
          name: dto.name,
          email: dto.email,
          password: dto.password,
          geoLocation: dto.geoLocation,
        },
        req.files as {
          certificate?: UploadedFile;
          profileImage?: UploadedFile;
          images?: UploadedFile | UploadedFile[];
        }
      );
      this._jwtService.setTokens(res, result.accessToken, result.refreshToken);
      res.status(STATUS_CODE.CREATED).json({ gym: result.gym });
    } catch (err) {
      logger.info('Error in verifyOtp:', err);
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: GymLoginDto = req.body;
      const result: GymLoginResponseDto = await this._gymService.loginGym(dto.email, dto.password);
      this._jwtService.setTokens(res, result.accessToken, result.refreshToken);
      res.status(STATUS_CODE.OK).json({ gym: result.gym });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      this._jwtService.clearTokens(res);
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.DELETED });
    } catch (err) {
      logger.error('Logout error:', err);
      next(err);
    }
  }

  async getData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as { id: string; role: string };
      const data: GymDataResponseDto = await this._gymService.getGymData(user.id);
      res.status(STATUS_CODE.OK).json(data);
    } catch (err) {
      next(err);
    }
  }
  

  async createSubscriptionPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as { id: string; role: string };
      const dto: CreateSubscriptionPlanDto = req.body;
      const plan = await this._gymService.createSubscriptionPlan(user.id, dto);
      res.status(STATUS_CODE.CREATED).json(plan);
    } catch (err) {
      logger.error('Error in createSubscriptionPlan:', err);
      next(err);
    }
  }

  async listSubscriptionPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as { id: string; role: string };
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = parseInt((req.query.limit as string) || '10', 10);
      const search = (req.query.search as string) || undefined;
      const active = (req.query.active as string) || undefined;
      const result = await this._gymService.listSubscriptionPlans(user.id, page, limit, search, active);
      res.status(STATUS_CODE.OK).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getSubscriptionPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const planId = req.params.id;
      const plan = await this._gymService.getSubscriptionPlan(planId);
      res.status(STATUS_CODE.OK).json(plan);
    } catch (err) {
      next(err);
    }
  }

  async updateSubscriptionPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const planId = req.params.id;
      const dto: UpdateSubscriptionPlanDto = req.body;
      const plan = await this._gymService.updateSubscriptionPlan(planId as any, dto as any);
      res.status(STATUS_CODE.OK).json(plan);
    } catch (err) {
      next(err);
    }
  }

  async deleteSubscriptionPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const planId = req.params.id;
      await this._gymService.deleteSubscriptionPlan(planId);
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.DELETED });
    } catch (err) {
      next(err);
    }
  }

  async reapply(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as { id: string; role: string };
      const result: GymLoginResponseDto = await this._gymService.reapplyGym(
        user.id,
        req.body,
        req.files as {
          certificate?: UploadedFile;
          profileImage?: UploadedFile;
          images?: UploadedFile | UploadedFile[];
        }
      );
      this._jwtService.setTokens(res, result.accessToken, result.refreshToken);
      res.status(STATUS_CODE.OK).json({ gym: result.gym });
    } catch (err) {
      next(err);
    }
  }


  async getGymData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const gymData = await this._gymService.getGymData(gymId);
      res.status(STATUS_CODE.OK).json(gymData);
    } catch (err) {
      next(err);
    }
  }

  async getAnnouncements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const { page = '1', limit = '10', search = '' } = req.query as {
        page?: string;
        limit?: string;
        search?: string;
      };

      const result = await this._gymService.getGymAnnouncements(
        gymId,
        parseInt(page, 10),
        parseInt(limit, 10),
        search
      );

      res.status(STATUS_CODE.OK).json(result);
    } catch (err) {
      next(err);
    }
  }

  async createAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const dto: CreateAnnouncementDto = req.body;
      const imageFile = req.files?.image as UploadedFile;

      if (!dto.title || !dto.description) {
        throw new AppError(MESSAGES.MISSING_REQUIRED_FIELDS, STATUS_CODE.BAD_REQUEST);
      }

      const announcement = await this._gymService.createAnnouncement(gymId, dto, imageFile);
      res.status(STATUS_CODE.CREATED).json({ announcement });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  async updateAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const { id } = req.params;
      const dto: UpdateAnnouncementDto = req.body;
      const imageFile = req.files?.image as UploadedFile;

      const announcement = await this._gymService.updateAnnouncement(id, gymId, dto, imageFile);
      
      if (!announcement) {
        throw new AppError(MESSAGES.NOT_FOUND, STATUS_CODE.NOT_FOUND);
      }

      res.status(STATUS_CODE.OK).json({ announcement });
    } catch (err) {
      next(err);
    }
  }

  async deleteAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const { id } = req.params;

      await this._gymService.deleteAnnouncement(id, gymId);
      res.status(STATUS_CODE.OK).json({ message: 'Announcement deleted successfully' });
    } catch (err) {
      next(err);
    }
  }






}