import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import TYPES from '../core/types/types';
import { IGymService } from '../core/interfaces/services/IGymService';
import { IOTPService } from '../core/interfaces/services/IOtpService';
import { UploadedFile } from 'express-fileupload';
import { IJwtService, JwtPayload } from '../core/interfaces/services/IJwtService';
import { STATUS_CODE } from '../constants/status';
import { MESSAGES } from '../constants/messages';
import { ROLE } from '../constants/role';
import {
  GymRequestOtpDto,
  GymVerifyOtpDto,
  GymLoginDto,
  GymLoginResponseDto,
  GymDataResponseDto,
} from '../dtos/gym.dto';
import { logger } from '../utils/logger.util';

@injectable()
export class GymController {
  constructor(
    @inject(TYPES.IGymService) private _gymService: IGymService,
    @inject(TYPES.IOtpService) private _otpService: IOTPService,
    @inject(TYPES.IJwtService) private _jwtService: IJwtService
  ) {}

  async requestOtp(req: Request, res: Response): Promise<void> {
    const dto: GymRequestOtpDto = req.body;
    try {
      await this._otpService.requestOtp(dto.email, ROLE.GYM);
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT });
    } catch (err) {
      const error = err as Error;
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message || MESSAGES.INVALID_REQUEST });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    const dto: GymVerifyOtpDto = req.body;
    try {
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
      const error = err as Error;
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message || MESSAGES.INVALID_REQUEST });
    }
  }

  async getData(req: Request, res: Response): Promise<void> {
    try {
      const jwtUser = req.user as JwtPayload;
      const gymId = jwtUser.id;
      if (!gymId) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ error: MESSAGES.INVALID_GYM_ID });
        return;
      }

      const data: GymDataResponseDto = await this._gymService.getGymData(gymId);
      res.status(STATUS_CODE.OK).json(data);
    } catch (err) {
      const error = err as Error;
      res
        .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ error: error.message || MESSAGES.SERVER_ERROR });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    const dto: GymLoginDto = req.body;
    try {
      const result: GymLoginResponseDto = await this._gymService.loginGym(dto.email, dto.password);
      this._jwtService.setTokens(res, result.accessToken, result.refreshToken);
      res.status(STATUS_CODE.OK).json({ gym: result.gym });
    } catch (err) {
      const error = err as Error;
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message || MESSAGES.LOGIN_FAILED });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      this._jwtService.clearTokens(res);
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.DELETED });
    } catch (err) {
      const error = err as Error;
      logger.error('Logout error:', error);
      res
        .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ error: error.message || MESSAGES.FAILED_TO_LOGOUT });
    }
  }
}