import { injectable, inject } from 'inversify';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { IUserService } from '../core/interfaces/services/IUserService';
import { IUserRepository } from '../core/interfaces/repositories/IUserRepository';
import { IOTPService } from '../core/interfaces/services/IOtpService';
import TYPES from '../core/types/types';
import { IJwtService } from '../core/interfaces/services/IJwtService';
import { IUser } from '../models/user.model';
import { AppError } from '../utils/appError.util';
import { STATUS_CODE } from '../constants/status';
import { MESSAGES } from '../constants/messages';
import { 
  LoginDto, 
  LoginResponseDto, 
  GetWeightHistoryResponseDto,
  UserResponseDto
} from '../dtos/user.dto';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

@injectable()
export class UserService implements IUserService {
  private googleClient: OAuth2Client;

  constructor(
    @inject(TYPES.IUserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.IOtpService) private otpService: IOTPService,
    @inject(TYPES.IJwtService) private _jwtService: IJwtService
  ) {
    this.googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
  }

  public async registerUser(name: string, email: string, password: string): Promise<LoginResponseDto> {
    const existingUser = await this._userRepo.findByEmail(email);
    if (existingUser) throw new AppError(MESSAGES.USER_EXISTS, STATUS_CODE.BAD_REQUEST);

    const hashed = await bcrypt.hash(password, 10);
    const user = await this._userRepo.createUser({
      name,
      email,
      password: hashed,
    });

    const accessToken = this._jwtService.generateAccessToken(user._id.toString(), user.role, user.tokenVersion ?? 0);
    const refreshToken = this._jwtService.generateRefreshToken(user._id.toString(), user.role, user.tokenVersion ?? 0);

    return {
      user: this.mapToResponseDto(user),
      accessToken,
      refreshToken,
    };
  }

  async checkUsername(username: string): Promise<boolean> {
    return (await this._userRepo.checkUsername(username)) ? true : false;
  }

  public async resetPassword(email: string, newPassword: string) {
    const user = await this._userRepo.findByEmail(email);
    if (!user) throw new AppError(MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this._userRepo.updateUser(user._id.toString(), { password: hashedPassword });
    await this.otpService.clearOtp(email);
  }

  public async loginUser(email: string, password: string): Promise<LoginResponseDto> {
    const user = await this._userRepo.findByEmail(email);
    if (!user) throw new AppError(MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND);
    if (!user.password) throw new AppError(MESSAGES.INVALID_REQUEST, STATUS_CODE.BAD_REQUEST);
    if (user.isBanned) throw new AppError(MESSAGES.BANNED, STATUS_CODE.FORBIDDEN);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppError(MESSAGES.INVALID_PASSWORD, STATUS_CODE.BAD_REQUEST);

    const accessToken = this._jwtService.generateAccessToken(user._id.toString(), user.role, user.tokenVersion ?? 0);
    const refreshToken = this._jwtService.generateRefreshToken(user._id.toString(), user.role, user.tokenVersion ?? 0);

    return {
      user: this.mapToResponseDto(user),
      accessToken,
      refreshToken,
    };
  }

  async loginWithGoogle(idToken: string): Promise<LoginResponseDto> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) throw new AppError(MESSAGES.INVALID_REQUEST, STATUS_CODE.BAD_REQUEST);

    const { sub: googleId, email, name } = payload;
    if (!googleId || !email) throw new AppError(MESSAGES.MISSING_REQUIRED_FIELDS, STATUS_CODE.BAD_REQUEST);

    let user = await this._userRepo.findByGoogleId(googleId);
    if (!user) user = await this._userRepo.findByEmail(email);

    if (!user) {
      user = await this._userRepo.createUser({ googleId, email, name });
    } else if (!user.googleId) {
      throw new AppError(MESSAGES.INVALID_REQUEST, STATUS_CODE.BAD_REQUEST);
    }

    const accessToken = this._jwtService.generateAccessToken(user._id.toString(), user.role, user.tokenVersion ?? 0);
    const refreshToken = this._jwtService.generateRefreshToken(user._id.toString(), user.role, user.tokenVersion ?? 0);

