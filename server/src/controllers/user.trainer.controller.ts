import { Request, Response, NextFunction } from 'express'
import { injectable, inject } from 'inversify'
import TYPES from '../core/types/types'
import { ITrainerService } from '../core/interfaces/services/ITrainerService'
import { IUserService } from '../core/interfaces/services/IUserService'
import { ISlotService } from '../core/interfaces/services/ISlotService'
import { IUserPlanService } from '../core/interfaces/services/IUserPlanService'
import { IJwtService, JwtPayload } from '../core/interfaces/services/IJwtService'
import { STATUS_CODE } from '../constants/status'
import { logger } from '../utils/logger.util'
import { MESSAGES } from '../constants/messages.constants'
import { AppError } from '../utils/appError.util'
import {
    GetTrainersQueryDto,
    GetTrainersResponseDto,
    GetIndividualTrainerResponseDto,
    GetMyTrainerResponseDto
} from '../dtos/user.dto'

import { IRefundService } from '../core/interfaces/services/IRefundService'

@injectable()
export class UserTrainerController {
    constructor(
        @inject(TYPES.ITrainerService) private _trainerService: ITrainerService,
        @inject(TYPES.IUserService) private _userService: IUserService,
        @inject(TYPES.ISlotService) private _slotService: ISlotService,
        @inject(TYPES.IUserPlanService) private _userPlanService: IUserPlanService,
        @inject(TYPES.IJwtService) private _jwtService: IJwtService,
        @inject(TYPES.IRefundService) private _refundService: IRefundService
    ) { }


    async getTrainers(req: Request, res: Response, next: NextFunction): Promise<void> {
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

    async getIndividualTrainer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const trainer = await this._trainerService.getTrainerById(req.params.id)
            if (!trainer) throw new AppError(MESSAGES.TRAINER_NOT_FOUND, STATUS_CODE.NOT_FOUND)
            const response: GetIndividualTrainerResponseDto = { trainer }
            res.status(STATUS_CODE.OK).json(response)
        } catch (err) {
            next(err)
        }
    }

    async getTrainer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { trainerId } = req.params
            const trainer = await this._trainerService.getTrainerById(trainerId)
            if (!trainer) throw new AppError(MESSAGES.TRAINER_NOT_FOUND, STATUS_CODE.NOT_FOUND)
            res.status(STATUS_CODE.OK).json({ trainer })
        } catch (err) {
            next(err)
        }
    }

    async getMyTrainer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id
            const trainerId = await this._userService.getAssignedTrainerId(userId)
            if (!trainerId) throw new AppError(MESSAGES.TRAINER_NOT_FOUND, STATUS_CODE.NOT_FOUND)
            const trainer = await this._trainerService.getTrainerById(trainerId)
            const response: GetMyTrainerResponseDto = { trainer }
            res.status(STATUS_CODE.OK).json(response)
        } catch (err) {
            next(err)
        }
    }

    async cancelSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id
            const trainerId = await this._userService.getAssignedTrainerId(userId)
            if (!trainerId) throw new AppError(MESSAGES.NOT_FOUND, STATUS_CODE.BAD_REQUEST)

            const userPlan = await this._userPlanService.getUserPlan(userId, trainerId)
            if (!userPlan) throw new AppError('No active trainer subscription found', STATUS_CODE.NOT_FOUND)

            const result = await this._refundService.applyTrainerRefund(userPlan._id.toString(), userId)

            await this._userService.cancelSubscription(userId, trainerId)
            await this._trainerService.removeClientFromTrainer(trainerId, userId)
            await this._userPlanService.deleteUserPlan(userId, trainerId)

            res.status(STATUS_CODE.OK).json({
                message: 'Trainer subscription cancelled successfully',
                refundAmount: result.refundAmount
            })
        } catch (err) {
            next(err)
        }
    }


    async getTrainerAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id
            const slots = await this._slotService.getAvailableSlots(userId)
            res.status(STATUS_CODE.OK).json({ slots })
        } catch (err) {
            logger.error('Error fetching trainer availability:', err)
            next(err)
        }
    }

    async bookSession(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id
            const { slotId } = req.body
            if (!slotId) throw new AppError('Slot ID is required', STATUS_CODE.BAD_REQUEST)
            await this._slotService.bookSession(slotId, userId)
            res.status(STATUS_CODE.OK).json({ message: 'Session request sent successfully' })
        } catch (err) {
            logger.error('Error booking session:', err)
            next(err)
        }
    }

    async getUserSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id
            const sessions = await this._slotService.getUserSessions(userId)
            res.status(STATUS_CODE.OK).json({ sessions })
        } catch (err) {
            logger.error('Error fetching user sessions:', err)
            next(err)
        }
    }

    async getUserPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id
            const trainerId = await this._userService.getAssignedTrainerId(userId)
            if (!trainerId) throw new AppError('No trainer assigned', STATUS_CODE.NOT_FOUND)
            const plan = await this._userPlanService.getUserPlan(userId, trainerId)
            res.status(STATUS_CODE.OK).json({ plan })
        } catch (err) {
            next(err)
        }
    }

    async sendSessionRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { slotId } = req.body
            const userId = (req.user as JwtPayload).id
            // This logic seems duplicate with bookSession in the original controller, 
            // but I will keep it as it was in the original.
            await this._slotService.bookSession(slotId, userId)
            res.status(STATUS_CODE.OK).json({ message: MESSAGES.SUCCESS })
        } catch (err) {
            next(err)
        }
    }
}
