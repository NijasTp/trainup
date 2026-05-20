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
import { IUserPlanService } from '../core/interfaces/services/IUserPlanService'
import { IUserSubscriptionService } from '../core/interfaces/services/IUserSubscriptionService'
import { WorkoutSnapshotModel } from '../models/workoutSnapshot.model'



@injectable()
export class UserProfileController {
    constructor(
        @inject(TYPES.IUserService) private _userService: IUserService,
        @inject(TYPES.IJwtService) private _jwtService: IJwtService,
        @inject(TYPES.IStreakService) private _streakService: IStreakService,
        @inject(TYPES.IProgressService) private _progressService: IProgressService,
        @inject(TYPES.IUserPlanService) private _userPlanService: IUserPlanService,
        @inject(TYPES.IUserSubscriptionService) private _userSubscriptionService: IUserSubscriptionService
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

    async getProfilePage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id
            const user = await this._userService.getUserById(userId)
            if (!user) {
                throw new AppError(MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND)
            }

            const weight =
                user.weightHistory && user.weightHistory.length > 0
                    ? user.weightHistory[user.weightHistory.length - 1].weight
                    : user.currentWeight

            const { gymSubscriptions, trainerSubscriptions } = await this._userSubscriptionService.getUserSubscriptions(userId)
            
            const activeSubscriptions = [
                ...gymSubscriptions.map((s: any) => ({ ...s, subscriptionType: 'gym' })),
                ...trainerSubscriptions.map((s: any) => ({ ...s, subscriptionType: 'trainer' }))
            ].filter((s: any) => s.status === 'active');
            
            const populatedTemplates = await Promise.all(
                (user.activeWorkoutTemplates || []).map(async (t: any) => {
                    const snapshot = await WorkoutSnapshotModel.findById(t.templateId).select('title image originalTemplateId scheduleType weeklyDays days').lean();
                    return {
                        ...t,
                        title: snapshot?.title || 'Unknown Workout',
                        image: snapshot?.image || '',
                        originalTemplateId: snapshot?.originalTemplateId?.toString(),
                        scheduleType: snapshot?.scheduleType || t.scheduleType || 'contiguous',
                        weeklyDays: snapshot?.weeklyDays || t.weeklyDays || [],
                        daysCount: snapshot?.days?.length || 0
                    };
                })
            );

            res.status(STATUS_CODE.OK).json({
                user: {
                    ...user,
                    weight,
                    activeSubscriptions,
                    activeWorkoutTemplates: populatedTemplates
                }
            })
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
                req.file ? { profileImage: req.file } : undefined
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

            const photoArray = req.files as Express.Multer.File[] || []

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
    async toggleWorkoutTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id;
            const { templateId } = req.body;
            if (!templateId) throw new AppError(MESSAGES.INVALID_REQUEST, STATUS_CODE.BAD_REQUEST);

            const added = await this._userService.toggleWorkoutTemplate(userId, templateId);
            res.status(STATUS_CODE.OK).json({ added, message: added ? "Template started" : "Template stopped" });
        } catch (err) {
            next(err);
        }
    }

    async getActivityData(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id;
            const activityData = await this._userService.getActivityData(userId);
            res.status(STATUS_CODE.OK).json({ activityData });
        } catch (err) {
            next(err);
        }
    }

    async updateDailyMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id;
            const { water, sleep } = req.body;
            const updatedUser = await this._userService.updateDailyMetrics(userId, { water, sleep });
            res.status(STATUS_CODE.OK).json({ user: updatedUser });
        } catch (err) {
            next(err);
        }
    }
}
