import { injectable, inject } from 'inversify';
import bcrypt from 'bcryptjs';
import { IAdminService } from '../core/interfaces/services/IAdminService';
import { IAdminRepository } from '../core/interfaces/repositories/IAdminRepository';
import TYPES from '../core/types/types';
import { IJwtService } from '../core/interfaces/services/IJwtService';
import { AdminLoginRequestDto, AdminLoginResponseDto } from '../dtos/admin.dto';
import { MESSAGES } from '../constants/messages.constants';
import { AppError } from '../utils/appError.util';
import { STATUS_CODE } from '../constants/status';

@injectable()
export class AdminService implements IAdminService {
  constructor(
    @inject(TYPES.IAdminRepository) private _adminRepository: IAdminRepository,
    @inject(TYPES.IJwtService) private _jwtService: IJwtService
  ) {}

  async login(dto: AdminLoginRequestDto): Promise<AdminLoginResponseDto> {
    const admin = await this._adminRepository.findByEmail(dto.email);
    if (!admin) throw new AppError(MESSAGES.LOGIN_FAILED, STATUS_CODE.UNAUTHORIZED);

    const isMatch = await bcrypt.compare(dto.password, admin.password);
    if (!isMatch) throw new AppError(MESSAGES.LOGIN_FAILED, STATUS_CODE.UNAUTHORIZED);

    const adminId = admin._id as string;

    const accessToken = this._jwtService.generateAccessToken(
      adminId,
      admin.role,
      admin.tokenVersion ?? 0
    );
    const refreshToken = this._jwtService.generateRefreshToken(
      adminId,
      admin.role,
      admin.tokenVersion ?? 0
    );

    return {
      admin: {
        _id: adminId,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async updateTokenVersion(adminId: string): Promise<void> {
    const admin = await this._adminRepository.findById(adminId);
    if (!admin) {
      throw new AppError(MESSAGES.ADMIN_NOT_FOUND, STATUS_CODE.NOT_FOUND);
    }

    const newTokenVersion = (admin.tokenVersion || 0) + 1;
    await this._adminRepository.updateById(adminId, {
      tokenVersion: newTokenVersion,
    });
  }
}