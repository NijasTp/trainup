import { IUser } from "../../../models/user.model";
import { GetWeightHistoryResponseDto, LoginResponseDto, UserResponseDto } from '../../../dtos/user.dto'

export interface IUserService {
  registerUser(name: string, email: string, password: string): Promise<LoginResponseDto>;
  checkUsername(username: string): Promise<boolean>;
  resetPassword(email: string, newPassword: string): Promise<void>;
  loginUser(email: string, password: string): Promise<LoginResponseDto>;
  loginWithGoogle(idToken: string): Promise<LoginResponseDto>;
  getAllUsers(
    page: number,
    limit: number,
    search: string,
    isBanned?: string,
    isVerified?: string,
    startDate?: string,
    endDate?: string
  ): Promise<any>;
  getUserById(id: string): Promise<UserResponseDto | null>;
  incrementTokenVersion(id: string): Promise<void>;
  getProfile(id: string): Promise<UserResponseDto | null>;
  updateProfile(id: string, updateData: Partial<IUser>): Promise<UserResponseDto | null>;
  updateUserStatus(id: string, updateData: Partial<IUser>): Promise<void>;
  updateUserTrainerId(userId: string, trainerId: string): Promise<void>;
  cancelSubscription(userId: string, trainerId: string): Promise<void>;
   getWeightHistory(userId: string): Promise<GetWeightHistoryResponseDto>;
  addWeight(userId: string, weight: number): Promise<UserResponseDto>;
}