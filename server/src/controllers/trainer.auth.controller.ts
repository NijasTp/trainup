import { Request, Response, NextFunction } from 'express'
import { inject, injectable } from 'inversify'
import TYPES from '../core/types/types'
import { ITrainerService } from '../core/interfaces/services/ITrainerService'
import { IJwtService, JwtPayload } from '../core/interfaces/services/IJwtService'
import { IOTPService } from '../core/interfaces/services/IOtpService'
import { STATUS_CODE } from '../constants/status'
import { Role } from '../constants/role'
import { logger } from '../utils/logger.util'
import { MESSAGES } from '../constants/messages.constants'
import { AppError } from '../utils/appError.util'
import { UploadedFile } from 'express-fileupload'
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
    TrainerResponseDto
} from '../dtos/trainer.dto'

@injectable()
export class TrainerAuthController {
    constructor(
        @inject(TYPES.ITrainerService) private _trainerService: ITrainerService,
        @inject(TYPES.IJwtService) private _JwtService: IJwtService,
        @inject(TYPES.IOtpService) private otpService: IOTPService
    ) { }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: TrainerLoginDto = req.body
            const result: TrainerLoginResponseDto = await this._trainerService.loginTrainer(dto.email, dto.password)
            this._JwtService.setTokens(res, result.accessToken, result.refreshToken)
            res.status(STATUS_CODE.OK).json({ trainer: result.trainer })
        } catch (err) {
            logger.error('Login error:', err)
            next(err)
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: TrainerForgotPasswordDto = req.body
            await this._trainerService.forgotPassword(dto.email)
            res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT })
        } catch (err) {
            next(err)
        }
    }

    async forgotPasswordResendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: TrainerRequestOtpDto = req.body
            await this.otpService.requestForgotPasswordOtp(dto.email, Role.TRAINER)
            res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT })
        } catch (err) {
            logger.error('Forgot password resend OTP error:', err)
            next(err)
        }
    }

    async requestOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: TrainerRequestOtpDto = req.body
            await this.otpService.requestOtp(dto.email, Role.TRAINER)
            res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT })
        } catch (err) {
            logger.error('Request OTP error:', err)
            next(err)
        }
    }

    async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: TrainerVerifyOtpDto = req.body
            await this.otpService.verifyOtp(dto.email, dto.otp)
            res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_VERIFIED })
        } catch (err) {
            logger.error('Verify OTP error:', err)
            next(err)
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: TrainerResetPasswordDto = req.body
            await this._trainerService.resetPassword(dto.email, dto.password)
            res.status(STATUS_CODE.OK).json({ message: MESSAGES.PASSWORD_RESET })
        } catch (err) {
            next(err)
        }
    }

    async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: TrainerResendOtpDto = req.body
            await this.otpService.requestOtp(dto.email, Role.TRAINER)
            res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT })
        } catch (err) {
            logger.error('Resend OTP error:', err)
            next(err)
        }
    }

    async apply(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: TrainerApplyDto = req.body
            const { certificate, profileImage } = req.files as {
                certificate?: UploadedFile
                profileImage?: UploadedFile
            }

            if (!certificate) throw new AppError(MESSAGES.CERTIFICATE_REQUIRED, STATUS_CODE.BAD_REQUEST)

            let priceData = typeof dto.price === 'string' ? JSON.parse(dto.price) : dto.price

            // Ensure price values are numbers
            if (priceData && typeof priceData === 'object') {
                priceData = {
                    basic: Number(priceData.basic) || 0,
                    premium: Number(priceData.premium) || 0,
                    pro: Number(priceData.pro) || 0
                };
            }

            const trainerData = {
                name: dto.fullName,
                email: dto.email,
                password: dto.password,
                phone: dto.phone,
                price: priceData,
                location: dto.location,
                experience: dto.experience,
                specialization: dto.specialization,
                bio: dto.bio,
                certificate,
                profileImage
            }

            const result: TrainerLoginResponseDto = await this._trainerService.applyAsTrainer(trainerData)
            this._JwtService.setTokens(res, result.accessToken, result.refreshToken)
            res.status(STATUS_CODE.CREATED).json({
                message: MESSAGES.APPLICATION_SUBMITTED,
                trainer: result.trainer
            })
        } catch (err) {
            next(err)
        }
    }

    async reapply(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: TrainerReapplyDto = req.body
            const trainerId = (req.user as JwtPayload).id
            const { certificate, profileImage } = req.files as {
                certificate?: UploadedFile
                profileImage?: UploadedFile
            }
            if (!certificate) throw new AppError(MESSAGES.CERTIFICATE_REQUIRED, STATUS_CODE.BAD_REQUEST)

            let priceData = typeof dto.price === 'string' ? JSON.parse(dto.price) : dto.price

            // Ensure price values are numbers
            if (priceData && typeof priceData === 'object') {
                priceData = {
                    basic: Number(priceData.basic) || 0,
                    premium: Number(priceData.premium) || 0,
                    pro: Number(priceData.pro) || 0
                };
            }

            const data = {
                name: dto.fullName,
                email: dto.email,
                password: dto.password,
                phone: dto.phone,
                price: priceData,
                location: dto.location,
                experience: dto.experience,
                specialization: dto.specialization,
                bio: dto.bio,
                certificate,
                profileImage
            }
            await this._trainerService.reapplyAsTrainer(trainerId, data)
            res.status(STATUS_CODE.OK).json({ message: MESSAGES.APPLICATION_SUBMITTED })
        } catch (err) {
            logger.error('Trainer reapply error:', err)
            next(err)
        }
    }

    async getData(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = (req.user as JwtPayload).id
            if (!id) throw new AppError(MESSAGES.INVALID_TRAINER_ID, STATUS_CODE.BAD_REQUEST)
            const trainer: TrainerResponseDto = await this._trainerService.getTrainerById(id)
            if (!trainer) throw new AppError(MESSAGES.TRAINER_NOT_FOUND, STATUS_CODE.NOT_FOUND)
            res.status(STATUS_CODE.OK).json({ trainer })
        } catch (err) {
            next(err)
        }
    }

    async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const trainerId = (req.user as JwtPayload).id
            const updateData = { ...req.body }

            if (updateData.price) {
                if (typeof updateData.price === 'string') {
                    try {
                        updateData.price = JSON.parse(updateData.price);
                    } catch (err) {
                        logger.error('Error parsing price in updateProfile:', err);
                    }
                }

                // Ensure price values are numbers
                if (updateData.price && typeof updateData.price === 'object') {
                    updateData.price = {
                        basic: Number(updateData.price.basic) || 0,
                        premium: Number(updateData.price.premium) || 0,
                        pro: Number(updateData.price.pro) || 0
                    };
                }
            }

            let profileImage: UploadedFile | undefined
            if (req.files?.profileImage) {
                profileImage = Array.isArray(req.files.profileImage) ? req.files.profileImage[0] : (req.files.profileImage as UploadedFile)
            }
            const result = await this._trainerService.updateProfile(trainerId, updateData, profileImage)
            res.status(STATUS_CODE.OK).json({ trainer: result, message: 'Profile updated successfully' })
        } catch (err) {
            next(err)
        }
    }

    async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const trainerId = (req.user as JwtPayload).id
            const { currentPassword, newPassword } = req.body
            await this._trainerService.changePassword(trainerId, currentPassword, newPassword)
            res.status(STATUS_CODE.OK).json({ message: 'Password changed successfully' })
        } catch (err) {
            next(err)
        }
    }

    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            this._JwtService.clearTokens(res)
            res.status(STATUS_CODE.OK).json({ message: MESSAGES.DELETED })
        } catch (err) {
            logger.error('Logout error:', err)
            next(err)
        }
    }
}
