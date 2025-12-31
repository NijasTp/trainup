import { Request, Response, NextFunction } from 'express'
import { injectable, inject } from 'inversify'
import TYPES from '../core/types/types'
import { IReviewService } from '../core/interfaces/services/IReviewService'
import { IJwtService, JwtPayload } from '../core/interfaces/services/IJwtService'
import { STATUS_CODE } from '../constants/status'

@injectable()
export class UserReviewController {
    constructor(
        @inject(TYPES.IReviewService) private _reviewService: IReviewService,
        @inject(TYPES.IJwtService) private _jwtService: IJwtService
    ) { }

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

    async addTrainerRating(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params
            const { rating, message, subscriptionPlan } = req.body
            const userId = (req.user as JwtPayload).id
            const newRating = await this._reviewService.addReview(userId, id, 'Trainer', rating, message, subscriptionPlan)
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
            const newRating = await this._reviewService.addReview(userId, id, 'Gym', rating, message, subscriptionPlan)
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
}
