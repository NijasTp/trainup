import { injectable, inject } from "inversify";
import TYPES from "../core/types/types";
import { IGymAuthService } from "../core/interfaces/services/IGymAuthService";
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
        @inject(TYPES.IGymRepository) private _gymRepo: IGymRepository,
        @inject(TYPES.IMailService) private _mailService: IMailService
    ) { }

    private generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async requestOtp(emailRaw: string): Promise<void> {
        const email = emailRaw.trim().toLowerCase();
        let gym = await this._gymRepo.findByEmail(email);

        if (gym && gym.onboardingCompleted) {
            throw new AppError(MESSAGES.EMAIL_ALREADY_REGISTERED, STATUS_CODE.BAD_REQUEST);
        }

        const otp = this.generateOtp();
        const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        if (!gym) {
            await this._gymRepo.createGym({
                email,
                otp,
                otpExpiresAt,
                role: 'gym',
                verifyStatus: 'pending',
                isEmailVerified: false,
                onboardingCompleted: false
            } as any);
        } else {
            await this._gymRepo.updateGym(gym._id.toString(), {
                otp,
                otpExpiresAt,
                isEmailVerified: false // Reset verification if requesting new OTP
            });
        }

        logger.info(`Gym registration OTP for ${email}: ${otp}`);
        await this._mailService.sendMail(email, 'Your Gym Registration OTP', sendOtpHtml(otp));
    }

    async verifyOtp(emailRaw: string, otp: string): Promise<boolean> {
        const email = emailRaw.trim().toLowerCase();
        const gym = await this._gymRepo.findByEmail(email);

        if (!gym || !gym.otp) {
            throw new AppError(MESSAGES.NO_OTP_REQUESTED, STATUS_CODE.BAD_REQUEST);
        }

        if (gym.otpExpiresAt! < new Date()) {
            throw new AppError(MESSAGES.OTP_EXPIRED, STATUS_CODE.BAD_REQUEST);
        }

        if (gym.otp !== otp) {
            throw new AppError(MESSAGES.INVALID_OTP, STATUS_CODE.BAD_REQUEST);
        }

        await this._gymRepo.updateGym(gym._id.toString(), {
            isEmailVerified: true,
            otp: undefined,
            otpExpiresAt: undefined
        });
        return true;
    }

    async isVerified(emailRaw: string): Promise<boolean> {
        const email = emailRaw.trim().toLowerCase();
        const gym = await this._gymRepo.findByEmail(email);
        return !!gym && gym.isEmailVerified;
    }

    async clearVerification(emailRaw: string): Promise<void> {
        const email = emailRaw.trim().toLowerCase();
        const gym = await this._gymRepo.findByEmail(email);
        if (gym) {
            await this._gymRepo.updateGym(gym._id.toString(), {
                isEmailVerified: false,
                otp: undefined,
                otpExpiresAt: undefined
            });
        }
    }
}
