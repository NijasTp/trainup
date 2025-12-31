import { Request, Response, NextFunction } from 'express'
import { inject, injectable } from 'inversify'
import TYPES from '../core/types/types'
import { ITrainerService } from '../core/interfaces/services/ITrainerService'
import { IUserService } from '../core/interfaces/services/IUserService'
import { IMessageService } from '../core/interfaces/services/IMessageService'
import { IUserPlanService } from '../core/interfaces/services/IUserPlanService'
import { IJwtService, JwtPayload } from '../core/interfaces/services/IJwtService'
import { STATUS_CODE } from '../constants/status'
import { logger } from '../utils/logger.util'
import { AppError } from '../utils/appError.util'
import { MESSAGES } from '../constants/messages.constants'
import { UploadedFile } from 'express-fileupload'
import {
    GetClientsQueryDto,
    GetClientsResponseDto,
    GetClientParamsDto,
    GetClientResponseDto
} from '../dtos/trainer.dto'

@injectable()
export class TrainerClientController {
    constructor(
        @inject(TYPES.ITrainerService) private _trainerService: ITrainerService,
        @inject(TYPES.IUserService) private _userService: IUserService,
        @inject(TYPES.IMessageService) private _messageService: IMessageService,
        @inject(TYPES.IUserPlanService) private _userPlanService: IUserPlanService,
        @inject(TYPES.IJwtService) private _JwtService: IJwtService
    ) { }

    async getClients(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const trainerId = (req.user as JwtPayload).id
            if (!trainerId) throw new AppError(MESSAGES.INVALID_TRAINER_ID, STATUS_CODE.BAD_REQUEST)
            const dto: GetClientsQueryDto = req.query
            const page = parseInt(String(dto.page)) || 1
            const limit = parseInt(String(dto.limit)) || 10
            const search = String(dto.search || '')

            const clients: GetClientsResponseDto = await this._trainerService.getTrainerClients(trainerId, page, limit, search)
            res.status(STATUS_CODE.OK).json(clients)
        } catch (err) {
            next(err)
        }
    }

    async getClient(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: GetClientParamsDto = { id: req.params.id }
            const client = await this._userService.getUserById(dto.id)
            if (!client) throw new AppError(MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND)
            const response: GetClientResponseDto = { user: client }
            res.status(STATUS_CODE.OK).json(response)
        } catch (err) {
            next(err)
        }
    }

    async getClientDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
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

    async getChatMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const trainerId = (req.user as JwtPayload).id
            const { clientId } = req.params
            const messages = await this._messageService.getMessages(trainerId, clientId)
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

    async getUserPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
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
}
