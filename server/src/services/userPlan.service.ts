import { injectable, inject } from 'inversify';
import { IUserPlanService } from '../core/interfaces/services/IUserPlanService';
import { IUserPlanRepository } from '../core/interfaces/repositories/IUserPlanRepository';
import { IUserPlan } from '../models/userPlan.model';
import TYPES from '../core/types/types';
import { AppError } from '../utils/appError.util';
import { STATUS_CODE } from '../constants/status';

@injectable()
export class UserPlanService implements IUserPlanService {
  constructor(
    @inject(TYPES.IUserPlanRepository)
    private _userPlanRepository: IUserPlanRepository
  ) { }

  async createUserPlan(data: Partial<IUserPlan>): Promise<IUserPlan> {
    return await this._userPlanRepository.createUserPlan(data);
  }

  async getUserPlan(userId: string, trainerId: string): Promise<IUserPlan | null> {
    return await this._userPlanRepository.findUserPlan(userId, trainerId);
  }

  async updateUserPlan(userId: string, trainerId: string, updates: Partial<IUserPlan>): Promise<IUserPlan | null> {
    return await this._userPlanRepository.updateUserPlan(userId, trainerId, updates);
  }

  async decrementMessages(userId: string, trainerId: string): Promise<boolean> {
    const plan = await this._userPlanRepository.findUserPlan(userId, trainerId);
    if (!plan) {
      throw new AppError('User plan not found', STATUS_CODE.NOT_FOUND);
    }

    if (plan.planType === 'basic') {
      throw new AppError('Chat not available with Basic plan', STATUS_CODE.FORBIDDEN);
    }

    if (plan.planType === 'premium' && plan.messagesLeft <= 0) {
      return false;
    }

    if (plan.planType === 'premium') {
      await this._userPlanRepository.updateUserPlan(userId, trainerId, {
        messagesLeft: plan.messagesLeft - 1
      });
    }

    return true;
  }

  async decrementVideoCalls(userId: string, trainerId: string): Promise<boolean> {
    const plan = await this._userPlanRepository.findUserPlan(userId, trainerId);
    if (!plan) {
      throw new AppError('User plan not found', STATUS_CODE.NOT_FOUND);
    }

    if (plan.planType !== 'pro') {
      throw new AppError('Video calls not available with this plan', STATUS_CODE.FORBIDDEN);
    }

    if (plan.videoCallsLeft <= 0) {
      return false; // No video calls left
    }

    await this._userPlanRepository.updateUserPlan(userId, trainerId, {
      videoCallsLeft: plan.videoCallsLeft - 1
    });

    return true;
  }

  async deleteUserPlan(userId: string, trainerId: string): Promise<void> {
    await this._userPlanRepository.deleteUserPlan(userId, trainerId);
  }

  async findAllByUserId(userId: string): Promise<IUserPlan[]> {
    return await this._userPlanRepository.findAllByUserId(userId);
  }
}