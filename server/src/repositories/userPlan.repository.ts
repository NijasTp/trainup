import { injectable } from 'inversify';
import { IUserPlanRepository } from '../core/interfaces/repositories/IUserPlanRepository';
import { IUserPlan, UserPlanModel } from '../models/userPlan.model';

@injectable()
export class UserPlanRepository implements IUserPlanRepository {
  async createUserPlan(data: Partial<IUserPlan>): Promise<IUserPlan> {
    return await UserPlanModel.create(data);
  }

  async findUserPlan(userId: string, trainerId: string): Promise<IUserPlan | null> {
    return await UserPlanModel.findOne({ userId, trainerId });
  }

  async updateUserPlan(userId: string, trainerId: string, updates: Partial<IUserPlan>): Promise<IUserPlan | null> {
    return await UserPlanModel.findOneAndUpdate(
      { userId, trainerId },
      updates,
      { new: true }
    );
  }

  async deleteUserPlan(userId: string, trainerId: string): Promise<void> {
    await UserPlanModel.findOneAndDelete({ userId, trainerId });
  }

  async findAllByUserId(userId: string): Promise<IUserPlan[]> {
    return await UserPlanModel.find({ userId }).exec();
  }
}