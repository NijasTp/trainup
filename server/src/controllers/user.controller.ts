import { Request, Response, NextFunction } from 'express'
import { injectable, inject } from 'inversify'
import TYPES from '../core/types/types'
import { IUserService } from '../core/interfaces/services/IUserService'
import { IOTPService } from '../core/interfaces/services/IOtpService'
import { ITrainerService } from '../core/interfaces/services/ITrainerService'
import {
  IJwtService,
  JwtPayload
} from '../core/interfaces/services/IJwtService'
import { IStreakService } from '../core/interfaces/services/IStreakService'
import { ISlotService } from '../core/interfaces/services/ISlotService'
import { IMessageService } from '../core/interfaces/services/IMessageService'
import { IUserPlanService } from '../core/interfaces/services/IUserPlanService'
import { IUserController } from '../core/interfaces/controllers/IUserController'
import { INotificationService } from '../core/interfaces/services/INotificationService'
import { NOTIFICATION_TYPES, NOTIFICATION_MESSAGES } from '../constants/notification.constants'
import { STATUS_CODE } from '../constants/status'
import { logger } from '../utils/logger.util'
import {
  RequestOtpDto,
  VerifyOtpDto,
  CheckUsernameDto,
  CheckUsernameResponseDto,
  ForgotPasswordDto,
  VerifyForgotPasswordOtpDto,
  ResetPasswordDto,
  GoogleLoginDto,
  LoginDto,
  LoginResponseDto,
  ResendOtpDto,
  GetTrainersQueryDto,
  GetTrainersResponseDto,
  GetIndividualTrainerResponseDto,
  GetMyTrainerResponseDto,
  RefreshTokenResponseDto,
  AddWeightDto
} from '../dtos/user.dto'
import { MESSAGES } from '../constants/messages.constants'
import { AppError } from '../utils/appError.util'
import { IGymService } from '../core/interfaces/services/IGymService'
import { UploadedFile } from 'express-fileupload'
import { IProgressService } from '../core/interfaces/services/IProgressService'
import { IReviewService } from '../core/interfaces/services/IReviewService'

