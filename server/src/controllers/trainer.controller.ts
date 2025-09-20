import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import TYPES from '../core/types/types'
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
import { MESSAGES } from '../constants/messages'

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
      const result: TrainerLoginResponseDto =
        await this._trainerService.loginTrainer(dto.email, dto.password)
      this._JwtService.setTokens(res, result.accessToken, result.refreshToken)
      res.status(STATUS_CODE.OK).json({ trainer: result.trainer })
    } catch (err) {
      const error = err as Error
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.LOGIN_FAILED })
      logger.error('Login error:', error)
    }
  }

  async forgotPassword (req: Request, res: Response): Promise<void> {
    try {
      const dto: TrainerForgotPasswordDto = req.body
      await this._trainerService.forgotPassword(dto.email)
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT })
    } catch (err) {
      const error = err as Error
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.INVALID_REQUEST })
    }
  }

  async forgotPasswordResendOtp (req: Request, res: Response): Promise<void> {
    const dto: TrainerRequestOtpDto = req.body
    try {
      await this.otpService.requestForgotPasswordOtp(dto.email, 'trainer')
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT })
    } catch (err) {
      const error = err as Error
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.INVALID_REQUEST })
      logger.error('Forgot password resend OTP error:', error)
    }
  }

  async requestOtp (req: Request, res: Response): Promise<void> {
    const dto: TrainerRequestOtpDto = req.body
    try {
      await this.otpService.requestOtp(dto.email, 'trainer')
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT })
    } catch (err) {
      const error = err as Error
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.INVALID_REQUEST })
      logger.error('Request OTP error:', error)
    }
  }

  async verifyOtp (req: Request, res: Response): Promise<void> {
    try {
      const dto: TrainerVerifyOtpDto = req.body
      await this.otpService.verifyOtp(dto.email, dto.otp)
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_VERIFIED })
    } catch (err) {
      const error = err as Error
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.INVALID_REQUEST })
      logger.error('Verify OTP error:', error)
    }
  }

  async resetPassword (req: Request, res: Response): Promise<void> {
    try {
      const dto: TrainerResetPasswordDto = req.body
      await this._trainerService.resetPassword(dto.email, dto.password)
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.PASSWORD_RESET })
    } catch (err) {
      const error = err as Error
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.INVALID_REQUEST })
    }
  }

  async resendOtp (req: Request, res: Response): Promise<void> {
    const dto: TrainerResendOtpDto = req.body
    try {
      await this.otpService.requestOtp(dto.email, 'trainer')
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT })
    } catch (err) {
      const error = err as Error
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.INVALID_REQUEST })
      logger.error('Resend OTP error:', error)
    }
  }

  async apply (req: Request, res: Response): Promise<void> {
    try {
      const dto: TrainerApplyDto = req.body
      const { certificate, profileImage } = req.files as {
        certificate?: UploadedFile
        profileImage?: UploadedFile
      }

      if (!certificate) {
        res
          .status(STATUS_CODE.BAD_REQUEST)
          .json({ error: MESSAGES.CERTIFICATE_REQUIRED })
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

      const result: TrainerLoginResponseDto =
        await this._trainerService.applyAsTrainer(trainerData)
      this._JwtService.setTokens(res, result.accessToken, result.refreshToken)
      res.status(STATUS_CODE.CREATED).json({
        message: MESSAGES.APPLICATION_SUBMITTED,
        trainer: result.trainer
      })
    } catch (err) {
      const error = err as Error
      res.status(STATUS_CODE.BAD_REQUEST).json({
        error: error.message || MESSAGES.APPLICATION_FAILED
      })
    }
  }

  async reapply (req: Request, res: Response): Promise<void> {
    try {
      const dto: TrainerReapplyDto = req.body
      const trainerId = (req.user as JwtPayload).id
      const { certificate, profileImage } = req.files as {
        certificate?: UploadedFile
        profileImage?: UploadedFile
      }
      if (!certificate) {
        res
          .status(STATUS_CODE.BAD_REQUEST)
          .json({ error: MESSAGES.CERTIFICATE_REQUIRED })
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
      await this._trainerService.reapplyAsTrainer(trainerId, data)
      res
        .status(STATUS_CODE.OK)
        .json({ message: MESSAGES.APPLICATION_SUBMITTED })
    } catch (err) {
      const error = err as Error
      logger.error('Trainer reapply error:', error)
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.APPLICATION_FAILED })
    }
  }

  async getData (req: Request, res: Response): Promise<void> {
    try {
      const id = (req.user as JwtPayload).id
      if (!id) {
        res
          .status(STATUS_CODE.BAD_REQUEST)
          .json({ error: MESSAGES.INVALID_TRAINER_ID })
        return
      }
      const trainer: TrainerResponseDto =
        await this._trainerService.getTrainerById(id)
      res.status(STATUS_CODE.OK).json({ trainer })
    } catch (err) {
      const error = err as Error
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.TRAINER_NOT_FOUND })
    }
  }

  async getClients (req: Request, res: Response): Promise<void> {
    try {
      const trainerId = (req.user as JwtPayload).id
      if (!trainerId) {
        res
          .status(STATUS_CODE.BAD_REQUEST)
          .json({ error: MESSAGES.INVALID_TRAINER_ID })
        return
      }
      const dto: GetClientsQueryDto = req.query
      const page = parseInt(String(dto.page)) || 1
      const limit = parseInt(String(dto.limit)) || 10
      const search = String(dto.search || '')

      const clients: GetClientsResponseDto =
        await this._trainerService.getTrainerClients(
          trainerId,
          page,
          limit,
          search
        )
      res.status(STATUS_CODE.OK).json(clients)
    } catch (err) {
      const error = err as Error
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.FAILED_TO_FETCH.USERS })
    }
  }

  async getClient (req: Request, res: Response): Promise<void> {
    try {
      const dto: GetClientParamsDto = { id: req.params.id }
      const client = await this.userService.getUserById(dto.id)
      if (!client) {
        res
          .status(STATUS_CODE.NOT_FOUND)
          .json({ error: MESSAGES.USER_NOT_FOUND })
        return
      }
      const response: GetClientResponseDto = { user: client }
      res.status(STATUS_CODE.OK).json(response)
    } catch (err) {
      const error = err as Error
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.USER_NOT_FOUND })
    }
  }

  async logout (req: Request, res: Response): Promise<void> {
    try {
      this._JwtService.clearTokens(res)
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.DELETED })
    } catch (err) {
      const error = err as Error
      logger.error('Logout error:', error)
      res
        .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ error: error.message || MESSAGES.FAILED_TO_LOGOUT })
    }
  }
}
