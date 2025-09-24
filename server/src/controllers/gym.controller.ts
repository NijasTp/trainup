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
          location: dto.location,
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
      next(err);
    }
  }

  async getData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const jwtUser = req.user as JwtPayload;
      const gymId = jwtUser.id;
      if (!gymId) throw new AppError(MESSAGES.INVALID_GYM_ID, STATUS_CODE.BAD_REQUEST);
      const data: GymDataResponseDto = await this._gymService.getGymData(gymId);
      res.status(STATUS_CODE.OK).json(data);
    } catch (err) {
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
}