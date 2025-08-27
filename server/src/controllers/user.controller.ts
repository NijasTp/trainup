import { NextFunction, Request, Response } from 'express'
import { injectable, inject } from 'inversify'
import TYPES from '../core/types/types'
import { IUserService } from '../core/interfaces/services/IUserService'
import { IOTPService } from '../core/interfaces/services/IOtpService'
import { IUserRepository } from '../core/interfaces/repositories/IUserRepository'
import { OAuth2Client } from 'google-auth-library'
import { JwtService } from '../utils/jwt'
import { IUserController } from '../core/interfaces/controllers/IUserController'
import {
  IJwtService,
  JwtPayload
} from '../core/interfaces/services/IJwtService'
import { STATUS_CODE } from '../constants/status'
import passport from 'passport'
import { ITrainerService } from '../core/interfaces/services/ITrainerService'

@injectable()
export class UserController implements IUserController {
  constructor (
    @inject(TYPES.IUserService) private _userService: IUserService,
    @inject(TYPES.IOtpService) private _otpService: IOTPService,
    @inject(TYPES.ITrainerService) private _trainerService: ITrainerService,
    @inject(TYPES.IJwtService) private _jwtService: IJwtService
  ) {}

  requestOtp = async (req: Request, res: Response) => {
    const { email } = req.body
    try {
      await this._otpService.requestOtp(email, 'user')
      res.status(STATUS_CODE.OK).json({ message: 'OTP sent to email' })
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
      console.error('Error in requestOtp:', error)
    }
  }

  verifyOtp = async (req: Request, res: Response) => {
    const { email, otp, name, password } = req.body
    try {
      await this._otpService.verifyOtp(email, otp)
      const { user, accessToken, refreshToken } =
        await this._userService.registerUser(name, email, password)
      // Set cookies
      this._jwtService.setTokens(res, accessToken, refreshToken)
      res.status(STATUS_CODE.CREATED).json({ user })
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
      console.error('Error in verifyOtp:', error)
    }
  }

  async checkUsername (req: Request, res: Response) {
    try {
      const isAvailable = await this._userService.checkUsername(
        req.body.username
      )
      res.status(STATUS_CODE.OK).json({isAvailable})
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
    }
  }

  forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body
    try {
      await this._otpService.requestForgotPasswordOtp(email, 'user')
      res.status(STATUS_CODE.OK).json({ message: 'OTP Successfully Sent' })
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
    }
  }

  verifyForgotPasswordOtp = async (req: Request, res: Response) => {
    const { email, otp } = req.body
    try {
      await this._otpService.verifyOtp(email, otp)
      res
        .status(STATUS_CODE.OK)
        .json({ message: 'OTP verified. You can now reset your password.' })
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
    }
  }

  resetPassword = async (req: Request, res: Response) => {
    const { email, newPassword } = req.body
    try {
      await this._userService.resetPassword(email, newPassword)
      res.status(STATUS_CODE.OK).json({ message: 'Password reset successful' })
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
    }
  }

  async googleLogin (req: Request, res: Response) {
    const { idToken } = req.body
    if (!idToken) {
      res.status(400).json({ message: 'idToken is required' })
      return
    }
    try {
      const { user, accessToken, refreshToken } =
        await this._userService.loginWithGoogle(idToken)
      this._jwtService.setTokens(res, accessToken, refreshToken)
      res.status(STATUS_CODE.OK).json({ user })
    } catch (error: any) {
      res
        .status(STATUS_CODE.UNAUTHORIZED)
        .json({ error: error.message || 'Login failed' })
      console.error('Error in googleLogin:', error)
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
    const { email, password } = req.body
    try {
      const { user, accessToken, refreshToken } =
        await this._userService.loginUser(email, password)

      this._jwtService.setTokens(res, accessToken, refreshToken)
      res.status(STATUS_CODE.OK).json({ user })
    } catch (error: any) {
      res.status(STATUS_CODE.UNAUTHORIZED).json({ error: error.message })
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
    const { email } = req.body
    console.log('Resending OTP to:', email)
    try {
      await this._otpService.requestOtp(email, 'user')
      res.status(STATUS_CODE.OK).json({ message: 'OTP resent to email' })
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
    }
  }

  async getTrainers (req: Request, res: Response): Promise<void> {
    try {
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 5
      const search = String(req.query.search || '')

      const result = await this._trainerService.getAllTrainers(
        page,
        limit,
        search,
        'false',
        'true'
      )
      res.status(STATUS_CODE.OK).json({ trainers: result })
    } catch (error: any) {
      console.error('Controller error:', error)
      res
        .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ error: 'Failed to fetch trainers' })
    }
  }

  async getIndividualTrainer(req: Request, res: Response): Promise<void> {
    try {
      const trainer = await this._trainerService.getTrainerById(req.params.id)
      res.status(STATUS_CODE.OK).json({ trainer })
    }catch (error: any) {
      res
        .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ error: 'Failed to fetch trainers' })
    }
  }

   async getMyTrainer(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id; 
            const user = await this._userService.getUserById(userId);
            const trainer = await this._trainerService.getTrainerById(user!.assignedTrainer!.toString());
            res.status(STATUS_CODE.OK).json({ trainer });
        } catch (error: any) {
            console.error("Error fetching my trainer:", error);
            res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }

        async cancelSubscription(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id;
            const user = await this._userService.getUserById(userId);
            if (!user || !user.assignedTrainer) {
                res.status(STATUS_CODE.BAD_REQUEST).json({ message: "No active subscription found" });
                return;
            }
            await this._userService.cancelSubscription(userId, user.assignedTrainer.toString());
            await this._trainerService.removeClientFromTrainer(user.assignedTrainer.toString(), userId);
            res.status(STATUS_CODE.OK).json({ message: "Subscription cancelled successfully" });
        } catch (error: any) {
            console.error("Error cancelling subscription:", error);
            res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: error.message });
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

      return
    } catch (err) {
      res
        .status(STATUS_CODE.FORBIDDEN)
        .json({ error: 'Invalid or expired refresh token' })
      return
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
