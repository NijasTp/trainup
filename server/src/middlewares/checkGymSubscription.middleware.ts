import { Request, Response, NextFunction } from 'express';
import { UserGymMembershipModel } from '../models/userGymMembership.model';
import { IJwtService, JwtPayload } from '../core/interfaces/services/IJwtService';
import { STATUS_CODE } from '../constants/status';
import { GYM_MESSAGES } from '../constants/messages.constants';

export const checkGymSubscription = (requiredPermission?: 'trainerChat' | 'videoCall' | 'isCardioIncluded') => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = req.user as JwtPayload;

            if (!user || user.role !== 'user') {
                res.status(STATUS_CODE.UNAUTHORIZED).json({ message: 'Unauthorized' });
                return;
            }

            const userId = user.id;
            const gymId = req.params.gymId || req.body.gymId || req.query.gymId;

            if (!gymId) {
                res.status(STATUS_CODE.BAD_REQUEST).json({ message: 'Gym ID is required' });
                return;
            }

            const now = new Date();

            const activeMembership = await UserGymMembershipModel.findOne({
                userId,
                gymId,
                status: 'active',
                subscriptionEndDate: { $gt: now },
            }).populate('planId');

            if (!activeMembership) {
                res.status(STATUS_CODE.FORBIDDEN).json({
                    message: GYM_MESSAGES.NO_ACTIVE_SUBSCRIPTION,
                    requiresSubscription: true
                });
                return;
            }

            if (requiredPermission) {
                const plan = (activeMembership.planId as any);
                if (!plan || !plan[requiredPermission]) {
                    res.status(STATUS_CODE.FORBIDDEN).json({
                        message: `Your current plan does not include ${requiredPermission.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
                        insufficientPermissions: true
                    });
                    return;
                }
            }

            // Attach membership to request for downstream use
            (req as any).gymMembership = activeMembership;

            next();
        } catch (error) {
            next(error);
        }
    };
};

