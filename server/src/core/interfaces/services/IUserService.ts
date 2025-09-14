import { IUser } from "../../../models/user.model";
import { LoginResponseDto, UserResponseDto } from '../../../dtos/user.dto'

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
  incrementTokenVersion(id: string): Promise<IUser | null>;
  getProfile(id: string): Promise<UserResponseDto | null>;
  updateUserStatus(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
  updateUserTrainerId(userId: string, trainerId: string): Promise<void>;
  cancelSubscription(userId: string, trainerId: string): Promise<void>;
}