    return {
      user: this.mapToResponseDto(user),
      accessToken,
      refreshToken,
    };
  }

  async getAllUsers(page: number, limit: number, search: string, isBanned?: string, isVerified?: string, startDate?: string, endDate?: string) {
    return await this._userRepo.findUsers(page, limit, search, isBanned, isVerified, startDate, endDate);
  }

  async getUserById(id: string): Promise<UserResponseDto | null> {
    const user = await this._userRepo.findById(id);
    if (!user) throw new AppError(MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND);
    return this.mapToResponseDto(user);
  }

  async incrementTokenVersion(id: string) {
    const user = await this._userRepo.findById(id);
    if (!user) throw new AppError(MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND);
    await this._userRepo.updateStatusAndIncrementVersion(id, {});
  }

  async getProfile(id: string) {
    const user = await this._userRepo.findById(id);
    if (!user) throw new AppError(MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND);
    return this.mapToResponseDto(user);
  }

  async updateProfile(id: string, updateData: Partial<IUser>) {
    const user = await this._userRepo.updateUser(id, updateData);
    if (!user) throw new AppError(MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND);
    return this.mapToResponseDto(user);
  }

  async updateUserStatus(id: string, updateData: Partial<IUser>) {
    if (updateData.isBanned !== undefined) {
      const updatedUser = await this._userRepo.updateStatusAndIncrementVersion(id, { isBanned: updateData.isBanned });
      if (!updatedUser) throw new AppError(MESSAGES.FAILED_TO_UPDATE_USER_BAN, STATUS_CODE.INTERNAL_SERVER_ERROR);
      return;
    }
    const updatedUser = await this._userRepo.updateStatus(id, updateData);
    if (!updatedUser) throw new AppError(MESSAGES.FAILED_TO_UPDATE_USER_BAN, STATUS_CODE.INTERNAL_SERVER_ERROR);
  }

  async updateUserTrainerId(userId: string, trainerId: string) {
    const user = await this._userRepo.findById(userId);
    if (!user) throw new AppError(MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND);
    await this._userRepo.updateUser(userId, {
      assignedTrainer: trainerId,
      subscriptionStartDate: new Date(),
    });
  }

  

  async cancelSubscription(userId: string, trainerId: string) {
    if (!trainerId) throw new AppError(MESSAGES.NOT_FOUND, STATUS_CODE.NOT_FOUND);
    const user = await this._userRepo.findById(userId);
    if (!user) throw new AppError(MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND);
    await this._userRepo.updateUser(userId, {
      assignedTrainer: null,
      subscriptionStartDate: null,
    });
  }

    async updateUserGymMembership(
    userId: string,
    gymId: string,
    planId: string,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    await this._userRepo.updateUserGymMembership(
      userId,
      gymId,
      planId,
      startDate,
      endDate
    );
  }

  async addWeight(userId: string, weight: number): Promise<UserResponseDto> {
    const user = await this._userRepo.addWeight(userId, weight, new Date());
    if (!user) throw new AppError(MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND);
    return this.mapToResponseDto(user);
  }

  async getWeightHistory(userId: string): Promise<GetWeightHistoryResponseDto> {
    const user = await this._userRepo.findById(userId);
    if (!user) throw new AppError(MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND);
    const weightHistory = await this._userRepo.getWeightHistory(userId);
    return {
      weightHistory: weightHistory.map((entry) => ({
        weight: entry.weight,
        date: entry.date.toISOString(),
      })),
    };
  }

  // Methods added from the first UserService
  async forgotPassword(email: string): Promise<void> {
    const user = await this._userRepo.findByEmail(email);
    if (!user) {
      throw new AppError(MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND);
    }
    await this.otpService.requestForgotPasswordOtp(email, 'user');
  }

  async updateUserPlan(userId: string, planType: 'basic' | 'premium' | 'pro'): Promise<void> {
    await this._userRepo.updatePlan(userId, planType);
  }

  async removeUserTrainer(userId: string): Promise<void> {
    await this._userRepo.removeTrainer(userId);
  }

  private mapToResponseDto(user: IUser): UserResponseDto {
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      isVerified: user.isVerified || false,
      role: user.role,
      goals: user.goals,
      activityLevel: user.activityLevel,
      equipment: user.equipment,
      assignedTrainer: user.assignedTrainer?.toString(),
      subscriptionStartDate: user.subscriptionStartDate || undefined,
      gymId: user.gymId?.toString(),
      isPrivate: user.isPrivate,
      isBanned: user.isBanned,
      streak: user.streak,
      trainerPlan: user.trainerPlan || 'basic',
      lastActiveDate: user.lastActiveDate,
      xp: user.xp,
      xpLogs: user.xpLogs.map((log) => ({
        amount: log.amount,
        reason: log.reason,
        date: log.date,
      })),
      achievements: user.achievements,
      currentWeight: user.todaysWeight,
      goalWeight: user.goalWeight,
      weightHistory: user.weightHistory.map((weight) => ({
        weight: weight.weight,
        date: weight.date,
      })),
      height: user.height,
      age: user.age,
      gender: user.gender,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}