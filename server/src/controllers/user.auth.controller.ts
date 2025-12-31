import { Request, Response, NextFunction } from 'express'
import { injectable, inject } from 'inversify'
import TYPES from '../core/types/types'
import { IUserService } from '../core/interfaces/services/IUserService'
import { IOTPService } from '../core/interfaces/services/IOtpService'
import { IJwtService, JwtPayload } from '../core/interfaces/services/IJwtService'
import { IStreakService } from '../core/interfaces/services/IStreakService'
import { STATUS_CODE } from '../constants/status'
import { logger } from '../utils/logger.util'
import { MESSAGES } from '../constants/messages.constants'
import { AppError } from '../utils/appError.util'
import {
    RequestOtpDto,
    VerifyOtpDto,
    ForgotPasswordDto,
    VerifyForgotPasswordOtpDto,
    ResetPasswordDto,
    GoogleLoginDto,
    LoginDto,
    LoginResponseDto,
    ResendOtpDto,
    RefreshTokenResponseDto,
    CheckUsernameDto,
    CheckUsernameResponseDto
} from '../dtos/user.dto'

@injectable()
export class UserAuthController {
    constructor(
        @inject(TYPES.IUserService) private _userService: IUserService,
        @inject(TYPES.IOtpService) private _otpService: IOTPService,
        @inject(TYPES.IJwtService) private _jwtService: IJwtService,
        @inject(TYPES.IStreakService) private _streakService: IStreakService
    ) { }

    async requestOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: RequestOtpDto = req.body
            await this._otpService.requestOtp(dto.email, 'user')
            res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT })
        } catch (err) {
            logger.error('Error in requestOtp:', err)
            next(err)
        }
    }

    async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: VerifyOtpDto = req.body
            await this._otpService.verifyOtp(dto.email, dto.otp)
            const result: LoginResponseDto = await this._userService.registerUser(
                dto.name,
                dto.email,
                dto.password
            )
            this._jwtService.setTokens(res, result.accessToken, result.refreshToken)
            res.status(STATUS_CODE.CREATED).json({ user: result.user, message: MESSAGES.CREATED })
        } catch (err) {
            logger.error('Error in verifyOtp:', err)
            next(err)
        }
    }

    async checkUsername(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: CheckUsernameDto = req.body
            const isAvailable = await this._userService.checkUsername(dto.username)
            const response: CheckUsernameResponseDto = { isAvailable }
            res.status(STATUS_CODE.OK).json(response)
        } catch (err) {
            next(err)
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: ForgotPasswordDto = req.body
            await this._otpService.requestForgotPasswordOtp(dto.email, 'user')
            res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT })
        } catch (err) {
            next(err)
        }
    }

    async verifyForgotPasswordOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: VerifyForgotPasswordOtpDto = req.body
            await this._otpService.verifyOtp(dto.email, dto.otp)
            res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_VERIFIED })
        } catch (err) {
            next(err)
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: ResetPasswordDto = req.body
            await this._userService.resetPassword(dto.email, dto.newPassword)
            res.status(STATUS_CODE.OK).json({ message: MESSAGES.PASSWORD_RESET })
        } catch (err) {
            next(err)
        }
    }

    async googleLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: GoogleLoginDto = req.body
            const result: LoginResponseDto = await this._userService.loginWithGoogle(dto.idToken)
            this._jwtService.setTokens(res, result.accessToken, result.refreshToken)
            res.status(STATUS_CODE.OK).json({ user: result.user })
        } catch (err) {
            logger.error('Google login error:', err)
            next(err)
        }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: LoginDto = req.body
            const result: LoginResponseDto = await this._userService.loginUser(dto.email, dto.password)
            this._jwtService.setTokens(res, result.accessToken, result.refreshToken)
            const streak = await this._streakService.checkAndResetUserStreak(result.user._id)
            const response = { ...result, streak }
            res.status(STATUS_CODE.OK).json(response)
        } catch (err) {
            logger.error('Login error:', err)
            next(err)
        }
    }

    async checkSession(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = req.user as JwtPayload
            res.status(STATUS_CODE.OK).json({ valid: true, id: user.id, role: user.role })
        } catch (err) {
            next(err)
        }
    }

    async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: ResendOtpDto = req.body
            await this._otpService.requestOtp(dto.email, 'user')
            res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT })
        } catch (err) {
            next(err)
        }
    }

    async refreshAccessToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const token = req.cookies.refreshToken
            if (!token) throw new AppError(MESSAGES.INVALID_REQUEST, STATUS_CODE.UNAUTHORIZED)
            const decoded = this._jwtService.verifyRefreshToken(token) as {
                id: string
                role: string
                tokenVersion: number
            }
            const accessToken = this._jwtService.generateAccessToken(decoded.id, decoded.role, decoded.tokenVersion)
            const refreshToken = this._jwtService.generateRefreshToken(decoded.id, decoded.role, decoded.tokenVersion)
            this._jwtService.setTokens(res, accessToken, refreshToken)
            const response: RefreshTokenResponseDto = { accessToken, refreshToken }
            res.status(STATUS_CODE.OK).json(response)
        } catch (err) {
            next(err)
        }
    }

    async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id
            const { currentPassword, newPassword, confirmPassword } = req.body
            if (newPassword !== confirmPassword) {
                throw new AppError('Passwords do not match', STATUS_CODE.BAD_REQUEST)
            }
            await this._userService.changePassword(userId, currentPassword, newPassword)
            res.status(STATUS_CODE.OK).json({ message: 'Password changed successfully' })
        } catch (err) {
            logger.error('Change password error:', err)
            next(err)
        }
    }

    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = req.user as JwtPayload
            await this._userService.incrementTokenVersion(user.id)
            this._jwtService.clearTokens(res)
            res.status(STATUS_CODE.OK).json({ message: MESSAGES.DELETED })
        } catch (err) {
            next(err)
        }
    }
}
