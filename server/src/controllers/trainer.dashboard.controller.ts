import { Request, Response, NextFunction } from 'express'
import { inject, injectable } from 'inversify'
import TYPES from '../core/types/types'
import { ITrainerService } from '../core/interfaces/services/ITrainerService'
import { ITransactionService } from '../core/interfaces/services/ITransactionService'
import { IJwtService, JwtPayload } from '../core/interfaces/services/IJwtService'
import { STATUS_CODE } from '../constants/status'
import { logger } from '../utils/logger.util'

@injectable()
export class TrainerDashboardController {
    constructor(
        @inject(TYPES.ITrainerService) private _trainerService: ITrainerService,
        @inject(TYPES.ITransactionService) private _transactionService: ITransactionService,
        @inject(TYPES.IJwtService) private _JwtService: IJwtService
    ) { }

    async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const trainerId = (req.user as JwtPayload).id
            const dashboard = await this._trainerService.getDashboardStats(trainerId)
            res.status(STATUS_CODE.OK).json(dashboard)
        } catch (err) {
            logger.error('Error fetching dashboard:', err)
            next(err)
        }
    }

    async getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const trainerId = (req.user as JwtPayload).id
            const page = parseInt(String(req.query.page)) || 1
            const limit = parseInt(String(req.query.limit)) || 10
            const search = String(req.query.search || '')
            const status = String(req.query.status || '')
            const planType = String(req.query.planType || '')

            const transactions = await this._transactionService.getTrainerTransactions(
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

    async getTrainerApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params
            const application = await this._trainerService.getTrainerApplication(id)
            res.status(STATUS_CODE.OK).json({ application })
        } catch (err) {
            logger.error('Error fetching trainer application:', err)
            next(err)
        }
    }
}
