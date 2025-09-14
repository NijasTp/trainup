import { AdminLoginRequestDto, AdminLoginResponseDto } from '../../../dtos/admin.dto'

export interface IAdminService {
  login(dto: AdminLoginRequestDto): Promise<AdminLoginResponseDto>
  updateTokenVersion(adminId: string): Promise<void>
}