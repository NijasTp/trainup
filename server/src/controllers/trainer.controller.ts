import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import TYPES from '../core/types/types';
import { ITrainerService } from '../core/interfaces/services/ITrainerService';
import { UploadedFile } from 'express-fileupload';
import { IOTPService } from '../core/interfaces/services/IOtpService';
import { IJwtService, JwtPayload } from '../core/interfaces/services/IJwtService';
import { STATUS_CODE } from '../constants/status';
import { IUserService } from '../core/interfaces/services/IUserService';
import { logger } from '../utils/logger.util';
import {
  TrainerLoginDto,
  TrainerLoginResponseDto,
  TrainerRequestOtpDto,
  TrainerVerifyOtpDto,
  TrainerResendOtpDto,
  TrainerForgotPasswordDto,
  TrainerResetPasswordDto,
  TrainerApplyDto,
  TrainerReapplyDto,
  TrainerResponseDto,
  GetClientsQueryDto,
  GetClientsResponseDto,
  GetClientParamsDto,
  GetClientResponseDto
} from '../dtos/trainer.dto';
import { MESSAGES } from '../constants/messages';
import { AppError } from '../utils/appError.util';

@injectable()
export class TrainerController {
  constructor(
    @inject(TYPES.ITrainerService) private _trainerService: ITrainerService,
    @inject(TYPES.IJwtService) private _JwtService: IJwtService,
    @inject(TYPES.IOtpService) private otpService: IOTPService,
    @inject(TYPES.IUserService) private userService: IUserService
  ) {}

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: TrainerLoginDto = req.body;
      const result: TrainerLoginResponseDto = await this._trainerService.loginTrainer(dto.email, dto.password);
      this._JwtService.setTokens(res, result.accessToken, result.refreshToken);
      res.status(STATUS_CODE.OK).json({ trainer: result.trainer });
    } catch (err) {
      logger.error('Login error:', err);
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: TrainerForgotPasswordDto = req.body;
      await this._trainerService.forgotPassword(dto.email);
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT });
    } catch (err) {
      next(err);
    }
  }

  async forgotPasswordResendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: TrainerRequestOtpDto = req.body;
      await this.otpService.requestForgotPasswordOtp(dto.email, 'trainer');
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT });
    } catch (err) {
      logger.error('Forgot password resend OTP error:', err);
      next(err);
    }
  }

  async requestOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: TrainerRequestOtpDto = req.body;
      await this.otpService.requestOtp(dto.email, 'trainer');
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT });
    } catch (err) {
      logger.error('Request OTP error:', err);
      next(err);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: TrainerVerifyOtpDto = req.body;
      await this.otpService.verifyOtp(dto.email, dto.otp);
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_VERIFIED });
    } catch (err) {
      logger.error('Verify OTP error:', err);
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: TrainerResetPasswordDto = req.body;
      await this._trainerService.resetPassword(dto.email, dto.password);
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.PASSWORD_RESET });
    } catch (err) {
      next(err);
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: TrainerResendOtpDto = req.body;
      await this.otpService.requestOtp(dto.email, 'trainer');
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT });
    } catch (err) {
      logger.error('Resend OTP error:', err);
      next(err);
    }
  }

  async apply(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: TrainerApplyDto = req.body;
      const { certificate, profileImage } = req.files as {
        certificate?: UploadedFile;
        profileImage?: UploadedFile;
      };

      if (!certificate) throw new AppError(MESSAGES.CERTIFICATE_REQUIRED, STATUS_CODE.BAD_REQUEST);

      const trainerData = {
        name: dto.fullName,
        email: dto.email,
        password: dto.password,
        phone: dto.phone,
        price: dto.price,
        location: dto.location,
        experience: dto.experience,
        specialization: dto.specialization,
        bio: dto.bio,
        certificate,
        profileImage
      };

      const result: TrainerLoginResponseDto = await this._trainerService.applyAsTrainer(trainerData);
      this._JwtService.setTokens(res, result.accessToken, result.refreshToken);
      res.status(STATUS_CODE.CREATED).json({
        message: MESSAGES.APPLICATION_SUBMITTED,
        trainer: result.trainer
      });
    } catch (err) {
      next(err);
    }
  }

  async reapply(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: TrainerReapplyDto = req.body;
      const trainerId = (req.user as JwtPayload).id;
      const { certificate, profileImage } = req.files as {
        certificate?: UploadedFile;
        profileImage?: UploadedFile;
      };
      if (!certificate) throw new AppError(MESSAGES.CERTIFICATE_REQUIRED, STATUS_CODE.BAD_REQUEST);

      const data = {
        name: dto.fullName,
        email: dto.email,
        password: dto.password,
        phone: dto.phone,
        price: dto.price,
        location: dto.location,
        experience: dto.experience,
        specialization: dto.specialization,
        bio: dto.bio,
        certificate,
        profileImage
      };
      await this._trainerService.reapplyAsTrainer(trainerId, data);
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.APPLICATION_SUBMITTED });
    } catch (err) {
      logger.error('Trainer reapply error:', err);
      next(err);
    }
  }

  async getData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = (req.user as JwtPayload).id;
      if (!id) throw new AppError(MESSAGES.INVALID_TRAINER_ID, STATUS_CODE.BAD_REQUEST);
      const trainer: TrainerResponseDto = await this._trainerService.getTrainerById(id);
      if (!trainer) throw new AppError(MESSAGES.TRAINER_NOT_FOUND, STATUS_CODE.NOT_FOUND);
      res.status(STATUS_CODE.OK).json({ trainer });
    } catch (err) {
      next(err);
    }
  }

  async getClients(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const trainerId = (req.user as JwtPayload).id;
      if (!trainerId) throw new AppError(MESSAGES.INVALID_TRAINER_ID, STATUS_CODE.BAD_REQUEST);
      const dto: GetClientsQueryDto = req.query;
      const page = parseInt(String(dto.page)) || 1;
      const limit = parseInt(String(dto.limit)) || 10;
      const search = String(dto.search || '');

      const clients: GetClientsResponseDto = await this._trainerService.getTrainerClients(
        trainerId,
        page,
        limit,
        search
      );
      res.status(STATUS_CODE.OK).json(clients);
    } catch (err) {
      next(err);
    }
  }

  async getClient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: GetClientParamsDto = { id: req.params.id };
      const client = await this.userService.getUserById(dto.id);
      if (!client) throw new AppError(MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND);
      const response: GetClientResponseDto = { user: client };
      res.status(STATUS_CODE.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      this._JwtService.clearTokens(res);
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.DELETED });
    } catch (err) {
      logger.error('Logout error:', err);
      next(err);
    }
  }
}