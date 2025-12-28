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
import { UserModel } from '../models/user.model';
import { TrainerModel } from '../models/trainer.model';
import { GymModel } from '../models/gym.model';
import { TransactionModel } from '../models/transaction.model';

@injectable()
export class AdminService implements IAdminService {
  constructor(
    @inject(TYPES.IAdminRepository) private _adminRepository: IAdminRepository,
    @inject(TYPES.IJwtService) private _jwtService: IJwtService,
    @inject(TYPES.ITransactionRepository) private _transactionRepository: ITransactionRepository
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
    const totalUsers = await UserModel.countDocuments();
    const totalTrainers = await TrainerModel.countDocuments();
    const totalGyms = await GymModel.countDocuments();

    // Calculate total revenue (Platform Profit)
    const transactions = await TransactionModel.find({ status: 'completed' });
    const totalRevenue = transactions.reduce((acc, curr) => acc + (curr.platformFee || 0), 0);

    // Recent transactions
    const recentTransactions = await TransactionModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name')
      .populate('trainerId', 'name');

    // Growth stats (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userGrowth = await UserModel.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const trainerGrowth = await TrainerModel.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return {
      totalUsers,
      totalTrainers,
      totalGyms,
      totalRevenue,
      recentTransactions,
      userGrowth: userGrowth.map(g => ({ date: g._id, count: g.count })),
      trainerGrowth: trainerGrowth.map(g => ({ date: g._id, count: g.count })),
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

    const Model = type === 'users' ? UserModel : TrainerModel;
    const now = new Date();
    let groupBy: Record<string, unknown>;
    let startDate: Date;

    switch (filter) {
      case 'day':
        startDate = new Date(now.setDate(now.getDate() - 30));
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 90));
        groupBy = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'month':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      case 'year':
      default:
        startDate = new Date(now.setFullYear(now.getFullYear() - 5));
        groupBy = {
          year: { $year: '$createdAt' }
        };
        break;
    }

    const data = await Model.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ]);

    return data.map(item => {
      let label = '';
      if (filter === 'day') {
        label = `${item._id.day}/${item._id.month}`;
      } else if (filter === 'week') {
        label = `Week ${item._id.week}`;
      } else if (filter === 'month') {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        label = `${monthNames[item._id.month - 1]} ${item._id.year}`;
      } else {
        label = `${item._id.year}`;
      }
      return {
        date: label,
        count: item.count
      };
    });
  }
}
