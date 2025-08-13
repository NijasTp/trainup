import { IUser } from "../../../models/user.model";

export interface PaginatedUsers {
  users: Partial<IUser>[];
  total: number;
  page: number;
  totalPages: number;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  createUser(data: Partial<IUser>): Promise<IUser>;
  findAll(skip: number, limit: number): Promise<IUser[]>;
  findByGoogleId(googleId: string): Promise<IUser | null>;
  findUsers(
    page: number,
    limit: number,
    search: string,
    isBanned?: string,
    isVerified?: string,
    startDate?: string,
    endDate?: string
  ): Promise<any>;
  count(): Promise<number>;
  updateUser(id:string,status:Partial<IUser>):Promise<void>
  updateStatusAndIncrementVersion(id:string,status:Partial<IUser>):Promise<IUser | null>
  updateStatus(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  
}