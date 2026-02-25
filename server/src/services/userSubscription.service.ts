import { inject, injectable } from 'inversify';
import TYPES from '../core/types/types';
import { IUserSubscriptionService } from '../core/interfaces/services/IUserSubscriptionService';
import { IUserGymMembershipRepository } from '../core/interfaces/repositories/IUserGymMembershipRepository';
import { IUserPlanRepository } from '../core/interfaces/repositories/IUserPlanRepository';

@injectable()
export class UserSubscriptionService implements IUserSubscriptionService {
    constructor(
        @inject(TYPES.IUserGymMembershipRepository) private gymMembershipRepo: IUserGymMembershipRepository,
        @inject(TYPES.IUserPlanRepository) private userPlanRepo: IUserPlanRepository
    ) { }

    async getUserSubscriptions(userId: string): Promise<any> {
        const [gymMemberships, trainerPlans] = await Promise.all([
            this.gymMembershipRepo.findAllByUserId(userId),
            this.userPlanRepo.findAllByUserId(userId)
        ]);

        // Populate trainer plans manually since the repo doesn't specify population
        // In a real scenario, we might want to update the repo, but for now we aggregate.

        return {
            gymSubscriptions: gymMemberships,
            trainerSubscriptions: trainerPlans
        };
    }
}
