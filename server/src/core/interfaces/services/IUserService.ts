import { IUser } from "../../../models/user.model";
import { GetWeightHistoryResponseDto, LoginResponseDto, UserResponseDto } from '../../../dtos/user.dto'

export interface IUserService {
  registerUser(name: string, email: string, password: string): Promise<LoginResponseDto>;
  checkUsername(username: string): Promise<boolean>;
  loginUser(email: string, password: string): Promise<LoginResponseDto>;
  loginWithGoogle(idToken: string): Promise<LoginResponseDto>;
  getAllUsers(page: number, limit: number, search: string, isBanned?: string, isVerified?: string, startDate?: string, endDate?: string): Promise<any>;
  getUserById(id: string): Promise<UserResponseDto | null>;
  incrementTokenVersion(id: string): Promise<void>;
  getProfile(id: string): Promise<UserResponseDto>;
  updateProfile(id: string, updateData: Partial<IUser>): Promise<UserResponseDto>;
  updateUserStatus(id: string, updateData: Partial<IUser>): Promise<void>;
  updateUserTrainerId(userId: string, trainerId: string): Promise<void>;
  updateUserGymMembership(
  userId: string,
  gymId: string,
  planId: string,
  startDate: Date,
  endDate: Date
): Promise<void>;

  cancelSubscription(userId: string, trainerId: string): Promise<void>;
  addWeight(userId: string, weight: number): Promise<UserResponseDto>;
  getWeightHistory(userId: string): Promise<GetWeightHistoryResponseDto>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(email: string, newPassword: string): Promise<void>;
  updateUserPlan(userId: string, planType: 'basic' | 'premium' | 'pro'): Promise<void>;
  removeUserTrainer(userId: string): Promise<void>;
}