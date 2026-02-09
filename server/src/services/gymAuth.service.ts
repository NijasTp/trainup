import { injectable, inject } from "inversify";
import TYPES from "../core/types/types";
import { IGymAuthService } from "../core/interfaces/services/IGymAuthService";
import { IAuthGymTempRepository } from "../core/interfaces/repositories/IAuthGymTempRepository";
import { IMailService } from "../core/interfaces/services/IMailService";
import { IGymRepository } from "../core/interfaces/repositories/IGymRepository";
import { sendOtpHtml } from "../utils/sendEmail";
import { AppError } from "../utils/appError.util";
import { STATUS_CODE } from "../constants/status";
import { MESSAGES } from "../constants/messages.constants";
import { logger } from "../utils/logger.util";

@injectable()
export class GymAuthService implements IGymAuthService {
    constructor(
        @inject(TYPES.IAuthGymTempRepository) private _authGymTempRepo: IAuthGymTempRepository,
        @inject(TYPES.IGymRepository) private _gymRepo: IGymRepository,
        @inject(TYPES.IMailService) private _mailService: IMailService
    ) { }

    private generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async requestOtp(emailRaw: string): Promise<void> {
        const email = emailRaw.trim().toLowerCase();
        // Check if gym already exists
        const existingGym = await this._gymRepo.findByEmail(email);
        if (existingGym) {
            throw new AppError(MESSAGES.EMAIL_ALREADY_REGISTERED, STATUS_CODE.BAD_REQUEST);
        }

        const otp = this.generateOtp();
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        logger.info(`Gym registration OTP for ${email}: ${otp}`);
        await this._authGymTempRepo.saveVerification(email, otp, expiresAt);
        await this._mailService.sendMail(email, 'Your Gym Registration OTP', sendOtpHtml(otp));
    }

    async verifyOtp(emailRaw: string, otp: string): Promise<boolean> {
        const email = emailRaw.trim().toLowerCase();
        const record = await this._authGymTempRepo.findVerificationByEmail(email);

        if (!record) {
            throw new AppError(MESSAGES.NO_OTP_REQUESTED, STATUS_CODE.BAD_REQUEST);
        }

        if (record.expiresAt < new Date()) {
            throw new AppError(MESSAGES.OTP_EXPIRED, STATUS_CODE.BAD_REQUEST);
        }

        if (record.otp !== otp) {
            throw new AppError(MESSAGES.INVALID_OTP, STATUS_CODE.BAD_REQUEST);
        }

        await this._authGymTempRepo.updateVerificationStatus(email, true);
        return true;
    }

    async isVerified(emailRaw: string): Promise<boolean> {
        const email = emailRaw.trim().toLowerCase();
        const record = await this._authGymTempRepo.findVerificationByEmail(email);
        return !!record && record.verified;
    }

    async clearVerification(emailRaw: string): Promise<void> {
        const email = emailRaw.trim().toLowerCase();
        await this._authGymTempRepo.deleteVerification(email);
    }
}
