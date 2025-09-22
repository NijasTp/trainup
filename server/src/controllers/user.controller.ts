import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import TYPES from '../core/types/types';
import { IUserService } from '../core/interfaces/services/IUserService';
import { IOTPService } from '../core/interfaces/services/IOtpService';
import { ITrainerService } from '../core/interfaces/services/ITrainerService';
import { IJwtService, JwtPayload } from '../core/interfaces/services/IJwtService';
import { IStreakService } from '../core/interfaces/services/IStreakService';
import { IUserController } from '../core/interfaces/controllers/IUserController';
import { STATUS_CODE } from '../constants/status';
import { logger } from '../utils/logger.util';
import {
  RequestOtpDto,
  VerifyOtpDto,
  CheckUsernameDto,
  CheckUsernameResponseDto,
  ForgotPasswordDto,
  VerifyForgotPasswordOtpDto,
  ResetPasswordDto,
  GoogleLoginDto,
  LoginDto,
  LoginResponseDto,
  ResendOtpDto,
  GetTrainersQueryDto,
  GetTrainersResponseDto,
  GetIndividualTrainerParamsDto,
  GetIndividualTrainerResponseDto,
  GetMyTrainerResponseDto,
  GetProfileResponseDto,
  UpdateUserRequestDto,
  RefreshTokenResponseDto,
  AddWeightDto,
} from '../dtos/user.dto';
import { MESSAGES } from '../constants/messages';
import { AppError } from '../utils/appError.util';

@injectable()
export class UserController implements IUserController {
  constructor(
    @inject(TYPES.IUserService) private _userService: IUserService,
    @inject(TYPES.IOtpService) private _otpService: IOTPService,
    @inject(TYPES.ITrainerService) private _trainerService: ITrainerService,
    @inject(TYPES.IJwtService) private _jwtService: IJwtService,
    @inject(TYPES.IStreakService) private _streakService: IStreakService
  ) {}

