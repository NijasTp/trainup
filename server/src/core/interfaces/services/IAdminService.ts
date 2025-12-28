import { AdminLoginRequestDto, AdminLoginResponseDto } from '../../../dtos/admin.dto'

export type AdminLoginResult = {
  admin: AdminLoginResponseDto['admin']
  accessToken: string
  refreshToken: string
}

export interface IAdminService {
  login(dto: AdminLoginRequestDto): Promise<AdminLoginResponseDto>
  updateTokenVersion(adminId: string): Promise<void>
  getDashboardStats(): Promise<unknown>;
  getAllTransactions(
    page: number,
    limit: number,
    search: string,
    status: string,
    sort: string
  ): Promise<{ transactions: unknown[]; totalPages: number }>;
  getExportTransactions(): Promise<unknown[]>;
  getGraphData(filter: 'day' | 'week' | 'month' | 'year', type: 'revenue' | 'users' | 'trainers'): Promise<unknown[]>;
}
