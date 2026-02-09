import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "inversify";
import TYPES from "../core/types/types";
import { IGymAuthService } from "../core/interfaces/services/IGymAuthService";
import { STATUS_CODE } from "../constants/status";
import { logger } from "../utils/logger.util";

@injectable()
export class GymAuthController {
    constructor(
        @inject(TYPES.IGymAuthService) private _gymAuthService: IGymAuthService
    ) { }

    async requestOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Email is required" });
                return;
            }
            await this._gymAuthService.requestOtp(email.trim().toLowerCase());
            res.status(STATUS_CODE.OK).json({ message: "OTP sent to your email" });
        } catch (err) {
            logger.error("Error requesting gym registration OTP:", err);
            next(err);
        }
    }

    async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) {
                res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Email and OTP are required" });
                return;
            }
            await this._gymAuthService.verifyOtp(email.trim().toLowerCase(), otp);
            res.status(STATUS_CODE.OK).json({ message: "Email verified successfully" });
        } catch (err) {
            logger.error("Error verifying gym registration OTP:", err);
            next(err);
        }
    }
}
