import { NextFunction, Request, Response } from 'express'
import { injectable, inject } from 'inversify'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import TYPES from '../core/types/types'
import { IUserService } from '../core/interfaces/services/IUserService'
import { IOTPService } from '../core/interfaces/services/IOtpService'
import { ITrainerService } from '../core/interfaces/services/ITrainerService'
import {
  IJwtService,
  JwtPayload
} from '../core/interfaces/services/IJwtService'
import { IUserController } from '../core/interfaces/controllers/IUserController'
import { STATUS_CODE } from '../constants/status'
import passport from 'passport'
import { logger } from '../utils/logger.util'
import { IStreakService } from '../core/interfaces/services/IStreakService'
import { CheckUsernameDto, ForgotPasswordDto, GetIndividualTrainerParamsDto, GetTrainersQueryDto, GoogleLoginDto, LoginDto, RequestOtpDto, ResendOtpDto, ResetPasswordDto, VerifyForgotPasswordOtpDto, VerifyOtpDto } from '../dtos/user.dto'



@injectable()
export class UserController implements IUserController {
  constructor (
    @inject(TYPES.IUserService) private _userService: IUserService,
    @inject(TYPES.IOtpService) private _otpService: IOTPService,
    @inject(TYPES.ITrainerService) private _trainerService: ITrainerService,
    @inject(TYPES.IJwtService) private _jwtService: IJwtService,
    @inject(TYPES.IStreakService) private _streakService: IStreakService
  ) {}

