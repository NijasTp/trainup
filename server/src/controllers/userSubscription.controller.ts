import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import TYPES from '../core/types/types';
import { IUserSubscriptionService } from '../core/interfaces/services/IUserSubscriptionService';
import { STATUS_CODE } from '../constants/status';

@injectable()
export class SubscriptionController {
    constructor(
        @inject(TYPES.IUserSubscriptionService) private subscriptionService: IUserSubscriptionService
    ) { }

    async getSubscriptions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const subscriptions = await this.subscriptionService.getUserSubscriptions(userId);
            res.status(STATUS_CODE.OK).json({
                success: true,
                data: subscriptions
            });
        } catch (error) {
            next(error);
        }
    }
}
