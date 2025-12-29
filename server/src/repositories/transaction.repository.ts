import { injectable } from 'inversify';
import { ITransactionRepository } from '../core/interfaces/repositories/ITransactionRepository';
import { ITransaction, TransactionModel } from '../models/transaction.model';
import { SortOrder, FilterQuery, Types } from 'mongoose';
import { ITransactionDTO, TransactionDto } from '../dtos/transaction.dto';

@injectable()
export class TransactionRepository implements ITransactionRepository {
  async createTransaction(data: Partial<ITransaction>): Promise<ITransaction> {
    return await TransactionModel.create(data);
  }

  async updateTransactionStatusByOrderId(
    orderId: string,
    status: 'completed' | 'failed',
    paymentId?: string
  ): Promise<ITransaction | null> {
    return await TransactionModel.findOneAndUpdate(
      { razorpayOrderId: orderId },
      { status, razorpayPaymentId: paymentId },
      { new: true }
    );
  }

  async getTransactionById(id: string): Promise<ITransaction | null> {
    return await TransactionModel.findById(id);
  }

  async getUserTransactions(
    userId: string,
    page: number,
    limit: number,
    search: string,
    status: string,
    sort: string
  ): Promise<{ transactions: ITransactionDTO[]; totalPages: number }> {
    const query: FilterQuery<ITransaction> = { userId };
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { razorpayOrderId: { $regex: search, $options: 'i' } },
        { razorpayPaymentId: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions: { [key: string]: { [field: string]: SortOrder } } = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      amount_high: { amount: -1 },
      amount_low: { amount: 1 }
    };

    const transactions = await TransactionModel.find(query)
      .populate('trainerId', 'name profileImage')
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await TransactionModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return {
      transactions: transactions.map(transaction =>
        TransactionDto.toResponse(transaction as ITransaction)
      ),
      totalPages
    };
  }

