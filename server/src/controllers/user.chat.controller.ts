import { Request, Response, NextFunction } from 'express'
import { injectable, inject } from 'inversify'
import TYPES from '../core/types/types'
import { IMessageService } from '../core/interfaces/services/IMessageService'
import { IJwtService, JwtPayload } from '../core/interfaces/services/IJwtService'
import { STATUS_CODE } from '../constants/status'
import { logger } from '../utils/logger.util'
import { UploadedFile } from 'express-fileupload'

@injectable()
export class UserChatController {
    constructor(
        @inject(TYPES.IMessageService) private _messageService: IMessageService,
        @inject(TYPES.IJwtService) private _jwtService: IJwtService
    ) { }

    async getChatMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
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

    async uploadChatFile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const files = req.files as { [key: string]: UploadedFile }
            // The original controller just had a placeholder for this or handled it via a service.
            // Based on the original UserController.uploadChatFile:
            /*
            async uploadChatFile(req: Request, res: Response, next: NextFunction): Promise<void> {
              try {
                // implementation was missing or very short
                res.status(STATUS_CODE.OK).json({ message: 'File uploaded' })
              } catch (err) {
                next(err)
              }
            }
            */
            res.status(STATUS_CODE.OK).json({ message: 'File uploaded' })
        } catch (err) {
            next(err)
        }
    }

    async markMessagesAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { trainerId } = req.params
            const userId = (req.user as JwtPayload).id
            await this._messageService.markMessagesAsRead(trainerId, userId)
            res.status(STATUS_CODE.OK).json({ message: 'Messages marked as read' })
        } catch (err) {
            next(err)
        }
    }

    async getUnreadCounts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id
            const counts = await this._messageService.getUnreadCount(userId)
            res.status(STATUS_CODE.OK).json({ counts })
        } catch (err) {
            next(err)
        }
    }
}
