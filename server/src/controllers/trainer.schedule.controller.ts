import { Request, Response, NextFunction } from 'express'
import { inject, injectable } from 'inversify'
import TYPES from '../core/types/types'
import { ITrainerService } from '../core/interfaces/services/ITrainerService'
import { IWeeklyScheduleService } from '../core/interfaces/services/IWeeklyScheduleService'
import { ISlotService } from '../core/interfaces/services/ISlotService'
import { IJwtService, JwtPayload } from '../core/interfaces/services/IJwtService'
import { STATUS_CODE } from '../constants/status'
import { logger } from '../utils/logger.util'
import { AppError } from '../utils/appError.util'

@injectable()
export class TrainerScheduleController {
    constructor(
        @inject(TYPES.ITrainerService) private _trainerService: ITrainerService,
        @inject(TYPES.IWeeklyScheduleService) private _weeklyScheduleService: IWeeklyScheduleService,
        @inject(TYPES.ISlotService) private _slotService: ISlotService,
        @inject(TYPES.IJwtService) private _JwtService: IJwtService
    ) { }

    async updateAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const trainerId = (req.user as JwtPayload).id
            const { isAvailable, unavailableReason } = req.body
            await this._trainerService.updateAvailability(trainerId, isAvailable, unavailableReason)
            res.status(STATUS_CODE.OK).json({ message: 'Availability updated successfully' })
        } catch (err) {
            logger.error('Error updating availability:', err)
            next(err)
        }
    }

    async getWeeklySchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const trainerId = (req.user as JwtPayload).id
            const weekStart = req.query.weekStart ? new Date(String(req.query.weekStart)) : undefined
            const schedule = await this._weeklyScheduleService.getTrainerSchedule(trainerId, weekStart)
            res.status(STATUS_CODE.OK).json({ schedule })
        } catch (err) {
            logger.error('Error fetching weekly schedule:', err)
            next(err)
        }
    }

    async saveWeeklySchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const trainerId = (req.user as JwtPayload).id
            const scheduleData = { ...req.body, trainerId }
            const schedule = await this._weeklyScheduleService.createOrUpdateSchedule(scheduleData)
            res.status(STATUS_CODE.OK).json({ schedule, message: 'Schedule saved successfully' })
        } catch (err) {
            logger.error('Error saving weekly schedule:', err)
            next(err)
        }
    }

    async getSlots(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const trainerId = (req.user as JwtPayload).id
            const slots = await this._slotService.getTrainerSlots(trainerId)
            res.status(STATUS_CODE.OK).json({ slots })
        } catch (err) {
            logger.error('Error fetching trainer slots:', err)
            next(err)
        }
    }

    async createSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const trainerId = (req.user as JwtPayload).id
            const { date, startTime, endTime } = req.body
            if (!date || !startTime || !endTime) {
                throw new AppError('Date, startTime, and endTime are required', STATUS_CODE.BAD_REQUEST)
            }
            const slot = await this._slotService.createSlot(trainerId, new Date(date), startTime, endTime)
            res.status(STATUS_CODE.CREATED).json({ slot, message: 'Slot created successfully' })
        } catch (err) {
            logger.error('Error creating slot:', err)
            next(err)
        }
    }

    async deleteSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
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

    async getSessionRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const trainerId = (req.user as JwtPayload).id
            const requests = await this._slotService.getTrainerSessionRequests(trainerId)
            res.status(STATUS_CODE.OK).json({ requests })
        } catch (err) {
            logger.error('Error fetching session requests:', err)
            next(err)
        }
    }

    async approveSessionRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const trainerId = (req.user as JwtPayload).id
            const { requestId, userId } = req.params
            if (!userId) throw new AppError('User ID is required for approval', STATUS_CODE.BAD_REQUEST)
            await this._slotService.approveSessionRequest(requestId, userId, trainerId)
            res.status(STATUS_CODE.OK).json({ message: 'Session request approved successfully' })
        } catch (err) {
            logger.error('Error approving session request:', err)
            next(err)
        }
    }

    async rejectSessionRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const trainerId = (req.user as JwtPayload).id
            const { requestId, userId } = req.params
            const { rejectionReason } = req.body
            if (!userId) throw new AppError('User ID is required for rejection', STATUS_CODE.BAD_REQUEST)
            if (!rejectionReason) throw new AppError('Rejection reason is required', STATUS_CODE.BAD_REQUEST)
            await this._slotService.rejectSessionRequest(requestId, userId, trainerId, rejectionReason)
            res.status(STATUS_CODE.OK).json({ message: 'Session request rejected successfully' })
        } catch (err) {
            logger.error('Error rejecting session request:', err)
            next(err)
        }
    }
}
