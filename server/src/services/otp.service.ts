import { injectable, inject } from 'inversify';
import { IOTPService } from '../core/interfaces/services/IOtpService';
import { IUserRepository } from '../core/interfaces/repositories/IUserRepository';
import { IOtpRepository } from '../core/interfaces/repositories/IOtpRepository';
import TYPES from '../core/types/types';
import { IMailService } from '../core/interfaces/services/IMailService';
import { sendOtpHtml } from '../utils/sendEmail';
import { IGymRepository } from '../core/interfaces/repositories/IGymRepository';
import { ITrainerRepository } from '../core/interfaces/repositories/ITrainerRepository';
import { logger } from '../utils/logger.util';
import { MESSAGES } from '../constants/messages';
import { AppError } from '../utils/appError.util';
import { STATUS_CODE } from '../constants/status';

@injectable()
export class OtpService implements IOTPService {
  constructor(
    @inject(TYPES.IUserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.ITrainerRepository) private _trainerRepo: ITrainerRepository,
    @inject(TYPES.IGymRepository) private _gymRepo: IGymRepository,
    @inject(TYPES.IAdminRepository) private _adminRepo: IUserRepository,
    @inject(TYPES.IOtpRepository) private _otpRepo: IOtpRepository,
    @inject(TYPES.IMailService) private _mailService: IMailService
  ) {}

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getRepoByRole(role: 'user' | 'trainer' | 'gym' | 'admin') {
    switch (role) {
      case 'user':
        return this._userRepo;
      case 'trainer':
        return this._trainerRepo;
      case 'gym':
        return this._gymRepo;
      case 'admin':
        return this._adminRepo;
      default:
        throw new AppError(MESSAGES.INVALID_ROLE, STATUS_CODE.BAD_REQUEST);
    }
  }

  async requestOtp(email: string, role: 'user' | 'trainer' | 'gym' | 'admin'): Promise<string> {
    const repo = this.getRepoByRole(role);
    const existing = await repo.findByEmail(email);
    if (existing) {
      throw new AppError(MESSAGES.EMAIL_ALREADY_REGISTERED, STATUS_CODE.BAD_REQUEST);
    }

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    logger.info(`OTP sent to ${email}: ${otp}`);
    await this._otpRepo.saveOtp(email, otp, expiresAt);
    await this._mailService.sendMail(email, 'Your OTP Code', sendOtpHtml(otp));

    return otp;
  }

  async requestForgotPasswordOtp(email: string, role: 'user' | 'trainer' | 'gym' | 'admin'): Promise<string> {
    const repo = this.getRepoByRole(role);
    const existing = await repo.findByEmail(email);
    if (!existing) {
      throw new AppError(MESSAGES.EMAIL_NOT_FOUND, STATUS_CODE.NOT_FOUND);
    }

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    logger.info(`OTP sent to ${email}: ${otp}`);
    await this._otpRepo.saveOtp(email, otp, expiresAt);
    await this._mailService.sendMail(email, 'Trainup Forgot Password OTP Verification', sendOtpHtml(otp));

    return otp;
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const record = await this._otpRepo.findOtpByEmail(email);
    if (!record) throw new AppError(MESSAGES.NO_OTP_REQUESTED, STATUS_CODE.BAD_REQUEST);
    if (record.expiresAt < new Date()) throw new AppError(MESSAGES.OTP_EXPIRED, STATUS_CODE.BAD_REQUEST);
    if (record.otp !== otp) throw new AppError(MESSAGES.INVALID_OTP, STATUS_CODE.BAD_REQUEST);

    await this._otpRepo.deleteOtp(record._id.toString());
    return true;
  }

  async clearOtp(email: string): Promise<void> {
    await this._otpRepo.deleteOtp(email);
  }
}