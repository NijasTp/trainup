import { injectable, inject } from "inversify";
import { IOTPService } from "../core/interfaces/services/IOtpService";
import { IUserRepository } from "../core/interfaces/repositories/IUserRepository";
import { IOtpRepository } from "../core/interfaces/repositories/IOtpRepository";
import TYPES from "../core/types/types";
import { IMailService } from "../core/interfaces/services/IMailService";
import { sendOtpHtml } from "../utils/sendEmail";
import { IGymRepository } from "../core/interfaces/repositories/IGymRepository";
import { ITrainerRepository } from "../core/interfaces/repositories/ITrainerRepository";
import { logger } from "../utils/logger.util";

@injectable()
export class OtpService implements IOTPService {
  constructor(
    @inject(TYPES.IUserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.ITrainerRepository) private _trainerRepo: ITrainerRepository,
    @inject(TYPES.IGymRepository) private _gymRepo: IGymRepository,
    @inject(TYPES.IAdminRepository) private _adminRepo: IUserRepository,
    @inject(TYPES.IOtpRepository) private _otpRepo: IOtpRepository,
    @inject(TYPES.IMailService) private _mailService: IMailService
  ) { }

  private generateOtp() {
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
      throw new Error("Invalid role");
  }
  }

async requestOtp(email: string, role: 'user' | 'trainer' | 'gym' | 'admin') {
  const repo = this.getRepoByRole(role);
  const existing = await repo.findByEmail(email);
  if (existing) {
    throw new Error("Email is already registered");
  }

  const otp = this.generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  logger.info(`OTP sent to ${email}: ${otp}`);
  await this._otpRepo.saveOtp(email, otp, expiresAt);
  await this._mailService.sendMail(
    email,
    "Your OTP Code",
    sendOtpHtml(otp)
  );

  return otp;
}

async requestForgotPasswordOtp(email: string, role: 'user' | 'trainer' | 'gym' | 'admin') {
  const repo = this.getRepoByRole(role);
  const existing = await repo.findByEmail(email);
  if (!existing) {
    throw new Error("Email not found");
  }

  const otp = this.generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  logger.info(`OTP sent to ${email}: ${otp}`);
  await this._otpRepo.saveOtp(email, otp, expiresAt);
  await this._mailService.sendMail(
    email,
    "Trainup Forgot Password OTP Verification",
    sendOtpHtml(otp)
  );

  return otp;
}

  async verifyOtp(email: string, otp: string) {
    const record = await this._otpRepo.findOtpByEmail(email);
    if (!record) throw new Error("No OTP requested for this email");
    if (record.expiresAt < new Date()) throw new Error("OTP expired");
    if (record.otp !== otp) throw new Error("Invalid OTP");

    await this._otpRepo.deleteOtp(record._id.toString());
    return true;
  }

  async clearOtp(email:string){
    await this._otpRepo.deleteOtp(email)
  }
}
