import { Request, Response, NextFunction } from 'express'
import { inject, injectable } from 'inversify'
import TYPES from '../core/types/types'
import { ITrainerService } from '../core/interfaces/services/ITrainerService'
import { ITransactionService } from '../core/interfaces/services/ITransactionService'
import { IWeeklyScheduleService } from '../core/interfaces/services/IWeeklyScheduleService'
import { UploadedFile } from 'express-fileupload'
import { IOTPService } from '../core/interfaces/services/IOtpService'
import {
  IJwtService,
  JwtPayload
} from '../core/interfaces/services/IJwtService'
import { STATUS_CODE } from '../constants/status'
import { IUserService } from '../core/interfaces/services/IUserService'
import { ISlotService } from '../core/interfaces/services/ISlotService'
import { IMessageService } from '../core/interfaces/services/IMessageService'
import { IUserPlanService } from '../core/interfaces/services/IUserPlanService'
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
import { MESSAGES } from '../constants/messages.constants'
import { AppError } from '../utils/appError.util'
import { Role } from '../constants/role'

@injectable()
export class TrainerController {
  constructor(
    @inject(TYPES.ITrainerService) private _trainerService: ITrainerService,
    @inject(TYPES.ITransactionService)
    private _transactionService: ITransactionService,
    @inject(TYPES.IWeeklyScheduleService)
    private _weeklyScheduleService: IWeeklyScheduleService,
    @inject(TYPES.IJwtService) private _JwtService: IJwtService,
    @inject(TYPES.IOtpService) private otpService: IOTPService,
    @inject(TYPES.IUserService) private _userService: IUserService,
    @inject(TYPES.ISlotService) private _slotService: ISlotService,
    @inject(TYPES.IMessageService) private _messageService: IMessageService,
    @inject(TYPES.IUserPlanService) private _userPlanService: IUserPlanService
  ) { }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: TrainerLoginDto = req.body
      const result: TrainerLoginResponseDto =
        await this._trainerService.loginTrainer(dto.email, dto.password)
      this._JwtService.setTokens(res, result.accessToken, result.refreshToken)
      res.status(STATUS_CODE.OK).json({ trainer: result.trainer })
    } catch (err) {
      logger.error('Login error:', err)
      next(err)
    }
  }

  async getDashboard(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const trainerId = (req.user as JwtPayload).id
      const dashboard = await this._trainerService.getDashboardStats(trainerId)
      res.status(STATUS_CODE.OK).json(dashboard)
    } catch (err) {
      logger.error('Error fetching dashboard:', err)
      next(err)
    }
  }

  async getTransactions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const trainerId = (req.user as JwtPayload).id
      const page = parseInt(String(req.query.page)) || 1
      const limit = parseInt(String(req.query.limit)) || 10
      const search = String(req.query.search || '')
      const status = String(req.query.status || '')
      const planType = String(req.query.planType || '')

      const transactions =
        await this._transactionService.getTrainerTransactions(
          trainerId,
          page,
          limit,
          search,
          status,
          planType
        )
      res.status(STATUS_CODE.OK).json(transactions)
    } catch (err) {
      logger.error('Error fetching transactions:', err)
      next(err)
    }
  }

  async updateAvailability(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const trainerId = (req.user as JwtPayload).id
      const { isAvailable, unavailableReason } = req.body

      await this._trainerService.updateAvailability(
        trainerId,
        isAvailable,
        unavailableReason
      )
      res
        .status(STATUS_CODE.OK)
        .json({ message: 'Availability updated successfully' })
    } catch (err) {
      logger.error('Error updating availability:', err)
      next(err)
    }
  }

  async getWeeklySchedule(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const trainerId = (req.user as JwtPayload).id
      const weekStart = req.query.weekStart
        ? new Date(String(req.query.weekStart))
        : undefined

      const schedule = await this._weeklyScheduleService.getTrainerSchedule(
        trainerId,
        weekStart
      )
      res.status(STATUS_CODE.OK).json({ schedule })
    } catch (err) {
      logger.error('Error fetching weekly schedule:', err)
      next(err)
    }
  }

  async saveWeeklySchedule(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const trainerId = (req.user as JwtPayload).id
      const scheduleData = { ...req.body, trainerId }

      const schedule = await this._weeklyScheduleService.createOrUpdateSchedule(
        scheduleData
      )
      res
        .status(STATUS_CODE.OK)
        .json({ schedule, message: 'Schedule saved successfully' })
    } catch (err) {
      logger.error('Error saving weekly schedule:', err)
      next(err)
    }
  }

  async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto: TrainerForgotPasswordDto = req.body
      await this._trainerService.forgotPassword(dto.email)
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT })
    } catch (err) {
      next(err)
    }
  }

  async forgotPasswordResendOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto: TrainerRequestOtpDto = req.body
      await this.otpService.requestForgotPasswordOtp(dto.email, Role.TRAINER)
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT })
    } catch (err) {
      logger.error('Forgot password resend OTP error:', err)
      next(err)
    }
  }

  async requestOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto: TrainerRequestOtpDto = req.body
      await this.otpService.requestOtp(dto.email, Role.TRAINER)
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT })
    } catch (err) {
      logger.error('Request OTP error:', err)
      next(err)
    }
  }

  async verifyOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto: TrainerVerifyOtpDto = req.body
      await this.otpService.verifyOtp(dto.email, dto.otp)
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_VERIFIED })
    } catch (err) {
      logger.error('Verify OTP error:', err)
      next(err)
    }
  }

  async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto: TrainerResetPasswordDto = req.body
      await this._trainerService.resetPassword(dto.email, dto.password)
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.PASSWORD_RESET })
    } catch (err) {
      next(err)
    }
  }

  async resendOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
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

      if (!certificate)
        throw new AppError(
          MESSAGES.CERTIFICATE_REQUIRED,
          STATUS_CODE.BAD_REQUEST
        )

      const priceData = typeof dto.price === 'string' ? JSON.parse(dto.price) : dto.price;

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

      const result: TrainerLoginResponseDto =
        await this._trainerService.applyAsTrainer(trainerData)
      this._JwtService.setTokens(res, result.accessToken, result.refreshToken)
      res.status(STATUS_CODE.CREATED).json({
        message: MESSAGES.APPLICATION_SUBMITTED,
        trainer: result.trainer
      })
    } catch (err) {
      next(err)
    }
  }

  async reapply(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto: TrainerReapplyDto = req.body
      const trainerId = (req.user as JwtPayload).id
      const { certificate, profileImage } = req.files as {
        certificate?: UploadedFile
        profileImage?: UploadedFile
      }
      if (!certificate)
        throw new AppError(
          MESSAGES.CERTIFICATE_REQUIRED,
          STATUS_CODE.BAD_REQUEST
        )

      const priceData = typeof dto.price === 'string' ? JSON.parse(dto.price) : dto.price;

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
      res
        .status(STATUS_CODE.OK)
        .json({ message: MESSAGES.APPLICATION_SUBMITTED })
    } catch (err) {
      logger.error('Trainer reapply error:', err)
      next(err)
    }
  }

  async getData(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = (req.user as JwtPayload).id
      if (!id)
        throw new AppError(MESSAGES.INVALID_TRAINER_ID, STATUS_CODE.BAD_REQUEST)
      const trainer: TrainerResponseDto =
        await this._trainerService.getTrainerById(id)
      if (!trainer)
        throw new AppError(MESSAGES.TRAINER_NOT_FOUND, STATUS_CODE.NOT_FOUND)
      res.status(STATUS_CODE.OK).json({ trainer })
    } catch (err) {
      next(err)
    }
  }

  async getClients(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const trainerId = (req.user as JwtPayload).id
      if (!trainerId)
        throw new AppError(MESSAGES.INVALID_TRAINER_ID, STATUS_CODE.BAD_REQUEST)
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
      next(err)
    }
  }

  async getClient(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto: GetClientParamsDto = { id: req.params.id }
      const client = await this._userService.getUserById(dto.id)
      if (!client)
        throw new AppError(MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND)
      const response: GetClientResponseDto = { user: client }
      res.status(STATUS_CODE.OK).json(response)
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

  async getSlots(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const trainerId = (req.user as JwtPayload).id
      const slots = await this._slotService.getTrainerSlots(trainerId)
      res.status(STATUS_CODE.OK).json({ slots })
    } catch (err) {
      logger.error('Error fetching trainer slots:', err)
      next(err)
    }
  }

  async createSlot(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const trainerId = (req.user as JwtPayload).id
      const { date, startTime, endTime } = req.body

      if (!date || !startTime || !endTime) {
        throw new AppError(
          'Date, startTime, and endTime are required',
          STATUS_CODE.BAD_REQUEST
        )
      }

      const slot = await this._slotService.createSlot(
        trainerId,
        new Date(date),
        startTime,
        endTime
      )
      res
        .status(STATUS_CODE.CREATED)
        .json({ slot, message: 'Slot created successfully' })
    } catch (err) {
      logger.error('Error creating slot:', err)
      next(err)
    }
  }

  async deleteSlot(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const trainerId = (req.user as JwtPayload).id
      const { slotId } = req.params

      await this._slotService.deleteSlot(slotId, trainerId)
      res.status(STATUS_CODE.OK).json({ message: 'Slot deleted successfully' })
    } catch (err) {
      logger.error('Error deleting slot:', err)
      next(err)
    }
  }

  async getSessionRequests(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const trainerId = (req.user as JwtPayload).id
      const requests = await this._slotService.getTrainerSessionRequests(
        trainerId
      )
      res.status(STATUS_CODE.OK).json({ requests })
    } catch (err) {
      logger.error('Error fetching session requests:', err)
      next(err)
    }
  }

  async approveSessionRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const trainerId = (req.user as JwtPayload).id
      const { requestId, userId } = req.params

      if (!userId) {
        throw new AppError(
          'User ID is required for approval',
          STATUS_CODE.BAD_REQUEST
        )
      }

      await this._slotService.approveSessionRequest(
        requestId,
        userId,
        trainerId
      )
      res
        .status(STATUS_CODE.OK)
        .json({ message: 'Session request approved successfully' })
    } catch (err) {
      logger.error('Error approving session request:', err)
      next(err)
    }
  }

  async rejectSessionRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const trainerId = (req.user as JwtPayload).id
      const { requestId, userId } = req.params
      const { rejectionReason } = req.body

      if (!userId) {
        throw new AppError(
          'User ID is required for rejection',
          STATUS_CODE.BAD_REQUEST
        )
      }
      if (!rejectionReason) {
        throw new AppError(
          'Rejection reason is required',
          STATUS_CODE.BAD_REQUEST
        )
      }

      await this._slotService.rejectSessionRequest(
        requestId,
        userId,
        trainerId,
        rejectionReason
      )
      res
        .status(STATUS_CODE.OK)
        .json({ message: 'Session request rejected successfully' })
    } catch (err) {
      logger.error('Error rejecting session request:', err)
      next(err)
    }
  }

  async getClientDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { clientId } = req.params
      const client = await this._userService.getUserById(clientId)
      if (!client) throw new AppError('Client not found', STATUS_CODE.NOT_FOUND)
      res.status(STATUS_CODE.OK).json({ client })
    } catch (err) {
      logger.error('Error fetching client details:', err)
      next(err)
    }
  }

  async getChatMessages(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const trainerId = (req.user as JwtPayload).id
      const { clientId } = req.params

      const messages = await this._messageService.getMessages(
        trainerId,
        clientId
      )
      res.status(STATUS_CODE.OK).json({ messages })
    } catch (err) {
      logger.error('Error fetching chat messages:', err)
      next(err)
    }
  }

  async getUnreadCounts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const trainerId = (req.user as JwtPayload).id
      const counts = await this._messageService.getUnreadCountsBySender(trainerId)
      res.status(STATUS_CODE.OK).json({ counts })
    } catch (err) {
      next(err)
    }
  }

  async markMessagesAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const trainerId = (req.user as JwtPayload).id
      const { clientId } = req.params
      await this._messageService.markMessagesAsRead(clientId, trainerId)
      res.status(STATUS_CODE.OK).json({ message: 'Messages marked as read' })
    } catch (err) {
      next(err)
    }
  }

  async getUserPlan(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const trainerId = (req.user as JwtPayload).id
      const { id: userId } = req.params

      const plan = await this._userPlanService.getUserPlan(userId, trainerId)
      res.status(STATUS_CODE.OK).json({ plan })
    } catch (err) {
      logger.error('Error fetching user plan:', err)
      next(err)
    }
  }

  async getTrainerApplication(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params
      const application = await this._trainerService.getTrainerApplication(id)
      res.status(STATUS_CODE.OK).json({ application })
    } catch (err) {
      logger.error('Error fetching trainer application:', err)
      next(err)
    }
  }
  async uploadChatFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.files || !req.files.file) {
        throw new AppError('No file uploaded', STATUS_CODE.BAD_REQUEST)
      }
      const file = req.files.file as UploadedFile
      const fileUrl = await this._userService.uploadChatFile(file)
      res.status(STATUS_CODE.OK).json({ fileUrl })
    } catch (err) {
      next(err)
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const trainerId = (req.user as JwtPayload).id
      const updateData = req.body
      let profileImage: UploadedFile | undefined;
      if (req.files?.profileImage) {
        profileImage = Array.isArray(req.files.profileImage)
          ? req.files.profileImage[0]
          : (req.files.profileImage as UploadedFile);
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
}