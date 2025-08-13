import { IUser } from "../../../models/user.model";
import { PaginatedUsers } from "../repositories/IUserRepository";
export interface IUserService {
  registerUser(name: string, email: string, password: string): Promise<{ user: IUser, accessToken: string, refreshToken: string }>;
  loginUser(email: string, password: string): Promise<{ user: IUser, accessToken: string, refreshToken: string; }>;
  loginWithGoogle(idToken: string): Promise<{ user: IUser; accessToken: string; refreshToken: string }>
  resetPassword(email: string, password: string): Promise<void>
  getAllUsers(
    page: number,
    limit: number,
    search: string,
    isBanned?: string,
    isVerified?: string,
    startDate?: string,
    endDate?: string
  ): Promise<any>;
  updateUserStatus(id: string, updateData: Partial<IUser | null>): Promise<IUser | null>;
  getUserById(id: string): Promise<IUser | null>;
}