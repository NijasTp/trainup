import { Request, Response, NextFunction } from 'express'
import { injectable, inject } from 'inversify'
import TYPES from '../core/types/types'
import { IUserService } from '../core/interfaces/services/IUserService'
import { IJwtService, JwtPayload } from '../core/interfaces/services/IJwtService'
import { IStreakService } from '../core/interfaces/services/IStreakService'
import { IProgressService } from '../core/interfaces/services/IProgressService'
import { STATUS_CODE } from '../constants/status'
import { logger } from '../utils/logger.util'
import { MESSAGES } from '../constants/messages.constants'
import { AppError } from '../utils/appError.util'
import { AddWeightDto } from '../dtos/user.dto'
import { UploadedFile } from 'express-fileupload'

@injectable()
export class UserProfileController {
    constructor(
        @inject(TYPES.IUserService) private _userService: IUserService,
        @inject(TYPES.IJwtService) private _jwtService: IJwtService,
        @inject(TYPES.IStreakService) private _streakService: IStreakService,
        @inject(TYPES.IProgressService) private _progressService: IProgressService
    ) { }

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

    async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id
            const dto = req.body
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

    async addWeight(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id
            const dto: AddWeightDto = req.body
            if (!dto.weight || typeof dto.weight !== 'number' || dto.weight <= 0) {
                throw new AppError(MESSAGES.INVALID_REQUEST, STATUS_CODE.BAD_REQUEST)
            }
            const updatedUser = await this._userService.addWeight(userId, dto.weight)
            if (!updatedUser) throw new AppError(MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND)
            await this._streakService.updateUserStreak(userId)
            res.status(STATUS_CODE.OK).json({ user: updatedUser, message: MESSAGES.UPDATED })
        } catch (err) {
            logger.error('Error adding weight:', err)
            next(err)
        }
    }

    async getWeightHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id
            const weightHistory = await this._userService.getWeightHistory(userId)
            res.status(STATUS_CODE.OK).json(weightHistory)
        } catch (err) {
            logger.error('Error fetching weight history:', err)
            next(err)
        }
    }

    async addProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id
            const { notes } = req.body
            const files = req.files as { photo?: UploadedFile[] } // Depending on how files are structured in req
            const photoArray = files ? Object.values(files).flat() as UploadedFile[] : []

            const progress = await this._progressService.addProgress(
                userId,
                new Date(),
                notes,
                photoArray
            )
            res.status(STATUS_CODE.OK).json(progress)
        } catch (err) {
            next(err)
        }
    }

    async getProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id
            const date = req.query.date ? new Date(req.query.date as string) : new Date()
            const progress = await this._progressService.getProgress(userId, date)
            res.status(STATUS_CODE.OK).json(progress)
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
