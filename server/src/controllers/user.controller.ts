import { Request, Response } from 'express';
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

@injectable()
export class UserController implements IUserController {
  constructor(
    @inject(TYPES.IUserService) private _userService: IUserService,
    @inject(TYPES.IOtpService) private _otpService: IOTPService,
    @inject(TYPES.ITrainerService) private _trainerService: ITrainerService,
    @inject(TYPES.IJwtService) private _jwtService: IJwtService,
    @inject(TYPES.IStreakService) private _streakService: IStreakService
  ) {}

  async requestOtp(req: Request, res: Response): Promise<void> {
    const dto: RequestOtpDto = req.body;
    try {
      await this._otpService.requestOtp(dto.email, 'user');
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT });
    } catch (err) {
      const error = err as Error;
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message || MESSAGES.INVALID_REQUEST });
      logger.error('Error in requestOtp:', error);
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    const dto: VerifyOtpDto = req.body;
    try {
      await this._otpService.verifyOtp(dto.email, dto.otp);
      const result: LoginResponseDto = await this._userService.registerUser(dto.name, dto.email, dto.password);
      this._jwtService.setTokens(res, result.accessToken, result.refreshToken);
      res.status(STATUS_CODE.CREATED).json({ user: result.user, message: MESSAGES.CREATED });
    } catch (err) {
      const error = err as Error;
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message || MESSAGES.INVALID_REQUEST });
      logger.error('Error in verifyOtp:', error);
    }
  }

  async checkUsername(req: Request, res: Response): Promise<void> {
    const dto: CheckUsernameDto = req.body;
    try {
      const isAvailable = await this._userService.checkUsername(dto.username);
      const response: CheckUsernameResponseDto = { isAvailable };
      res.status(STATUS_CODE.OK).json(response);
    } catch (err) {
      const error = err as Error;
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message || MESSAGES.INVALID_REQUEST });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const dto: ForgotPasswordDto = req.body;
    try {
      await this._otpService.requestForgotPasswordOtp(dto.email, 'user');
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT });
    } catch (err) {
      const error = err as Error;
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message || MESSAGES.INVALID_REQUEST });
    }
  }

  async verifyForgotPasswordOtp(req: Request, res: Response): Promise<void> {
    const dto: VerifyForgotPasswordOtpDto = req.body;
    try {
      await this._otpService.verifyOtp(dto.email, dto.otp);
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_VERIFIED });
    } catch (err) {
      const error = err as Error;
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message || MESSAGES.INVALID_REQUEST });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const dto: ResetPasswordDto = req.body;
    try {
      await this._userService.resetPassword(dto.email, dto.newPassword);
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.PASSWORD_RESET });
    } catch (err) {
      const error = err as Error;
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message || MESSAGES.INVALID_REQUEST });
    }
  }

  async googleLogin(req: Request, res: Response): Promise<void> {
    const dto: GoogleLoginDto = req.body;
    try {
      const result: LoginResponseDto = await this._userService.loginWithGoogle(dto.idToken);
      this._jwtService.setTokens(res, result.accessToken, result.refreshToken);
      res.status(STATUS_CODE.OK).json({ user: result.user });
    } catch (err) {
      const error = err as Error;
      res.status(STATUS_CODE.UNAUTHORIZED).json({ error: error.message || MESSAGES.LOGIN_FAILED });
      logger.error('Google login error:', error);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    const dto: LoginDto = req.body;
    try {
      const result: LoginResponseDto = await this._userService.loginUser(dto.email, dto.password);
      this._jwtService.setTokens(res, result.accessToken, result.refreshToken);
      const streak = await this._streakService.checkAndResetUserStreak(result.user._id);
      const response: LoginResponseDto = { ...result, streak };
      res.status(STATUS_CODE.OK).json(response);
    } catch (err) {
      const error = err as Error;
      res.status(STATUS_CODE.UNAUTHORIZED).json({ error: error.message || MESSAGES.LOGIN_FAILED });
      logger.error('Login error:', error);
    }
  }

  async checkSession(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as JwtPayload;
      res.status(STATUS_CODE.OK).json({ valid: true, id: user.id, role: user.role });
    } catch (err) {
      const error = err as Error;
      res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: error.message || MESSAGES.SERVER_ERROR });
    }
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    const dto: ResendOtpDto = req.body;
    try {
      await this._otpService.requestOtp(dto.email, 'user');
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT });
    } catch (err) {
      const error = err as Error;
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message || MESSAGES.INVALID_REQUEST });
    }
  }

  async getTrainers(req: Request, res: Response): Promise<void> {
    const dto: GetTrainersQueryDto = req.query;
    try {
      const page = Number(dto.page) || 1;
      const limit = Number(dto.limit) || 5;
      const search = String(dto.search || '');
      const result = await this._trainerService.getAllTrainers(page, limit, search, 'active', 'verified');
      const response: GetTrainersResponseDto = { trainers: result };
      res.status(STATUS_CODE.OK).json(response);
    } catch (err) {
      const error = err as Error;
      logger.error('Controller error:', error);
      res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.FAILED_TO_FETCH.TRAINER });
    }
  }

  async getIndividualTrainer(req: Request, res: Response): Promise<void> {
    try {
      const trainer = await this._trainerService.getTrainerById(req.params.id);
      if (!trainer) {
        res.status(STATUS_CODE.NOT_FOUND).json({ error: MESSAGES.TRAINER_NOT_FOUND });
        return;
      }
      const response: GetIndividualTrainerResponseDto = { trainer };
      res.status(STATUS_CODE.OK).json(response);
    } catch (err) {
      const error = err as Error;
      res
        .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ error: error.message || MESSAGES.FAILED_TO_FETCH.TRAINER });
    }
  }

  async getWeightHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id;
      const weightHistory = await this._userService.getWeightHistory(userId);
      res.status(STATUS_CODE.OK).json(weightHistory);
    } catch (err) {
      const error = err as Error;
      logger.error('Error fetching weight history:', error);
      res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: error.message || MESSAGES.SERVER_ERROR });
    }
  }

  async getMyTrainer(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id;
      const user = await this._userService.getUserById(userId);
      if (!user || !user.assignedTrainer) {
        res.status(STATUS_CODE.NOT_FOUND).json({ error: MESSAGES.TRAINER_NOT_FOUND });
        return;
      }
      const trainer = await this._trainerService.getTrainerById(user.assignedTrainer);
      const response: GetMyTrainerResponseDto = { trainer };
      res.status(STATUS_CODE.OK).json(response);
    } catch (err) {
      const error = err as Error;
      res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: error.message || MESSAGES.SERVER_ERROR });
    }
  }

  async cancelSubscription(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id;
      const user = await this._userService.getUserById(userId);
      if (!user || !user.assignedTrainer) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ error: MESSAGES.NOT_FOUND });
        return;
      }
      await this._userService.cancelSubscription(userId, user.assignedTrainer);
      await this._trainerService.removeClientFromTrainer(user.assignedTrainer, userId);
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.DELETED });
    } catch (err) {
      const error = err as Error;
      logger.error('Error cancelling subscription:', error);
      res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: error.message || MESSAGES.SERVER_ERROR });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const jwtUser = req.user as JwtPayload;
      const id = jwtUser.id;
      const user = await this._userService.getProfile(id);
      if (!user) {
        res.status(STATUS_CODE.NOT_FOUND).json({ error: MESSAGES.USER_NOT_FOUND });
        return;
      }
      const response: GetProfileResponseDto = { user };
      res.status(STATUS_CODE.OK).json(response);
    } catch (err) {
      const error = err as Error;
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message || MESSAGES.USER_NOT_FOUND });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id;
      const dto: UpdateUserRequestDto = req.body;
      const updatedUser = await this._userService.updateProfile(userId, dto);
      if (!updatedUser) {
        res.status(STATUS_CODE.NOT_FOUND).json({ error: MESSAGES.USER_NOT_FOUND });
        return;
      }
      const response: GetProfileResponseDto = { user: updatedUser };
      res.status(STATUS_CODE.OK).json(response);
    } catch (err) {
      const error = err as Error;
      logger.error('Update Profile Error', error);
      res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: error.message || MESSAGES.SERVER_ERROR });
    }
  }

  async refreshAccessToken(req: Request, res: Response): Promise<void> {
    const token = req.cookies.refreshToken;
    if (!token) {
      res.status(STATUS_CODE.UNAUTHORIZED).json({ error: MESSAGES.INVALID_REQUEST });
      return;
    }
    try {
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
      const error = err as Error;
      res.status(STATUS_CODE.FORBIDDEN).json({ error: error.message || MESSAGES.FORBIDDEN });
    }
  }

  async addWeight(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id;
      const dto: AddWeightDto = req.body;
      if (!dto.weight || typeof dto.weight !== 'number' || dto.weight <= 0) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ error: MESSAGES.INVALID_REQUEST });
        return;
      }
      const updatedUser = await this._userService.addWeight(userId, dto.weight);
      if (!updatedUser) {
        res.status(STATUS_CODE.NOT_FOUND).json({ error: MESSAGES.USER_NOT_FOUND });
        return;
      }
      res.status(STATUS_CODE.OK).json({ user: updatedUser, message: MESSAGES.UPDATED });
    } catch (err) {
      const error = err as Error;
      logger.error('Error adding weight:', error);
      res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: error.message || MESSAGES.SERVER_ERROR });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as JwtPayload;
      await this._userService.incrementTokenVersion(user.id);
      this._jwtService.clearTokens(res);
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.DELETED });
    } catch (err) {
      const error = err as Error;
      res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: error.message || MESSAGES.SERVER_ERROR });
    }
  }
}