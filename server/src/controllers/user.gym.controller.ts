import { Request, Response, NextFunction } from 'express'
import { injectable, inject } from 'inversify'
import TYPES from '../core/types/types'
import { IGymService } from '../core/interfaces/services/IGymService'
import { IUserService } from '../core/interfaces/services/IUserService'
import { IJwtService, JwtPayload } from '../core/interfaces/services/IJwtService'
import { STATUS_CODE } from '../constants/status'
import { logger } from '../utils/logger.util'
import { MESSAGES } from '../constants/messages.constants'
import { AppError } from '../utils/appError.util'
import { Types } from 'mongoose'
import { UserGymMembershipModel } from '../models/userGymMembership.model'
import { UserModel } from '../models/user.model'

import { IRefundService } from '../core/interfaces/services/IRefundService'
import { IGymEquipmentService } from '../core/interfaces/services/IGymEquipmentService'

@injectable()
export class UserGymController {
    constructor(
        @inject(TYPES.IGymService) private _gymService: IGymService,
        @inject(TYPES.IUserService) private _userService: IUserService,
        @inject(TYPES.IJwtService) private _jwtService: IJwtService,
        @inject(TYPES.IRefundService) private _refundService: IRefundService,
        @inject(TYPES.IGymEquipmentService) private _equipmentService: IGymEquipmentService
    ) { }

    /**
     * Resolves the active gymId for a user.
     * Fast path: user.gymId from the User document.
     * Fallback: queries UserGymMembershipModel directly — handles the case where
     * user.gymId wasn't synced yet after payment (membership record exists but
     * the User document hasn't been updated yet).
     * When the fallback finds a membership, it self-heals user.gymId for next time.
     */
    private async _resolveGymId(userId: string): Promise<string | null> {
        const user = await this._userService.getUserById(userId)

        if (user?.gymId) {
            return user.gymId.toString()
        }

        // Fallback: query membership collection directly
        const membership = await UserGymMembershipModel.findOne({
            userId: new Types.ObjectId(userId),
            status: { $in: ['active', 'pending'] }
        }).sort({ createdAt: -1 }).lean()

        if (!membership) return null

        // Self-heal: write gymId back to User so next request hits the fast path
        try {
            await UserModel.findByIdAndUpdate(userId, {
                $set: { gymId: membership.gymId }
            })
            logger.info(`[GymController] Synced gymId for user ${userId} from membership record`)
        } catch (syncErr) {
            logger.warn(`[GymController] Failed to sync gymId for user ${userId}:`, syncErr)
        }

        return membership.gymId.toString()
    }

    async cancelMembership(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id
            const { membershipId } = req.body
            if (!membershipId) throw new AppError('Membership ID is required', STATUS_CODE.BAD_REQUEST)

            const result = await this._refundService.applyGymRefund(membershipId, userId)
            res.status(STATUS_CODE.OK).json({
                message: 'Membership cancelled successfully',
                refundAmount: result.refundAmount
            })
        } catch (err) {
            next(err)
        }
    }

    async getGyms(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page = '1', limit = '10', search = '', lat, lng } = req.query as {
                page?: string
                limit?: string
                search?: string
                lat?: string
                lng?: string
            }
            const userLocation = lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined
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

    async getGymById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params
            const gym = await this._gymService.getGymForUser(id)
            if (!gym) throw new AppError(MESSAGES.GYM_NOT_FOUND, STATUS_CODE.NOT_FOUND)
            res.status(STATUS_CODE.OK).json({ gym })
        } catch (err) {
            logger.error('Error getting gym by ID:', err)
            next(err)
        }
    }

    async getGymSubscriptionPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { gymId } = req.params
            const plans = await this._gymService.getActiveSubscriptionPlans(gymId)
            res.status(STATUS_CODE.OK).json({ plans })
        } catch (err) {
            next(err)
        }
    }

    async getMyGym(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id
            const user = await this._userService.getUserById(userId)

            // Try to fetch details — repo will auto-discover if gymId is null or invalid
            const gymId = user?.gymId?.toString() || null
            const gymData = await this._gymService.getMyGymDetails(gymId, userId) as any

            if (!gymData) {
                throw new AppError(MESSAGES.NO_GYM_MEMBERSHIP, STATUS_CODE.NOT_FOUND)
            }

            // Sync gymId if it's different from what's in the user profile
            const activeGymId = gymData.gym._id.toString()
            if (user && user.gymId?.toString() !== activeGymId) {
                await this._userService.updateUserStatus(userId, { gymId: activeGymId as any })
            }

            res.status(STATUS_CODE.OK).json(gymData)
        } catch (err) {
            next(err)
        }
    }

    async getGymAnnouncements(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id
            const { page = '1', limit = '10', search = '' } = req.query as {
                page?: string
                limit?: string
                search?: string
            }
            const gymId = await this._resolveGymId(userId)
            if (!gymId) throw new AppError('No gym membership found', STATUS_CODE.NOT_FOUND)

            const announcements = await this._gymService.getGymAnnouncementsForUser(
                gymId,
                parseInt(page, 10),
                parseInt(limit, 10),
                search
            )
            res.status(STATUS_CODE.OK).json(announcements)
        } catch (err) {
            next(err)
        }
    }

    async getGymEquipment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id
            const gymId = await this._resolveGymId(userId)
            if (!gymId) throw new AppError('No gym membership found', STATUS_CODE.NOT_FOUND)

            const equipment = await this._equipmentService.getEquipmentByGymId(gymId)
            res.status(STATUS_CODE.OK).json({ equipment })
        } catch (err) {
            next(err)
        }
    }

    async getGymProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id
            const { page = '1', limit = '10', search = '', category = 'all' } = req.query as {
                page?: string
                limit?: string
                search?: string
                category?: string
            }
            const gymId = await this._resolveGymId(userId)
            if (!gymId) throw new AppError('No gym membership found', STATUS_CODE.NOT_FOUND)

            const result = await this._gymService.getGymProducts(
                gymId,
                parseInt(page, 10),
                parseInt(limit, 10),
                search,
                category
            )
            res.status(STATUS_CODE.OK).json(result)
        } catch (err) {
            next(err)
        }
    }

    async getGymWorkoutTemplates(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id
            const { page = '1', limit = '10', search = '' } = req.query as {
                page?: string
                limit?: string
                search?: string
            }
            const gymId = await this._resolveGymId(userId)
            if (!gymId) throw new AppError('No gym membership found', STATUS_CODE.NOT_FOUND)

            const result = await this._gymService.getGymWorkoutTemplates(
                gymId,
                parseInt(page, 10),
                parseInt(limit, 10),
                search
            )
            res.status(STATUS_CODE.OK).json(result)
        } catch (err) {
            next(err)
        }
    }
}