  async requestOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: RequestOtpDto = req.body;
      await this._otpService.requestOtp(dto.email, 'user');
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT });
    } catch (err) {
      logger.error('Error in requestOtp:', err);
      next(err);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: VerifyOtpDto = req.body;
      await this._otpService.verifyOtp(dto.email, dto.otp);
      const result: LoginResponseDto = await this._userService.registerUser(dto.name, dto.email, dto.password);
      this._jwtService.setTokens(res, result.accessToken, result.refreshToken);
      res.status(STATUS_CODE.CREATED).json({ user: result.user, message: MESSAGES.CREATED });
    } catch (err) {
      logger.error('Error in verifyOtp:', err);
      next(err);
    }
  }

  async checkUsername(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: CheckUsernameDto = req.body;
      const isAvailable = await this._userService.checkUsername(dto.username);
      const response: CheckUsernameResponseDto = { isAvailable };
      res.status(STATUS_CODE.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: ForgotPasswordDto = req.body;
      await this._otpService.requestForgotPasswordOtp(dto.email, 'user');
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT });
    } catch (err) {
      next(err);
    }
  }

  async verifyForgotPasswordOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: VerifyForgotPasswordOtpDto = req.body;
      await this._otpService.verifyOtp(dto.email, dto.otp);
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_VERIFIED });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: ResetPasswordDto = req.body;
      await this._userService.resetPassword(dto.email, dto.newPassword);
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.PASSWORD_RESET });
    } catch (err) {
      next(err);
    }
  }

  async googleLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: GoogleLoginDto = req.body;
      const result: LoginResponseDto = await this._userService.loginWithGoogle(dto.idToken);
      this._jwtService.setTokens(res, result.accessToken, result.refreshToken);
      res.status(STATUS_CODE.OK).json({ user: result.user });
    } catch (err) {
      logger.error('Google login error:', err);
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: LoginDto = req.body;
      const result: LoginResponseDto = await this._userService.loginUser(dto.email, dto.password);
      this._jwtService.setTokens(res, result.accessToken, result.refreshToken);
      const streak = await this._streakService.checkAndResetUserStreak(result.user._id);
      const response: LoginResponseDto = { ...result, streak };
      res.status(STATUS_CODE.OK).json(response);
    } catch (err) {
      logger.error('Login error:', err);
      next(err);
    }
  }

  async checkSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as JwtPayload;
      res.status(STATUS_CODE.OK).json({ valid: true, id: user.id, role: user.role });
    } catch (err) {
      next(err);
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: ResendOtpDto = req.body;
      await this._otpService.requestOtp(dto.email, 'user');
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT });
    } catch (err) {
      next(err);
    }
  }

  async getTrainers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: GetTrainersQueryDto = req.query;
      const page = Number(dto.page) || 1;
      const limit = Number(dto.limit) || 8;
      const search = String(dto.search || '');
      const specialization = String(dto.specialization || '');
      const experience = String(dto.experience || '');
      const minRating = String(dto.minRating || '');
      const minPrice = String(dto.minPrice || '');
      const maxPrice = String(dto.maxPrice || '');
      const result = await this._trainerService.getAllTrainers(
        page,
        limit,
        search,
        'active',
        'verified',
        undefined,
        undefined,
        specialization,
        experience,
        minRating,
        minPrice,
        maxPrice
      );
      const response: GetTrainersResponseDto = { trainers: result };
      res.status(STATUS_CODE.OK).json(response);
    } catch (err) {
      logger.error('Controller error:', err);
      next(err);
    }
  }

  async getIndividualTrainer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const trainer = await this._trainerService.getTrainerById(req.params.id);
      if (!trainer) throw new AppError(MESSAGES.TRAINER_NOT_FOUND, STATUS_CODE.NOT_FOUND);
      const response: GetIndividualTrainerResponseDto = { trainer };
      res.status(STATUS_CODE.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getWeightHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id;
      const weightHistory = await this._userService.getWeightHistory(userId);
      res.status(STATUS_CODE.OK).json(weightHistory);
    } catch (err) {
      logger.error('Error fetching weight history:', err);
      next(err);
    }
  }

  async getMyTrainer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id;
      const user = await this._userService.getUserById(userId);
      if (!user || !user.assignedTrainer) {
        throw new AppError(MESSAGES.TRAINER_NOT_FOUND, STATUS_CODE.NOT_FOUND);
      }
      const trainer = await this._trainerService.getTrainerById(user.assignedTrainer);
      const response: GetMyTrainerResponseDto = { trainer };
      res.status(STATUS_CODE.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  async cancelSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id;
      const user = await this._userService.getUserById(userId);
      if (!user || !user.assignedTrainer) {
        throw new AppError(MESSAGES.NOT_FOUND, STATUS_CODE.BAD_REQUEST);
      }
      await this._userService.cancelSubscription(userId, user.assignedTrainer);
      await this._trainerService.removeClientFromTrainer(user.assignedTrainer, userId);
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.DELETED });
    } catch (err) {
      logger.error('Error cancelling subscription:', err);
      next(err);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const jwtUser = req.user as JwtPayload;
      const id = jwtUser.id;
      const user = await this._userService.getProfile(id);
      if (!user) throw new AppError(MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND);
      const response: GetProfileResponseDto = { user };
      res.status(STATUS_CODE.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id;
      const dto: UpdateUserRequestDto = req.body;
      const updatedUser = await this._userService.updateProfile(userId, dto);
      if (!updatedUser) throw new AppError(MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND);
      const response: GetProfileResponseDto = { user: updatedUser };
      res.status(STATUS_CODE.OK).json(response);
    } catch (err) {
      logger.error('Update Profile Error', err);
      next(err);
    }
  }

  async refreshAccessToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies.refreshToken;
      if (!token) throw new AppError(MESSAGES.INVALID_REQUEST, STATUS_CODE.UNAUTHORIZED);
      const decoded = this._jwtService.verifyRefreshToken(token) as {
        id: string;
        role: string;
        tokenVersion: number;
      };
      const accessToken = this._jwtService.generateAccessToken(decoded.id, decoded.role, decoded.tokenVersion);
      const refreshToken = this._jwtService.generateRefreshToken(decoded.id, decoded.role, decoded.tokenVersion);
      this._jwtService.setTokens(res, accessToken, refreshToken);
      const response: RefreshTokenResponseDto = { accessToken, refreshToken };
      res.status(STATUS_CODE.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  async addWeight(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id;
      const dto: AddWeightDto = req.body;
      if (!dto.weight || typeof dto.weight !== 'number' || dto.weight <= 0) {
        throw new AppError(MESSAGES.INVALID_REQUEST, STATUS_CODE.BAD_REQUEST);
      }
      const updatedUser = await this._userService.addWeight(userId, dto.weight);
      if (!updatedUser) throw new AppError(MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND);
      res.status(STATUS_CODE.OK).json({ user: updatedUser, message: MESSAGES.UPDATED });
    } catch (err) {
      logger.error('Error adding weight:', err);
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as JwtPayload;
      await this._userService.incrementTokenVersion(user.id);
      this._jwtService.clearTokens(res);
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.DELETED });
    } catch (err) {
      next(err);
    }
  }
}