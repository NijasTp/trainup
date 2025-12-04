import { AdminLoginRequestDto, AdminLoginResponseDto } from '../../../dtos/admin.dto'

export type AdminLoginResult = {
  admin: AdminLoginResponseDto['admin']
  accessToken: string
  refreshToken: string
}

export interface IAdminService {
  login(dto: AdminLoginRequestDto): Promise<AdminLoginResponseDto>
  updateTokenVersion(adminId: string): Promise<void>
  getDashboardStats(): Promise<any>
}