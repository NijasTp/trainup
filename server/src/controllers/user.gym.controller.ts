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
            if (!user?.gymId) throw new AppError(MESSAGES.NO_GYM_MEMBERSHIP, STATUS_CODE.NOT_FOUND)
            const gymData = await this._gymService.getMyGymDetails(user.gymId.toString(), userId)
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
            const user = await this._userService.getUserById(userId)
            if (!user?.gymId) throw new AppError('No gym membership found', STATUS_CODE.NOT_FOUND)
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

    async getGymEquipment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id
            const user = await this._userService.getUserById(userId)
            if (!user?.gymId) throw new AppError('No gym membership found', STATUS_CODE.NOT_FOUND)

            const equipment = await this._equipmentService.getEquipmentByGymId(user.gymId.toString())
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
            const user = await this._userService.getUserById(userId)
            if (!user?.gymId) throw new AppError('No gym membership found', STATUS_CODE.NOT_FOUND)

            const result = await this._gymService.getGymProducts(
                user.gymId.toString(),
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
            const user = await this._userService.getUserById(userId)
            if (!user?.gymId) throw new AppError('No gym membership found', STATUS_CODE.NOT_FOUND)

            const result = await this._gymService.getGymWorkoutTemplates(
                user.gymId.toString(),
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