  requestOtp = async (req: Request, res: Response) => {
    const dto = plainToInstance(RequestOtpDto, req.body)
    const errors = await validate(dto)
    if (errors.length > 0) {
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ errors: errors.map(e => e.constraints) })
      return
    }

    try {
      await this._otpService.requestOtp(dto.email, 'user')
      res.status(STATUS_CODE.OK).json({ message: 'OTP sent to email' })
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
      logger.error('Error in requestOtp:', error)
    }
  }

  verifyOtp = async (req: Request, res: Response) => {
    const dto = plainToInstance(VerifyOtpDto, req.body)
    const errors = await validate(dto)
    if (errors.length > 0) {
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ errors: errors.map(e => e.constraints) })
      return
    }

    try {
      await this._otpService.verifyOtp(dto.email, dto.otp)
      const { user, accessToken, refreshToken } =
        await this._userService.registerUser(dto.name, dto.email, dto.password)
      this._jwtService.setTokens(res, accessToken, refreshToken)
      res.status(STATUS_CODE.CREATED).json({ user })
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
      logger.error('Error in verifyOtp:', error)
    }
  }

  async checkUsername (req: Request, res: Response) {
    const dto = plainToInstance(CheckUsernameDto, req.body)
    const errors = await validate(dto)
    if (errors.length > 0) {
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ errors: errors.map(e => e.constraints) })
      return
    }

    try {
      const isAvailable = await this._userService.checkUsername(dto.username)
      res.status(STATUS_CODE.OK).json({ isAvailable })
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
    }
  }

  forgotPassword = async (req: Request, res: Response) => {
    const dto = plainToInstance(ForgotPasswordDto, req.body)
    const errors = await validate(dto)
    if (errors.length > 0) {
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ errors: errors.map(e => e.constraints) })
      return
    }

    try {
      await this._otpService.requestForgotPasswordOtp(dto.email, 'user')
      res.status(STATUS_CODE.OK).json({ message: 'OTP Successfully Sent' })
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
    }
  }

  verifyForgotPasswordOtp = async (req: Request, res: Response) => {
    const dto = plainToInstance(VerifyForgotPasswordOtpDto, req.body)
    const errors = await validate(dto)
    if (errors.length > 0) {
      return res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ errors: errors.map(e => e.constraints) })
    }

    try {
      await this._otpService.verifyOtp(dto.email, dto.otp)
      res
        .status(STATUS_CODE.OK)
        .json({ message: 'OTP verified. You can now reset your password.' })
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
    }
  }

  resetPassword = async (req: Request, res: Response) => {
    const dto = plainToInstance(ResetPasswordDto, req.body)
    const errors = await validate(dto)
    if (errors.length > 0) {
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ errors: errors.map(e => e.constraints) })
      return
    }

    try {
      await this._userService.resetPassword(dto.email, dto.newPassword)
      res.status(STATUS_CODE.OK).json({ message: 'Password reset successful' })
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
    }
  }

  async googleLogin (req: Request, res: Response) {
    const dto = plainToInstance(GoogleLoginDto, req.body)
    const errors = await validate(dto)
    if (errors.length > 0) {
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ errors: errors.map(e => e.constraints) })
      return
    }

    try {
      const { user, accessToken, refreshToken } =
        await this._userService.loginWithGoogle(dto.idToken)
      this._jwtService.setTokens(res, accessToken, refreshToken)
      res.status(STATUS_CODE.OK).json({ user })
    } catch (error: any) {
      res
        .status(STATUS_CODE.UNAUTHORIZED)
        .json({ error: error.message || 'Login failed' })
      logger.error('google login error:', error)
    }
  }

  googleCallback = (req: Request, res: Response) => {
    passport.authenticate(
      'google',
      { session: false },
      async (err: any, user: any) => {
        if (err || !user) {
          return res.redirect('http://localhost:5173/signup?error=auth_failed')
        }

        try {
          const { accessToken, refreshToken } =
            await this._userService.loginWithGoogle(user)
          this._jwtService.setTokens(res, accessToken, refreshToken)
          res.redirect(`http://localhost:5173/callback?token=${accessToken}`)
        } catch (error: any) {
          res.redirect(`http://localhost:5173/signup?error=${error.message}`)
        }
      }
    )(req, res)
  }

  login = async (req: Request, res: Response) => {
    const dto = plainToInstance(LoginDto, req.body)
    const errors = await validate(dto)
    if (errors.length > 0) {
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ errors: errors.map(e => e.constraints) })
      return
    }

    try {
      const { user, accessToken, refreshToken } =
        await this._userService.loginUser(dto.email, dto.password)
      this._jwtService.setTokens(res, accessToken, refreshToken)
      const streak = await this._streakService.checkAndResetUserStreak(user._id)
      res.status(STATUS_CODE.OK).json({ user, streak })
    } catch (error: any) {
      res.status(STATUS_CODE.UNAUTHORIZED).json({ error: error.message })
      logger.error('login error:', error)
    }
  }

  checkSession = async (req: Request, res: Response) => {
    try {
      const user = req.user as { id: string; role: string }
      res.json({ valid: true, id: user.id, role: user.role })
    } catch (err) {
      res
        .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ error: 'Server error' })
    }
  }

  resendOtp = async (req: Request, res: Response) => {
    const dto = plainToInstance(ResendOtpDto, req.body)
    const errors = await validate(dto)
    if (errors.length > 0) {
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ errors: errors.map(e => e.constraints) })
      return
    }

    try {
      await this._otpService.requestOtp(dto.email, 'user')
      res.status(STATUS_CODE.OK).json({ message: 'OTP resent to email' })
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
    }
  }

  async getTrainers (req: Request, res: Response): Promise<void> {
    const dto = plainToInstance(GetTrainersQueryDto, req.query)
    const errors = await validate(dto)
    if (errors.length > 0) {
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ errors: errors.map(e => e.constraints) })
      return
    }

    try {
     const page = Number(dto.page) || 1;
      const limit = Number(dto.limit) || 5;
      const search = dto.search || '';
      const result = await this._trainerService.getAllTrainers(
        page,
        limit,
        search,
        'false',
        'true'
      )
      res.status(STATUS_CODE.OK).json({ trainers: result })
    } catch (error: any) {
      logger.error('Controller error:', error)
      res
        .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ error: 'Failed to fetch trainers' })
    }
  }

  async getIndividualTrainer (req: Request, res: Response): Promise<void> {
    const dto = plainToInstance(GetIndividualTrainerParamsDto, req.params)
    const errors = await validate(dto)
    if (errors.length > 0) {
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ errors: errors.map(e => e.constraints) })
      return
    }

    try {
      const trainer = await this._trainerService.getTrainerById(dto.id)
      res.status(STATUS_CODE.OK).json({ trainer })
    } catch (error: any) {
      res
        .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ error: 'Failed to fetch trainers' })
    }
  }

  async getMyTrainer (req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id
      const user = await this._userService.getUserById(userId)
      const trainer = await this._trainerService.getTrainerById(
        user!.assignedTrainer!.toString()
      )
      res.status(STATUS_CODE.OK).json({ trainer })
    } catch (error: any) {
      res
        .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ error: error.message })
    }
  }

  async cancelSubscription (req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id
      const user = await this._userService.getUserById(userId)
      if (!user || !user.assignedTrainer) {
        res
          .status(STATUS_CODE.BAD_REQUEST)
          .json({ message: 'No active subscription found' })
        return
      }
      await this._userService.cancelSubscription(
        userId,
        user.assignedTrainer.toString()
      )
      await this._trainerService.removeClientFromTrainer(
        user.assignedTrainer.toString(),
        userId
      )
      res
        .status(STATUS_CODE.OK)
        .json({ message: 'Subscription cancelled successfully' })
    } catch (error: any) {
      logger.error('Error cancelling subscription:', error)
      res
        .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ error: error.message })
    }
  }

  async getProfile (req: Request, res: Response) {
    try {
      const jwtUser = req.user as JwtPayload
      const id = jwtUser.id
      const user = await this._userService.getProfile(id)
      res.status(STATUS_CODE.OK).json({ user })
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
    }
  }

  refreshAccessToken = async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken
    if (!token) {
      res
        .status(STATUS_CODE.UNAUTHORIZED)
        .json({ error: 'No refresh token provided' })
      return
    }

    try {
      const decoded = this._jwtService.verifyRefreshToken(token) as {
        id: string
        role: string
        tokenVersion: number
      }

      const accessToken = this._jwtService.generateAccessToken(
        decoded.id,
        decoded.role,
        decoded.tokenVersion
      )
      const refreshToken = this._jwtService.generateRefreshToken(
        decoded.id,
        decoded.role,
        decoded.tokenVersion
      )
      this._jwtService.setTokens(res, accessToken, refreshToken)

      res.status(STATUS_CODE.OK).json({ accessToken, refreshToken })
    } catch (err) {
      res
        .status(STATUS_CODE.FORBIDDEN)
        .json({ error: 'Invalid or expired refresh token' })
    }
  }

  logout = async (req: Request, res: Response) => {
    try {
      const user = req.user as JwtPayload
      await this._userService.incrementTokenVersion(user.id)
      this._jwtService.clearTokens(res)
    } catch (error) {
      res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: error })
    }
  }
}
