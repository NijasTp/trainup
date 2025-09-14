import TYPES from '../core/types/types'
import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { ITrainerService } from '../core/interfaces/services/ITrainerService'
import { UploadedFile } from 'express-fileupload'
import { IOTPService } from '../core/interfaces/services/IOtpService'
import {
  IJwtService,
  JwtPayload
} from '../core/interfaces/services/IJwtService'
import { STATUS_CODE } from '../constants/status'
import { IUserService } from '../core/interfaces/services/IUserService'
import { logger } from '../utils/logger.util'
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
  TrainerResponseDto,
  GetClientsQueryDto,
  GetClientsResponseDto,
  GetClientParamsDto,
  GetClientResponseDto
} from '../dtos/trainer.dto'

@injectable()
export class TrainerController {
  constructor (
    @inject(TYPES.ITrainerService) private _trainerService: ITrainerService,
    @inject(TYPES.IJwtService) private _JwtService: IJwtService,
    @inject(TYPES.IOtpService) private otpService: IOTPService,
    @inject(TYPES.IUserService) private userService: IUserService
  ) {}
  
  async login (req: Request, res: Response): Promise<void> {
    const dto: TrainerLoginDto = req.body
    try {
      const result: TrainerLoginResponseDto = await this._trainerService.loginTrainer(dto.email, dto.password)
      this._JwtService.setTokens(res, result.accessToken, result.refreshToken)
      res.status(STATUS_CODE.OK).json({ trainer: result.trainer })
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
      console.log(error.message)
    }
  }

  forgotPassword = async (req: Request, res: Response) => {
    try {
      const dto: TrainerForgotPasswordDto = req.body
      await this._trainerService.forgotPassword(dto.email)
      res.json({ message: 'OTP sent to email' })
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
    }
  }

  forgotPasswordResendOtp = async (req: Request, res: Response) => {
    const dto: TrainerRequestOtpDto = req.body
    try {
      await this.otpService.requestForgotPasswordOtp(dto.email, 'trainer')
      res.status(STATUS_CODE.OK).json({ messsage: 'OTP Resent Successfully' })
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
      console.log(error.message)
    }
  }

  async requestOtp (req: Request, res: Response) {
    const dto: TrainerRequestOtpDto = req.body
    try {
      await this.otpService.requestOtp(dto.email, 'trainer')
      res.status(STATUS_CODE.OK).json({ message: 'OTP sent successfully' })
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
      console.log(error.message)
    }
  }

  async verifyOtp (req: Request, res: Response) {
    try {
      const dto: TrainerVerifyOtpDto = req.body
      const verified = await this.otpService.verifyOtp(dto.email, dto.otp)
      res.status(STATUS_CODE.OK).json({ message: 'OTP Verified Succesfully' })
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
      console.log(err.message)
    }
  }

  resetPassword = async (req: Request, res: Response) => {
    try {
      const dto: TrainerResetPasswordDto = req.body
      await this._trainerService.resetPassword(dto.email, dto.password)
      res.json({ message: 'Password reset successfully' })
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
    }
  }
  
  async resendOtp (req: Request, res: Response) {
    const dto: TrainerResendOtpDto = req.body
    try {
      await this.otpService.requestOtp(dto.email, 'trainer')
      res.status(STATUS_CODE.OK).json({ messsage: 'OTP Resent Successfully' })
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
      console.log(error.message)
    }
  }

  async apply (req: Request, res: Response) {
    try {
      const dto: TrainerApplyDto = req.body
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
        name: dto.fullName,
        email: dto.email,
        password: dto.password,
        phone: dto.phone,
        price: dto.price,
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
        message: 'Application submitted successfully',
        trainer: result.trainer
      })
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({
        error: error.message || 'Failed to submit application'
      })
    }
  }

  async reapply (req: Request, res: Response) {
    try {
      const dto: TrainerReapplyDto = req.body
      const trainerId = (req.user as JwtPayload).id
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

      const data = {
        name: dto.fullName,
        email: dto.email,
        password: dto.password,
        phone: dto.phone,
        price: dto.price,
        location: dto.location,
        experience: dto.experience,
        specialization: dto.specialization,
        bio: dto.bio,
        certificate,
        profileImage
      }
      this._trainerService.reapplyAsTrainer(trainerId, data)
    } catch (error: any) {
      logger.error('trainer reapply error:', error)
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
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
      const trainer: TrainerResponseDto = await this._trainerService.getTrainerById(id)
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
      const dto: GetClientsQueryDto = req.query as any
      const page = parseInt(dto.page as any) || 1
      const limit = parseInt(dto.limit as any) || 10
      const search = dto.search || ''
      
      const clients: GetClientsResponseDto = await this._trainerService.getTrainerClients(
        trainerId,
        page,
        limit,
        search
      )
      res.status(STATUS_CODE.OK).json(clients)
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
    }
  }

  async getClient (req: Request, res: Response) {
    try {
      const dto: GetClientParamsDto = req.params as any
      const client = await this.userService.getUserById(dto.id)
      const response: GetClientResponseDto = { user: client as any }
      res.status(STATUS_CODE.OK).json(response)
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
    }
  }

  async logout (req: Request, res: Response) {
    try {
      this._JwtService.clearTokens(res)
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