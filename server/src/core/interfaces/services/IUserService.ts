import { IUser } from '../../../models/user.model'
import { PaginatedUsers } from '../repositories/IUserRepository'
export interface IUserService {
  registerUser(
    name: string,
    email: string,
    password: string
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }>
  checkUsername(username:string): Promise<boolean | null>
  loginUser(
    email: string,
    password: string
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }>
  loginWithGoogle(
    idToken: string
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }>
  resetPassword(email: string, password: string): Promise<void>
  incrementTokenVersion(id: string): Promise<IUser | null>
  getProfile(id: string): Promise<IUser | null>
  getAllUsers(
    page: number,
    limit: number,
    search: string,
    isBanned?: string,
    isVerified?: string,
    startDate?: string,
    endDate?: string
  ): Promise<any>
  updateUserStatus(
    id: string,
    updateData: Partial<IUser | null>
  ): Promise<IUser | null>
  getUserById(id: string): Promise<IUser | null>
  updateUserTrainerId(userId: string, trainerId: string): Promise<void>;
  cancelSubscription(userId: string, trainerId: string): Promise<void>;
}