  async getTrainerTransactions(
    trainerId: string,
    page: number,
    limit: number,
    search: string,
    status: string,
    planType: string
  ): Promise<{ transactions: ITransactionDTO[]; totalPages: number; totalRevenue: number; total: number }> {
    const query: FilterQuery<ITransaction> = { trainerId };
    if (status && status !== 'all') query.status = status;
    if (planType && planType !== 'all') query.planType = planType;
    if (search) {
      query.$or = [
        { razorpayOrderId: { $regex: search, $options: 'i' } },
        { razorpayPaymentId: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions: { [key: string]: { [field: string]: SortOrder } } = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      amount_high: { amount: -1 },
      amount_low: { amount: 1 }
    };

    const transactions = await TransactionModel.find(query)
      .populate('userId', 'name email')
      .sort(sortOptions.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await TransactionModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Calculate total revenue from all completed transactions for this trainer (using trainerEarnings)
    const revenueResult = await TransactionModel.aggregate([
      { $match: { trainerId: new Types.ObjectId(trainerId), status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$trainerEarnings' } } }
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    return {
      transactions: transactions.map(transaction =>
        TransactionDto.toResponse(transaction as ITransaction)
      ),
      totalPages,
      totalRevenue,
      total
    };
  }

  async findByOrderId(orderId: string): Promise<ITransaction | null> {
    return await TransactionModel.findOne({ razorpayOrderId: orderId });
  }

  async getUserPendingTransaction(userId: string): Promise<ITransaction | null> {
    return await TransactionModel.findOne({ userId, status: 'pending' }).sort({ createdAt: -1 });
  }

  async markUserPendingTransactionsAsFailed(userId: string): Promise<number> {
    const result = await TransactionModel.updateMany(
      { userId, status: 'pending' },
      { status: 'failed' }
    );
    return result.modifiedCount;
  }

  async getTrainerEarningsStats(
    trainerId: string,
    thisMonthStart: Date,
    lastMonthStart: Date,
    lastMonthEnd: Date
  ): Promise<{
    totalEarningsThisMonth: number;
    totalEarningsLastMonth: number;
    monthlyEarnings: Array<{ month: string; earnings: number; clients: number }>;
    planDistribution: Array<{ plan: string; count: number }>;
  }> {


    const thisMonthEarnings = await TransactionModel.aggregate([
      {
        $match: {
          trainerId: new Types.ObjectId(trainerId),
          status: 'completed',
          createdAt: { $gte: thisMonthStart, $lte: new Date() }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$trainerEarnings' } // Changed from amount to trainerEarnings
        }
      }
    ]);

    const lastMonthEarnings = await TransactionModel.aggregate([
      {
        $match: {
          trainerId: new Types.ObjectId(trainerId),
          status: 'completed',
          createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$trainerEarnings' } // Changed from amount to trainerEarnings
        }
      }
    ]);

    const monthlyEarnings = await TransactionModel.aggregate([
      {
        $match: {
          trainerId: new Types.ObjectId(trainerId),
          status: 'completed',
          createdAt: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          earnings: { $sum: '$trainerEarnings' },
          clients: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          year: '$_id.year',
          monthNum: '$_id.month',
          earnings: 1,
          clients: { $size: '$clients' },
          _id: 0
        }
      },
      { $sort: { year: 1, monthNum: 1 } }
    ]);

    // Fill in last 12 months
    const filledMonthlyEarnings = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = d.getMonth() + 1;
      const monthName = d.toLocaleString('en-US', { month: 'short' });

      const found = monthlyEarnings.find(m => m.year === year && m.monthNum === monthNum);

      filledMonthlyEarnings.push({
        month: `${monthName} ${year}`,
        earnings: found ? found.earnings : 0,
        clients: found ? found.clients : 0
      });
    }

    const planDistribution = await TransactionModel.aggregate([
      {
        $match: {
          trainerId,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$planType',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          plan: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    return {
      totalEarningsThisMonth: thisMonthEarnings[0]?.total || 0,
      totalEarningsLastMonth: lastMonthEarnings[0]?.total || 0,
      monthlyEarnings: filledMonthlyEarnings,
      planDistribution
    };
  }

  async getRecentActivity(trainerId: string) {
    const transactions = await TransactionModel.find({
      trainerId,
      status: 'completed',
    })
      .populate<{ userId: { name: string } }>('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return transactions.map(t => ({
      type: 'subscription',
      message: `New ${t.planType} subscription from ${t.userId?.name ?? 'Unknown User'
        }`,
      date: t.createdAt.toISOString(),
    }));
  }

  async getAllTransactions(
    page: number,
    limit: number,
    search: string,
    status: string,
    sort: string
  ): Promise<{ transactions: ITransactionDTO[]; totalPages: number }> {
    const query: FilterQuery<ITransaction> = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { razorpayOrderId: { $regex: search, $options: 'i' } },
        { razorpayPaymentId: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions: { [key: string]: { [field: string]: SortOrder } } = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      amount_high: { amount: -1 },
      amount_low: { amount: 1 }
    };

    const transactions = await TransactionModel.find(query)
      .populate('userId', 'name email')
      .populate('trainerId', 'name')
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await TransactionModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return {
      transactions: transactions.map(transaction =>
        TransactionDto.toResponse(transaction as ITransaction)
      ),
      totalPages
    };
  }

  async getAllTransactionsForExport(): Promise<ITransactionDTO[]> {
    const transactions = await TransactionModel.find({})
      .populate('userId', 'name email')
      .populate('trainerId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return transactions.map(transaction =>
      TransactionDto.toResponse(transaction as ITransaction)
    );
  }

  async getGraphData(filter: 'day' | 'week' | 'month' | 'year'): Promise<unknown[]> {
    const now = new Date();
    let groupBy: Record<string, unknown>;
    let startDate: Date;

    switch (filter) {
      case 'day':
        startDate = new Date(now.setDate(now.getDate() - 30)); // Last 30 days
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 90)); // Last ~3 months
        groupBy = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'month':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1)); // Last year
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      case 'year':
      default:
        startDate = new Date(now.setFullYear(now.getFullYear() - 5)); // Last 5 years
        groupBy = {
          year: { $year: '$createdAt' }
        };
        break;
    }

    const data = await TransactionModel.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          totalAmount: { $sum: '$platformFee' },
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
        date: label, // Using 'date' as key for Recharts
        amount: item.totalAmount,
        count: item.count
      };
    });
  }


}
