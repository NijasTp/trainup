import { injectable, inject } from 'inversify';
import bcrypt from 'bcryptjs';
import { IAdminService } from '../core/interfaces/services/IAdminService';
import { IAdminRepository } from '../core/interfaces/repositories/IAdminRepository';
import { ITransactionRepository } from '../core/interfaces/repositories/ITransactionRepository';
import TYPES from '../core/types/types';
import { IJwtService } from '../core/interfaces/services/IJwtService';
import { AdminLoginRequestDto, AdminLoginResponseDto } from '../dtos/admin.dto';
import { MESSAGES } from '../constants/messages.constants';
import { AppError } from '../utils/appError.util';
import { STATUS_CODE } from '../constants/status';
import { IUserRepository } from '../core/interfaces/repositories/IUserRepository';
import { ITrainerRepository } from '../core/interfaces/repositories/ITrainerRepository';
import { IGymRepository } from '../core/interfaces/repositories/IGymRepository';

@injectable()
export class AdminService implements IAdminService {
  constructor(
    @inject(TYPES.IAdminRepository) private _adminRepository: IAdminRepository,
    @inject(TYPES.IJwtService) private _jwtService: IJwtService,
    @inject(TYPES.ITransactionRepository) private _transactionRepository: ITransactionRepository,
    @inject(TYPES.IUserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.ITrainerRepository) private _trainerRepo: ITrainerRepository,
    @inject(TYPES.IGymRepository) private _gymRepo: IGymRepository
  ) { }

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

  async getDashboardStats(): Promise<unknown> {
    const totalUsers = await this._userRepo.count();
    const totalTrainers = await this._trainerRepo.count('', 'all', 'all'); // Adjusted to match interface
    const totalGyms = await this._gymRepo.countTotalGyms();

    // Calculate total revenue (Platform Profit)
    const totalRevenue = await this._transactionRepository.getTotalPlatformRevenue();

    // Recent transactions
    const recentTransactions = await this._transactionRepository.getRecentTransactions(5);

    // Growth stats (last 30 days)
    const userGrowth = await this._userRepo.getGrowthStats(30);
    const trainerGrowth = await this._trainerRepo.getGrowthStats(30);

    return {
      totalUsers,
      totalTrainers,
      totalGyms,
      totalRevenue,
      recentTransactions,
      userGrowth,
      trainerGrowth,
    };
  }

  async getAllTransactions(
    page: number,
    limit: number,
    search: string,
    status: string,
    sort: string
  ): Promise<{ transactions: unknown[]; totalPages: number }> {
    return await this._transactionRepository.getAllTransactions(page, limit, search, status, sort);
  }

  async getExportTransactions(): Promise<unknown[]> {
    return await this._transactionRepository.getAllTransactionsForExport();
  }

  async getGraphData(filter: 'day' | 'week' | 'month' | 'year', type: 'revenue' | 'users' | 'trainers' = 'revenue'): Promise<unknown[]> {
    if (type === 'revenue') {
      return await this._transactionRepository.getGraphData(filter);
    }

    const repo = type === 'users' ? this._userRepo : this._trainerRepo;
    const days = filter === 'day' ? 30 : filter === 'week' ? 90 : filter === 'month' ? 365 : 1825;
    return await repo.getGrowthStats(days);
  }
}
