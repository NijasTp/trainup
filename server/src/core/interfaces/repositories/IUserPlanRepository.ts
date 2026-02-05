import { IUserPlan } from "../../../models/userPlan.model";

export interface IUserPlanRepository {
  createUserPlan(data: Partial<IUserPlan>): Promise<IUserPlan>;
  findUserPlan(userId: string, trainerId: string): Promise<IUserPlan | null>;
  updateUserPlan(userId: string, trainerId: string, updates: Partial<IUserPlan>): Promise<IUserPlan | null>;
  deleteUserPlan(userId: string, trainerId: string): Promise<void>;
  findAllByUserId(userId: string): Promise<IUserPlan[]>;
}