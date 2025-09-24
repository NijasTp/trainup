import { UserResponseDto } from '../../../dtos/user.dto'
import { IUser } from '../../../models/user.model'

export interface PaginatedUsers {
  users: Partial<UserResponseDto>[]
  total: number
  page: number
  totalPages: number
}

export interface IUserRepository {
  createUser(data: Partial<IUser>): Promise<IUser>
  findByEmail(email: string): Promise<IUser | null>
  checkUsername(username: string): Promise<IUser | null>
  findByGoogleId(googleId: string): Promise<IUser | null>
  findAll(skip: number, limit: number): Promise<UserResponseDto[]>
  findUsers(
    page: number,
    limit: number,
    search: string,
    isBanned?: string,
    isVerified?: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    users: UserResponseDto[]
    total: number
    page: number
    totalPages: number
  }>
  count(): Promise<number>
  updateUser(id: string, data: Partial<IUser>): Promise<IUser | null>
  updateStatusAndIncrementVersion(
    id: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null>
  updateStatus(id: string, updateData: Partial<IUser>): Promise<IUser | null>
  getWeightHistory(userId: string): Promise<{ weight: number; date: Date }[]>
  findById(id: string): Promise<IUser | null>
  addWeight(userId: string, weight: number, date: Date): Promise<IUser | null>
}
