import { UserResponseDto, UserUpdateProfileDto } from '../../../dtos/user.dto'
import { IUser } from '../../../models/user.model'
import { IUserGymMembership } from '../../../models/userGymMembership.model'

export interface PaginatedUsers {
  users: Partial<UserResponseDto>[]
  total: number
  page: number
  totalPages: number
}


export interface IUserRepository {
  createUser(data: Partial<IUser>): Promise<IUser>;
  findByEmail(email: string): Promise<IUser | null>;
  checkUsername(username: string): Promise<IUser | null>;
  findByGoogleId(googleId: string): Promise<IUser | null>;
  findAll(skip: number, limit: number): Promise<UserResponseDto[]>;
  findUsers(
    page: number,
    limit: number,
    search: string,
    isBanned?: string,
    isVerified?: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ users: UserResponseDto[]; total: number; page: number; totalPages: number }>;
  count(): Promise<number>;
  updateUser(id: string, data: Partial<IUser>): Promise<IUser | null>;
  updateStatusAndIncrementVersion(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
  updateStatus(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  getWeightHistory(userId: string): Promise<{ weight: number; date: Date }[]>;
  addWeight(userId: string, weight: number, date: Date): Promise<IUser | null>;
  updateProfile(userId: string, updates: UserUpdateProfileDto): Promise<IUser | null>;
  updateTrainer(userId: string, trainerId: string): Promise<void>;
  updatePlan(userId: string, planType: 'basic' | 'premium' | 'pro'): Promise<void>;
    updateUserGymMembership(
    userId: string,
    gymId: string,
    planId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IUserGymMembership>;
  removeTrainer(userId: string): Promise<void>;
  updatePassword(email: string, hashedPassword: string): Promise<void>;
}