@injectable()
export class UserController implements IUserController {
  constructor(
    @inject(TYPES.IUserService) private _userService: IUserService,
    @inject(TYPES.IOtpService) private _otpService: IOTPService,
    @inject(TYPES.ITrainerService) private _trainerService: ITrainerService,
    @inject(TYPES.IJwtService) private _jwtService: IJwtService,
    @inject(TYPES.IStreakService) private _streakService: IStreakService,
    @inject(TYPES.ISlotService) private _slotService: ISlotService,
    @inject(TYPES.IMessageService) private _messageService: IMessageService,
    @inject(TYPES.IUserPlanService) private _userPlanService: IUserPlanService,
    @inject(TYPES.IGymService) private _gymService: IGymService,
    @inject(TYPES.IReviewService) private _reviewService: IReviewService,
    @inject(TYPES.IProgressService) private _progressService: IProgressService,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService
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

  async verifyOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto: VerifyOtpDto = req.body
      await this._otpService.verifyOtp(dto.email, dto.otp)
      const result: LoginResponseDto = await this._userService.registerUser(
        dto.name,
        dto.email,
        dto.password
      )
      this._jwtService.setTokens(res, result.accessToken, result.refreshToken)
      res
        .status(STATUS_CODE.CREATED)
        .json({ user: result.user, message: MESSAGES.CREATED })
    } catch (err) {
      logger.error('Error in verifyOtp:', err)
      next(err)
    }
  }

  async checkUsername(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto: CheckUsernameDto = req.body
      const isAvailable = await this._userService.checkUsername(dto.username)
      const response: CheckUsernameResponseDto = { isAvailable }
      res.status(STATUS_CODE.OK).json(response)
    } catch (err) {
      next(err)
    }
  }

  async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto: ForgotPasswordDto = req.body
      await this._otpService.requestForgotPasswordOtp(dto.email, 'user')
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT })
    } catch (err) {
      next(err)
    }
  }

  async verifyForgotPasswordOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto: VerifyForgotPasswordOtpDto = req.body
      await this._otpService.verifyOtp(dto.email, dto.otp)
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_VERIFIED })
    } catch (err) {
      next(err)
    }
  }

  async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto: ResetPasswordDto = req.body
      await this._userService.resetPassword(dto.email, dto.newPassword)
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.PASSWORD_RESET })
    } catch (err) {
      next(err)
    }
  }

  async googleLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto: GoogleLoginDto = req.body
      const result: LoginResponseDto = await this._userService.loginWithGoogle(
        dto.idToken
      )
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
      const result: LoginResponseDto = await this._userService.loginUser(
        dto.email,
        dto.password
      )
      this._jwtService.setTokens(res, result.accessToken, result.refreshToken)
      const streak = await this._streakService.checkAndResetUserStreak(
        result.user._id
      )
      const response = { ...result, streak }
      res.status(STATUS_CODE.OK).json(response)
    } catch (err) {
      logger.error('Login error:', err)
      next(err)
    }
  }

  async checkSession(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user as JwtPayload
      res
        .status(STATUS_CODE.OK)
        .json({ valid: true, id: user.id, role: user.role })
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
      const dto: ResendOtpDto = req.body
      await this._otpService.requestOtp(dto.email, 'user')
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT })
    } catch (err) {
      next(err)
    }
  }

  async getTrainers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto: GetTrainersQueryDto = req.query
      const page = Number(dto.page) || 1
      const limit = Number(dto.limit) || 8
      const search = String(dto.search || '')
      const specialization = String(dto.specialization || '')
      const experience = String(dto.experience || '')
      const minRating = String(dto.minRating || '')
      const minPrice = String(dto.minPrice || '')
      const maxPrice = String(dto.maxPrice || '')
      const result = await this._trainerService.getAllTrainers(
        page,
        limit,
        search,
        'active',
        'verified',
        undefined,
        undefined,
        specialization,
        experience,
        minRating,
        minPrice,
        maxPrice
      )
      const response: GetTrainersResponseDto = { trainers: result }
      res.status(STATUS_CODE.OK).json(response)
    } catch (err) {
      logger.error('Controller error:', err)
      next(err)
    }
  }

  async getIndividualTrainer(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const trainer = await this._trainerService.getTrainerById(req.params.id)
      if (!trainer)
        throw new AppError(MESSAGES.TRAINER_NOT_FOUND, STATUS_CODE.NOT_FOUND)
      const response: GetIndividualTrainerResponseDto = { trainer }
      res.status(STATUS_CODE.OK).json(response)
    } catch (err) {
      next(err)
    }
  }

  async getWeightHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id
      const weightHistory = await this._userService.getWeightHistory(userId)
      res.status(STATUS_CODE.OK).json(weightHistory)
    } catch (err) {
      logger.error('Error fetching weight history:', err)
      next(err)
    }
  }

  async getMyTrainer(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id
      const trainerId = await this._userService.getAssignedTrainerId(userId)
      if (!trainerId) {
        throw new AppError(MESSAGES.TRAINER_NOT_FOUND, STATUS_CODE.NOT_FOUND)
      }
      const trainer = await this._trainerService.getTrainerById(trainerId)
      const response: GetMyTrainerResponseDto = { trainer }
      res.status(STATUS_CODE.OK).json(response)
    } catch (err) {
      next(err)
    }
  }

  async cancelSubscription(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id
      const trainerId = await this._userService.getAssignedTrainerId(userId)
      if (!trainerId) {
        throw new AppError(MESSAGES.NOT_FOUND, STATUS_CODE.BAD_REQUEST)
      }
      await this._userService.cancelSubscription(userId, trainerId)
      await this._trainerService.removeClientFromTrainer(
        trainerId,
        userId
      )
      await this._userPlanService.deleteUserPlan(userId, trainerId)
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.DELETED })
    } catch (err) {
      next(err)
    }
  }

  async updateProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id
      const dto = req.body as {
        name?: string;
        phone?: string;
        height?: string | number;
        age?: string | number;
        todaysWeight?: string | number;
        goalWeight?: string | number;
        goals?: string;
        activityLevel?: string;
        gender?: string;
        equipment?: string | boolean;
        isPrivate?: string | boolean;
      };

      const updateData = {
        name: dto.name?.trim(),
        phone: dto.phone?.trim() || undefined,
        height: dto.height ? Number(dto.height) : undefined,
        age: dto.age ? Number(dto.age) : undefined,
        todaysWeight: dto.todaysWeight ? Number(dto.todaysWeight) : undefined,
        goalWeight: dto.goalWeight ? Number(dto.goalWeight) : undefined,
        goals: dto.goals ? JSON.parse(dto.goals) : undefined,
        activityLevel: dto.activityLevel || undefined,
        gender: dto.gender || undefined,
        equipment: dto.equipment === true || dto.equipment === 'true',
        isPrivate: dto.isPrivate === true || dto.isPrivate === 'true'
      }

      logger.info(`Update Profile Files: ${req.files ? Object.keys(req.files).join(', ') : 'none'}`);
      const updatedUser = await this._userService.updateProfile(
        userId,
        updateData,
        req.files as { profileImage?: UploadedFile }
      )

      res.status(STATUS_CODE.OK).json({ user: updatedUser })
    } catch (err) {
      logger.error('Update Profile Error', err)
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

      res.status(STATUS_CODE.OK).json({
        message: 'Password changed successfully'
      })
    } catch (err) {
      logger.error('Change password error:', err)
      next(err)
    }
  }

  async refreshAccessToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.cookies.refreshToken
      if (!token)
        throw new AppError(MESSAGES.INVALID_REQUEST, STATUS_CODE.UNAUTHORIZED)
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
      const response: RefreshTokenResponseDto = { accessToken, refreshToken }
      res.status(STATUS_CODE.OK).json(response)
    } catch (err) {
      next(err)
    }
  }

  async addWeight(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id
      const dto: AddWeightDto = req.body
      if (!dto.weight || typeof dto.weight !== 'number' || dto.weight <= 0) {
        throw new AppError(MESSAGES.INVALID_REQUEST, STATUS_CODE.BAD_REQUEST)
      }
      const updatedUser = await this._userService.addWeight(userId, dto.weight)
      if (!updatedUser)
        throw new AppError(MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND)

      await this._streakService.updateUserStreak(userId);

      res
        .status(STATUS_CODE.OK)
        .json({ user: updatedUser, message: MESSAGES.UPDATED })
    } catch (err) {
      logger.error('Error adding weight:', err)
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

  async getTrainerAvailability(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id
      const slots = await this._slotService.getAvailableSlots(userId)
      res.status(STATUS_CODE.OK).json({ slots })
    } catch (err) {
      logger.error('Error fetching trainer availability:', err)
      next(err)
    }
  }

  async bookSession(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id
      const { slotId } = req.body

      if (!slotId) {
        throw new AppError('Slot ID is required', STATUS_CODE.BAD_REQUEST)
      }

      await this._slotService.bookSession(slotId, userId)
      res
        .status(STATUS_CODE.OK)
        .json({ message: 'Session request sent successfully' })
    } catch (err) {
      logger.error('Error booking session:', err)
      next(err)
    }
  }

  async getUserSessions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id
      const sessions = await this._slotService.getUserSessions(userId)
      res.status(STATUS_CODE.OK).json({ sessions })
    } catch (err) {
      logger.error('Error fetching user sessions:', err)
      next(err)
    }
  }

  async getUserPlan(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id
      const trainerId = await this._userService.getAssignedTrainerId(userId)

      if (!trainerId) {
        throw new AppError('No trainer assigned', STATUS_CODE.NOT_FOUND)
      }

      const plan = await this._userPlanService.getUserPlan(
        userId,
        trainerId
      )
      res.status(STATUS_CODE.OK).json({ plan })
    } catch (err) {
      next(err)
    }
  }

  async getChatMessages(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id
      const { trainerId } = req.params

      const messages = await this._messageService.getMessages(userId, trainerId)
      res.status(STATUS_CODE.OK).json({ messages })
    } catch (err) {
      logger.error('Error fetching chat messages:', err)
      next(err)
    }
  }

  async getGyms(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        page = '1',
        limit = '10',
        search = '',
        lat,
        lng
      } = req.query as {
        page?: string
        limit?: string
        search?: string
        lat?: string
        lng?: string
      }

      const userLocation =
        lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined

      const result = await this._gymService.getGymsForUser(
        parseInt(page, 10),
        parseInt(limit, 10),
        search,
        userLocation
      )

      res.status(STATUS_CODE.OK).json(result)
    } catch (err) {
      next(err)
    }
  }

  async getGymById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params
      const gym = await this._gymService.getGymForUser(id)

      if (!gym) {
        throw new AppError(MESSAGES.GYM_NOT_FOUND, STATUS_CODE.NOT_FOUND)
      }

      res.status(STATUS_CODE.OK).json({ gym })
    } catch (err) {
      logger.error('Error getting gym by ID:', err)
      next(err)
    }
  }

  async getGymSubscriptionPlans(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { gymId } = req.params
      const plans = await this._gymService.getActiveSubscriptionPlans(gymId)
      res.status(STATUS_CODE.OK).json({ plans })
    } catch (err) {
      next(err)
    }
  }

  async getMyGym(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id
      const user = await this._userService.getUserById(userId)
      if (!user?.gymId) {
        throw new AppError(MESSAGES.NO_GYM_MEMBERSHIP, STATUS_CODE.NOT_FOUND)
      }

      const gymData = await this._gymService.getMyGymDetails(
        user.gymId.toString(),
        userId
      )

      res.status(STATUS_CODE.OK).json(gymData)
    } catch (err) {
      next(err)
    }
  }

  async getGymAnnouncements(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id
      const {
        page = '1',
        limit = '10',
        search = ''
      } = req.query as {
        page?: string
        limit?: string
        search?: string
      }

      const user = await this._userService.getUserById(userId)

      if (!user?.gymId) {
        throw new AppError('No gym membership found', STATUS_CODE.NOT_FOUND)
      }

      const announcements = await this._gymService.getGymAnnouncementsForUser(
        user.gymId.toString(),
        parseInt(page, 10),
        parseInt(limit, 10),
        search
      )

      res.status(STATUS_CODE.OK).json(announcements)
    } catch (err) {
      next(err)
    }
  }

  async getGymRatings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 5
      const result = await this._reviewService.getReviews(id, page, limit)
      res.status(STATUS_CODE.OK).json(result)
    } catch (err) {
      next(err)
    }
  }

  async addTrainerRating(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params
      const { rating, message, subscriptionPlan } = req.body
      const userId = (req.user as JwtPayload).id
      const newRating = await this._reviewService.addReview(
        userId,
        id,
        'Trainer',
        rating,
        message,
        subscriptionPlan
      )
      res.status(STATUS_CODE.OK).json(newRating)
    } catch (err) {
      next(err)
    }
  }

  async addGymRating(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params
      const { rating, message, subscriptionPlan } = req.body
      const userId = (req.user as JwtPayload).id
      const newRating = await this._reviewService.addReview(
        userId,
        id,
        'Gym',
        rating,
        message,
        subscriptionPlan
      )
      res.status(STATUS_CODE.OK).json(newRating)
    } catch (err) {
      next(err)
    }
  }

  async editReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id
      const { id } = req.params
      const { rating, comment } = req.body
      const result = await this._reviewService.editReview(userId, id, rating, comment)
      res.status(STATUS_CODE.OK).json(result)
    } catch (err) {
      next(err)
    }
  }

  async deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id
      const { id } = req.params
      await this._reviewService.deleteReview(userId, id)
      res.status(STATUS_CODE.OK).json({ message: 'Review deleted successfully' })
    } catch (err) {
      next(err)
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id
      const user = await this._userService.getUserById(userId)
      if (!user) {
        throw new AppError(MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND)
      }
      res.status(STATUS_CODE.OK).json({ user })
    } catch (err) {
      next(err)
    }
  }

  async getTrainer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { trainerId } = req.params
      const trainer = await this._trainerService.getTrainerById(trainerId)
      if (!trainer) {
        throw new AppError(MESSAGES.TRAINER_NOT_FOUND, STATUS_CODE.NOT_FOUND)
      }
      res.status(STATUS_CODE.OK).json({ trainer })
    } catch (err) {
      next(err)
    }
  }

  async getTrainerRatings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 5
      const result = await this._reviewService.getReviews(id, page, limit)
      res.status(STATUS_CODE.OK).json(result)
    } catch (err) {
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

  async sendSessionRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id
      const { trainerId } = req.body

      if (!trainerId) throw new AppError('Trainer ID is required', STATUS_CODE.BAD_REQUEST)

      const user = await this._userService.getUserById(userId)
      if (!user) throw new AppError(MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND)

      await this._notificationService.sendSessionRequestNotification(trainerId, user.name)

      
      await this._messageService.createMessage({
        senderId: userId,
        receiverId: trainerId,
        message: "Requested a video call session",
        senderType: 'user',
        messageType: 'text',
        readStatus: false
      })

      res.status(STATUS_CODE.OK).json({ message: 'Session request sent successfully' })
    } catch (err) {
      next(err)
    }
  }

  async getUnreadCounts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id
      const counts = await this._messageService.getUnreadCountsBySender(userId)
      res.status(STATUS_CODE.OK).json({ counts })
    } catch (err) {
      next(err)
    }
  }

  async markMessagesAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id
      const { senderId } = req.params
      await this._messageService.markMessagesAsRead(senderId, userId)
      res.status(STATUS_CODE.OK).json({ message: 'Messages marked as read' })
    } catch (err) {
      next(err)
    }
  }


  async addProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id
      const { date, notes } = req.body
      let photos: UploadedFile[] = []

      if (req.files) {
        if (Array.isArray(req.files.photos)) {
          photos = req.files.photos
        } else if (req.files.photos) {
          photos = [req.files.photos as UploadedFile]
        }
      }

      if (!date) {
        throw new AppError('Date is required', STATUS_CODE.BAD_REQUEST)
      }

      const progress = await this._progressService.addProgress(userId, new Date(date), notes, photos)
      res.status(STATUS_CODE.OK).json({ progress })
    } catch (err) {
      next(err)
    }
  }

  async getProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id
      const { date } = req.query

      if (date) {
        const progress = await this._progressService.getProgress(userId, new Date(date as string))
        res.status(STATUS_CODE.OK).json({ progress })
      } else {
        const progressList = await this._progressService.getAllProgress(userId)
        res.status(STATUS_CODE.OK).json({ progress: progressList })
      }
    } catch (err) {
      next(err)
    }
  }


  async compareProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id
      const comparison = await this._progressService.compareProgress(userId)
      res.status(STATUS_CODE.OK).json(comparison)
    } catch (err) {
      next(err)
    }
  }
}
