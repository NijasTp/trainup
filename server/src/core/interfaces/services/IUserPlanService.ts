import { IUserPlan } from "../../../models/userPlan.model";

export interface IUserPlanService {
  createUserPlan(data: Partial<IUserPlan>): Promise<IUserPlan>;
  getUserPlan(userId: string, trainerId: string): Promise<IUserPlan | null>;
  updateUserPlan(userId: string, trainerId: string, updates: Partial<IUserPlan>): Promise<IUserPlan | null>;
  decrementMessages(userId: string, trainerId: string): Promise<boolean>;
  decrementVideoCalls(userId: string, trainerId: string): Promise<boolean>;
  deleteUserPlan(userId: string, trainerId: string): Promise<void>;
  findAllByUserId(userId: string): Promise<IUserPlan[]>;
}