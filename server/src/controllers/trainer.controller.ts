import TYPES from '../core/types/types'
import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { ITrainerService } from '../core/interfaces/services/ITrainerService'
import { JwtService } from '../utils/jwt'
import { UploadedFile } from 'express-fileupload'
import { IOTPService } from '../core/interfaces/services/IOtpService'
import { IJwtService } from '../core/interfaces/services/IJwtService'
import { STATUS_CODE } from '../constants/status'
import { IUserService } from '../core/interfaces/services/IUserService'

@injectable()
export class TrainerController {
  constructor (
    @inject(TYPES.ITrainerService) private trainerService: ITrainerService,
    @inject(TYPES.IJwtService) private JwtService: IJwtService,
    @inject(TYPES.IOtpService) private otpService: IOTPService,
    @inject(TYPES.IUserService) private userService: IUserService
  ) {}
  async login (req: Request, res: Response): Promise<void> {
    const { email, password } = req.body
    try {
      const { trainer, accessToken, refreshToken } =
        await this.trainerService.loginTrainer(email, password)
      this.JwtService.setTokens(res, accessToken, refreshToken)
      res.status(STATUS_CODE.OK).json({ trainer })
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
      console.log(error.message)
    }
  }

  forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body
      await this.trainerService.forgotPassword(email)
      res.json({ message: 'OTP sent to email' })
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
    }
  }

  forgotPasswordResendOtp = async (req: Request, res: Response) => {
    const { email } = req.body
    try {
      await this.otpService.requestForgotPasswordOtp(email, 'trainer')
      res.status(STATUS_CODE.OK).json({ messsage: 'OTP Resent Successfully' })
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
      console.log(error.message)
    }
  }

  async requestOtp (req: Request, res: Response) {
    const { email } = req.body
    try {
      await this.otpService.requestOtp(email, 'trainer')
      res.status(STATUS_CODE.OK).json({ message: 'OTP sent successfully' })
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
      console.log(error.message)
    }
  }

  async verifyOtp (req: Request, res: Response) {
    try {
      const { email, otp } = req.body
      const verified = await this.otpService.verifyOtp(email, otp)
      res.status(STATUS_CODE.OK).json({ message: 'OTP Verified Succesfully' })
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
      console.log(err.message)
    }
  }

  resetPassword = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body
      await this.trainerService.resetPassword(email, password)
      res.json({ message: 'Password reset successfully' })
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
    }
  }
  async resendOtp (req: Request, res: Response) {
    const { email } = req.body
    try {
      await this.otpService.requestOtp(email, 'trainer')
      res.status(STATUS_CODE.OK).json({ messsage: 'OTP Resent Successfully' })
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
      console.log(error.message)
    }
  }

  async apply (req: Request, res: Response) {
    try {
      const {
        fullName,
        email,
        password,
        phone,
        location,
        experience,
        specialization,
        bio
      } = req.body
      const { certificate, profileImage } = req.files as {
        certificate: UploadedFile
        profileImage: UploadedFile
      }

      if (!certificate) {
        res
          .status(STATUS_CODE.BAD_REQUEST)
          .json({ error: 'Certificate file is required' })
        return
      }

      const trainerData = {
        name: fullName,
        email,
        password,
        phone,
        location,
        experience,
        specialization,
        bio,
        certificate,
        profileImage
      }

      const { trainer, accessToken, refreshToken } =
        await this.trainerService.applyAsTrainer(trainerData)
      this.JwtService.setTokens(res, accessToken, refreshToken)
      res.status(STATUS_CODE.CREATED).json({
        message: 'Application submitted successfully',
        trainer
      })
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({
        error: error.message || 'Failed to submit application'
      })
    }
  }

  async getData (req: Request, res: Response) {
    try {
      const id = (req as any).user?.id
      if (!id) {
        res
          .status(STATUS_CODE.BAD_REQUEST)
          .json({ error: 'Invalid trainer ID' })
        return
      }
      const trainer = await this.trainerService.getTrainerById(id)
      res.status(STATUS_CODE.OK).json({ trainer })
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
    }
  }

  async getClients (req: Request, res: Response) {
    try {
      const trainerId = (req as any).user?.id
      if (!trainerId) {
        res
          .status(STATUS_CODE.BAD_REQUEST)
          .json({ error: 'Invalid trainer ID' })
        return
      }
      const { page = 1, limit = 10, search = '' } = req.query
      const clients = await this.trainerService.getTrainerClients(
        trainerId,
        parseInt(page as string),
        parseInt(limit as string),
        search as string
      )
      res.status(STATUS_CODE.OK).json(clients)
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
    }
  }

  async getClient (req: Request, res: Response) {
    try {
      const clientId = req.params.id
      const client = await this.userService.getUserById(clientId)
      res.status(STATUS_CODE.OK).json({ user: client })
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
    }
  }

  async logout (req: Request, res: Response) {
    try {
      this.JwtService.clearTokens(res)
      res.status(STATUS_CODE.OK).json({ message: 'Logged out successfully' })
      return
    } catch (error) {
      console.error('Logout error:', error)
      res
        .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ error: 'Failed to log out' })
      return
    }
  }
}
